# 🌐 **ML Integration Guide - SafeHer Website**

## 🎯 **How to Check ML Features Work Inside Your Website**

### **Step 1: Add ML Routes to Your Backend**

First, let's add the ML routes to your main server:

```javascript
// Add this to your backend/server.js or app.js
const healthRiskRoutes = require('./routes/healthRiskRoutes');
const symptomClassificationRoutes = require('./routes/symptomClassificationRoutes');
const pregnancyHealthRoutes = require('./routes/pregnancyHealthRoutes');
const moodPredictionRoutes = require('./routes/moodPredictionRoutes');

// Add ML routes
app.use('/api/health-risk', healthRiskRoutes);
app.use('/api/symptom-classification', symptomClassificationRoutes);
app.use('/api/pregnancy/health-prediction', pregnancyHealthRoutes);
app.use('/api/mood/prediction', moodPredictionRoutes);
```

---

## 🧩 **Step 2: Create ML Components for Frontend**

### **2.1: Health Risk Assessment Component**

Create `client/src/components/HealthRiskPrediction.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import './HealthRiskPrediction.css';

const HealthRiskPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    bmi: '',
    systolic: '',
    diastolic: '',
    heart_rate: '',
    blood_sugar: '',
    cholesterol: '',
    iron_level: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/health-risk/prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setPrediction(data.prediction);
      } else {
        setError(data.message || 'Prediction failed');
      }
    } catch (err) {
      setError('Failed to get prediction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low Risk': return '#4CAF50';
      case 'Moderate Risk': return '#FFC107';
      case 'High Risk': return '#FF9800';
      case 'Critical Risk': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="health-risk-prediction">
      <h2>🔍 Health Risk Assessment</h2>
      
      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>BMI</label>
          <input
            type="number"
            name="bmi"
            value={formData.bmi}
            onChange={handleInputChange}
            step="0.1"
            required
          />
        </div>

        <div className="form-group">
          <label>Systolic BP</label>
          <input
            type="number"
            name="systolic"
            value={formData.systolic}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Diastolic BP</label>
          <input
            type="number"
            name="diastolic"
            value={formData.diastolic}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Heart Rate</label>
          <input
            type="number"
            name="heart_rate"
            value={formData.heart_rate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Blood Sugar</label>
          <input
            type="number"
            name="blood_sugar"
            value={formData.blood_sugar}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Cholesterol</label>
          <input
            type="number"
            name="cholesterol"
            value={formData.cholesterol}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Iron Level</label>
          <input
            type="number"
            name="iron_level"
            value={formData.iron_level}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="predict-btn">
          {loading ? 'Analyzing...' : 'Get Health Risk Assessment'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {prediction && (
        <div className="prediction-result">
          <h3>📊 Health Risk Assessment Result</h3>
          <div 
            className="risk-card"
            style={{ borderColor: getRiskColor(prediction.health_risk) }}
          >
            <div className="risk-level">
              {prediction.health_risk}
            </div>
            <div className="confidence">
              Confidence: {prediction.confidence}%
            </div>
            <div className="model-info">
              Model: {prediction.model_used}
            </div>
          </div>

          <div className="risk-probabilities">
            <h4>Risk Probabilities:</h4>
            {Object.entries(prediction.risk_probabilities).map(([risk, prob]) => (
              <div key={risk} className="probability-bar">
                <span className="risk-name">{risk}</span>
                <div className="bar-container">
                  <div 
                    className="bar"
                    style={{ 
                      width: `${prob}%`,
                      backgroundColor: getRiskColor(risk)
                    }}
                  ></div>
                  <span className="percentage">{prob}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRiskPrediction;
```

### **2.2: Create CSS for Health Risk Component**

Create `client/src/components/HealthRiskPrediction.css`:

```css
.health-risk-prediction {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.prediction-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
}

.predict-btn {
  grid-column: 1 / -1;
  padding: 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.predict-btn:hover:not(:disabled) {
  background: #0056b3;
}

.predict-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
}

.prediction-result {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.risk-card {
  text-align: center;
  padding: 20px;
  border: 3px solid;
  border-radius: 10px;
  margin: 20px 0;
}

.risk-level {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.confidence {
  font-size: 18px;
  color: #666;
  margin-bottom: 10px;
}

.model-info {
  font-size: 14px;
  color: #888;
}

.risk-probabilities {
  margin-top: 20px;
}

.probability-bar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.risk-name {
  width: 120px;
  font-weight: 600;
}

.bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.bar {
  height: 20px;
  border-radius: 10px;
  margin-right: 10px;
  transition: width 0.3s;
}

.percentage {
  font-weight: 600;
  min-width: 50px;
}
```

---

## 🔗 **Step 3: Add ML Components to Your Pages**

### **3.1: Add to Health Page**

Update `client/src/pages/Health.jsx`:

