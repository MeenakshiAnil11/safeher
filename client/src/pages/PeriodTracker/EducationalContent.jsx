import React, { useEffect, useMemo, useState } from "react";
import {
  FaBookOpen,
  FaClock,
  FaFilter,
  FaLock,
  FaPlayCircle,
  FaSearch,
  FaVolumeUp,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { educationArticles } from "../../data/educationArticles";
import "./educationalContent.css";

const videoLearning = [
  {
    id: "video-cycle-basics",
    title: "Menstrual Cycle Basics Explained",
    duration: "7 min",
    embedUrl: "https://www.youtube.com/embed/WOi2Bwvp6hw?rel=0",
  },
  {
    id: "video-period-pain",
    title: "How to Manage Period Cramps Safely",
    duration: "9 min",
    embedUrl: "https://www.youtube.com/embed/4aA4rP8WfVA?rel=0",
  },
  {
    id: "video-hormone-balance",
    title: "Hormone Health and Lifestyle Tips",
    duration: "8 min",
    embedUrl: "https://www.youtube.com/embed/0Yz2mYf4N4M?rel=0",
  },
];

const audioGuides = [
  {
    id: "audio-breathwork",
    title: "Guided Breathwork for Period Comfort",
    description: "A short calm breathing practice for pain and stress relief.",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "audio-sleep",
    title: "Cycle-Friendly Sleep Reset",
    description: "Audio guidance for better sleep during PMS and menstruation.",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "audio-mindset",
    title: "Mental Wellness Check-In",
    description: "A reflective health audio for emotional balance across phases.",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

function getPreviewParagraphs(article) {
  const firstPage = article.pages?.[0] || "";
  const paragraphs = firstPage.split("\n\n").filter(Boolean);
  return paragraphs.slice(0, 2).join("\n\n");
}

export default function EducationalContent() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const localStatus = localStorage.getItem("isSubscribed");
    if (localStatus === "true") {
      setIsSubscribed(true);
    }

    const fetchSubscription = async () => {
      try {
        const response = await api.get("/payment/subscription-status");
        const subscribed = Boolean(response?.data?.isSubscribed);
        setIsSubscribed(subscribed);
        localStorage.setItem("isSubscribed", subscribed ? "true" : "false");
      } catch (error) {
        // Keep local fallback only if API is unavailable.
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(educationArticles.map((item) => item.category));
    return ["All", ...Array.from(set)];
  }, []);

  const filteredArticles = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return educationArticles.filter((article) => {
      const inCategory = selectedCategory === "All" || article.category === selectedCategory;
      const inSearch =
        !keyword ||
        article.title.toLowerCase().includes(keyword) ||
        article.category.toLowerCase().includes(keyword) ||
        article.pages.some((p) => p.toLowerCase().includes(keyword));
      return inCategory && inSearch;
    });
  }, [search, selectedCategory]);

  const featuredArticle = filteredArticles[0] || educationArticles[0];
  const freeArticles = filteredArticles.filter((a) => a.type === "free");
  const premiumArticles = filteredArticles.filter((a) => a.type === "premium");

  const goToReader = (articleId) => {
    navigate(`/education/article/${articleId}`);
  };

  const goToSubscribe = () => {
    navigate("/payment-page");
  };

  return (
    <div className="education-hub">
      <section className="education-featured">
        <div>
          <p className="section-label">Featured Article</p>
          <h2>{featuredArticle.title}</h2>
          <p>
            {featuredArticle.pages?.[0]?.split("\n\n")[0]}
          </p>
          <div className="featured-meta">
            <span>{featuredArticle.category}</span>
            <span>{featuredArticle.readingTime}</span>
            <span>{featuredArticle.difficulty}</span>
          </div>
          <button type="button" onClick={() => goToReader(featuredArticle.id)}>
            <FaBookOpen /> Read Featured
          </button>
        </div>
      </section>

      <section className="education-search">
        <div className="search-input-wrap">
          <FaSearch />
          <input
            type="text"
            placeholder="Search health articles, categories, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <section className="education-filters">
        <div className="filter-title">
          <FaFilter />
          <span>Category filters</span>
        </div>
        <div className="filter-pills">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={selectedCategory === category ? "active" : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="education-section">
        <div className="section-head">
          <h3>Free Articles</h3>
          <span>{freeArticles.length} results</span>
        </div>
        <div className="articles-grid">
          {freeArticles.map((article) => (
            <article key={article.id} className="article-card free">
              <h4>{article.title}</h4>
              <p className="card-preview">{article.pages?.[0]?.split("\n\n")[0]}</p>
              <div className="card-meta">
                <span>{article.category}</span>
                <span><FaClock /> {article.readingTime}</span>
                <span>{article.difficulty}</span>
              </div>
              <button type="button" onClick={() => goToReader(article.id)}>
                Read Full Article
              </button>
            </article>
          ))}
          {!freeArticles.length && <p className="empty-note">No free articles match your search.</p>}
        </div>
      </section>

      <section className="education-section">
        <div className="section-head">
          <h3>Video Learning</h3>
        </div>
        <div className="video-grid">
          {videoLearning.map((video) => (
            <article key={video.id} className="video-card">
              <div className="video-frame">
                <iframe
                  src={video.embedUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h4>{video.title}</h4>
              <p>{video.duration}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="education-section">
        <div className="section-head">
          <h3>Audio Guides</h3>
        </div>
        <div className="audio-grid">
          {audioGuides.map((audio) => (
            <article key={audio.id} className="audio-card">
              <h4><FaVolumeUp /> {audio.title}</h4>
              <p>{audio.description}</p>
              <audio controls preload="metadata">
                <source src={audio.file} type="audio/mpeg" />
              </audio>
            </article>
          ))}
        </div>
      </section>

      <section className="education-section">
        <div className="section-head">
          <h3>Premium Articles</h3>
          <span>{premiumArticles.length} results</span>
        </div>
        <div className="articles-grid">
          {premiumArticles.map((article) => (
            <article key={article.id} className="article-card premium">
              <h4>{article.title}</h4>
              <p className="card-preview">{getPreviewParagraphs(article)}</p>
              {!isSubscribed && (
                <div className="premium-banner">
                  <FaLock />
                  <span>Unlock full article with subscription</span>
                  <button type="button" onClick={goToSubscribe}>Subscribe Now</button>
                </div>
              )}
              <div className="card-meta">
                <span>{article.category}</span>
                <span><FaClock /> {article.readingTime}</span>
                <span>{article.difficulty}</span>
              </div>
              <button type="button" onClick={() => goToReader(article.id)}>
                {isSubscribed ? "Read Full Premium Article" : "Read Preview"}
              </button>
            </article>
          ))}
          {!premiumArticles.length && <p className="empty-note">No premium articles match your search.</p>}
        </div>
      </section>

      {!isSubscribed && !loadingSubscription && (
        <section className="education-subscribe-strip">
          <p>Unlock full premium learning paths, advanced guides, and expert wellness content.</p>
          <button type="button" onClick={goToSubscribe}>
            <FaPlayCircle /> Subscribe Now
          </button>
        </section>
      )}
    </div>
  );
}
