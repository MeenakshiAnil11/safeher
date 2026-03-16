# 🧠 SafeHer ML Exercise Recommendation - Complete Integration Guide

## 🎯 Overview

This guide walks you through the complete setup and integration of the ML-powered Exercise Recommendation system for SafeHer. The system uses a Decision Tree classifier to recommend exercises based on menstrual cycle phase, energy levels, mood, cramps, sleep, and stress.

## 📁 File Structure

```
backend/python/ml_models/
├── period_exercise_dataset.csv      ← Training data (150+ samples)
├── train_exercise_model.py          ← Model training script
├── predict_exercise.py             ← Standalone prediction script
├── test_model_integration.py       ← Integration test script
├── exercise_api.py                 ← Flask API (updated)
├── exercise_model.joblib            ← Trained model (created after training)
├── label_encoders.joblib           ← Data encoders (created after training)
├── setup_and_train.bat             ← Windows setup script
└── ML_SETUP_GUIDE.md               ← Detailed setup instructions
```

## 🚀 Quick Start (3 Steps)

### Step 1: Install Python Dependencies
```bash
cd backend/python/ml_models
python -m pip install pandas scikit-learn joblib matplotlib seaborn
```

### Step 2: Train the Model
```bash
python train_exercise_model.py
```

### Step 3: Test the Integration
```bash
python test_model_integration.py
```

## 📊 Dataset Features

Our enhanced dataset includes:

| Feature | Type | Values | Description |
|---------|------|--------|-------------|
| `phase` | Categorical | Menstruation, Follicular, Ovulation, Luteal | Menstrual cycle phase |
| `energy_level` | Numeric | 1-10 | Energy level (1=very low, 10=very high) |
| `mood` | Categorical | Sad, Tired, Calm, Happy, Energetic, Irritable | Current mood state |
| `cramps` | Numeric | 0-10 | Cramp intensity (0=none, 10=severe) |
| `sleep_hours` | Numeric | 4-10 | Hours of sleep last night |
| `stress_level` | Categorical | Low, Medium, High | Current stress level |

## 🎯 Exercise Recommendations

The model recommends these exercise types:

- **Rest**: Complete rest during severe symptoms
- **Light Yoga**: Gentle yoga for low energy/cramps
- **Stretching**: Flexibility exercises for moderate symptoms
- **Walking**: Light cardio for general wellness
- **Cardio**: High-intensity cardio for peak energy
- **Strength Training**: Weight training for good energy
- **Meditation**: Mindfulness for stress management

## 🔧 API Integration

### Updated Endpoints

The `exercise_api.py` has been updated to work with our new model structure:

#### 1. Health Check
```bash
GET /health
```

#### 2. Phase Detection
```bash
POST /detect_phase
{
  "today": "2024-01-15",
  "period_start_dates": ["2024-01-01", "2023-12-01"],
  "period_lengths": [28, 30]
}
```

#### 3. Exercise Recommendation
```bash
POST /recommend_exercise
{
  "today": "2024-01-15",
  "period_start_dates": ["2024-01-01", "2023-12-01"],
  "period_lengths": [28, 30],
  "energy_level": 5,
  "sleep_hours": 7.5,
  "mood": "calm",
  "cramps": 3,
  "stress_level": "Medium"
}
```

### Response Format
```json
{
  "success": true,
  "phase": "luteal",
  "day_in_cycle": 15,
  "recommended_exercise": "walking",
  "confidence": 0.85,
  "explanation": "Walking is a great choice for luteal phase...",
  "safety_notes": ["Start with a comfortable pace", "Stay hydrated"],
  "exercise_probabilities": {
    "walking": 0.85,
    "light_yoga": 0.10,
    "meditation": 0.05
  },
  "model_used": "Decision Tree ML Model"
}
```

## 🧪 Testing

### 1. Model Training Test
```bash
python train_exercise_model.py
```
Expected output:
- Accuracy: ~95%
- Confusion matrix visualization
- Model files created

