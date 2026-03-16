import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/UserHeader";
import WellnessTracker from "./WellnessTracker";
import PerimenopauseOverview from "./PerimenopauseOverview";
import PerimenopauseAIInsights from "./PerimenopauseAIInsights";
import SymptomLogForm from "./SymptomLogForm";
import PerimenopauseReports from "./PerimenopauseReports";
import LifestyleTips from "./LifestyleTips";
import HealthReminders from "./HealthReminders";
import PerimenopauseCommunity from "./PerimenopauseCommunity";
import PerimenopauseLogs from "./PerimenopauseLogs";
import AIHealthCoach from "../../components/AIHealthCoach";
import AIHealthInsights from "../../components/AIHealthInsights";

export default function PerimenopauseDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  
  const sidebarLinks = useMemo(() => [
    { key: "overview", label: "Overview", icon: "📊", component: PerimenopauseOverview },
    { key: "wellness", label: "Wellness Analytics", icon: "📈", component: WellnessTracker },
    { key: "logs", label: "Logs", icon: "📝", component: PerimenopauseLogs },
    { key: "reports", label: "Reports", icon: "📊", component: PerimenopauseReports },
    { key: "ai-insights", label: "AI Insights", icon: "🧠", component: PerimenopauseAIInsights },
    { key: "tips", label: "Tips", icon: "💡", component: LifestyleTips },
    { key: "reminders", label: "Reminders", icon: "🔔", component: HealthReminders },
    { key: "community", label: "Community", icon: "👥", component: PerimenopauseCommunity },
    { key: "ai-coach", label: "AI Health Coach", icon: "🤖", component: AIHealthCoach },
  ], []);

  const handleSymptomLogSuccess = () => {
    // child components read from storage/API and will reflect updates
  };

  const activeTabData = sidebarLinks.find(link => link.key === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white">
      <UserHeader />
      <div className="pt-16">
        {/* Fixed left sidebar with independent scroll */}
        <aside className="hidden lg:flex w-64 bg-white shadow-xl fixed left-0 top-16 bottom-0 z-40 flex-col">
          {/* Sidebar Navigation */}
          <div className="p-4 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Perimenopause</h2>
            <nav className="space-y-2">
              {sidebarLinks.map((link) => (
              <button
                  key={link.key}
                  onClick={() => setActiveTab(link.key)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                    activeTab === link.key
                      ? "bg-gradient-to-r from-lavender-400 to-purple-400 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-semibold">{link.label}</span>
              </button>
              ))}
            </nav>
          </div>

          <div className="px-4 pb-2">
            <AIHealthInsights compact maxItems={1} title="Today's AI Insight" />
          </div>

          {/* Back to Mode Selection */}
          <div className="p-4 mt-6 border-t pt-4">
          <button
            onClick={() => navigate("/period-tracking")}
              className="w-full bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
              <span>←</span>
              <span>Back to Mode Selection</span>
          </button>
          </div>
        </aside>

        {/* Main content with left margin equal to sidebar width on large screens */}
        <main className="min-h-[calc(100vh-64px)] ml-0 lg:ml-64 pb-20">
          <div className="p-6">
            {/* Mobile tab navigation */}
            <div className="lg:hidden mb-4 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {sidebarLinks.map((link) => (
                  <button
                    key={`mobile-${link.key}`}
                    onClick={() => setActiveTab(link.key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      activeTab === link.key
                        ? "bg-lavender-500 text-white"
                        : "bg-white border border-gray-200 text-gray-700"
                    }`}
                  >
                    {link.icon} {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Header */}
                <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                      <span className="text-3xl mr-3">{activeTabData?.label}</span>
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {activeTab === "overview" && "Track your symptoms, balance, and wellness with ease"}
                      {activeTab === "wellness" && "Mood, sleep, hot flash, weight and correlation analytics"}
                      {activeTab === "logs" && "Structured symptom history with filters and warnings"}
                      {activeTab === "reports" && "Long-term trends and comprehensive reports"}
                      {activeTab === "ai-insights" && "AI-generated daily insights from your symptom and wellness trends"}
                      {activeTab === "tips" && "Personalized lifestyle tips based on your symptom profile"}
                      {activeTab === "reminders" && "Smart reminders for logs, medication, exercise and visits"}
                      {activeTab === "community" && "Interactive support with posts, replies and trending tags"}
                      {activeTab === "ai-coach" && "Voice-enabled AI coach for symptom guidance and lifestyle suggestions"}
                    </p>
      </div>

                  {/* Breadcrumb */}
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>Perimenopause Mode</span>
                    <span>→</span>
                    <span className="text-gray-800 font-semibold">{activeTabData?.label}</span>
              </div>
            </div>

                {/* Quick Action Button */}
                {activeTab === "overview" && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowSymptomForm(true)}
                      className="bg-gradient-to-r from-lavender-400 to-pink-400 hover:from-lavender-500 hover:to-pink-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      📝 Log Symptoms
                    </button>
                </div>
                )}
              </div>

            {/* Active Component */}
            {ActiveComponent ? (
              <div>
                <ActiveComponent />
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {activeTabData?.label} - Coming Soon
                </h3>
                <p className="text-gray-600">
                  This section is under development and will be available soon.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Symptom Log Form Modal */}
      {showSymptomForm && (
        <SymptomLogForm
          onClose={() => setShowSymptomForm(false)}
          onSuccess={handleSymptomLogSuccess}
        />
      )}
    </div>
  );
}
