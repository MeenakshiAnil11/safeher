import React from "react";
import { useNavigate } from "react-router-dom";

export default function PeriodTrackingOverview() {
  const navigate = useNavigate();

  const trackingModes = [
    {
      id: "period",
      title: "Period Tracking Mode",
      description: "Track your menstrual cycle, symptoms, and hormonal phases.",
      icon: "🩸",
      path: "/period-tracker"
    },
    {
      id: "conceive",
      title: "Conceive Mode",
      description: "Plan conception by monitoring your ovulation and fertile window.",
      icon: "👶",
      path: "/period-tracking/conceive-intro"
    },
    {
      id: "pregnancy",
      title: "Pregnancy Mode",
      description: "Track your pregnancy week by week with helpful health insights.",
      icon: "🤰",
      path: "/period-tracking/pregnancy-intro"
    },
    {
      id: "track",
      title: "Track Without Period",
      description: "Log your daily moods and health without period data.",
      icon: "🌙",
      path: "/period-tracking/track"
    },
    {
      id: "perimenopause",
      title: "Perimenopause Mode",
      description: "Monitor symptoms and cycle changes during perimenopause.",
      icon: "🧬",
      path: "/perimenopause-intro"
    }
  ];

  const handleModeSelect = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 font-poppins">
            Period & Reproductive Health Tracking
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a mode to begin monitoring your cycle, fertility, or reproductive health.
          </p>
        </div>

        {/* Mode Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {trackingModes.map((mode) => (
            <div
              key={mode.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 p-6"
            >
              {/* Icon */}
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{mode.icon}</div>
              </div>

              {/* Title and Description */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 font-poppins">
                  {mode.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {mode.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleModeSelect(mode.path)}
                className="w-full bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300"
              >
                Start Tracking
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>Developed by Meenakshi Anil | MCA Mini Project 2025</p>
        </div>
      </div>
    </div>
  );
}
