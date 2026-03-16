# ML Testing & Validation Guide

Complete guide for testing and validating your ML ovulation prediction model.

---

## 🧪 Testing Overview

### Test Categories
1. **Unit Tests** - Test ML predictor component
2. **Integration Tests** - Test API endpoints
3. **Model Evaluation** - Test ML model performance
4. **End-to-End Tests** - Test complete flow

---

## 📝 Step 6: Testing

### 6.1 Test TFJS Predictor

```powershell
# Run test script
cd backend
node scripts/test_predict.js
```

**Expected Output:**
```
🧪 Testing TensorFlow.js Ovulation Predictor
============================================================

📊 Test Data:
   Logs: 12 days
   Cycle Days: 10 to 21

🔮 Making prediction...

✅ Prediction Result:
{
  "fertile": true,
  "fertile_probability": 87.5,
  "not_fertile_probability": 12.5,
  "confidence": 75,
  "raw_probability": 0.875,
  "features": [36.5, 0.15, 36.6, 5, 1, 18],
  "normalized_features": [-0.2, 0.1, 0.3, 0.4, 0.5, 0]
}

📋 Summary:
   Fertile: Yes ✅
   Fertile Probability: 87.5%
   Confidence: 75%
   Raw Probability: 0.8750

✅ Test completed successfully!
```

### 6.2 Evaluate Model Performance (Python)

```powershell
# Run evaluation script
cd backend/python
.\venv\Scripts\Activate.ps1
python evaluate_model.py
```

**Output Metrics:**
- Accuracy
- AUC-ROC
- Precision
- Recall
- Specificity
- F1 Score
- Confusion Matrix

### 6.3 Test API Endpoints

```powershell
# Test comprehensive insights endpoint
curl http://localhost:5000/api/fertility/comprehensive-insights \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test Python Flask API
curl http://localhost:5001/health
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "cycle_day": 14,
    "bbt": 36.6,
    "cervical_mucus": "egg-white",
    "ovulation_test": "positive"
  }'
```

### 6.4 Integration Test

```javascript
// backend/tests/integration/fertility-ml.test.js
import { describe, it, expect } from 'vitest';
import { getOvulationPredictor } from '../../services/ml/ovulationPredictor.js';

describe('ML Integration Tests', () => {
  it('should predict fertility status', async () => {
    const predictor = getOvulationPredictor();
    
    const logs = [
      { bbt: 36.2, cervicalMucus: 'dry', ovulationTest: 'negative', cycleDay: 10 },
      { bbt: 36.6, cervicalMucus: 'egg-white', ovulationTest: 'positive', cycleDay: 14 }
    ];
    
    const result = await predictor.predictFromRecentLogs(logs);
    
    expect(result.fertile).toBeDefined();
    expect(result.fertile_probability).toBeGreaterThanOrEqual(0);
    expect(result.fertile_probability).toBeLessThanOrEqual(100);
  });
});
```

---

## 📊 Performance Metrics

### Target Metrics
- **Accuracy**: ≥85%
- **AUC-ROC**: ≥0.85
- **Precision**: ≥80%
- **Recall**: ≥75%
- **F1 Score**: ≥0.77

### Interpreting Results

**AUC-ROC (Area Under ROC Curve):**
- 0.9-1.0: Excellent 🟢
- 0.8-0.9: Good 🟡
- 0.7-0.8: Fair 🟠
- <0.7: Poor 🔴

**Confusion Matrix:**
```
               Predicted
            Not Fertile  Fertile
Actual Not        TN        FP
      Fertile     FN        TP
```

**Metrics from Confusion Matrix:**
- **Precision**: TP / (TP + FP)
- **Recall**: TP / (TP + FN)
- **Specificity**: TN / (TN + FP)

---

## 🎯 Step 7: Fine-Tuning & Personalization

### Per-User Model Fine-Tuning

```python
# backend/python/personalize_model.py
import tensorflow as tf
from tensorflow import keras

def fine_tune_for_user(user_id, user_data):
    """
    Fine-tune global model for specific user
    """
    # Load global model
    global_model = keras.models.load_model('models/ovulation_model.h5')
    
    # Prepare user data
    X_user, y_user = prepare_features_from_user(user_data)
    
    # Fine-tune (transfer learning)
    for layer in global_model.layers[:-1]:
        layer.trainable = False  # Freeze all except last layer
    
    global_model.fit(
        X_user, y_user,
        epochs=10,
        batch_size=8,
        verbose=1
    )
    
    # Save user-specific model
    user_model_path = f'models/user_{user_id}_model.h5'
    global_model.save(user_model_path)
    
    print(f"✅ User-specific model saved: {user_model_path}")

def check_and_use_user_model(user_id, logs):
    """
    Use user-specific model if exists, else use global
    """
    user_model_path = f'models/user_{user_id}_model.h5'
    
    if os.path.exists(user_model_path):
        model = keras.models.load_model(user_model_path)
        print(f"Using personalized model for user {user_id}")
    else:
        model = keras.models.load_model('models/ovulation_model.h5')
        print("Using global model")
    
    # Make prediction
    prediction = model.predict(logs)
    return prediction
```

