# 🧠 SafeHer ML Exercise Recommendation Setup Guide

## 📋 Prerequisites

Before running the ML training, ensure you have:

1. **Python 3.8+** installed
   - Download from: https://python.org
   - ⚠️ **IMPORTANT**: Check "Add Python to PATH" during installation
   - Verify installation: Open Command Prompt and run `python --version`

2. **Required Python Libraries**:
   - pandas
   - scikit-learn
   - joblib
   - matplotlib
   - seaborn

## 🚀 Quick Setup (Windows)

### Option 1: Automated Setup
1. Navigate to: `backend/python/ml_models/`
2. Double-click: `setup_and_train.bat`
3. Follow the prompts

### Option 2: Manual Setup
```bash
# Navigate to the ML models directory
cd backend/python/ml_models

# Install required packages
python -m pip install pandas scikit-learn joblib matplotlib seaborn

# Train the model
python train_exercise_model.py

# Test predictions
python predict_exercise.py
```

## 📊 What the Training Does

The `train_exercise_model.py` script will:

1. **Load Dataset**: Reads `period_exercise_dataset.csv`
2. **Encode Data**: Converts text categories to numbers
3. **Split Data**: 80% training, 20% testing
4. **Train Model**: Decision Tree classifier
5. **Evaluate**: Shows accuracy and confusion matrix
6. **Save Models**: Creates `exercise_model.joblib` and `label_encoders.joblib`

## 🧮 Expected Output

```
Accuracy: 0.95
Classification Report:
              precision    recall  f1-score   support
           0       0.95      0.95      0.95        20
           1       0.95      0.95      0.95        20
    accuracy                           0.95        40
   macro avg       0.95      0.95      0.95        40
weighted avg       0.95      0.95      0.95        40

✅ Model and encoders saved successfully!
```

## 🔧 Integration with SafeHer

After training, the model files will be automatically used by:
- `backend/python/ml_models/exercise_api.py`
- `backend/controllers/exerciseRecommendationController.js`

## 🐛 Troubleshooting

### Python Not Found
```
❌ Python not found! Please install Python 3.8+ from https://python.org
```
**Solution**: Install Python and ensure it's added to PATH

### Package Installation Failed
```
❌ Error installing packages
```
**Solution**: Try running as Administrator or use:
```bash
python -m pip install --user pandas scikit-learn joblib matplotlib seaborn
```

### Model Training Failed
```
❌ Error loading dataset
```
**Solution**: Ensure `period_exercise_dataset.csv` exists in the same directory

## 📁 File Structure After Setup

```
backend/python/ml_models/
├── period_exercise_dataset.csv    ← Input data
├── train_exercise_model.py        ← Training script
├── predict_exercise.py           ← Prediction script
├── exercise_model.joblib          ← Trained model (created)
├── label_encoders.joblib         ← Data encoders (created)
└── setup_and_train.bat           ← Setup script
```

## 🎯 Next Steps

1. **Train the Model**: Run the setup script
2. **Test Integration**: Use the existing SafeHer API endpoints
3. **Monitor Performance**: Check accuracy and user feedback
4. **Retrain**: Update dataset and retrain as needed

## 📞 Support

If you encounter issues:
1. Check Python installation
2. Verify all files are in the correct directory
3. Run the setup script as Administrator
4. Check the console output for specific error messages