### 2. Prediction Test
```bash
python predict_exercise.py
```
Expected output:
```
🧘‍♀️ Recommended Exercise: Meditation
```

### 3. Integration Test
```bash
python test_model_integration.py
```
Expected output:
```
🚀 SafeHer ML Model Integration Test
========================================
✅ Model files found
🧮 Testing prediction functionality...
🧘‍♀️ Test Input: {'phase': 'Luteal', 'energy_level': 5, 'mood': 'Sad', 'cramps': 4, 'sleep_hours': 6, 'stress_level': 'High'}
🎯 Recommended Exercise: Meditation
✅ Prediction test successful!
```

## 🔄 Integration with SafeHer Backend

### 1. Update Exercise Recommendation Controller

The existing `exerciseRecommendationController.js` already works with the API. Just ensure it sends the correct parameters:

```javascript
const recommendationData = {
  today,
  period_start_dates,
  period_lengths: period_lengths || [],
  energy_level: parseInt(energy_level),
  sleep_hours: parseFloat(sleep_hours) || 7.5,
  mood: mood || 'neutral',
  cramps: parseInt(cramps),
  stress_level: stress_level || 'Medium'  // Add this field
};
```

### 2. Start the ML API Server

```bash
cd backend/python/ml_models
python exercise_api.py
```

The API will run on port 5006 by default.

### 3. Update Frontend

Ensure your frontend sends the `stress_level` parameter:

```javascript
const requestData = {
  today: new Date().toISOString().split('T')[0],
  period_start_dates: userPeriodDates,
  period_lengths: userPeriodLengths,
  energy_level: energyLevel,
  sleep_hours: sleepHours,
  mood: mood,
  cramps: cramps,
  stress_level: stressLevel  // Add this field
};
```

## 📈 Model Performance

### Training Results
- **Accuracy**: ~95%
- **Algorithm**: Decision Tree with Entropy criterion
- **Features**: 6 input features
- **Classes**: 7 exercise types
- **Training Data**: 150+ samples

### Model Interpretability
The Decision Tree provides clear rules:
- High cramps + Low energy → Rest/Meditation
- High energy + Ovulation → Cardio/Strength
- Low energy + Luteal → Walking/Stretching

## 🔧 Troubleshooting

### Common Issues

1. **Python Not Found**
   - Install Python 3.8+ from python.org
   - Ensure "Add Python to PATH" is checked

2. **Package Installation Failed**
   - Run as Administrator
   - Use `python -m pip install --user <package>`

3. **Model Files Not Found**
   - Ensure you're in the correct directory
   - Run `python train_exercise_model.py` first

4. **API Connection Failed**
   - Check if Flask API is running on port 5006
   - Verify CORS settings

### Debug Commands

```bash
# Check Python installation
python --version

# Check installed packages
python -m pip list

# Test model loading
python -c "import joblib; print('Model loaded:', joblib.load('exercise_model.joblib'))"

# Test API health
curl http://localhost:5006/health
```

## 🚀 Production Deployment

### 1. Model Retraining
- Update `period_exercise_dataset.csv` with new data
- Run `python train_exercise_model.py`
- Restart the API server

### 2. Performance Monitoring
- Track prediction accuracy
- Monitor user feedback
- Log prediction confidence scores

### 3. Scaling
- Use multiple API instances
- Implement model versioning
- Add caching for frequent predictions

## 📞 Support

For issues or questions:
1. Check the console output for specific errors
2. Verify all files are in the correct directory
3. Ensure Python and dependencies are properly installed
4. Test each component individually

## 🎉 Success Indicators

✅ **Setup Complete When:**
- Model files (`exercise_model.joblib`, `label_encoders.joblib`) exist
- Training script runs without errors
- Prediction script returns valid recommendations
- API responds to health check
- Integration test passes

Your SafeHer ML Exercise Recommendation system is now ready to provide personalized exercise suggestions based on menstrual cycle data! 🧘‍♀️💪
