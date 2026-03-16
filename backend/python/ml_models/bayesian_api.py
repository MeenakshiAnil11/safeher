"""
Flask API for Bayesian Symptom Classification
SafeHer Project - Women's Health & Safety App

This module provides REST API endpoints for Bayesian-based symptom classification
"""

from flask import Flask, request, jsonify
import json
import os
import sys
from datetime import datetime
import traceback

# Add the parent directory to the path to import our Bayesian classifier
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_models.symptom_bayesian_classifier import SymptomBayesianClassifier

app = Flask(__name__)

# Global model instance
bayesian_classifier = None

def load_bayesian_models():
    """Load the trained Bayesian models"""
    global bayesian_classifier
    try:
        bayesian_classifier = SymptomBayesianClassifier()
        model_path = 'python/models/symptom_bayesian_models.pkl'
        
        if os.path.exists(model_path):
            bayesian_classifier.load_models(model_path)
            print("✅ Bayesian models loaded successfully")
            return True
        else:
            print("⚠️  Bayesian models not found. Training new models...")
            # Train new models if none exist
            df = bayesian_classifier.generate_synthetic_symptom_data(num_samples=2000)
            
            # Train classification models
            X_class, y_class, y_class_labels = bayesian_classifier.prepare_symptom_classification_features(df)
            bayesian_classifier.train_symptom_classification_models(X_class, y_class, y_class_labels)
            
            # Train severity models
            X_severity, y_severity, y_severity_labels = bayesian_classifier.prepare_severity_prediction_features(df)
            bayesian_classifier.train_severity_prediction_models(X_severity, y_severity, y_severity_labels)
            
            bayesian_classifier.save_models(model_path)
            print("✅ New Bayesian models trained and saved")
            return True
    except Exception as e:
        print(f"❌ Error loading Bayesian models: {e}")
        traceback.print_exc()
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Bayesian Symptom Classification API',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': bayesian_classifier is not None,
        'available_models': list(bayesian_classifier.models.keys()) if bayesian_classifier else []
    })

