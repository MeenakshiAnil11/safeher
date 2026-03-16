# 🔄 ML Model Integration with Node.js

## Two Options for Serving ML Predictions

You have **two options** for using the trained ML model in your Node.js backend:

### Option A: Flask Python API (Already Implemented) ✅
- ✅ **Current setup** - Working and tested
- ✅ **Simpler** - No Node.js TensorFlow.js dependency
- ✅ **Production-ready** - Flask microservice approach
- ✅ **Faster inference** - Native Python/TensorFlow

### Option B: TensorFlow.js in Node.js (Alternative)
- 🔧 **Direct model loading** in Node.js
- 🔧 **No Python dependency** at runtime
- 🔧 **Single process** - Everything in Node.js
- ⚠️ **Requires** @tensorflow/tfjs-node package

---

## ✅ Option A: Flask Python API (Recommended)

### Current Setup

**Files:**
- `backend/python/prediction_api.py` - Flask API (port 5001)
- `backend/services/mlPredictionService.js` - Node.js client
- `backend/controllers/fertilityController.js` - Controller with ML endpoints

### How It Works

```
Node.js Backend (5000)
    ↓ (Axios HTTP request)
Flask Python API (5001)
    ↓ (TensorFlow inference)
Model: ovulation_model.h5
```

### Start Services

```powershell
# Terminal 1: Python API
cd backend\python
python prediction_api.py

# Terminal 2: Node.js Backend
cd backend
npm start
```

### API Endpoints (Working Now)

```javascript
// Get ML prediction
GET /api/fertility/predict

// Get enhanced insights with ML
GET /api/fertility/enhanced-insights
```

### Advantages

1. ✅ **Already working** - Fully implemented
2. ✅ **No TFJS dependency** - Simpler Node.js setup
3. ✅ **Faster** - Native Python/TensorFlow is optimized
4. ✅ **Separation of concerns** - ML logic in Python
5. ✅ **Easy to update model** - Just restart Flask API

### Configuration

Set custom ML API URL (optional):
```bash
# In .env
ML_API_URL=http://localhost:5001
```

---

## 🔧 Option B: TensorFlow.js in Node.js (Alternative)

### Setup Instructions

#### 1. Install TensorFlow.js Converter

```powershell
pip install tensorflowjs
```

#### 2. Convert Keras Model to TensorFlow.js

```powershell
cd backend\python
python convert_to_tfjs.py
```

**Or manually:**
```powershell
tensorflowjs_converter --input_format=keras models/ovulation_model.h5 models/tfjs_model
```

This creates:
```
models/tfjs_model/
├── model.json
├── shard1of1.bin
└── ...
```

#### 3. Install Node.js Dependencies

```powershell
cd backend
npm install @tensorflow/tfjs-node
```

#### 4. Create TFJS Service (Alternative to Flask API)

Create `backend/services/mlPredictionServiceTFJS.js`:

```javascript
/**
 * ML Prediction Service using TensorFlow.js
 * Loads model directly in Node.js
 */

import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import path from 'path';

let model = null;
let featureColumns = null;
let scaler = null;

export async function loadModel() {
  try {
    // Load TFJS model
    const modelPath = path.join(process.cwd(), 'python/models/tfjs_model');
    model = await tf.loadLayersModel(`file://${modelPath}/model.json`);
    
    // Load feature columns
    const { default: joblib } = await import('joblib');
    const columnsPath = path.join(modelPath, '..', 'feature_columns.pkl');
    featureColumns = joblib.load(fs.readFileSync(columnsPath));
    
    console.log('✅ TensorFlow.js model loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error loading TFJS model:', error.message);
    return false;
  }
}

export async function predictFertility(features) {
  if (!model) {
    await loadModel();
  }
  
  // Prepare features array matching the model's expected input
  const featureArray = [
    features.cycle_day || 14,
    features.bbt || 36.5,
    features.cervical_mucus_encoded || 0,
    features.ovulation_test_encoded || 0,
    features.intercourse ? 1 : 0,
    features.energy || 5,
    features.stress || 5,
    features.sleep_hours || 7.5
  ];
  
  // Create tensor
  const input = tf.tensor2d([featureArray]);
  
  // Make prediction
  const prediction = model.predict(input);
  const probability = (await prediction.data())[0];
  
  return {
    fertile: probability >= 0.5,
    fertile_probability: probability * 100,
    confidence: Math.abs(probability - 0.5) * 2 * 100
  };
}

