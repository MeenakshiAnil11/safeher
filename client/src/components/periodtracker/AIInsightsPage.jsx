import React from "react";
import { FaBrain } from "react-icons/fa";
import FertilityInsightCard from "./FertilityInsightCard";
import SymptomInsightCard from "./SymptomInsightCard";
import FertilityScoreCard from "./FertilityScoreCard";
import TemperatureInsightCard from "./TemperatureInsightCard";
import LifestyleRecommendationCard from "./LifestyleRecommendationCard";

export default function AIInsightsPage({ insightData }) {
  if (!insightData) return null;

  const fertilityBadgeClasses = {
    "Low Fertility": "bg-red-100 text-red-700 border-red-200",
    "Medium Fertility": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "High Fertility": "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <section className="space-y-5">
      <header className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaBrain className="text-purple-500" />
          AI-Powered Fertility Insights
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Personalized insights generated from your cycle data, daily health logs, and fertility score.
        </p>
      </header>

      <section className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
        <h4 className="text-lg font-bold text-gray-800 mb-2">Today's Fertility Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-700">
          <p>Cycle Day: <strong>{insightData.todayOverview?.cycleDay}</strong></p>
          <p>Current Phase: <strong>{insightData.todayOverview?.currentPhase}</strong></p>
          <p>Ovulation In: <strong>{insightData.todayOverview?.daysUntilOvulation} day(s)</strong></p>
          <p>Fertile Window: <strong>{insightData.todayOverview?.fertileWindowRange}</strong></p>
        </div>
        <p className="text-sm text-pink-700 mt-2">{insightData.todayOverview?.helper}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FertilityInsightCard
          title={insightData.fertility?.title}
          explanation={insightData.fertility?.explanation}
          meta={insightData.fertility?.meta}
        />

        <SymptomInsightCard
          title={insightData.symptom?.title}
          explanation={insightData.symptom?.explanation}
          recentSymptoms={insightData.symptom?.recentSymptoms}
          interpretation={insightData.symptom?.interpretation}
        />

        <FertilityScoreCard
          title={insightData.score?.title}
          explanation={insightData.score?.explanation}
          score={insightData.score?.score}
        />

        <TemperatureInsightCard
          title={insightData.temperature?.title}
          explanation={insightData.temperature?.explanation}
          detail={insightData.temperature?.detail}
          value={insightData.temperature?.value}
        />

        <LifestyleRecommendationCard
          title={insightData.lifestyle?.title}
          explanation={insightData.lifestyle?.explanation}
          activities={insightData.lifestyle?.activities || []}
          nutritionFoods={insightData.nutrition?.foods || []}
        />
      </div>

      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold text-gray-800 mb-3">Fertility Level Indicators</h4>
        <div className="flex flex-wrap gap-2">
          {["Low Fertility", "Medium Fertility", "High Fertility"].map((level) => (
            <span
              key={level}
              className={`px-3 py-1 rounded-full border text-xs font-semibold ${fertilityBadgeClasses[level]} ${
                insightData.fertilityLevel === level ? "ring-2 ring-offset-1 ring-pink-300" : ""
              }`}
            >
              {level}
            </span>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <article className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
          <h4 className="text-base font-semibold text-gray-800">{insightData.conceptionReadiness?.title}</h4>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{insightData.conceptionReadiness?.message}</p>
        </article>

        <article className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100">
          <h4 className="text-base font-semibold text-gray-800">{insightData.predictionConfidence?.title}</h4>
          <p className="text-sm text-gray-700 mt-1">
            Confidence Level: <strong>{insightData.predictionConfidence?.level}</strong>
          </p>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{insightData.predictionConfidence?.message}</p>
        </article>

        <article className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
          <h4 className="text-base font-semibold text-gray-800">{insightData.upcomingEvent?.title}</h4>
          <p className="text-sm text-gray-700 mt-2">
            Next Fertile Window: <strong>{insightData.upcomingEvent?.fertileWindow}</strong>
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Ovulation Day: <strong>{insightData.upcomingEvent?.ovulationDay}</strong>
          </p>
        </article>

        <article className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <h4 className="text-base font-semibold text-gray-800">{insightData.nutrition?.title}</h4>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{insightData.nutrition?.explanation}</p>
          <ul className="text-sm text-gray-700 mt-2 space-y-1">
            {(insightData.nutrition?.foods || []).map((food) => (
              <li key={food}>• {food}</li>
            ))}
          </ul>
        </article>

        <article className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <h4 className="text-base font-semibold text-gray-800">{insightData.trackingConsistency?.title}</h4>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{insightData.trackingConsistency?.message}</p>
        </article>

        <article className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
          <h4 className="text-base font-semibold text-gray-800">{insightData.didYouKnow?.title}</h4>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{insightData.didYouKnow?.message}</p>
        </article>
      </div>
    </section>
  );
}
