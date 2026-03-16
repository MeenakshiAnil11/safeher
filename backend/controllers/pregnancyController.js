// backend/controllers/pregnancyController.js
import PregnancyLog from "../models/PregnancyLog.js";
import User from "../models/User.js";

const getTrimesterFromWeek = (week) => {
  if (week <= 12) return "first";
  if (week <= 26) return "second";
  return "third";
};

const getEstimatedDueDateFromWeek = (week) => {
  const date = new Date();
  date.setDate(date.getDate() + (40 - week) * 7);
  return date;
};

// Get current week for pregnancy mode dashboard (profile-first)
export const getCurrentPregnancyWeek = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("pregnancy_week pregnancy_due_date").lean();
    const latestLog = await PregnancyLog.findOne({ user: req.userId }).sort({ date: -1 }).select("week").lean();

    let currentWeek = Number(user?.pregnancy_week);
    if (!Number.isInteger(currentWeek) || currentWeek < 1 || currentWeek > 40) {
      currentWeek = Number(latestLog?.week);
    }
    if (!Number.isInteger(currentWeek) || currentWeek < 1 || currentWeek > 40) {
      currentWeek = 20;
    }

    const dueDate = user?.pregnancy_due_date
      ? new Date(user.pregnancy_due_date)
      : getEstimatedDueDateFromWeek(currentWeek);

    res.json({
      success: true,
      currentWeek,
      trimester: getTrimesterFromWeek(currentWeek),
      dueDate: dueDate.toISOString().split("T")[0],
      hasPregnancyWeek: Boolean(user?.pregnancy_week),
    });
  } catch (error) {
    console.error("Get current pregnancy week error:", error);
    res.status(500).json({ success: false, message: "Failed to get current pregnancy week" });
  }
};

// Get pregnancy logs for a user
export const getPregnancyLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { user: req.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const logs = await PregnancyLog.find(query)
      .sort({ date: -1 })
      .lean();
    
    res.json({ success: true, logs });
  } catch (error) {
    console.error("Get pregnancy logs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pregnancy logs" });
  }
};

// Create or update pregnancy log
export const createPregnancyLog = async (req, res) => {
  try {
    const {
      date,
      week,
      trimester,
      weight,
      weightKg,
      weightGain,
      symptoms,
      nausea,
      vomiting,
      fatigue,
      moodSwings,
      foodCravings,
      foodAversions,
      breastTenderness,
      frequentUrination,
      backPain,
      heartburn,
      constipation,
      swelling,
      insomnia,
      fetalMovement,
      kickCount,
      systolic,
      diastolic,
      bloodPressure,
      bloodSugar,
      mood,
      energy,
      stress,
      sleepHours,
      sleepQuality,
      mealsEaten,
      waterIntake,
      supplements,
      exercise,
      exerciseType,
      exerciseDuration,
      doctorVisit,
      ultrasound,
      bloodTest,
      medications,
      notes
    } = req.body;

    // Check if log already exists for this date
    const existingLog = await PregnancyLog.findOne({
      user: req.userId,
      date: new Date(date)
    });

    let log;
    if (existingLog) {
      // Update existing log
      log = await PregnancyLog.findByIdAndUpdate(
        existingLog._id,
        {
          week,
          trimester,
        weight,
        weightKg,
        weightGain,
        symptoms,
        nausea,
        vomiting,
        fatigue,
        moodSwings,
        foodCravings,
        foodAversions,
        breastTenderness,
        frequentUrination,
        backPain,
        heartburn,
        constipation,
        swelling,
        insomnia,
        fetalMovement,
        kickCount,
        systolic,
        diastolic,
        bloodPressure,
        bloodSugar,
        mood,
        energy,
        stress,
        sleepHours,
        sleepQuality,
        mealsEaten,
        waterIntake,
        supplements,
        exercise,
        exerciseType,
        exerciseDuration,
        doctorVisit,
        ultrasound,
        bloodTest,
        medications,
        notes
      },
        { new: true }
      );
    } else {
      // Create new log
      log = await PregnancyLog.create({
        user: req.userId,
        date: new Date(date),
        week,
        trimester,
        weight,
        weightKg,
        weightGain,
        symptoms,
        nausea,
        vomiting,
        fatigue,
        moodSwings,
        foodCravings,
        foodAversions,
        breastTenderness,
        frequentUrination,
        backPain,
        heartburn,
        constipation,
        swelling,
        insomnia,
        fetalMovement,
        kickCount,
        systolic,
        diastolic,
        bloodPressure,
        bloodSugar,
        mood,
        energy,
        stress,
        sleepHours,
        sleepQuality,
        mealsEaten,
        waterIntake,
        supplements,
        exercise,
        exerciseType,
        exerciseDuration,
        doctorVisit,
        ultrasound,
        bloodTest,
        medications,
        notes
      });
    }

    res.status(201).json({ success: true, log });
  } catch (error) {
    console.error("Create pregnancy log error:", error);
    res.status(500).json({ success: false, message: "Failed to create pregnancy log" });
  }
};

