import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import SelfCareDashboard from "./selfcare/SelfCareDashboard";
import BreastCancerDetection from "./selfcare/BreastCancerDetection";
import PCODRiskPrediction from "./selfcare/PCODRiskPrediction";
import PregnancyHealthMonitor from "./selfcare/PregnancyHealthMonitor";
import BreastExamGuide from "./selfcare/BreastExamGuide";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "breast-cancer", label: "Breast Cancer Detection", icon: "🎗️" },
  { id: "pcod-risk", label: "PCOD Risk Prediction", icon: "🧬" },
  { id: "pregnancy-monitor", label: "Pregnancy Health Monitor", icon: "🤰" },
  { id: "breast-exam-guide", label: "Self Breast Examination Guide", icon: "✅" },
];

export default function SelfCare() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    const valid = tabs.some((t) => t.id === hash);
    if (valid) setActiveTab(hash);
    else setActiveTab("dashboard");
  }, [location.hash]);

  useEffect(() => {
    if (activeTab === "dashboard") {
      window.history.replaceState(null, "", "/selfcare");
    } else {
      window.history.replaceState(null, "", `/selfcare#${activeTab}`);
    }
  }, [activeTab]);

  const content = useMemo(() => {
    switch (activeTab) {
      case "breast-cancer":
        return <BreastCancerDetection />;
      case "pcod-risk":
        return <PCODRiskPrediction />;
      case "pregnancy-monitor":
        return <PregnancyHealthMonitor />;
      case "breast-exam-guide":
        return <BreastExamGuide />;
      default:
        return <SelfCareDashboard onNavigate={setActiveTab} />;
    }
  }, [activeTab]);

  const pageMeta = {
    dashboard: {
      title: "Self Care Center",
      subtitle: "Monitor your health and detect risks early using AI-powered tools.",
    },
    "breast-cancer": {
      title: "Breast Cancer Detection",
      subtitle: "Upload and analyze mammogram images for early risk screening.",
    },
    "pcod-risk": {
      title: "PCOD Risk Assessment",
      subtitle: "Answer the questions below to assess your PCOD risk",
    },
    "pregnancy-monitor": {
      title: "Pregnancy Risk Monitor",
      subtitle: "Track your pregnancy health metrics and identify potential risks",
    },
    "breast-exam-guide": {
      title: "Self Breast Examination",
      subtitle: "Learn how to perform regular breast self-examinations at home",
    },
  };
  const header = pageMeta[activeTab] || pageMeta.dashboard;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 page-with-header">
      <UserHeader />
      <div className="h-[calc(100vh-64px)] overflow-hidden bg-[#f5f6f8]">
        <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-64px)] w-[220px] overflow-y-auto border-r border-slate-200 bg-white p-5 lg:block">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Self Care</p>
          <nav className="space-y-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-base font-medium transition ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-pink-500 to-violet-500 font-bold text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="h-full w-full overflow-y-auto p-5 lg:ml-[220px]">
          <div className="w-full">
            <header className="mb-6">
              <h1 className="!text-[24px] !font-bold leading-[1.5] text-slate-800">{header.title}</h1>
              <p className="text-base font-normal leading-[1.5] text-slate-600">{header.subtitle}</p>
            </header>

            <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200 lg:hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-pink-500 to-violet-500 font-bold text-white"
                      : "bg-slate-50 text-slate-700"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <section className="w-full px-0">
              {activeTab === "dashboard" ? <SelfCareDashboard onNavigate={setActiveTab} /> : content}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
