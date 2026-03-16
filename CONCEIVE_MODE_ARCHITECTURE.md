# Conceive Mode - Architecture, Data Flow & AI/ML Implementation Guide

## 📊 Current Architecture Analysis

### Current Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                               │
│                         (React.js)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │   API Calls via /services/api.js            │
        │   - GET  /fertility/logs                    │
        │   - POST /fertility/logs                    │
        │   - GET  /fertility/insights                 │
        └─────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
│                        (Node.js/Express)                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /backend/routes/fertilityRoutes.js                     │   │
│  │  - GET  /logs  → getFertilityLogs                       │   │
│  │  - POST /logs  → createFertilityLog                    │   │
│  │  - GET  /insights → getFertilityInsights                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /backend/controllers/fertilityController.js            │   │
│  │  - Query FertilityLog & Period collections              │   │
│  │  - Calculate statistics (cycle length, etc.)         │   │
│  │  - Predict ovulation & fertile window                  │   │
│  │  - Calculate fertility score                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /backend/models/FertilityLog.js (MongoDB)              │   │
│  │  - User, Date, BBT, Cervical Mucus, Symptoms          │   │
│  │  - Mood, Energy, Stress, Sleep, etc.                    │   │
│  │  - Cycle Day, Phase                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Current Data Model

### FertilityLog Schema (MongoDB)
```javascript
{
  user: ObjectId,           // Link to User
  date: Date,               // Log date
  bbt: Number,              // Basal Body Temperature
  cervicalMucus: String,    // dry/sticky/creamy/watery/egg-white
  cervicalPosition: String, // low/medium/high/soft/firm/open/closed
  ovulationTest: String,   // negative/positive/peak/not-tested
  intercourse: Boolean,
  intercourseTime: String, // Morning/Afternoon/Evening/Night
  symptoms: [{
    name: String,
    intensity: String      // mild/moderate/severe
  }],
  mood: String,            // happy/sad/anxious/irritable/calm/energetic/tired/neutral
  energy: Number,          // 1-10
  stress: Number,         // 1-10
  sleepHours: Number,     // 0-24
  sleepQuality: String,   // poor/fair/good/excellent
  medications: [String],
  supplements: [String],
  notes: String,
  cycleDay: Number,        // Day of cycle (1-28)
  phase: String           // menstrual/follicular/ovulatory/luteal
}
```

## 🔄 How Data Flow SHOULD Work (Recommended)

### 1. Data Collection Flow
```
User Input → Frontend State → API Call → Backend Controller 
  → Data Validation → Database Save → Trigger AI Analysis
  → Return Response → Update Frontend State
```

### 2. Insights Generation Flow
```
Request Insights → Fetch Recent Logs (last 30 days)
  → Calculate Cycle Statistics (average length, variance)
  → Analyze BBT Patterns (temperature shift detection)
  → Detect Ovulation Signals (mucus, position, tests)
  → Predict Fertile Window (5 days before ovulation)
  → Calculate Fertility Score (multi-factor analysis)
  → Generate Personalized Recommendations
  → Return Insights JSON
```

### 3. Real-time Updates
```
User Saves Log → POST /fertility/logs
  → Backend saves to DB
  → Trigger background job to update insights
  → Push WebSocket notification to frontend
  → Frontend auto-refreshes insights tab
```

## 🤖 AI/ML Implementation Opportunities

### Priority 1: Ovulation Prediction (High Impact)

#### Current Implementation (Simple Rule-Based)
```javascript
// Current approach in fertilityController.js
const nextOvulationDate = lastPeriod 
  ? new Date(lastPeriod.startDate + (avgCycleLength - 14) * 24*60*60*1000)
  : new Date(Date.now() + 14 * 24*60*60*1000);
```

#### Recommended ML Approach

