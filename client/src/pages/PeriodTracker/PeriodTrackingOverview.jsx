import React from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import "./PeriodTrackingOverview.css";

export default function PeriodTrackingOverview() {
  const navigate = useNavigate();

  const trackingModes = [
    {
      id: "period",
      title: "Period Tracking Mode",
      description: "Track your menstrual cycle, symptoms, and hormonal phases with detailed insights.",
      icon: "🩸",
      path: "/period-tracker",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      id: "conceive",
      title: "Conceive Mode",
      description: "Plan conception by monitoring your ovulation and fertile window with precision tracking.",
      icon: "👶",
      path: "/period-tracking/conceive",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "pregnancy",
      title: "Pregnancy Mode",
      description: "Track your pregnancy week by week with helpful health insights and baby development.",
      icon: "🤰",
      path: "/period-tracking/pregnancy",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: "perimenopause",
      title: "Perimenopause Mode",
      description: "Monitor symptoms and cycle changes during perimenopause with personalized support.",
      icon: "🧬",
      path: "/period-tracking/perimenopause",
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  const handleModeSelect = (path) => {
    navigate(path);
  };

  return (
    <div className="period-tracking-overview">
      <UserHeader />
      <div className="period-tracking-container">
        {/* Header */}
        <div className="period-tracking-header">
          <h1>Period & Reproductive Health Tracking</h1>
          <p>
            Select a mode to begin monitoring your cycle, fertility, or reproductive health journey.
          </p>
        </div>

        {/* Mode Selection Grid */}
        <div className="period-modes-grid">
          {trackingModes.map((mode) => (
            <div
              key={mode.id}
              className="period-mode-card"
            >
              {/* Icon */}
              <div className="period-mode-icon">
                <div>{mode.icon}</div>
              </div>

              {/* Title and Description */}
              <div className="period-mode-content">
                <h3>{mode.title}</h3>
                <p>{mode.description}</p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleModeSelect(mode.path)}
                className="period-mode-button"
              >
                Start Tracking →
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