// Get pregnancy insights and week information
export const getPregnancyInsights = async (req, res) => {
  try {
    const logs = await PregnancyLog.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    const latestLog = logs[0];
    const currentWeek = latestLog?.week || 1;
    const currentTrimester = latestLog?.trimester || "first";

    // Calculate estimated due date (assuming 40 weeks from conception)
    const estimatedDueDate = new Date(Date.now() + (40 - currentWeek) * 7 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.ceil((estimatedDueDate - new Date()) / (1000 * 60 * 60 * 24));

    // Get fetal development info based on current week
    const fetalDevelopment = getFetalDevelopmentInfo(currentWeek);

    // Analyze symptoms
    const recentSymptoms = logs.slice(0, 7).map(log => ({
      date: log.date,
      symptoms: log.symptoms,
      nausea: log.nausea,
      fatigue: log.fatigue,
      mood: log.mood,
      energy: log.energy
    }));

    // Calculate weight gain trend
    const weightData = logs
      .filter(log => log.weight)
      .map(log => ({ date: log.date, weight: log.weight, weightGain: log.weightGain }))
      .slice(0, 10);

    // Generate health tips based on trimester
    const healthTips = getHealthTipsForTrimester(currentTrimester);

    const insights = {
      currentWeek,
      trimester: currentTrimester,
      estimatedDueDate: estimatedDueDate.toISOString().split('T')[0],
      daysRemaining,
      fetalDevelopment,
      recentSymptoms,
      weightData,
      healthTips,
      recommendations: [
        "Take prenatal vitamins daily",
        "Stay hydrated (8-10 glasses of water)",
        "Eat small, frequent meals",
        "Get regular exercise",
        "Attend all prenatal appointments",
        "Get adequate sleep (7-9 hours)",
        "Avoid alcohol and smoking",
        "Manage stress through relaxation techniques"
      ]
    };

    res.json({ success: true, insights });
  } catch (error) {
    console.error("Get pregnancy insights error:", error);
    res.status(500).json({ success: false, message: "Failed to get pregnancy insights" });
  }
};

// Helper function to get fetal development info
function getFetalDevelopmentInfo(week) {
  const developmentData = {
    1: { size: "0.1mm", weight: "0g", description: "Fertilization occurs" },
    2: { size: "0.2mm", weight: "0g", description: "Cell division begins" },
    3: { size: "0.3mm", weight: "0g", description: "Implantation occurs" },
    4: { size: "2mm", weight: "0g", description: "Neural tube forms" },
    5: { size: "4mm", weight: "0g", description: "Heart begins to beat" },
    6: { size: "6mm", weight: "0g", description: "Arms and legs bud" },
    7: { size: "8mm", weight: "0g", description: "Eyes and ears form" },
    8: { size: "1.3cm", weight: "1g", description: "All major organs form" },
    9: { size: "1.7cm", weight: "2g", description: "Fingers and toes develop" },
    10: { size: "2.5cm", weight: "4g", description: "Teeth buds form" },
    11: { size: "3.5cm", weight: "7g", description: "Genitals develop" },
    12: { size: "5cm", weight: "14g", description: "Reflexes develop" },
    13: { size: "7.5cm", weight: "23g", description: "Fingerprints form" },
    14: { size: "8.5cm", weight: "43g", description: "Hair begins to grow" },
    15: { size: "10cm", weight: "70g", description: "Bones harden" },
    16: { size: "11.5cm", weight: "100g", description: "Eyes can detect light" },
    17: { size: "13cm", weight: "140g", description: "Fat begins to form" },
    18: { size: "14cm", weight: "190g", description: "Ears are fully formed" },
    19: { size: "15cm", weight: "240g", description: "Vernix caseosa forms" },
    20: { size: "16.5cm", weight: "300g", description: "Halfway point!" },
    // Add more weeks as needed
  };

  return developmentData[week] || { size: "Unknown", weight: "Unknown", description: "Development continues" };
}

// Get baby development data for all weeks
export const getBabyDevelopment = async (req, res) => {
  try {
    const developmentData = {};
    
    // Generate comprehensive week-by-week development data
    for (let week = 1; week <= 40; week++) {
      developmentData[week] = generateWeekDevelopmentData(week);
    }
    
    res.json({ success: true, development: developmentData });
  } catch (error) {
    console.error("Get baby development error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch baby development data" });
  }
};

