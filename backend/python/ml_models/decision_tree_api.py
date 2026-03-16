"""
Flask API for Decision Tree Pregnancy Health Prediction
SafeHer Project - Women's Health & Safety App

This module provides REST API endpoints for Decision Tree-based pregnancy health prediction
"""

from flask import Flask, request, jsonify
import json
import os
import sys
from datetime import datetime
import traceback

# Add the parent directory to the path to import our Decision Tree model
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_models.pregnancy_decision_tree import PregnancyDecisionTree

app = Flask(__name__)

# Global model instance
decision_tree = None

def load_decision_tree_models():
    """Load the trained Decision Tree models"""
    global decision_tree
    try:
        decision_tree = PregnancyDecisionTree()
        model_path = 'python/models/pregnancy_decision_tree_models.pkl'
        
        if os.path.exists(model_path):
            decision_tree.load_models(model_path)
            print("✅ Decision Tree models loaded successfully")
            return True
        else:
            print("⚠️  Decision Tree models not found. Training new models...")
            # Train new models if none exist
            df = decision_tree.generate_synthetic_pregnancy_data(num_samples=2000)
            
            # Train health risk models
            X_risk, y_risk, y_risk_labels = decision_tree.prepare_health_risk_features(df)
            decision_tree.train_health_risk_models(X_risk, y_risk, y_risk_labels)
            
            # Train complications models
            X_comp, y_comp, y_comp_labels = decision_tree.prepare_complications_features(df)
            decision_tree.train_complications_models(X_comp, y_comp, y_comp_labels)
            
            decision_tree.save_models(model_path)
            print("✅ New Decision Tree models trained and saved")
            return True
    except Exception as e:
        print(f"❌ Error loading Decision Tree models: {e}")
        traceback.print_exc()
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Decision Tree Pregnancy Health Prediction API',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': decision_tree is not None,
        'available_models': list(decision_tree.models.keys()) if decision_tree else []
    })

