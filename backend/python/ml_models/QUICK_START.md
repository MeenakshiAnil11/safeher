# 🚀 SafeHer ML Exercise Recommendation - Quick Start

## ⚡ 3-Step Setup

```bash
# 1. Navigate to ML directory
cd backend/python/ml_models

# 2. Install dependencies
python -m pip install pandas scikit-learn joblib matplotlib seaborn

# 3. Train model
python train_exercise_model.py
```

## 🧪 Test Everything

```bash
# Test predictions
python predict_exercise.py

# Test integration
python test_model_integration.py
```

## 🎯 Expected Output

**Training:**
```
Accuracy: 0.95
✅ Model and encoders saved successfully!
```

**Prediction:**
```
🧘‍♀️ Recommended Exercise: Yoga
```

## 📁 Files Created

- `exercise_model.joblib` ← Trained model
- `label_encoders.joblib` ← Data encoders
- Confusion matrix visualization

## 🔧 API Integration

The updated `exercise_api.py` automatically uses your trained model. Start the API:

```bash
python exercise_api.py
```

## 🆘 Troubleshooting

**Python not found?**
- Install from python.org
- Check "Add Python to PATH"

**Packages fail to install?**
- Run as Administrator
- Use `python -m pip install --user <package>`

## ✅ Success Indicators

- Model files exist in directory
- Training script runs without errors
- Prediction script returns valid recommendations
- Integration test passes

Your ML Exercise Recommendation system is ready! 🎉
