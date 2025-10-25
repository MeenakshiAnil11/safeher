import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./quiz.css";

const QUIZ_CATEGORIES = {
  safety: {
    title: "Safety Awareness",
    description: "Learn about personal safety, digital security, and self-defense awareness.",
    quizzes: {
      personalSafety: {
        title: "Personal Safety Basics",
        questions: [
          {
            id: 1,
            question: "Where should you share your live location?",
            options: [
              "With trusted family and friends only",
              "Publicly on social media",
              "With strangers who ask for it",
              "Never share it"
            ],
            answer: 0,
            tip: "Sharing your live location should only be with people you trust completely."
          },
          {
            id: 2,
            question: "What should you do if you feel unsafe in a cab?",
            options: [
              "Stay quiet and hope it gets better",
              "Call the police immediately",
              "Ask the driver to stop and get out",
              "Text your location to a friend"
            ],
            answer: 1,
            tip: "Don't hesitate to call emergency services if you feel threatened."
          },
          {
            id: 3,
            question: "When is it appropriate to use the SOS button?",
            options: [
              "Only in life-threatening situations",
              "Whenever you're feeling anxious",
              "To test if it works",
              "When you need directions"
            ],
            answer: 0,
            tip: "SOS should be used only for genuine emergencies to ensure quick response."
          }
        ],
        reflectiveTip: "Personal safety starts with awareness. Knowing when and how to seek help can make all the difference."
      },
      digitalSafety: {
        title: "Digital Safety Check",
        questions: [
          {
            id: 1,
            question: "How can you verify an emergency message is real?",
            options: [
              "Check the sender's profile picture",
              "Contact the organization directly through official channels",
              "Believe it if it sounds urgent",
              "Forward it to friends to confirm"
            ],
            answer: 1,
            tip: "Always verify emergency messages through official sources."
          },
          {
            id: 2,
            question: "What is a safe social media practice for women?",
            options: [
              "Accept friend requests from strangers",
              "Share personal information publicly",
              "Keep profiles private and limit personal details",
              "Post location in real-time"
            ],
            answer: 2,
            tip: "Privacy settings and limited sharing help maintain online safety."
          },
          {
            id: 3,
            question: "Why is 2FA (Two-Factor Authentication) important?",
            options: [
              "It makes logging in faster",
              "It adds an extra layer of security",
              "It's only for banking apps",
              "It replaces passwords"
            ],
            answer: 1,
            tip: "2FA provides additional protection even if your password is compromised."
          }
        ],
        reflectiveTip: "Digital safety is crucial in today's connected world. Small precautions can prevent big problems."
      },
      safeTravel: {
        title: "Safe Travel Quiz",
        questions: [
          {
            id: 1,
            question: "What is a sign of an unsafe travel situation?",
            options: [
              "Well-lit parking areas",
              "Empty train compartments late at night",
              "Traveling with friends",
              "Using registered taxis"
            ],
            answer: 1,
            tip: "Avoid isolated areas, especially at night."
          },
          {
            id: 2,
            question: "What information should you avoid sharing publicly while traveling?",
            options: [
              "Your destination city",
              "Your exact hotel name and room number",
              "General travel plans",
              "Your return date"
            ],
            answer: 1,
            tip: "Keep specific accommodation details private to avoid unwanted attention."
          },
          {
            id: 3,
            question: "What should you do if someone follows you while traveling?",
            options: [
              "Confront them directly",
              "Go to a crowded, well-lit area",
              "Take a shortcut to lose them",
              "Ignore it and continue"
            ],
            answer: 1,
            tip: "Seek safety in numbers and well-lit areas."
          }
        ],
        reflectiveTip: "Safe travel requires planning and awareness. Trust your instincts and prioritize safety."
      }
    }
  },
  legal: {
    title: "Legal Rights & Awareness",
    description: "Teach users about their legal protections under Indian law.",
    quizzes: {
      knowRights: {
        title: "Know Your Legal Rights",
        questions: [
          {
            id: 1,
            question: "What does POSH Act stand for?",
            options: [
              "Prevention of Sexual Harassment",
              "Protection of Sexual Health",
              "Prevention of Social Harassment",
              "Protection of Social Health"
            ],
            answer: 0,
            tip: "POSH Act protects women from sexual harassment at workplace."
          },
          {
            id: 2,
            question: "Is stalking punishable under Indian law?",
            options: [
              "No, it's not illegal",
              "Only if it involves violence",
              "Yes, under Section 354D IPC",
              "Only in cyber space"
            ],
            answer: 2,
            tip: "Stalking is a criminal offense under Indian law."
          },
          {
            id: 3,
            question: "Can you file an FIR at any police station in India?",
            options: [
              "No, only at your local station",
              "Yes, at any police station",
              "Only with a lawyer",
              "Only for serious crimes"
            ],
            answer: 1,
            tip: "You can file an FIR at any police station, not just your local one."
          }
        ],
        reflectiveTip: "Knowing your legal rights empowers you to seek justice when needed."
      },
      workplaceHarassment: {
        title: "Workplace Harassment Awareness",
        questions: [
          {
            id: 1,
            question: "Who can you report workplace harassment to?",
            options: [
              "Only your immediate supervisor",
              "Internal Complaints Committee (ICC)",
              "Only HR department",
              "External police only"
            ],
            answer: 1,
            tip: "Internal Complaints Committee is the first point of contact for workplace harassment."
          },
          {
            id: 2,
            question: "What is the timeframe to file a complaint under POSH Act?",
            options: [
              "Within 1 year of incident",
              "Within 3 years of incident",
              "No time limit",
              "Within 6 months"
            ],
            answer: 1,
            tip: "Complaints under POSH Act must be filed within 3 years."
          },
          {
            id: 3,
            question: "What happens if harassment continues after complaint?",
            options: [
              "Nothing, complaint is enough",
              "Criminal proceedings can be initiated",
              "Only warning to harasser",
              "Victim loses job"
            ],
            answer: 1,
            tip: "Persistent harassment can lead to criminal charges."
          }
        ],
        reflectiveTip: "Workplace safety is a right. Don't hesitate to report harassment."
      },
      womensLegalSafety: {
        title: "Women's Legal Safety Quiz",
        questions: [
          {
            id: 1,
            question: "Under which law can you seek protection from domestic violence?",
            options: [
              "POSH Act",
              "Protection of Women from Domestic Violence Act, 2005",
              "IPC Section 498A",
              "Equal Remuneration Act"
            ],
            answer: 1,
            tip: "Domestic Violence Act provides civil remedies for protection."
          },
          {
            id: 2,
            question: "What is the punishment for acid attack under Indian law?",
            options: [
              "Up to 7 years imprisonment",
              "Up to 10 years imprisonment",
              "Life imprisonment",
              "Only fine"
            ],
            answer: 0,
            tip: "Acid attacks are punishable with up to 7 years imprisonment."
          },
          {
            id: 3,
            question: "Can marital rape be prosecuted in India?",
            options: [
              "No, it's not recognized",
              "Yes, under IPC Section 375",
              "Only if wife is below 18 years",
              "Only with husband's consent"
            ],
            answer: 2,
            tip: "Marital rape is prosecutable only if wife is below 18 years."
          }
        ],
        reflectiveTip: "Legal knowledge is power. Stay informed about your rights."
      }
    }
  },
  health: {
    title: "Health & Wellness",
    description: "Empower users to monitor physical and mental well-being.",
    quizzes: {
      menstrualHealth: {
        title: "Menstrual Health Knowledge Test",
        questions: [
          {
            id: 1,
            question: "Is it safe to exercise during menstruation?",
            options: [
              "No, it can be harmful",
              "Yes, light exercise is beneficial",
              "Only swimming is allowed",
              "Only if pain is severe"
            ],
            answer: 1,
            tip: "Light exercise can actually help reduce menstrual cramps."
          },
          {
            id: 2,
            question: "What is the normal duration of menstrual cycle?",
            options: [
              "Exactly 28 days",
              "21-35 days",
              "14 days",
              "45 days"
            ],
            answer: 1,
            tip: "Normal cycles range from 21-35 days."
          },
          {
            id: 3,
            question: "When should you seek medical help for period pain?",
            options: [
              "Never, it's normal",
              "If pain is severe and affects daily life",
              "Only if bleeding is heavy",
              "After 3 days of pain"
            ],
            answer: 1,
            tip: "Severe pain that interferes with daily activities needs medical attention."
          }
        ],
        reflectiveTip: "Menstrual health is important. Listen to your body and seek help when needed."
      },
      mentalHealth: {
        title: "Mental Health Awareness Quiz",
        questions: [
          {
            id: 1,
            question: "Which of these is a sign of stress?",
            options: [
              "Feeling energetic all the time",
              "Irritability and mood swings",
              "Sleeping too much",
              "Eating more than usual"
            ],
            answer: 1,
            tip: "Irritability and mood changes are common stress indicators."
          },
          {
            id: 2,
            question: "When should you seek help for mental health?",
            options: [
              "Only if you can't function at all",
              "When symptoms persist and affect your life",
              "Never, it's not serious",
              "Only for physical symptoms"
            ],
            answer: 1,
            tip: "Early intervention is key for mental health issues."
          },
          {
            id: 3,
            question: "What is burnout?",
            options: [
              "Physical exhaustion only",
              "Emotional, physical, and mental exhaustion",
              "Just feeling tired",
              "Work-related stress only"
            ],
            answer: 1,
            tip: "Burnout affects multiple aspects of well-being."
          }
        ],
        reflectiveTip: "Mental health matters. Taking care of your mind is as important as your body."
      },
      nutritionSelfCare: {
        title: "Nutrition & Self-Care Quiz",
        questions: [
          {
            id: 1,
            question: "How much water should you drink daily?",
            options: [
              "1-2 glasses",
              "8-10 glasses (2-3 liters)",
              "Only when thirsty",
              "5 liters"
            ],
            answer: 1,
            tip: "Adequate hydration is crucial for health."
          },
          {
            id: 2,
            question: "How many hours of sleep are recommended for adults?",
            options: [
              "4-5 hours",
              "7-9 hours",
              "10-12 hours",
              "2-3 hours"
            ],
            answer: 1,
            tip: "Quality sleep is essential for physical and mental health."
          },
          {
            id: 3,
            question: "What is mindful eating?",
            options: [
              "Eating quickly",
              "Eating without distractions, savoring food",
              "Eating only healthy food",
              "Eating at fixed times"
            ],
            answer: 1,
            tip: "Mindful eating helps you enjoy food and recognize hunger cues."
          }
        ],
        reflectiveTip: "Self-care includes proper nutrition and rest. Small changes make big differences."
      }
    }
  },
  helpline: {
    title: "Helpline & Support Awareness",
    description: "Make sure every woman knows where and how to get help quickly.",
    quizzes: {
      emergencyNumbers: {
        title: "Emergency Numbers Challenge",
        questions: [
          {
            id: 1,
            question: "What is the national women's helpline number in India?",
            options: ["108", "181", "112", "100"],
            answer: 1,
            tip: "181 is the national women's helpline for support and guidance."
          },
          {
            id: 2,
            question: "Which number should you dial for police emergency?",
            options: ["108", "181", "112", "100"],
            answer: 3,
            tip: "100 is the police emergency number."
          },
          {
            id: 3,
            question: "What is 112?",
            options: [
              "Fire emergency only",
              "Universal emergency number",
              "Medical emergency only",
              "Women's helpline"
            ],
            answer: 1,
            tip: "112 is the universal emergency number for any emergency."
          }
        ],
        reflectiveTip: "Knowing emergency numbers can save lives. Keep them handy."
      },
      supportCenters: {
        title: "Know Your Support Centers",
        questions: [
          {
            id: 1,
            question: "Which organization provides mental health support?",
            options: [
              "Only hospitals",
              "NGOs like MindRoot and iCall",
              "Only family doctors",
              "Only psychiatrists"
            ],
            answer: 1,
            tip: "Various NGOs provide mental health support and counseling."
          },
          {
            id: 2,
            question: "Where can you report cybercrime?",
            options: [
              "Local police station only",
              "cybercrime.gov.in",
              "Only social media platforms",
              "Bank only"
            ],
            answer: 1,
            tip: "Report cybercrimes at cybercrime.gov.in or local police."
          },
          {
            id: 3,
            question: "What is One Stop Centre (OSC)?",
            options: [
              "Shopping center",
              "Medical facility for women victims",
              "Police station",
              "Counseling center"
            ],
            answer: 1,
            tip: "OSC provides medical, legal, and psychological support to women victims."
          }
        ],
        reflectiveTip: "Support systems exist. Knowing where to go is the first step to healing."
      },
      safetyResponse: {
        title: "Safety & Response Quiz",
        questions: [
          {
            id: 1,
            question: "What should you do if a friend needs immediate help?",
            options: [
              "Wait for them to ask",
              "Call emergency services immediately",
              "Try to handle it yourself",
              "Ignore if they're not sure"
            ],
            answer: 1,
            tip: "When in doubt, call emergency services. Better safe than sorry."
          },
          {
            id: 2,
            question: "How can you help someone in domestic violence situation?",
            options: [
              "Confront the abuser",
              "Support them to seek help from authorities",
              "Keep it secret",
              "Tell them to leave immediately"
            ],
            answer: 1,
            tip: "Support victims to access professional help and legal protection."
          },
          {
            id: 3,
            question: "What is the first step in emergency response?",
            options: [
              "Panic",
              "Ensure your safety first",
              "Call everyone you know",
              "Run away immediately"
            ],
            answer: 1,
            tip: "Your safety comes first in any emergency situation."
          }
        ],
        reflectiveTip: "Being able to respond effectively in crises saves lives. Stay calm and act."
      }
    }
  }
};

