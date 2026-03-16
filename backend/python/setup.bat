@echo off

echo 🚀 Setting up Python ML environment for ovulation prediction...

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️  Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo 📥 Installing dependencies...
pip install pandas numpy scikit-learn tensorflow joblib matplotlib

REM Optional: TensorFlow.js converter
set /p INSTALL_TFJS="Install TensorFlow.js converter? (y/n) "
if "%INSTALL_TFJS%"=="y" (
    pip install tensorflowjs
)

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Activate environment: venv\Scripts\activate
echo 2. Generate data: python generate_synthetic_data.py
echo 3. Train model: python train_ovulation_model.py

pause