### Implementation in Node.js

```javascript
// backend/services/ml/personalizedPredictor.js
import fs from 'fs';
import path from 'path';

export class PersonalizedPredictor {
  constructor(userId) {
    this.userId = userId;
    this.globalPredictor = null;
  }
  
  async getPredictor() {
    // Check if user has personalized model
    const userModelPath = path.join(
      process.cwd(),
      'python/models',
      `user_${this.userId}_model.h5`
    );
    
    if (fs.existsSync(userModelPath)) {
      // Use personalized model
      console.log(`Using personalized model for user ${this.userId}`);
      // Load TFJS converted user model
      return await this.loadUserModel();
    } else {
      // Use global model
      const { getOvulationPredictor } = await import('./ovulationPredictor.js');
      return getOvulationPredictor();
    }
  }
  
  async predict(logs) {
    const predictor = await this.getPredictor();
    return await predictor.predictFromRecentLogs(logs);
  }
}
```

---

## 🚀 Step 8: Deployment & Automation

### 8.1 Caching Predictions

```javascript
// backend/controllers/fertilityController.js
import { cachePredictions } from '../utils/cache.js';

export const getComprehensiveInsights = async (req, res) => {
  const userId = req.userId;
  
  // Check cache first
  const cached = await cachePredictions.get(userId);
  if (cached && !isCacheStale(cached)) {
    return res.json(cached);
  }
  
  // Compute new predictions
  const insights = await computeInsights(userId);
  
  // Cache for 1 hour
  await cachePredictions.set(userId, insights, 3600);
  
  res.json(insights);
};
```

### 8.2 Automated Retraining

```javascript
// backend/jobs/retrainModel.js
import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function scheduleModelRetraining() {
  // Retrain model weekly
  cron.schedule('0 2 * * 0', async () => {
    console.log('🔄 Starting weekly model retraining...');
    
    try {
      await execAsync('cd python && python train_ovulation_model.py');
      await execAsync('cd python && python convert_to_tfjs.py');
      console.log('✅ Model retrained successfully');
    } catch (error) {
      console.error('❌ Model retraining failed:', error);
    }
  });
}
```

### 8.3 Monitoring & Alerts

```javascript
// backend/utils/monitor.js
export class MLMonitor {
  static async trackPrediction(userId, prediction, actual) {
    // Log prediction for monitoring
    await logPrediction({
      userId,
      prediction,
      actual,
      timestamp: new Date()
    });
    
    // Check for drift
    const recentAccuracy = await this.getRecentAccuracy(userId);
    if (recentAccuracy < 0.7) {
      await this.sendAlert('Model performance degraded');
    }
  }
  
  static async getRecentAccuracy(userId, days = 7) {
    // Calculate accuracy from recent predictions
    // Compare predictions vs actual outcomes
    return 0.85; // Example
  }
}
```

---

## 📋 Testing Checklist

### Pre-Deployment Tests
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Model evaluation metrics meet targets
- [ ] API endpoints return correct format
- [ ] Caching works properly
- [ ] Fallback mechanisms work
- [ ] Error handling is robust
- [ ] Performance is acceptable (<100ms)

### Production Monitoring
- [ ] Track prediction accuracy
- [ ] Monitor API response times
- [ ] Alert on model performance drift
- [ ] Log prediction requests
- [ ] Monitor resource usage

---

## 🐛 Troubleshooting

### Test Fails: "Model not found"
```powershell
# Train and convert model first
cd backend/python
python train_ovulation_model.py
python convert_to_tfjs.py
```

### Test Fails: "TensorFlow not loaded"
```powershell
# Install TensorFlow.js
npm install @tensorflow/tfjs-node
```

### Low Accuracy
- Check feature engineering
- Verify data quality
- Increase training data
- Tune hyperparameters

### Slow Predictions
- Check if caching is enabled
- Verify model size
- Monitor server resources
- Consider model optimization

---

## 📊 Success Criteria

✅ **Model Evaluation**
- Accuracy > 85%
- AUC > 0.85
- Precision > 80%
- Recall > 75%

✅ **Performance**
- Prediction time < 100ms
- API response < 200ms
- No memory leaks

✅ **Reliability**
- Fallback works
- Error handling robust
- Logging complete

✅ **Scalability**
- Handles concurrent requests
- Caching effective
- Database optimized

---

**Ready for production! 🚀**

