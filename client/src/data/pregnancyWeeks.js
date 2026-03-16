const basePregnancyWeeks = {
  1: {
    fruit: "Poppy seed",
    length: "Not measurable",
    weight: "Not measurable",
    development: "Conception usually has not occurred yet. Your body is preparing for ovulation and possible fertilization.",
    motherChanges: "You may notice your regular menstrual-phase symptoms such as mild cramps, fatigue, or mood changes.",
    tips: [
      "Start prenatal vitamins with folic acid if you are trying to conceive.",
      "Avoid alcohol and smoking.",
      "Track your cycle dates to estimate ovulation."
    ]
  },
  2: {
    fruit: "Poppy seed",
    length: "Not measurable",
    weight: "Not measurable",
    development: "Ovulation may occur this week, and fertilization can happen soon after.",
    motherChanges: "Subtle hormonal changes may begin, but most people still feel normal.",
    tips: [
      "Prioritize hydration and balanced meals.",
      "Limit caffeine to around 200 mg daily.",
      "Get adequate sleep to support hormone balance."
    ]
  },
  3: {
    fruit: "Vanilla bean speck",
    length: "0.1-0.2 mm",
    weight: "Microscopic",
    development: "A fertilized egg becomes a blastocyst and travels to implant in the uterus.",
    motherChanges: "Some people notice very mild cramping or spotting during implantation.",
    tips: [
      "Continue daily prenatal vitamins.",
      "Choose gentle exercise like walking.",
      "Avoid raw or undercooked foods."
    ]
  },
  4: {
    fruit: "Poppy seed",
    length: "0.2 cm",
    weight: "Less than 1 g",
    development: "The embryo begins forming the neural tube, which develops into brain and spinal cord.",
    motherChanges: "Missed period, breast tenderness, fatigue, and light nausea may appear.",
    tips: [
      "Book your first prenatal appointment.",
      "Eat small, frequent meals if nausea starts.",
      "Increase folate-rich foods like leafy greens and beans."
    ]
  },
  5: {
    fruit: "Sesame seed",
    length: "0.4 cm",
    weight: "Less than 1 g",
    development: "The heart and early circulatory system begin developing rapidly.",
    motherChanges: "Nausea, food aversions, and frequent urination may increase.",
    tips: [
      "Keep simple snacks nearby for morning sickness.",
      "Avoid long gaps between meals.",
      "Rest when fatigue is strong."
    ]
  },
  6: {
    fruit: "Lentil",
    length: "0.6 cm",
    weight: "Less than 1 g",
    development: "Facial features start forming, and the neural tube continues closing.",
    motherChanges: "Bloating, mood swings, and heightened smell sensitivity are common.",
    tips: [
      "Try ginger tea or bland foods for nausea relief.",
      "Wear comfortable bras if breast soreness increases.",
      "Stay active with short walks."
    ]
  },
  7: {
    fruit: "Blueberry",
    length: "1.0 cm",
    weight: "1 g",
    development: "Arms and leg buds are more defined, and brain growth accelerates.",
    motherChanges: "Morning sickness may peak, and emotional changes can feel stronger.",
    tips: [
      "Keep hydrated throughout the day.",
      "Discuss severe vomiting with your healthcare provider.",
      "Practice stress-reduction breathing."
    ]
  },
  8: {
    fruit: "Kidney bean",
    length: "1.6 cm",
    weight: "1 g",
    development: "Major organs are in place, and tiny fingers and toes begin forming.",
    motherChanges: "Fatigue and nausea may continue; waistline changes are usually minimal.",
    tips: [
      "Prioritize protein intake for steady energy.",
      "Take prenatal vitamins with food if they upset your stomach.",
      "Avoid overheating during workouts."
    ]
  },
  9: {
    fruit: "Cherry",
    length: "2.3 cm",
    weight: "2 g",
    development: "The embryo is now called a fetus, and facial features are becoming clearer.",
    motherChanges: "Bloating and mild headaches can occur from hormonal shifts.",
    tips: [
      "Eat iron-rich foods and pair with vitamin C.",
      "Stand up slowly to avoid dizziness.",
      "Talk with your doctor before using any medications."
    ]
  },
  10: {
    fruit: "Strawberry",
    length: "3.1 cm",
    weight: "4 g",
    development: "Vital organs continue maturing, and early tooth buds form.",
    motherChanges: "Nausea may begin to improve for some, though tiredness can remain.",
    tips: [
      "Keep prenatal visits on schedule.",
      "Focus on calcium and vitamin D intake.",
      "Use gentle stretching for lower back comfort."
    ]
  },
  11: {
    fruit: "Fig",
    length: "4.1 cm",
    weight: "7 g",
    development: "Hands and feet are more developed, and baby can make small movements.",
    motherChanges: "You may feel hungrier as nausea starts easing.",
    tips: [
      "Choose nutrient-dense snacks like nuts and yogurt.",
      "Continue light daily activity.",
      "Monitor hydration, especially in warm weather."
    ]
  },
  12: {
    fruit: "Lime",
    length: "5.4 cm",
    weight: "14 g",
    development: "Reflexes begin, and organs are formed enough to enter the growth phase.",
    motherChanges: "End of first trimester may bring better energy and reduced nausea.",
    tips: [
      "Review your first-trimester lab results with your provider.",
      "Maintain balanced meals with protein and fiber.",
      "Begin pelvic floor exercises if approved."
    ]
  },
  13: {
    fruit: "Lemon",
    length: "7.4 cm",
    weight: "23 g",
    development: "Second trimester begins; bones are hardening and vocal cord structures develop.",
    motherChanges: "Energy often improves, but occasional headaches or constipation may occur.",
    tips: [
      "Increase water and fiber to reduce constipation.",
      "Plan regular, moderate exercise.",
      "Use posture support while sitting for long periods."
    ]
  },
  14: {
    fruit: "Peach",
    length: "8.7 cm",
    weight: "43 g",
    development: "Neck lengthens and facial muscles continue developing.",
    motherChanges: "A small bump may start to show, especially in subsequent pregnancies.",
    tips: [
      "Wear supportive footwear to reduce strain.",
      "Keep blood sugar stable with regular meals.",
      "Discuss safe travel plans with your provider."
    ]
  },
  15: {
    fruit: "Apple",
    length: "10.1 cm",
    weight: "70 g",
    development: "Baby can move joints and is developing a stronger skeleton.",
    motherChanges: "Nasal congestion and bleeding gums can appear due to increased blood flow.",
    tips: [
      "Use a soft toothbrush and good oral care.",
      "Try saline spray for pregnancy congestion.",
      "Include omega-3 sources in your diet."
    ]
  },
  16: {
    fruit: "Avocado",
    length: "11.6 cm",
    weight: "100 g",
    development: "Muscles and limbs grow stronger, and baby begins coordinated movements.",
    motherChanges: "Some people notice early fluttering sensations called quickening.",
    tips: [
      "Track new symptoms in your pregnancy log.",
      "Continue prenatal supplements daily.",
      "Sleep on your side when comfortable."
    ]
  },
  17: {
    fruit: "Pear",
    length: "13.0 cm",
    weight: "140 g",
    development: "Fat stores start forming under the skin and the umbilical cord strengthens.",
    motherChanges: "Appetite may increase, and mild backache can start.",
    tips: [
      "Use proper lifting technique and avoid heavy lifting.",
      "Add protein to each meal.",
      "Do prenatal stretches for back support."
    ]
  },
  18: {
    fruit: "Sweet potato",
    length: "14.2 cm",
    weight: "190 g",
    development: "Ears are developed enough for baby to start hearing sounds.",
    motherChanges: "You may feel more regular fetal movement if this is not your first pregnancy.",
    tips: [
      "Talk or sing to your baby if you enjoy it.",
      "Attend your anatomy scan appointment.",
      "Keep up with iron-rich foods."
    ]
  },
  19: {
    fruit: "Mango",
    length: "15.3 cm",
    weight: "240 g",
    development: "Protective skin coating (vernix) forms and sensory development continues.",
    motherChanges: "Round ligament pain and skin stretching may be noticeable.",
    tips: [
      "Move slowly when changing positions.",
      "Use moisturizer for skin comfort.",
      "Wear maternity support clothing as needed."
    ]
  },
  20: {
    fruit: "Banana",
    length: "16.4 cm",
    weight: "300 g",
    development: "Baby reaches the halfway milestone; swallowing and movement patterns improve.",
    motherChanges: "Fetal movements are often clearly felt by this week.",
    tips: [
      "Review anomaly scan findings with your doctor.",
      "Track baby movement patterns over time.",
      "Maintain regular prenatal checkups."
    ]
  },
  21: {
    fruit: "Carrot",
    length: "26.7 cm",
    weight: "360 g",
    development: "Digestive system practices swallowing amniotic fluid.",
    motherChanges: "Leg cramps and heartburn may begin for some.",
    tips: [
      "Stretch calves before bed.",
      "Avoid very spicy or heavy late-night meals.",
      "Eat smaller meals more frequently."
    ]
  },
  22: {
    fruit: "Papaya",
    length: "27.8 cm",
    weight: "430 g",
    development: "Eyes and lips are more defined, and baby responds to touch.",
    motherChanges: "Belly growth increases and center of gravity shifts.",
    tips: [
      "Use good posture and avoid prolonged standing.",
      "Choose low-impact exercise like swimming or walking.",
      "Stay hydrated to reduce Braxton Hicks discomfort."
    ]
  },
  23: {
    fruit: "Grapefruit",
    length: "28.9 cm",
    weight: "500 g",
    development: "Lungs continue forming air sacs, though not yet mature.",
    motherChanges: "Ankles may swell mildly, especially later in the day.",
    tips: [
      "Elevate feet when resting.",
      "Reduce high-sodium processed foods.",
      "Call your provider for sudden severe swelling."
    ]
  },
  24: {
    fruit: "Corn on the cob",
    length: "30.0 cm",
    weight: "600 g",
    development: "Baby's hearing improves, and sleep-wake cycles become more regular.",
    motherChanges: "You may notice stronger kicks and occasional abdominal tightening.",
    tips: [
      "Discuss glucose screening timing with your provider.",
      "Keep a consistent bedtime routine.",
      "Continue daily fetal movement awareness."
    ]
  },
  25: {
    fruit: "Rutabaga",
    length: "34.6 cm",
    weight: "660 g",
    development: "Spine, lungs, and blood vessels continue developing rapidly.",
    motherChanges: "Back pain and sleep discomfort can increase as belly grows.",
    tips: [
      "Use pregnancy pillows for side sleeping.",
      "Try prenatal yoga or mobility drills.",
      "Ask your provider about a support belt if needed."
    ]
  },
  26: {
    fruit: "Scallion bunch",
    length: "35.6 cm",
    weight: "760 g",
    development: "Eyes begin opening and closing, and brain activity increases.",
    motherChanges: "Braxton Hicks contractions may become more noticeable.",
    tips: [
      "Hydrate when contractions feel frequent.",
      "Learn warning signs of preterm labor.",
      "Avoid overexertion and take regular breaks."
    ]
  },
  27: {
    fruit: "Cauliflower",
    length: "36.6 cm",
    weight: "875 g",
    development: "Third trimester starts; lungs and nervous system keep maturing.",
    motherChanges: "Fatigue can return, and mobility may feel slower.",
    tips: [
      "Plan your third-trimester appointments ahead.",
      "Prepare questions for your birth plan discussion.",
      "Keep protein intake consistent."
    ]
  },
  28: {
    fruit: "Eggplant",
    length: "37.6 cm",
    weight: "1000 g",
    development: "Baby can blink and may dream during REM sleep cycles.",
    motherChanges: "You may feel shortness of breath with activity as uterus expands upward.",
    tips: [
      "Pace physical tasks and avoid rushing.",
      "Get recommended third-trimester vaccines as advised.",
      "Start kick-count routine if your provider recommends it."
    ]
  },
  29: {
    fruit: "Butternut squash",
    length: "38.6 cm",
    weight: "1150 g",
    development: "Muscles and lungs keep maturing, and body fat increases.",
    motherChanges: "Heartburn and pelvic pressure may increase.",
    tips: [
      "Avoid lying down right after meals.",
      "Use smaller meal portions to reduce reflux.",
      "Practice daily pelvic floor relaxation and strengthening."
    ]
  },
  30: {
    fruit: "Cabbage",
    length: "39.9 cm",
    weight: "1320 g",
    development: "Brain surface becomes more folded as neural development advances.",
    motherChanges: "Lower back pain and sleep disturbances are common.",
    tips: [
      "Use side-lying sleep position for comfort.",
      "Try warm compresses for back soreness.",
      "Keep prenatal visits regular."
    ]
  },
  31: {
    fruit: "Coconut",
    length: "41.1 cm",
    weight: "1500 g",
    development: "Baby gains weight quickly and may turn head-down soon.",
    motherChanges: "You may notice stronger and more patterned baby movements.",
    tips: [
      "Track movement patterns daily.",
      "Stay active with gentle walking.",
      "Discuss labor signs during appointments."
    ]
  },
  32: {
    fruit: "Jicama",
    length: "42.4 cm",
    weight: "1700 g",
    development: "Bones are fully formed but still soft, and skin becomes less translucent.",
    motherChanges: "Breathlessness can continue, and balance may feel different.",
    tips: [
      "Use handrails and avoid slippery surfaces.",
      "Take seated breaks throughout the day.",
      "Pack a draft hospital checklist."
    ]
  },
  33: {
    fruit: "Pineapple",
    length: "43.7 cm",
    weight: "1900 g",
    development: "Immune system support from maternal antibodies increases.",
    motherChanges: "Frequent urination and pelvic heaviness often intensify.",
    tips: [
      "Do regular Kegel exercises if approved.",
      "Keep a hydration bottle nearby.",
      "Practice labor breathing techniques."
    ]
  },
  34: {
    fruit: "Cantaloupe",
    length: "45.0 cm",
    weight: "2150 g",
    development: "Lung maturity improves, and baby continues rapid fat gain.",
    motherChanges: "Braxton Hicks may be more frequent and uncomfortable.",
    tips: [
      "Time contractions if they become regular.",
      "Know when to call labor and delivery.",
      "Review your transportation plan to the hospital."
    ]
  },
  35: {
    fruit: "Honeydew melon",
    length: "46.2 cm",
    weight: "2400 g",
    development: "Kidneys are fully developed, and liver function is maturing.",
    motherChanges: "You may feel increased pressure in pelvis and hips.",
    tips: [
      "Choose supportive shoes and avoid long standing periods.",
      "Rest with hips elevated when possible.",
      "Finalize newborn essentials at home."
    ]
  },
  36: {
    fruit: "Romaine lettuce head",
    length: "47.4 cm",
    weight: "2620 g",
    development: "Baby is considered late preterm and continues building fat stores.",
    motherChanges: "Cervical changes may begin; sleep and comfort can be challenging.",
    tips: [
      "Keep hospital bag ready.",
      "Review breastfeeding and postpartum plans.",
      "Attend weekly prenatal checks if scheduled."
    ]
  },
  37: {
    fruit: "Swiss chard bunch",
    length: "48.6 cm",
    weight: "2850 g",
    development: "Baby is early term and can practice breathing movements.",
    motherChanges: "You may notice increased pelvic pressure and occasional mucus discharge.",
    tips: [
      "Watch for signs of labor or water breaking.",
      "Stay near your planned birth location.",
      "Maintain light movement for circulation."
    ]
  },
  38: {
    fruit: "Leek",
    length: "49.8 cm",
    weight: "3080 g",
    development: "Most organs are ready for life outside the womb, with lungs nearly fully mature.",
    motherChanges: "Contractions may become more regular and intense.",
    tips: [
      "Practice labor comfort positions.",
      "Keep emergency contacts easy to access.",
      "Focus on rest and hydration."
    ]
  },
  39: {
    fruit: "Mini watermelon",
    length: "50.7 cm",
    weight: "3280 g",
    development: "Baby is full term and continues slight growth and fat accumulation.",
    motherChanges: "Fatigue, pressure, and anticipation are common at this stage.",
    tips: [
      "Monitor fetal movements daily.",
      "Contact your provider for reduced movement or concerning symptoms.",
      "Keep your birth plan flexible and practical."
    ]
  },
  40: {
    fruit: "Small pumpkin",
    length: "51.2 cm",
    weight: "3460 g",
    development: "Estimated due week. Baby is fully developed and ready for birth.",
    motherChanges: "Labor may start naturally with contractions, backache, and cervical changes.",
    tips: [
      "Call your healthcare team when labor signs begin.",
      "Stay calm, hydrated, and supported.",
      "Follow your provider's guidance for induction timing if needed."
    ]
  }
};

