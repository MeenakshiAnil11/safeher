import os
from io import BytesIO
from datetime import datetime

import numpy as np
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image


app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "breast_cancer_model.h5",
)
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "reports")


def load_prediction_model():
    """Load and return the trained breast cancer model."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
    return load_model(MODEL_PATH)


def preprocess_uploaded_image(file_storage):
    """
    Preprocess uploaded image for prediction:
    - resize to 224x224
    - normalize pixel values to [0, 1]
    - expand dimensions
    """
    file_bytes = file_storage.read()
    if not file_bytes:
        raise ValueError("Uploaded file is empty.")

    img = image.load_img(BytesIO(file_bytes), target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def generate_breast_cancer_report(prediction, confidence):
    """Generate and return the path of a PDF prediction report."""
    os.makedirs(REPORTS_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"breast_cancer_report_{timestamp}.pdf"
    report_path = os.path.join(REPORTS_DIR, filename)

    report_canvas = canvas.Canvas(report_path, pagesize=A4)
    width, height = A4

    report_canvas.setFont("Helvetica-Bold", 18)
    report_canvas.drawString(50, height - 60, "SafeHer AI Breast Cancer Report")

    report_canvas.setFont("Helvetica", 11)
    report_canvas.drawString(50, height - 95, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_canvas.drawString(50, height - 120, f"Prediction Result: {prediction}")
    report_canvas.drawString(50, height - 145, f"Confidence: {confidence * 100:.2f}%")

    report_canvas.setFont("Helvetica-Bold", 12)
    report_canvas.drawString(50, height - 185, "Recommendation:")
    report_canvas.setFont("Helvetica", 11)
    report_canvas.drawString(50, height - 205, "Consult a doctor for confirmation.")

    report_canvas.showPage()
    report_canvas.save()
    return report_path


try:
    model = load_prediction_model()
except Exception as model_error:
    model = None
    model_load_error = str(model_error)
else:
    model_load_error = None


@app.route("/predict-breast-cancer", methods=["POST"])
def predict_breast_cancer():
    """Predict breast cancer class from an uploaded image."""
    if model is None:
        return (
            jsonify(
                {
                    "error": "Model is not available.",
                    "details": model_load_error,
                }
            ),
            500,
        )

    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided. Use form-data key: image"}), 400

        uploaded_file = request.files["image"]
        if uploaded_file.filename == "":
            return jsonify({"error": "No file selected."}), 400

        processed_image = preprocess_uploaded_image(uploaded_file)
        prediction_score = float(model.predict(processed_image, verbose=0)[0][0])

        prediction_label = "Malignant" if prediction_score >= 0.5 else "Benign"
        confidence = prediction_score if prediction_label == "Malignant" else (1.0 - prediction_score)

        return jsonify(
            {
                "prediction": prediction_label,
                "confidence": float(confidence),
            }
        )
    except ValueError as value_error:
        return jsonify({"error": str(value_error)}), 400
    except Exception as prediction_error:
        return (
            jsonify(
                {
                    "error": "Prediction failed.",
                    "details": str(prediction_error),
                }
            ),
            500,
        )


@app.route("/generate-report", methods=["POST"])
def generate_report():
    """Generate PDF report from prediction payload and return it as download."""
    try:
        payload = request.get_json(silent=True) or {}
        prediction = payload.get("prediction")
        confidence = payload.get("confidence")

        if prediction not in {"Benign", "Malignant"}:
            return jsonify({"error": "Invalid prediction. Use 'Benign' or 'Malignant'."}), 400
        if confidence is None:
            return jsonify({"error": "Missing confidence value."}), 400

        confidence = float(confidence)
        if confidence < 0 or confidence > 1:
            return jsonify({"error": "Confidence must be between 0 and 1."}), 400

        report_path = generate_breast_cancer_report(prediction, confidence)
        return send_file(
            report_path,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=os.path.basename(report_path),
        )
    except ValueError:
        return jsonify({"error": "Confidence must be a numeric value."}), 400
    except Exception as report_error:
        return jsonify({"error": "Failed to generate report.", "details": str(report_error)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
