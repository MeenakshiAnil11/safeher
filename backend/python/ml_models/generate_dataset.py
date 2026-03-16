"""
Generate synthetic exercise recommendation dataset
Creates realistic patterns based on menstrual phases and symptoms
"""

import pandas as pd
import numpy as np
import random
from datetime import date, timedelta


def generate_synthetic_dataset(n_samples=2000):
    """Generate synthetic exercise recommendation dataset."""
    
    # Set random seed for reproducibility
    np.random.seed(42)
    random.seed(42)
    
    data = []
    
    # Define exercise types and their characteristics
    exercise_types = ['rest', 'light_yoga', 'stretching', 'walking', 'cardio', 'strength', 'meditation']
    
    # Phase-specific exercise preferences (realistic patterns)
    phase_preferences = {
        'menstruation': {
            'rest': 0.3,
            'light_yoga': 0.25,
            'stretching': 0.2,
            'walking': 0.15,
            'meditation': 0.1,
            'cardio': 0.0,
            'strength': 0.0
        },
        'follicular': {
            'cardio': 0.3,
            'strength': 0.25,
            'walking': 0.2,
            'light_yoga': 0.15,
            'stretching': 0.1,
            'rest': 0.0,
            'meditation': 0.0
        },
        'ovulation': {
            'cardio': 0.35,
            'strength': 0.3,
            'walking': 0.2,
            'light_yoga': 0.1,
            'stretching': 0.05,
            'rest': 0.0,
            'meditation': 0.0
        },
        'luteal': {
            'walking': 0.25,
            'light_yoga': 0.2,
            'stretching': 0.2,
            'meditation': 0.15,
            'cardio': 0.1,
            'strength': 0.05,
            'rest': 0.05
        }
    }
    
    phases = ['menstruation', 'follicular', 'ovulation', 'luteal']
    moods = ['happy', 'tired', 'irritable', 'anxious', 'calm', 'energetic']
    fitness_levels = ['beginner', 'intermediate', 'advanced']
    previous_exercises = exercise_types + ['none']
    
    for i in range(n_samples):
        # Generate base features
        phase = random.choice(phases)
        day_in_cycle = random.randint(1, 28)
        
        # Adjust day_in_cycle based on phase
        if phase == 'menstruation':
            day_in_cycle = random.randint(1, 5)
        elif phase == 'follicular':
            day_in_cycle = random.randint(6, 13)
        elif phase == 'ovulation':
            day_in_cycle = random.randint(14, 16)
        else:  # luteal
            day_in_cycle = random.randint(17, 28)
        
        # Generate correlated features
        energy_level = random.randint(1, 10)
        sleep_hours = np.random.normal(7.5, 1.5)
        sleep_hours = max(3, min(12, sleep_hours))  # Clamp to realistic range
        
        mood = random.choice(moods)
        cramps = random.randint(0, 10)
        fitness_level = random.choice(fitness_levels)
        previous_exercise = random.choice(previous_exercises)
        
        # Adjust energy and cramps based on phase
        if phase == 'menstruation':
            energy_level = max(1, energy_level - random.randint(1, 3))
            cramps = max(3, cramps + random.randint(0, 3))
        elif phase == 'follicular':
            energy_level = min(10, energy_level + random.randint(0, 2))
            cramps = max(0, cramps - random.randint(0, 2))
        elif phase == 'ovulation':
            energy_level = min(10, energy_level + random.randint(0, 3))
            cramps = max(0, cramps - random.randint(0, 1))
        else:  # luteal
            energy_level = max(1, energy_level - random.randint(0, 2))
            cramps = max(0, cramps + random.randint(0, 2))
        
        # Adjust mood based on energy and cramps
        if energy_level <= 3 or cramps >= 7:
            mood = random.choice(['tired', 'irritable', 'anxious'])
        elif energy_level >= 8:
            mood = random.choice(['happy', 'energetic', 'calm'])
        
        # Select exercise based on phase preferences and additional factors
        exercise_weights = phase_preferences[phase].copy()
        
        # Adjust weights based on energy level
        if energy_level <= 3:
            exercise_weights['rest'] += 0.2
            exercise_weights['meditation'] += 0.1
            exercise_weights['cardio'] *= 0.5
            exercise_weights['strength'] *= 0.5
        elif energy_level >= 8:
            exercise_weights['cardio'] += 0.1
            exercise_weights['strength'] += 0.1
            exercise_weights['rest'] *= 0.5
        
        # Adjust weights based on cramps
        if cramps >= 6:
            exercise_weights['rest'] += 0.15
            exercise_weights['light_yoga'] += 0.1
            exercise_weights['stretching'] += 0.1
            exercise_weights['cardio'] *= 0.3
            exercise_weights['strength'] *= 0.3
        
        # Adjust weights based on fitness level
        if fitness_level == 'beginner':
            exercise_weights['strength'] *= 0.7
            exercise_weights['cardio'] *= 0.8
            exercise_weights['light_yoga'] += 0.1
            exercise_weights['walking'] += 0.1
        elif fitness_level == 'advanced':
            exercise_weights['strength'] += 0.1
            exercise_weights['cardio'] += 0.1
            exercise_weights['rest'] *= 0.7
        
        # Normalize weights
        total_weight = sum(exercise_weights.values())
        exercise_weights = {k: v/total_weight for k, v in exercise_weights.items()}
        
        # Select exercise based on weights
        exercise_type = np.random.choice(
            list(exercise_weights.keys()),
            p=list(exercise_weights.values())
        )
        
        # Generate feedback rating (higher for appropriate recommendations)
        base_rating = 3
        if exercise_type in ['rest', 'light_yoga', 'stretching'] and phase == 'menstruation':
            base_rating += random.randint(1, 2)
        elif exercise_type in ['cardio', 'strength'] and phase in ['follicular', 'ovulation']:
            base_rating += random.randint(1, 2)
        elif exercise_type in ['walking', 'meditation'] and phase == 'luteal':
            base_rating += random.randint(0, 1)
        
        feedback_rating = min(5, max(1, base_rating + random.randint(-1, 1)))
        
        # Add some noise to make it more realistic
        if random.random() < 0.1:  # 10% chance of random exercise
            exercise_type = random.choice(exercise_types)
            feedback_rating = random.randint(1, 5)
        
        data.append({
            'phase': phase,
            'day_in_cycle': day_in_cycle,
            'energy_level': energy_level,
            'sleep_hours': round(sleep_hours, 1),
            'mood': mood,
            'cramps': cramps,
            'fitness_level': fitness_level,
            'previous_exercise_type': previous_exercise,
            'exercise_type': exercise_type,
            'feedback_rating': feedback_rating
        })
    
    return pd.DataFrame(data)


def main():
    """Generate and save the synthetic dataset."""
    print("🔄 Generating synthetic exercise recommendation dataset...")
    
    df = generate_synthetic_dataset(2000)
    
    # Save to CSV
    df.to_csv('exercise_dataset.csv', index=False)
    
    print(f"✅ Generated {len(df)} samples")
    print("\n📊 Dataset Summary:")
    print(f"Phases: {df['phase'].value_counts().to_dict()}")
    print(f"Exercise Types: {df['exercise_type'].value_counts().to_dict()}")
    print(f"Average Feedback Rating: {df['feedback_rating'].mean():.2f}")
    
    print("\n📈 Phase-Exercise Patterns:")
    phase_exercise = df.groupby(['phase', 'exercise_type']).size().unstack(fill_value=0)
    print(phase_exercise)
    
    print("\n💾 Dataset saved as 'exercise_dataset.csv'")


if __name__ == "__main__":
    main()
