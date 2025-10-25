import React, { useState, useEffect } from "react";
import { FaPlay, FaCheck, FaCalendarAlt, FaDumbbell, FaHeartbeat, FaLeaf, FaWind, FaVideo, FaClock, FaBell, FaSwimmer, FaMusic, FaSpa } from "react-icons/fa";

const exerciseData = {
  menstrual: {
    phase: "Menstrual Phase",
    description: "Days 1-5 of your cycle. Focus on gentle movements to ease cramps and promote relaxation.",
    categories: {
      "Yoga & Stretching": [
        {
          name: "Gentle Yoga Flow",
          duration: "10-15 min",
          difficulty: "Beginner",
          benefits: "Reduces cramps, improves circulation",
          videoUrl: "https://www.youtube.com/embed/WPBi5cgmsL0",
          gif: "https://example.com/yoga.gif"
        },
        {
          name: "Seated Stretches",
          duration: "5-10 min",
          difficulty: "Beginner",
          benefits: "Eases lower back pain, promotes relaxation",
          videoUrl: "https://www.youtube.com/embed/2X78NWuRfJU",
          gif: "https://example.com/stretches.gif"
        }
      ],
      "Strength Training": [
        {
          name: "Light Resistance Band Exercises",
          duration: "10-15 min",
          difficulty: "Beginner",
          benefits: "Maintains muscle tone without strain",
          videoUrl: "https://www.youtube.com/embed/3FAjB3B8A38",
          gif: "https://example.com/light-strength.gif"
        }
      ],
      "Cardio / HIIT": [
        {
          name: "Gentle Walking",
          duration: "15-20 min",
          difficulty: "Beginner",
          benefits: "Light movement to improve mood",
          videoUrl: "https://www.youtube.com/embed/xxa8IdKd8M0",
          gif: "https://example.com/walking.gif"
        }
      ],
      "Relaxation & Breathing": [
        {
          name: "Deep Breathing Exercises",
          duration: "5 min",
          difficulty: "Beginner",
          benefits: "Reduces stress, helps with pain management",
          videoUrl: "https://www.youtube.com/embed/F28MGLlpP90",
          gif: "https://example.com/breathing.gif"
        },
        {
          name: "Progressive Muscle Relaxation",
          duration: "10 min",
          difficulty: "Beginner",
          benefits: "Releases tension, improves sleep quality",
          videoUrl: "https://www.youtube.com/embed/utGa6rqzs3g",
          gif: "https://example.com/pmr.gif"
        },
        {
          name: "Guided Imagery for Pain Relief",
          duration: "15 min",
          difficulty: "Beginner",
          benefits: "Mental distraction from pain, promotes healing",
          videoUrl: "https://www.youtube.com/embed/1vx8iUvfyCY",
          gif: "https://example.com/imagery.gif"
        }
      ],
      "Pilates": [
        {
          name: "Gentle Core Pilates",
          duration: "10 min",
          difficulty: "Beginner",
          benefits: "Strengthens core without strain, improves posture",
          videoUrl: "https://www.youtube.com/embed/8z8P9RwUyQw",
          gif: "https://example.com/gentle-pilates.gif"
        }
      ],
      "Swimming": [
        {
          name: "Light Water Walking",
          duration: "15 min",
          difficulty: "Beginner",
          benefits: "Low-impact cardio, reduces joint stress",
          videoUrl: "https://www.youtube.com/embed/4kK8g6QX5uU",
          gif: "https://example.com/water-walking.gif"
        }
      ],
      "Dance Fitness": [
        {
          name: "Slow Flow Dance",
          duration: "10 min",
          difficulty: "Beginner",
          benefits: "Gentle movement, boosts mood",
          videoUrl: "https://www.youtube.com/embed/IdBESRDwo_8",
          gif: "https://example.com/slow-dance.gif"
        }
      ]
    }
  },
  follicular: {
    phase: "Follicular Phase",
    description: "Days 1-13 of your cycle. Energy levels rise - great time for building strength.",
    categories: {
      "Yoga & Stretching": [
        {
          name: "Energizing Morning Yoga",
          duration: "15-20 min",
          difficulty: "Beginner",
          benefits: "Boosts energy, improves flexibility",
          videoUrl: "https://www.youtube.com/embed/WPBi5cgmsL0",
          gif: "https://example.com/morning-yoga.gif"
        }
      ],
      "Strength Training": [
        {
          name: "Upper Body Strength",
          duration: "20-25 min",
          difficulty: "Intermediate",
          benefits: "Builds muscle, boosts metabolism",
          videoUrl: "https://www.youtube.com/embed/3FAjB3B8A38",
          gif: "https://example.com/upper-body.gif"
        },
        {
          name: "Core Workout",
          duration: "15 min",
          difficulty: "Beginner",
          benefits: "Strengthens core, improves posture",
          videoUrl: "https://www.youtube.com/embed/xsvLYAplbXw",
          gif: "https://example.com/core.gif"
        }
      ],
      "Cardio / HIIT": [
        {
          name: "Light Cardio",
          duration: "20 min",
          difficulty: "Beginner",
          benefits: "Improves cardiovascular health, increases energy",
          videoUrl: "https://www.youtube.com/embed/xxa8IdKd8M0",
          gif: "https://example.com/cardio.gif"
        }
      ],
      "Relaxation & Breathing": [
        {
          name: "Mindful Breathing",
          duration: "5-10 min",
          difficulty: "Beginner",
          benefits: "Reduces stress, enhances focus",
          videoUrl: "https://www.youtube.com/embed/F28MGLlpP90",
          gif: "https://example.com/mindful-breathing.gif"
        },
        {
          name: "Morning Meditation",
          duration: "10 min",
          difficulty: "Beginner",
          benefits: "Sets positive tone for the day, reduces anxiety",
          videoUrl: "https://www.youtube.com/embed/SscZ_TNvhaQ",
          gif: "https://example.com/morning-meditation.gif"
        }
      ],
      "Pilates": [
        {
          name: "Beginner Pilates Flow",
          duration: "15 min",
          difficulty: "Beginner",
          benefits: "Builds core strength, improves flexibility",
          videoUrl: "https://www.youtube.com/embed/8z8P9RwUyQw",
          gif: "https://example.com/pilates-flow.gif"
        }
      ],
      "Swimming": [
        {
          name: "Easy Lap Swimming",
          duration: "20 min",
          difficulty: "Beginner",
          benefits: "Full-body workout, low-impact",
          videoUrl: "https://www.youtube.com/embed/4kK8g6QX5uU",
          gif: "https://example.com/easy-swimming.gif"
        }
      ],
      "Dance Fitness": [
        {
          name: "Energizing Dance Workout",
          duration: "15 min",
          difficulty: "Beginner",
          benefits: "Cardio boost, fun and energizing",
          videoUrl: "https://www.youtube.com/embed/IdBESRDwo_8",
          gif: "https://example.com/energizing-dance.gif"
        }
      ]
    }
  },
  ovulation: {
    phase: "Ovulation Phase",
    description: "Around day 14 of your cycle. Peak energy - time for high-intensity workouts.",
    categories: {
      "Yoga & Stretching": [
        {
          name: "Dynamic Flow Yoga",
          duration: "20-25 min",
          difficulty: "Intermediate",
          benefits: "Builds strength and flexibility",
          videoUrl: "https://www.youtube.com/embed/WPBi5cgmsL0",
          gif: "https://example.com/dynamic-yoga.gif"
        }
      ],
      "Strength Training": [
        {
          name: "Full Body Circuit",
          duration: "30 min",
          difficulty: "Intermediate",
          benefits: "Builds overall strength, increases metabolism",
          videoUrl: "https://www.youtube.com/embed/2xNcUjKLZto",
          gif: "https://example.com/circuit.gif"
        }
      ],
      "Cardio / HIIT": [
        {
          name: "HIIT Workout",
          duration: "25-30 min",
          difficulty: "Intermediate",
          benefits: "Maximizes calorie burn, improves endurance",
          videoUrl: "https://www.youtube.com/embed/tOzf79vSn64",
          gif: "https://example.com/hiit.gif"
        },
        {
          name: "Dance Cardio",
          duration: "20 min",
          difficulty: "Beginner",
          benefits: "Fun way to burn calories, boosts mood",
          videoUrl: "https://www.youtube.com/embed/IdBESRDwo_8",
          gif: "https://example.com/dance.gif"
        }
      ],
      "Relaxation & Breathing": [
        {
          name: "Energy Boosting Breathing",
          duration: "5 min",
          difficulty: "Beginner",
          benefits: "Increases oxygen flow, enhances alertness",
          videoUrl: "https://www.youtube.com/embed/F28MGLlpP90",
          gif: "https://example.com/energy-breathing.gif"
        },
        {
          name: "Power Visualization",
          duration: "10 min",
          difficulty: "Intermediate",
          benefits: "Mental preparation for intense workouts",
          videoUrl: "https://www.youtube.com/embed/1vx8iUvfyCY",
          gif: "https://example.com/visualization.gif"
        }
      ],
      "Pilates": [
        {
          name: "Advanced Pilates",
          duration: "20 min",
          difficulty: "Intermediate",
          benefits: "Builds power and control, enhances athletic performance",
          videoUrl: "https://www.youtube.com/embed/8z8P9RwUyQw",
          gif: "https://example.com/advanced-pilates.gif"
        }
      ],
      "Swimming": [
        {
          name: "Interval Swimming",
          duration: "25 min",
          difficulty: "Intermediate",
          benefits: "High-intensity cardio, builds endurance",
          videoUrl: "https://www.youtube.com/embed/4kK8g6QX5uU",
          gif: "https://example.com/interval-swimming.gif"
        }
      ],
      "Dance Fitness": [
        {
          name: "High-Energy Dance Cardio",
          duration: "20 min",
          difficulty: "Intermediate",
          benefits: "Intense cardio, improves coordination",
          videoUrl: "https://www.youtube.com/embed/IdBESRDwo_8",
          gif: "https://example.com/high-energy-dance.gif"
        }
      ]
    }
  },
  luteal: {
    phase: "Luteal Phase",
    description: "Days 15-28 of your cycle. Energy may fluctuate - focus on moderate activities.",
    categories: {
      "Yoga & Stretching": [
        {
          name: "Restorative Yoga",
          duration: "20 min",
          difficulty: "Beginner",
          benefits: "Reduces PMS symptoms, promotes relaxation",
          videoUrl: "https://www.youtube.com/embed/BR0HW1-Ci3w",
          gif: "https://example.com/restorative.gif"
        },
        {
          name: "Hip Opening Flow",
          duration: "15 min",
          difficulty: "Intermediate",
          benefits: "Eases pelvic tension, improves flexibility",
          videoUrl: "https://www.youtube.com/embed/0MoWmdf3TPA",
          gif: "https://example.com/hip-opening.gif"
        }
      ],
      "Relaxation & Breathing": [
        {
          name: "Meditation for PMS",
          duration: "10 min",
          difficulty: "Beginner",
          benefits: "Manages mood swings, reduces anxiety",
          videoUrl: "https://www.youtube.com/embed/SscZ_TNvhaQ",
          gif: "https://example.com/meditation.gif"
        }
      ],
      "Strength Training": [
        {
          name: "Light Strength Training",
          duration: "15-20 min",
          difficulty: "Beginner",
          benefits: "Maintains muscle tone, supports mood",
          videoUrl: "https://www.youtube.com/embed/3FAjB3B8A38",
          gif: "https://example.com/light-strength-luteal.gif"
        }
      ],
      "Cardio / HIIT": [
        {
          name: "Moderate Cardio",
          duration: "20 min",
          difficulty: "Beginner",
          benefits: "Maintains fitness, helps with bloating",
          videoUrl: "https://www.youtube.com/embed/S4UfZ2TV_uA",
          gif: "https://example.com/moderate-cardio.gif"
        },
        {
          name: "Gentle HIIT",
          duration: "15 min",
          difficulty: "Beginner",
          benefits: "Light intensity cardio, mood booster",
          videoUrl: "https://www.youtube.com/embed/tOzf79vSn64",
          gif: "https://example.com/gentle-hiit.gif"
        }
      ],
      "Pilates": [
        {
          name: "Restorative Pilates",
          duration: "15 min",
          difficulty: "Beginner",
          benefits: "Gentle core work, reduces PMS tension",
          videoUrl: "https://www.youtube.com/embed/8z8P9RwUyQw",
          gif: "https://example.com/restorative-pilates.gif"
        }
      ],
      "Swimming": [
        {
          name: "Relaxing Water Exercises",
          duration: "20 min",
          difficulty: "Beginner",
          benefits: "Soothing movement, reduces swelling",
          videoUrl: "https://www.youtube.com/embed/4kK8g6QX5uU",
          gif: "https://example.com/relaxing-swimming.gif"
        }
      ],
      "Dance Fitness": [
        {
          name: "Calming Dance Flow",
          duration: "15 min",
          difficulty: "Beginner",
          benefits: "Gentle movement, emotional release",
          videoUrl: "https://www.youtube.com/embed/IdBESRDwo_8",
          gif: "https://example.com/calming-dance.gif"
        }
      ]
    }
  }
};

