import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import getPregnancyWeekContent from "../../data/pregnancyWeekContent";
import PregnancyTimeline from "../../components/pregnancy/PregnancyTimeline";
import OrganDevelopment from "../../components/pregnancy/OrganDevelopment";
import Baby3DViewer from "../../components/pregnancy/Baby3DViewer";
import "./BabyDevelopmentTracker.css";

export default function BabyDevelopmentTracker({ currentWeek: initialWeekProp }) {
  const [currentWeek, setCurrentWeek] = useState(initialWeekProp || 16);
  const [babyData, setBabyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(initialWeekProp || 16);
  const [allWeeksData, setAllWeeksData] = useState({});
  const [readingCard, setReadingCard] = useState(false);

  // Load baby development data on component mount
  useEffect(() => {
    loadBabyDevelopmentData();
  }, [initialWeekProp]);


  const loadBabyDevelopmentData = async () => {
    try {
      setLoading(true);
      
      // Load current pregnancy week (profile-first)
      const pregnancyResponse = await api.get('/pregnancy/current-week');
      const currentWeekData = initialWeekProp || pregnancyResponse.data?.currentWeek || 16;
      setCurrentWeek(currentWeekData);
      setSelectedWeek(currentWeekData);
      
      // Load baby development data for all weeks
      const developmentResponse = await api.get('/pregnancy/baby-development');
      setAllWeeksData(developmentResponse.data.development || generateMockDevelopmentData());
      
      // Set initial baby data
      const initialData = developmentResponse.data.development?.[currentWeekData] || generateWeekData(currentWeekData);
      setBabyData(initialData);
      
    } catch (error) {
      console.error('Error loading baby development data:', error);
      // Fallback to mock data
      setAllWeeksData(generateMockDevelopmentData());
      setBabyData(generateWeekData(currentWeek));
    } finally {
      setLoading(false);
    }
  };

  const generateMockDevelopmentData = () => {
    const developmentData = {};
    for (let week = 1; week <= 40; week++) {
      developmentData[week] = generateWeekData(week);
    }
    return developmentData;
  };

  const generateWeekData = (week) => {
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
  };

  const handleWeekChange = (week) => {
    if (week >= 1 && week <= 40) {
      setSelectedWeek(week);
      const weekData = allWeeksData[week] || generateWeekData(week);
      setBabyData(weekData);
      // Allow 3D baby viewer modules to react to week changes.
      window.dispatchEvent(new CustomEvent("pregnancy-week-change", { detail: { week } }));
    }
  };

  const weekContent = getPregnancyWeekContent(selectedWeek);
  const bodyChanges = weekContent.babyGrowth.bodyChanges;
  const healthTips = weekContent.babyGrowth.healthTips;
  const expectations = weekContent.babyGrowth.expectations || [];
  const previousWeekData = selectedWeek > 1 ? (allWeeksData[selectedWeek - 1] || generateWeekData(selectedWeek - 1)) : null;

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const parseLengthToCm = (value = "") => {
    const text = String(value).toLowerCase();
    const match = text.match(/(\d+(\.\d+)?)/);
    if (!match) return null;
    const numeric = Number(match[1]);
    if (text.includes("mm")) return numeric / 10;
    if (text.includes("inch")) return numeric * 2.54;
    return numeric; // default cm
  };

  const parseWeightToG = (value = "") => {
    const text = String(value).toLowerCase();
    const match = text.match(/(\d+(\.\d+)?)/);
    if (!match) return null;
    const numeric = Number(match[1]);
    if (text.includes("kg")) return numeric * 1000;
    if (text.includes("lb")) return numeric * 453.592;
    return numeric; // default grams
  };

  const currentLengthCm = parseLengthToCm(babyData?.size);
  const previousLengthCm = parseLengthToCm(previousWeekData?.size);
  const currentWeightG = parseWeightToG(babyData?.weight);
  const previousWeightG = parseWeightToG(previousWeekData?.weight);

  const lengthIncreaseCm =
    currentLengthCm != null && previousLengthCm != null
      ? Math.max(0, currentLengthCm - previousLengthCm)
      : null;
  const weightIncreaseG =
    currentWeightG != null && previousWeightG != null
      ? Math.max(0, currentWeightG - previousWeightG)
      : null;

  const detailedDevelopmentText = useMemo(() => {
    const milestoneText = expectations.slice(0, 3).join(" ");
    return `${babyData?.description || ""} ${milestoneText}`.trim();
  }, [babyData?.description, expectations]);

  const symptomHighlights = useMemo(() => {
    if (bodyChanges.length) {
      return bodyChanges.slice(0, 3).map((item) => item.text);
    }
    return [
      "You may notice changing energy levels as your body adapts this week.",
      "Mild appetite and sleep pattern shifts can be common in this stage.",
      "Hydration and gentle movement can help ease day-to-day discomfort.",
    ];
  }, [bodyChanges]);

  const weeklyTip = useMemo(() => {
    if (healthTips.length) {
      return healthTips[0].text;
    }
    return "Stay hydrated, keep meals balanced, and follow your prenatal checkup schedule this week.";
  }, [healthTips]);

  const handleReadAloudCard = () => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const speechText = [
      `Week ${selectedWeek} baby development.`,
      detailedDevelopmentText,
      "What you might notice.",
      ...symptomHighlights,
      "Helpful tip for this week.",
      weeklyTip,
      `Size ${babyData?.fruit}. Length ${babyData?.size}. Weight ${babyData?.weight}.`,
    ].join(" ");

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setReadingCard(true);
    utterance.onend = () => setReadingCard(false);
    utterance.onerror = () => setReadingCard(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopReadAloudCard = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setReadingCard(false);
  };

  return (
    <section className="baby-growth-page">
      <div className="baby-growth-header">
        <h1>Baby Growth Tracker</h1>
        <p className="week-subheading">Week {selectedWeek}</p>
      </div>

      {babyData && (
        <div className="baby-growth-hero">
          <div className="hero-left">
            <h2>Week {selectedWeek}</h2>
            <h3>Your Baby This Week</h3>
            <p className="trimester-label">
              {selectedWeek <= 12 ? "First Trimester" : selectedWeek <= 27 ? "Second Trimester" : "Third Trimester"}
            </p>
            <div className="hero-metrics">
              <p>📏 Length <strong>{babyData.size}</strong></p>
              <p>⚖️ Weight <strong>{babyData.weight}</strong></p>
            </div>
            <div className="size-comp">
              <span>🌽</span>
              <div>
                <strong>{babyData.fruit}</strong>
                <p>About the size of a large {babyData.fruit.toLowerCase()}</p>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="baby-icon">👶</div>
          </div>
        </div>
      )}

      <PregnancyTimeline currentWeek={selectedWeek} onWeekSelect={handleWeekChange} />

      {babyData && (
        <section className="baby-growth-layout">
          <div className="baby-growth-viewer-col">
            <Baby3DViewer currentWeek={selectedWeek} />
          </div>

          <article className="baby-development-card">
            <div className="baby-development-header">
              <h3>Week {selectedWeek} Baby Development</h3>
              {readingCard ? (
                <button type="button" className="baby-development-audio-btn" onClick={handleStopReadAloudCard}>
                  Stop Read Aloud
                </button>
              ) : (
                <button type="button" className="baby-development-audio-btn" onClick={handleReadAloudCard}>
                  Read Aloud
                </button>
              )}
            </div>

            <div className="baby-development-section">
              <h4>Baby development this week</h4>
              <p className="baby-development-desc">
                {detailedDevelopmentText}
              </p>
            </div>

            <div className="baby-development-section">
              <h4>What you might notice</h4>
              <ul className="baby-development-list">
                {symptomHighlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="baby-development-section">
              <h4>Helpful tip for this week</h4>
              <p className="baby-development-tip">{weeklyTip}</p>
            </div>

            <div className="baby-development-stats">
              <div className="baby-stat-item">
                <span>Size</span>
                <strong>{babyData.fruit}</strong>
              </div>
              <div className="baby-stat-item">
                <span>Length</span>
                <strong>{babyData.size}</strong>
              </div>
              <div className="baby-stat-item">
                <span>Weight</span>
                <strong>{babyData.weight}</strong>
              </div>
            </div>

            <Link className="baby-development-link" to={`/pregnancy/week/${selectedWeek}`}>
              Read full article →
            </Link>
          </article>
        </section>
      )}

      {babyData && (
        <div className="baby-growth-grid">
          <article className="section-panel">
            <h3>💗 Baby Development This Week</h3>
            <ul className="detail-list">
              {babyData.milestones.slice(0, 5).map((milestone) => (
                <li key={milestone}>
                  <strong>{milestone.split(" ").slice(0, 2).join(" ")}</strong>
                  <p>{milestone}</p>
                </li>
              ))}
            </ul>
          </article>

          <OrganDevelopment organs={babyData?.organs || []} />

          <article className="section-panel">
            <h3>♡ Mother's Body Changes</h3>
            <div className="changes-list">
              {(bodyChanges.length ? bodyChanges : [
                { title: "Body Adaptation", text: "Your body is adapting week by week to support healthy fetal growth.", tone: "pink" },
              ]).map((change) => (
                <div className={`change-item ${change.tone}`} key={change.title}>
                  <strong>{change.title}</strong>
                  <p>{change.text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="section-panel">
            <h3>〽 What to Expect</h3>
            <ul className="expect-list">
              {weekContent.babyGrowth.expectations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="section-panel growth-since-last-week">
            <h3>📈 Growth Since Last Week</h3>
            <div className="growth-comparison-grid">
              <div className="growth-comparison-item">
                <span>Length Increase</span>
                <strong>{lengthIncreaseCm != null ? `+${lengthIncreaseCm.toFixed(1)} cm` : "N/A"}</strong>
              </div>
              <div className="growth-comparison-item">
                <span>Weight Increase</span>
                <strong>{weightIncreaseG != null ? `+${Math.round(weightIncreaseG)} g` : "N/A"}</strong>
              </div>
            </div>
          </article>

          <article className="section-panel tips">
            <h3>💚 Health Tips for Week {selectedWeek}</h3>
            <div className="tips-list">
              {(healthTips.length ? healthTips : [
                { icon: "💚", title: "Weekly Tip", text: "Keep regular prenatal checkups and maintain hydration this week." },
              ]).map((tip, idx) => (
                <div key={`${tip.title}-${idx}`}>
                  <strong>{tip.icon} {tip.title} {idx + 1}</strong>
                  <p>{tip.text}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      )}

      {loading && (
        <div className="baby-growth-loading">
          <div className="spinner" />
          <span>Loading baby development data...</span>
        </div>
      )}
    </section>
  );
}
