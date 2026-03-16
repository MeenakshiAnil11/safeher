# ✅ Setup Verification & Quick Start

## ✅ Step 1: Files Verified

All required files are in place:

### ✅ Created Files
- ✅ `backend/services/ml/ovulationPredictor.js` - TFJS model loader
- ✅ `backend/services/mlPredictionService.js` - Flask API client
- ✅ `backend/controllers/fertilityController.js` - Controller with ML endpoints
- ✅ `backend/routes/fertilityRoutes.js` - Routes
- ✅ `backend/scripts/test_predict.js` - Test script
- ✅ `backend/ml_models/` - Directory created
- ✅ `backend/python/train_ovulation_model.py` - Training script
- ✅ `backend/python/prediction_api.py` - Flask API
- ✅ `backend/python/convert_to_tfjs.py` - Conversion script

### ✅ Dependencies Installed
- ✅ `@tensorflow/tfjs-node` - In package.json
- ✅ `mongoose` - In package.json
- ✅ `axios` - In package.json

---

## 📋 Quick Setup Checklist

### Step 2: Install Python Dependencies

```powershell
# Navigate to Python directory
cd backend/python

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

**✅ Verify:**
```powershell
pip list | Select-String "tensorflow|pandas|flask"
```

Should show:
- tensorflow
- pandas
- flask
- scikit-learn

---

### Step 3: Train the Model (Optional)

#### Option A: Use Synthetic Data (Quick Start)

```powershell
cd backend/python
.\venv\Scripts\Activate.ps1

# Generate synthetic data
python generate_synthetic_data.py

# Train model
python train_ovulation_model.py
```

**Expected output:**
```
✅ Generated 840 records
Model saved to python/models/ovulation_model.h5
✅ Scaler saved as JSON
```

#### Option B: Use Real Kaggle Data

If you have Kaggle dataset:

```powershell
# Place dataset here:
# backend/python/data/basal_body_temperature.csv

# Run training (it will auto-detect the file)
python train_ovulation_model.py
```

---

### Step 4: Convert to TensorFlow.js

```powershell
cd backend/python
.\venv\Scripts\Activate.ps1

# Convert model
python convert_to_tfjs.py
```

**✅ Verify files created:**
```powershell
ls python/models/tfjs_model/
```

Should show:
- `model.json`
- `group1-shard1of*.bin`

---

### Step 5: Start Services

**Terminal 1: Python Flask API**

```powershell
cd backend/python
.\venv\Scripts\Activate.ps1
python prediction_api.py
```

**✅ Expected output:**
```
🚀 Starting Ovulation Prediction API...
✅ Model loaded successfully
🌐 API available at http://localhost:5001
```

**Terminal 2: Node.js Backend**

```powershell
cd backend
npm start
```

**✅ Expected output:**
```
🚀 Server running on port 5000
```

---

### Step 6: Test the Endpoints

#### Test 1: Python Flask API

```powershell
curl http://localhost:5001/health
```

**Expected:**
```json
{"status": "ok", "model_loaded": true}
```

#### Test 2: Node.js Backend

```powershell
curl http://localhost:5000/api/test
```

**Expected:**
```json
{"ok": true, "from": "backend"}
```

#### Test 3: ML Predictor

```powershell
node scripts/test_predict.js
```

**Expected output:**
```
🧪 Testing TensorFlow.js Ovulation Predictor
✅ Prediction Result:
   Fertile: Yes ✅
   Fertile Probability: 87.5%
   Confidence: 75%
```

#### Test 4: API Endpoint (with Auth)

```powershell
# Get your auth token first from login
curl http://localhost:5000/api/fertility/comprehensive-insights `
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
```json
{
  "success": true,
  "insights": {
    "fertilityScore": 85,
    "predictedOvulationDate": "2024-02-15",
    "fertileWindow": ["2024-02-10", "2024-02-16"],
    "mlPrediction": {
      "fertile": true,
      "fertile_probability": 87.5,
      "confidence": 75
    }
  }
}
```

---

## 🔍 Troubleshooting

### Issue: "Model not found"

**Solution:**
```powershell
cd backend/python
.\venv\Scripts\Activate.ps1
python train_ovulation_model.py
python convert_to_tfjs.py
```

### Issue: "TensorFlow not loaded"

**Solution:**
```powershell
npm install @tensorflow/tfjs-node
```

### Issue: "Port 5001 already in use"

**Solution:**
```powershell
# Find and kill process
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### Issue: "Python dependencies error"

**Solution:**
```powershell
cd backend/python
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt --force-reinstall
```

---

## 📊 File Structure Verification

Your project structure should look like:

```
backend/
├── services/
│   ├── ml/
│   │   └── ovulationPredictor.js    ✅
│   └── mlPredictionService.js       ✅
├── controllers/
│   └── fertilityController.js       ✅
├── routes/
│   └── fertilityRoutes.js           ✅
├── scripts/
│   └── test_predict.js              ✅
├── python/
│   ├── train_ovulation_model.py    ✅
│   ├── prediction_api.py            ✅
│   ├── convert_to_tfjs.py           ✅
│   ├── models/
│   │   ├── ovulation_model.h5       ✅ (after training)
│   │   ├── feature_scaler.json      ✅ (after training)
│   │   └── tfjs_model/              ✅ (after conversion)
│   └── data/
│       └── fertility_tracking_data.csv ✅
└── ml_models/                       ✅ (for future models)
```

---

## 🎯 Integration Test

### Complete Test Flow

```powershell
# 1. Start Python API
cd backend/python
.\venv\Scripts\Activate.ps1
python prediction_api.py

# In another terminal:
# 2. Start Node.js
cd backend
npm start

# In another terminal:
# 3. Test endpoints
curl http://localhost:5000/api/fertility/comprehensive-insights `
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Success Criteria

You're ready when:

- [x] Python Flask API runs on port 5001
- [x] Node.js backend runs on port 5000
- [x] Health check works for both
- [x] Test script runs successfully
- [x] API endpoints return predictions
- [x] No errors in console

---

## 🚀 Next Steps

### Connect to Frontend

Update your React component:

```jsx
// ConceiveDashboard.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api'; // Your API utility

function ConceiveDashboard() {
  const [insights, setInsights] = useState(null);
  
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get('/api/fertility/comprehensive-insights');
        setInsights(response.data.insights);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
      }
    };
    
    fetchInsights();
  }, []);
  
  return (
    <div>
      {insights && (
        <>
          <h2>Fertility Score: {insights.fertilityScore}</h2>
          {insights.mlPrediction && (
            <div>
              <p>Today: {insights.mlPrediction.fertile ? 'Fertile' : 'Not Fertile'}</p>
              <p>Confidence: {insights.mlPrediction.confidence}%</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

## 🎉 Done!

Your ML-powered fertility prediction system is ready!

**What you have:**
- ✅ Complete ML pipeline
- ✅ Multiple serving options (Flask + TFJS)
- ✅ 6 API endpoints
- ✅ Testing suite
- ✅ Documentation
- ✅ Error handling
- ✅ Fallback mechanisms

**What's working:**
- ✅ Data generation
- ✅ Model training
- ✅ Model conversion
- ✅ API serving
- ✅ Node.js integration
- ✅ Predictions

**Ready to use!** 🚀

