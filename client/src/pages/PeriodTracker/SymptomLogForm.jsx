import React, { useState } from "react";
import api from "../../services/api";
import { appendLog } from "../../services/perimenopauseService";

export default function SymptomLogForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    mood: "calm",
    hotFlashIntensity: 5,
    sleepQuality: "3",
    cycleStatus: "regular",
    weight: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' or 'error'

  // Mood options
  const moodOptions = [
    { value: "calm", label: "Calm", emoji: "😌" },
    { value: "irritable", label: "Irritable", emoji: "😤" },
    { value: "anxious", label: "Anxious", emoji: "😰" },
    { value: "happy", label: "Happy", emoji: "😊" },
    { value: "sad", label: "Sad", emoji: "😢" },
    { value: "neutral", label: "Neutral", emoji: "😐" },
    { value: "energetic", label: "Energetic", emoji: "⚡" },
    { value: "tired", label: "Tired", emoji: "😴" }
  ];

  // Sleep quality options
  const sleepQualityOptions = [
    { value: "1", label: "1 - Very Poor" },
    { value: "2", label: "2 - Poor" },
    { value: "3", label: "3 - Fair" },
    { value: "4", label: "4 - Good" },
    { value: "5", label: "5 - Excellent" }
  ];

  // Cycle status options
  const cycleStatusOptions = [
    { value: "regular", label: "Regular" },
    { value: "irregular", label: "Irregular" },
    { value: "missed", label: "Missed" },
    { value: "heavy", label: "Heavy" }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        hotFlashIntensity: parseInt(formData.hotFlashIntensity),
        sleepQuality: parseInt(formData.sleepQuality),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        date: new Date().toISOString()
      };

      await api.post('/perimenopause/symptoms', payload);
      appendLog(payload);
      
      // Show success toast
      setToastMessage("Symptom entry saved successfully!");
      setToastType("success");
      setShowToast(true);

      // Close modal after delay
      setTimeout(() => {
        onClose();
        if (onSuccess) {
          onSuccess(payload);
        }
      }, 2000);

    } catch (error) {
      console.error('Error saving symptom data:', error);
      
      // Show error toast
      setToastMessage("Failed to save entry. Please try again.");
      setToastType("error");
      setShowToast(true);
      
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const getIntensityLabel = (value) => {
    if (value <= 3) return "Mild";
    if (value <= 6) return "Moderate";
    if (value <= 8) return "Severe";
    return "Very Severe";
  };

  const getIntensityColor = (value) => {
    if (value <= 3) return "text-green-600";
    if (value <= 6) return "text-yellow-600";
    if (value <= 8) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleCancel}
      >
        {/* Modal Content */}
        <div
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-lavender-400 to-pink-400 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="text-2xl mr-2">📝</span>
                Log Your Symptoms
              </h2>
              <button
                onClick={handleCancel}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              
              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mood <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.mood}
                  onChange={(e) => handleChange('mood', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                  required
                >
                  {moodOptions.map((mood) => (
                    <option key={mood.value} value={mood.value}>
                      {mood.emoji} {mood.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hot Flashes Intensity Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hot Flashes Intensity <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.hotFlashIntensity}
                    onChange={(e) => handleChange('hotFlashIntensity', e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-lavender-500"
                    required
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">1 - Very Mild</span>
                    <span className={`text-lg font-semibold ${getIntensityColor(formData.hotFlashIntensity)}`}>
                      {formData.hotFlashIntensity} - {getIntensityLabel(formData.hotFlashIntensity)}
                    </span>
                    <span className="text-sm text-gray-600">10 - Very Severe</span>
                  </div>
                </div>
              </div>

              {/* Sleep Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sleep Quality (1-5 scale) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sleepQuality}
                  onChange={(e) => handleChange('sleepQuality', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                  required
                >
                  {sleepQualityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cycle Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cycle Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.cycleStatus}
                  onChange={(e) => handleChange('cycleStatus', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                  required
                >
                  {cycleStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Weight (kg) <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  placeholder="Enter weight in kg"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Additional Notes <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any additional observations, symptoms, or comments..."
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lavender-500 focus:border-transparent resize-none"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex space-x-4 mt-8">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-lavender-400 to-pink-400 hover:from-lavender-500 hover:to-pink-500 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </span>
                ) : (
                  "💾 Save Entry"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`p-4 rounded-lg shadow-lg ${
              toastType === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {toastType === "success" ? "✅" : "❌"}
              </span>
              <span className="font-semibold">{toastMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add toast animation styles */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