**File: `/backend/services/ml/ovulationPredictor.js`**
```javascript
import { TensorFlow } from '@tensorflow/tfjs-node';

export class OvulationPredictor {
  constructor() {
    this.model = null;
    this.loadModel();
  }

  // Train model on user's historical data
  async trainModel(userLogs, userPeriods) {
    // Prepare training data
    const features = userLogs.map(log => [
      log.bbt,
      this.encodeCervicalMucus(log.cervicalMucus),
      log.energy,
      log.mood === 'energetic' ? 1 : 0,
      log.cycleDay
    ]);
    
    // Labels: ovulation day (1) or not (0)
    const labels = userLogs.map(log => 
      log.ovulationTest === 'positive' || log.phase === 'ovulatory' ? 1 : 0
    );
    
    // Build LSTM model for time-series prediction
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [5], units: 32, activation: 'relu' }),
        tf.layers.lstm({ units: 64, returnSequences: true }),
        tf.layers.lstm({ units: 32 }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    await model.fit(features, labels, {
      epochs: 100,
      batchSize: 10
    });
    
    this.model = model;
  }

  // Predict next ovulation day
  async predictOvulation(userId, currentCycleDay) {
    const userLogs = await FertilityLog.find({ user: userId })
      .sort({ date: -1 })
      .limit(28);
    
    if (!this.model) {
      await this.trainModel(userLogs);
    }
    
    // Use last 7 days of data to predict
    const recentFeatures = userLogs.slice(0, 7).map(log => [
      log.bbt || 36.5,
      this.encodeCervicalMucus(log.cervicalMucus),
      log.energy || 5,
      log.mood === 'energetic' ? 1 : 0,
      currentCycleDay
    ]);
    
    const prediction = await this.model.predict(
      tf.tensor2d(recentFeatures)
    ).data();
    
    // Convert prediction to probability
    const ovulationProbability = prediction[0];
    const daysUntilOvulation = this.probabilityToDays(ovulationProbability);
    
    return {
      predictedOvulationDate: this.calculateDate(currentCycleDay, daysUntilOvulation),
      fertilityWindow: this.calculateFertileWindow(daysUntilOvulation),
      confidence: ovulationProbability
    };
  }

  encodeCervicalMucus(type) {
    const encoding = {
      'none': 0, 'dry': 1, 'sticky': 2, 'creamy': 3, 
      'watery': 4, 'egg-white': 5
    };
    return encoding[type] || 0;
  }
}
```

**Integration in Controller:**
```javascript
// Add to /backend/controllers/fertilityController.js
import { OvulationPredictor } from '../services/ml/ovulationPredictor.js';

const predictor = new OvulationPredictor();

export const getFertilityInsights = async (req, res) => {
  // ... existing code ...
  
  // ADD ML Prediction
  const mlPrediction = await predictor.predictOvulation(
    req.userId,
    insights.cycleDay
  );
  
  insights.mlPrediction = {
    ovulationDate: mlPrediction.predictedOvulationDate,
    fertilityWindow: mlPrediction.fertilityWindow,
    confidence: mlPrediction.confidence
  };
  
  res.json({ success: true, insights });
};
```

### Priority 2: Fertility Score ML Enhancement (Medium Impact)

