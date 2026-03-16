"""
Flask API for SVM Mood Prediction
SafeHer Project - Women's Health & Safety App

This module provides REST API endpoints for SVM-based mood prediction
"""

from flask import Flask, request, jsonify
import json
import os
import sys
from datetime import datetime
import traceback

# Add the parent directory to the path to import our SVM model
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_models.mood_svm_prediction import MoodSVMPredictor

app = Flask(__name__)

# Global model instance
svm_predictor = None

def load_svm_models():
    """Load the trained SVM models"""
    global svm_predictor
    try:
        svm_predictor = MoodSVMPredictor()
        model_path = 'python/models/mood_svm_models.pkl'
        
        if os.path.exists(model_path):
            svm_predictor.load_models(model_path)
            print("✅ SVM mood models loaded successfully")
            return True
        else:
            print("⚠️  SVM mood models not found. Training new models...")
            # Train new models if none exist
            df = svm_predictor.generate_synthetic_mood_data(num_samples=2000)
            
            # Train mood classification models
            X_classification, y_classification, y_classification_labels = svm_predictor.prepare_mood_classification_features(df)
            svm_predictor.train_mood_classification_models(X_classification, y_classification, y_classification_labels)
            
            # Train mood intensity models
            X_intensity, y_intensity = svm_predictor.prepare_mood_intensity_features(df)
            svm_predictor.train_mood_intensity_models(X_intensity, y_intensity)
            
            svm_predictor.save_models(model_path)
            print("✅ New SVM mood models trained and saved")
            return True
    except Exception as e:
        print(f"❌ Error loading SVM models: {e}")
        traceback.print_exc()
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'SVM Mood Prediction API',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': svm_predictor is not None,
        'available_models': list(svm_predictor.models.keys()) if svm_predictor else []
    })

