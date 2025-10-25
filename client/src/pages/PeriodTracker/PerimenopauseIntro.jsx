import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PerimenopauseIntro() {
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);

  console.log("PerimenopauseIntro component is rendering");

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    navigate("/period-tracking");
  };

  const handleContinue = () => {
    navigate("/period-tracking/perimenopause");
  };

  const cancelExit = () => {
    setShowExitModal(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🧬</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to Perimenopause Mode
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your supportive companion for navigating the perimenopause journey with confidence and understanding
          </p>
        </div>

        {/* Info Box */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8 shadow-sm">
            <div className="text-center">
              <div className="text-4xl mb-4">🌸</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                About Perimenopause Mode
              </h2>
              <div className="space-y-4 text-left">
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-gray-700 font-medium">
                    📊 Perimenopause Mode helps you monitor changes in your menstrual cycle, hormone levels, and symptoms during perimenopause.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-pink-100">
                  <p className="text-gray-700 font-medium">
                    💝 Track irregular cycles, mood changes, and wellness patterns to better understand your body's transition.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-yellow-100">
                  <p className="text-gray-700 font-medium">
                    🌟 Get personalized insights and guidance to support your health and well-being during this natural life phase.
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
              className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Continue to Dashboard
            </button>
            
            <button
              onClick={handleExit}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-4 px-8 rounded-xl font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300"
            >
              Exit Mode
            </button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-gray-800 text-center mb-8">
            What You'll Get with Perimenopause Mode
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-4xl mb-4">📈</div>
              <h4 className="font-semibold text-gray-800 mb-2">Symptom Tracking</h4>
              <p className="text-gray-600 text-sm">Monitor hot flashes, mood changes, sleep patterns, and other perimenopause symptoms</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-4xl mb-4">🔄</div>
              <h4 className="font-semibold text-gray-800 mb-2">Cycle Monitoring</h4>
              <p className="text-gray-600 text-sm">Track irregular cycles and hormonal changes during your transition</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
              <div className="text-4xl mb-4">💡</div>
              <h4 className="font-semibold text-gray-800 mb-2">Wellness Guidance</h4>
              <p className="text-gray-600 text-sm">Get personalized tips for diet, exercise, and lifestyle adjustments</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="max-w-3xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
            <div className="text-center">
              <div className="text-3xl mb-3">💚</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Remember: You're Not Alone
              </h4>
              <p className="text-gray-600 text-sm">
                Perimenopause is a natural transition that every woman experiences differently. 
                This mode is designed to help you understand your unique patterns and support your well-being 
                throughout this important life phase.
              </p>
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
                Exit Perimenopause Mode?
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
