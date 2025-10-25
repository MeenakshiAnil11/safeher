import React, { useState, useEffect } from "react";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import "./assessment.css";

const ASSESSMENT_CATEGORIES = {
  safety: {
    title: "Safety Confidence Self-Check",
    description: "Evaluate your confidence in handling safety situations and identify areas for improvement.",
    assessment: {
      questions: [
        {
          id: 1,
          question: "How confident are you in recognizing potentially unsafe situations?",
          options: [
            { text: "Very confident, I trust my instincts", score: 0 },
            { text: "Somewhat confident but sometimes unsure", score: 1 },
            { text: "Not very confident, I often second-guess myself", score: 2 },
            { text: "Not confident at all, I feel vulnerable", score: 3 }
          ]
        },
        {
          id: 2,
          question: "How comfortable are you using technology for safety (GPS tracking, emergency apps)?",
          options: [
            { text: "Very comfortable, I use them regularly", score: 0 },
            { text: "Somewhat comfortable, I know how but don't always use", score: 1 },
            { text: "Uncomfortable, I find them confusing", score: 2 },
            { text: "Very uncomfortable, I avoid using them", score: 3 }
          ]
        },
        {
          id: 3,
          question: "How well do you know your local emergency numbers and resources?",
          options: [
            { text: "Very well, I have them saved and know when to use them", score: 0 },
            { text: "Fairly well, I know the basics", score: 1 },
            { text: "Not very well, I would need to look them up", score: 2 },
            { text: "Poorly, I'm not sure where to find help", score: 3 }
          ]
        },
        {
          id: 4,
          question: "How often do you share your location or plans with trusted contacts?",
          options: [
            { text: "Always, with multiple people", score: 0 },
            { text: "Usually, with at least one person", score: 1 },
            { text: "Sometimes, when I remember", score: 2 },
            { text: "Rarely or never", score: 3 }
          ]
        },
        {
          id: 5,
          question: "How prepared do you feel to respond to a safety emergency?",
          options: [
            { text: "Very prepared, I have a plan", score: 0 },
            { text: "Somewhat prepared, I know basic steps", score: 1 },
            { text: "Not very prepared, I'd be unsure what to do", score: 2 },
            { text: "Not prepared at all, I'd panic", score: 3 }
          ]
        }
      ],
      getResult: (score) => {
        if (score <= 5) {
          return {
            level: "High Safety Confidence",
            description: "You demonstrate strong safety awareness and preparedness.",
            color: "#4CAF50",
            recommendations: [
              "Continue your excellent safety practices",
              "Consider mentoring others about safety",
              "Stay updated on new safety technologies"
            ]
          };
        } else if (score <= 10) {
          return {
            level: "Moderate Safety Confidence",
            description: "You have good basic safety knowledge but could benefit from more practice.",
            color: "#FF9800",
            recommendations: [
              "Practice emergency scenarios regularly",
              "Learn more about local safety resources",
              "Consider taking a self-defense course"
            ]
          };
        } else {
          return {
            level: "Low Safety Confidence",
            description: "Building safety confidence is important for your well-being.",
            color: "#F44336",
            recommendations: [
              "Start with basic safety education resources",
              "Practice sharing location with trusted contacts",
              "Learn emergency numbers and keep them accessible",
              "Consider professional safety training"
            ]
          };
        }
      },
      reflectiveTip: "Safety confidence grows with knowledge and practice. Every small step towards awareness makes a difference."
    }
  },
  legal: {
    title: "Legal Readiness Self-Test",
    description: "Assess your understanding of legal rights and protections available to women.",
    assessment: {
      questions: [
        {
          id: 1,
          question: "How familiar are you with laws protecting women from harassment?",
          options: [
            { text: "Very familiar, I know key laws like POSH Act", score: 0 },
            { text: "Somewhat familiar, I've heard of some laws", score: 1 },
            { text: "Not very familiar, I know harassment is wrong but not the laws", score: 2 },
            { text: "Not familiar at all", score: 3 }
          ]
        },
        {
          id: 2,
          question: "Do you know your rights regarding domestic violence protection?",
          options: [
            { text: "Yes, I know about protection orders and shelters", score: 0 },
            { text: "Somewhat, I know domestic violence is illegal", score: 1 },
            { text: "Not really, I'd need to research it", score: 2 },
            { text: "No, I'm not sure about legal protections", score: 3 }
          ]
        },
        {
          id: 3,
          question: "How confident are you in filing a police complaint if needed?",
          options: [
            { text: "Very confident, I know the process", score: 0 },
            { text: "Somewhat confident, I know where to start", score: 1 },
            { text: "Not very confident, I'd need help", score: 2 },
            { text: "Not confident at all, I'd be intimidated", score: 3 }
          ]
        },
        {
          id: 4,
          question: "Are you aware of women's legal aid organizations in your area?",
          options: [
            { text: "Yes, I know several and their contact info", score: 0 },
            { text: "Yes, I've heard of some", score: 1 },
            { text: "Not really, I'd need to search for them", score: 2 },
            { text: "No, I'm not aware of any", score: 3 }
          ]
        },
        {
          id: 5,
          question: "How well do you understand consent and sexual assault laws?",
          options: [
            { text: "Very well, I can explain them clearly", score: 0 },
            { text: "Fairly well, I understand the basics", score: 1 },
            { text: "Not very well, I have some misconceptions", score: 2 },
            { text: "Poorly, I'm confused about what constitutes assault", score: 3 }
          ]
        }
      ],
      getResult: (score) => {
        if (score <= 5) {
          return {
            level: "High Legal Readiness",
            description: "You have strong legal awareness and know how to protect your rights.",
            color: "#4CAF50",
            recommendations: [
              "Stay informed about legal updates",
              "Consider volunteering with legal aid organizations",
              "Help educate others about their rights"
            ]
          };
        } else if (score <= 10) {
          return {
            level: "Moderate Legal Readiness",
            description: "You have basic legal knowledge but could benefit from more detailed understanding.",
            color: "#FF9800",
            recommendations: [
              "Read more about women's legal rights",
              "Connect with legal aid organizations",
              "Learn about local laws and resources"
            ]
          };
        } else {
          return {
            level: "Low Legal Readiness",
            description: "Building legal knowledge is crucial for empowerment and protection.",
            color: "#F44336",
            recommendations: [
              "Start with basic legal rights education",
              "Contact local women's legal aid centers",
              "Learn emergency legal procedures",
              "Consider consulting a legal expert"
            ]
          };
        }
      },
      reflectiveTip: "Legal knowledge is power. Understanding your rights helps you live more confidently and safely."
    }
  },
  mood: {
    title: "Mood & Stress Check",
    description: "Evaluate your current emotional well-being and stress levels.",
    assessment: {
      questions: [
        {
          id: 1,
          question: "How often do you feel overwhelmed by your daily responsibilities?",
          options: [
            { text: "Rarely or never", score: 0 },
            { text: "Sometimes", score: 1 },
            { text: "Often", score: 2 },
            { text: "Almost always", score: 3 }
          ]
        },
        {
          id: 2,
          question: "How well do you sleep at night?",
          options: [
            { text: "Very well, I feel rested", score: 0 },
            { text: "Fairly well", score: 1 },
            { text: "Not very well, I wake up tired", score: 2 },
            { text: "Poorly, I have trouble falling asleep or staying asleep", score: 3 }
          ]
        },
        {
          id: 3,
          question: "How often do you experience physical symptoms like headaches, muscle tension, or stomach issues?",
          options: [
            { text: "Rarely or never", score: 0 },
            { text: "Sometimes", score: 1 },
            { text: "Often", score: 2 },
            { text: "Almost always", score: 3 }
          ]
        },
        {
          id: 4,
          question: "How do you handle unexpected changes or challenges?",
          options: [
            { text: "I adapt easily and stay calm", score: 0 },
            { text: "I manage but feel some stress", score: 1 },
            { text: "I find it difficult and get anxious", score: 2 },
            { text: "I feel completely overwhelmed", score: 3 }
          ]
        },
        {
          id: 5,
          question: "How often do you take time for yourself or engage in relaxing activities?",
          options: [
            { text: "Daily", score: 0 },
            { text: "A few times a week", score: 1 },
            { text: "Rarely", score: 2 },
            { text: "Almost never", score: 3 }
          ]
        },
        {
          id: 6,
          question: "How would you rate your overall mood and outlook on life?",
          options: [
            { text: "Generally positive and optimistic", score: 0 },
            { text: "Mostly positive but with some worries", score: 1 },
            { text: "Often anxious or down", score: 2 },
            { text: "Frequently depressed or hopeless", score: 3 }
          ]
        },
        {
          id: 7,
          question: "How often do you feel irritable or easily angered?",
          options: [
            { text: "Rarely or never", score: 0 },
            { text: "Sometimes", score: 1 },
            { text: "Often", score: 2 },
            { text: "Almost always", score: 3 }
          ]
        },
        {
          id: 8,
          question: "How supportive is your social network (friends, family, colleagues)?",
          options: [
            { text: "Very supportive", score: 0 },
            { text: "Somewhat supportive", score: 1 },
            { text: "Not very supportive", score: 2 },
            { text: "I feel isolated", score: 3 }
          ]
        }
      ],
      getResult: (score) => {
        if (score <= 8) {
          return {
            level: "Low Stress",
            description: "You're managing stress well. Keep up your healthy habits!",
            color: "#4CAF50",
            recommendations: [
              "Continue your current stress management practices",
              "Consider preventive measures like regular exercise",
              "Share your positive strategies with others"
            ]
          };
        } else if (score <= 16) {
          return {
            level: "Moderate Stress",
            description: "You're experiencing some stress that could benefit from attention.",
            color: "#FF9800",
            recommendations: [
              "Practice daily relaxation techniques (deep breathing, meditation)",
              "Ensure you're getting enough sleep and exercise",
              "Consider talking to a trusted friend or counselor",
              "Take short breaks throughout your day"
            ]
          };
        } else {
          return {
            level: "High Stress",
            description: "You're experiencing significant stress that may be affecting your well-being.",
            color: "#F44336",
            recommendations: [
              "Seek professional help from a counselor or therapist",
              "Practice stress reduction techniques regularly",
              "Consider lifestyle changes like better sleep habits",
              "Reach out to support networks or helplines",
              "Take time off if possible to recharge"
            ]
          };
        }
      },
      reflectiveTip: "Your mental health matters. Taking care of your emotional well-being is a sign of strength, not weakness."
    }
  },
  emergency: {
    title: "Emergency Preparedness Test",
    description: "Assess your readiness for various emergency situations.",
    assessment: {
      questions: [
        {
          id: 1,
          question: "Do you have emergency contact numbers saved and easily accessible?",
          options: [
            { text: "Yes, saved in phone and written down", score: 0 },
            { text: "Yes, saved in phone", score: 1 },
            { text: "Some saved, but not all", score: 2 },
            { text: "No, I don't have them organized", score: 3 }
          ]
        },
        {
          id: 2,
          question: "How prepared are you for a medical emergency?",
          options: [
            { text: "Very prepared, I know first aid and have supplies", score: 0 },
            { text: "Somewhat prepared, I know basic first aid", score: 1 },
            { text: "Not very prepared, I'd call for help immediately", score: 2 },
            { text: "Not prepared at all", score: 3 }
          ]
        },
        {
          id: 3,
          question: "Do you have an emergency kit or go-bag prepared?",
          options: [
            { text: "Yes, fully stocked and updated regularly", score: 0 },
            { text: "Yes, but it's basic", score: 1 },
            { text: "No, but I know what to include", score: 2 },
            { text: "No, I've never thought about it", score: 3 }
          ]
        },
        {
          id: 4,
          question: "How familiar are you with your local emergency evacuation routes?",
          options: [
            { text: "Very familiar, I know multiple routes", score: 0 },
            { text: "Somewhat familiar with main routes", score: 1 },
            { text: "Not very familiar, I'd need to look them up", score: 2 },
            { text: "Not familiar at all", score: 3 }
          ]
        },
        {
          id: 5,
          question: "Do you have a family emergency plan?",
          options: [
            { text: "Yes, detailed and practiced regularly", score: 0 },
            { text: "Yes, basic plan exists", score: 1 },
            { text: "No, but I've discussed it with family", score: 2 },
            { text: "No, we've never discussed emergency plans", score: 3 }
          ]
        }
      ],
      getResult: (score) => {
        if (score <= 5) {
          return {
            level: "Well Prepared",
            description: "You're excellently prepared for emergencies.",
            color: "#4CAF50",
            recommendations: [
              "Keep your emergency supplies updated",
              "Consider helping others prepare",
              "Stay informed about local emergency procedures"
            ]
          };
        } else if (score <= 10) {
          return {
            level: "Moderately Prepared",
            description: "You have basic emergency preparedness but could improve.",
            color: "#FF9800",
            recommendations: [
              "Assemble an emergency kit",
              "Learn basic first aid skills",
              "Create a family emergency plan"
            ]
          };
        } else {
          return {
            level: "Under Prepared",
            description: "Emergency preparedness is crucial for safety.",
            color: "#F44336",
            recommendations: [
              "Start with saving emergency contact numbers",
              "Learn CPR and basic first aid",
              "Prepare an emergency kit with essentials",
              "Create and practice an emergency plan"
            ]
          };
        }
      },
      reflectiveTip: "Preparation turns panic into action. Being ready for emergencies gives you control in uncertain situations."
    }
  },
  crisis: {
    title: "Crisis Preparedness Test",
    description: "Evaluate your ability to handle crisis situations and access support.",
    assessment: {
      questions: [
        {
          id: 1,
          question: "How confident are you in recognizing signs of a personal crisis?",
          options: [
            { text: "Very confident, I know my triggers and warning signs", score: 0 },
            { text: "Somewhat confident, I recognize some signs", score: 1 },
            { text: "Not very confident, I'm not sure what to look for", score: 2 },
            { text: "Not confident at all", score: 3 }
          ]
        },
        {
          id: 2,
          question: "Do you have a crisis plan or coping strategy?",
          options: [
            { text: "Yes, detailed plan with multiple strategies", score: 0 },
            { text: "Yes, I have some coping strategies", score: 1 },
            { text: "No, but I know where to get help", score: 2 },
            { text: "No, I don't have any plan", score: 3 }
          ]
        },
        {
          id: 3,
          question: "How accessible are mental health crisis resources to you?",
          options: [
            { text: "Very accessible, I have numbers saved and know how to use them", score: 0 },
            { text: "Somewhat accessible, I know some resources", score: 1 },
            { text: "Not very accessible, I'd need to search", score: 2 },
            { text: "Not accessible, I don't know where to turn", score: 3 }
          ]
        },
        {
          id: 4,
          question: "How comfortable are you asking for help during a crisis?",
          options: [
            { text: "Very comfortable, I know who to call", score: 0 },
            { text: "Somewhat comfortable, with some people", score: 1 },
            { text: "Uncomfortable, but I would if desperate", score: 2 },
            { text: "Very uncomfortable, I'd try to handle it alone", score: 3 }
          ]
        },
        {
          id: 5,
          question: "Do you have trusted people you can turn to in a crisis?",
          options: [
            { text: "Yes, multiple people I can rely on", score: 0 },
            { text: "Yes, a few trusted people", score: 1 },
            { text: "Maybe one or two", score: 2 },
            { text: "No, I don't have anyone I can turn to", score: 3 }
          ]
        }
      ],
      getResult: (score) => {
        if (score <= 5) {
          return {
            level: "Well Prepared for Crisis",
            description: "You have strong crisis management skills and support systems.",
            color: "#4CAF50",
            recommendations: [
              "Continue building your support network",
              "Consider becoming a peer support person",
              "Share your coping strategies with others"
            ]
          };
        } else if (score <= 10) {
          return {
            level: "Moderately Prepared",
            description: "You have some crisis preparedness but could strengthen your resources.",
            color: "#FF9800",
            recommendations: [
              "Develop a personal crisis plan",
              "Build stronger support connections",
              "Learn more about crisis resources"
            ]
          };
        } else {
          return {
            level: "Under Prepared for Crisis",
            description: "Building crisis preparedness is essential for mental health.",
            color: "#F44336",
            recommendations: [
              "Identify trusted people for support",
              "Save crisis hotline numbers",
              "Learn about available mental health resources",
              "Consider professional counseling"
            ]
          };
        }
      },
      reflectiveTip: "Everyone faces crises differently. Having a plan and knowing where to turn makes all the difference."
    }
  },
  community: {
    title: "Community Support Awareness",
    description: "Assess your connection to community resources and support networks.",
    assessment: {
      questions: [
        {
          id: 1,
          question: "How connected do you feel to your local community?",
          options: [
            { text: "Very connected, I participate regularly", score: 0 },
            { text: "Somewhat connected, I know some people", score: 1 },
            { text: "Not very connected, I keep to myself", score: 2 },
            { text: "Not connected at all, I feel isolated", score: 3 }
          ]
        },
        {
          id: 2,
          question: "Are you aware of women's support groups or organizations in your area?",
          options: [
            { text: "Yes, I participate in several", score: 0 },
            { text: "Yes, I'm aware and have contacted some", score: 1 },
            { text: "Somewhat, I've heard of a few", score: 2 },
            { text: "No, I'm not aware of any", score: 3 }
          ]
        },
        {
          id: 3,
          question: "How often do you engage with online support communities?",
          options: [
            { text: "Regularly, they're an important part of my support", score: 0 },
            { text: "Sometimes, when I need specific advice", score: 1 },
            { text: "Rarely, I prefer in-person support", score: 2 },
            { text: "Never, I don't use online communities", score: 3 }
          ]
        },
        {
          id: 4,
          question: "Do you know about community centers or resources for women?",
          options: [
            { text: "Yes, I use them regularly", score: 0 },
            { text: "Yes, I'm aware of them", score: 1 },
            { text: "Somewhat, I've heard of some", score: 2 },
            { text: "No, I'm not aware of local resources", score: 3 }
          ]
        },
        {
          id: 5,
          question: "How comfortable are you participating in community events or groups?",
          options: [
            { text: "Very comfortable, I enjoy it", score: 0 },
            { text: "Somewhat comfortable, with familiar groups", score: 1 },
            { text: "Uncomfortable, but I would try", score: 2 },
            { text: "Very uncomfortable, I avoid groups", score: 3 }
          ]
        }
      ],
      getResult: (score) => {
        if (score <= 5) {
          return {
            level: "Strong Community Connection",
            description: "You have excellent community support and engagement.",
            color: "#4CAF50",
            recommendations: [
              "Continue your community involvement",
              "Consider leadership roles in support groups",
              "Help others find community resources"
            ]
          };
        } else if (score <= 10) {
          return {
            level: "Moderate Community Connection",
            description: "You have some community connections but could expand your network.",
            color: "#FF9800",
            recommendations: [
              "Join local women's groups or organizations",
              "Attend community events",
              "Connect with online support communities"
            ]
          };
        } else {
          return {
            level: "Limited Community Connection",
            description: "Building community connections can provide valuable support.",
            color: "#F44336",
            recommendations: [
              "Research local women's organizations",
              "Start with online support communities",
              "Attend community events or workshops",
              "Consider joining support groups"
            ]
          };
        }
      },
      reflectiveTip: "Community support is a powerful resource. Connecting with others who understand your experiences can be transformative."
    }
  }
};

