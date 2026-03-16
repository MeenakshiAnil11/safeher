import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { partnerResourcesContent } from "../../data/partnerResourcesContent";
import "./PartnerResourcePage.css";

const inRange = (week, range = [1, 40]) => week >= range[0] && week <= range[1];
const getThumbFromEmbed = (url = "") => {
  const match = String(url).match(/embed\/([^?&]+)/);
  return match?.[1] ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
};

export default function PartnerResourcePage({ categorySlug = "birth-plan" }) {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(20);
  const [playingVideos, setPlayingVideos] = useState({});

  useEffect(() => {
    const loadWeek = async () => {
      try {
        const response = await api.get("/pregnancy/current-week");
        setCurrentWeek(Number(response.data?.currentWeek) || 20);
      } catch (error) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setCurrentWeek(Number(user?.pregnancy_week) || 20);
      }
    };
    loadWeek();
  }, []);

  const content = partnerResourcesContent[categorySlug] || partnerResourcesContent["birth-plan"];

  const weekArticles = useMemo(() => {
    const list = content.articles.filter((item) => inRange(currentWeek, item.weekRange));
    return list.length ? list : content.articles;
  }, [content, currentWeek]);

  const weekVideos = useMemo(() => {
    const list = content.videos.filter((item) => inRange(currentWeek, item.weekRange));
    return list.length ? list : content.videos;
  }, [content, currentWeek]);

  const topArticle = weekArticles[0];
  const topVideo = weekVideos[0];
  const freeArticles = weekArticles.filter((item) => !item.premium);
  const premiumArticles = weekArticles.filter((item) => item.premium);

  return (
    <section className="partner-resource-page">
      <button type="button" className="partner-resource-back" onClick={() => navigate("/partner-dashboard")}>
        ← Back to Partner Dashboard
      </button>

      <article className="partner-resource-hero tone-lavender">
        <h1>{content.title}</h1>
        <p>Recommended resources for current pregnancy week.</p>
        <span>Week {currentWeek}</span>
      </article>

      <section className="partner-resource-card tone-offwhite reco-card">
        <h3>Recommended for Week {currentWeek}</h3>
        <div className="partner-resource-ai-grid">
          {topArticle ? (
            <article>
              <strong>📄 Article</strong>
              <p>{topArticle.title}</p>
            </article>
          ) : null}
          {topVideo ? (
            <article>
              <strong>🎥 Video</strong>
              <p>{topVideo.title}</p>
            </article>
          ) : null}
        </div>
      </section>

      <section className="partner-resource-card tone-teal">
        <h3>Articles</h3>
        <div className="partner-resource-article-grid">
          {freeArticles.map((item) => (
            <article key={item.id} className="partner-resource-article free">
              <h4>{item.title}</h4>
              <p>Week {item.weekRange[0]}-{item.weekRange[1]}</p>
              <button
                type="button"
                onClick={() => navigate(`/partner-resources/article/${item.id}`)}
              >
                Read Article
              </button>
            </article>
          ))}
          {premiumArticles.map((item) => (
            <article key={item.id} className="partner-resource-article premium">
              <h4>🔒 {item.title}</h4>
              <p>Week {item.weekRange[0]}-{item.weekRange[1]}</p>
              <small>{item.content.slice(0, 120)}...</small>
              <button
                type="button"
                onClick={() => navigate(`/partner-resources/article/${item.id}`)}
              >
                Unlock Premium
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="partner-resource-card tone-lavender">
        <h3>Videos</h3>
        <div className="partner-resource-video-grid">
          {weekVideos.map((item) => (
            <article key={item.id} className="partner-resource-video">
              <div className="partner-resource-video-frame">
                {playingVideos[item.id] ? (
                  <iframe
                    src={item.embedUrl}
                    width="100%"
                    height="220"
                    title={item.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    className="partner-video-thumb-btn"
                    style={{ backgroundImage: `url(${getThumbFromEmbed(item.embedUrl)})` }}
                    onClick={() => setPlayingVideos((prev) => ({ ...prev, [item.id]: true }))}
                  >
                    <span className="partner-video-play">▶</span>
                  </button>
                )}
              </div>
              <span className="partner-video-tag">{content.title}</span>
              <h4>{item.title}</h4>
              <p>Week {item.weekRange[0]}-{item.weekRange[1]}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
