"""
Flask API for Exercise Recommendation
Provides endpoints for phase detection and exercise recommendation
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from datetime import date, datetime
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from phase_utils import get_phase_info

app = Flask(__name__)
CORS(app)

# Global variables for model and encoders
model_data = None
phase_detection_enabled = True


def load_model():
    """Load the trained model and encoders."""
    global model_data
    
    model_path = 'exercise_model.joblib'
    encoders_path = 'label_encoders.joblib'
    
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        return False
    
    if not os.path.exists(encoders_path):
        print(f"❌ Encoders file not found: {encoders_path}")
        return False
    
    try:
        model = joblib.load(model_path)
        encoders = joblib.load(encoders_path)
        
        # Create model_data structure compatible with existing code
        model_data = {
            'model': model,
            'encoders': encoders,
            'class_names': encoders['recommended_exercise'].classes_
        }
        
        print("✅ Model and encoders loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False


def get_fallback_recommendation(phase, energy_level, cramps, stress_level):
    """Provide fallback recommendations when ML model is not available."""
    
    # Rule-based fallback recommendations
    if phase == 'menstruation':
        if cramps >= 6 or energy_level <= 3:
            return 'rest', 'High cramps and low energy - rest is recommended'
        elif cramps >= 4:
            return 'light_yoga', 'Gentle yoga can help with cramps and low energy'
        else:
            return 'walking', 'Light walking can help with energy during menstruation'
    
    elif phase == 'follicular':
        if energy_level >= 7:
            return 'cardio', 'High energy in follicular phase - cardio is ideal'
        elif energy_level >= 5:
            return 'strength', 'Good energy for strength training'
        else:
            return 'walking', 'Moderate energy - walking is a good choice'
    
    elif phase == 'ovulation':
        if energy_level >= 8:
            return 'cardio', 'Peak energy during ovulation - cardio is optimal'
        elif energy_level >= 6:
            return 'strength', 'High energy - strength training recommended'
        else:
            return 'walking', 'Moderate energy - walking is suitable'
    
    elif phase == 'luteal':
        if cramps >= 5 or energy_level <= 4:
            return 'meditation', 'Low energy and cramps - meditation is calming'
        elif energy_level >= 6:
            return 'walking', 'Moderate energy - walking is gentle and effective'
        else:
            return 'stretching', 'Low energy - stretching is gentle and beneficial'
    
    else:
        return 'walking', 'Default recommendation - walking is always safe'


def get_exercise_explanation(exercise_type, phase, day_in_cycle, energy_level, cramps):
    """Generate explanation for exercise recommendation."""
    
    explanations = {
        'rest': f"Rest is recommended because you're in day {day_in_cycle} of {phase} with energy level {energy_level} and cramps level {cramps}.",
        'light_yoga': f"Gentle yoga is perfect for {phase} phase (day {day_in_cycle}) - it helps with cramps and maintains gentle movement.",
        'stretching': f"Stretching is ideal for {phase} phase - it improves flexibility and helps with muscle tension.",
        'walking': f"Walking is a great choice for {phase} phase - it's gentle, boosts energy, and helps with circulation.",
        'cardio': f"Cardio is optimal for {phase} phase when energy is high - it maximizes your peak performance window.",
        'strength': f"Strength training is recommended for {phase} phase - your energy levels are suitable for building strength.",
        'meditation': f"Meditation is perfect for {phase} phase - it helps manage stress and promotes relaxation."
    }
    
    return explanations.get(exercise_type, f"{exercise_type} is recommended based on your current phase and symptoms.")


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model_data is not None,
        'phase_detection_enabled': phase_detection_enabled
    })


@app.route('/detect_phase', methods=['POST'])
def detect_phase():
    """Detect current menstrual phase."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Parse dates
        today = datetime.strptime(data.get('today', date.today().isoformat()), '%Y-%m-%d').date()
        start_dates = [datetime.strptime(d, '%Y-%m-%d').date() for d in data.get('period_start_dates', [])]
        period_lengths = data.get('period_lengths', [])
        
        # Get phase information
        phase_info = get_phase_info(today, start_dates, period_lengths)
        
        return jsonify({
            'success': True,
            'phase_info': phase_info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/recommend_exercise', methods=['POST'])
def recommend_exercise():
    """Recommend exercise based on phase and symptoms."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract features
        today = datetime.strptime(data.get('today', date.today().isoformat()), '%Y-%m-%d').date()
        start_dates = [datetime.strptime(d, '%Y-%m-%d').date() for d in data.get('period_start_dates', [])]
        period_lengths = data.get('period_lengths', [])
        
        energy_level = data.get('energy_level', 5)
        sleep_hours = data.get('sleep_hours', 7.5)
        mood = data.get('mood', 'neutral')
        cramps = data.get('cramps', 0)
        stress_level = data.get('stress_level', 'Medium')
        
        # Detect phase
        phase_info = get_phase_info(today, start_dates, period_lengths)
        phase = phase_info['phase']
        day_in_cycle = phase_info['day_in_cycle']
        
        # Prepare features for ML model (matching our new dataset structure)
        features = {
            'phase': phase,
            'energy_level': energy_level,
            'mood': mood,
            'cramps': cramps,
            'sleep_hours': sleep_hours,
            'stress_level': stress_level
        }
        
        # Get recommendation
        if model_data and model_data['model'] is not None:
            # Use ML model (matching our new dataset structure)
            prediction = model_data['model'].predict([[
                model_data['encoders']['phase'].transform([phase])[0],
                energy_level,
                model_data['encoders']['mood'].transform([mood])[0],
                cramps,
                sleep_hours,
                model_data['encoders']['stress_level'].transform([stress_level])[0]
            ]])[0]
            
            # Get probabilities
            probabilities = model_data['model'].predict_proba([[
                model_data['encoders']['phase'].transform([phase])[0],
                energy_level,
                model_data['encoders']['mood'].transform([mood])[0],
                cramps,
                sleep_hours,
                model_data['encoders']['stress_level'].transform([stress_level])[0]
            ]])[0]
            
            # Convert back to class name
            recommended_exercise = model_data['encoders']['recommended_exercise'].inverse_transform([prediction])[0]
            confidence = max(probabilities)
            
            # Get probabilities for all exercises
            exercise_probabilities = {}
            for i, exercise in enumerate(model_data['class_names']):
                exercise_probabilities[exercise] = float(probabilities[i])
            
            model_used = 'Decision Tree ML Model'
            
        else:
            # Use fallback
            recommended_exercise, explanation = get_fallback_recommendation(
                phase, energy_level, cramps, stress_level
            )
            confidence = 0.8  # High confidence for rule-based
            exercise_probabilities = {recommended_exercise: 0.8}
            model_used = 'Rule-based Fallback'
        
        # Generate explanation
        explanation = get_exercise_explanation(
            recommended_exercise, phase, day_in_cycle, energy_level, cramps
        )
        
        # Get safety notes
        safety_notes = get_safety_notes(recommended_exercise, phase, cramps)
        
        return jsonify({
            'success': True,
            'phase': phase,
            'day_in_cycle': day_in_cycle,
            'recommended_exercise': recommended_exercise,
            'confidence': confidence,
            'explanation': explanation,
            'safety_notes': safety_notes,
            'exercise_probabilities': exercise_probabilities,
            'model_used': model_used,
            'phase_info': phase_info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def get_safety_notes(exercise_type, phase, cramps):
    """Get safety notes for the recommended exercise."""
    
    safety_notes = {
        'rest': [
            "Listen to your body and rest when needed",
            "Gentle stretching can still be beneficial"
        ],
        'light_yoga': [
            "Avoid intense poses during heavy bleeding",
            "Stop if you feel dizzy or nauseous",
            "Focus on gentle, restorative poses"
        ],
        'stretching': [
            "Hold stretches for 30-60 seconds",
            "Don't force any positions",
            "Stop if you feel sharp pain"
        ],
        'walking': [
            "Start with a comfortable pace",
            "Stay hydrated",
            "Stop if you feel lightheaded"
        ],
        'cardio': [
            "Warm up properly before starting",
            "Monitor your heart rate",
            "Stop if you feel chest pain or difficulty breathing"
        ],
        'strength': [
            "Use proper form to prevent injury",
            "Start with lighter weights",
            "Don't hold your breath during lifts"
        ],
        'meditation': [
            "Find a quiet, comfortable space",
            "Focus on your breathing",
            "Don't judge your thoughts, just observe them"
        ]
    }
    
    notes = safety_notes.get(exercise_type, ["Listen to your body and stop if you feel pain"])
    
    # Add phase-specific notes
    if phase == 'menstruation' and cramps >= 5:
        notes.append("Consider using heat therapy for cramps")
        notes.append("Avoid high-impact activities during heavy bleeding")
    
    return notes


@app.route('/feedback', methods=['POST'])
def submit_feedback():
    """Submit feedback for exercise recommendations."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Log feedback (in a real app, you'd save this to a database)
        feedback = {
            'timestamp': datetime.now().isoformat(),
            'user_id': data.get('user_id'),
            'recommended_exercise': data.get('recommended_exercise'),
            'actual_exercise': data.get('actual_exercise'),
            'rating': data.get('rating'),
            'feedback_text': data.get('feedback_text'),
            'phase': data.get('phase'),
            'symptoms': data.get('symptoms', {})
        }
        
        # In a real implementation, save to database
        print(f"📝 Feedback received: {feedback}")
        
        return jsonify({
            'success': True,
            'message': 'Feedback submitted successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print("🚀 Starting Exercise Recommendation API")
    
    # Load model
    model_loaded = load_model()
    
    if not model_loaded:
        print("⚠️  Model not loaded - using fallback recommendations only")
    
    # Start server
    port = int(os.environ.get('PORT', 5006))
    print(f"🌐 Server starting on port {port}")
    
    app.run(host='0.0.0.0', port=port, debug=True)