const ASSESSMENT_BADGES = {
  safetyPrepared: { title: "Safety Prepared", description: "Completed safety confidence assessment", icon: "🛡️" },
  legallyEmpowered: { title: "Legally Empowered", description: "Completed legal readiness assessment", icon: "⚖️" },
  stressResilient: { title: "Stress Resilient", description: "Completed mood & stress assessment", icon: "🧘" },
  emergencyReady: { title: "Emergency Ready", description: "Completed emergency preparedness", icon: "🚨" },
  crisisPrepared: { title: "Crisis Prepared", description: "Completed crisis preparedness", icon: "🆘" },
  communityConnected: { title: "Community Connected", description: "Completed community support awareness", icon: "🤝" },
  assessmentExplorer: { title: "Assessment Explorer", description: "Completed 3+ assessments", icon: "🔍" },
  wellnessWarrior: { title: "Wellness Warrior", description: "Completed all assessments", icon: "⭐" }
};

const ASSESSMENT_STORAGE_KEY = "safeher_assessment_progress";

export default function Assessment() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState({});
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setProgress(data.progress || {});
      setBadges(data.badges || []);
    }
  }, []);

  const saveProgress = (newProgress, newBadges) => {
    const data = { progress: newProgress, badges: newBadges };
    localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(data));
    setProgress(newProgress);
    setBadges(newBadges);
  };

  const checkBadges = (updatedProgress) => {
    const newBadges = [...badges];

    // Category completion badges
    const categories = Object.keys(ASSESSMENT_CATEGORIES);
    categories.forEach(cat => {
      if (updatedProgress[cat] && !newBadges.includes(`${cat}Prepared`)) {
        const badgeKey = cat === 'safety' ? 'safetyPrepared' :
                         cat === 'legal' ? 'legallyEmpowered' :
                         cat === 'mood' ? 'stressResilient' :
                         cat === 'emergency' ? 'emergencyReady' :
                         cat === 'crisis' ? 'crisisPrepared' : 'communityConnected';
        newBadges.push(badgeKey);
      }
    });

    // Assessment Explorer (3+ assessments)
    const totalCompleted = Object.values(updatedProgress).filter(Boolean).length;
    if (totalCompleted >= 3 && !newBadges.includes('assessmentExplorer')) {
      newBadges.push('assessmentExplorer');
    }

    // Wellness Warrior (all assessments)
    if (totalCompleted === categories.length && !newBadges.includes('wellnessWarrior')) {
      newBadges.push('wellnessWarrior');
    }

    return newBadges;
  };

  const startAssessment = (category) => {
    setSelectedCategory(category);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswer = (questionId, score) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const nextQuestion = () => {
    const questions = ASSESSMENT_CATEGORIES[selectedCategory].assessment.questions;
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      // Update progress
      const updatedProgress = { ...progress, [selectedCategory]: true };
      const newBadges = checkBadges(updatedProgress);
      saveProgress(updatedProgress, newBadges);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetAssessment = () => {
    setSelectedCategory(null);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, score) => sum + score, 0);
  };

  const getSmartSuggestions = (category, score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    const suggestions = [];

    if (percentage > 60) {
      if (category === 'safety') {
        suggestions.push({
          title: "Advanced Safety Workshops",
          link: "#/resources?safety"
        });
      } else if (category === 'legal') {
        suggestions.push({
          title: "Legal Rights Advocacy Groups",
          link: "#/resources?legal"
        });
      } else if (category === 'mood') {
        suggestions.push({
          title: "Stress Management Courses",
          link: "#/resources?health"
        });
      } else if (category === 'emergency') {
        suggestions.push({
          title: "First Aid Certification",
          link: "#/health"
        });
      } else if (category === 'crisis') {
        suggestions.push({
          title: "Mental Health Support Groups",
          link: "#/helplines"
        });
      } else if (category === 'community') {
        suggestions.push({
          title: "Community Leadership Programs",
          link: "#/resources"
        });
      }
    }

    return suggestions;
  };

  const renderCategorySelection = () => (
    <div className="assessment-categories">
      <h1>Self-Assessments</h1>
      <p>Take assessments to understand your strengths and areas for growth. Earn badges as you progress!</p>

      <div className="progress-summary">
        <h3>Your Assessment Progress</h3>
        <p>You've completed {Object.values(progress).filter(Boolean).length} assessments</p>
        {badges.length > 0 && (
          <div className="badges-display">
            <h4>Your Assessment Badges:</h4>
            <div className="badge-list">
              {badges.map(badge => (
                <span key={badge} className="badge" title={ASSESSMENT_BADGES[badge].description}>
                  {ASSESSMENT_BADGES[badge].icon} {ASSESSMENT_BADGES[badge].title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="category-grid">
        {Object.entries(ASSESSMENT_CATEGORIES).map(([key, category]) => (
          <div key={key} className="category-card">
            <h3>{category.title}</h3>
            <p>{category.description}</p>
            <div className="category-status">
              {progress[key] ? (
                <span className="completed-status">✓ Completed</span>
              ) : (
                <span className="pending-status">Not Started</span>
              )}
            </div>
            <button
              className={`assessment-btn ${progress[key] ? 'completed' : ''}`}
              onClick={() => startAssessment(key)}
            >
              {progress[key] ? 'Retake Assessment' : 'Start Assessment'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssessment = () => {
    const category = ASSESSMENT_CATEGORIES[selectedCategory];
    const questions = category.assessment.questions;
    const currentQ = questions[currentQuestion];
    const isAnswered = answers[currentQ.id] !== undefined;
    const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="assessment-taking">
        <div className="assessment-header">
          <button className="back-btn" onClick={resetAssessment}>← Back to Assessments</button>
          <h1>{category.title}</h1>
        </div>

        {!showResults ? (
          <div className="assessment-content">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="progress-text">
              Question {currentQuestion + 1} of {questions.length}
            </div>

            <div className="question-card">
              <h2>{currentQ.question}</h2>

              <div className="options">
                {currentQ.options.map((option, index) => (
                  <label key={index} className="option">
                    <input
                      type="radio"
                      name={`question-${currentQ.id}`}
                      value={option.score}
                      checked={answers[currentQ.id] === option.score}
                      onChange={() => handleAnswer(currentQ.id, option.score)}
                    />
                    <span className="option-text">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="navigation-buttons">
              <button
                className="btn secondary"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>

              <button
                className="btn primary"
                onClick={nextQuestion}
                disabled={!isAnswered}
              >
                {currentQuestion === questions.length - 1 ? 'Get Results' : 'Next'}
              </button>
            </div>
          </div>
        ) : (
          <div className="assessment-results">
            <h1>Your Assessment Results</h1>

            {(() => {
              const totalScore = calculateScore();
              const maxScore = questions.length * 3;
              const result = category.assessment.getResult(totalScore);

              return (
                <div className="result-card" style={{ borderColor: result.color }}>
                  <div className="result-header">
                    <h2 style={{ color: result.color }}>{result.level}</h2>
                    <div className="score-display">
                      <span className="score-number">{totalScore}</span>
                      <span className="score-max">/ {maxScore}</span>
                    </div>
                  </div>

                  <p className="result-description">{result.description}</p>

                  <div className="recommendations">
                    <h3>Recommended Actions:</h3>
                    <ul>
                      {result.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="reflective-tip">
                    <h4>🤔 Reflective Thought:</h4>
                    <p>{category.assessment.reflectiveTip}</p>
                  </div>

                  {(() => {
                    const suggestions = getSmartSuggestions(selectedCategory, totalScore, maxScore);
                    return suggestions.length > 0 && (
                      <div className="smart-suggestions">
                        <h4>📚 Recommended Resources:</h4>
                        {suggestions.map((suggestion, index) => (
                          <a key={index} href={suggestion.link} className="suggestion-link">
                            {suggestion.title}
                          </a>
                        ))}
                      </div>
                    );
                  })()}

                  <div className="resources-section">
                    <h3>Helpful Resources:</h3>
                    <div className="resource-links">
                      <a href="#/resources" className="resource-link">
                        Resource Hub
                      </a>
                      <a href="#/helplines" className="resource-link">
                        Support Helplines
                      </a>
                      <a href="#/health" className="resource-link">
                        Health & Wellness
                      </a>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="result-actions">
              <button className="btn secondary" onClick={() => startAssessment(selectedCategory)}>
                Retake Assessment
              </button>
              <button className="btn primary" onClick={resetAssessment}>
                Back to Assessments
              </button>
            </div>

            <div className="disclaimer">
              <p><strong>Disclaimer:</strong> This assessment is for informational purposes only and does not constitute professional advice. For personalized guidance, please consult qualified professionals.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="assessment-page">
      <UserHeader />
      <main className="assessment-container">
        {!selectedCategory ? renderCategorySelection() : renderAssessment()}
      </main>
      <Footer />
    </div>
  );
}
