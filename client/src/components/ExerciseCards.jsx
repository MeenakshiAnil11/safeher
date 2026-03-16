import React, { useState } from 'react';
import { FaClock, FaBolt, FaSmile, FaDumbbell, FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './ExerciseCards.css';

const ExerciseCards = ({ currentPhase }) => {
  // Exercise database with phase-specific exercises
  const exercises = {
    menstrual: [
      {
        id: 1,
        name: "Gentle Yoga Flow",
        phases: ["Menstrual", "Luteal"],
        intensity: "Low Intensity",
        duration: "20 mins",
        energyLevel: "Low Energy",
        mood: "Calming",
        equipment: "Yoga Mat",
        steps: [
          "Start in a comfortable seated position",
          "Move through gentle cat-cow stretches",
          "Flow into child's pose and hold for 5 breaths",
          "Transition to downward dog",
          "End with savasana for relaxation"
        ]
      },
      {
        id: 2,
        name: "Restorative Stretching",
        phases: ["Menstrual"],
        intensity: "Low Intensity",
        duration: "15 mins",
        energyLevel: "Low Energy",
        mood: "Relaxing",
        equipment: "Yoga Mat",
        steps: [
          "Begin with gentle neck rolls",
          "Stretch your shoulders and upper back",
          "Perform seated forward folds",
          "Include gentle hip openers",
          "Finish with deep breathing"
        ]
      },
      {
        id: 3,
        name: "Light Walking",
        phases: ["Menstrual", "Luteal"],
        intensity: "Low Intensity",
        duration: "30 mins",
        energyLevel: "Low Energy",
        mood: "Energizing",
        equipment: "Comfortable Shoes",
        steps: [
          "Start with a 5-minute warm-up walk",
          "Maintain a comfortable pace",
          "Focus on deep breathing",
          "Take breaks if needed",
          "Cool down with gentle stretches"
        ]
      },
      {
        id: 4,
        name: "Meditation & Breathing",
        phases: ["Menstrual"],
        intensity: "Very Low Intensity",
        duration: "10 mins",
        energyLevel: "Restorative",
        mood: "Calming",
        equipment: "None",
        steps: [
          "Find a quiet, comfortable space",
          "Sit or lie down comfortably",
          "Focus on your breath",
          "Practice deep belly breathing",
          "End with gentle stretches"
        ]
      },
      {
        id: 5,
        name: "Swimming",
        phases: ["Menstrual"],
        intensity: "Low Intensity",
        duration: "25 mins",
        energyLevel: "Low Energy",
        mood: "Refreshing",
        equipment: "Swimsuit",
        steps: [
          "Start with gentle warm-up strokes",
          "Swim at a comfortable pace",
          "Focus on smooth, controlled movements",
          "Take breaks as needed",
          "End with gentle stretches"
        ]
      }
    ],
    follicular: [
      {
        id: 6,
        name: "Strength Training",
        phases: ["Follicular"],
        intensity: "Moderate to High Intensity",
        duration: "45 mins",
        energyLevel: "High Energy",
        mood: "Empowering",
        equipment: "Weights or Resistance Bands",
        steps: [
          "Warm up with 5 minutes of light cardio",
          "Perform 3 sets of squats (12 reps)",
          "Do 3 sets of push-ups (10 reps)",
          "Include 3 sets of lunges (10 each leg)",
          "Cool down with stretching"
        ]
      },
      {
        id: 7,
        name: "Cardio Blast",
        phases: ["Follicular"],
        intensity: "High Intensity",
        duration: "30 mins",
        energyLevel: "High Energy",
        mood: "Energizing",
        equipment: "None",
        steps: [
          "Start with 5-minute warm-up",
          "Alternate between jogging and sprinting",
          "Include jumping jacks and burpees",
          "Maintain high intensity intervals",
          "Cool down with walking and stretching"
        ]
      },
      {
        id: 8,
        name: "HIIT Workout",
        phases: ["Follicular", "Ovulation"],
        intensity: "High Intensity",
        duration: "25 mins",
        energyLevel: "High Energy",
        mood: "Challenging",
        equipment: "None",
        steps: [
          "Warm up for 3 minutes",
          "30 seconds high intensity, 30 seconds rest",
          "Repeat for 20 minutes",
          "Include various exercises (burpees, mountain climbers)",
          "Cool down with stretching"
        ]
      },
      {
        id: 9,
        name: "Power Yoga",
        phases: ["Follicular"],
        intensity: "Moderate Intensity",
        duration: "40 mins",
        energyLevel: "Moderate Energy",
        mood: "Balancing",
        equipment: "Yoga Mat",
        steps: [
          "Begin with sun salutations",
          "Flow through warrior poses",
          "Include balance poses",
          "Add strength-building sequences",
          "End with savasana"
        ]
      },
      {
        id: 10,
        name: "Cycling",
        phases: ["Follicular"],
        intensity: "Moderate Intensity",
        duration: "35 mins",
        energyLevel: "Moderate Energy",
        mood: "Invigorating",
        equipment: "Bicycle",
        steps: [
          "Start with 5-minute warm-up",
          "Maintain steady pace",
          "Include intervals of higher intensity",
          "Focus on proper form",
          "Cool down gradually"
        ]
      }
    ],
    ovulation: [
      {
        id: 11,
        name: "Peak Performance HIIT",
        phases: ["Ovulation"],
        intensity: "Very High Intensity",
        duration: "30 mins",
        energyLevel: "Peak Energy",
        mood: "Challenging",
        equipment: "None",
        steps: [
          "Dynamic warm-up (5 minutes)",
          "High-intensity intervals (20 minutes)",
          "Include plyometric exercises",
          "Push your limits safely",
          "Cool down and stretch"
        ]
      },
      {
        id: 12,
        name: "Dance Cardio",
        phases: ["Ovulation"],
        intensity: "High Intensity",
        duration: "35 mins",
        energyLevel: "High Energy",
        mood: "Fun & Energetic",
        equipment: "None",
        steps: [
          "Warm up with light movements",
          "Follow dance routines",
          "Keep moving continuously",
          "Enjoy the music and rhythm",
          "Cool down with stretching"
        ]
      },
      {
        id: 13,
        name: "Cross-Training",
        phases: ["Ovulation"],
        intensity: "High Intensity",
        duration: "40 mins",
        energyLevel: "High Energy",
        mood: "Varied",
        equipment: "Various",
        steps: [
          "Combine different exercise types",
          "Switch between cardio and strength",
          "Keep your body challenged",
          "Maintain high energy output",
          "End with comprehensive stretching"
        ]
      },
      {
        id: 14,
        name: "Running",
        phases: ["Ovulation", "Follicular"],
        intensity: "High Intensity",
        duration: "30 mins",
        energyLevel: "High Energy",
        mood: "Empowering",
        equipment: "Running Shoes",
        steps: [
          "Start with 5-minute walk",
          "Gradually increase to running pace",
          "Maintain steady rhythm",
          "Include speed intervals",
          "Cool down with walking"
        ]
      },
      {
        id: 15,
        name: "Circuit Training",
        phases: ["Ovulation"],
        intensity: "High Intensity",
        duration: "35 mins",
        energyLevel: "High Energy",
        mood: "Dynamic",
        equipment: "Weights",
        steps: [
          "Set up 5-6 exercise stations",
          "Perform each for 45 seconds",
          "Rest 15 seconds between stations",
          "Complete 3-4 rounds",
          "Cool down thoroughly"
        ]
      }
    ],
    luteal: [
      {
        id: 16,
        name: "Restorative Yoga",
        phases: ["Luteal", "Menstrual"],
        intensity: "Low Intensity",
        duration: "30 mins",
        energyLevel: "Low Energy",
        mood: "Calming",
        equipment: "Yoga Mat",
        steps: [
          "Use props for support",
          "Hold poses longer (2-5 minutes)",
          "Focus on relaxation",
          "Include gentle twists",
          "End with extended savasana"
        ]
      },
      {
        id: 17,
        name: "Gentle Pilates",
        phases: ["Luteal"],
        intensity: "Low to Moderate Intensity",
        duration: "25 mins",
        energyLevel: "Moderate Energy",
        mood: "Strengthening",
        equipment: "Yoga Mat",
        steps: [
          "Start with core activation",
          "Perform controlled movements",
          "Focus on form over speed",
          "Include gentle stretches",
          "End with relaxation"
        ]
      },
      {
        id: 18,
        name: "Nature Walk",
        phases: ["Luteal"],
        intensity: "Low Intensity",
        duration: "40 mins",
        energyLevel: "Low Energy",
        mood: "Peaceful",
        equipment: "Comfortable Shoes",
        steps: [
          "Walk at a comfortable pace",
          "Focus on your surroundings",
          "Practice mindful breathing",
          "Take breaks to appreciate nature",
          "End with gentle stretching"
        ]
      },
      {
        id: 19,
        name: "Tai Chi",
        phases: ["Luteal"],
        intensity: "Low Intensity",
        duration: "20 mins",
        energyLevel: "Low Energy",
        mood: "Meditative",
        equipment: "None",
        steps: [
          "Start with warm-up movements",
          "Flow through tai chi forms",
          "Focus on breath and movement",
          "Maintain slow, controlled pace",
          "End with meditation"
        ]
      },
      {
        id: 20,
        name: "Gentle Cardio",
        phases: ["Luteal"],
        intensity: "Low to Moderate Intensity",
        duration: "25 mins",
        energyLevel: "Moderate Energy",
        mood: "Balancing",
        equipment: "None",
        steps: [
          "Start with 5-minute warm-up",
          "Maintain steady, comfortable pace",
          "Listen to your body",
          "Include gentle movements",
          "Cool down gradually"
        ]
      }
    ]
  };

  // Get exercises for current phase
  const getPhaseExercises = () => {
    // Get exercises specifically for current phase
    const phaseExercises = exercises[currentPhase] || [];
    
    // Also include exercises that mention current phase in their phases array
    const allExercises = Object.values(exercises).flat();
    const phaseNameMap = {
      'menstrual': 'Menstrual',
      'follicular': 'Follicular',
      'ovulation': 'Ovulation',
      'luteal': 'Luteal'
    };
    
    const currentPhaseName = phaseNameMap[currentPhase] || currentPhase;
    const multiPhaseExercises = allExercises.filter(ex => 
      ex.phases.some(phase => phase === currentPhaseName)
    );
    
    // Combine and remove duplicates based on exercise id
    const allPhaseExercises = [...phaseExercises, ...multiPhaseExercises];
    const uniqueExercises = allPhaseExercises.filter((ex, index, self) =>
      index === self.findIndex(e => e.id === ex.id)
    );
    
    return uniqueExercises;
  };

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const phaseExercises = getPhaseExercises();

  const currentExercise = phaseExercises[currentCardIndex] || phaseExercises[0];
  const totalCards = phaseExercises.length;

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % totalCards);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  if (!currentExercise) {
    return (
      <div className="exercise-cards-empty">
        <p>No exercises available for {currentPhase} phase. Please check back later!</p>
      </div>
    );
  }

  return (
    <div className="exercise-cards-container">
      <div className="exercise-card">
        {/* Card Header */}
        <div className="exercise-card-header">
          <h2 className="exercise-card-title">{currentExercise.name}</h2>
          <div className="exercise-card-tags">
            <span className="tag tag-phase">{currentExercise.phases.join(" & ")} Phase</span>
            <span className="tag tag-intensity">{currentExercise.intensity}</span>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="exercise-card-instructions">
          <div className="instructions-header">
            <FaHeart className="instructions-icon" />
            <h3>Step-by-Step Instructions</h3>
          </div>
          <ol className="instructions-list">
            {currentExercise.steps.map((step, index) => (
              <li key={index} className="instruction-item">
                <span className="instruction-number">{index + 1}</span>
                <span className="instruction-text">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Information Boxes */}
        <div className="exercise-card-info">
          <div className="info-box">
            <FaClock className="info-icon" style={{ color: '#14b8a6' }} />
            <div className="info-content">
              <span className="info-label">Duration</span>
              <span className="info-value">{currentExercise.duration}</span>
            </div>
          </div>
          <div className="info-box">
            <FaBolt className="info-icon" style={{ color: '#f59e0b' }} />
            <div className="info-content">
              <span className="info-label">Energy Level</span>
              <span className="info-value">{currentExercise.energyLevel}</span>
            </div>
          </div>
          <div className="info-box">
            <FaSmile className="info-icon" style={{ color: '#f59e0b' }} />
            <div className="info-content">
              <span className="info-label">Mood</span>
              <span className="info-value">{currentExercise.mood}</span>
            </div>
          </div>
          <div className="info-box">
            <FaDumbbell className="info-icon" style={{ color: '#f59e0b' }} />
            <div className="info-content">
              <span className="info-label">Equipment</span>
              <span className="info-value">{currentExercise.equipment}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="exercise-card-navigation">
          <button 
            className="nav-button" 
            onClick={prevCard}
            disabled={totalCards <= 1}
            aria-label="Previous exercise"
          >
            <FaChevronLeft />
          </button>
          <span className="card-counter">
            {currentCardIndex + 1} / {totalCards}
          </span>
          <button 
            className="nav-button" 
            onClick={nextCard}
            disabled={totalCards <= 1}
            aria-label="Next exercise"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCards;
