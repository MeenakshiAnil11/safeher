import React from "react";
import "./OrganDevelopment.css";

const getOrganIcon = (name = "") => {
  const key = String(name).toLowerCase();
  if (key.includes("brain") || key.includes("neural")) return "🧠";
  if (key.includes("heart")) return "❤️";
  if (key.includes("lung")) return "🫁";
  if (key.includes("kidney")) return "🫘";
  if (key.includes("liver")) return "🟤";
  if (key.includes("eye")) return "👁️";
  if (key.includes("ear")) return "👂";
  if (key.includes("skin")) return "🧴";
  if (key.includes("bone")) return "🦴";
  return "🧬";
};

const normalizeOrgans = (organs = []) =>
  organs.map((item) => {
    if (typeof item === "string") {
      return { name: item, status: "Development progressing this week." };
    }
    return {
      name: item?.name || "Organ Development",
      status: item?.status || "Development progressing this week.",
    };
  });

export default function OrganDevelopment({ organs = [] }) {
  const normalizedOrgans = normalizeOrgans(organs);

  return (
    <article className="section-panel organ-development-panel">
      <h3>🫀 Organ Development Map</h3>
      <div className="organ-development-list">
        {normalizedOrgans.length ? (
          normalizedOrgans.map((organ) => (
            <div className="organ-development-item" key={`${organ.name}-${organ.status}`}>
              <span className="organ-icon" aria-hidden="true">
                {getOrganIcon(organ.name)}
              </span>
              <div>
                <strong>{organ.name}</strong>
                <p>{organ.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="organ-development-item">
            <span className="organ-icon" aria-hidden="true">
              🧬
            </span>
            <div>
              <strong>Organ Development</strong>
              <p>Detailed organ growth information will appear for this week.</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
