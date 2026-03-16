# 🤖 AI/ML Implementation for Conceive Mode

Complete guide to implementing machine learning for ovulation prediction in the SafeHer Conceive Mode.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Training the Model](#training-the-model)
5. [Running the ML Service](#running-the-ml-service)
6. [API Endpoints](#api-endpoints)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This implementation adds AI/ML-powered ovulation prediction to the conceive mode. The system uses:

- **TensorFlow/Keras** for model training
- **Flask** API for serving predictions
- **Node.js** backend integration
- **Fallback to rule-based** predictions when ML is unavailable

### Features

- ✅ Basal Body Temperature (BBT) pattern analysis
- ✅ Cervical mucus monitoring
- ✅ Ovulation test integration
- ✅ Cycle day prediction
- ✅ Fertile window calculation
- ✅ Confidence scoring
- ✅ Automatic fallback to rule-based predictions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│              (React - ConceiveDashboard.jsx)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Node.js Backend                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Fertility Controller                     │   │
│  │  • getFertilityInsights()                       │   │
│  │  • getMLPrediction()                             │   │
│  │  • getEnhancedInsights()                         │   │
│  └────────────┬────────────────────────────────────┘   │
│               │                                          │
│               ▼                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │      ML Prediction Service                       │   │
│  │  • predictFertility()                            │   │
│  │  • checkMLService()                              │   │
│  └────────────┬────────────────────────────────────┘   │
└────────────────┼─────────────────────────────────────────┘
                 │ HTTP Request
                 │ (Axios)
                 ▼
┌─────────────────────────────────────────────────────────┐
│               Python Flask API (Port 5001)               │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Prediction API                         │   │
│  │  • /predict - Single prediction                  │   │
│  │  • /predict_batch - Batch predictions            │   │
│  │  • /health - Health check                        │   │
│  └────────────┬────────────────────────────────────┘   │
│               │                                          │
│               ▼                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │      TensorFlow/Keras Model                      │   │
│  │  • Loads ovulation_model.h5                     │   │
│  │  • Preprocesses with scaler.pkl                 │   │
│  │  • Returns fertility prediction                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Instructions

### Prerequisites

1. **Python 3.9+** installed
2. **Node.js 18+** installed
3. **pip** package manager
4. **Git** (optional)

### Step 1: Set Up Python Environment

**Windows:**
```bash
cd backend
python -m venv python\venv
python\venv\Scripts\activate
```

**Mac/Linux:**
```bash
cd backend
python3 -m venv python/venv
source python/venv/bin/activate
```

### Step 2: Install Python Dependencies

```bash
cd backend/python
pip install --upgrade pip
pip install pandas numpy scikit-learn tensorflow joblib flask
```

**Optional** (for TensorFlow.js conversion):
```bash
pip install tensorflowjs
```

### Step 3: Generate Training Data

```bash
python generate_synthetic_data.py
```

This creates: `python/data/fertility_tracking_data.csv`

### Step 4: Train the Model

```bash
python train_ovulation_model.py
```

This will:
- Train a neural network on synthetic fertility data
- Save the model to `python/models/ovulation_model.h5`
- Save the scaler to `python/models/scaler.pkl`
- Display training metrics

**Expected Output:**
```
Training samples: XXX
Test samples: XXX
Test Accuracy: 85-95%
```

### Step 5: Install Node.js Dependencies

The Node.js backend already has `axios` installed. If you need to reinstall:

```bash
cd backend
npm install axios
```

---

## 🎓 Training the Model

### Data Generation

The `generate_synthetic_data.py` script creates realistic fertility tracking data:

- **Features**: cycle_day, bbt, cervical_mucus, ovulation_test, intercourse, energy, stress, sleep_hours
- **Target**: fertile (1) or not fertile (0)
- **Cycles**: 30 cycles, varying cycle lengths (26-32 days)
- **Patterns**: 
  - BBT drops before ovulation, rises after
  - Cervical mucus changes during fertile window
  - Symptoms vary by cycle phase

### Model Architecture

```python
Model: Sequential
├── Dense(64, activation='relu') + Dropout(0.3)
├── Dense(32, activation='relu') + Dropout(0.2)
├── Dense(16, activation='relu') + Dropout(0.1)
└── Dense(1, activation='sigmoid')  # Binary classification
```

**Hyperparameters:**
- Optimizer: Adam (lr=0.001)
- Loss: Binary crossentropy
- Metrics: Accuracy, Precision, Recall
- Epochs: 100 (with early stopping)
- Batch size: 32

---

## 🔧 Running the ML Service

### Start the Python Flask API

```bash
cd backend/python
python prediction_api.py
```

**Output:**
```
🚀 Starting Ovulation Prediction API...
✅ Model loaded successfully
🌐 API available at http://localhost:5001
```

The service will run on `http://localhost:5001`

### Start the Node.js Backend

```bash
cd backend
npm start
```

or for development:

```bash
npm run dev
```

---

## 🔌 API Endpoints

### Node.js Backend Endpoints

#### 1. Get ML Prediction
```
GET /api/fertility/predict?date=2024-01-15
```

**Response:**
```json
{
  "success": true,
  "ml_enabled": true,
  "prediction": {
    "fertile": true,
    "fertile_probability": 87.5,
    "not_fertile_probability": 12.5,
    "confidence": 75
  },
  "log": {
    "date": "2024-01-15",
    "cycle_day": 14,
    "bbt": 36.6,
    "cervical_mucus": "egg-white",
    "ovulation_test": "positive"
  }
}
```

#### 2. Get Enhanced Insights (with ML)
```
GET /api/fertility/enhanced-insights
```

**Response:**
```json
{
  "success": true,
  "insights": {
    "currentPhase": "ovulatory",
    "cycleDay": 14,
    "daysUntilOvulation": 0,
    "fertilityScore": 95,
    "ml_insights": {
      "today_fertile": true,
      "fertile_probability": 87.5,
      "confidence": 75,
      "ml_enabled": true
    },
    ...
  }
}
```

#### 3. Get Standard Insights
```
GET /api/fertility/insights
```
(Works without ML service, uses rule-based predictions)

### Python Flask API Endpoints

#### 1. Health Check
```bash
curl http://localhost:5001/health
```

#### 2. Single Prediction
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "cycle_day": 14,
    "bbt": 36.6,
    "cervical_mucus": "egg-white",
    "ovulation_test": "positive",
    "intercourse": true,
    "energy": 8,
    "stress": 3,
    "sleep_hours": 7.5
  }'
```

#### 3. Batch Prediction
```bash
curl -X POST http://localhost:5001/predict_batch \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "cycle_day": 14,
        "bbt": 36.6,
        ...
      }
    ]
  }'
