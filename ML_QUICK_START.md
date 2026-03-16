# 🚀 ML Quick Start Guide

Get your AI/ML ovulation prediction system up and running in 5 minutes!

## ⚡ Quick Setup (Windows PowerShell)

### Step 1: Create Python Environment
```powershell
cd backend\python
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Step 2: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 3: Generate Training Data
```powershell
python generate_synthetic_data.py
```

### Step 4: Train the Model
```powershell
python train_ovulation_model.py
```

### Step 5: Start Python ML Service
```powershell
python prediction_api.py
```
Keep this running in one terminal window!

### Step 6: Start Node.js Backend (New Terminal)
```powershell
cd backend
npm start
```

## ✅ Verify It's Working

### Test Python API
```powershell
# In another terminal
curl http://localhost:5001/health
```

Expected response:
```json
{"status": "ok", "model_loaded": true}
```

### Test Node.js Integration
```powershell
curl http://localhost:5000/api/test
```

Expected response:
```json
{"ok": true, "from": "backend"}
```

## 🎯 Test ML Prediction

### Test API Endpoint
```powershell
# Replace YOUR_TOKEN with actual JWT token
curl -H "Authorization: Bearer YOUR_TOKEN" `
  http://localhost:5000/api/fertility/predict
```

## 📊 Using the API

### Get ML Prediction
```javascript
// From React frontend
const response = await api.get('/api/fertility/predict', {
  headers: { Authorization: `Bearer ${token}` }
});

console.log(response.data);
// {
//   success: true,
//   ml_enabled: true,
//   prediction: {
//     fertile: true,
//     fertile_probability: 87.5,
//     confidence: 75
//   }
// }
```

### Get Enhanced Insights
```javascript
const response = await api.get('/api/fertility/enhanced-insights', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## 🔧 Troubleshooting

### "Model not loaded" Error
**Solution:** Make sure you ran `python train_ovulation_model.py` and it completed successfully.

### "ML service not available" Error
**Solution:** Make sure Python API is running (`python prediction_api.py`)

### Python Dependencies Error
**Solution:** 
```powershell
cd backend\python
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Port Already in Use
**Solution:** 
```powershell
# Find process using port 5001
netstat -ano | findstr :5001
# Kill process
taskkill /PID <PID> /F
```

## 📁 Project Structure

```
backend/
├── python/
│   ├── venv/                   # Virtual environment
│   ├── generate_synthetic_data.py
│   ├── train_ovulation_model.py
│   ├── prediction_api.py       # Flask API
│   ├── data/                   # Training data
│   └── models/                 # Trained models
├── services/
│   └── mlPredictionService.js  # Node.js ML service
└── controllers/
    └── fertilityController.js # ML endpoints

```

## 🎉 You're Done!

Your ML-powered fertility prediction system is now running!

**Features:**
- ✅ AI-based ovulation prediction
- ✅ Fertile window detection
- ✅ Confidence scoring
- ✅ Automatic fallback
- ✅ Real-time predictions

**Next Steps:**
1. Test with real user data
2. Integrate with frontend
3. Monitor performance
4. Retrain periodically

For detailed documentation, see `ML_IMPLEMENTATION_GUIDE.md`

