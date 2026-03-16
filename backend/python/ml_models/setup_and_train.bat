@echo off
echo.
echo ============================================
echo   SafeHer ML Exercise Recommendation Setup
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo.
    echo Please install Python 3.8 or later:
    echo   1. Visit: https://python.org/downloads/
    echo   2. Download Python 3.11.x (or latest)
    echo   3. IMPORTANT: Check "Add Python to PATH" during installation
    echo   4. Restart your computer
    echo   5. Run this script again
    echo.
    echo Or open: PYTHON_INSTALLATION_GUIDE.md for detailed instructions
    echo.
    pause
    exit /b 1
)

echo [OK] Python found!
python --version
echo.

echo Installing required packages...
python -m pip install --upgrade pip
python -m pip install pandas scikit-learn joblib matplotlib seaborn

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install packages
    echo Please run as Administrator or check your internet connection
    pause
    exit /b 1
)

echo.
echo [OK] Packages installed successfully!
echo.
echo Training the ML model...
echo.

python train_exercise_model.py

if %errorlevel% neq 0 (
    echo [ERROR] Model training failed
    pause
    exit /b 1
)

echo.
echo Testing predictions...
echo.

python predict_exercise.py

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo Your ML Exercise Recommendation model is ready!
echo.
echo Next steps:
echo   1. Model files created: exercise_model.joblib, label_encoders.joblib
echo   2. The API will automatically use these files
echo   3. You can start using exercise recommendations in SafeHer
echo.
pause