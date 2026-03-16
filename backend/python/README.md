# Ovulation Prediction ML Setup

This directory contains Python scripts for training a machine learning model to predict ovulation using fertility tracking data.

## 📋 Requirements

### Python Environment
- Python 3.9 or higher
- pip package manager

### Dependencies
```bash
pip install pandas numpy scikit-learn tensorflow joblib
```

Optional (for TensorFlow.js conversion):
```bash
pip install tensorflowjs
```

## 🚀 Setup Instructions

### 1. Create Virtual Environment (Recommended)

**Windows:**
```bash
cd backend
python -m venv python/venv
python\venv\Scripts\activate
```

**Mac/Linux:**
```bash
cd backend
python3 -m venv python/venv
source python/venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install --upgrade pip
pip install pandas numpy scikit-learn tensorflow joblib
```

### 3. Generate Training Data

```bash
cd backend/python
python generate_synthetic_data.py
```

This creates: `python/data/fertility_tracking_data.csv`

### 4. Train the Model

```bash
python train_ovulation_model.py
```

This will:
- Train a neural network model
- Save model files to `python/models/`
- Display training metrics and evaluation results

### 5. Model Files

After training, you'll have:
- `ovulation_model.h5` - Full Keras model
- `ovulation_weights.h5` - Model weights
- `scaler.pkl` - Feature scaler for data preprocessing
- `tfjs_model/` - TensorFlow.js format (optional)

## 📊 Model Architecture

- **Input Layer**: 8 features (cycle_day, bbt, cervical_mucus, ovulation_test, intercourse, energy, stress, sleep_hours)
- **Hidden Layers**: 64 → 32 → 16 neurons with dropout regularization
- **Output Layer**: Binary classification (fertile: 1, not fertile: 0)

## 🎯 Features Used

1. **cycle_day** - Day of menstrual cycle (1-32)
2. **bbt** - Basal Body Temperature (°C)
3. **cervical_mucus_encoded** - Cervical mucus type (0-4)
4. **ovulation_test_encoded** - OPK results (0-1)
5. **intercourse** - Whether intercourse occurred (0-1)
6. **energy** - Energy level (1-10)
7. **stress** - Stress level (1-10)
8. **sleep_hours** - Sleep duration (0-24)

## 🔄 Next Steps

### Option A: Use TensorFlow.js in Node.js
```bash
cd backend
npm install @tensorflow/tfjs-node
```

### Option B: Use Python Microservice
Create a Flask/FastAPI service to serve the model

## 📈 Model Performance

Expected results:
- Accuracy: 85-95%
- Precision: 85-90%
- Recall: 80-90%

The model learns patterns from:
- BBT temperature shifts
- Cervical mucus changes
- Ovulation test results
- Cycle timing patterns