**File: `/backend/services/ml/fertilityScoreCalculator.js`**
```javascript
export class FertilityScoreCalculator {
  constructor() {
    this.weights = {
      bbtPattern: 0.25,      // BBT shift detection
      cervicalMucus: 0.20,   // Egg-white mucus frequency
      ovulationTests: 0.15,  // Positive test results
      symptomPattern: 0.15,  // Consistent tracking
      lifestyleFactors: 0.10, // Sleep, stress, energy
      cycleRegularity: 0.15  // Cycle length consistency
    };
  }

  async calculateEnhancedScore(userId, recentLogs) {
    const features = {
      bbtPattern: this.analyzeBBTPattern(recentLogs),
      cervicalMucus: this.analyzeMucusQuality(recentLogs),
      ovulationTests: this.analyzeOvulationTests(recentLogs),
      symptomPattern: this.analyzeSymptomConsistency(recentLogs),
      lifestyleFactors: this.analyzeLifestyle(recentLogs),
      cycleRegularity: await this.analyzeCycleRegularity(userId)
    };

    let score = 50; // Base score

    // BBT Pattern Analysis
    if (features.bbtPattern.hasShift) {
      score += (this.weights.bbtPattern * 100) * features.bbtPattern.confidence;
    }

    // Cervical Mucus Quality
    const fertileMucusDays = recentLogs.filter(
      log => log.cervicalMucus === 'egg-white' || log.cervicalMucus === 'watery'
    ).length;
    score += (this.weights.cervicalMucus * 100) * (fertileMucusDays / 7);

    // Ovulation Tests
    const positiveTests = recentLogs.filter(
      log => log.ovulationTest === 'positive'
    ).length;
    score += (this.weights.ovulationTests * 100) * (positiveTests / recentLogs.length);

    // Symptom Consistency (tracking frequency)
    const trackingConsistency = recentLogs.filter(
      log => log.bbt && log.cervicalMucus !== 'none'
    ).length / recentLogs.length;
    score += (this.weights.symptomPattern * 100) * trackingConsistency;

    // Lifestyle Factors (sleep, stress, energy)
    const avgSleep = recentLogs.reduce((sum, log) => sum + (log.sleepHours || 0), 0) / recentLogs.length;
    const avgStress = recentLogs.reduce((sum, log) => sum + (log.stress || 5), 0) / recentLogs.length;
    const avgEnergy = recentLogs.reduce((sum, log) => sum + (log.energy || 5), 0) / recentLogs.length;
    
    const lifestyleScore = (
      (avgSleep >= 7 ? 0.33 : 0) +
      (avgStress <= 5 ? 0.33 : 0) +
      (avgEnergy >= 6 ? 0.34 : 0)
    );
    score += (this.weights.lifestyleFactors * 100) * lifestyleScore;

    // Cycle Regularity (from period tracking data)
    const regularityScore = features.cycleRegularity;
    score += (this.weights.cycleRegularity * 100) * regularityScore;

    return {
      overallScore: Math.min(100, Math.round(score)),
      breakdown: features,
      recommendations: this.generateRecommendations(features)
    };
  }

  analyzeBBTPattern(logs) {
    // Detect temperature shift (indicator of ovulation)
    const bbtValues = logs
      .filter(log => log.bbt)
      .map(log => log.bbt)
      .sort((a, b) => b - a);
    
    const tempShift = bbtValues[0] - bbtValues[bbtValues.length - 1];
    
    return {
      hasShift: tempShift >= 0.3,  // 0.3°C shift is significant
      shift: tempShift,
      confidence: tempShift >= 0.5 ? 1.0 : tempShift / 0.5
    };
  }

  analyzeMucusQuality(logs) {
    const fertileDays = logs.filter(
      log => log.cervicalMucus === 'egg-white' || log.cervicalMucus === 'watery'
    ).length;
    
    return fertileDays > 0;
  }

  generateRecommendations(features) {
    const recommendations = [];
    
    if (!features.bbtPattern.hasShift) {
      recommendations.push("Track BBT consistently to detect ovulation");
    }
    
    if (features.cervicalMucus < 2) {
      recommendations.push("Monitor cervical mucus daily during fertile window");
    }
    
    if (features.lifestyleFactors < 0.6) {
      recommendations.push("Improve sleep quality and reduce stress levels");
    }
    
    return recommendations;
  }
}
```

### Priority 3: Symptom Pattern Recognition (Low-Impact but Valuable)

**File: `/backend/services/ml/symptomAnalyzer.js`**
```javascript
export class SymptomAnalyzer {
  // Identify recurring symptoms that correlate with cycle phase
  async analyzeSymptomPatterns(userLogs) {
    const symptomFrequency = {};
    const phaseMap = {
      'menstrual': [0, 1, 2, 3, 4],
      'follicular': [5, 6, 7, 8, 9, 10, 11, 12, 13],
      'ovulatory': [14, 15, 16],
      'luteal': [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
    };

    userLogs.forEach(log => {
      log.symptoms?.forEach(symptom => {
        const phase = this.getPhaseByCycleDay(log.cycleDay);
        
        if (!symptomFrequency[symptom.name]) {
          symptomFrequency[symptom.name] = {
            total: 0,
            byPhase: { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 0 }
          };
        }
        
        symptomFrequency[symptom.name].total++;
        symptomFrequency[symptom.name].byPhase[phase]++;
      });
    });

    // Find patterns: symptoms that occur >50% of the time in a specific phase
    const patterns = [];
    Object.entries(symptomFrequency).forEach(([symptom, data]) => {
      Object.entries(data.byPhase).forEach(([phase, count]) => {
        if (count / data.total > 0.5 && data.total >= 3) {
          patterns.push({
            symptom,
            phase,
            frequency: count / data.total,
            totalOccurrences: count
          });
        }
      });
    });

    return patterns;
  }

  getPhaseByCycleDay(cycleDay) {
    if (cycleDay <= 4) return 'menstrual';
    if (cycleDay <= 13) return 'follicular';
    if (cycleDay <= 16) return 'ovulatory';
    return 'luteal';
  }
}
```