const getOrgansForWeek = (week) => {
  if (week <= 4) {
    return [
      { name: "Neural Tube", status: "Early formation begins" },
      { name: "Placenta", status: "Implantation support developing" },
      { name: "Yolk Sac", status: "Nutrient support in earliest stage" },
    ];
  }
  if (week <= 8) {
    return [
      { name: "Heart", status: "Beating and pumping primitive blood flow" },
      { name: "Brain", status: "Rapid neural development" },
      { name: "Limb Buds", status: "Arms and legs forming" },
    ];
  }
  if (week <= 12) {
    return [
      { name: "Brain", status: "Major brain regions organizing" },
      { name: "Lungs", status: "Early branching of airways" },
      { name: "Kidneys", status: "Beginning urine production" },
    ];
  }
  if (week <= 16) {
    return [
      { name: "Skeletal System", status: "Bones strengthening and mineralizing" },
      { name: "Liver", status: "Growing and supporting blood formation" },
      { name: "Thyroid", status: "Hormone regulation pathways maturing" },
    ];
  }
  if (week <= 20) {
    return [
      { name: "Ears", status: "Hearing structures maturing" },
      { name: "Skin", status: "Protective layers and vernix development" },
      { name: "Digestive System", status: "Swallowing and gut activity improving" },
    ];
  }
  if (week <= 24) {
    return [
      { name: "Lungs", status: "Air sacs developing, surfactant production starting" },
      { name: "Brain", status: "Sensory wiring and sleep cycles advancing" },
      { name: "Pancreas", status: "Insulin-related function progressing" },
    ];
  }
  if (week <= 28) {
    return [
      { name: "Eyes", status: "Blinking and light response increasing" },
      { name: "Nervous System", status: "Signal coordination improving" },
      { name: "Immune System", status: "Early immune support building" },
    ];
  }
  if (week <= 32) {
    return [
      { name: "Brain", status: "Rapid growth with deeper cortical folding" },
      { name: "Lungs", status: "Maturing for rhythmic breathing" },
      { name: "Bone Marrow", status: "Primary blood cell production strengthening" },
    ];
  }
  if (week <= 36) {
    return [
      { name: "Kidneys", status: "Mature filtration and fluid balance" },
      { name: "Liver", status: "Metabolic readiness improving" },
      { name: "Digestive System", status: "Prepared for feeding after birth" },
    ];
  }
  return [
    { name: "Lungs", status: "Near full maturity for birth transition" },
    { name: "Brain", status: "Continues refining neural connections" },
    { name: "Heart", status: "Strong circulation and birth-ready adaptation" },
  ];
};

const getMilestonesForWeek = (week) => {
  if (week <= 4) return ["Implantation completes", "Pregnancy hormones begin rising"];
  if (week <= 8) return ["Heartbeat detected", "Major body plan established"];
  if (week <= 12) return ["Reflex activity begins", "First trimester nearing completion"];
  if (week <= 16) return ["Facial features become clearer", "Early coordinated movements start"];
  if (week <= 20) return ["Baby can hear sounds", "Many parents begin feeling movement"];
  if (week <= 24) return ["Baby begins swallowing more fluid", "Sleep-wake cycles become noticeable"];
  if (week <= 28) return ["Eyes can open and close", "Third trimester preparation begins"];
  if (week <= 32) return ["Steady weight gain accelerates", "Position changes become more obvious"];
  if (week <= 36) return ["Baby practices breathing movements", "Head-down position may settle"];
  return ["Full-term readiness increases", "Labor signs may begin any time"];
};

export const pregnancyWeeks = Object.fromEntries(
  Object.entries(basePregnancyWeeks).map(([week, details]) => [
    week,
    {
      ...details,
      organs: getOrgansForWeek(Number(week)),
      milestones: getMilestonesForWeek(Number(week)),
    },
  ])
);

export default pregnancyWeeks;