@app.route('/predict_category', methods=['POST'])
def predict_symptom_category():
    """
    Predict symptom category using Bayesian classifier
    
    Expected JSON payload:
    {
        "age": 30,
        "symptoms": ["fatigue", "headache", "mood_swings"],
        "mood": "Tired",
        "sleep_hours": 6.5,
        "stress_level": 7,
        "energy_level": 3,
        "hour_of_day": 14,
        "day_of_week": 2
    }
    """
    try:
        if bayesian_classifier is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'Bayesian models are not available'
            }), 500
        
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Please provide symptom data in JSON format'
            }), 400
        
        # Validate required fields
        required_fields = ['age', 'symptoms', 'mood']
        
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
        
        # Symptoms validation
        if not isinstance(data['symptoms'], list) or len(data['symptoms']) == 0:
            validation_errors.append('symptoms must be a non-empty array')
        
        # Mood validation
        valid_moods = bayesian_classifier.mood_categories
        if data['mood'] not in valid_moods:
            validation_errors.append(f'mood must be one of: {valid_moods}')
        
        # Optional fields with defaults
        data.setdefault('sleep_hours', 7.5)
        data.setdefault('stress_level', 5)
        data.setdefault('energy_level', 5)
        data.setdefault('hour_of_day', 12)
        data.setdefault('day_of_week', 3)
        
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'message': 'Invalid data provided',
                'validation_errors': validation_errors
            }), 400
        
        # Make prediction
        prediction = bayesian_classifier.predict_symptom_category(data)
        
        # Add metadata
        prediction['timestamp'] = datetime.now().isoformat()
        prediction['model_info'] = {
            'algorithm': 'Bayesian Classifier',
            'version': '1.0',
            'features_used': len(bayesian_classifier.feature_names.get('classification', []))
        }
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'input_data': data
        })
        
    except Exception as e:
        print(f"❌ Error in category prediction: {e}")
        traceback.print_exc()
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict_severity', methods=['POST'])
def predict_severity():
    """
    Predict symptom severity using Bayesian classifier
    
    Expected JSON payload:
    {
        "age": 30,
        "symptoms": ["fatigue", "headache", "mood_swings"],
        "mood": "Tired",
        "sleep_hours": 6.5,
        "stress_level": 7,
        "energy_level": 3,
        "hour_of_day": 14,
        "day_of_week": 2
    }
    """
    try:
        if bayesian_classifier is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'Bayesian models are not available'
            }), 500
        
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Please provide symptom data in JSON format'
            }), 400
        
        # Validate required fields
        required_fields = ['age', 'symptoms', 'mood']
        
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
        
        # Symptoms validation
        if not isinstance(data['symptoms'], list) or len(data['symptoms']) == 0:
            validation_errors.append('symptoms must be a non-empty array')
        
        # Mood validation
        valid_moods = bayesian_classifier.mood_categories
        if data['mood'] not in valid_moods:
            validation_errors.append(f'mood must be one of: {valid_moods}')
        
        # Optional fields with defaults
        data.setdefault('sleep_hours', 7.5)
        data.setdefault('stress_level', 5)
        data.setdefault('energy_level', 5)
        data.setdefault('hour_of_day', 12)
        data.setdefault('day_of_week', 3)
        
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'message': 'Invalid data provided',
                'validation_errors': validation_errors
            }), 400
        
        # Make prediction
        prediction = bayesian_classifier.predict_severity(data)
        
        # Add metadata
        prediction['timestamp'] = datetime.now().isoformat()
        prediction['model_info'] = {
            'algorithm': 'Bayesian Classifier',
            'version': '1.0',
            'features_used': len(bayesian_classifier.feature_names.get('severity', []))
        }
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'input_data': data
        })
        
    except Exception as e:
        print(f"❌ Error in severity prediction: {e}")
        traceback.print_exc()
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """
    Predict both category and severity for multiple records
    
    Expected JSON payload:
    {
        "records": [
            {
                "age": 25, "symptoms": ["fatigue"], "mood": "Tired",
                "sleep_hours": 8, "stress_level": 3, "energy_level": 4
            },
            {
                "age": 40, "symptoms": ["headache", "anxiety"], "mood": "Anxious",
                "sleep_hours": 5, "stress_level": 8, "energy_level": 2
            }
        ]
    }
    """
    try:
        if bayesian_classifier is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'Bayesian models are not available'
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
        
        if len(records) > 50:  # Limit batch size
            return jsonify({
                'error': 'Too many records',
                'message': 'Maximum 50 records allowed per batch'
            }), 400
        
        predictions = []
        errors = []
        
        for i, record in enumerate(records):
            try:
                # Set defaults for missing fields
                record.setdefault('sleep_hours', 7.5)
                record.setdefault('stress_level', 5)
                record.setdefault('energy_level', 5)
                record.setdefault('hour_of_day', 12)
                record.setdefault('day_of_week', 3)
                
                # Make both predictions
                category_prediction = bayesian_classifier.predict_symptom_category(record)
                severity_prediction = bayesian_classifier.predict_severity(record)
                
                predictions.append({
                    'record_index': i,
                    'category_prediction': category_prediction,
                    'severity_prediction': severity_prediction,
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
    """Get information about the loaded Bayesian models"""
    try:
        if bayesian_classifier is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'Bayesian models are not available'
            }), 500
        
        model_info = {
            'algorithm': 'Bayesian Classifiers',
            'version': '1.0',
            'available_models': list(bayesian_classifier.models.keys()),
            'symptom_categories': bayesian_classifier.symptom_categories,
            'severity_levels': bayesian_classifier.severity_levels,
            'mood_categories': bayesian_classifier.mood_categories,
            'feature_counts': {
                'classification': len(bayesian_classifier.feature_names.get('classification', [])),
                'severity': len(bayesian_classifier.feature_names.get('severity', []))
            },
            'model_types': {
                model_name: type(model).__name__ 
                for model_name, model in bayesian_classifier.models.items()
            },
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

@app.route('/symptom_categories', methods=['GET'])
def get_symptom_categories():
    """Get available symptom categories and mappings"""
    try:
        if bayesian_classifier is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'Bayesian models are not available'
            }), 500
        
        return jsonify({
            'success': True,
            'symptom_categories': bayesian_classifier.symptom_categories,
            'symptom_mapping': bayesian_classifier.symptom_mapping,
            'severity_levels': bayesian_classifier.severity_levels,
            'mood_categories': bayesian_classifier.mood_categories,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Error getting symptom categories: {e}")
        return jsonify({
            'error': 'Failed to get symptom categories',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/retrain', methods=['POST'])
def retrain_models():
    """
    Retrain the Bayesian models with new parameters
    
    Expected JSON payload:
    {
        "num_samples": 3000,
        "classification_models": ["GaussianNB", "MultinomialNB"],
        "severity_models": ["GaussianNB", "BernoulliNB"]
    }
    """
    try:
        data = request.get_json() or {}
        
        # Get parameters
        num_samples = data.get('num_samples', 3000)
        
        # Validate parameters
        if not isinstance(num_samples, int) or num_samples < 500 or num_samples > 10000:
            return jsonify({
                'error': 'Invalid num_samples',
                'message': 'num_samples must be an integer between 500 and 10000'
            }), 400
        
        # Create new model instance
        global bayesian_classifier
        bayesian_classifier = SymptomBayesianClassifier()
        
        # Generate training data
        df = bayesian_classifier.generate_synthetic_symptom_data(num_samples=num_samples)
        
        # Train classification models
        X_class, y_class, y_class_labels = bayesian_classifier.prepare_symptom_classification_features(df)
        classification_results = bayesian_classifier.train_symptom_classification_models(X_class, y_class, y_class_labels)
        
        # Train severity models
        X_severity, y_severity, y_severity_labels = bayesian_classifier.prepare_severity_prediction_features(df)
        severity_results = bayesian_classifier.train_severity_prediction_models(X_severity, y_severity, y_severity_labels)
        
        # Save models
        bayesian_classifier.save_models()
        
        return jsonify({
            'success': True,
            'message': 'Models retrained successfully',
            'training_results': {
                'classification': {
                    model_name: {
                        'accuracy': results['accuracy'],
                        'f1_score': results['f1_score']
                    } for model_name, results in classification_results.items()
                },
                'severity': {
                    model_name: {
                        'accuracy': results['accuracy'],
                        'f1_score': results['f1_score']
                    } for model_name, results in severity_results.items()
                }
            },
            'model_parameters': {
                'num_samples': num_samples
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Error retraining models: {e}")
        traceback.print_exc()
        return jsonify({
            'error': 'Retraining failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Bayesian Symptom Classification API...")
    
    # Load models on startup
    if load_bayesian_models():
        print("✅ Bayesian models loaded successfully")
        print("🌐 API endpoints available:")
        print("   - GET  /health - Health check")
        print("   - POST /predict_category - Predict symptom category")
        print("   - POST /predict_severity - Predict symptom severity")
        print("   - POST /predict_batch - Batch prediction")
        print("   - GET  /model_info - Model information")
        print("   - GET  /symptom_categories - Available categories")
        print("   - POST /retrain - Retrain models")
        print("\n🔗 API running on: http://localhost:5003")
        app.run(host='0.0.0.0', port=5003, debug=True)
    else:
        print("❌ Failed to load Bayesian models. Exiting...")
        sys.exit(1)