const categories = ["Yoga & Stretching", "Strength Training", "Cardio / HIIT", "Relaxation & Breathing", "Pilates", "Swimming", "Dance Fitness"];

export default function ExerciseRecommendations() {
  const [currentPhase, setCurrentPhase] = useState("menstrual");
  const [selectedCategory, setSelectedCategory] = useState("Yoga & Stretching");
  const [completedExercises, setCompletedExercises] = useState([]);
  const [showDemo, setShowDemo] = useState(null);
  const [exerciseLog, setExerciseLog] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    time: "09:00",
    days: ["monday", "wednesday", "friday"]
  });

  // Load user's cycle data to determine current phase
  useEffect(() => {
    const loadCycleData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/periods/current-phase", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.phase) {
          setCurrentPhase(data.phase.toLowerCase());
        }
      } catch (err) {
        console.error("Failed to load cycle phase:", err);
      }
    };
    loadCycleData();

    // Load completed exercises
    const saved = localStorage.getItem("completedExercises");
    if (saved) {
      setCompletedExercises(JSON.parse(saved));
    }

    // Load favorites
    const savedFavorites = localStorage.getItem("exerciseFavorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load reminder settings
    const reminders = localStorage.getItem("exerciseReminders");
    if (reminders) {
      setReminderSettings(JSON.parse(reminders));
    }

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check for reminders every minute
    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      if (reminderSettings.enabled && reminderSettings.time === currentTime && reminderSettings.days.includes(currentDay)) {
        showReminderNotification();
      }
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [reminderSettings]);

  const markExerciseComplete = (exerciseName, category) => {
    const today = new Date().toISOString().split('T')[0];
    const logEntry = {
      date: today,
      exercise: exerciseName,
      category: category,
      phase: currentPhase,
      completedAt: new Date().toISOString()
    };

    setExerciseLog(prev => ({
      ...prev,
      [today]: [...(prev[today] || []), logEntry]
    }));

    setCompletedExercises(prev => [...prev, exerciseName]);
    localStorage.setItem("completedExercises", JSON.stringify([...completedExercises, exerciseName]));
  };

  const toggleFavorite = (exerciseName) => {
    const newFavorites = favorites.includes(exerciseName)
      ? favorites.filter(fav => fav !== exerciseName)
      : [...favorites, exerciseName];
    setFavorites(newFavorites);
    localStorage.setItem("exerciseFavorites", JSON.stringify(newFavorites));
  };

  const calculateStreak = () => {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (exerciseLog[dateStr] && exerciseLog[dateStr].length > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const saveReminderSettings = () => {
    localStorage.setItem("exerciseReminders", JSON.stringify(reminderSettings));
    alert("Reminder settings saved!");
  };

  const showReminderNotification = () => {
    const phaseMessages = {
      menstrual: "Try light yoga today to ease cramps and promote relaxation! 🌸",
      follicular: "Energy is high - time for strength training or cardio! 💪",
      ovulation: "Peak energy! Try a HIIT workout or dance cardio! 🔥",
      luteal: "Focus on restorative yoga or gentle cardio to manage PMS symptoms. 🧘‍♀️"
    };

    const message = phaseMessages[currentPhase] || "Time for your daily exercise routine! 🏃‍♀️";

    if (Notification.permission === 'granted') {
      new Notification('Exercise Reminder', {
        body: message,
        icon: '/favicon.ico' // You can add an icon
      });
    } else {
      // Fallback: show an alert or in-page notification
      alert(`Exercise Reminder: ${message}`);
    }
  };

  const currentPhaseData = exerciseData[currentPhase];
  const availableCategories = Object.keys(currentPhaseData?.categories || {});
  const allExercises = availableCategories.flatMap(category =>
    currentPhaseData?.categories[category]?.map(exercise => ({ ...exercise, category })) || []
  );
  const selectedExercises = showFavorites
    ? allExercises.filter(exercise => favorites.includes(exercise.name))
    : currentPhaseData?.categories[selectedCategory] || [];

  return (
    <div className="exercise-recommendations">
      {/* Phase Header */}
      <div className="phase-header">
        <div className="phase-info">
          <FaCalendarAlt className="phase-icon" />
          <div>
            <h3>{currentPhaseData?.phase || "Loading..."}</h3>
            <p>{currentPhaseData?.description}</p>
          </div>
        </div>
      </div>

      {/* Favorites Toggle */}
      <div className="favorites-toggle">
        <button
          className={`favorites-btn ${showFavorites ? 'active' : ''}`}
          onClick={() => setShowFavorites(!showFavorites)}
        >
          <FaCheck /> {showFavorites ? 'Show All Exercises' : 'Show Favorites'} ({favorites.length})
        </button>
      </div>

      {/* Category Selection */}
      {!showFavorites && (
        <div className="category-tabs">
          {categories.map(category => {
          const icon = category === "Yoga & Stretching" ? <FaLeaf /> :
                      category === "Strength Training" ? <FaDumbbell /> :
                      category === "Cardio / HIIT" ? <FaHeartbeat /> :
                      category === "Relaxation & Breathing" ? <FaWind /> :
                      category === "Pilates" ? <FaSpa /> :
                      category === "Swimming" ? <FaSwimmer /> :
                      <FaMusic />;
          return (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''} ${!availableCategories.includes(category) ? 'disabled' : ''}`}
              onClick={() => availableCategories.includes(category) && setSelectedCategory(category)}
              disabled={!availableCategories.includes(category)}
            >
              {icon} {category}
            </button>
          );
        })}
        </div>
      )}

      {/* Exercise List */}
      <div className="exercise-grid">
        {selectedExercises.map((exercise, index) => (
          <div key={index} className="exercise-card">
            <div className="exercise-header">
              <h4>{exercise.name}</h4>
              <div className="exercise-meta">
                <span className="duration"><FaClock /> {exercise.duration}</span>
                <span className={`difficulty ${exercise.difficulty.toLowerCase()}`}>
                  {exercise.difficulty}
                </span>
              </div>
            </div>

            <p className="exercise-benefits">{exercise.benefits}</p>

            <div className="exercise-actions">
              <button
                className="demo-btn"
                onClick={() => setShowDemo(showDemo === index ? null : index)}
              >
                <FaVideo /> {showDemo === index ? "Hide Demo" : "View Demo"}
              </button>

              <button
                className={`favorite-btn ${favorites.includes(exercise.name) ? 'favorited' : ''}`}
                onClick={() => toggleFavorite(exercise.name)}
              >
                {favorites.includes(exercise.name) ? '★' : '☆'} Favorite
              </button>

              <button
                className={`complete-btn ${completedExercises.includes(exercise.name) ? 'completed' : ''}`}
                onClick={() => markExerciseComplete(exercise.name, selectedCategory)}
                disabled={completedExercises.includes(exercise.name)}
              >
                <FaCheck /> {completedExercises.includes(exercise.name) ? "Completed" : "Mark Complete"}
              </button>
            </div>

            {showDemo === index && (
              <div className="demo-section">
                <div className="video-container">
                  <iframe
                    width="100%"
                    height="200"
                    src={exercise.videoUrl}
                    title={`${exercise.name} demonstration`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Exercise Log */}
      <div className="exercise-log">
        <h4><FaCheck /> Recent Exercise Log</h4>
        <div className="log-entries">
          {Object.entries(exerciseLog).slice(-7).reverse().map(([date, entries]) => (
            <div key={date} className="log-day">
              <h5>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h5>
              {entries.map((entry, i) => (
                <div key={i} className="log-entry">
                  <span className="exercise-name">{entry.exercise}</span>
                  <span className="exercise-category">{entry.category}</span>
                  <span className="exercise-time">{new Date(entry.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          ))}
          {Object.keys(exerciseLog).length === 0 && (
            <p className="no-log">No exercises logged yet. Complete some exercises to see your progress!</p>
          )}
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="reminder-settings">
        <h4><FaBell /> Exercise Reminders</h4>
        <div className="reminder-form">
          <div className="reminder-toggle">
            <label>
              <input
                type="checkbox"
                checked={reminderSettings.enabled}
                onChange={(e) => setReminderSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              />
              Enable exercise reminders
            </label>
          </div>

          <div className="reminder-time">
            <label>Reminder time:</label>
            <input
              type="time"
              value={reminderSettings.time}
              onChange={(e) => setReminderSettings(prev => ({ ...prev, time: e.target.value }))}
              disabled={!reminderSettings.enabled}
            />
          </div>

          <div className="reminder-days">
            <label>Days to remind:</label>
            <div className="days-checkboxes">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={reminderSettings.days.includes(day)}
                    onChange={(e) => {
                      const newDays = reminderSettings.days.includes(day)
                        ? reminderSettings.days.filter(d => d !== day)
                        : [...reminderSettings.days, day];
                      setReminderSettings(prev => ({ ...prev, days: newDays }));
                    }}
                    disabled={!reminderSettings.enabled}
                  />
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={saveReminderSettings} disabled={!reminderSettings.enabled} style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Save Settings
            </button>
            <button onClick={showReminderNotification} style={{ padding: '8px 16px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Test Reminder
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="weekly-summary">
        <h4>📊 This Week's Progress</h4>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Exercises Completed:</span>
            <span className="stat-value">{completedExercises.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Current Phase:</span>
            <span className="stat-value">{currentPhaseData?.phase}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Recommended Focus:</span>
            <span className="stat-value">{selectedCategory}</span>
          </div>
        </div>
      </div>
    </div>
  );
}