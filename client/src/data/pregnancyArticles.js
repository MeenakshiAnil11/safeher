export const pregnancyArticles = [
  {
    id: 1,
    title: "Understanding Your Second Trimester",
    category: "Pregnancy Stages",
    readTime: "8 min",
    weekRange: [13, 27],
    premium: false,
    content:
      "During the second trimester many women feel more energetic. Baby development continues rapidly and organs mature. Many symptoms such as nausea may reduce while appetite increases. Focus on balanced nutrition, hydration, and regular checkups. Baby movement usually becomes noticeable and emotional connection grows. Maintain healthy sleep posture, moderate activity, and routine prenatal screenings to support maternal and fetal health.",
  },
  {
    id: 2,
    title: "Managing Pregnancy Symptoms Safely",
    category: "Health",
    readTime: "10 min",
    weekRange: [8, 40],
    premium: true,
    content:
      "Pregnancy symptoms vary widely between individuals. Common symptoms include fatigue, nausea, heartburn, swelling, and hormonal mood shifts. Safe symptom management starts with hydration, smaller frequent meals, light movement, and structured rest. Know warning signs such as persistent severe headache, sudden swelling, vision changes, reduced fetal movement, or vaginal bleeding. Collaborate with your provider for evidence-based medications and personalized plans.",
  },
  {
    id: 3,
    title: "Understanding Baby Movements",
    category: "Baby Development",
    readTime: "7 min",
    weekRange: [20, 40],
    premium: false,
    content:
      "From around week twenty, fetal movement becomes more regular. Patterns differ by baby and often peak in evening hours. Track daily movement trends and report sudden decreases promptly. Gentle left-side rest, hydration, and calm breathing may help you perceive movement better. Movement monitoring supports early awareness and confidence during late pregnancy.",
  },
  {
    id: 4,
    title: "Managing Back Pain During Pregnancy",
    category: "Comfort",
    readTime: "9 min",
    weekRange: [16, 40],
    premium: false,
    content:
      "Back pain is common as posture shifts and ligaments soften. Supportive footwear, pelvic tilts, prenatal stretching, and posture breaks can reduce discomfort. Heat packs, sleep pillows, and activity pacing also help. Avoid heavy lifting and sudden twisting. Seek medical advice if pain is severe, one-sided, or associated with fever or contractions.",
  },
  {
    id: 5,
    title: "Pregnancy Hypertension: Early Warning and Care",
    category: "Vitals",
    readTime: "11 min",
    weekRange: [20, 40],
    premium: true,
    content:
      "Blood pressure trends become especially important after week twenty. Elevated readings require regular monitoring and timely obstetric review. Sodium moderation, hydration, stress reduction, and sleep quality can support healthier vitals. Know red-flag symptoms such as severe headache, blurry vision, sudden swelling, and upper abdominal pain. Early action protects both mother and baby.",
  },
  {
    id: 6,
    title: "Preparing for Labor and Delivery",
    category: "Birth Prep",
    readTime: "12 min",
    weekRange: [28, 40],
    premium: false,
    content:
      "Labor preparation includes understanding stages of labor, pain coping methods, breathing patterns, and when to go to hospital. Build a birth plan with flexibility for clinical decisions. Pack essentials early, identify emergency contacts, and discuss partner support roles. Confidence improves with education, realistic expectations, and communication with your care team.",
  },
];

export const getPregnancyArticleById = (articleId) =>
  pregnancyArticles.find((item) => String(item.id) === String(articleId).replace("preg-", ""));

export default pregnancyArticles;
