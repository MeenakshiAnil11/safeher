# 🚀 **Quick Integration Guide - Add ML to Your Website**

## **Step 1: Add ML Routes to Backend**

Add this to your `backend/server.js` or `backend/app.js`:

```javascript
// Add ML routes
const healthRiskRoutes = require('./routes/healthRiskRoutes');
const symptomClassificationRoutes = require('./routes/symptomClassificationRoutes');
const pregnancyHealthRoutes = require('./routes/pregnancyHealthRoutes');
const moodPredictionRoutes = require('./routes/moodPredictionRoutes');

app.use('/api/health-risk', healthRiskRoutes);
app.use('/api/symptom-classification', symptomClassificationRoutes);
app.use('/api/pregnancy/health-prediction', pregnancyHealthRoutes);
app.use('/api/mood/prediction', moodPredictionRoutes);
```

---

## **Step 2: Add ML Dashboard to Your Health Page**

Update `client/src/pages/Health.jsx`:

```jsx
import React from 'react';
import MLDashboard from '../components/MLDashboard';

const Health = () => {
  return (
    <div className="health-page">
      {/* Your existing health content */}
      
      {/* Add ML Dashboard */}
      <section className="ml-section">
        <MLDashboard />
      </section>
    </div>
  );
};

export default Health;
```

---

## **Step 3: Start All Services**

### **Terminal 1: Start Node.js Backend**
```powershell
cd backend
npm start
```

### **Terminal 2: Start KNN API**
```powershell
cd backend/python/ml_models
python knn_api.py
```

### **Terminal 3: Start Bayesian API**
```powershell
python bayesian_api.py
```

### **Terminal 4: Start Decision Tree API**
```powershell
python decision_tree_api.py
```

### **Terminal 5: Start SVM API**
```powershell
python svm_api.py
```

### **Terminal 6: Start React Frontend**
```powershell
cd client
npm start
```

---

## **Step 4: Test ML Features in Browser**

1. **Open**: `http://localhost:3000`
2. **Login** to your account
3. **Go to Health page**
4. **Click on "Health Risk" tab**
5. **Fill out the form** with sample data:
   - Age: 30
   - BMI: 25
   - Systolic BP: 120
   - Diastolic BP: 80
   - Heart Rate: 70
   - Blood Sugar: 90
   - Cholesterol: 180
   - Iron Level: 15
6. **Click "Get Health Risk Assessment"**
7. **Check if you see the prediction result**

---

## **Step 5: Test Mood Prediction**

1. **Click on "Mood Prediction" tab**
2. **Fill out the form** with sample data:
   - Age: 28
   - Sleep Hours: 8
   - Work Stress: 4
   - Exercise Duration: 45
   - Cycle Phase: Ovulation
   - Weather: Sunny
   - Social Interaction: 6
   - Meditation Time: 20
3. **Click "Predict My Mood"**
4. **Check if you see the mood prediction**

---

## **✅ Success Indicators**

### **Health Risk Assessment Working:**
- ✅ Form submits without errors
- ✅ Shows "Analyzing..." while loading
- ✅ Displays risk level (Low/Moderate/High/Critical)
- ✅ Shows confidence percentage
- ✅ Shows risk probabilities bar chart
- ✅ Risk card has appropriate color

### **Mood Prediction Working:**
- ✅ Form submits without errors
- ✅ Shows "Analyzing Mood..." while loading
- ✅ Displays predicted mood (Happy/Sad/Anxious/etc.)
- ✅ Shows confidence percentage
- ✅ Shows mood probabilities bar chart
- ✅ Mood card has appropriate color

---

## **🚨 Troubleshooting**

### **If ML Features Don't Work:**

#### **1. Check Browser Console (F12)**
- Look for red error messages
- Common errors: "Failed to fetch", "401 Unauthorized", "500 Internal Server Error"

#### **2. Check Network Tab (F12)**
- Look for failed requests (red entries)
- Check response status codes

#### **3. Check Backend Logs**
- Look at your Node.js terminal
- Look at Python API terminals

#### **4. Common Issues & Solutions:**

**Issue**: "Failed to fetch"
**Solution**: Check if Python APIs are running on correct ports (5002, 5003, 5004, 5005)

**Issue**: "401 Unauthorized" 
**Solution**: Check if user is logged in and token is valid

**Issue**: "500 Internal Server Error"
**Solution**: Check if ML models are trained and loaded

**Issue**: "Connection refused"
**Solution**: Start all Python APIs

---

## **🎯 Quick Test Checklist**

- [ ] All 6 terminals are running
- [ ] Website loads at `http://localhost:3000`
- [ ] Can login to account
- [ ] Health page shows ML Dashboard
- [ ] Health Risk form works
- [ ] Mood Prediction form works
- [ ] Predictions display correctly
- [ ] No console errors
- [ ] No network errors

---

## **🎉 Success!**

If all features work correctly, you'll see:
- ✅ ML predictions display in your website
- ✅ Real-time health assessments
- ✅ Interactive ML dashboard
- ✅ No console errors
- ✅ Smooth user experience

**Your ML implementations are now working inside your SafeHer website! 🚀**

---

## **📝 Next Steps**

1. **Add to other pages** (Pregnancy, Period Tracker)
2. **Test with real user data**
3. **Improve UI/UX**
4. **Add more ML features**
5. **Deploy to production**
