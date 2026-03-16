# Step 4: Using TensorFlow.js in Node.js

Complete guide for loading and using the ML model directly in Node.js (Option B).

---

## 🎯 Overview

This implements **Option B** from the integration guide - loading the TensorFlow.js model directly in Node.js without a Python service.

**Files Created:**
- ✅ `backend/services/ml/ovulationPredictor.js` - TFJS model loader and predictor
- ✅ JSON scaler export in training script
- ✅ Installation instructions

---

## 📦 Installation

### 1. Install Dependencies

```powershell
cd backend
npm install @tensorflow/tfjs-node
```

**Note:** This is an optional dependency. The Flask API approach (Option A) doesn't need it.

### 2. Train and Convert Model

```powershell
cd python

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Train model (saves scaler as JSON)
python train_ovulation_model.py

# Convert to TensorFlow.js format
python convert_to_tfjs.py
```

**Files Created:**
- `models/ovulation_model.h5` (Keras format)
- `models/feature_scaler.pkl` (Python)
- `models/feature_scaler.json` (Node.js)
- `models/tfjs_model/` (TensorFlow.js format)

---

## 🚀 Usage

### Method 1: Using OvulationPredictor Class

```javascript
import { OvulationPredictor, getOvulationPredictor } from './services/ml/ovulationPredictor.js';

// Option A: Get singleton instance
const predictor = getOvulationPredictor();

// Option B: Create new instance
const predictor = new OvulationPredictor();

// Make prediction
const recentLogs = [
  { bbt: 36.2, cervicalMucus: 'dry', ovulationTest: 'negative', cycleDay: 10 },
  { bbt: 36.3, cervicalMucus: 'sticky', ovulationTest: 'negative', cycleDay: 11 },
  { bbt: 36.4, cervicalMucus: 'creamy', ovulationTest: 'negative', cycleDay: 12 },
  { bbt: 36.5, cervicalMucus: 'creamy', ovulationTest: 'negative', cycleDay: 13 },
  { bbt: 36.6, cervicalMucus: 'egg-white', ovulationTest: 'positive', cycleDay: 14 },
];

const result = await predictor.predictFromRecentLogs(recentLogs);

console.log(result);
// {
//   fertile: true,
//   fertile_probability: 87.5,
//   not_fertile_probability: 12.5,
//   confidence: 75,
//   raw_probability: 0.875,
//   features: [36.5, 0.15, 36.6, 5, 1, 14],
//   normalized_features: [-0.2, 0.1, 0.3, 0.4, 0.5, 0]
// }
```

### Method 2: In Controller

```javascript
// backend/controllers/fertilityController.js
import { getOvulationPredictor } from '../services/ml/ovulationPredictor.js';

export const getMLPredictionTFJS = async (req, res) => {
  try {
    const predictor = getOvulationPredictor();
    
    // Get recent logs
    const logs = await FertilityLog.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(7)
      .lean();
    
    if (logs.length < 3) {
      return res.json({
        success: false,
        message: 'Need at least 3 days of data for prediction'
      });
    }
    
    // Make prediction
    const prediction = await predictor.predictFromRecentLogs(logs);
    
    res.json({
      success: true,
      ml_enabled: true,
      tfjs: true,
      prediction
    });
    
  } catch (error) {
    console.error('TFJS prediction error:', error);
    
    // Fallback
    res.json({
      success: true,
      ml_enabled: false,
      fallback: true,
      error: error.message
    });
  }
};
```

### Method 3: As Alternative to Flask API

You can create an alternative ML service that uses TFJS instead of Flask:

```javascript
// backend/services/mlPredictionServiceTFJS.js
import { getOvulationPredictor } from './ml/ovulationPredictor.js';

export const predictFertilityTFJS = async (fertilityData) => {
  try {
    const predictor = getOvulationPredictor();
    
    // Convert single day to array format
    const recentLogs = [fertilityData];
    
    // Make prediction
    const result = await predictor.predictFromRecentLogs(recentLogs);
    
    return {
      success: true,
      fertile: result.fertile,
      fertile_probability: result.fertile_probability,
      confidence: result.confidence
    };
  } catch (error) {
    console.error('TFJS prediction failed:', error);
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
};

export const predictFertilityBatchTFJS = async (fertilityRecords) => {
  try {
    const predictor = getOvulationPredictor();
    
    const results = [];
    for (const record of fertilityRecords) {
      const result = await predictor.predictFromRecentLogs([record]);
      results.push(result);
    }
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('TFJS batch prediction failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

---

## ⚙️ Configuration

### Choose Your Approach

You have three options:

#### Option 1: Flask API (Recommended - Already Implemented)
```javascript
// Uses mlPredictionService.js (calls Flask API)
import { predictFertility } from './services/mlPredictionService.js';
```

#### Option 2: TensorFlow.js Direct
```javascript
// Uses TFJS model directly in Node.js
import { getOvulationPredictor } from './services/ml/ovulationPredictor.js';
```

#### Option 3: Hybrid
```javascript
// Try TFJS first, fallback to Flask
try {
  const predictor = getOvulationPredictor();
  return await predictor.predictFromRecentLogs(logs);
} catch (error) {
  // Fallback to Flask API
  return await predictFertility(logs);
}
```

---

## 📊 Feature Engineering Details

The `buildFeaturesFromLogs()` function replicates the Python feature engineering:

```javascript
// Features (in order):
// 1. bbt_mean_window - Average BBT over 7-day window
// 2. bbt_std_window - Standard deviation of BBT over 7-day window
// 3. bbt_current - Current day's BBT
// 4. mucus_current - Cervical mucus encoded (0-5)
// 5. lh_current - Ovulation test result (0 or 1)
// 6. day_in_cycle - Day of menstrual cycle
```

**Encoding:**
```javascript
// Cervical Mucus
{
  'none': 0,
  'dry': 1,
  'sticky': 2,
  'creamy': 3,
  'watery': 4,
  'egg-white': 5
}