const BADGES = {
  safetyDefender: { title: "Safety Defender", description: "Completed all safety quizzes", icon: "🛡️" },
  legalAware: { title: "Legal Aware", description: "Completed all legal rights quizzes", icon: "⚖️" },
  healthHero: { title: "Health Hero", description: "Completed all health quizzes", icon: "🏥" },
  supportChampion: { title: "Support Champion", description: "Completed all helpline quizzes", icon: "📞" },
  knowledgeSeeker: { title: "Knowledge Seeker", description: "Completed 5+ quizzes", icon: "📚" },
  awarenessAdvocate: { title: "Awareness Advocate", description: "Completed all quizzes", icon: "🌟" }
};

const STORAGE_KEY = "safeher_quiz_progress";

export default function Quiz() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [progress, setProgress] = useState({});
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setProgress(data.progress || {});
      setBadges(data.badges || []);
    }
  }, []);

  const saveProgress = (newProgress, newBadges) => {
    const data = { progress: newProgress, badges: newBadges };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setProgress(newProgress);
    setBadges(newBadges);
  };

  const checkBadges = (updatedProgress) => {
    const newBadges = [...badges];

    // Category completion badges
    const categories = Object.keys(QUIZ_CATEGORIES);
    categories.forEach(cat => {
      const catQuizzes = Object.keys(QUIZ_CATEGORIES[cat].quizzes);
      const completed = catQuizzes.filter(quiz => updatedProgress[`${cat}_${quiz}`]).length;
      const total = catQuizzes.length;

      if (completed === total) {
        const badgeKey = cat === 'safety' ? 'safetyDefender' :
                         cat === 'legal' ? 'legalAware' :
                         cat === 'health' ? 'healthHero' : 'supportChampion';
        if (!newBadges.includes(badgeKey)) {
          newBadges.push(badgeKey);
        }
      }
    });

    // Knowledge Seeker (5+ quizzes)
    const totalCompleted = Object.values(updatedProgress).filter(Boolean).length;
    if (totalCompleted >= 5 && !newBadges.includes('knowledgeSeeker')) {
      newBadges.push('knowledgeSeeker');
    }

    // Awareness Advocate (all quizzes)
    const allQuizzes = categories.reduce((sum, cat) =>
      sum + Object.keys(QUIZ_CATEGORIES[cat].quizzes).length, 0);
    if (totalCompleted === allQuizzes && !newBadges.includes('awarenessAdvocate')) {
      newBadges.push('awarenessAdvocate');
    }

    return newBadges;
  };

  const startQuiz = (category, quiz) => {
    setSelectedCategory(category);
    setSelectedQuiz(quiz);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  const handleNext = () => {
    const questions = QUIZ_CATEGORIES[selectedCategory].quizzes[selectedQuiz].questions;
    if (selected === questions[current].answer) {
      setScore(score + 1);
    }
    setSelected(null);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
      // Update progress
      const quizKey = `${selectedCategory}_${selectedQuiz}`;
      const updatedProgress = { ...progress, [quizKey]: true };
      const newBadges = checkBadges(updatedProgress);
      saveProgress(updatedProgress, newBadges);
    }
  };

  const resetQuiz = () => {
    setSelectedCategory(null);
    setSelectedQuiz(null);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  const getSmartSuggestions = (category, quizScore, totalQuestions) => {
    const percentage = (quizScore / totalQuestions) * 100;
    const suggestions = [];

    if (percentage < 70) {
      if (category === 'safety') {
        suggestions.push({
          title: "Online Safety Checklist",
          link: "#/resources?safety"
        });
      } else if (category === 'legal') {
        suggestions.push({
          title: "Know Your Legal Rights Guide",
          link: "#/resources?legal"
        });
      } else if (category === 'health') {
        suggestions.push({
          title: "Mental Health Resources",
          link: "#/resources?health"
        });
      } else if (category === 'helpline') {
        suggestions.push({
          title: "Emergency Helplines",
          link: "#/helplines"
        });
      }
    }

    return suggestions;
  };

  const renderCategorySelection = () => (
    <div className="quiz-categories">
      <h1>Knowledge Quizzes</h1>
      <p>Test your awareness and earn badges while learning!</p>

      <div className="progress-summary">
        <h3>Your Progress</h3>
        <p>You've completed {Object.values(progress).filter(Boolean).length} quizzes</p>
        {badges.length > 0 && (
          <div className="badges-display">
            <h4>Your Badges:</h4>
            <div className="badge-list">
              {badges.map(badge => (
                <span key={badge} className="badge" title={BADGES[badge].description}>
                  {BADGES[badge].icon} {BADGES[badge].title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="category-grid">
        {Object.entries(QUIZ_CATEGORIES).map(([key, category]) => {
          const categoryQuizzes = Object.keys(category.quizzes);
          const completed = categoryQuizzes.filter(quiz => progress[`${key}_${quiz}`]).length;
          const total = categoryQuizzes.length;

          return (
            <div key={key} className="category-card">
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <div className="category-progress">
                <span>{completed}/{total} completed</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(completed / total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="quiz-list">
                {Object.entries(category.quizzes).map(([quizKey, quiz]) => (
                  <button
                    key={quizKey}
                    className={`quiz-btn ${progress[`${key}_${quizKey}`] ? 'completed' : ''}`}
                    onClick={() => startQuiz(key, quizKey)}
                  >
                    {quiz.title}
                    {progress[`${key}_${quizKey}`] && <span className="checkmark">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderQuiz = () => {
    const questions = QUIZ_CATEGORIES[selectedCategory].quizzes[selectedQuiz].questions;
    const currentQ = questions[current];

    return (
      <div className="quiz-taking">
        <div className="quiz-header">
          <button className="back-btn" onClick={resetQuiz}>← Back to Categories</button>
          <h1>{QUIZ_CATEGORIES[selectedCategory].quizzes[selectedQuiz].title}</h1>
        </div>

        {!finished ? (
          <div className="quiz-card">
            <h2 className="quiz-question">
              {currentQ.id}. {currentQ.question}
            </h2>
            <div className="quiz-options">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  className={`option-btn ${selected === i ? "selected" : ""}`}
                  onClick={() => setSelected(i)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="quiz-actions">
              <button
                className="btn primary"
                disabled={selected === null}
                onClick={handleNext}
              >
                {current + 1 === questions.length ? "Finish" : "Next"}
              </button>
            </div>
            <p className="quiz-progress">
              Question {current + 1} of {questions.length}
            </p>
          </div>
        ) : (
          <div className="quiz-result">
            <h2>🎉 Quiz Completed!</h2>
            <p>
              You scored <b>{score}</b> out of <b>{questions.length}</b>
            </p>

            {currentQ.tip && (
              <div className="question-tip">
                <h4>💡 Tip for Question {currentQ.id}:</h4>
                <p>{currentQ.tip}</p>
              </div>
            )}

            <div className="reflective-tip">
              <h4>🤔 Reflective Thought:</h4>
              <p>{QUIZ_CATEGORIES[selectedCategory].quizzes[selectedQuiz].reflectiveTip}</p>
            </div>

            {(() => {
              const suggestions = getSmartSuggestions(selectedCategory, score, questions.length);
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

            <div className="result-actions">
              <button className="btn secondary" onClick={() => startQuiz(selectedCategory, selectedQuiz)}>
                Retake Quiz
              </button>
              <button className="btn primary" onClick={resetQuiz}>
                Back to Categories
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="quiz-page">
      <Header />
      <main className="quiz-container">
        {!selectedCategory ? renderCategorySelection() : renderQuiz()}
      </main>
      <Footer />
    </div>
  );
}
