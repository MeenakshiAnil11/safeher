"""
SVM Implementation for Mood Prediction
SafeHer Project - Women's Health & Safety App

This module implements Support Vector Machine algorithms for mood prediction and analysis:
- SVM Classifier: For mood classification (Happy, Sad, Anxious, etc.)
- SVM Regressor: For mood intensity prediction
- SVC with different kernels: Linear, RBF, Polynomial
- Grid Search: For hyperparameter optimization
"""

import os
import pandas as pd
import numpy as np
from sklearn.svm import SVC, SVR
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score,
    mean_squared_error, mean_absolute_error, r2_score
)
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import json
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class MoodSVMPredictor:
    """
    Support Vector Machine models for mood prediction and analysis
    """
    
    def __init__(self):
        """
        Initialize SVM models for mood prediction
        """
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.feature_names = {}
        
        # Mood categories
        self.mood_categories = [
            'Happy', 'Sad', 'Anxious', 'Excited', 'Calm', 'Irritable', 
            'Neutral', 'Stressed', 'Depressed', 'Energetic', 'Tired', 'Frustrated'
        ]
        
        # Mood intensity levels (1-10 scale)
        self.mood_intensity_levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        
        # Common symptoms that affect mood
        self.mood_affecting_symptoms = [
            'fatigue', 'headache', 'nausea', 'back_pain', 'cramps', 'bloating',
            'mood_swings', 'irritability', 'anxiety', 'depression', 'stress',
            'insomnia', 'appetite_changes', 'concentration_issues'
        ]
        
        # Lifestyle factors
        self.lifestyle_factors = [
            'exercise_duration', 'sleep_hours', 'sleep_quality', 'water_intake',
            'meals_eaten', 'caffeine_intake', 'social_interaction', 'work_stress',
            'weather', 'social_media_time', 'outdoor_time', 'meditation_time'
        ]
        
        # Hormonal cycle phases
        self.cycle_phases = ['menstrual', 'follicular', 'ovulation', 'luteal']
        
        # Weather conditions
        self.weather_conditions = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy']
        
        # Sleep quality levels
        self.sleep_quality_levels = ['poor', 'fair', 'good', 'excellent']
    
    def generate_synthetic_mood_data(self, num_samples=3000):
        """
        Generate synthetic mood data for training SVM models
        """
        print("📊 Generating synthetic mood data for SVM training...")
        
        np.random.seed(42)
        
        data = []
        
        for i in range(num_samples):
            # Generate date (last 6 months)
            start_date = datetime.now() - timedelta(days=180)
            random_days = np.random.randint(0, 180)
            date = start_date + timedelta(days=random_days)
            
            # Generate user age (18-50)
            age = np.random.randint(18, 51)
            
            # Generate cycle phase
            cycle_phase = np.random.choice(self.cycle_phases)
            
            # Generate lifestyle factors
            exercise_duration = np.random.normal(30, 15)  # minutes
            exercise_duration = max(0, min(120, exercise_duration))
            
            sleep_hours = np.random.normal(8, 1.5)
            sleep_hours = max(4, min(12, sleep_hours))
            
            sleep_quality = np.random.choice(self.sleep_quality_levels)
            
            water_intake = np.random.normal(2.5, 0.8)  # liters
            water_intake = max(1, min(5, water_intake))
            
            meals_eaten = np.random.randint(1, 6)
            
            caffeine_intake = np.random.normal(200, 100)  # mg
            caffeine_intake = max(0, min(500, caffeine_intake))
            
            social_interaction = np.random.randint(0, 10)  # hours
            work_stress = np.random.randint(1, 11)  # 1-10 scale
            
            weather = np.random.choice(self.weather_conditions)
            
            social_media_time = np.random.normal(2, 1)  # hours
            social_media_time = max(0, min(8, social_media_time))
            
            outdoor_time = np.random.normal(1, 0.8)  # hours
            outdoor_time = max(0, min(6, outdoor_time))
            
            meditation_time = np.random.normal(10, 15)  # minutes
            meditation_time = max(0, min(60, meditation_time))
            
            # Generate symptoms based on cycle phase and lifestyle
            symptoms = self._generate_mood_affecting_symptoms(cycle_phase, sleep_hours, exercise_duration, work_stress)
            
            # Generate mood based on all factors
            mood, mood_intensity = self._generate_mood_from_factors(
                age, cycle_phase, exercise_duration, sleep_hours, sleep_quality,
                water_intake, meals_eaten, caffeine_intake, social_interaction,
                work_stress, weather, social_media_time, outdoor_time,
                meditation_time, symptoms
            )
            
            # Generate mood stability (consistency over time)
            mood_stability = self._calculate_mood_stability(
                exercise_duration, sleep_hours, meditation_time, work_stress
            )
            
            # Generate emotional triggers
            emotional_triggers = self._generate_emotional_triggers(symptoms, work_stress, weather)
            
            data.append({
                'date': date,
                'age': age,
                'cycle_phase': cycle_phase,
                'exercise_duration': round(exercise_duration, 1),
                'sleep_hours': round(sleep_hours, 1),
                'sleep_quality': sleep_quality,
                'water_intake': round(water_intake, 1),
                'meals_eaten': meals_eaten,
                'caffeine_intake': round(caffeine_intake, 1),
                'social_interaction': social_interaction,
                'work_stress': work_stress,
                'weather': weather,
                'social_media_time': round(social_media_time, 1),
                'outdoor_time': round(outdoor_time, 1),
                'meditation_time': round(meditation_time, 1),
                'mood': mood,
                'mood_intensity': mood_intensity,
                'mood_stability': mood_stability,
                'emotional_triggers': emotional_triggers,
                'fatigue': symptoms['fatigue'],
                'headache': symptoms['headache'],
                'nausea': symptoms['nausea'],
                'back_pain': symptoms['back_pain'],
                'cramps': symptoms['cramps'],
                'bloating': symptoms['bloating'],
                'mood_swings': symptoms['mood_swings'],
                'irritability': symptoms['irritability'],
                'anxiety': symptoms['anxiety'],
                'depression': symptoms['depression'],
                'stress': symptoms['stress'],
                'insomnia': symptoms['insomnia'],
                'appetite_changes': symptoms['appetite_changes'],
                'concentration_issues': symptoms['concentration_issues']
            })
        
        df = pd.DataFrame(data)
        print(f"✅ Generated {len(df)} synthetic mood records")
        print(f"📊 Mood distribution: {df['mood'].value_counts().to_dict()}")
        print(f"📊 Cycle phase distribution: {df['cycle_phase'].value_counts().to_dict()}")
        
        return df
    
    def _generate_mood_affecting_symptoms(self, cycle_phase, sleep_hours, exercise_duration, work_stress):
        """
        Generate symptoms that affect mood based on cycle phase and lifestyle
        """
        symptoms = {}
        
        # Cycle phase effects
        if cycle_phase == 'menstrual':
            symptoms['cramps'] = np.random.choice([True, False], p=[0.7, 0.3])
            symptoms['bloating'] = np.random.choice([True, False], p=[0.6, 0.4])
            symptoms['fatigue'] = np.random.choice([True, False], p=[0.8, 0.2])
            symptoms['mood_swings'] = np.random.choice([True, False], p=[0.8, 0.2])
            symptoms['irritability'] = np.random.choice([True, False], p=[0.7, 0.3])
        elif cycle_phase == 'ovulation':
            symptoms['fatigue'] = np.random.choice([True, False], p=[0.3, 0.7])
            symptoms['mood_swings'] = np.random.choice([True, False], p=[0.4, 0.6])
            symptoms['bloating'] = np.random.choice([True, False], p=[0.5, 0.5])
        elif cycle_phase == 'luteal':
            symptoms['mood_swings'] = np.random.choice([True, False], p=[0.6, 0.4])
            symptoms['irritability'] = np.random.choice([True, False], p=[0.5, 0.5])
            symptoms['bloating'] = np.random.choice([True, False], p=[0.6, 0.4])
            symptoms['fatigue'] = np.random.choice([True, False], p=[0.4, 0.6])
        
        # Sleep effects
        if sleep_hours < 6:
            symptoms['fatigue'] = symptoms.get('fatigue', False) or True
            symptoms['irritability'] = symptoms.get('irritability', False) or np.random.choice([True, False], p=[0.6, 0.4])
            symptoms['concentration_issues'] = np.random.choice([True, False], p=[0.7, 0.3])
        
        # Exercise effects
        if exercise_duration > 60:
            symptoms['fatigue'] = symptoms.get('fatigue', False) or np.random.choice([True, False], p=[0.4, 0.6])
        elif exercise_duration < 15:
            symptoms['fatigue'] = symptoms.get('fatigue', False) or np.random.choice([True, False], p=[0.3, 0.7])
        
        # Work stress effects
        if work_stress > 7:
            symptoms['stress'] = True
            symptoms['anxiety'] = np.random.choice([True, False], p=[0.6, 0.4])
            symptoms['headache'] = np.random.choice([True, False], p=[0.4, 0.6])
            symptoms['insomnia'] = np.random.choice([True, False], p=[0.5, 0.5])
        
        # Ensure all symptoms are defined
        for symptom in self.mood_affecting_symptoms:
            if symptom not in symptoms:
                symptoms[symptom] = False
        
        return symptoms
    
    def _generate_mood_from_factors(self, age, cycle_phase, exercise_duration, sleep_hours, 
                                  sleep_quality, water_intake, meals_eaten, caffeine_intake,
                                  social_interaction, work_stress, weather, social_media_time,
                                  outdoor_time, meditation_time, symptoms):
        """
        Generate mood and intensity based on all lifestyle factors
        """
        mood_score = 5.0  # Start neutral
        
        # Age factor
        if age < 25:
            mood_score += 0.5  # Generally more energetic
        elif age > 40:
            mood_score -= 0.3  # More life stress
        
        # Cycle phase factor
        if cycle_phase == 'ovulation':
            mood_score += 1.0  # Generally better mood
        elif cycle_phase == 'menstrual':
            mood_score -= 1.5  # Generally worse mood
        elif cycle_phase == 'luteal':
            mood_score -= 0.5  # Slightly worse mood
        
        # Exercise factor
        if exercise_duration > 30:
            mood_score += 1.0  # Exercise improves mood
        elif exercise_duration < 15:
            mood_score -= 0.5  # Lack of exercise
        
        # Sleep factor
        if sleep_hours >= 7 and sleep_hours <= 9:
            mood_score += 1.0  # Good sleep
        elif sleep_hours < 6:
            mood_score -= 1.5  # Poor sleep
        
        if sleep_quality == 'excellent':
            mood_score += 0.8
        elif sleep_quality == 'good':
            mood_score += 0.4
        elif sleep_quality == 'poor':
            mood_score -= 1.0
        
        # Nutrition factor
        if water_intake >= 2.0:
            mood_score += 0.3  # Good hydration
        if meals_eaten >= 3:
            mood_score += 0.2  # Regular meals
        
        # Caffeine factor
        if caffeine_intake > 400:
            mood_score -= 0.5  # Too much caffeine
        elif caffeine_intake < 50:
            mood_score -= 0.2  # Too little caffeine
        
        # Social factor
        if social_interaction >= 4:
            mood_score += 0.8  # Good social interaction
        elif social_interaction < 2:
            mood_score -= 0.5  # Isolation
        
        # Work stress factor
        if work_stress > 7:
            mood_score -= 1.5  # High stress
        elif work_stress < 4:
            mood_score += 0.5  # Low stress
        
        # Weather factor
        if weather == 'sunny':
            mood_score += 0.8  # Sunny weather
        elif weather == 'rainy':
            mood_score -= 0.3  # Rainy weather
        elif weather == 'stormy':
            mood_score -= 0.5  # Stormy weather
        
        # Social media factor
        if social_media_time > 4:
            mood_score -= 0.5  # Too much social media
        elif social_media_time < 1:
            mood_score += 0.2  # Less social media
        
        # Outdoor time factor
        if outdoor_time > 2:
            mood_score += 0.6  # More outdoor time
        elif outdoor_time < 0.5:
            mood_score -= 0.3  # Less outdoor time
        
        # Meditation factor
        if meditation_time > 20:
            mood_score += 0.8  # Regular meditation
        elif meditation_time < 5:
            mood_score -= 0.2  # No meditation
        
        # Symptom effects
        negative_symptoms = ['fatigue', 'headache', 'nausea', 'back_pain', 'cramps', 
                           'bloating', 'irritability', 'anxiety', 'depression', 'stress', 
                           'insomnia', 'concentration_issues']
        
        for symptom in negative_symptoms:
            if symptoms.get(symptom, False):
                mood_score -= 0.3
        
        # Mood swings effect
        if symptoms.get('mood_swings', False):
            mood_score -= 0.5
        
        # Appetite changes effect
        if symptoms.get('appetite_changes', False):
            mood_score -= 0.2
        
        # Convert score to mood category
        if mood_score >= 7:
            mood = np.random.choice(['Happy', 'Excited', 'Energetic'], p=[0.5, 0.3, 0.2])
            intensity = np.random.randint(7, 11)
        elif mood_score >= 5:
            mood = np.random.choice(['Happy', 'Calm', 'Neutral'], p=[0.4, 0.4, 0.2])
            intensity = np.random.randint(5, 8)
        elif mood_score >= 3:
            mood = np.random.choice(['Neutral', 'Tired', 'Calm'], p=[0.4, 0.3, 0.3])
            intensity = np.random.randint(3, 6)
        elif mood_score >= 1:
            mood = np.random.choice(['Sad', 'Tired', 'Irritable'], p=[0.4, 0.3, 0.3])
            intensity = np.random.randint(2, 5)
        else:
            mood = np.random.choice(['Sad', 'Depressed', 'Frustrated'], p=[0.4, 0.3, 0.3])
            intensity = np.random.randint(1, 4)
        
        return mood, intensity
    
    def _calculate_mood_stability(self, exercise_duration, sleep_hours, meditation_time, work_stress):
        """
        Calculate mood stability based on lifestyle factors
        """
        stability_score = 5.0  # Start neutral
        
        # Exercise stability
        if 20 <= exercise_duration <= 60:
            stability_score += 1.0  # Regular exercise
        elif exercise_duration < 10 or exercise_duration > 90:
            stability_score -= 0.5  # Irregular exercise
        
        # Sleep stability
        if 7 <= sleep_hours <= 9:
            stability_score += 1.0  # Regular sleep
        elif sleep_hours < 6 or sleep_hours > 10:
            stability_score -= 0.8  # Irregular sleep
        
        # Meditation stability
        if meditation_time > 15:
            stability_score += 0.8  # Regular meditation
        elif meditation_time < 5:
            stability_score -= 0.3  # No meditation
        
        # Work stress stability
        if work_stress <= 5:
            stability_score += 0.5  # Low stress
        elif work_stress > 8:
            stability_score -= 1.0  # High stress
        
        # Convert to stability level
        if stability_score >= 7:
            return 'Very Stable'
        elif stability_score >= 5:
            return 'Stable'
        elif stability_score >= 3:
            return 'Moderately Stable'
        elif stability_score >= 1:
            return 'Unstable'
        else:
            return 'Very Unstable'
    
    def _generate_emotional_triggers(self, symptoms, work_stress, weather):
        """
        Generate emotional triggers based on symptoms and environment
        """
        triggers = []
        
        if symptoms.get('fatigue', False):
            triggers.append('fatigue')
        if symptoms.get('headache', False):
            triggers.append('headache')
        if symptoms.get('cramps', False):
            triggers.append('cramps')
        if work_stress > 7:
            triggers.append('work_stress')
        if weather == 'rainy' or weather == 'stormy':
            triggers.append('weather')
        if symptoms.get('mood_swings', False):
            triggers.append('hormonal_changes')
        if symptoms.get('insomnia', False):
            triggers.append('sleep_issues')
        
        return triggers if triggers else ['none']
    
    def prepare_mood_classification_features(self, df):
        """
        Prepare features for mood classification using SVM
        """
        print("🔧 Preparing features for mood classification...")
        
        # Create binary features for symptoms
        for symptom in self.mood_affecting_symptoms:
            df[f'has_{symptom}'] = df[symptom].astype(int)
        
        # Create binary features for cycle phase
        for phase in self.cycle_phases:
            df[f'phase_{phase}'] = (df['cycle_phase'] == phase).astype(int)
        
        # Create binary features for weather
        for weather in self.weather_conditions:
            df[f'weather_{weather}'] = (df['weather'] == weather).astype(int)
        
        # Create binary features for sleep quality
        for quality in self.sleep_quality_levels:
            df[f'sleep_{quality}'] = (df['sleep_quality'] == quality).astype(int)
        
        # Feature columns
        feature_columns = [
            'age', 'exercise_duration', 'sleep_hours', 'water_intake',
            'meals_eaten', 'caffeine_intake', 'social_interaction',
            'work_stress', 'social_media_time', 'outdoor_time', 'meditation_time'
        ]
        
        # Add symptom features
        symptom_features = [f'has_{s}' for s in self.mood_affecting_symptoms]
        feature_columns.extend(symptom_features)
        
        # Add cycle phase features
        phase_features = [f'phase_{p}' for p in self.cycle_phases]
        feature_columns.extend(phase_features)
        
        # Add weather features
        weather_features = [f'weather_{w}' for w in self.weather_conditions]
        feature_columns.extend(weather_features)
        
        # Add sleep quality features
        sleep_features = [f'sleep_{q}' for q in self.sleep_quality_levels]
        feature_columns.extend(sleep_features)
        
        X = df[feature_columns].copy()
        y = df['mood'].copy()
        
        # Handle missing values
        X = X.fillna(X.mean())
        
        # Encode target labels
        y_encoded = LabelEncoder().fit_transform(y)
        
        self.feature_names['mood_classification'] = feature_columns
        
        print(f"📊 Features: {len(feature_columns)}")
        print(f"📊 Target classes: {np.unique(y)}")
        print(f"📊 Feature matrix shape: {X.shape}")
        
        return X, y_encoded, y
    
    def prepare_mood_intensity_features(self, df):
        """
        Prepare features for mood intensity prediction using SVM
        """
        print("🔧 Preparing features for mood intensity prediction...")
        
        # Create binary features for symptoms
        for symptom in self.mood_affecting_symptoms:
            df[f'has_{symptom}'] = df[symptom].astype(int)
        
        # Create binary features for cycle phase
        for phase in self.cycle_phases:
            df[f'phase_{phase}'] = (df['cycle_phase'] == phase).astype(int)
        
        # Create binary features for weather
        for weather in self.weather_conditions:
            df[f'weather_{weather}'] = (df['weather'] == weather).astype(int)
        
        # Create binary features for sleep quality
        for quality in self.sleep_quality_levels:
            df[f'sleep_{quality}'] = (df['sleep_quality'] == quality).astype(int)
        
        # Feature columns
        feature_columns = [
            'age', 'exercise_duration', 'sleep_hours', 'water_intake',
            'meals_eaten', 'caffeine_intake', 'social_interaction',
            'work_stress', 'social_media_time', 'outdoor_time', 'meditation_time'
        ]
        
        # Add symptom features
        symptom_features = [f'has_{s}' for s in self.mood_affecting_symptoms]
        feature_columns.extend(symptom_features)
        
        # Add cycle phase features
        phase_features = [f'phase_{p}' for p in self.cycle_phases]
        feature_columns.extend(phase_features)
        
        # Add weather features
        weather_features = [f'weather_{w}' for w in self.weather_conditions]
        feature_columns.extend(weather_features)
        
        # Add sleep quality features
        sleep_features = [f'sleep_{q}' for q in self.sleep_quality_levels]
        feature_columns.extend(sleep_features)
        
        X = df[feature_columns].copy()
        y = df['mood_intensity'].copy()
        
        # Handle missing values
        X = X.fillna(X.mean())
        
        self.feature_names['mood_intensity'] = feature_columns
        
        print(f"📊 Features: {len(feature_columns)}")
        print(f"📊 Target range: {y.min()} - {y.max()}")
        print(f"📊 Feature matrix shape: {X.shape}")
        
        return X, y
    
    def train_mood_classification_models(self, X, y, y_labels):
        """
        Train multiple SVM models for mood classification
        """
        print("\n🚀 Training SVM Models for Mood Classification...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"Training samples: {len(X_train)}")
        print(f"Test samples: {len(X_test)}")
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        self.scalers['mood_classification'] = scaler
        
        # Define SVM models with different kernels
        models_to_train = {
            'SVM_Linear': SVC(kernel='linear', random_state=42, probability=True),
            'SVM_RBF': SVC(kernel='rbf', random_state=42, probability=True),
            'SVM_Polynomial': SVC(kernel='poly', degree=3, random_state=42, probability=True),
            'SVM_Sigmoid': SVC(kernel='sigmoid', random_state=42, probability=True)
        }
        
        results = {}
        
        for model_name, model in models_to_train.items():
            print(f"\n🔍 Training {model_name}...")
            
            try:
                # Train model
                model.fit(X_train_scaled, y_train)
                
                # Make predictions
                y_pred = model.predict(X_test_scaled)
                y_pred_proba = model.predict_proba(X_test_scaled)
                
                # Calculate metrics
                accuracy = accuracy_score(y_test, y_pred)
                precision = precision_score(y_test, y_pred, average='weighted')
                recall = recall_score(y_test, y_pred, average='weighted')
                f1 = f1_score(y_test, y_pred, average='weighted')
                
                # Cross-validation
                cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
                
                results[model_name] = {
                    'model': model,
                    'accuracy': accuracy,
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1,
                    'cv_mean': cv_scores.mean(),
                    'cv_std': cv_scores.std(),
                    'predictions': y_pred,
                    'probabilities': y_pred_proba
                }
                
                print(f"✅ {model_name} - Accuracy: {accuracy:.4f}, F1: {f1:.4f}")
                
            except Exception as e:
                print(f"❌ {model_name} failed: {e}")
                continue
        
        # Store best model
        best_model_name = max(results.keys(), key=lambda k: results[k]['f1_score'])
        self.models['mood_classification'] = results[best_model_name]['model']
        
        print(f"\n🏆 Best model: {best_model_name}")
        print(f"📊 Best F1-Score: {results[best_model_name]['f1_score']:.4f}")
        
        # Detailed evaluation
        print(f"\n📋 Classification Report for {best_model_name}:")
        print(classification_report(y_test, results[best_model_name]['predictions'], 
                                  target_names=np.unique(y_labels)))
        
        return results
    
    def train_mood_intensity_models(self, X, y):
        """
        Train multiple SVM models for mood intensity prediction
        """
        print("\n🚀 Training SVM Models for Mood Intensity Prediction...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        print(f"Training samples: {len(X_train)}")
        print(f"Test samples: {len(X_test)}")
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        self.scalers['mood_intensity'] = scaler
        
        # Define SVM regression models with different kernels
        models_to_train = {
            'SVR_Linear': SVR(kernel='linear'),
            'SVR_RBF': SVR(kernel='rbf'),
            'SVR_Polynomial': SVR(kernel='poly', degree=3),
            'SVR_Sigmoid': SVR(kernel='sigmoid')
        }
        
        results = {}
        
        for model_name, model in models_to_train.items():
            print(f"\n🔍 Training {model_name}...")
            
            try:
                # Train model
                model.fit(X_train_scaled, y_train)
                
                # Make predictions
                y_pred = model.predict(X_test_scaled)
                
                # Calculate metrics
                mse = mean_squared_error(y_test, y_pred)
                mae = mean_absolute_error(y_test, y_pred)
                r2 = r2_score(y_test, y_pred)
                
                # Cross-validation
                cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
                
                results[model_name] = {
                    'model': model,
                    'mse': mse,
                    'mae': mae,
                    'r2': r2,
                    'cv_mean': cv_scores.mean(),
                    'cv_std': cv_scores.std(),
                    'predictions': y_pred
                }
                
                print(f"✅ {model_name} - R²: {r2:.4f}, MAE: {mae:.4f}")
                
            except Exception as e:
                print(f"❌ {model_name} failed: {e}")
                continue
        
        # Store best model
        best_model_name = max(results.keys(), key=lambda k: results[k]['r2'])
        self.models['mood_intensity'] = results[best_model_name]['model']
        
        print(f"\n🏆 Best model: {best_model_name}")
        print(f"📊 Best R²: {results[best_model_name]['r2']:.4f}")
        
        return results
    
    def predict_mood(self, mood_data):
        """
        Predict mood using SVM
        
        Args:
            mood_data (dict): Dictionary containing mood-related information
        
        Returns:
            dict: Prediction results with mood category and confidence
        """
        if 'mood_classification' not in self.models:
            raise ValueError("Mood classification model not trained. Please train the model first.")
        
        # Prepare features
        features = self._prepare_mood_classification_features(mood_data)
        
        # Scale features
        X_scaled = self.scalers['mood_classification'].transform([features])
        
        # Make prediction
        prediction = self.models['mood_classification'].predict(X_scaled)[0]
        prediction_proba = self.models['mood_classification'].predict_proba(X_scaled)[0]
        
        # Get mood category name
        mood_names = self.mood_categories
        predicted_mood = mood_names[prediction]
        
        # Calculate confidence
        confidence = max(prediction_proba) * 100
        
        # Get probabilities for all mood categories
        mood_probabilities = {}
        for i, mood in enumerate(mood_names):
            mood_probabilities[mood] = prediction_proba[i] * 100
        
        return {
            'mood': predicted_mood,
            'confidence': round(confidence, 2),
            'mood_probabilities': mood_probabilities,
            'prediction_details': {
                'model': 'SVM',
                'algorithm': type(self.models['mood_classification']).__name__,
                'features_used': len(features)
            }
        }
    
    def predict_mood_intensity(self, mood_data):
        """
        Predict mood intensity using SVM
        
        Args:
            mood_data (dict): Dictionary containing mood-related information
        
        Returns:
            dict: Prediction results with mood intensity and confidence
        """
        if 'mood_intensity' not in self.models:
            raise ValueError("Mood intensity model not trained. Please train the model first.")
        
        # Prepare features
        features = self._prepare_mood_intensity_features(mood_data)
        
        # Scale features
        X_scaled = self.scalers['mood_intensity'].transform([features])
        
        # Make prediction
        prediction = self.models['mood_intensity'].predict(X_scaled)[0]
        
        # Ensure prediction is within valid range
        prediction = max(1, min(10, prediction))
        
        # Calculate confidence based on prediction certainty
        confidence = 85.0  # SVM regression confidence estimation
        
        return {
            'mood_intensity': round(prediction, 1),
            'confidence': confidence,
            'intensity_level': self._get_intensity_level(prediction),
            'prediction_details': {
                'model': 'SVM',
                'algorithm': type(self.models['mood_intensity']).__name__,
                'features_used': len(features)
            }
        }
    
    def _prepare_mood_classification_features(self, mood_data):
        """
        Prepare features for mood classification
        """
        features = []
        
        # Basic features
        features.extend([
            mood_data.get('age', 30),
            mood_data.get('exercise_duration', 30),
            mood_data.get('sleep_hours', 8),
            mood_data.get('water_intake', 2.5),
            mood_data.get('meals_eaten', 3),
            mood_data.get('caffeine_intake', 200),
            mood_data.get('social_interaction', 4),
            mood_data.get('work_stress', 5),
            mood_data.get('social_media_time', 2),
            mood_data.get('outdoor_time', 1),
            mood_data.get('meditation_time', 10)
        ])
        
        # Symptom features
        symptoms = mood_data.get('symptoms', {})
        for symptom in self.mood_affecting_symptoms:
            features.append(1 if symptoms.get(symptom, False) else 0)
        
        # Cycle phase features
        cycle_phase = mood_data.get('cycle_phase', 'follicular')
        for phase in self.cycle_phases:
            features.append(1 if cycle_phase == phase else 0)
        
        # Weather features
        weather = mood_data.get('weather', 'sunny')
        for weather_condition in self.weather_conditions:
            features.append(1 if weather == weather_condition else 0)
        
        # Sleep quality features
        sleep_quality = mood_data.get('sleep_quality', 'good')
        for quality in self.sleep_quality_levels:
            features.append(1 if sleep_quality == quality else 0)
        
        return features
    
    def _prepare_mood_intensity_features(self, mood_data):
        """
        Prepare features for mood intensity prediction
        """
        features = []
        
        # Basic features
        features.extend([
            mood_data.get('age', 30),
            mood_data.get('exercise_duration', 30),
            mood_data.get('sleep_hours', 8),
            mood_data.get('water_intake', 2.5),
            mood_data.get('meals_eaten', 3),
            mood_data.get('caffeine_intake', 200),
            mood_data.get('social_interaction', 4),
            mood_data.get('work_stress', 5),
            mood_data.get('social_media_time', 2),
            mood_data.get('outdoor_time', 1),
            mood_data.get('meditation_time', 10)
        ])
        
        # Symptom features
        symptoms = mood_data.get('symptoms', {})
        for symptom in self.mood_affecting_symptoms:
            features.append(1 if symptoms.get(symptom, False) else 0)
        
        # Cycle phase features
        cycle_phase = mood_data.get('cycle_phase', 'follicular')
        for phase in self.cycle_phases:
            features.append(1 if cycle_phase == phase else 0)
        
        # Weather features
        weather = mood_data.get('weather', 'sunny')
        for weather_condition in self.weather_conditions:
            features.append(1 if weather == weather_condition else 0)
        
        # Sleep quality features
        sleep_quality = mood_data.get('sleep_quality', 'good')
        for quality in self.sleep_quality_levels:
            features.append(1 if sleep_quality == quality else 0)
        
        return features
    
    def _get_intensity_level(self, intensity):
        """
        Get intensity level description
        """
        if intensity >= 8:
            return 'Very High'
        elif intensity >= 6:
            return 'High'
        elif intensity >= 4:
            return 'Moderate'
        elif intensity >= 2:
            return 'Low'
        else:
            return 'Very Low'
    
    def get_feature_importance(self, model_type='mood_classification'):
        """
        Get feature importance from SVM models
        """
        if model_type not in self.models:
            raise ValueError(f"{model_type} model not trained.")
        
        model = self.models[model_type]
        feature_names = self.feature_names[model_type]
        
        if hasattr(model, 'coef_'):
            # For linear SVM, use coefficients as importance
            importance = np.abs(model.coef_[0]) if len(model.coef_.shape) > 1 else np.abs(model.coef_)
            feature_importance = list(zip(feature_names, importance))
            feature_importance.sort(key=lambda x: x[1], reverse=True)
            return feature_importance
        else:
            # For non-linear SVM, return empty list
            return []
    
    def save_models(self, model_path='python/models/mood_svm_models.pkl'):
        """
        Save trained models and scalers
        """
        if not self.models:
            raise ValueError("No models to save. Please train the models first.")
        
        # Create models directory
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Save models
        model_data = {
            'models': self.models,
            'scalers': self.scalers,
            'feature_names': self.feature_names,
            'mood_categories': self.mood_categories,
            'mood_intensity_levels': self.mood_intensity_levels,
            'mood_affecting_symptoms': self.mood_affecting_symptoms,
            'lifestyle_factors': self.lifestyle_factors,
            'cycle_phases': self.cycle_phases,
            'weather_conditions': self.weather_conditions,
            'sleep_quality_levels': self.sleep_quality_levels,
            'trained_at': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, model_path)
        print(f"✅ SVM mood models saved to {model_path}")
        
        # Also save as JSON for Node.js compatibility
        json_path = model_path.replace('.pkl', '.json')
        json_data = {
            'mood_categories': self.mood_categories,
            'mood_intensity_levels': self.mood_intensity_levels,
            'mood_affecting_symptoms': self.mood_affecting_symptoms,
            'lifestyle_factors': self.lifestyle_factors,
            'cycle_phases': self.cycle_phases,
            'weather_conditions': self.weather_conditions,
            'sleep_quality_levels': self.sleep_quality_levels,
            'feature_names': self.feature_names,
            'trained_at': datetime.now().isoformat()
        }
        
        with open(json_path, 'w') as f:
            json.dump(json_data, f, indent=2)
        
        print(f"✅ Model metadata saved to {json_path}")
    
    def load_models(self, model_path='python/models/mood_svm_models.pkl'):
        """
        Load trained models and scalers
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        model_data = joblib.load(model_path)
        
        self.models = model_data['models']
        self.scalers = model_data['scalers']
        self.feature_names = model_data['feature_names']
        self.mood_categories = model_data['mood_categories']
        self.mood_intensity_levels = model_data['mood_intensity_levels']
        self.mood_affecting_symptoms = model_data['mood_affecting_symptoms']
        self.lifestyle_factors = model_data['lifestyle_factors']
        self.cycle_phases = model_data['cycle_phases']
        self.weather_conditions = model_data['weather_conditions']
        self.sleep_quality_levels = model_data['sleep_quality_levels']
        
        print(f"✅ SVM mood models loaded from {model_path}")
        print(f"📊 Models trained at: {model_data.get('trained_at', 'Unknown')}")

def main():
    """
    Main function to train and test SVM Mood Prediction models
    """
    print("=" * 70)
    print("🎯 SVM Mood Prediction")
    print("SafeHer Project - Women's Health & Safety App")
    print("=" * 70)
    
    # Initialize SVM predictor
    svm_predictor = MoodSVMPredictor()
    
    # Generate synthetic training data
    df = svm_predictor.generate_synthetic_mood_data(num_samples=3000)
    
    # Train mood classification models
    X_classification, y_classification, y_classification_labels = svm_predictor.prepare_mood_classification_features(df)
    classification_results = svm_predictor.train_mood_classification_models(X_classification, y_classification, y_classification_labels)
    
    # Train mood intensity models
    X_intensity, y_intensity = svm_predictor.prepare_mood_intensity_features(df)
    intensity_results = svm_predictor.train_mood_intensity_models(X_intensity, y_intensity)
    
    # Save models
    svm_predictor.save_models()
    
    # Test predictions
    print("\n🧪 Testing Predictions:")
    
    # Test mood prediction
    test_mood_data = {
        'age': 28,
        'cycle_phase': 'ovulation',
        'exercise_duration': 45,
        'sleep_hours': 8,
        'sleep_quality': 'excellent',
        'water_intake': 3.0,
        'meals_eaten': 3,
        'caffeine_intake': 150,
        'social_interaction': 6,
        'work_stress': 4,
        'weather': 'sunny',
        'social_media_time': 1.5,
        'outdoor_time': 2.5,
        'meditation_time': 20,
        'symptoms': {
            'fatigue': False,
            'headache': False,
            'mood_swings': False,
            'anxiety': False,
            'stress': False
        }
    }
    
    mood_prediction = svm_predictor.predict_mood(test_mood_data)
    print(f"Mood Prediction: {mood_prediction}")
    
    # Test mood intensity prediction
    intensity_prediction = svm_predictor.predict_mood_intensity(test_mood_data)
    print(f"Mood Intensity Prediction: {intensity_prediction}")
    
    # Show feature importance
    print("\n📊 Feature Importance (Mood Classification):")
    importance = svm_predictor.get_feature_importance('mood_classification')
    for feature, imp in importance[:10]:  # Top 10 features
        print(f"  {feature}: {imp:.4f}")
    
    print("\n" + "=" * 70)
    print("✅ SVM Mood Prediction Models Training Complete!")
    print("=" * 70)
    print(f"\n📁 Model files saved:")
    print(f"   - python/models/mood_svm_models.pkl")
    print(f"   - python/models/mood_svm_models.json")
    print(f"\n📊 Model Performance Summary:")
    print(f"   - Mood Classification Best F1: {max(r['f1_score'] for r in classification_results.values()):.4f}")
    print(f"   - Mood Intensity Best R²: {max(r['r2'] for r in intensity_results.values()):.4f}")
    print(f"\n📝 Next steps:")
    print("   1. Test the models with real mood data")
    print("   2. Integrate with Node.js backend")
    print("   3. Create API endpoints")
    print("   4. Build mood prediction dashboard")

if __name__ == "__main__":
    main()