// Ovulation Test
{
  'positive': 1,
  'peak': 1,
  'negative': 0,
  'not-tested': 0
}
```

---

## 🧪 Testing

### Test the TFJS Predictor

```javascript
// test-tfjs.js
import { getOvulationPredictor } from './services/ml/ovulationPredictor.js';

const predictor = getOvulationPredictor();

const testLogs = [
  { bbt: 36.2, cervicalMucus: 'dry', ovulationTest: 'negative', cycleDay: 10 },
  { bbt: 36.3, cervicalMucus: 'sticky', ovulationTest: 'negative', cycleDay: 11 },
  { bbt: 36.4, cervicalMucus: 'creamy', ovulationTest: 'negative', cycleDay: 12 },
  { bbt: 36.5, cervicalMucus: 'watery', ovulationTest: 'negative', cycleDay: 13 },
  { bbt: 36.6, cervicalMucus: 'egg-white', ovulationTest: 'positive', cycleDay: 14 },
];

try {
  const result = await predictor.predictFromRecentLogs(testLogs);
  console.log('✅ Prediction:', result);
} catch (error) {
  console.error('❌ Error:', error);
}
```

---

## ⚠️ Important Notes

### Model Loading

The model is lazy-loaded on first use:
```javascript
const predictor = getOvulationPredictor();
await predictor.loadModel(); // Loaded automatically on first predict
```

### Memory Management

TensorFlow.js creates tensors. They're automatically disposed, but be aware:
```javascript
const result = await predictor.predictFromRecentLogs(logs);
// Tensors are automatically cleaned up
```

### File Paths

The predictor looks for models in:
```
backend/python/models/tfjs_model/
backend/python/models/feature_scaler.json
```

Make sure these files exist after converting the model.

---

## 🆚 Flask vs TFJS Comparison

| Feature | Flask API | TFJS Direct |
|---------|-----------|-------------|
| **Setup** | Python + Node | Node only |
| **Performance** | Fast | Moderate |
| **Memory** | Separated | In-process |
| **Deployment** | Two services | One service |
| **Complexity** | Moderate | High |
| **Recommendation** | ✅ Use this | Optional |

---

## 🔄 Migration Path

### Current (Flask API)
```javascript
import { predictFertility } from './services/mlPredictionService.js';
// Calls Python API at http://localhost:5001
```

### Alternative (TFJS Direct)
```javascript
import { getOvulationPredictor } from './services/ml/ovulationPredictor.js';
// Loads model directly in Node.js
```

### Hybrid Approach
```javascript
import { predictFertility } from './services/mlPredictionService.js';
import { getOvulationPredictor } from './services/ml/ovulationPredictor.js';

export const hybridPredict = async (logs) => {
  try {
    // Try TFJS first
    const predictor = getOvulationPredictor();
    return await predictor.predictFromRecentLogs(logs);
  } catch (error) {
    // Fallback to Flask API
    return await predictFertility(logs[0]);
  }
};
```

---

## 📝 Summary

**TensorFlow.js Integration is Ready!**

- ✅ OvulationPredictor class created
- ✅ Scaler saved as JSON for Node.js
- ✅ Feature engineering matches Python
- ✅ Tensor disposal handled
- ✅ Error handling implemented
- ✅ Singleton pattern for efficiency

**Installation:**
```powershell
npm install @tensorflow/tfjs-node
```

**Usage:**
```javascript
const predictor = getOvulationPredictor();
const result = await predictor.predictFromRecentLogs(logs);
```

**Recommended:** Use Flask API (already implemented), but TFJS is available as an alternative!

