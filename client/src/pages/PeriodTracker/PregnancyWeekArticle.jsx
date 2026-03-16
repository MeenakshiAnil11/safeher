import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import pregnancyWeeks from "../../data/pregnancyWeeks";
import getPregnancyWeekContent from "../../data/pregnancyWeekContent";
import "./PregnancyWeekArticle.css";

const getTrimester = (week) => {
  if (week <= 12) return "First Trimester";
  if (week <= 27) return "Second Trimester";
  return "Third Trimester";
};

const FALLBACK_VIDEO_URL = "https://www.youtube.com/embed/WOi2Bwvp6hw?rel=0";

const WEEK_VIDEO_URLS = Object.fromEntries(
  Array.from({ length: 40 }, (_, index) => {
    const week = index + 1;
    const searchQuery = encodeURIComponent(`pregnancy week ${week} fetal development animation`);
    // Search-based embeds are more resilient than fixed IDs for all weeks.
    return [week, `https://www.youtube.com/embed?listType=search&list=${searchQuery}`];
  })
);

const getYouTubeEmbedForWeek = (week) => WEEK_VIDEO_URLS[week] || FALLBACK_VIDEO_URL;

const resolveFruitImageKey = (fruitName = "") => {
  const value = String(fruitName).toLowerCase();
  if (value.includes("poppy") || value.includes("vanilla")) return "poppy-seed";
  if (value.includes("blueberry")) return "blueberry";
  if (value.includes("lime")) return "lime";
  if (value.includes("avocado")) return "avocado";
  if (value.includes("banana")) return "banana";
  if (value.includes("papaya")) return "papaya";
  if (value.includes("corn")) return "corn";
  if (value.includes("eggplant")) return "eggplant";
  if (value.includes("watermelon")) return "watermelon";
  return "squash";
};

export default function PregnancyWeekArticle() {
  const navigate = useNavigate();
  const { week } = useParams();
  const safeWeek = Math.min(40, Math.max(1, Number(week) || 1));
  const [useFallbackImage, setUseFallbackImage] = useState(false);
  const weekData = pregnancyWeeks[safeWeek] || pregnancyWeeks[20];
  const weekContent = getPregnancyWeekContent(safeWeek);
  const overview = weekContent?.babyGrowth || { bodyChanges: [], expectations: [], healthTips: [] };
  const fruitImageKey = resolveFruitImageKey(weekData?.fruit);
  const dedicatedWeekImage = `/pregnancy-week-media/week${safeWeek}.jpg`;
  const fallbackWeekImage = `/baby-growth/${fruitImageKey}.svg`;
  const heroImage = useFallbackImage ? fallbackWeekImage : dedicatedWeekImage;
  const diagramImage = useFallbackImage ? fallbackWeekImage : dedicatedWeekImage;
  const youtubeEmbed = getYouTubeEmbedForWeek(safeWeek);
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=pregnancy+week+${safeWeek}+development+animation`;
  const previousWeek = Math.max(1, safeWeek - 1);
  const nextWeek = Math.min(40, safeWeek + 1);

  useEffect(() => {
    setUseFallbackImage(false);
  }, [safeWeek]);

  const commonSymptoms = useMemo(() => {
    const fromBodyChanges = (overview.bodyChanges || []).map((item) => item.title);
    if (fromBodyChanges.length) return fromBodyChanges.slice(0, 4);
    return [
      "Changes in energy level",
      "Mild sleep disturbance",
      "Appetite fluctuations",
      "Occasional body discomfort",
    ];
  }, [overview.bodyChanges]);

  return (
    <section className="preg-week-article">
      <button
        type="button"
        className="preg-week-back-btn"
        onClick={() => navigate("/period-tracking/pregnancy")}
      >
        ← Back to Pregnancy Dashboard
      </button>

      <article className="preg-week-article-card">
        <p className="preg-week-kicker">Pregnancy Week Guide</p>
        <h1>Week {safeWeek} Pregnancy Development</h1>

        <header className="preg-week-hero">
          <div className="preg-week-hero-text">
            <p className="preg-week-meta">
              {getTrimester(safeWeek)} · Week {safeWeek}
            </p>
            <p>
              This week your baby is about the size of a <strong>{weekData.fruit}</strong>. Use this guide to
              understand development milestones, body changes, and practical care advice.
            </p>
            <div className="preg-week-stat-grid">
              <div>
                <span>Size</span>
                <strong>{weekData.fruit}</strong>
              </div>
              <div>
                <span>Length</span>
                <strong>{weekData.length}</strong>
              </div>
              <div>
                <span>Weight</span>
                <strong>{weekData.weight}</strong>
              </div>
            </div>
          </div>
          <figure className="preg-week-hero-image">
            <img
              src={heroImage}
              alt={`Week ${safeWeek} baby development visual`}
              onError={() => setUseFallbackImage(true)}
            />
            <figcaption>Week {safeWeek} development illustration</figcaption>
          </figure>
        </header>

        <div className="preg-week-sections">
          <section>
            <h3>Introduction</h3>
            <p>
              Week {safeWeek} is an important phase where your pregnancy progress becomes more noticeable. Regular
              monitoring helps you stay confident and prepared as your baby continues to grow.
            </p>
          </section>

          <figure className="preg-week-diagram">
            <img
              src={diagramImage}
              alt={`Week ${safeWeek} fetal growth diagram`}
              onError={() => setUseFallbackImage(true)}
            />
            <figcaption>Fetal growth diagram for week {safeWeek}</figcaption>
          </figure>

          <section>
            <h3>Baby Development This Week</h3>
            <p>{weekData.development}</p>
            <ul>
              {(weekData.milestones || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>What&apos;s Happening in Your Body</h3>
            <p>{weekData.motherChanges}</p>
            <ul>
              {(overview.bodyChanges || []).slice(0, 3).map((item) => (
                <li key={item.title}>{item.text}</li>
              ))}
            </ul>
          </section>

          <figure className="preg-week-diagram">
            <img
              src={diagramImage}
              alt={`Week ${safeWeek} fetal anatomy reference`}
              onError={() => setUseFallbackImage(true)}
            />
            <figcaption>Development reference view</figcaption>
          </figure>

          <section>
            <h3>Common Symptoms</h3>
            <ul>
              {commonSymptoms.map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Doctor&apos;s Tip</h3>
            <p>{weekData.tips?.[0] || "Follow your prenatal care schedule and keep daily hydration consistent."}</p>
            <ul>
              {(weekData.tips || []).slice(1).map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </section>

          <section className="preg-week-video">
            <h3>Watch Week {safeWeek} Development Animation</h3>
            <div className="preg-week-video-frame">
              <iframe
                src={youtubeEmbed}
                title={`Week ${safeWeek} pregnancy development video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <a className="preg-week-video-link" href={youtubeSearchUrl} target="_blank" rel="noreferrer">
              Video not loading? Open week {safeWeek} video results
            </a>
          </section>
        </div>

        <div className="preg-week-nav">
          <button type="button" onClick={() => navigate(`/pregnancy/week/${previousWeek}`)} disabled={safeWeek <= 1}>
            ← Previous Week
          </button>
          <button type="button" onClick={() => navigate(`/pregnancy/week/${nextWeek}`)} disabled={safeWeek >= 40}>
            Next Week →
          </button>
        </div>
      </article>
    </section>
  );
}
