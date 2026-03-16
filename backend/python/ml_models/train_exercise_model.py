# train_exercise_model.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
try:
    import seaborn as sns
    import matplotlib.pyplot as plt
    PLOTTING_AVAILABLE = True
except Exception:
    PLOTTING_AVAILABLE = False

# Step 1: Load dataset
data = pd.read_csv("period_exercise_dataset.csv")

# Step 2: Encode categorical data
label_encoders = {}
for column in data.columns:
    if data[column].dtype == 'object':
        le = LabelEncoder()
        data[column] = le.fit_transform(data[column])
        label_encoders[column] = le

# Step 3: Split features (X) and target (y)
X = data.drop('recommended_exercise', axis=1)
y = data['recommended_exercise']

# Step 4: Split data into train/test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 5: Train Decision Tree model
model = DecisionTreeClassifier(criterion="entropy", random_state=42)
model.fit(X_train, y_train)

# Step 6: Predictions
y_pred = model.predict(X_test)

# Step 7: Evaluate model
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# Step 8: Confusion Matrix Visualization (optional if plotting libs available)
if PLOTTING_AVAILABLE:
    plt.figure(figsize=(8, 6))
    sns.heatmap(confusion_matrix(y_test, y_pred), annot=True, fmt='d', cmap='Blues')
    plt.title("Confusion Matrix - Exercise Recommendation Model")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.show()

# Step 9: Save model and encoders
joblib.dump(model, "exercise_model.joblib")
joblib.dump(label_encoders, "label_encoders.joblib")

print("\n✅ Model and encoders saved successfully!")
