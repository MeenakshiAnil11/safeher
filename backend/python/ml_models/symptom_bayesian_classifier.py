"""
Bayesian Classifiers Implementation for Symptom Classification
SafeHer Project - Women's Health & Safety App

This module implements multiple Bayesian classifiers for symptom analysis:
- Gaussian Naive Bayes: For continuous symptom features
- Multinomial Naive Bayes: For categorical symptom features
- Bernoulli Naive Bayes: For binary symptom features
- Complement Naive Bayes: For imbalanced symptom data
"""

import os
import pandas as pd
import numpy as np
from sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB, ComplementNB
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score
)
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class SymptomBayesianClassifier:
    """
    Bayesian Classifiers for symptom classification and severity prediction
    """
    
    def __init__(self):
        """
        Initialize Bayesian classifiers for different symptom analysis tasks
        """
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.vectorizers = {}
        self.feature_names = {}
        
        # Symptom categories based on medical classification
        self.symptom_categories = [
            'Physical', 'Mental', 'Reproductive', 'Digestive', 
            'Respiratory', 'Cardiovascular', 'Neurological', 'Skin'
        ]
        
        # Severity levels
        self.severity_levels = ['Mild', 'Moderate', 'Severe', 'Critical']
        
        # Common symptoms for each category
        self.symptom_mapping = {
            'Physical': ['fatigue', 'headache', 'body_ache', 'muscle_pain', 'joint_pain', 'back_pain'],
            'Mental': ['anxiety', 'depression', 'stress', 'mood_swings', 'irritability', 'confusion'],
            'Reproductive': ['cramps', 'bloating', 'breast_tenderness', 'irregular_period', 'heavy_bleeding'],
            'Digestive': ['nausea', 'vomiting', 'diarrhea', 'constipation', 'stomach_pain', 'bloating'],
            'Respiratory': ['cough', 'shortness_breath', 'chest_tightness', 'wheezing', 'congestion'],
            'Cardiovascular': ['chest_pain', 'palpitations', 'dizziness', 'fainting', 'rapid_heartbeat'],
            'Neurological': ['headache', 'dizziness', 'numbness', 'tingling', 'memory_loss', 'confusion'],
            'Skin': ['rash', 'itching', 'dryness', 'acne', 'swelling', 'discoloration']
        }
        
        # Mood categories
        self.mood_categories = [
            'Happy', 'Sad', 'Anxious', 'Calm', 'Energetic', 
            'Tired', 'Irritable', 'Neutral', 'Excited', 'Worried'
        ]
    
    def generate_synthetic_symptom_data(self, num_samples=2000):
        """
        Generate synthetic symptom data for training Bayesian classifiers
        """
        print("📊 Generating synthetic symptom data for Bayesian training...")
        
        np.random.seed(42)
        
        data = []
        
        for i in range(num_samples):
            # Generate user profile
            age = np.random.randint(18, 81)
            gender = np.random.choice(['female', 'male'], p=[0.8, 0.2])  # 80% female for SafeHer
            
            # Generate symptoms based on age and gender
            symptoms = self._generate_realistic_symptoms(age, gender)
            
            # Generate mood based on symptoms
            mood = self._generate_mood_from_symptoms(symptoms)
            
            # Generate severity based on symptoms and mood
            severity = self._calculate_severity(symptoms, mood, age)
            
            # Generate additional features
            sleep_hours = np.random.normal(7.5, 1.5)
            sleep_hours = max(3, min(12, sleep_hours))
            
            stress_level = np.random.randint(1, 11)
            energy_level = np.random.randint(1, 11)
            
            # Generate symptom category
            symptom_category = self._classify_symptom_category(symptoms)
            
            # Generate time-based features
            hour_of_day = np.random.randint(0, 24)
            day_of_week = np.random.randint(0, 7)
            season = np.random.choice(['spring', 'summer', 'autumn', 'winter'])
            
            data.append({
                'age': age,
                'gender': gender,
                'symptoms': symptoms,
                'mood': mood,
                'severity': severity,
                'sleep_hours': round(sleep_hours, 1),
                'stress_level': stress_level,
                'energy_level': energy_level,
                'symptom_category': symptom_category,
                'hour_of_day': hour_of_day,
                'day_of_week': day_of_week,
                'season': season,
                'symptom_count': len(symptoms),
                'has_physical_symptoms': any(s in self.symptom_mapping['Physical'] for s in symptoms),
                'has_mental_symptoms': any(s in self.symptom_mapping['Mental'] for s in symptoms),
                'has_reproductive_symptoms': any(s in self.symptom_mapping['Reproductive'] for s in symptoms)
            })
        
        df = pd.DataFrame(data)
        print(f"✅ Generated {len(df)} synthetic symptom records")
        print(f"📊 Symptom category distribution: {df['symptom_category'].value_counts().to_dict()}")
        print(f"📊 Severity distribution: {df['severity'].value_counts().to_dict()}")
        
        return df
    
    def _generate_realistic_symptoms(self, age, gender):
        """
        Generate realistic symptoms based on age and gender
        """
        symptoms = []
        
        # Age-based symptoms
        if age > 50:
            symptoms.extend(['fatigue', 'joint_pain', 'memory_loss'])
        elif age > 35:
            symptoms.extend(['stress', 'back_pain'])
        
        # Gender-based symptoms (female-focused for SafeHer)
        if gender == 'female':
            symptoms.extend(['mood_swings', 'breast_tenderness', 'cramps'])
        
        # Random additional symptoms
        all_symptoms = [s for category in self.symptom_mapping.values() for s in category]
        num_additional = np.random.randint(0, 4)
        additional_symptoms = np.random.choice(all_symptoms, num_additional, replace=False)
        symptoms.extend(additional_symptoms)
        
        # Remove duplicates and ensure at least one symptom
        symptoms = list(set(symptoms))
        if not symptoms:
            symptoms = [np.random.choice(all_symptoms)]
        
        return symptoms
    
    def _generate_mood_from_symptoms(self, symptoms):
        """
        Generate mood based on symptoms (Bayesian relationship)
        """
        mood_probabilities = {
            'Happy': 0.1,
            'Sad': 0.15,
            'Anxious': 0.2,
            'Calm': 0.1,
            'Energetic': 0.05,
            'Tired': 0.2,
            'Irritable': 0.1,
            'Neutral': 0.05,
            'Excited': 0.02,
            'Worried': 0.03
        }
        
        # Adjust probabilities based on symptoms
        if 'fatigue' in symptoms or 'tired' in symptoms:
            mood_probabilities['Tired'] += 0.3
            mood_probabilities['Energetic'] = 0.01
        
        if 'anxiety' in symptoms or 'stress' in symptoms:
            mood_probabilities['Anxious'] += 0.3
            mood_probabilities['Calm'] = 0.05
        
        if 'depression' in symptoms or 'sad' in symptoms:
            mood_probabilities['Sad'] += 0.3
            mood_probabilities['Happy'] = 0.05
        
        if 'mood_swings' in symptoms:
            mood_probabilities['Irritable'] += 0.2
        
        # Normalize probabilities
        total = sum(mood_probabilities.values())
        mood_probabilities = {k: v/total for k, v in mood_probabilities.items()}
        
        # Sample mood based on probabilities
        moods = list(mood_probabilities.keys())
        probabilities = list(mood_probabilities.values())
        
        return np.random.choice(moods, p=probabilities)
    
    def _calculate_severity(self, symptoms, mood, age):
        """
        Calculate severity based on symptoms, mood, and age
        """
        severity_score = 0
        
        # Base severity from symptom count
        severity_score += len(symptoms) * 2
        
        # Mood impact
        mood_severity_map = {
            'Happy': 0, 'Calm': 0, 'Energetic': 0, 'Excited': 0,
            'Neutral': 1, 'Tired': 2, 'Anxious': 3, 'Worried': 3,
            'Irritable': 4, 'Sad': 5
        }
        severity_score += mood_severity_map.get(mood, 0)
        
        # Age factor
        if age > 60:
            severity_score += 3
        elif age > 40:
            severity_score += 1
        
        # Specific symptom severity
        high_severity_symptoms = ['chest_pain', 'fainting', 'memory_loss', 'confusion']
        if any(s in symptoms for s in high_severity_symptoms):
            severity_score += 5
        
        # Convert to severity level
        if severity_score <= 5:
            return 'Mild'
        elif severity_score <= 10:
            return 'Moderate'
        elif severity_score <= 15:
            return 'Severe'
        else:
            return 'Critical'
    
    def _classify_symptom_category(self, symptoms):
        """
        Classify symptoms into categories
        """
        category_scores = {}
        
        for category, category_symptoms in self.symptom_mapping.items():
            score = sum(1 for s in symptoms if s in category_symptoms)
            category_scores[category] = score
        
        # Return category with highest score
        if max(category_scores.values()) == 0:
            return 'Physical'  # Default category
        
        return max(category_scores, key=category_scores.get)
    
    def prepare_symptom_classification_features(self, df):
        """
        Prepare features for symptom category classification
        """
        print("🔧 Preparing features for symptom classification...")
        
        # Create symptom text features
        df['symptom_text'] = df['symptoms'].apply(lambda x: ' '.join(x))
        
        # Create binary features for each symptom category
        for category in self.symptom_categories:
            df[f'has_{category.lower()}_symptoms'] = df['symptoms'].apply(
                lambda x: any(s in self.symptom_mapping[category] for s in x)
            )
        
        # Create binary features for each mood
        for mood in self.mood_categories:
            df[f'mood_{mood.lower()}'] = (df['mood'] == mood).astype(int)
        
        # Feature columns for classification
        feature_columns = [
            'age', 'sleep_hours', 'stress_level', 'energy_level',
            'hour_of_day', 'day_of_week', 'symptom_count',
            'has_physical_symptoms', 'has_mental_symptoms', 'has_reproductive_symptoms'
        ]
        
        # Add mood features
        mood_features = [f'mood_{m.lower()}' for m in self.mood_categories]
        feature_columns.extend(mood_features)
        
        # Add symptom category features
        symptom_category_features = [f'has_{c.lower()}_symptoms' for c in self.symptom_categories]
        feature_columns.extend(symptom_category_features)
        
        X = df[feature_columns].copy()
        y = df['symptom_category'].copy()
        
        # Handle missing values
        X = X.fillna(X.mean())
        
        # Encode target labels
        y_encoded = LabelEncoder().fit_transform(y)
        
        self.feature_names['classification'] = feature_columns
        
        print(f"📊 Features: {len(feature_columns)}")
        print(f"📊 Target classes: {np.unique(y)}")
        print(f"📊 Feature matrix shape: {X.shape}")
        
        return X, y_encoded, y
    
    def prepare_severity_prediction_features(self, df):
        """
        Prepare features for severity prediction
        """
        print("🔧 Preparing features for severity prediction...")
        
        # Create symptom text features
        df['symptom_text'] = df['symptoms'].apply(lambda x: ' '.join(x))
        
        # Create binary features for each symptom
        all_symptoms = [s for category in self.symptom_mapping.values() for s in category]
        for symptom in all_symptoms:
            df[f'has_{symptom}'] = df['symptoms'].apply(lambda x: symptom in x)
        
        # Feature columns for severity prediction
        feature_columns = [
            'age', 'sleep_hours', 'stress_level', 'energy_level',
            'hour_of_day', 'day_of_week', 'symptom_count'
        ]
        
        # Add symptom features
        symptom_features = [f'has_{s}' for s in all_symptoms]
        feature_columns.extend(symptom_features)
        
        # Add mood features
        mood_features = [f'mood_{m.lower()}' for m in self.mood_categories]
        for mood in self.mood_categories:
            df[f'mood_{mood.lower()}'] = (df['mood'] == mood).astype(int)
        feature_columns.extend(mood_features)
        
        X = df[feature_columns].copy()
        y = df['severity'].copy()
        
        # Handle missing values
        X = X.fillna(X.mean())
        
        # Encode target labels
        y_encoded = LabelEncoder().fit_transform(y)
        
        self.feature_names['severity'] = feature_columns
        
        print(f"📊 Features: {len(feature_columns)}")
        print(f"📊 Target classes: {np.unique(y)}")
        print(f"📊 Feature matrix shape: {X.shape}")
        
        return X, y_encoded, y
    
    def train_symptom_classification_models(self, X, y, y_labels):
        """
        Train multiple Bayesian classifiers for symptom classification
        """
        print("\n🚀 Training Bayesian Classifiers for Symptom Classification...")
        
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
        
        self.scalers['classification'] = scaler
        
        # Define models to train
        models_to_train = {
            'GaussianNB': GaussianNB(),
            'MultinomialNB': MultinomialNB(),
            'BernoulliNB': BernoulliNB(),
            'ComplementNB': ComplementNB()
        }
        
        results = {}
        
        for model_name, model in models_to_train.items():
            print(f"\n🔍 Training {model_name}...")
            
            try:
                # Train model
                if model_name == 'MultinomialNB':
                    # Use MinMaxScaler for MultinomialNB (requires non-negative features)
                    minmax_scaler = MinMaxScaler()
                    X_train_scaled_model = minmax_scaler.fit_transform(X_train)
                    X_test_scaled_model = minmax_scaler.transform(X_test)
                    model.fit(X_train_scaled_model, y_train)
                else:
                    model.fit(X_train_scaled, y_train)
                
                # Make predictions
                if model_name == 'MultinomialNB':
                    y_pred = model.predict(X_test_scaled_model)
                    y_pred_proba = model.predict_proba(X_test_scaled_model)
                else:
                    y_pred = model.predict(X_test_scaled)
                    y_pred_proba = model.predict_proba(X_test_scaled)
                
                # Calculate metrics
                accuracy = accuracy_score(y_test, y_pred)
                precision = precision_score(y_test, y_pred, average='weighted')
                recall = recall_score(y_test, y_pred, average='weighted')
                f1 = f1_score(y_test, y_pred, average='weighted')
                
                # Cross-validation
                if model_name == 'MultinomialNB':
                    cv_scores = cross_val_score(model, X_train_scaled_model, y_train, cv=5)
                else:
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
        self.models['classification'] = results[best_model_name]['model']
        
        print(f"\n🏆 Best model: {best_model_name}")
        print(f"📊 Best F1-Score: {results[best_model_name]['f1_score']:.4f}")
        
        # Detailed evaluation
        print(f"\n📋 Classification Report for {best_model_name}:")
        print(classification_report(y_test, results[best_model_name]['predictions'], 
                                  target_names=np.unique(y_labels)))
        
        return results
    
    def train_severity_prediction_models(self, X, y, y_labels):
        """
        Train multiple Bayesian classifiers for severity prediction
        """
        print("\n🚀 Training Bayesian Classifiers for Severity Prediction...")
        
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
        
        self.scalers['severity'] = scaler
        
        # Define models to train
        models_to_train = {
            'GaussianNB': GaussianNB(),
            'MultinomialNB': MultinomialNB(),
            'BernoulliNB': BernoulliNB(),
            'ComplementNB': ComplementNB()
        }
        
        results = {}
        
        for model_name, model in models_to_train.items():
            print(f"\n🔍 Training {model_name}...")
            
            try:
                # Train model
                if model_name == 'MultinomialNB':
                    # Use MinMaxScaler for MultinomialNB
                    minmax_scaler = MinMaxScaler()
                    X_train_scaled_model = minmax_scaler.fit_transform(X_train)
                    X_test_scaled_model = minmax_scaler.transform(X_test)
                    model.fit(X_train_scaled_model, y_train)
                else:
                    model.fit(X_train_scaled, y_train)
                
                # Make predictions
                if model_name == 'MultinomialNB':
                    y_pred = model.predict(X_test_scaled_model)
                    y_pred_proba = model.predict_proba(X_test_scaled_model)
                else:
                    y_pred = model.predict(X_test_scaled)
                    y_pred_proba = model.predict_proba(X_test_scaled)
                
                # Calculate metrics
                accuracy = accuracy_score(y_test, y_pred)
                precision = precision_score(y_test, y_pred, average='weighted')
                recall = recall_score(y_test, y_pred, average='weighted')
                f1 = f1_score(y_test, y_pred, average='weighted')
                
                # Cross-validation
                if model_name == 'MultinomialNB':
                    cv_scores = cross_val_score(model, X_train_scaled_model, y_train, cv=5)
                else:
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
        self.models['severity'] = results[best_model_name]['model']
        
        print(f"\n🏆 Best model: {best_model_name}")
        print(f"📊 Best F1-Score: {results[best_model_name]['f1_score']:.4f}")
        
        # Detailed evaluation
        print(f"\n📋 Classification Report for {best_model_name}:")
        print(classification_report(y_test, results[best_model_name]['predictions'], 
                                  target_names=np.unique(y_labels)))
        
        return results
    
    def predict_symptom_category(self, symptom_data):
        """
        Predict symptom category using Bayesian classifier
        
        Args:
            symptom_data (dict): Dictionary containing symptom information
                Example: {
                    'age': 30, 'symptoms': ['fatigue', 'headache'], 'mood': 'Tired',
                    'sleep_hours': 6, 'stress_level': 7, 'energy_level': 3
                }
        
        Returns:
            dict: Prediction results with category and confidence
        """
        if 'classification' not in self.models:
            raise ValueError("Classification model not trained. Please train the model first.")
        
        # Prepare features
        features = self._prepare_classification_features(symptom_data)
        
        # Scale features
        X_scaled = self.scalers['classification'].transform([features])
        
        # Make prediction
        prediction = self.models['classification'].predict(X_scaled)[0]
        prediction_proba = self.models['classification'].predict_proba(X_scaled)[0]
        
        # Get category name
        category_names = self.symptom_categories
        predicted_category = category_names[prediction]
        
        # Calculate confidence
        confidence = max(prediction_proba) * 100
        
        # Get probabilities for all categories
        category_probabilities = {}
        for i, category in enumerate(category_names):
            category_probabilities[category] = prediction_proba[i] * 100
        
        return {
            'symptom_category': predicted_category,
            'confidence': round(confidence, 2),
            'category_probabilities': category_probabilities,
            'prediction_details': {
                'model': 'Bayesian Classifier',
                'algorithm': type(self.models['classification']).__name__,
                'features_used': len(features)
            }
        }
    
    def predict_severity(self, symptom_data):
        """
        Predict symptom severity using Bayesian classifier
        
        Args:
            symptom_data (dict): Dictionary containing symptom information
        
        Returns:
            dict: Prediction results with severity and confidence
        """
        if 'severity' not in self.models:
            raise ValueError("Severity model not trained. Please train the model first.")
        
        # Prepare features
        features = self._prepare_severity_features(symptom_data)
        
        # Scale features
        X_scaled = self.scalers['severity'].transform([features])
        
        # Make prediction
        prediction = self.models['severity'].predict(X_scaled)[0]
        prediction_proba = self.models['severity'].predict_proba(X_scaled)[0]
        
        # Get severity name
        severity_names = self.severity_levels
        predicted_severity = severity_names[prediction]
        
        # Calculate confidence
        confidence = max(prediction_proba) * 100
        
        # Get probabilities for all severity levels
        severity_probabilities = {}
        for i, severity in enumerate(severity_names):
            severity_probabilities[severity] = prediction_proba[i] * 100
        
        return {
            'severity': predicted_severity,
            'confidence': round(confidence, 2),
            'severity_probabilities': severity_probabilities,
            'prediction_details': {
                'model': 'Bayesian Classifier',
                'algorithm': type(self.models['severity']).__name__,
                'features_used': len(features)
            }
        }
    
    def _prepare_classification_features(self, symptom_data):
        """
        Prepare features for classification
        """
        features = []
        
        # Basic features
        features.extend([
            symptom_data.get('age', 30),
            symptom_data.get('sleep_hours', 7.5),
            symptom_data.get('stress_level', 5),
            symptom_data.get('energy_level', 5),
            symptom_data.get('hour_of_day', 12),
            symptom_data.get('day_of_week', 3),
            len(symptom_data.get('symptoms', []))
        ])
        
        # Binary features for symptom categories
        symptoms = symptom_data.get('symptoms', [])
        for category in self.symptom_categories:
            has_category_symptoms = any(s in self.symptom_mapping[category] for s in symptoms)
            features.append(1 if has_category_symptoms else 0)
        
        # Binary features for moods
        mood = symptom_data.get('mood', 'Neutral')
        for mood_category in self.mood_categories:
            features.append(1 if mood == mood_category else 0)
        
        return features
    
    def _prepare_severity_features(self, symptom_data):
        """
        Prepare features for severity prediction
        """
        features = []
        
        # Basic features
        features.extend([
            symptom_data.get('age', 30),
            symptom_data.get('sleep_hours', 7.5),
            symptom_data.get('stress_level', 5),
            symptom_data.get('energy_level', 5),
            symptom_data.get('hour_of_day', 12),
            symptom_data.get('day_of_week', 3),
            len(symptom_data.get('symptoms', []))
        ])
        
        # Binary features for each symptom
        symptoms = symptom_data.get('symptoms', [])
        all_symptoms = [s for category in self.symptom_mapping.values() for s in category]
        for symptom in all_symptoms:
            features.append(1 if symptom in symptoms else 0)
        
        # Binary features for moods
        mood = symptom_data.get('mood', 'Neutral')
        for mood_category in self.mood_categories:
            features.append(1 if mood == mood_category else 0)
        
        return features
    
    def save_models(self, model_path='python/models/symptom_bayesian_models.pkl'):
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
            'symptom_categories': self.symptom_categories,
            'severity_levels': self.severity_levels,
            'symptom_mapping': self.symptom_mapping,
            'mood_categories': self.mood_categories,
            'trained_at': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, model_path)
        print(f"✅ Bayesian models saved to {model_path}")
        
        # Also save as JSON for Node.js compatibility
        json_path = model_path.replace('.pkl', '.json')
        json_data = {
            'symptom_categories': self.symptom_categories,
            'severity_levels': self.severity_levels,
            'symptom_mapping': self.symptom_mapping,
            'mood_categories': self.mood_categories,
            'feature_names': self.feature_names,
            'trained_at': datetime.now().isoformat()
        }
        
        with open(json_path, 'w') as f:
            json.dump(json_data, f, indent=2)
        
        print(f"✅ Model metadata saved to {json_path}")
    
    def load_models(self, model_path='python/models/symptom_bayesian_models.pkl'):
        """
        Load trained models and scalers
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        model_data = joblib.load(model_path)
        
        self.models = model_data['models']
        self.scalers = model_data['scalers']
        self.feature_names = model_data['feature_names']
        self.symptom_categories = model_data['symptom_categories']
        self.severity_levels = model_data['severity_levels']
        self.symptom_mapping = model_data['symptom_mapping']
        self.mood_categories = model_data['mood_categories']
        
        print(f"✅ Bayesian models loaded from {model_path}")
        print(f"📊 Models trained at: {model_data.get('trained_at', 'Unknown')}")

def main():
    """
    Main function to train and test Bayesian Symptom Classification models
    """
    print("=" * 70)
    print("🎯 Bayesian Classifiers for Symptom Classification")
    print("SafeHer Project - Women's Health & Safety App")
    print("=" * 70)
    
    # Initialize Bayesian classifier
    bayesian_classifier = SymptomBayesianClassifier()
    
    # Generate synthetic training data
    df = bayesian_classifier.generate_synthetic_symptom_data(num_samples=3000)
    
    # Train symptom classification models
    X_class, y_class, y_class_labels = bayesian_classifier.prepare_symptom_classification_features(df)
    classification_results = bayesian_classifier.train_symptom_classification_models(X_class, y_class, y_class_labels)
    
    # Train severity prediction models
    X_severity, y_severity, y_severity_labels = bayesian_classifier.prepare_severity_prediction_features(df)
    severity_results = bayesian_classifier.train_severity_prediction_models(X_severity, y_severity, y_severity_labels)
    
    # Save models
    bayesian_classifier.save_models()
    
    # Test predictions
    print("\n🧪 Testing Predictions:")
    
    # Test symptom classification
    test_symptom_data = {
        'age': 28,
        'symptoms': ['fatigue', 'headache', 'mood_swings'],
        'mood': 'Tired',
        'sleep_hours': 5.5,
        'stress_level': 8,
        'energy_level': 2,
        'hour_of_day': 14,
        'day_of_week': 2
    }
    
    classification_prediction = bayesian_classifier.predict_symptom_category(test_symptom_data)
    print(f"Symptom Classification: {classification_prediction}")
    
    # Test severity prediction
    severity_prediction = bayesian_classifier.predict_severity(test_symptom_data)
    print(f"Severity Prediction: {severity_prediction}")
    
    print("\n" + "=" * 70)
    print("✅ Bayesian Symptom Classification Models Training Complete!")
    print("=" * 70)
    print(f"\n📁 Model files saved:")
    print(f"   - python/models/symptom_bayesian_models.pkl")
    print(f"   - python/models/symptom_bayesian_models.json")
    print(f"\n📊 Model Performance Summary:")
    print(f"   - Symptom Classification Best F1: {max(r['f1_score'] for r in classification_results.values()):.4f}")
    print(f"   - Severity Prediction Best F1: {max(r['f1_score'] for r in severity_results.values()):.4f}")
    print(f"\n📝 Next steps:")
    print("   1. Test the models with real symptom data")
    print("   2. Integrate with Node.js backend")
    print("   3. Create API endpoints")
    print("   4. Build symptom analysis dashboard")

if __name__ == "__main__":
    main()
