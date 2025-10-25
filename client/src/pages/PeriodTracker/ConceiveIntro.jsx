import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ConceiveIntro() {
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    navigate("/period-tracking");
  };

  const handleContinue = () => {
    navigate("/period-tracking/conceive");
  };

  const cancelExit = () => {
    setShowExitModal(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🤰</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4 font-poppins">
            Welcome to SafeHer Conceive
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your personalized fertility tracking companion for conception planning
          </p>
        </div>

        {/* Info Box */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-yellow-50 to-pink-50 border border-yellow-200 rounded-2xl p-8 shadow-sm">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Important Information
              </h2>
              <div className="space-y-4 text-left">
                <div className="bg-white rounded-xl p-4 border border-yellow-100">
                  <p className="text-gray-700 font-medium">
                    ✅ SafeHer Conceive is designed for people who want to get pregnant.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-red-100">
                  <p className="text-gray-700 font-medium">
                    ❌ This mode is not effective for preventing pregnancy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto mb-12">
          <div className="space-y-4">
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Continue with SafeHer Conceive
            </button>
            
            <button
              onClick={handleExit}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 px-8 rounded-xl font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300"
            >
              Exit SafeHer Conceive
            </button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-gray-800 text-center mb-8">
            What You'll Get with Conceive Mode
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-4xl mb-4">📅</div>
              <h4 className="font-semibold text-gray-800 mb-2">Fertility Calendar</h4>
              <p className="text-gray-600 text-sm">Track your fertile window and ovulation days</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-4xl mb-4">🌡️</div>
              <h4 className="font-semibold text-gray-800 mb-2">Health Tracking</h4>
              <p className="text-gray-600 text-sm">Monitor basal body temperature and symptoms</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-4xl mb-4">💡</div>
              <h4 className="font-semibold text-gray-800 mb-2">Expert Tips</h4>
              <p className="text-gray-600 text-sm">Get personalized fertility guidance and insights</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-12">
          <p>Developed by Meenakshi Anil | MCA Mini Project 2025</p>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <div className="text-4xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Exit SafeHer Conceive?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to leave? You can always return to this mode later.
              </p>
              <div className="space-y-3">
                <button
                  onClick={confirmExit}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
                >
                  Yes, Exit
                </button>
                <button
                  onClick={cancelExit}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}