@app.route('/predict_health_risk', methods=['POST'])
def predict_health_risk():
    """
    Predict pregnancy health risk using Decision Tree
    
    Expected JSON payload:
    {
        "week": 25,
        "age": 32,
        "weight": 68,
        "weight_gain": 8,
        "systolic": 135,
        "diastolic": 85,
        "blood_sugar": 120,
        "mood": "anxious",
        "energy": 4,
        "stress": 7,
        "sleep_hours": 6,
        "sleep_quality": "fair",
        "meals_eaten": 3,
        "water_intake": 2.5,
        "exercise": true,
        "exercise_duration": 30,
        "kick_count": 5,
        "symptoms": {
            "fatigue": true,
            "back_pain": true,
            "heartburn": true,
            "swelling": false
        }
    }
    """
    try:
        if decision_tree is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'Decision Tree models are not available'
            }), 500
        
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Please provide pregnancy data in JSON format'
            }), 400
        
        # Validate required fields
        required_fields = ['week', 'age', 'weight', 'systolic', 'diastolic']
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'message': f'Missing fields: {missing_fields}',
                'required_fields': required_fields
            }), 400
        
        # Validate data types and ranges
        validation_errors = []
        
        # Week validation
        if not isinstance(data['week'], (int, float)) or data['week'] < 1 or data['week'] > 40:
            validation_errors.append('week must be a number between 1 and 40')
        
        # Age validation
        if not isinstance(data['age'], (int, float)) or data['age'] < 18 or data['age'] > 50:
            validation_errors.append('age must be a number between 18 and 50')
        
        # Weight validation
        if not isinstance(data['weight'], (int, float)) or data['weight'] < 40 or data['weight'] > 150:
            validation_errors.append('weight must be a number between 40 and 150')
        
        # Blood pressure validation
        if not isinstance(data['systolic'], (int, float)) or data['systolic'] < 80 or data['systolic'] > 200:
            validation_errors.append('systolic must be a number between 80 and 200')
        
        if not isinstance(data['diastolic'], (int, float)) or data['diastolic'] < 40 or data['diastolic'] > 120:
            validation_errors.append('diastolic must be a number between 40 and 120')
        
        # Mood validation
        valid_moods = decision_tree.mood_categories
        if 'mood' in data and data['mood'] not in valid_moods:
            validation_errors.append(f'mood must be one of: {valid_moods}')
        
        # Sleep quality validation
        valid_sleep_quality = decision_tree.sleep_quality_categories
        if 'sleep_quality' in data and data['sleep_quality'] not in valid_sleep_quality:
            validation_errors.append(f'sleep_quality must be one of: {valid_sleep_quality}')
        
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'message': 'Invalid data provided',
                'validation_errors': validation_errors
            }), 400
        
        # Set defaults for optional fields
        data.setdefault('weight_gain', 5)
        data.setdefault('blood_sugar', 85)
        data.setdefault('mood', 'neutral')
        data.setdefault('energy', 5)
        data.setdefault('stress', 5)
        data.setdefault('sleep_hours', 8)
        data.setdefault('sleep_quality', 'good')
        data.setdefault('meals_eaten', 3)
        data.setdefault('water_intake', 2.5)
        data.setdefault('exercise', False)
        data.setdefault('exercise_duration', 0)
        data.setdefault('kick_count', 0)
        data.setdefault('symptoms', {})
        
        # Make prediction
        prediction = decision_tree.predict_health_risk(data)
        
        # Add metadata
        prediction['timestamp'] = datetime.now().isoformat()
        prediction['model_info'] = {
            'algorithm': 'Decision Tree',
            'version': '1.0',
            'features_used': len(decision_tree.feature_names.get('health_risk', []))
        }
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'input_data': data
        })
        
    except Exception as e:
        print(f"❌ Error in health risk prediction: {e}")
        traceback.print_exc()
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict_complications', methods=['POST'])
def predict_complications():
    """
    Predict pregnancy complications using Decision Tree
    
    Expected JSON payload:
    {
        "week": 25,
        "age": 32,
        "weight": 68,
        "weight_gain": 8,
        "systolic": 135,
        "diastolic": 85,
        "blood_sugar": 120,
        "mood": "anxious",
        "energy": 4,
        "stress": 7,
        "sleep_hours": 6,
        "meals_eaten": 3,
        "water_intake": 2.5,
        "exercise": true,
        "exercise_duration": 30,
        "symptoms": {
            "fatigue": true,
            "back_pain": true,
            "heartburn": true,
            "swelling": false
        }
    }
    """
    try:
        if decision_tree is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'Decision Tree models are not available'
            }), 500
        
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Please provide pregnancy data in JSON format'
            }), 400
        
        # Validate required fields
        required_fields = ['week', 'age', 'weight', 'systolic', 'diastolic']
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'message': f'Missing fields: {missing_fields}',
                'required_fields': required_fields
            }), 400
        
        # Validate data types and ranges
        validation_errors = []
        
        # Week validation
        if not isinstance(data['week'], (int, float)) or data['week'] < 1 or data['week'] > 40:
            validation_errors.append('week must be a number between 1 and 40')
        
        # Age validation
        if not isinstance(data['age'], (int, float)) or data['age'] < 18 or data['age'] > 50:
            validation_errors.append('age must be a number between 18 and 50')
        
        # Weight validation
        if not isinstance(data['weight'], (int, float)) or data['weight'] < 40 or data['weight'] > 150:
            validation_errors.append('weight must be a number between 40 and 150')
        
        # Blood pressure validation
        if not isinstance(data['systolic'], (int, float)) or data['systolic'] < 80 or data['systolic'] > 200:
            validation_errors.append('systolic must be a number between 80 and 200')
        
        if not isinstance(data['diastolic'], (int, float)) or data['diastolic'] < 40 or data['diastolic'] > 120:
            validation_errors.append('diastolic must be a number between 40 and 120')
        
        if validation_errors:
            return jsonify({
                'error': 'Validation failed',
                'message': 'Invalid data provided',
                'validation_errors': validation_errors
            }), 400
        
        # Set defaults for optional fields
        data.setdefault('weight_gain', 5)
        data.setdefault('blood_sugar', 85)
        data.setdefault('mood', 'neutral')
        data.setdefault('energy', 5)
        data.setdefault('stress', 5)
        data.setdefault('sleep_hours', 8)
        data.setdefault('meals_eaten', 3)
        data.setdefault('water_intake', 2.5)
        data.setdefault('exercise', False)
        data.setdefault('exercise_duration', 0)
        data.setdefault('symptoms', {})
        
        # Make prediction
        prediction = decision_tree.predict_complications(data)
        
        # Add metadata
        prediction['timestamp'] = datetime.now().isoformat()
        prediction['model_info'] = {
            'algorithm': 'Decision Tree',
            'version': '1.0',
            'features_used': len(decision_tree.feature_names.get('complications', []))
        }
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'input_data': data
        })
        
    except Exception as e:
        print(f"❌ Error in complications prediction: {e}")
        traceback.print_exc()
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    """
    Predict both health risk and complications for multiple records
    
    Expected JSON payload:
    {
        "records": [
            {
                "week": 20, "age": 28, "weight": 65, "systolic": 120, "diastolic": 80,
                "mood": "happy", "energy": 6, "stress": 4
            },
            {
                "week": 30, "age": 35, "weight": 70, "systolic": 140, "diastolic": 90,
                "mood": "anxious", "energy": 3, "stress": 8
            }
        ]
    }
    """
    try:
        if decision_tree is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'Decision Tree models are not available'
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
                record.setdefault('weight_gain', 5)
                record.setdefault('blood_sugar', 85)
                record.setdefault('mood', 'neutral')
                record.setdefault('energy', 5)
                record.setdefault('stress', 5)
                record.setdefault('sleep_hours', 8)
                record.setdefault('sleep_quality', 'good')
                record.setdefault('meals_eaten', 3)
                record.setdefault('water_intake', 2.5)
                record.setdefault('exercise', False)
                record.setdefault('exercise_duration', 0)
                record.setdefault('kick_count', 0)
                record.setdefault('symptoms', {})
                
                # Make both predictions
                health_risk_prediction = decision_tree.predict_health_risk(record)
                complications_prediction = decision_tree.predict_complications(record)
                
                predictions.append({
                    'record_index': i,
                    'health_risk_prediction': health_risk_prediction,
                    'complications_prediction': complications_prediction,
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
    """Get information about the loaded Decision Tree models"""
    try:
        if decision_tree is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'Decision Tree models are not available'
            }), 500
        
        model_info = {
            'algorithm': 'Decision Tree',
            'version': '1.0',
            'available_models': list(decision_tree.models.keys()),
            'health_risk_categories': decision_tree.health_risk_categories,
            'complications': decision_tree.complications,
            'trimesters': decision_tree.trimesters,
            'mood_categories': decision_tree.mood_categories,
            'sleep_quality_categories': decision_tree.sleep_quality_categories,
            'pregnancy_symptoms': decision_tree.pregnancy_symptoms,
            'feature_counts': {
                'health_risk': len(decision_tree.feature_names.get('health_risk', [])),
                'complications': len(decision_tree.feature_names.get('complications', []))
            },
            'model_types': {
                model_name: type(model).__name__ 
                for model_name, model in decision_tree.models.items()
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
    """Get feature importance from Decision Tree models"""
    try:
        if decision_tree is None:
            return jsonify({
                'error': 'Models not loaded',
                'message': 'Decision Tree models are not available'
            }), 500
        
        model_type = request.args.get('model_type', 'health_risk')
        
        if model_type not in decision_tree.models:
            return jsonify({
                'error': 'Invalid model type',
                'message': f'Available model types: {list(decision_tree.models.keys())}'
            }), 400
        
        importance = decision_tree.get_feature_importance(model_type)
        
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
    Retrain the Decision Tree models with new parameters
    
    Expected JSON payload:
    {
        "num_samples": 3000,
        "health_risk_models": ["DecisionTree", "RandomForest"],
        "complications_models": ["DecisionTree", "ExtraTrees"]
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
        global decision_tree
        decision_tree = PregnancyDecisionTree()
        
        # Generate training data
        df = decision_tree.generate_synthetic_pregnancy_data(num_samples=num_samples)
        
        # Train health risk models
        X_risk, y_risk, y_risk_labels = decision_tree.prepare_health_risk_features(df)
        risk_results = decision_tree.train_health_risk_models(X_risk, y_risk, y_risk_labels)
        
        # Train complications models
        X_comp, y_comp, y_comp_labels = decision_tree.prepare_complications_features(df)
        comp_results = decision_tree.train_complications_models(X_comp, y_comp, y_comp_labels)
        
        # Save models
        decision_tree.save_models()
        
        return jsonify({
            'success': True,
            'message': 'Models retrained successfully',
            'training_results': {
                'health_risk': {
                    model_name: {
                        'accuracy': results['accuracy'],
                        'f1_score': results['f1_score']
                    } for model_name, results in risk_results.items()
                },
                'complications': {
                    model_name: {
                        'accuracy': results['accuracy'],
                        'f1_score': results['f1_score']
                    } for model_name, results in comp_results.items()
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
    print("🚀 Starting Decision Tree Pregnancy Health Prediction API...")
    
    # Load models on startup
    if load_decision_tree_models():
        print("✅ Decision Tree models loaded successfully")
        print("🌐 API endpoints available:")
        print("   - GET  /health - Health check")
        print("   - POST /predict_health_risk - Predict health risk")
        print("   - POST /predict_complications - Predict complications")
        print("   - POST /predict_batch - Batch prediction")
        print("   - GET  /model_info - Model information")
        print("   - GET  /feature_importance - Feature importance")
        print("   - POST /retrain - Retrain models")
        print("\n🔗 API running on: http://localhost:5004")
        app.run(host='0.0.0.0', port=5004, debug=True)
    else:
        print("❌ Failed to load Decision Tree models. Exiting...")
        sys.exit(1)
