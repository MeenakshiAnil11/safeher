import React, { useMemo } from "react";
import { pregnancyWeeks } from "../../data/pregnancyWeeks";
import "./AIAppointmentRecommendation.css";

const recommendationByWeek = [
  { week: 8, text: "First prenatal visit is recommended around this stage." },
  { week: 12, text: "An ultrasound scan is commonly scheduled around week 12." },
  { week: 20, text: "Anatomy scan is important to assess baby growth and organs." },
  { week: 24, text: "Glucose screening is recommended during week 24." },
  { week: 32, text: "A growth scan can help monitor baby progress in late pregnancy." },
  { week: 36, text: "Final prenatal visit planning helps prepare for delivery." },
];

export default function AIAppointmentRecommendation({ currentWeek = 20 }) {
  const recommendation = useMemo(() => {
    const nearest = recommendationByWeek
      .slice()
      .sort((a, b) => Math.abs(a.week - currentWeek) - Math.abs(b.week - currentWeek))[0];
    return nearest;
  }, [currentWeek]);
  const weekTip = useMemo(
    () => pregnancyWeeks[currentWeek]?.tips?.[0] || "Continue regular prenatal monitoring and hydration.",
    [currentWeek]
  );

  return (
    <article className="ai-appt-reco-card">
      <h3>AI Appointment Recommendation</h3>
      <p>
        Week {currentWeek}: {recommendation?.text}
      </p>
      <small>{weekTip}</small>
    </article>
  );
}
