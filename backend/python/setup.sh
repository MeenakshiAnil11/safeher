#!/bin/bash

echo "🚀 Setting up Python ML environment for ovulation prediction..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install pandas numpy scikit-learn tensorflow joblib matplotlib

# Optional: TensorFlow.js converter
read -p "Install TensorFlow.js converter? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    pip install tensorflowjs
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Activate environment: source venv/bin/activate"
echo "2. Generate data: python generate_synthetic_data.py"
echo "3. Train model: python train_ovulation_model.py"

