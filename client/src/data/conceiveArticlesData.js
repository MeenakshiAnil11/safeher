export const conceiveArticleCategories = [
  { id: "all", label: "All", icon: "📚" },
  { id: "fertility", label: "Fertility", icon: "🌸" },
  { id: "nutrition", label: "Nutrition", icon: "🥗" },
  { id: "ovulation", label: "Ovulation", icon: "🗓️" },
  { id: "wellness", label: "Wellness", icon: "🧘" },
  { id: "mental-health", label: "Mental Health", icon: "🧠" },
];

export const conceiveArticlesData = [
  {
    id: "fertile-window-guide",
    title: "Understanding Your Fertile Window",
    category: "fertility",
    description: "Learn how fertile days are identified and how to time conception with confidence.",
    readTime: "6 min read",
    author: "Dr. Sarah Johnson",
    date: "2024-01-15",
    rating: 4.8,
    readers: 12000,
    isPaid: false,
    tags: ["fertility", "fertile window", "cycle tracking"],
    heroImage:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1600&q=80",
    intro:
      "The fertile window includes the days when conception is most likely. Tracking these days can improve your understanding of cycle rhythm and reproductive timing.",
    contentSections: [
      {
        heading: "What is the Fertile Window?",
        image:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
        text: "Your fertile window usually includes the five days before ovulation and the day of ovulation. Sperm can survive for several days, so timing matters.",
      },
      {
        heading: "How Ovulation Works",
        image:
          "https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=1200&q=80",
        text: "Ovulation is the release of an egg from the ovary. Hormonal shifts drive this process, and a luteinizing hormone surge often appears 24-36 hours before ovulation.",
      },
      {
        heading: "Tracking Fertility",
        image:
          "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=1200&q=80",
        text: "Cycle charts, cervical mucus observation, and basal temperature can help estimate ovulation and support more informed conception planning.",
      },
    ],
    quickFacts: [
      "Most fertile days are near ovulation.",
      "Sperm can survive up to 5 days.",
      "Regular tracking improves prediction quality.",
    ],
  },
  {
    id: "lifestyle-fertility-impact",
    title: "How Lifestyle Affects Fertility",
    category: "wellness",
    description:
      "Learn how sleep, nutrition, and stress management impact reproductive health and fertility.",
    readTime: "8 min read",
    author: "Dr. Emily Chen",
    date: "2024-02-03",
    rating: 4.9,
    readers: 15400,
    isPaid: false,
    tags: ["wellness", "sleep", "stress", "fertility"],
    heroImage:
      "https://images.unsplash.com/photo-1499728603263-13726abce5fd?auto=format&fit=crop&w=1600&q=80",
    intro:
      "Fertility is influenced by everyday choices. Sleep quality, stress levels, and balanced meals can affect hormones and ovulation quality.",
    contentSections: [
      {
        heading: "Sleep and Hormonal Balance",
        image:
          "https://images.unsplash.com/photo-1455642305367-68834a7f6e83?auto=format&fit=crop&w=1200&q=80",
        text: "Poor sleep can disrupt endocrine signaling. Aim for a regular sleep schedule to support cycle stability and energy recovery.",
      },
      {
        heading: "Stress and Reproductive Signals",
        image:
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
        text: "High stress may impact ovulation timing. Mindfulness, breathing practices, and routine physical activity can reduce stress load.",
      },
      {
        heading: "Sustainable Daily Habits",
        image:
          "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
        text: "Small, consistent habits often matter more than short-term intensity. Focus on hydration, movement, and nutrient-dense foods.",
      },
    ],
    quickFacts: ["Sleep supports hormone regulation.", "Stress can influence ovulation timing.", "Balanced habits improve long-term outcomes."],
  },
  {
    id: "fertility-friendly-diet",
    title: "Fertility Friendly Diet Essentials",
    category: "nutrition",
    description: "Foods and nutrients that can support reproductive health and hormonal rhythm.",
    readTime: "7 min read",
    author: "Nutrition Expert A. Mehta",
    date: "2024-02-11",
    rating: 4.7,
    readers: 9800,
    isPaid: false,
    tags: ["nutrition", "folate", "iron", "fertility diet"],
    heroImage:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1600&q=80",
    intro:
      "A fertility-supportive diet emphasizes micronutrients, protein quality, and anti-inflammatory food patterns.",
    contentSections: [
      {
        heading: "Core Nutrients",
        image:
          "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
        text: "Folate, iron, omega-3 fats, and vitamin D play roles in reproductive health and cycle function.",
      },
      {
        heading: "Plate Composition",
        image:
          "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=80",
        text: "Build meals around vegetables, whole grains, legumes, and quality protein. Add seeds, nuts, and healthy fats.",
      },
      {
        heading: "Practical Meal Planning",
        image:
          "https://images.unsplash.com/photo-1546069901-eacef0df6022?auto=format&fit=crop&w=1200&q=80",
        text: "Batch prep simple meals to stay consistent. Keep fertility-friendly snack options ready for busy days.",
      },
    ],
    quickFacts: ["Iron and folate are key nutrients.", "Whole foods support hormonal balance.", "Consistency is more important than perfection."],
  },
  {
    id: "signs-of-ovulation",
    title: "Signs of Ovulation You Should Know",
    category: "ovulation",
    description: "Understand common ovulation signs and what they may mean for conception timing.",
    readTime: "5 min read",
    author: "Dr. Priya Nair",
    date: "2024-03-01",
    rating: 4.6,
    readers: 14200,
    isPaid: false,
    tags: ["ovulation", "cervical mucus", "body signals"],
    heroImage:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1600&q=80",
    intro:
      "Body signals can help estimate ovulation timing. Combining multiple indicators gives a stronger fertility picture.",
    contentSections: [
      {
        heading: "Cervical Mucus Changes",
        image:
          "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
        text: "Clear, stretchy cervical mucus may appear near ovulation and can indicate increased fertility.",
      },
      {
        heading: "Temperature Shift",
        image:
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
        text: "Basal body temperature can rise slightly after ovulation due to progesterone.",
      },
      {
        heading: "Cycle Data Patterns",
        image:
          "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1200&q=80",
        text: "Regular tracking of symptoms and cycle day improves your prediction confidence over time.",
      },
    ],
    quickFacts: ["No single sign is perfect.", "Use multiple indicators.", "Patterns emerge with consistent tracking."],
  },
  {
    id: "improving-egg-health",
    title: "Improving Egg Health Naturally",
    category: "fertility",
    description: "Evidence-informed habits that may support egg quality and reproductive wellness.",
    readTime: "9 min read",
    author: "Dr. Sarah Johnson",
    date: "2024-03-07",
    rating: 4.8,
    readers: 11300,
    isPaid: true,
    tags: ["egg health", "fertility", "antioxidants"],
    heroImage:
      "https://images.unsplash.com/photo-1505576633757-0ac1084af824?auto=format&fit=crop&w=1600&q=80",
    intro:
      "Egg health is influenced by age, oxidative stress, and daily habits. Focus on sustainable, long-term changes.",
    contentSections: [
      {
        heading: "Hormonal Support Basics",
        image:
          "https://images.unsplash.com/photo-1457530378978-8bac673b8062?auto=format&fit=crop&w=1200&q=80",
        text: "Regular routines, healthy sleep, and balanced meals can support hormone signaling linked to ovulation quality.",
      },
      {
        heading: "Antioxidant-Rich Foods",
        image:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
        text: "Colorful fruits, vegetables, and omega-rich foods may help reduce oxidative stress.",
      },
      {
        heading: "When to Consult a Specialist",
        image:
          "https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=1200&q=80",
        text: "If conception takes longer than expected, a specialist can assess ovarian reserve and personalize options.",
      },
    ],
    quickFacts: ["Age is one factor, not the only factor.", "Lifestyle has cumulative effects.", "Early guidance can be useful."],
  },
  {
    id: "managing-fertility-stress",
    title: "Managing Stress During Fertility Journey",
    category: "mental-health",
    description: "Mental health strategies to cope with uncertainty and build emotional resilience.",
    readTime: "8 min read",
    author: "Dr. Lisa Anderson",
    date: "2024-03-15",
    rating: 4.9,
    readers: 10100,
    isPaid: true,
    tags: ["mental health", "stress", "fertility journey"],
    heroImage:
      "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=1600&q=80",
    intro:
      "The conception journey can feel emotionally heavy. Structured coping tools help maintain balance and motivation.",
    contentSections: [
      {
        heading: "Recognizing Emotional Load",
        image:
          "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80",
        text: "Naming emotions can reduce overwhelm. Journaling and therapy can support processing.",
      },
      {
        heading: "Support Systems",
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
        text: "Partner communication and trusted support circles can improve coping and reduce isolation.",
      },
      {
        heading: "Mind-Body Practices",
        image:
          "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
        text: "Breathwork, mindfulness, and low-impact movement can lower stress reactivity.",
      },
    ],
    quickFacts: ["Stress support is part of fertility care.", "Small routines create stability.", "You are not alone."],
  },
  {
    id: "hormones-and-fertility",
    title: "How Hormones Affect Fertility",
    category: "fertility",
    description: "A practical guide to hormone roles across the menstrual cycle.",
    readTime: "10 min read",
    author: "Dr. Emily Chen",
    date: "2024-03-20",
    rating: 4.7,
    readers: 8600,
    isPaid: true,
    tags: ["hormones", "fertility", "cycle phase"],
    heroImage:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80",
    intro:
      "Hormones coordinate follicle growth, ovulation, and luteal support. Understanding this can demystify cycle variations.",
    contentSections: [
      {
        heading: "Follicular Hormones",
        image:
          "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80",
        text: "Estrogen rises in the follicular phase and supports endometrial preparation.",
      },
      {
        heading: "Ovulatory Shift",
        image:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        text: "LH surge triggers ovulation, while cervical mucus often reflects this transition.",
      },
      {
        heading: "Luteal Support",
        image:
          "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80",
        text: "Progesterone dominates the luteal phase and can influence mood, temperature, and symptoms.",
      },
    ],
    quickFacts: ["Hormones change by phase.", "Cycle tracking helps map patterns.", "Persistent irregularity should be evaluated."],
  },
];

export const getConceiveArticleById = (articleId) =>
  conceiveArticlesData.find((article) => article.id === articleId);
