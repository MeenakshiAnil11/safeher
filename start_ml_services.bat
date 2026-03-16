@echo off
echo 🚀 Starting SafeHer ML Services...
echo.

echo 📋 Starting services in separate windows...
echo.

echo Starting Node.js Backend...
start "SafeHer Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting KNN Health Risk API...
start "KNN API" cmd /k "cd backend/python/ml_models && python knn_api.py"

timeout /t 2 /nobreak >nul

echo Starting Bayesian Symptom Classification API...
start "Bayesian API" cmd /k "cd backend/python/ml_models && python bayesian_api.py"

timeout /t 2 /nobreak >nul

echo Starting Decision Tree Pregnancy Health API...
start "Decision Tree API" cmd /k "cd backend/python/ml_models && python decision_tree_api.py"

timeout /t 2 /nobreak >nul

echo Starting SVM Mood Prediction API...
start "SVM API" cmd /k "cd backend/python/ml_models && python svm_api.py"

timeout /t 2 /nobreak >nul

echo Starting React Frontend...
start "SafeHer Frontend" cmd /k "cd client && npm start"

echo.
echo ✅ All services are starting!
echo.
echo 🌐 Your website will be available at: http://localhost:3000
echo 🤖 ML APIs will be available at:
echo    - KNN Health Risk: http://localhost:5002
echo    - Bayesian Symptoms: http://localhost:5003  
echo    - Decision Tree Pregnancy: http://localhost:5004
echo    - SVM Mood Prediction: http://localhost:5005
echo.
echo 📝 To test ML features:
echo    1. Open http://localhost:3000
echo    2. Login to your account
echo    3. Go to Health page
echo    4. Click "AI Health Assistant" tab
echo    5. Test Health Risk Assessment and Mood Prediction
echo.
pause
