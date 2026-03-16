import React from "react";
import AIHealthInsights from "../../components/AIHealthInsights";

export default function PerimenopauseAIInsights() {
  return (
    <div className="bg-gradient-to-br from-lavender-50 to-white rounded-2xl p-5">
      <div className="max-w-4xl">
        <AIHealthInsights title="AI Insights Analysis" maxItems={6} />
      </div>
    </div>
  );
}