## 📋 Recommended Implementation Plan

### Phase 1: Basic ML Features (Weeks 1-2)
1. ✅ Implement BBT pattern analysis
2. ✅ Enhance fertility score calculation with ML weights
3. ✅ Add symptom pattern recognition
4. ✅ Update insights endpoint to include ML predictions

### Phase 2: Advanced Predictions (Weeks 3-4)
1. 🔄 Implement ovulation prediction model
2. 🔄 Add fertile window probability calculation
3. 🔄 Create personalized recommendation engine
4. 🔄 Add fertility trend analysis over time

### Phase 3: AI Chatbot Integration (Weeks 5-6)
1. 📝 Add AI chatbot for fertility questions
2. 📝 Implement natural language processing for journal entries
3. 📝 Add sentiment analysis for mood patterns

## 🗂️ File Structure Recommendations

```
backend/
├── controllers/
│   └── fertilityController.js    (✅ exists)
├── models/
│   ├── FertilityLog.js            (✅ exists)
│   └── Period.js                  (✅ exists)
├── services/
│   └── ml/                        (🆕 Create this)
│       ├── ovulationPredictor.js
│       ├── fertilityScoreCalculator.js
│       └── symptomAnalyzer.js
├── routes/
│   └── fertilityRoutes.js         (✅ exists)
└── utils/
    ├── cycleCalculator.js         (🆕 Create for cycle calculations)
    └── dataNormalizer.js          (🆕 Create for ML data prep)
```

## 🔧 Integration Steps

### Step 1: Install ML Dependencies
```bash
cd backend
npm install @tensorflow/tfjs-node
npm install ml-matrix
npm install simple-statistics
```

### Step 2: Create ML Service Directory
```bash
mkdir -p backend/services/ml
```

### Step 3: Implement Priority Features
1. Start with `fertilityScoreCalculator.js` (easiest)
2. Then implement `ovulationPredictor.js`
3. Finally add `symptomAnalyzer.js`

### Step 4: Update Controller
Add ML services to existing `fertilityController.js`:
```javascript
import { FertilityScoreCalculator } from '../services/ml/fertilityScoreCalculator.js';
import { OvulationPredictor } from '../services/ml/ovulationPredictor.js';
import { SymptomAnalyzer } from '../services/ml/symptomAnalyzer.js';

const scoreCalculator = new FertilityScoreCalculator();
const ovulationPredictor = new OvulationPredictor();
const symptomAnalyzer = new SymptomAnalyzer();
```

### Step 5: Update Frontend
Update `ConceiveDashboard.jsx` to display ML insights:
- Show confidence scores
- Display ML-generated recommendations
- Add visualizations for BBT patterns
- Show symptom correlations

## 💡 Key Improvements Needed

### Current Limitations
1. ❌ Static fertility score (no ML)
2. ❌ Simple ovulation prediction (fixed 14-day rule)
3. ❌ No pattern recognition
4. ❌ No personalized recommendations
5. ❌ No trend analysis

### With ML Implementation
1. ✅ Dynamic fertility score based on multiple factors
2. ✅ Personalized ovulation prediction per user
3. ✅ Pattern recognition for symptoms, mood, etc.
4. ✅ AI-generated personalized recommendations
5. ✅ Long-term trend analysis and predictions

## 📊 Data Flow Enhancement

### Enhanced Flow with ML
```
User Saves Data → Backend Saves to DB → Trigger ML Analysis
  → Run Ovulation Predictor
  → Calculate Enhanced Fertility Score
  → Analyze Symptom Patterns
  → Generate Personalized Recommendations
  → Update Insights Cache
  → Push Real-time Updates to Frontend
```

## 🎯 Success Metrics

Track these to measure ML effectiveness:
- **Prediction Accuracy**: % of correct ovulation predictions
- **User Engagement**: Logs per user per cycle
- **Fertility Score Correlation**: Compare score to successful conception
- **Recommendation Adoption**: % of users following AI recommendations
- **Cycle Regularity Improvement**: Changes in cycle length variance

## 🚀 Next Steps

1. Start with `fertilityScoreCalculator.js` (Low risk, high value)
2. Test with existing user data
3. A/B test ML vs non-ML insights
4. Gradually add more sophisticated ML models

---

**Ready to implement?** Let me know which feature you'd like to start with!

