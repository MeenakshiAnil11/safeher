"""
Decision Tree Implementation for Pregnancy Health Prediction
SafeHer Project - Women's Health & Safety App

This module implements Decision Tree algorithms for pregnancy health analysis:
- Decision Tree Classifier: For pregnancy health risk classification
- Decision Tree Regressor: For continuous pregnancy health metrics
- Random Forest: For ensemble pregnancy health prediction
- Extra Trees: For robust pregnancy health analysis
"""

import os
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, ExtraTreesClassifier
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
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class PregnancyDecisionTree:
    """
    Decision Tree models for pregnancy health prediction and analysis
    """
    
    def __init__(self):
        """
        Initialize Decision Tree models for pregnancy health prediction
        """
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.feature_names = {}
        
        # Pregnancy health risk categories
        self.health_risk_categories = [
            'Low Risk', 'Moderate Risk', 'High Risk', 'Critical Risk'
        ]
        
        # Pregnancy complications
        self.complications = [
            'No Complications', 'Gestational Diabetes', 'Preeclampsia', 
            'Preterm Labor', 'High Blood Pressure', 'Anemia', 'Depression'
        ]
        
        # Trimester categories
        self.trimesters = ['first', 'second', 'third']
        
        # Mood categories
        self.mood_categories = [
            'happy', 'anxious', 'excited', 'worried', 'calm', 
            'irritable', 'emotional', 'neutral'
        ]
        
        # Sleep quality categories
        self.sleep_quality_categories = ['poor', 'fair', 'good', 'excellent']
        
        # Common pregnancy symptoms
        self.pregnancy_symptoms = [
            'nausea', 'vomiting', 'fatigue', 'moodSwings', 'foodCravings',
            'foodAversions', 'breastTenderness', 'frequentUrination',
            'backPain', 'heartburn', 'constipation', 'swelling', 'insomnia'
        ]
    
    def generate_synthetic_pregnancy_data(self, num_samples=2500):
        """
        Generate synthetic pregnancy data for training Decision Tree models
        """
        print("📊 Generating synthetic pregnancy data for Decision Tree training...")
        
        np.random.seed(42)
        
        data = []
        
        for i in range(num_samples):
            # Generate pregnancy week (1-40)
            week = np.random.randint(1, 41)
            
            # Determine trimester
            if week <= 13:
                trimester = 'first'
            elif week <= 26:
                trimester = 'second'
            else:
                trimester = 'third'
            
            # Generate maternal age (18-45)
            age = np.random.randint(18, 46)
            
            # Generate weight and weight gain
            pre_pregnancy_weight = np.random.normal(65, 12)  # kg
            current_weight = pre_pregnancy_weight + (week * 0.3) + np.random.normal(0, 2)
            weight_gain = current_weight - pre_pregnancy_weight
            
            # Generate symptoms based on trimester and week
            symptoms = self._generate_pregnancy_symptoms(week, trimester, age)
            
            # Generate vital signs
            systolic = np.random.normal(110, 15)
            diastolic = np.random.normal(70, 10)
            blood_sugar = np.random.normal(85, 20)
            
            # Generate mood based on symptoms and trimester
            mood = self._generate_pregnancy_mood(symptoms, trimester, week)
            
            # Generate energy and stress levels
            energy = max(1, min(10, np.random.normal(6, 2)))
            stress = max(1, min(10, np.random.normal(5, 2)))
            
            # Generate sleep data
            sleep_hours = np.random.normal(8, 1.5)
            sleep_hours = max(4, min(12, sleep_hours))
            sleep_quality = self._generate_sleep_quality(sleep_hours, symptoms)
            
            # Generate nutrition data
            meals_eaten = np.random.randint(2, 6)
            water_intake = np.random.normal(2.5, 0.8)
            
            # Generate exercise data
            exercise = np.random.choice([True, False], p=[0.6, 0.4])
            exercise_duration = np.random.randint(15, 90) if exercise else 0
            
            # Generate fetal movement (for later weeks)
            fetal_movement = week > 16 and np.random.choice([True, False], p=[0.8, 0.2])
            kick_count = np.random.randint(0, 20) if fetal_movement else 0
            
            # Calculate health risk based on medical guidelines
            health_risk = self._calculate_pregnancy_health_risk(
                age, week, trimester, symptoms, systolic, diastolic, 
                blood_sugar, weight_gain, mood, stress, sleep_hours
            )
            
            # Determine complications
            complications = self._determine_pregnancy_complications(
                age, week, symptoms, systolic, diastolic, blood_sugar, weight_gain
            )
            
            data.append({
                'week': week,
                'trimester': trimester,
                'age': age,
                'weight': round(current_weight, 1),
                'weight_gain': round(weight_gain, 1),
                'systolic': int(systolic),
                'diastolic': int(diastolic),
                'blood_sugar': round(blood_sugar, 1),
                'mood': mood,
                'energy': int(energy),
                'stress': int(stress),
                'sleep_hours': round(sleep_hours, 1),
                'sleep_quality': sleep_quality,
                'meals_eaten': meals_eaten,
                'water_intake': round(water_intake, 1),
                'exercise': exercise,
                'exercise_duration': exercise_duration,
                'fetal_movement': fetal_movement,
                'kick_count': kick_count,
                'health_risk': health_risk,
                'complications': complications,
                'nausea': symptoms['nausea'],
                'vomiting': symptoms['vomiting'],
                'fatigue': symptoms['fatigue'],
                'mood_swings': symptoms['mood_swings'],
                'food_cravings': symptoms['food_cravings'],
                'food_aversions': symptoms['food_aversions'],
                'breast_tenderness': symptoms['breast_tenderness'],
                'frequent_urination': symptoms['frequent_urination'],
                'back_pain': symptoms['back_pain'],
                'heartburn': symptoms['heartburn'],
                'constipation': symptoms['constipation'],
                'swelling': symptoms['swelling'],
                'insomnia': symptoms['insomnia']
            })
        
        df = pd.DataFrame(data)
        print(f"✅ Generated {len(df)} synthetic pregnancy records")
        print(f"📊 Health risk distribution: {df['health_risk'].value_counts().to_dict()}")
        print(f"📊 Complications distribution: {df['complications'].value_counts().to_dict()}")
        
        return df
    
    def _generate_pregnancy_symptoms(self, week, trimester, age):
        """
        Generate realistic pregnancy symptoms based on week, trimester, and age
        """
        symptoms = {}
        
        # First trimester symptoms (weeks 1-13)
        if trimester == 'first':
            symptoms['nausea'] = np.random.choice([True, False], p=[0.7, 0.3])
            symptoms['vomiting'] = np.random.choice([True, False], p=[0.3, 0.7])
            symptoms['fatigue'] = np.random.choice([True, False], p=[0.8, 0.2])
            symptoms['mood_swings'] = np.random.choice([True, False], p=[0.6, 0.4])
            symptoms['breast_tenderness'] = np.random.choice([True, False], p=[0.7, 0.3])
            symptoms['frequent_urination'] = np.random.choice([True, False], p=[0.6, 0.4])
            symptoms['food_cravings'] = np.random.choice([True, False], p=[0.5, 0.5])
            symptoms['food_aversions'] = np.random.choice([True, False], p=[0.6, 0.4])
        
        # Second trimester symptoms (weeks 14-26)
        elif trimester == 'second':
            symptoms['nausea'] = np.random.choice([True, False], p=[0.2, 0.8])
            symptoms['vomiting'] = np.random.choice([True, False], p=[0.1, 0.9])
            symptoms['fatigue'] = np.random.choice([True, False], p=[0.4, 0.6])
            symptoms['mood_swings'] = np.random.choice([True, False], p=[0.3, 0.7])
            symptoms['breast_tenderness'] = np.random.choice([True, False], p=[0.5, 0.5])
            symptoms['frequent_urination'] = np.random.choice([True, False], p=[0.7, 0.3])
            symptoms['back_pain'] = np.random.choice([True, False], p=[0.6, 0.4])
            symptoms['heartburn'] = np.random.choice([True, False], p=[0.5, 0.5])
            symptoms['constipation'] = np.random.choice([True, False], p=[0.4, 0.6])
        
        # Third trimester symptoms (weeks 27-40)
        else:
            symptoms['fatigue'] = np.random.choice([True, False], p=[0.8, 0.2])
            symptoms['back_pain'] = np.random.choice([True, False], p=[0.8, 0.2])
            symptoms['heartburn'] = np.random.choice([True, False], p=[0.7, 0.3])
            symptoms['constipation'] = np.random.choice([True, False], p=[0.5, 0.5])
            symptoms['swelling'] = np.random.choice([True, False], p=[0.6, 0.4])
            symptoms['insomnia'] = np.random.choice([True, False], p=[0.6, 0.4])
            symptoms['frequent_urination'] = np.random.choice([True, False], p=[0.8, 0.2])
        
        # Age-related symptoms
        if age > 35:
            symptoms['fatigue'] = symptoms.get('fatigue', False) or np.random.choice([True, False], p=[0.3, 0.7])
            symptoms['back_pain'] = symptoms.get('back_pain', False) or np.random.choice([True, False], p=[0.3, 0.7])
        
        # Ensure all symptoms are defined
        for symptom in self.pregnancy_symptoms:
            if symptom not in symptoms:
                symptoms[symptom] = False
        
        return symptoms
    
    def _generate_pregnancy_mood(self, symptoms, trimester, week):
        """
        Generate mood based on symptoms, trimester, and week
        """
        mood_probabilities = {
            'happy': 0.2, 'anxious': 0.15, 'excited': 0.1, 'worried': 0.15,
            'calm': 0.1, 'irritable': 0.15, 'emotional': 0.1, 'neutral': 0.05
        }
        
        # Adjust probabilities based on symptoms
        if symptoms.get('nausea', False) or symptoms.get('vomiting', False):
            mood_probabilities['irritable'] += 0.2
            mood_probabilities['anxious'] += 0.1
            mood_probabilities['happy'] = 0.05
        
        if symptoms.get('fatigue', False):
            mood_probabilities['tired'] = 0.3
            mood_probabilities['irritable'] += 0.1
        
        if symptoms.get('mood_swings', False):
            mood_probabilities['emotional'] += 0.2
            mood_probabilities['irritable'] += 0.1
        
        # Trimester adjustments
        if trimester == 'first':
            mood_probabilities['anxious'] += 0.1
            mood_probabilities['worried'] += 0.1
        elif trimester == 'third':
            mood_probabilities['excited'] += 0.1
            mood_probabilities['worried'] += 0.1
        
        # Normalize probabilities
        total = sum(mood_probabilities.values())
        mood_probabilities = {k: v/total for k, v in mood_probabilities.items()}
        
        # Sample mood
        moods = list(mood_probabilities.keys())
        probabilities = list(mood_probabilities.values())
        
        return np.random.choice(moods, p=probabilities)
    
    def _generate_sleep_quality(self, sleep_hours, symptoms):
        """
        Generate sleep quality based on sleep hours and symptoms
        """
        if sleep_hours >= 8:
            if symptoms.get('insomnia', False):
                return np.random.choice(['poor', 'fair'], p=[0.6, 0.4])
            else:
                return np.random.choice(['good', 'excellent'], p=[0.6, 0.4])
        elif sleep_hours >= 6:
            if symptoms.get('insomnia', False) or symptoms.get('frequent_urination', False):
                return np.random.choice(['poor', 'fair'], p=[0.7, 0.3])
            else:
                return np.random.choice(['fair', 'good'], p=[0.6, 0.4])
        else:
            return np.random.choice(['poor', 'fair'], p=[0.8, 0.2])
    
    def _calculate_pregnancy_health_risk(self, age, week, trimester, symptoms, systolic, diastolic, blood_sugar, weight_gain, mood, stress, sleep_hours):
        """
        Calculate pregnancy health risk based on medical guidelines
        """
        risk_score = 0
        
        # Age factor
        if age > 40:
            risk_score += 20
        elif age > 35:
            risk_score += 10
        
        # Blood pressure factor
        if systolic > 140 or diastolic > 90:
            risk_score += 25
        elif systolic > 130 or diastolic > 80:
            risk_score += 15
        
        # Blood sugar factor
        if blood_sugar > 140:
            risk_score += 20
        elif blood_sugar > 100:
            risk_score += 10
        
        # Weight gain factor
        if week <= 13:
            expected_gain = 1-2
        elif week <= 26:
            expected_gain = 6-10
        else:
            expected_gain = 11-16
        
        if weight_gain > expected_gain + 3:
            risk_score += 15
        elif weight_gain < expected_gain - 2:
            risk_score += 10
        
        # Symptom factors
        if symptoms.get('vomiting', False) and trimester != 'first':
            risk_score += 10
        
        if symptoms.get('swelling', False) and trimester == 'second':
            risk_score += 15
        
        # Mood and stress factors
        if mood in ['anxious', 'worried', 'irritable']:
            risk_score += 5
        
        if stress > 7:
            risk_score += 10
        
        # Sleep factor
        if sleep_hours < 6:
            risk_score += 10
        
        # Convert to risk category
        if risk_score <= 20:
            return 'Low Risk'
        elif risk_score <= 40:
            return 'Moderate Risk'
        elif risk_score <= 60:
            return 'High Risk'
        else:
            return 'Critical Risk'
    
    def _determine_pregnancy_complications(self, age, week, symptoms, systolic, diastolic, blood_sugar, weight_gain):
        """
        Determine pregnancy complications based on medical criteria
        """
        complications = []
        
        # Gestational Diabetes
        if blood_sugar > 140:
            complications.append('Gestational Diabetes')
        
        # Preeclampsia
        if systolic > 140 or diastolic > 90:
            if symptoms.get('swelling', False) or symptoms.get('headache', False):
                complications.append('Preeclampsia')
        
        # High Blood Pressure
        if systolic > 130 or diastolic > 80:
            complications.append('High Blood Pressure')
        
        # Anemia (simplified)
        if symptoms.get('fatigue', False) and symptoms.get('pale_skin', False):
            complications.append('Anemia')
        
        # Preterm Labor risk
        if week > 20 and (symptoms.get('contractions', False) or symptoms.get('pelvic_pressure', False)):
            complications.append('Preterm Labor')
        
        # Depression risk
        if age > 35 and symptoms.get('mood_swings', False):
            complications.append('Depression')
        
        return complications[0] if complications else 'No Complications'
    
    def prepare_health_risk_features(self, df):
        """
        Prepare features for pregnancy health risk prediction
        """
        print("🔧 Preparing features for pregnancy health risk prediction...")
        
        # Create binary features for symptoms
        for symptom in self.pregnancy_symptoms:
            df[f'has_{symptom}'] = df[symptom].astype(int)
        
        # Create binary features for mood
        for mood in self.mood_categories:
            df[f'mood_{mood}'] = (df['mood'] == mood).astype(int)
        
        # Create binary features for trimester
        for trimester in self.trimesters:
            df[f'trimester_{trimester}'] = (df['trimester'] == trimester).astype(int)
        
        # Create binary features for sleep quality
        for quality in self.sleep_quality_categories:
            df[f'sleep_{quality}'] = (df['sleep_quality'] == quality).astype(int)
        
        # Feature columns
        feature_columns = [
            'week', 'age', 'weight', 'weight_gain', 'systolic', 'diastolic',
            'blood_sugar', 'energy', 'stress', 'sleep_hours', 'meals_eaten',
            'water_intake', 'exercise', 'exercise_duration', 'kick_count'
        ]
        
        # Add symptom features
        symptom_features = [f'has_{s}' for s in self.pregnancy_symptoms]
        feature_columns.extend(symptom_features)
        
        # Add mood features
        mood_features = [f'mood_{m}' for m in self.mood_categories]
        feature_columns.extend(mood_features)
        
        # Add trimester features
        trimester_features = [f'trimester_{t}' for t in self.trimesters]
        feature_columns.extend(trimester_features)
        
        # Add sleep quality features
        sleep_features = [f'sleep_{q}' for q in self.sleep_quality_categories]
        feature_columns.extend(sleep_features)
        
        X = df[feature_columns].copy()
        y = df['health_risk'].copy()
        
        # Handle missing values
        X = X.fillna(X.mean())
        
        # Encode target labels
        y_encoded = LabelEncoder().fit_transform(y)
        
        self.feature_names['health_risk'] = feature_columns
        
        print(f"📊 Features: {len(feature_columns)}")
        print(f"📊 Target classes: {np.unique(y)}")
        print(f"📊 Feature matrix shape: {X.shape}")
        
        return X, y_encoded, y
    
    def prepare_complications_features(self, df):
        """
        Prepare features for pregnancy complications prediction
        """
        print("🔧 Preparing features for pregnancy complications prediction...")
        
        # Create binary features for symptoms
        for symptom in self.pregnancy_symptoms:
            df[f'has_{symptom}'] = df[symptom].astype(int)
        
        # Create binary features for mood
        for mood in self.mood_categories:
            df[f'mood_{mood}'] = (df['mood'] == mood).astype(int)
        
        # Create binary features for trimester
        for trimester in self.trimesters:
            df[f'trimester_{trimester}'] = (df['trimester'] == trimester).astype(int)
        
        # Feature columns
        feature_columns = [
            'week', 'age', 'weight', 'weight_gain', 'systolic', 'diastolic',
            'blood_sugar', 'energy', 'stress', 'sleep_hours', 'meals_eaten',
            'water_intake', 'exercise', 'exercise_duration'
        ]
        
        # Add symptom features
        symptom_features = [f'has_{s}' for s in self.pregnancy_symptoms]
        feature_columns.extend(symptom_features)
        
        # Add mood features
        mood_features = [f'mood_{m}' for m in self.mood_categories]
        feature_columns.extend(mood_features)
        
        # Add trimester features
        trimester_features = [f'trimester_{t}' for t in self.trimesters]
        feature_columns.extend(trimester_features)
        
        X = df[feature_columns].copy()
        y = df['complications'].copy()
        
        # Handle missing values
        X = X.fillna(X.mean())
        
        # Encode target labels
        y_encoded = LabelEncoder().fit_transform(y)
        
        self.feature_names['complications'] = feature_columns
        
        print(f"📊 Features: {len(feature_columns)}")
        print(f"📊 Target classes: {np.unique(y)}")
        print(f"📊 Feature matrix shape: {X.shape}")
        
        return X, y_encoded, y
    
    def train_health_risk_models(self, X, y, y_labels):
        """
        Train multiple Decision Tree models for health risk prediction
        """
        print("\n🚀 Training Decision Tree Models for Pregnancy Health Risk...")
        
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
        
        self.scalers['health_risk'] = scaler
        
        # Define models to train
        models_to_train = {
            'DecisionTree': DecisionTreeClassifier(random_state=42),
            'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42),
            'ExtraTrees': ExtraTreesClassifier(n_estimators=100, random_state=42)
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
        self.models['health_risk'] = results[best_model_name]['model']
        
        print(f"\n🏆 Best model: {best_model_name}")
        print(f"📊 Best F1-Score: {results[best_model_name]['f1_score']:.4f}")
        
        # Detailed evaluation
        print(f"\n📋 Classification Report for {best_model_name}:")
        print(classification_report(y_test, results[best_model_name]['predictions'], 
                                  target_names=np.unique(y_labels)))
        
        return results
    
    def train_complications_models(self, X, y, y_labels):
        """
        Train multiple Decision Tree models for complications prediction
        """
        print("\n🚀 Training Decision Tree Models for Pregnancy Complications...")
        
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
        
        self.scalers['complications'] = scaler
        
        # Define models to train
        models_to_train = {
            'DecisionTree': DecisionTreeClassifier(random_state=42),
            'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42),
            'ExtraTrees': ExtraTreesClassifier(n_estimators=100, random_state=42)
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
        self.models['complications'] = results[best_model_name]['model']
        
        print(f"\n🏆 Best model: {best_model_name}")
        print(f"📊 Best F1-Score: {results[best_model_name]['f1_score']:.4f}")
        
        # Detailed evaluation
        print(f"\n📋 Classification Report for {best_model_name}:")
        print(classification_report(y_test, results[best_model_name]['predictions'], 
                                  target_names=np.unique(y_labels)))
        
        return results
    
    def predict_health_risk(self, pregnancy_data):
        """
        Predict pregnancy health risk using Decision Tree
        
        Args:
            pregnancy_data (dict): Dictionary containing pregnancy information
        
        Returns:
            dict: Prediction results with risk category and confidence
        """
        if 'health_risk' not in self.models:
            raise ValueError("Health risk model not trained. Please train the model first.")
        
        # Prepare features
        features = self._prepare_health_risk_features(pregnancy_data)
        
        # Scale features
        X_scaled = self.scalers['health_risk'].transform([features])
        
        # Make prediction
        prediction = self.models['health_risk'].predict(X_scaled)[0]
        prediction_proba = self.models['health_risk'].predict_proba(X_scaled)[0]
        
        # Get risk category name
        risk_names = self.health_risk_categories
        predicted_risk = risk_names[prediction]
        
        # Calculate confidence
        confidence = max(prediction_proba) * 100
        
        # Get probabilities for all risk categories
        risk_probabilities = {}
        for i, risk in enumerate(risk_names):
            risk_probabilities[risk] = prediction_proba[i] * 100
        
        return {
            'health_risk': predicted_risk,
            'confidence': round(confidence, 2),
            'risk_probabilities': risk_probabilities,
            'prediction_details': {
                'model': 'Decision Tree',
                'algorithm': type(self.models['health_risk']).__name__,
                'features_used': len(features)
            }
        }
    
    def predict_complications(self, pregnancy_data):
        """
        Predict pregnancy complications using Decision Tree
        
        Args:
            pregnancy_data (dict): Dictionary containing pregnancy information
        
        Returns:
            dict: Prediction results with complications and confidence
        """
        if 'complications' not in self.models:
            raise ValueError("Complications model not trained. Please train the model first.")
        
        # Prepare features
        features = self._prepare_complications_features(pregnancy_data)
        
        # Scale features
        X_scaled = self.scalers['complications'].transform([features])
        
        # Make prediction
        prediction = self.models['complications'].predict(X_scaled)[0]
        prediction_proba = self.models['complications'].predict_proba(X_scaled)[0]
        
        # Get complication name
        complication_names = self.complications
        predicted_complication = complication_names[prediction]
        
        # Calculate confidence
        confidence = max(prediction_proba) * 100
        
        # Get probabilities for all complications
        complication_probabilities = {}
        for i, complication in enumerate(complication_names):
            complication_probabilities[complication] = prediction_proba[i] * 100
        
        return {
            'complications': predicted_complication,
            'confidence': round(confidence, 2),
            'complication_probabilities': complication_probabilities,
            'prediction_details': {
                'model': 'Decision Tree',
                'algorithm': type(self.models['complications']).__name__,
                'features_used': len(features)
            }
        }
    
    def _prepare_health_risk_features(self, pregnancy_data):
        """
        Prepare features for health risk prediction
        """
        features = []
        
        # Basic features
        features.extend([
            pregnancy_data.get('week', 20),
            pregnancy_data.get('age', 30),
            pregnancy_data.get('weight', 65),
            pregnancy_data.get('weight_gain', 5),
            pregnancy_data.get('systolic', 120),
            pregnancy_data.get('diastolic', 80),
            pregnancy_data.get('blood_sugar', 85),
            pregnancy_data.get('energy', 5),
            pregnancy_data.get('stress', 5),
            pregnancy_data.get('sleep_hours', 8),
            pregnancy_data.get('meals_eaten', 3),
            pregnancy_data.get('water_intake', 2.5),
            pregnancy_data.get('exercise', 0),
            pregnancy_data.get('exercise_duration', 0),
            pregnancy_data.get('kick_count', 0)
        ])
        
        # Symptom features
        symptoms = pregnancy_data.get('symptoms', {})
        for symptom in self.pregnancy_symptoms:
            features.append(1 if symptoms.get(symptom, False) else 0)
        
        # Mood features
        mood = pregnancy_data.get('mood', 'neutral')
        for mood_category in self.mood_categories:
            features.append(1 if mood == mood_category else 0)
        
        # Trimester features
        trimester = pregnancy_data.get('trimester', 'second')
        for trimester_category in self.trimesters:
            features.append(1 if trimester == trimester_category else 0)
        
        # Sleep quality features
        sleep_quality = pregnancy_data.get('sleep_quality', 'good')
        for quality in self.sleep_quality_categories:
            features.append(1 if sleep_quality == quality else 0)
        
        return features
    
    def _prepare_complications_features(self, pregnancy_data):
        """
        Prepare features for complications prediction
        """
        features = []
        
        # Basic features
        features.extend([
            pregnancy_data.get('week', 20),
            pregnancy_data.get('age', 30),
            pregnancy_data.get('weight', 65),
            pregnancy_data.get('weight_gain', 5),
            pregnancy_data.get('systolic', 120),
            pregnancy_data.get('diastolic', 80),
            pregnancy_data.get('blood_sugar', 85),
            pregnancy_data.get('energy', 5),
            pregnancy_data.get('stress', 5),
            pregnancy_data.get('sleep_hours', 8),
            pregnancy_data.get('meals_eaten', 3),
            pregnancy_data.get('water_intake', 2.5),
            pregnancy_data.get('exercise', 0),
            pregnancy_data.get('exercise_duration', 0)
        ])
        
        # Symptom features
        symptoms = pregnancy_data.get('symptoms', {})
        for symptom in self.pregnancy_symptoms:
            features.append(1 if symptoms.get(symptom, False) else 0)
        
        # Mood features
        mood = pregnancy_data.get('mood', 'neutral')
        for mood_category in self.mood_categories:
            features.append(1 if mood == mood_category else 0)
        
        # Trimester features
        trimester = pregnancy_data.get('trimester', 'second')
        for trimester_category in self.trimesters:
            features.append(1 if trimester == trimester_category else 0)
        
        return features
    
    def get_feature_importance(self, model_type='health_risk'):
        """
        Get feature importance from Decision Tree models
        """
        if model_type not in self.models:
            raise ValueError(f"{model_type} model not trained.")
        
        model = self.models[model_type]
        feature_names = self.feature_names[model_type]
        
        if hasattr(model, 'feature_importances_'):
            importance = model.feature_importances_
            feature_importance = list(zip(feature_names, importance))
            feature_importance.sort(key=lambda x: x[1], reverse=True)
            return feature_importance
        else:
            return []
    
    def save_models(self, model_path='python/models/pregnancy_decision_tree_models.pkl'):
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
            'health_risk_categories': self.health_risk_categories,
            'complications': self.complications,
            'trimesters': self.trimesters,
            'mood_categories': self.mood_categories,
            'sleep_quality_categories': self.sleep_quality_categories,
            'pregnancy_symptoms': self.pregnancy_symptoms,
            'trained_at': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, model_path)
        print(f"✅ Decision Tree models saved to {model_path}")
        
        # Also save as JSON for Node.js compatibility
        json_path = model_path.replace('.pkl', '.json')
        json_data = {
            'health_risk_categories': self.health_risk_categories,
            'complications': self.complications,
            'trimesters': self.trimesters,
            'mood_categories': self.mood_categories,
            'sleep_quality_categories': self.sleep_quality_categories,
            'pregnancy_symptoms': self.pregnancy_symptoms,
            'feature_names': self.feature_names,
            'trained_at': datetime.now().isoformat()
        }
        
        with open(json_path, 'w') as f:
            json.dump(json_data, f, indent=2)
        
        print(f"✅ Model metadata saved to {json_path}")
    
    def load_models(self, model_path='python/models/pregnancy_decision_tree_models.pkl'):
        """
        Load trained models and scalers
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        model_data = joblib.load(model_path)
        
        self.models = model_data['models']
        self.scalers = model_data['scalers']
        self.feature_names = model_data['feature_names']
        self.health_risk_categories = model_data['health_risk_categories']
        self.complications = model_data['complications']
        self.trimesters = model_data['trimesters']
        self.mood_categories = model_data['mood_categories']
        self.sleep_quality_categories = model_data['sleep_quality_categories']
        self.pregnancy_symptoms = model_data['pregnancy_symptoms']
        
        print(f"✅ Decision Tree models loaded from {model_path}")
        print(f"📊 Models trained at: {model_data.get('trained_at', 'Unknown')}")

def main():
    """
    Main function to train and test Decision Tree Pregnancy Health models
    """
    print("=" * 70)
    print("🎯 Decision Tree Pregnancy Health Prediction")
    print("SafeHer Project - Women's Health & Safety App")
    print("=" * 70)
    
    # Initialize Decision Tree classifier
    decision_tree = PregnancyDecisionTree()
    
    # Generate synthetic training data
    df = decision_tree.generate_synthetic_pregnancy_data(num_samples=3000)
    
    # Train health risk models
    X_risk, y_risk, y_risk_labels = decision_tree.prepare_health_risk_features(df)
    risk_results = decision_tree.train_health_risk_models(X_risk, y_risk, y_risk_labels)
    
    # Train complications models
    X_comp, y_comp, y_comp_labels = decision_tree.prepare_complications_features(df)
    comp_results = decision_tree.train_complications_models(X_comp, y_comp, y_comp_labels)
    
    # Save models
    decision_tree.save_models()
    
    # Test predictions
    print("\n🧪 Testing Predictions:")
    
    # Test health risk prediction
    test_pregnancy_data = {
        'week': 25,
        'age': 32,
        'weight': 68,
        'weight_gain': 8,
        'systolic': 135,
        'diastolic': 85,
        'blood_sugar': 120,
        'mood': 'anxious',
        'energy': 4,
        'stress': 7,
        'sleep_hours': 6,
        'sleep_quality': 'fair',
        'meals_eaten': 3,
        'water_intake': 2.5,
        'exercise': True,
        'exercise_duration': 30,
        'kick_count': 5,
        'symptoms': {
            'fatigue': True,
            'back_pain': True,
            'heartburn': True,
            'swelling': False
        }
    }
    
    health_risk_prediction = decision_tree.predict_health_risk(test_pregnancy_data)
    print(f"Health Risk Prediction: {health_risk_prediction}")
    
    # Test complications prediction
    complications_prediction = decision_tree.predict_complications(test_pregnancy_data)
    print(f"Complications Prediction: {complications_prediction}")
    
    # Show feature importance
    print("\n📊 Feature Importance (Health Risk):")
    importance = decision_tree.get_feature_importance('health_risk')
    for feature, imp in importance[:10]:  # Top 10 features
        print(f"  {feature}: {imp:.4f}")
    
    print("\n" + "=" * 70)
    print("✅ Decision Tree Pregnancy Health Models Training Complete!")
    print("=" * 70)
    print(f"\n📁 Model files saved:")
    print(f"   - python/models/pregnancy_decision_tree_models.pkl")
    print(f"   - python/models/pregnancy_decision_tree_models.json")
    print(f"\n📊 Model Performance Summary:")
    print(f"   - Health Risk Best F1: {max(r['f1_score'] for r in risk_results.values()):.4f}")
    print(f"   - Complications Best F1: {max(r['f1_score'] for r in comp_results.values()):.4f}")
    print(f"\n📝 Next steps:")
    print("   1. Test the models with real pregnancy data")
    print("   2. Integrate with Node.js backend")
    print("   3. Create API endpoints")
    print("   4. Build pregnancy health dashboard")

if __name__ == "__main__":
    main()
