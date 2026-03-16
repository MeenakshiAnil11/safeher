"""
K-Nearest Neighbors (KNN) Implementation for Health Risk Assessment
SafeHer Project - Women's Health & Safety App

This module implements KNN algorithm to classify health risk levels based on vital signs:
- BMI, Blood Pressure, Heart Rate, Blood Sugar, Cholesterol, Iron Levels
- Risk Categories: Low, Medium, High, Critical
"""

import os
import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score
)
import joblib
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class HealthRiskKNN:
    """
    K-Nearest Neighbors classifier for health risk assessment
    """
    
    def __init__(self, k=5, weights='distance', algorithm='auto'):
        """
        Initialize KNN classifier
        
        Args:
            k (int): Number of neighbors to consider
            weights (str): Weight function ('uniform', 'distance')
            algorithm (str): Algorithm to use ('auto', 'ball_tree', 'kd_tree', 'brute')
        """
        self.k = k
        self.weights = weights
        self.algorithm = algorithm
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_names = []
        self.risk_categories = ['Low', 'Medium', 'High', 'Critical']
        
    def generate_synthetic_health_data(self, num_samples=1000):
        """
        Generate synthetic health data for training KNN model
        Based on real-world health parameters and risk factors
        """
        print("📊 Generating synthetic health data for KNN training...")
        
        np.random.seed(42)
        
        # Generate synthetic data with realistic health parameters
        data = []
        
        for i in range(num_samples):
            # Age (18-80)
            age = np.random.randint(18, 81)
            
            # BMI (15-45) - realistic range
            bmi = np.random.normal(25, 6)
            bmi = max(15, min(45, bmi))
            
            # Blood Pressure (systolic: 90-200, diastolic: 60-120)
            systolic = np.random.normal(120, 20)
            systolic = max(90, min(200, systolic))
            
            diastolic = np.random.normal(80, 15)
            diastolic = max(60, min(120, diastolic))
            
            # Heart Rate (50-120 bpm)
            heart_rate = np.random.normal(75, 15)
            heart_rate = max(50, min(120, heart_rate))
            
            # Blood Sugar (70-300 mg/dL)
            blood_sugar = np.random.normal(100, 30)
            blood_sugar = max(70, min(300, blood_sugar))
            
            # Cholesterol (150-300 mg/dL)
            cholesterol = np.random.normal(200, 40)
            cholesterol = max(150, min(300, cholesterol))
            
            # Iron Level (60-180 μg/dL)
            iron_level = np.random.normal(120, 30)
            iron_level = max(60, min(180, iron_level))
            
            # Calculate health risk based on medical guidelines
            risk_score = self._calculate_risk_score(
                age, bmi, systolic, diastolic, heart_rate, 
                blood_sugar, cholesterol, iron_level
            )
            
            # Assign risk category
            if risk_score <= 25:
                risk_category = 'Low'
            elif risk_score <= 50:
                risk_category = 'Medium'
            elif risk_score <= 75:
                risk_category = 'High'
            else:
                risk_category = 'Critical'
            
            data.append({
                'age': age,
                'bmi': round(bmi, 1),
                'systolic': int(systolic),
                'diastolic': int(diastolic),
                'heart_rate': int(heart_rate),
                'blood_sugar': round(blood_sugar, 1),
                'cholesterol': round(cholesterol, 1),
                'iron_level': round(iron_level, 1),
                'risk_score': risk_score,
                'risk_category': risk_category
            })
        
        df = pd.DataFrame(data)
        print(f"✅ Generated {len(df)} synthetic health records")
        print(f"📊 Risk distribution: {df['risk_category'].value_counts().to_dict()}")
        
        return df
    
    def _calculate_risk_score(self, age, bmi, systolic, diastolic, heart_rate, blood_sugar, cholesterol, iron_level):
        """
        Calculate health risk score based on medical guidelines
        """
        risk_score = 0
        
        # Age factor (0-20 points)
        if age > 65:
            risk_score += 20
        elif age > 50:
            risk_score += 15
        elif age > 35:
            risk_score += 10
        
        # BMI factor (0-15 points)
        if bmi > 35:  # Obese class II
            risk_score += 15
        elif bmi > 30:  # Obese
            risk_score += 12
        elif bmi > 25:  # Overweight
            risk_score += 8
        elif bmi < 18.5:  # Underweight
            risk_score += 5
        
        # Blood Pressure factor (0-20 points)
        if systolic > 160 or diastolic > 100:  # Stage 2 Hypertension
            risk_score += 20
        elif systolic > 140 or diastolic > 90:  # Stage 1 Hypertension
            risk_score += 15
        elif systolic > 130 or diastolic > 80:  # Elevated
            risk_score += 10
        
        # Heart Rate factor (0-10 points)
        if heart_rate > 100:  # Tachycardia
            risk_score += 10
        elif heart_rate < 60:  # Bradycardia
            risk_score += 5
        
        # Blood Sugar factor (0-15 points)
        if blood_sugar > 200:  # Diabetes range
            risk_score += 15
        elif blood_sugar > 140:  # Pre-diabetes
            risk_score += 10
        elif blood_sugar < 70:  # Hypoglycemia
            risk_score += 8
        
        # Cholesterol factor (0-10 points)
        if cholesterol > 240:  # High cholesterol
            risk_score += 10
        elif cholesterol > 200:  # Borderline high
            risk_score += 5
        
        # Iron Level factor (0-10 points)
        if iron_level < 70:  # Low iron
            risk_score += 10
        elif iron_level > 150:  # High iron
            risk_score += 5
        
        return min(100, risk_score)  # Cap at 100
    
    def prepare_features(self, df):
        """
        Prepare features for KNN training
        """
        print("🔧 Preparing features for KNN...")
        
        # Define feature columns
        feature_columns = [
            'age', 'bmi', 'systolic', 'diastolic', 
            'heart_rate', 'blood_sugar', 'cholesterol', 'iron_level'
        ]
        
        # Extract features and target
        X = df[feature_columns].copy()
        y = df['risk_category'].copy()
        
        # Handle missing values
        X = X.fillna(X.mean())
        
        # Encode target labels
        y_encoded = self.label_encoder.fit_transform(y)
        
        self.feature_names = feature_columns
        
        print(f"📊 Features: {feature_columns}")
        print(f"📊 Target classes: {self.label_encoder.classes_}")
        print(f"📊 Feature matrix shape: {X.shape}")
        
        return X, y_encoded
    
    def train_model(self, X, y, test_size=0.2, cv_folds=5):
        """
        Train KNN model with hyperparameter tuning
        """
        print("\n🚀 Training KNN Health Risk Assessment Model...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        print(f"Training samples: {len(X_train)}")
        print(f"Test samples: {len(X_test)}")
        
        # Scale features (important for KNN)
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Hyperparameter tuning for optimal k
        print("\n🔍 Tuning hyperparameters...")
        
        param_grid = {
            'n_neighbors': [3, 5, 7, 9, 11, 15],
            'weights': ['uniform', 'distance'],
            'algorithm': ['auto', 'ball_tree', 'kd_tree']
        }
        
        # Create base KNN model
        knn_base = KNeighborsClassifier()
        
        # Grid search for best parameters
        grid_search = GridSearchCV(
            knn_base, param_grid, 
            cv=cv_folds, scoring='accuracy', 
            n_jobs=-1, verbose=0
        )
        
        grid_search.fit(X_train_scaled, y_train)
        
        # Get best parameters
        best_params = grid_search.best_params_
        print(f"✅ Best parameters: {best_params}")
        
        # Train final model with best parameters
        self.model = KNeighborsClassifier(**best_params)
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        print("\n📊 Model Evaluation:")
        
        # Training accuracy
        train_pred = self.model.predict(X_train_scaled)
        train_acc = accuracy_score(y_train, train_pred)
        print(f"Training Accuracy: {train_acc:.4f}")
        
        # Test accuracy
        test_pred = self.model.predict(X_test_scaled)
        test_acc = accuracy_score(y_test, test_pred)
        print(f"Test Accuracy: {test_acc:.4f}")
        
        # Cross-validation score
        cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=cv_folds)
        print(f"Cross-validation Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        # Detailed metrics
        print("\n📋 Classification Report:")
        print(classification_report(y_test, test_pred, target_names=self.label_encoder.classes_))
        
        # Confusion Matrix
        print("\n📊 Confusion Matrix:")
        cm = confusion_matrix(y_test, test_pred)
        print(cm)
        
        # Individual metrics
        precision = precision_score(y_test, test_pred, average='weighted')
        recall = recall_score(y_test, test_pred, average='weighted')
        f1 = f1_score(y_test, test_pred, average='weighted')
        
        print(f"\n📈 Performance Metrics:")
        print(f"Precision: {precision:.4f}")
        print(f"Recall: {recall:.4f}")
        print(f"F1-Score: {f1:.4f}")
        
        return {
            'test_accuracy': test_acc,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'best_params': best_params,
            'confusion_matrix': cm.tolist()
        }
    
    def predict_health_risk(self, vital_data):
        """
        Predict health risk for new vital data
        
        Args:
            vital_data (dict): Dictionary containing vital signs
                Example: {
                    'age': 30, 'bmi': 25.5, 'systolic': 120, 'diastolic': 80,
                    'heart_rate': 75, 'blood_sugar': 95, 'cholesterol': 200, 'iron_level': 120
                }
        
        Returns:
            dict: Prediction results with risk category and confidence
        """
        if self.model is None:
            raise ValueError("Model not trained. Please train the model first.")
        
        # Convert to DataFrame
        df = pd.DataFrame([vital_data])
        
        # Ensure all required features are present
        required_features = self.feature_names
        for feature in required_features:
            if feature not in df.columns:
                df[feature] = 0  # Default value for missing features
        
        # Select features in correct order
        X = df[required_features].fillna(0)
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Make prediction
        prediction = self.model.predict(X_scaled)[0]
        prediction_proba = self.model.predict_proba(X_scaled)[0]
        
        # Get risk category name
        risk_category = self.label_encoder.inverse_transform([prediction])[0]
        
        # Calculate confidence (max probability)
        confidence = max(prediction_proba) * 100
        
        # Get probabilities for all classes
        class_probabilities = {}
        for i, class_name in enumerate(self.label_encoder.classes_):
            class_probabilities[class_name] = prediction_proba[i] * 100
        
        return {
            'risk_category': risk_category,
            'confidence': round(confidence, 2),
            'class_probabilities': class_probabilities,
            'prediction_details': {
                'model': 'K-Nearest Neighbors',
                'k_neighbors': self.model.n_neighbors,
                'weights': self.model.weights,
                'algorithm': self.model.algorithm
            }
        }
    
    def save_model(self, model_path='python/models/health_risk_knn_model.pkl'):
        """
        Save trained model and scaler
        """
        if self.model is None:
            raise ValueError("No model to save. Please train the model first.")
        
        # Create models directory
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Save model
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoder': self.label_encoder,
            'feature_names': self.feature_names,
            'risk_categories': self.risk_categories,
            'k': self.k,
            'weights': self.weights,
            'algorithm': self.algorithm,
            'trained_at': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, model_path)
        print(f"✅ KNN model saved to {model_path}")
        
        # Also save as JSON for Node.js compatibility
        json_path = model_path.replace('.pkl', '.json')
        json_data = {
            'feature_names': self.feature_names,
            'risk_categories': self.risk_categories,
            'scaler_mean': self.scaler.mean_.tolist(),
            'scaler_scale': self.scaler.scale_.tolist(),
            'label_classes': self.label_encoder.classes_.tolist(),
            'model_params': {
                'n_neighbors': self.model.n_neighbors,
                'weights': self.model.weights,
                'algorithm': self.model.algorithm
            },
            'trained_at': datetime.now().isoformat()
        }
        
        with open(json_path, 'w') as f:
            json.dump(json_data, f, indent=2)
        
        print(f"✅ Model metadata saved to {json_path}")
    
    def load_model(self, model_path='python/models/health_risk_knn_model.pkl'):
        """
        Load trained model and scaler
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        model_data = joblib.load(model_path)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.label_encoder = model_data['label_encoder']
        self.feature_names = model_data['feature_names']
        self.risk_categories = model_data['risk_categories']
        self.k = model_data['k']
        self.weights = model_data['weights']
        self.algorithm = model_data['algorithm']
        
        print(f"✅ KNN model loaded from {model_path}")
        print(f"📊 Model trained at: {model_data.get('trained_at', 'Unknown')}")

def main():
    """
    Main function to train and test KNN Health Risk Assessment model
    """
    print("=" * 70)
    print("🎯 K-Nearest Neighbors Health Risk Assessment")
    print("SafeHer Project - Women's Health & Safety App")
    print("=" * 70)
    
    # Initialize KNN model
    knn_model = HealthRiskKNN(k=5, weights='distance')
    
    # Generate synthetic training data
    df = knn_model.generate_synthetic_health_data(num_samples=2000)
    
    # Prepare features
    X, y = knn_model.prepare_features(df)
    
    # Train model
    results = knn_model.train_model(X, y)
    
    # Save model
    knn_model.save_model()
    
    # Test prediction
    print("\n🧪 Testing Prediction:")
    test_vital = {
        'age': 35,
        'bmi': 28.5,  # Overweight
        'systolic': 145,  # Stage 1 Hypertension
        'diastolic': 92,
        'heart_rate': 85,
        'blood_sugar': 110,  # Normal
        'cholesterol': 220,  # Borderline high
        'iron_level': 95   # Normal
    }
    
    prediction = knn_model.predict_health_risk(test_vital)
    print(f"Test Prediction: {prediction}")
    
    print("\n" + "=" * 70)
    print("✅ KNN Health Risk Assessment Model Training Complete!")
    print("=" * 70)
    print(f"\n📁 Model files saved:")
    print(f"   - python/models/health_risk_knn_model.pkl")
    print(f"   - python/models/health_risk_knn_model.json")
    print(f"\n📊 Model Performance:")
    print(f"   - Test Accuracy: {results['test_accuracy']:.4f}")
    print(f"   - Precision: {results['precision']:.4f}")
    print(f"   - Recall: {results['recall']:.4f}")
    print(f"   - F1-Score: {results['f1_score']:.4f}")
    print(f"\n📝 Next steps:")
    print("   1. Test the model with real vital data")
    print("   2. Integrate with Node.js backend")
    print("   3. Create API endpoints")
    print("   4. Build visualization dashboard")

if __name__ == "__main__":
    main()
