"""
Flask API for KNN Health Risk Assessment
SafeHer Project - Women's Health & Safety App

This module provides REST API endpoints for KNN-based health risk assessment
"""

from flask import Flask, request, jsonify
import json
import os
import sys
from datetime import datetime
import traceback

# Add the parent directory to the path to import our KNN model
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_models.health_risk_knn import HealthRiskKNN

app = Flask(__name__)

# Global model instance
knn_model = None

def load_knn_model():
    """Load the trained KNN model"""
    global knn_model
    try:
        knn_model = HealthRiskKNN()
        model_path = 'python/models/health_risk_knn_model.pkl'
        
        if os.path.exists(model_path):
            knn_model.load_model(model_path)
            print("✅ KNN model loaded successfully")
            return True
        else:
            print("⚠️  KNN model not found. Training new model...")
            # Train a new model if none exists
            df = knn_model.generate_synthetic_health_data(num_samples=1000)
            X, y = knn_model.prepare_features(df)
            knn_model.train_model(X, y)
            knn_model.save_model(model_path)
            print("✅ New KNN model trained and saved")
            return True
    except Exception as e:
        print(f"❌ Error loading KNN model: {e}")
        traceback.print_exc()
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'KNN Health Risk Assessment API',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': knn_model is not None
    })

@app.route('/predict', methods=['POST'])
def predict_health_risk():
    """
    Predict health risk using KNN model
    
    Expected JSON payload:
    {
        "age": 30,
        "bmi": 25.5,
        "systolic": 120,
        "diastolic": 80,
        "heart_rate": 75,
        "blood_sugar": 95,
        "cholesterol": 200,
        "iron_level": 120
    }
    """
    try:
        if knn_model is None:
            return jsonify({
                'error': 'Model not loaded',
                'message': 'KNN model is not available'
            }), 500
        
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Please provide vital signs data in JSON format'
            }), 400
        
        # Validate required fields
        required_fields = [
            'age', 'bmi', 'systolic', 'diastolic', 
            'heart_rate', 'blood_sugar', 'cholesterol', 'iron_level'
        ]
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'message': f'Missing fields: {missing_fields}',
                'required_fields': required_fields
            }), 400
        
        # Validate data types and ranges
        validation_errors = []
        
        # Age validation
        if not isinstance(data['age'], (int, float)) or data['age'] < 0 or data['age'] > 120:
            validation_errors.append('age must be a number between 0 and 120')
        
        # BMI validation
        if not isinstance(data['bmi'], (int, float)) or data['bmi'] < 10 or data['bmi'] > 60:
            validation_errors.append('bmi must be a number between 10 and 60')
        
        # Blood pressure validation
        if not isinstance(data['systolic'], (int, float)) or data['systolic'] < 50 or data['systolic'] > 250:
            validation_errors.append('systolic must be a number between 50 and 250')
        
        if not isinstance(data['diastolic'], (int, float)) or data['diastolic'] < 30 or data['diastolic'] > 150:
            validation_errors.append('diastolic must be a number between 30 and 150')
        
        # Heart rate validation
        if not isinstance(data['heart_rate'], (int, float)) or data['heart_rate'] < 30 or data['heart_rate'] > 200:
            validation_errors.append('heart_rate must be a number between 30 and 200')
        
        # Blood sugar validation
        if not isinstance(data['blood_sugar'], (int, float)) or data['blood_sugar'] < 50 or data['blood_sugar'] > 500:
            validation_errors.append('blood_sugar must be a number between 50 and 500')
        
        # Cholesterol validation
        if not isinstance(data['cholesterol'], (int, float)) or data['cholesterol'] < 100 or data['cholesterol'] > 400:
            validation_errors.append('cholesterol must be a number between 100 and 400')
        
        # Iron level validation
        if not isinstance(data['iron_level'], (int, float)) or data['iron_level'] < 20 or data['iron_level'] > 300:
            validation_errors.append('iron_level must be a number between 20 and 300')
        
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'message': 'Invalid data provided',
                'validation_errors': validation_errors
            }), 400
        
        # Make prediction
        prediction = knn_model.predict_health_risk(data)
        
        # Add metadata
        prediction['timestamp'] = datetime.now().isoformat()
        prediction['model_info'] = {
            'algorithm': 'K-Nearest Neighbors',
            'version': '1.0',
            'features_used': knn_model.feature_names
        }
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'input_data': data
        })
        
    except Exception as e:
        print(f"❌ Error in prediction: {e}")
        traceback.print_exc()
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """
    Predict health risk for multiple records
    
    Expected JSON payload:
    {
        "records": [
            {
                "age": 30, "bmi": 25.5, "systolic": 120, "diastolic": 80,
                "heart_rate": 75, "blood_sugar": 95, "cholesterol": 200, "iron_level": 120
            },
            {
                "age": 45, "bmi": 32.1, "systolic": 150, "diastolic": 95,
                "heart_rate": 90, "blood_sugar": 140, "cholesterol": 250, "iron_level": 80
            }
        ]
    }
    """
    try:
        if knn_model is None:
            return jsonify({
                'error': 'Model not loaded',
                'message': 'KNN model is not available'
            }), 500
        
        data = request.get_json()
        
        if not data or 'records' not in data:
            return jsonify({
                'error': 'No records provided',
                'message': 'Please provide records array in JSON format'
            }), 400
        
        records = data['records']
        
        if not isinstance(records, list) or len(records) == 0:
            return jsonify({
                'error': 'Invalid records format',
                'message': 'Records must be a non-empty array'
            }), 400
        
        if len(records) > 100:  # Limit batch size
            return jsonify({
                'error': 'Too many records',
                'message': 'Maximum 100 records allowed per batch'
            }), 400
        
        predictions = []
        errors = []
        
        for i, record in enumerate(records):
            try:
                prediction = knn_model.predict_health_risk(record)
                predictions.append({
                    'record_index': i,
                    'prediction': prediction,
                    'input_data': record
                })
            except Exception as e:
                errors.append({
                    'record_index': i,
                    'error': str(e),
                    'input_data': record
                })
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'errors': errors,
            'total_records': len(records),
            'successful_predictions': len(predictions),
            'failed_predictions': len(errors),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Error in batch prediction: {e}")
        traceback.print_exc()
        return jsonify({
            'error': 'Batch prediction failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/model_info', methods=['GET'])
def get_model_info():
    """Get information about the loaded KNN model"""
    try:
        if knn_model is None:
            return jsonify({
                'error': 'Model not loaded',
                'message': 'KNN model is not available'
            }), 500
        
        model_info = {
            'algorithm': 'K-Nearest Neighbors',
            'version': '1.0',
            'features': knn_model.feature_names,
            'risk_categories': knn_model.risk_categories,
            'model_parameters': {
                'n_neighbors': knn_model.model.n_neighbors if knn_model.model else None,
                'weights': knn_model.model.weights if knn_model.model else None,
                'algorithm': knn_model.model.algorithm if knn_model.model else None
            },
            'feature_count': len(knn_model.feature_names),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'model_info': model_info
        })
        
    except Exception as e:
        print(f"❌ Error getting model info: {e}")
        return jsonify({
            'error': 'Failed to get model info',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/retrain', methods=['POST'])
def retrain_model():
    """
    Retrain the KNN model with new parameters
    
    Expected JSON payload:
    {
        "num_samples": 2000,
        "k": 7,
        "weights": "distance",
        "algorithm": "auto"
    }
    """
    try:
        data = request.get_json() or {}
        
        # Get parameters
        num_samples = data.get('num_samples', 2000)
        k = data.get('k', 5)
        weights = data.get('weights', 'distance')
        algorithm = data.get('algorithm', 'auto')
        
        # Validate parameters
        if not isinstance(num_samples, int) or num_samples < 100 or num_samples > 10000:
            return jsonify({
                'error': 'Invalid num_samples',
                'message': 'num_samples must be an integer between 100 and 10000'
            }), 400
        
        if not isinstance(k, int) or k < 1 or k > 50:
            return jsonify({
                'error': 'Invalid k parameter',
                'message': 'k must be an integer between 1 and 50'
            }), 400
        
        if weights not in ['uniform', 'distance']:
            return jsonify({
                'error': 'Invalid weights parameter',
                'message': 'weights must be "uniform" or "distance"'
            }), 400
        
        if algorithm not in ['auto', 'ball_tree', 'kd_tree', 'brute']:
            return jsonify({
                'error': 'Invalid algorithm parameter',
                'message': 'algorithm must be one of: auto, ball_tree, kd_tree, brute'
            }), 400
        
        # Create new model instance
        global knn_model
        knn_model = HealthRiskKNN(k=k, weights=weights, algorithm=algorithm)
        
        # Generate training data
        df = knn_model.generate_synthetic_health_data(num_samples=num_samples)
        
        # Prepare features and train
        X, y = knn_model.prepare_features(df)
        results = knn_model.train_model(X, y)
        
        # Save model
        knn_model.save_model()
        
        return jsonify({
            'success': True,
            'message': 'Model retrained successfully',
            'training_results': results,
            'model_parameters': {
                'k': k,
                'weights': weights,
                'algorithm': algorithm,
                'num_samples': num_samples
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Error retraining model: {e}")
        traceback.print_exc()
        return jsonify({
            'error': 'Retraining failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    print("🚀 Starting KNN Health Risk Assessment API...")
    
    # Load model on startup
    if load_knn_model():
        print("✅ KNN model loaded successfully")
        print("🌐 API endpoints available:")
        print("   - GET  /health - Health check")
        print("   - POST /predict - Single prediction")
        print("   - POST /predict_batch - Batch prediction")
        print("   - GET  /model_info - Model information")
        print("   - POST /retrain - Retrain model")
        print("\n🔗 API running on: http://localhost:5002")
        app.run(host='0.0.0.0', port=5002, debug=True)
    else:
        print("❌ Failed to load KNN model. Exiting...")
        sys.exit(1)