@app.route('/predict_mood', methods=['POST'])
def predict_mood():
    """
    Predict mood using SVM
    
    Expected JSON payload:
    {
        "age": 28,
        "cycle_phase": "ovulation",
        "exercise_duration": 45,
        "sleep_hours": 8,
        "sleep_quality": "excellent",
        "water_intake": 3.0,
        "meals_eaten": 3,
        "caffeine_intake": 150,
        "social_interaction": 6,
        "work_stress": 4,
        "weather": "sunny",
        "social_media_time": 1.5,
        "outdoor_time": 2.5,
        "meditation_time": 20,
        "symptoms": {
            "fatigue": false,
            "headache": false,
            "mood_swings": false,
            "anxiety": false,
            "stress": false
        }
    }
    """
    try:
        if svm_predictor is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'SVM mood models are not available'
            }), 500
        
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Please provide mood data in JSON format'
            }), 400
        
        # Validate required fields
        required_fields = ['age', 'sleep_hours', 'work_stress']
        
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
        if not isinstance(data['age'], (int, float)) or data['age'] < 18 or data['age'] > 60:
            validation_errors.append('age must be a number between 18 and 60')
        
        # Sleep hours validation
        if not isinstance(data['sleep_hours'], (int, float)) or data['sleep_hours'] < 3 or data['sleep_hours'] > 15:
            validation_errors.append('sleep_hours must be a number between 3 and 15')
        
        # Work stress validation
        if not isinstance(data['work_stress'], (int, float)) or data['work_stress'] < 1 or data['work_stress'] > 10:
            validation_errors.append('work_stress must be a number between 1 and 10')
        
        # Cycle phase validation
        valid_cycle_phases = svm_predictor.cycle_phases
        if 'cycle_phase' in data and data['cycle_phase'] not in valid_cycle_phases:
            validation_errors.append(f'cycle_phase must be one of: {valid_cycle_phases}')
        
        # Weather validation
        valid_weather = svm_predictor.weather_conditions
        if 'weather' in data and data['weather'] not in valid_weather:
            validation_errors.append(f'weather must be one of: {valid_weather}')
        
        # Sleep quality validation
        valid_sleep_quality = svm_predictor.sleep_quality_levels
        if 'sleep_quality' in data and data['sleep_quality'] not in valid_sleep_quality:
            validation_errors.append(f'sleep_quality must be one of: {valid_sleep_quality}')
        
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'message': 'Invalid data provided',
                'validation_errors': validation_errors
            }), 400
        
        # Set defaults for optional fields
        data.setdefault('cycle_phase', 'follicular')
        data.setdefault('exercise_duration', 30)
        data.setdefault('sleep_quality', 'good')
        data.setdefault('water_intake', 2.5)
        data.setdefault('meals_eaten', 3)
        data.setdefault('caffeine_intake', 200)
        data.setdefault('social_interaction', 4)
        data.setdefault('weather', 'sunny')
        data.setdefault('social_media_time', 2)
        data.setdefault('outdoor_time', 1)
        data.setdefault('meditation_time', 10)
        data.setdefault('symptoms', {})
        
        # Make prediction
        prediction = svm_predictor.predict_mood(data)
        
        # Add metadata
        prediction['timestamp'] = datetime.now().isoformat()
        prediction['model_info'] = {
            'algorithm': 'SVM',
            'version': '1.0',
            'features_used': len(svm_predictor.feature_names.get('mood_classification', []))
        }
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'input_data': data
        })
        
    except Exception as e:
        print(f"❌ Error in mood prediction: {e}")
        traceback.print_exc()
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict_mood_intensity', methods=['POST'])
def predict_mood_intensity():
    """
    Predict mood intensity using SVM
    
    Expected JSON payload:
    {
        "age": 28,
        "cycle_phase": "ovulation",
        "exercise_duration": 45,
        "sleep_hours": 8,
        "sleep_quality": "excellent",
        "water_intake": 3.0,
        "meals_eaten": 3,
        "caffeine_intake": 150,
        "social_interaction": 6,
        "work_stress": 4,
        "weather": "sunny",
        "social_media_time": 1.5,
        "outdoor_time": 2.5,
        "meditation_time": 20,
        "symptoms": {
            "fatigue": false,
            "headache": false,
            "mood_swings": false,
            "anxiety": false,
            "stress": false
        }
    }
    """
    try:
        if svm_predictor is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'SVM mood models are not available'
            }), 500
        
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Please provide mood data in JSON format'
            }), 400
        
        # Validate required fields
        required_fields = ['age', 'sleep_hours', 'work_stress']
        
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
        if not isinstance(data['age'], (int, float)) or data['age'] < 18 or data['age'] > 60:
            validation_errors.append('age must be a number between 18 and 60')
        
        # Sleep hours validation
        if not isinstance(data['sleep_hours'], (int, float)) or data['sleep_hours'] < 3 or data['sleep_hours'] > 15:
            validation_errors.append('sleep_hours must be a number between 3 and 15')
        
        # Work stress validation
        if not isinstance(data['work_stress'], (int, float)) or data['work_stress'] < 1 or data['work_stress'] > 10:
            validation_errors.append('work_stress must be a number between 1 and 10')
        
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'message': 'Invalid data provided',
                'validation_errors': validation_errors
            }), 400
        
        # Set defaults for optional fields
        data.setdefault('cycle_phase', 'follicular')
        data.setdefault('exercise_duration', 30)
        data.setdefault('sleep_quality', 'good')
        data.setdefault('water_intake', 2.5)
        data.setdefault('meals_eaten', 3)
        data.setdefault('caffeine_intake', 200)
        data.setdefault('social_interaction', 4)
        data.setdefault('weather', 'sunny')
        data.setdefault('social_media_time', 2)
        data.setdefault('outdoor_time', 1)
        data.setdefault('meditation_time', 10)
        data.setdefault('symptoms', {})
        
        # Make prediction
        prediction = svm_predictor.predict_mood_intensity(data)
        
        # Add metadata
        prediction['timestamp'] = datetime.now().isoformat()
        prediction['model_info'] = {
            'algorithm': 'SVM',
            'version': '1.0',
            'features_used': len(svm_predictor.feature_names.get('mood_intensity', []))
        }
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'input_data': data
        })
        
    except Exception as e:
        print(f"❌ Error in mood intensity prediction: {e}")
        traceback.print_exc()
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """
    Predict both mood and intensity for multiple records
    
    Expected JSON payload:
    {
        "records": [
            {
                "age": 28, "sleep_hours": 8, "work_stress": 4,
                "exercise_duration": 45, "cycle_phase": "ovulation"
            },
            {
                "age": 32, "sleep_hours": 6, "work_stress": 8,
                "exercise_duration": 20, "cycle_phase": "menstrual"
            }
        ]
    }
    """
    try:
        if svm_predictor is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'SVM mood models are not available'
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
        
        if len(records) > 30:  # Limit batch size
            return jsonify({
                'error': 'Too many records',
                'message': 'Maximum 30 records allowed per batch'
            }), 400
        
        predictions = []
        errors = []
        
        for i, record in enumerate(records):
            try:
                # Set defaults for missing fields
                record.setdefault('cycle_phase', 'follicular')
                record.setdefault('exercise_duration', 30)
                record.setdefault('sleep_quality', 'good')
                record.setdefault('water_intake', 2.5)
                record.setdefault('meals_eaten', 3)
                record.setdefault('caffeine_intake', 200)
                record.setdefault('social_interaction', 4)
                record.setdefault('weather', 'sunny')
                record.setdefault('social_media_time', 2)
                record.setdefault('outdoor_time', 1)
                record.setdefault('meditation_time', 10)
                record.setdefault('symptoms', {})
                
                # Make both predictions
                mood_prediction = svm_predictor.predict_mood(record)
                intensity_prediction = svm_predictor.predict_mood_intensity(record)
                
                predictions.append({
                    'record_index': i,
                    'mood_prediction': mood_prediction,
                    'intensity_prediction': intensity_prediction,
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
    """Get information about the loaded SVM models"""
    try:
        if svm_predictor is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'SVM mood models are not available'
            }), 500
        
        model_info = {
            'algorithm': 'SVM',
            'version': '1.0',
            'available_models': list(svm_predictor.models.keys()),
            'mood_categories': svm_predictor.mood_categories,
            'mood_intensity_levels': svm_predictor.mood_intensity_levels,
            'mood_affecting_symptoms': svm_predictor.mood_affecting_symptoms,
            'lifestyle_factors': svm_predictor.lifestyle_factors,
            'cycle_phases': svm_predictor.cycle_phases,
            'weather_conditions': svm_predictor.weather_conditions,
            'sleep_quality_levels': svm_predictor.sleep_quality_levels,
            'feature_counts': {
                'mood_classification': len(svm_predictor.feature_names.get('mood_classification', [])),
                'mood_intensity': len(svm_predictor.feature_names.get('mood_intensity', []))
            },
            'model_types': {
                model_name: type(model).__name__ 
                for model_name, model in svm_predictor.models.items()
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

@app.route('/feature_importance', methods=['GET'])
def get_feature_importance():
    """Get feature importance from SVM models"""
    try:
        if svm_predictor is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'SVM mood models are not available'
            }), 500
        
        model_type = request.args.get('model_type', 'mood_classification')
        
        if model_type not in svm_predictor.models:
            return jsonify({
                'error': 'Invalid model type',
                'message': f'Available model types: {list(svm_predictor.models.keys())}'
            }), 400
        
        importance = svm_predictor.get_feature_importance(model_type)
        
        return jsonify({
            'success': True,
            'model_type': model_type,
            'feature_importance': importance,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Error getting feature importance: {e}")
        return jsonify({
            'error': 'Failed to get feature importance',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/retrain', methods=['POST'])
def retrain_models():
    """
    Retrain the SVM models with new parameters
    
    Expected JSON payload:
    {
        "num_samples": 3000,
        "classification_models": ["SVM_Linear", "SVM_RBF"],
        "intensity_models": ["SVR_Linear", "SVR_RBF"]
    }
    """
    try:
        data = request.get_json() or {}
        
        # Get parameters
        num_samples = data.get('num_samples', 3000)
        
        # Validate parameters
        if not isinstance(num_samples, int) or num_samples < 1000 or num_samples > 10000:
            return jsonify({
                'error': 'Invalid num_samples',
                'message': 'num_samples must be an integer between 1000 and 10000'
            }), 400
        
        # Create new model instance
        global svm_predictor
        svm_predictor = MoodSVMPredictor()
        
        # Generate training data
        df = svm_predictor.generate_synthetic_mood_data(num_samples=num_samples)
        
        # Train mood classification models
        X_classification, y_classification, y_classification_labels = svm_predictor.prepare_mood_classification_features(df)
        classification_results = svm_predictor.train_mood_classification_models(X_classification, y_classification, y_classification_labels)
        
        # Train mood intensity models
        X_intensity, y_intensity = svm_predictor.prepare_mood_intensity_features(df)
        intensity_results = svm_predictor.train_mood_intensity_models(X_intensity, y_intensity)
        
        # Save models
        svm_predictor.save_models()
        
        return jsonify({
            'success': True,
            'message': 'Models retrained successfully',
            'training_results': {
                'mood_classification': {
                    model_name: {
                        'accuracy': results['accuracy'],
                        'f1_score': results['f1_score']
                    } for model_name, results in classification_results.items()
                },
                'mood_intensity': {
                    model_name: {
                        'r2': results['r2'],
                        'mae': results['mae']
                    } for model_name, results in intensity_results.items()
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
    print("🚀 Starting SVM Mood Prediction API...")
    
    # Load models on startup
    if load_svm_models():
        print("✅ SVM mood models loaded successfully")
        print("🌐 API endpoints available:")
        print("   - GET  /health - Health check")
        print("   - POST /predict_mood - Predict mood")
        print("   - POST /predict_mood_intensity - Predict mood intensity")
        print("   - POST /predict_batch - Batch prediction")
        print("   - GET  /model_info - Model information")
        print("   - GET  /feature_importance - Feature importance")
        print("   - POST /retrain - Retrain models")
        print("\n🔗 API running on: http://localhost:5005")
        app.run(host='0.0.0.0', port=5005, debug=True)
    else:
        print("❌ Failed to load SVM models. Exiting...")
        sys.exit(1)