export async function checkTFJSModelLoaded() {
  return model !== null;
}
```

#### 5. Update Package.json

```json
{
  "dependencies": {
    "@tensorflow/tfjs-node": "^4.15.0"
  }
}
```

#### 6. Use in Controller

```javascript
import { predictFertility } from '../services/mlPredictionServiceTFJS.js';

export const getMLPrediction = async (req, res) => {
  try {
    const log = await FertilityLog.findOne({ user: req.userId });
    
    // Use TFJS model
    const prediction = await predictFertility(log);
    
    res.json({ success: true, prediction });
  } catch (error) {
    // Fallback to rule-based
    res.json({ success: true, fallback: true, prediction: {...} });
  }
};
```

### Advantages

1. **Single process** - Everything in Node.js
2. **No Python dependency** - Pure JavaScript solution
3. **Simpler deployment** - One service instead of two
4. **Direct model loading** - No HTTP overhead

### Disadvantages

1. **Large dependency** - @tensorflow/tfjs-node is ~50MB
2. **Slower inference** - Not as optimized as native Python
3. **More complex setup** - Model conversion step needed
4. **Memory overhead** - Model loaded in Node.js process

---

## 📊 Comparison

| Feature | Option A (Flask) | Option B (TFJS) |
|---------|------------------|-----------------|
| **Status** | ✅ Implemented | 🔧 Alternative |
| **Setup** | Simple | More complex |
| **Performance** | Fast | Moderate |
| **Dependencies** | Python + Node | Node only |
| **Deployment** | Two services | One service |
| **Memory** | Low | High |
| **Model Updates** | Easy | Requires rebuild |
| **Recommendation** | ✅ **Use this** | Optional |

---

## 🚀 Recommended Approach

**Use Option A (Flask Python API)** - It's already implemented and working!

### Why?
1. ✅ Fully implemented and tested
2. ✅ Better performance (native Python/TensorFlow)
3. ✅ Simpler Node.js setup (no @tensorflow/tfjs-node)
4. ✅ Separation of concerns (ML in Python)
5. ✅ Easier to update and maintain
6. ✅ Production-ready

### Current Architecture (Option A)

```
┌─────────────────────┐
│  React Frontend     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Node.js Backend (5000)         │
│  ┌───────────────────────────┐ │
│  │  fertilityController.js   │ │
│  │  • getMLPrediction()       │ │
│  └──────────┬──────────────────┘ │
│             │                    │
│             ▼                    │
│  ┌───────────────────────────┐ │
│  │ mlPredictionService.js   │ │
│  │  • Calls Flask API        │ │
│  └──────────┬──────────────────┘ │
└────────────┼────────────────────┘
             │ HTTP (Axios)
             ▼
┌──────────────────────────────────┐
│  Flask Python API (5001)        │
│  • prediction_api.py            │
│  • Loads model.h5                │
│  • Returns predictions          │
└──────────────────────────────────┘
```

---

## 📝 Quick Reference

### Option A Setup (Current)

```powershell
# 1. Train model
cd backend\python
python train_ovulation_model.py

# 2. Start Flask API
python prediction_api.py

# 3. Start Node.js backend
cd backend
npm start

# 4. Use API
curl http://localhost:5000/api/fertility/predict
```

### Option B Setup (Alternative)

```powershell
# 1. Install TFJS converter
pip install tensorflowjs

# 2. Convert model
python convert_to_tfjs.py

# 3. Install Node.js deps
npm install @tensorflow/tfjs-node

# 4. Use TFJS service
# (See mlPredictionServiceTFJS.js example above)
```

---

## ✅ Conclusion

**Stick with Option A** - It's production-ready and already working!

The Flask Python API approach is:
- ✅ Implemented and tested
- ✅ Better performance
- ✅ Simpler setup
- ✅ Easier to maintain
- ✅ Industry standard approach

Option B (TensorFlow.js) is available if you prefer a pure Node.js solution, but Option A is recommended for production use.

---

## 📚 Additional Resources

- TensorFlow.js: https://www.tensorflow.org/js
- Flask API Docs: https://flask.palletsprojects.com/
- Python API file: `backend/python/prediction_api.py`
- Node.js service: `backend/services/mlPredictionService.js`

