

from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
import joblib
import os

app = Flask(__name__)

# Global variables
model = None
scaler = None
model_loaded = False

def load_model():
    """Load the trained model and scaler"""
    global model, scaler, model_loaded
    
    try:
        # Load model
        model_path = 'models/ovulation_model.h5'
        if os.path.exists(model_path):
            model = tf.keras.models.load_model(model_path)
            print(f"✅ Model loaded from {model_path}")
        else:
            print(f"⚠️  Model file not found: {model_path}")
            return False
        
        # Load scaler
        scaler_path = 'models/feature_scaler.pkl'
        if os.path.exists(scaler_path):
            scaler = joblib.load(scaler_path)
            print(f"✅ Scaler loaded from {scaler_path}")
        else:
            print(f"⚠️  Scaler file not found: {scaler_path}")
            return False
        
        model_loaded = True
        return True
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model_loaded
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict fertility status based on input features
    
    Expected JSON body:
    {
        "cycle_day": 14,
        "bbt": 36.5,
        "cervical_mucus": "egg-white",
        "ovulation_test": "positive",
        "intercourse": true,
        "energy": 8,
        "stress": 3,
        "sleep_hours": 8.5
    }
    """
    if not model_loaded:
        return jsonify({
            'error': 'Model not loaded'
        }), 503
    
    try:
        # Get input data
        data = request.json
        
        # Feature mapping
        cervical_mucus_map = {
            "dry": 0,
            "sticky": 1,
            "creamy": 2,
            "watery": 3,
            "egg-white": 4
        }
        
        ovulation_test_map = {
            "negative": 0,
            "positive": 1,
            "peak": 1,
            "not-tested": 0
        }
        
        # Extract and encode features
        features = np.array([[
            data.get('cycle_day', 14),
            data.get('bbt', 36.5),
            cervical_mucus_map.get(data.get('cervical_mucus', 'dry'), 0),
            ovulation_test_map.get(data.get('ovulation_test', 'negative'), 0),
            1 if data.get('intercourse', False) else 0,
            data.get('energy', 5),
            data.get('stress', 5),
            data.get('sleep_hours', 7.5)
        ]])
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction_proba = model.predict(features_scaled, verbose=0)[0][0]
        prediction = 1 if prediction_proba >= 0.5 else 0
        confidence = abs(prediction_proba - 0.5) * 2  # Convert to 0-1 scale
        
        # Additional insights
        fertile_probability = prediction_proba * 100
        not_fertile_probability = (1 - prediction_proba) * 100
        
        return jsonify({
            'fertile': bool(prediction),
            'fertile_probability': round(fertile_probability, 2),
            'not_fertile_probability': round(not_fertile_probability, 2),
            'confidence': round(confidence * 100, 2),
            'raw_prediction': float(prediction_proba)
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 400

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """
    Predict fertility for multiple days
    
    Expected JSON body:
    {
        "records": [
            {
                "cycle_day": 14,
                "bbt": 36.5,
                ...
            },
            ...
        ]
    }
    """
    if not model_loaded:
        return jsonify({
            'error': 'Model not loaded'
        }), 503
    
    try:
        data = request.json
        records = data.get('records', [])
        
        if not records:
            return jsonify({
                'error': 'No records provided'
            }), 400
        
        # Encode features
        cervical_mucus_map = {"dry": 0, "sticky": 1, "creamy": 2, "watery": 3, "egg-white": 4}
        ovulation_test_map = {"negative": 0, "positive": 1, "peak": 1, "not-tested": 0}
        
        features_list = []
        for record in records:
            features_list.append([
                record.get('cycle_day', 14),
                record.get('bbt', 36.5),
                cervical_mucus_map.get(record.get('cervical_mucus', 'dry'), 0),
                ovulation_test_map.get(record.get('ovulation_test', 'negative'), 0),
                1 if record.get('intercourse', False) else 0,
                record.get('energy', 5),
                record.get('stress', 5),
                record.get('sleep_hours', 7.5)
            ])
        
        features = np.array(features_list)
        features_scaled = scaler.transform(features)
        
        # Make predictions
        predictions_proba = model.predict(features_scaled, verbose=0)
        
        results = []
        for i, prediction_proba in enumerate(predictions_proba):
            fertile = bool(prediction_proba[0] >= 0.5)
            confidence = abs(prediction_proba[0] - 0.5) * 2
            
            results.append({
                'fertile': fertile,
                'fertile_probability': round(prediction_proba[0] * 100, 2),
                'confidence': round(confidence * 100, 2),
                'raw_prediction': float(prediction_proba[0])
            })
        
        return jsonify({
            'results': results
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 400

if __name__ == '__main__':
    print("🚀 Starting Ovulation Prediction API...")
    print("📁 Working directory:", os.getcwd())
    
    # Change to script directory for consistent paths
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print("📁 Changed to:", os.getcwd())
    
    # Load model
    if load_model():
        print("✅ Model loaded successfully")
        print("🌐 API available at http://localhost:5001")
        print("\nEndpoints:")
        print("  GET  /health - Health check")
        print("  POST /predict - Single prediction")
        print("  POST /predict_batch - Batch predictions")
        print("\nPress Ctrl+C to stop")
    else:
        print("❌ Failed to load model. Please train the model first.")
        print("Run: python train_ovulation_model.py")
        exit(1)
    
    # Start Flask app
    app.run(host='0.0.0.0', port=5001, debug=False)