```jsx
import React from 'react';
import HealthRiskPrediction from '../components/HealthRiskPrediction';

const Health = () => {
  return (
    <div className="health-page">
      <h1>Health Dashboard</h1>
      
      {/* Add your existing health content */}
      
      {/* Add ML Health Risk Assessment */}
      <section className="ml-features">
        <HealthRiskPrediction />
      </section>
    </div>
  );
};

export default Health;
```

### **3.2: Add to Period Tracker**

Update `client/src/pages/PeriodTracker/PregnancyDashboard.jsx`:

```jsx
import React from 'react';
import PregnancyHealthPrediction from '../components/PregnancyHealthPrediction';

const PregnancyDashboard = () => {
  return (
    <div className="pregnancy-dashboard">
      {/* Add your existing pregnancy content */}
      
      {/* Add ML Pregnancy Health Prediction */}
      <section className="ml-pregnancy-features">
        <PregnancyHealthPrediction />
      </section>
    </div>
  );
};

export default PregnancyDashboard;
```

---

## 🧪 **Step 4: How to Check ML Features Work**

### **4.1: Start Your Backend with ML APIs**

```powershell
# Terminal 1: Start Node.js backend
cd backend
npm start

# Terminal 2: Start KNN API
cd backend/python/ml_models
python knn_api.py

# Terminal 3: Start Bayesian API
python bayesian_api.py

# Terminal 4: Start Decision Tree API
python decision_tree_api.py

# Terminal 5: Start SVM API
python svm_api.py
```

### **4.2: Start Your React Frontend**

```powershell
# Terminal 6: Start React frontend
cd client
npm start
```

### **4.3: Test ML Features in Browser**

1. **Open your website**: `http://localhost:3000`
2. **Login to your account**
3. **Navigate to Health page**
4. **Fill out the Health Risk Assessment form**
5. **Click "Get Health Risk Assessment"**
6. **Check if you see the prediction result**

---

## ✅ **What to Look For (Success Indicators)**

### **✅ Health Risk Assessment Working:**
- Form submits without errors
- Shows "Analyzing..." while loading
- Displays risk level (Low/Moderate/High/Critical)
- Shows confidence percentage
- Shows risk probabilities bar chart
- Risk card has appropriate color

### **✅ Pregnancy Health Prediction Working:**
- Shows pregnancy health risk
- Shows complications prediction
- Displays recommendations
- Shows trends over time

### **✅ Mood Prediction Working:**
- Shows predicted mood (Happy/Sad/Anxious/etc.)
- Shows mood intensity (1-10 scale)
- Shows mood probabilities
- Displays lifestyle recommendations

### **✅ Symptom Classification Working:**
- Classifies symptoms into categories
- Shows confidence scores
- Provides symptom insights

---

## 🚨 **Troubleshooting**

### **If ML Features Don't Work:**

#### **1. Check Browser Console**
- Press F12 → Console tab
- Look for red error messages
- Common errors: "Failed to fetch", "401 Unauthorized", "500 Internal Server Error"

#### **2. Check Network Tab**
- Press F12 → Network tab
- Try the ML feature
- Look for failed requests (red entries)
- Check response status codes

#### **3. Check Backend Logs**
- Look at your Node.js terminal
- Look at Python API terminals
- Check for error messages

#### **4. Common Issues & Solutions:**

**Issue**: "Failed to fetch"
**Solution**: Check if Python APIs are running on correct ports

**Issue**: "401 Unauthorized" 
**Solution**: Check if user is logged in and token is valid

**Issue**: "500 Internal Server Error"
**Solution**: Check if ML models are trained and loaded

**Issue**: "Connection refused"
**Solution**: Start all Python APIs

---

## 🎯 **Quick Test Checklist**

### **Test Each ML Feature:**

1. **Health Risk Assessment**
   - [ ] Form loads correctly
   - [ ] Can input data
   - [ ] Submit button works
   - [ ] Shows loading state
   - [ ] Displays prediction result
   - [ ] Shows confidence score
   - [ ] Shows risk probabilities

2. **Pregnancy Health Prediction**
   - [ ] Component loads
   - [ ] Shows current pregnancy data
   - [ ] Displays health risk
   - [ ] Shows complications
   - [ ] Provides recommendations

3. **Mood Prediction**
   - [ ] Component loads
   - [ ] Shows mood prediction
   - [ ] Shows intensity level
   - [ ] Displays probabilities

4. **Symptom Classification**
   - [ ] Form loads
   - [ ] Can select symptoms
   - [ ] Shows classification result
   - [ ] Displays confidence

---

## 🎉 **Success!**

If all features work correctly, you'll see:
- ✅ ML predictions display in your website
- ✅ Real-time health assessments
- ✅ Personalized recommendations
- ✅ Interactive ML dashboards
- ✅ No console errors
- ✅ Smooth user experience

**Your ML implementations are now working inside your SafeHer website! 🚀**
