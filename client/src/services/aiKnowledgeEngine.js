import { pregnancyArticles } from "../data/pregnancyArticles";
import { pregnancyVideos } from "../data/pregnancyVideos";
import { pregnancyFAQs } from "../data/pregnancyFAQs";

const inWeekRange = (week, range = [1, 40]) => week >= range[0] && week <= range[1];

const normalizeSymptoms = (input) => {
  if (!Array.isArray(input)) return [];
  return input.map((item) => String(item?.name || item || "").toLowerCase()).filter(Boolean);
};

export function generateHealthRecommendations(userData = {}) {
  const week = Number(userData?.pregnancyWeek) || 20;
  const symptoms = normalizeSymptoms(userData?.symptoms);
  const health = userData?.healthTrackerData || {};
  const systolic = Number(health?.systolic ?? health?.bloodPressure?.systolic) || 0;
  const diastolic = Number(health?.diastolic ?? health?.bloodPressure?.diastolic) || 0;
  const sleepHours = Number(health?.sleepHours) || 0;

  const recommendations = [];
  const pushIfMissing = (entry) => {
    if (!entry) return;
    if (!recommendations.some((item) => item.type === entry.type && item.title === entry.title)) {
      recommendations.push(entry);
    }
  };

  pregnancyArticles
    .filter((article) => inWeekRange(week, article.weekRange))
    .slice(0, 2)
    .forEach((article) =>
      pushIfMissing({ type: "article", title: article.title, id: article.id })
    );

  pregnancyVideos
    .filter((video) => inWeekRange(week, video.weekRange))
    .slice(0, 2)
    .forEach((video) => pushIfMissing({ type: "video", title: video.title, id: video.id }));

  pregnancyFAQs
    .filter((faq) => inWeekRange(week, faq.weekRange))
    .slice(0, 1)
    .forEach((faq) => pushIfMissing({ type: "faq", title: faq.question }));

  if (week >= 20) {
    const babyMovement = pregnancyArticles.find((item) =>
      item.title.toLowerCase().includes("baby movements")
    );
    pushIfMissing(
      babyMovement
        ? { type: "article", title: babyMovement.title, id: babyMovement.id }
        : null
    );
  }

  if (symptoms.some((sym) => sym.includes("back pain"))) {
    const backPain = pregnancyArticles.find((item) =>
      item.title.toLowerCase().includes("back pain")
    );
    pushIfMissing(backPain ? { type: "article", title: backPain.title, id: backPain.id } : null);
  }

  if (systolic >= 140 || diastolic >= 90) {
    const bp = pregnancyArticles.find((item) =>
      item.title.toLowerCase().includes("hypertension")
    );
    pushIfMissing(bp ? { type: "article", title: bp.title, id: bp.id } : null);
  }

  if (sleepHours > 0 && sleepHours < 6) {
    pushIfMissing({
      type: "faq",
      title: "How many hours should I sleep during pregnancy?",
    });
  }

  return recommendations.slice(0, 6);
}

export default generateHealthRecommendations;
