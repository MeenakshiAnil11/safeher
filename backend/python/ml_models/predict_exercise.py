# predict_exercise.py

import joblib
import pandas as pd

# Load model and encoders
model = joblib.load("exercise_model.joblib")
encoders = joblib.load("label_encoders.joblib")

# Example input (You'll replace this with real user data from SafeHer)
input_data = {
    "phase": "Luteal",
    "energy_level": "Low",
    "mood": "Sad",
    "cramps": "Mild",
    "sleep_hours": 6,
    "stress_level": "High"
}

# Encode input data
encoded_input = []
for col, val in input_data.items():
    le = encoders[col]
    encoded_input.append(le.transform([val])[0])

# Convert to DataFrame
df = pd.DataFrame([encoded_input], columns=input_data.keys())

# Predict
prediction = model.predict(df)[0]
predicted_exercise = encoders['recommended_exercise'].inverse_transform([prediction])[0]

print(f"🧘‍♀️ Recommended Exercise: {predicted_exercise}")
