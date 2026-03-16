"""
Train Decision Tree model for exercise recommendation
Includes hyperparameter tuning and model evaluation
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.tree import DecisionTreeClassifier, export_text, plot_tree
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os


class ExerciseRecommendationModel:
    def __init__(self):
        self.model = None
        self.encoders = {}
        self.feature_names = []
        self.class_names = []
        
    def load_data(self, csv_path='exercise_dataset.csv'):
        """Load and preprocess the dataset."""
        print("📊 Loading dataset...")
        self.df = pd.read_csv(csv_path)
        print(f"✅ Loaded {len(self.df)} samples")
        return self.df
    
    def preprocess_data(self):
        """Preprocess the data for training."""
        print("🔄 Preprocessing data...")
        
        # Create a copy for preprocessing
        df_processed = self.df.copy()
        
        # Encode categorical variables
        categorical_features = ['phase', 'mood', 'fitness_level', 'previous_exercise_type']
        
        for feature in categorical_features:
            le = LabelEncoder()
            df_processed[f'{feature}_encoded'] = le.fit_transform(df_processed[feature])
            self.encoders[feature] = le
        
        # Encode target variable
        le_exercise = LabelEncoder()
        df_processed['exercise_encoded'] = le_exercise.fit_transform(df_processed['exercise_type'])
        self.encoders['exercise_type'] = le_exercise
        
        # Define features for training
        self.feature_names = [
            'phase_encoded', 'day_in_cycle', 'energy_level', 
            'sleep_hours', 'mood_encoded', 'cramps', 'fitness_level_encoded'
        ]
        
        self.class_names = le_exercise.classes_
        
        # Prepare features and target
        self.X = df_processed[self.feature_names]
        self.y = df_processed['exercise_encoded']
        
        print(f"✅ Features: {self.feature_names}")
        print(f"✅ Classes: {self.class_names}")
        
        return self.X, self.y
    
    def train_model(self, test_size=0.2, random_state=42):
        """Train the Decision Tree model with hyperparameter tuning."""
        print("🚀 Training Decision Tree model...")
        
        # Split the data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            self.X, self.y, test_size=test_size, random_state=random_state, stratify=self.y
        )
        
        print(f"📊 Training set: {len(self.X_train)} samples")
        print(f"📊 Test set: {len(self.X_test)} samples")
        
        # Define hyperparameters for grid search
        param_grid = {
            'max_depth': [3, 5, 7, 10],
            'min_samples_leaf': [1, 3, 5, 10],
            'min_samples_split': [2, 5, 10],
            'criterion': ['gini', 'entropy']
        }
        
        # Create base model
        base_model = DecisionTreeClassifier(random_state=random_state)
        
        # Grid search with cross-validation
        print("🔍 Performing hyperparameter tuning...")
        grid_search = GridSearchCV(
            base_model, 
            param_grid, 
            cv=5, 
            scoring='accuracy',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(self.X_train, self.y_train)
        
        # Get best model
        self.model = grid_search.best_estimator_
        
        print(f"✅ Best parameters: {grid_search.best_params_}")
        print(f"✅ Best cross-validation score: {grid_search.best_score_:.4f}")
        
        return self.model
    
    def evaluate_model(self):
        """Evaluate the trained model."""
        print("📈 Evaluating model...")
        
        # Make predictions
        y_pred = self.model.predict(self.X_test)
        
        # Calculate accuracy
        accuracy = accuracy_score(self.y_test, y_pred)
        print(f"✅ Test Accuracy: {accuracy:.4f}")
        
        # Classification report
        print("\n📊 Classification Report:")
        print(classification_report(
            self.y_test, y_pred, 
            target_names=self.class_names,
            digits=4
        ))
        
        # Confusion matrix
        cm = confusion_matrix(self.y_test, y_pred)
        
        # Plot confusion matrix
        plt.figure(figsize=(10, 8))
        sns.heatmap(
            cm, 
            annot=True, 
            fmt='d', 
            cmap='Blues',
            xticklabels=self.class_names,
            yticklabels=self.class_names
        )
        plt.title('Confusion Matrix - Exercise Recommendation')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.tight_layout()
        plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\n🎯 Feature Importance:")
        print(feature_importance)
        
        # Plot feature importance
        plt.figure(figsize=(10, 6))
        sns.barplot(data=feature_importance, x='importance', y='feature')
        plt.title('Feature Importance - Exercise Recommendation')
        plt.xlabel('Importance')
        plt.tight_layout()
        plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        return accuracy, cm
    
    def visualize_tree(self, max_depth=3):
        """Visualize the decision tree (limited depth for readability)."""
        print("🌳 Visualizing decision tree...")
        
        # Create a shallow tree for visualization
        viz_model = DecisionTreeClassifier(
            max_depth=max_depth,
            random_state=42,
            **{k: v for k, v in self.model.get_params().items() 
               if k not in ['max_depth', 'random_state']}
        )
        viz_model.fit(self.X_train, self.y_train)
        
        # Plot tree
        plt.figure(figsize=(20, 10))
        plot_tree(
            viz_model,
            feature_names=self.feature_names,
            class_names=self.class_names,
            filled=True,
            rounded=True,
            fontsize=10
        )
        plt.title(f'Decision Tree (Max Depth: {max_depth})')
        plt.tight_layout()
        plt.savefig('decision_tree.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        # Export tree rules as text
        tree_rules = export_text(
            viz_model,
            feature_names=self.feature_names,
            class_names=self.class_names
        )
        
        print("\n📋 Decision Tree Rules:")
        print(tree_rules)
        
        # Save rules to file
        with open('tree_rules.txt', 'w') as f:
            f.write(tree_rules)
        
        return tree_rules
    
    def save_model(self, model_path='exercise_model.joblib'):
        """Save the trained model and encoders."""
        print("💾 Saving model...")
        
        model_data = {
            'model': self.model,
            'encoders': self.encoders,
            'feature_names': self.feature_names,
            'class_names': self.class_names
        }
        
        joblib.dump(model_data, model_path)
        print(f"✅ Model saved to {model_path}")
        
        return model_path
    
    def load_model(self, model_path='exercise_model.joblib'):
        """Load a trained model."""
        print(f"📂 Loading model from {model_path}...")
        
        model_data = joblib.load(model_path)
        self.model = model_data['model']
        self.encoders = model_data['encoders']
        self.feature_names = model_data['feature_names']
        self.class_names = model_data['class_names']
        
        print("✅ Model loaded successfully")
        return self.model
    
    def predict(self, features):
        """Make a prediction for given features."""
        if self.model is None:
            raise ValueError("Model not trained or loaded")
        
        # Convert features to the right format
        if isinstance(features, dict):
            # Convert dict to array
            feature_array = []
            for feature_name in self.feature_names:
                if feature_name.endswith('_encoded'):
                    # Handle encoded features
                    original_name = feature_name.replace('_encoded', '')
                    if original_name in features:
                        encoded_value = self.encoders[original_name].transform([features[original_name]])[0]
                        feature_array.append(encoded_value)
                    else:
                        feature_array.append(0)  # Default value
                else:
                    feature_array.append(features.get(feature_name, 0))
            
            features = np.array(feature_array).reshape(1, -1)
        
        # Make prediction
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        
        # Convert back to class name
        predicted_class = self.encoders['exercise_type'].inverse_transform([prediction])[0]
        
        # Get probabilities for all classes
        class_probabilities = {}
        for i, class_name in enumerate(self.class_names):
            class_probabilities[class_name] = probabilities[i]
        
        return {
            'predicted_exercise': predicted_class,
            'confidence': max(probabilities),
            'probabilities': class_probabilities
        }


def main():
    """Main training pipeline."""
    print("🚀 Starting Exercise Recommendation Model Training")
    print("=" * 50)
    
    # Initialize model
    model = ExerciseRecommendationModel()
    
    # Load and preprocess data
    model.load_data()
    model.preprocess_data()
    
    # Train model
    model.train_model()
    
    # Evaluate model
    accuracy, cm = model.evaluate_model()
    
    # Visualize tree
    model.visualize_tree(max_depth=3)
    
    # Save model
    model.save_model()
    
    print("\n🎉 Training completed successfully!")
    print(f"📊 Final Test Accuracy: {accuracy:.4f}")
    
    # Test prediction
    print("\n🧪 Testing prediction...")
    test_features = {
        'phase': 'menstruation',
        'day_in_cycle': 3,
        'energy_level': 4,
        'sleep_hours': 7.5,
        'mood': 'tired',
        'cramps': 6,
        'fitness_level': 'beginner'
    }
    
    prediction = model.predict(test_features)
    print(f"✅ Test prediction: {prediction}")


if __name__ == "__main__":
    main()