// Helper function to generate week-specific development data
function generateWeekDevelopmentData(week) {
  const weekData = {
    1: {
      size: "0.1mm",
      weight: "0g",
      fruit: "Poppy Seed",
      color: "#FFB6C1",
      milestones: ["Fertilization occurs", "Cell division begins", "Implantation starts"],
      description: "Your baby is just beginning to form! At this stage, your baby is smaller than a poppy seed.",
      organs: ["Basic cell structure"],
      movements: "None yet",
      senses: "None developed"
    },
    2: {
      size: "0.2mm",
      weight: "0g",
      fruit: "Sesame Seed",
      color: "#FFB6C1",
      milestones: ["Cell division continues", "Blastocyst forms", "Implantation occurs"],
      description: "The fertilized egg continues to divide and begins implanting in the uterine wall.",
      organs: ["Blastocyst formation"],
      movements: "None yet",
      senses: "None developed"
    },
    3: {
      size: "0.3mm",
      weight: "0g",
      fruit: "Poppy Seed",
      color: "#FFB6C1",
      milestones: ["Implantation completes", "Placenta begins forming", "Neural tube starts"],
      description: "Implantation is complete and the foundation for your baby's nervous system begins.",
      organs: ["Neural tube", "Placenta"],
      movements: "None yet",
      senses: "None developed"
    },
    4: {
      size: "2mm",
      weight: "0g",
      fruit: "Poppy Seed",
      color: "#FFB6C1",
      milestones: ["Neural tube closes", "Heart begins forming", "Basic body structure"],
      description: "Your baby's heart is beginning to form and the neural tube is closing.",
      organs: ["Heart", "Neural tube", "Basic body"],
      movements: "None yet",
      senses: "None developed"
    },
    5: {
      size: "4mm",
      weight: "0g",
      fruit: "Sesame Seed",
      color: "#FFB6C1",
      milestones: ["Heart starts beating", "Brain develops", "Limb buds appear"],
      description: "Your baby's heart is now beating! Tiny limb buds are starting to form.",
      organs: ["Heart", "Brain", "Limb buds"],
      movements: "Heart beating",
      senses: "None developed"
    },
    6: {
      size: "6mm",
      weight: "0g",
      fruit: "Lentil",
      color: "#FFB6C1",
      milestones: ["Arms and legs develop", "Eyes begin forming", "Digestive system starts"],
      description: "Your baby's arms and legs are developing, and the eyes are beginning to form.",
      organs: ["Arms", "Legs", "Eyes", "Digestive system"],
      movements: "Heart beating",
      senses: "None developed"
    },
    7: {
      size: "8mm",
      weight: "0g",
      fruit: "Blueberry",
      color: "#87CEEB",
      milestones: ["Facial features form", "Ears develop", "Fingers start"],
      description: "Your baby's facial features are forming, and tiny fingers are beginning to develop.",
      organs: ["Face", "Ears", "Fingers"],
      movements: "Heart beating",
      senses: "None developed"
    },
    8: {
      size: "1.3cm",
      weight: "1g",
      fruit: "Raspberry",
      color: "#87CEEB",
      milestones: ["All major organs form", "Fingers and toes separate", "Eyes move forward"],
      description: "All major organs are now formed! Your baby's fingers and toes are separating.",
      organs: ["All major organs", "Fingers", "Toes"],
      movements: "Heart beating, slight movements",
      senses: "None developed"
    },
    9: {
      size: "1.7cm",
      weight: "2g",
      fruit: "Cherry",
      color: "#87CEEB",
      milestones: ["Teeth buds form", "Muscles develop", "Genitals form"],
      description: "Your baby's teeth buds are forming and muscles are beginning to develop.",
      organs: ["Teeth buds", "Muscles", "Genitals"],
      movements: "Heart beating, muscle twitches",
      senses: "None developed"
    },
    10: {
      size: "2.5cm",
      weight: "4g",
      fruit: "Strawberry",
      color: "#87CEEB",
      milestones: ["Fingerprints form", "Hair follicles develop", "Kidneys function"],
      description: "Your baby's unique fingerprints are forming and hair follicles are developing.",
      organs: ["Fingerprints", "Hair follicles", "Kidneys"],
      movements: "Heart beating, muscle movements",
      senses: "None developed"
    },
    11: {
      size: "3.5cm",
      weight: "7g",
      fruit: "Lime",
      color: "#87CEEB",
      milestones: ["Reflexes develop", "Bones harden", "Facial expressions"],
      description: "Your baby's reflexes are developing and bones are beginning to harden.",
      organs: ["Reflexes", "Bones", "Facial muscles"],
      movements: "Reflexive movements",
      senses: "None developed"
    },
    12: {
      size: "5cm",
      weight: "14g",
      fruit: "Plum",
      color: "#87CEEB",
      milestones: ["First trimester complete", "All organs functioning", "Sex determination"],
      description: "Congratulations! You've completed the first trimester. All organs are functioning.",
      organs: ["All organs functioning"],
      movements: "Active movements",
      senses: "None developed"
    },
    13: {
      size: "7.5cm",
      weight: "23g",
      fruit: "Peach",
      color: "#98FB98",
      milestones: ["Vocal cords develop", "Bones continue hardening", "Intestines move"],
      description: "Your baby's vocal cords are developing and bones continue to harden.",
      organs: ["Vocal cords", "Bones", "Intestines"],
      movements: "Active movements",
      senses: "None developed"
    },
    14: {
      size: "8.5cm",
      weight: "43g",
      fruit: "Lemon",
      color: "#98FB98",
      milestones: ["Hair begins growing", "Facial expressions", "Lanugo appears"],
      description: "Your baby's hair is beginning to grow and facial expressions are developing.",
      organs: ["Hair", "Facial muscles", "Lanugo"],
      movements: "Facial expressions",
      senses: "None developed"
    },
    15: {
      size: "10cm",
      weight: "70g",
      fruit: "Apple",
      color: "#98FB98",
      milestones: ["Taste buds form", "Bones continue growing", "Muscle coordination"],
      description: "Your baby's taste buds are forming and muscle coordination is improving.",
      organs: ["Taste buds", "Bones", "Muscles"],
      movements: "Coordinated movements",
      senses: "Taste buds forming"
    },
    16: {
      size: "11.5cm",
      weight: "100g",
      fruit: "Avocado",
      color: "#98FB98",
      milestones: ["Eyes can detect light", "Ears fully formed", "Facial features refine"],
      description: "Your baby's eyes can now detect light and ears are fully formed!",
      organs: ["Eyes", "Ears", "Facial features"],
      movements: "Light detection",
      senses: "Light detection"
    },
    17: {
      size: "13cm",
      weight: "140g",
      fruit: "Pear",
      color: "#98FB98",
      milestones: ["Fat begins forming", "Sucking reflex", "Hearing develops"],
      description: "Your baby's fat is beginning to form and the sucking reflex is developing.",
      organs: ["Fat tissue", "Sucking reflex", "Hearing"],
      movements: "Sucking movements",
      senses: "Hearing develops"
    },
    18: {
      size: "14cm",
      weight: "190g",
      fruit: "Sweet Potato",
      color: "#98FB98",
      milestones: ["Vernix caseosa forms", "Eyes move", "Yawning begins"],
      description: "Your baby's protective coating (vernix) is forming and yawning begins.",
      organs: ["Vernix", "Eye muscles", "Yawning"],
      movements: "Yawning, eye movements",
      senses: "Hearing improves"
    },
    19: {
      size: "15cm",
      weight: "240g",
      fruit: "Mango",
      color: "#98FB98",
      milestones: ["Skin becomes less transparent", "Hair growth continues", "Sleep cycles"],
      description: "Your baby's skin is becoming less transparent and sleep cycles are developing.",
      organs: ["Skin", "Hair", "Sleep cycles"],
      movements: "Sleep cycles",
      senses: "Hearing continues"
    },
    20: {
      size: "16.5cm",
      weight: "300g",
      fruit: "Banana",
      color: "#98FB98",
      milestones: ["Halfway point!", "Fetal movements felt", "Swallowing begins"],
      description: "Congratulations! You're halfway through pregnancy. You may feel movements!",
      organs: ["All major systems"],
      movements: "Fetal movements",
      senses: "Swallowing, hearing"
    },
    21: {
      size: "18cm",
      weight: "360g",
      fruit: "Carrot",
      color: "#98FB98",
      milestones: ["Eyebrows and eyelashes", "Bone marrow produces blood", "Regular sleep"],
      description: "Your baby's eyebrows and eyelashes are forming and sleep patterns are regular.",
      organs: ["Eyebrows", "Eyelashes", "Bone marrow"],
      movements: "Regular movements",
      senses: "Regular sleep cycles"
    },
    22: {
      size: "19cm",
      weight: "430g",
      fruit: "Papaya",
      color: "#98FB98",
      milestones: ["Sense of touch develops", "Taste buds mature", "Brain growth"],
      description: "Your baby's sense of touch is developing and taste buds are maturing.",
      organs: ["Touch receptors", "Taste buds", "Brain"],
      movements: "Touch responses",
      senses: "Touch and taste"
    },
    23: {
      size: "20cm",
      weight: "500g",
      fruit: "Grapefruit",
      color: "#98FB98",
      milestones: ["Rapid eye movements", "Hearing improves", "Lung development"],
      description: "Your baby's rapid eye movements begin and hearing is improving.",
      organs: ["Eyes", "Ears", "Lungs"],
      movements: "Rapid eye movements",
      senses: "Improved hearing"
    },
    24: {
      size: "21cm",
      weight: "600g",
      fruit: "Corn",
      color: "#98FB98",
      milestones: ["Viability milestone", "Lung surfactant", "Skin thickens"],
      description: "Your baby reaches viability! Lungs are producing surfactant for breathing.",
      organs: ["Lungs", "Skin", "All systems"],
      movements: "Strong movements",
      senses: "All senses developing"
    },
    25: {
      size: "22cm",
      weight: "700g",
      fruit: "Rutabaga",
      color: "#98FB98",
      milestones: ["Hand and startle reflex", "Blood vessels visible", "Hair color determined"],
      description: "Your baby's hand and startle reflexes are developing.",
      organs: ["Reflexes", "Blood vessels", "Hair"],
      movements: "Reflexive movements",
      senses: "All senses active"
    },
    26: {
      size: "23cm",
      weight: "800g",
      fruit: "Scallion",
      color: "#98FB98",
      milestones: ["Eyes open", "Breathing movements", "Response to sound"],
      description: "Your baby's eyes can now open and respond to sounds!",
      organs: ["Eyes", "Lungs", "Ears"],
      movements: "Breathing movements",
      senses: "Sound response"
    },
    27: {
      size: "24cm",
      weight: "900g",
      fruit: "Cauliflower",
      color: "#98FB98",
      milestones: ["Third trimester begins", "Brain development", "Sleep patterns"],
      description: "Welcome to the third trimester! Your baby's brain is rapidly developing.",
      organs: ["Brain", "All systems"],
      movements: "Active movements",
      senses: "All senses active"
    },
    28: {
      size: "25cm",
      weight: "1000g",
      fruit: "Eggplant",
      color: "#98FB98",
      milestones: ["Eyes can blink", "Lungs mature", "Fat accumulation"],
      description: "Your baby can now blink and lungs are maturing for breathing.",
      organs: ["Eyes", "Lungs", "Fat"],
      movements: "Blinking, movements",
      senses: "All senses mature"
    },
    29: {
      size: "26cm",
      weight: "1200g",
      fruit: "Butternut Squash",
      color: "#98FB98",
      milestones: ["Bone marrow takes over", "Temperature regulation", "Immune system"],
      description: "Your baby's bone marrow is now producing blood cells.",
      organs: ["Bone marrow", "Immune system"],
      movements: "Strong movements",
      senses: "All senses mature"
    },
    30: {
      size: "27cm",
      weight: "1400g",
      fruit: "Cabbage",
      color: "#98FB98",
      milestones: ["Red blood cells form", "Brain folds develop", "Head growth"],
      description: "Your baby's brain is developing folds and red blood cells are forming.",
      organs: ["Brain", "Blood cells"],
      movements: "Brain activity",
      senses: "All senses mature"
    },
    31: {
      size: "28cm",
      weight: "1600g",
      fruit: "Coconut",
      color: "#98FB98",
      milestones: ["Nervous system matures", "Pain receptors", "Memory formation"],
      description: "Your baby's nervous system is maturing and memory formation begins.",
      organs: ["Nervous system", "Memory"],
      movements: "Complex movements",
      senses: "Memory formation"
    },
    32: {
      size: "29cm",
      weight: "1800g",
      fruit: "Jicama",
      color: "#98FB98",
      milestones: ["Skin becomes opaque", "Fingernails grow", "Immune system strengthens"],
      description: "Your baby's skin is becoming opaque and fingernails are growing.",
      organs: ["Skin", "Nails", "Immune system"],
      movements: "Complex movements",
      senses: "All senses mature"
    },
    33: {
      size: "30cm",
      weight: "2000g",
      fruit: "Pineapple",
      color: "#98FB98",
      milestones: ["Pupils react to light", "Bones harden", "Fat accumulation"],
      description: "Your baby's pupils can now react to light and bones are hardening.",
      organs: ["Eyes", "Bones", "Fat"],
      movements: "Light reactions",
      senses: "Light sensitivity"
    },
    34: {
      size: "31cm",
      weight: "2200g",
      fruit: "Cantaloupe",
      color: "#98FB98",
      milestones: ["Lungs nearly mature", "Sleep cycles", "Hair growth"],
      description: "Your baby's lungs are nearly mature and sleep cycles are established.",
      organs: ["Lungs", "Sleep cycles", "Hair"],
      movements: "Sleep cycles",
      senses: "All senses mature"
    },
    35: {
      size: "32cm",
      weight: "2400g",
      fruit: "Honeydew",
      color: "#98FB98",
      milestones: ["Kidneys mature", "Liver processes", "Fat accumulation"],
      description: "Your baby's kidneys are maturing and liver is processing waste.",
      organs: ["Kidneys", "Liver", "Fat"],
      movements: "Active movements",
      senses: "All senses mature"
    },
    36: {
      size: "33cm",
      weight: "2600g",
      fruit: "Head of Lettuce",
      color: "#98FB98",
      milestones: ["Full-term milestone", "Circulation mature", "Digestive system"],
      description: "Your baby is now considered full-term! All systems are mature.",
      organs: ["All systems mature"],
      movements: "Full movements",
      senses: "All senses mature"
    },
    37: {
      size: "34cm",
      weight: "2800g",
      fruit: "Swiss Chard",
      color: "#98FB98",
      milestones: ["Brain development continues", "Coordination improves", "Ready for birth"],
      description: "Your baby's brain continues developing and coordination improves.",
      organs: ["Brain", "Coordination"],
      movements: "Coordinated movements",
      senses: "All senses mature"
    },
    38: {
      size: "35cm",
      weight: "3000g",
      fruit: "Leek",
      color: "#98FB98",
      milestones: ["Firm grasp", "Head control", "Breathing practice"],
      description: "Your baby has a firm grasp and is practicing breathing movements.",
      organs: ["Grasp", "Head control", "Lungs"],
      movements: "Breathing practice",
      senses: "All senses mature"
    },
    39: {
      size: "36cm",
      weight: "3200g",
      fruit: "Mini Watermelon",
      color: "#98FB98",
      milestones: ["Final preparations", "Positioning", "Ready to meet you"],
      description: "Your baby is making final preparations and getting ready to meet you!",
      organs: ["All systems ready"],
      movements: "Final movements",
      senses: "All senses mature"
    },
    40: {
      size: "37cm",
      weight: "3400g",
      fruit: "Small Pumpkin",
      color: "#98FB98",
      milestones: ["Due date!", "Ready for birth", "Welcome to the world"],
      description: "Happy due date! Your baby is ready to be born and meet the world.",
      organs: ["All systems ready"],
      movements: "Ready for birth",
      senses: "All senses mature"
    }
  };

  return weekData[week] || weekData[16];
}

// Delete pregnancy log
export const deletePregnancyLog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const log = await PregnancyLog.findOneAndDelete({ 
      _id: id, 
      user: req.userId 
    });
    
    if (!log) {
      return res.status(404).json({ success: false, message: "Pregnancy log not found" });
    }
    
    res.json({ success: true, message: "Pregnancy log deleted successfully" });
  } catch (error) {
    console.error("Delete pregnancy log error:", error);
    res.status(500).json({ success: false, message: "Failed to delete pregnancy log" });
  }
};
