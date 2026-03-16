import React from "react";
import { FaLeaf } from "react-icons/fa";

export default function LifestyleRecommendationCard({ title, explanation, activities = [], nutritionFoods = [] }) {
  return (
    <article className="bg-emerald-50 rounded-2xl p-5 shadow-sm border border-emerald-100">
      <div className="flex items-start gap-3">
        <span className="text-emerald-500 mt-1">
          <FaLeaf />
        </span>
        <div className="w-full">
          <h4 className="text-base font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-700 mt-1 leading-relaxed">{explanation}</p>
          {activities.length ? (
            <div className="mt-2">
              <p className="text-xs font-semibold text-emerald-800">Recommended activities:</p>
              <ul className="text-xs text-emerald-700 mt-1 space-y-1">
                {activities.map((activity) => (
                  <li key={activity}>• {activity}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {nutritionFoods.length ? (
            <div className="mt-3 pt-3 border-t border-emerald-200">
              <p className="text-xs font-semibold text-emerald-800 mb-1">Nutrition Focus</p>
              <p className="text-xs text-emerald-700">{nutritionFoods.join(" • ")}</p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