```

---

## 🧪 Testing

### Test Python API

```bash
# Test health check
curl http://localhost:5001/health

# Test prediction
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "cycle_day": 14,
    "bbt": 36.6,
    "cervical_mucus": "egg-white",
    "ovulation_test": "positive",
    "intercourse": false,
    "energy": 8,
    "stress": 3,
    "sleep_hours": 8
  }'
```

### Test Node.js Integration

```bash
# Start both services
cd backend/python && python prediction_api.py &
cd backend && npm start

# Test endpoint (in another terminal)
curl http://localhost:5000/api/test
```

### Test with Frontend

1. Start Python API: `cd backend/python && python prediction_api.py`
2. Start Node.js: `cd backend && npm start`
3. Start React app: `cd client && npm start`
4. Navigate to Conceive Dashboard
5. Log fertility data and check predictions

---

## 🔍 Troubleshooting

### Python Service Won't Start

**Error:** `Model not loaded`

**Solution:**
```bash
# Make sure you've trained the model
cd backend/python
python train_ovulation_model.py

# Check model files exist
ls -la models/
```

**Error:** `ModuleNotFoundError: No module named 'tensorflow'`

**Solution:**
```bash
# Activate virtual environment
source python/venv/bin/activate  # Mac/Linux
python\venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install tensorflow
```

### Node.js Can't Connect to Python API

**Error:** `ML service not available`

**Solution:**
1. Check if Python API is running: `curl http://localhost:5001/health`
2. Verify port 5001 is not blocked
3. Check firewall settings

**Set custom ML URL:**
```bash
# In backend/.env or set environment variable
ML_API_URL=http://localhost:5001
```

### Model Predictions Are Inaccurate

**Solutions:**
1. Retrain with more data: `generate_synthetic_data.py` (increase `num_cycles`)
2. Collect real user data to retrain
3. Tune hyperparameters in `train_ovulation_model.py`
4. Use fallback predictions for now

### Fallback Mode

The system automatically falls back to rule-based predictions when:
- ML service is unavailable
- Model files are missing
- Connection timeout occurs

Fallback uses:
- Ovulation test results
- Cervical mucus type
- Cycle day estimates

---

## 📊 Performance Expectations

### Model Accuracy
- **Accuracy**: 85-95%
- **Precision**: 85-90%
- **Recall**: 80-90%

### Inference Speed
- **Single prediction**: < 50ms
- **Batch prediction** (30 records): < 200ms
- **API response time**: < 100ms

### Resource Usage
- **Python API**: ~100MB RAM
- **Model size**: ~1-2MB
- **Disk space**: ~10MB (with data)

---

## 🔄 Next Steps

### 1. Collect Real User Data

Replace synthetic data with real user logs:
```python
# Export from MongoDB
mongoexport --db=yourdb --collection=fertilitylogs --out=real_data.csv
```

### 2. Retrain Periodically

```bash
# Add new data and retrain
python train_ovulation_model.py
```

### 3. Expand Features

Add:
- Exercise levels
- Nutrition tracking
- Weight changes
- Medical history

### 4. A/B Testing

Compare ML vs rule-based predictions in production.

---

## 📝 Files Created

```
backend/
├── python/
│   ├── generate_synthetic_data.py    # Data generator
│   ├── train_ovulation_model.py     # Model training script
│   ├── prediction_api.py             # Flask API service
│   ├── setup.sh                      # Mac/Linux setup
│   ├── setup.bat                     # Windows setup
│   ├── README.md                     # Python setup guide
│   ├── data/
│   │   └── fertility_tracking_data.csv
│   └── models/
│       ├── ovulation_model.h5
│       ├── ovulation_model_best.h5
│       ├── ovulation_weights.h5
│       └── scaler.pkl
├── services/
│   └── mlPredictionService.js       # Node.js ML service
├── controllers/
│   └── fertilityController.js        # Updated with ML
├── routes/
│   └── fertilityRoutes.js            # Updated routes
└── ML_IMPLEMENTATION_GUIDE.md        # This file
```

---

## ✅ Checklist

- [x] Python environment setup
- [x] Data generation script
- [x] Model training script
- [x] Flask prediction API
- [x] Node.js ML service
- [x] Backend controller integration
- [x] API endpoint creation
- [x] Documentation
- [ ] Frontend integration (optional)
- [ ] Real data collection
- [ ] Model retraining pipeline

---

## 🎉 Success!

Your ML-powered ovulation prediction system is now ready to use!

For questions or issues, check the troubleshooting section or review the logs.

**Happy Coding! 🚀**

