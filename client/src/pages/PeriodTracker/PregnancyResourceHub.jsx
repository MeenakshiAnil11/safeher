import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import SubscriptionModal from "../../components/SubscriptionModal";
import { pregnancyArticles } from "../../data/pregnancyArticles";
import { pregnancyVideos } from "../../data/pregnancyVideos";
import { pregnancyFAQs } from "../../data/pregnancyFAQs";
import { generateHealthRecommendations } from "../../services/aiKnowledgeEngine";
import "./PregnancyResourceHub.css";

const GUIDES = [
  { icon: "📚", title: "Complete Pregnancy Guide", subtitle: "Week-by-week comprehensive guide", pages: "120 pages" },
  { icon: "🤰", title: "Labor & Delivery Handbook", subtitle: "Everything you need to know about birth", pages: "85 pages" },
  { icon: "👶", title: "New Parent Preparation", subtitle: "Getting ready for baby's arrival", pages: "95 pages" },
  { icon: "🍼", title: "Breastfeeding Success Guide", subtitle: "Tips and techniques for nursing", pages: "60 pages" },
];

const BOOKMARK_KEY = "savedArticles";
const ARTICLE_PROGRESS_KEY = "pregnancy_read_articles";
const VIDEO_PROGRESS_KEY = "pregnancy_watched_videos";

const summarizeArticle = (text = "") =>
  String(text)
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(". ") + ".";

const getWeekFromStorage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return Number(user?.pregnancy_week) || 20;
};

export default function PregnancyResourceHub({ currentWeek: currentWeekProp = 20 }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("articles");
  const [articleView, setArticleView] = useState("free");
  const [openFaq, setOpenFaq] = useState(null);
  const [openSubscription, setOpenSubscription] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    article: null,
  });
  const [summaryPanel, setSummaryPanel] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [readArticles, setReadArticles] = useState([]);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [healthData, setHealthData] = useState({});

  const currentWeek = Number(currentWeekProp) || getWeekFromStorage();
  const isSubscribed = localStorage.getItem("isSubscribed") === "true";
  const recommendationIcon = (type = "") => {
    const normalized = String(type).toLowerCase();
    if (normalized.includes("article")) return "📘";
    if (normalized.includes("video")) return "🎬";
    if (normalized.includes("faq")) return "❔";
    return "✨";
  };

  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]");
    const savedRead = JSON.parse(localStorage.getItem(ARTICLE_PROGRESS_KEY) || "[]");
    const savedVideos = JSON.parse(localStorage.getItem(VIDEO_PROGRESS_KEY) || "[]");
    setBookmarks(Array.isArray(savedBookmarks) ? savedBookmarks : []);
    setReadArticles(Array.isArray(savedRead) ? savedRead : []);
    setWatchedVideos(Array.isArray(savedVideos) ? savedVideos : []);
  }, []);

  useEffect(() => {
    const loadHealthData = async () => {
      try {
        const response = await api.get("/pregnancy/logs?limit=1");
        const latest = Array.isArray(response.data?.logs) ? response.data.logs[0] : {};
        setHealthData(latest || {});
      } catch (error) {
        setHealthData({});
      }
    };
    loadHealthData();
  }, []);

  useEffect(() => {
    if (!contextMenu.visible) return undefined;
    const closeMenu = () => setContextMenu((prev) => ({ ...prev, visible: false }));
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, { passive: true });
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu);
    };
  }, [contextMenu.visible]);

  const filteredWeekArticles = useMemo(
    () =>
      pregnancyArticles.filter(
        (article) =>
          currentWeek >= article.weekRange[0] && currentWeek <= article.weekRange[1]
      ),
    [currentWeek]
  );

  const filteredArticles = useMemo(() => {
    const base = filteredWeekArticles.length ? filteredWeekArticles : pregnancyArticles;
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q)
    );
  }, [query, filteredWeekArticles]);

  const filteredVideos = useMemo(() => {
    const weekVideos = pregnancyVideos.filter(
      (video) => currentWeek >= video.weekRange[0] && currentWeek <= video.weekRange[1]
    );
    const base = weekVideos.length ? weekVideos : pregnancyVideos;
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [query, currentWeek]);

  const filteredFaqs = useMemo(() => {
    const weekFaqs = pregnancyFAQs.filter(
      (faq) => currentWeek >= faq.weekRange[0] && currentWeek <= faq.weekRange[1]
    );
    const base = weekFaqs.length ? weekFaqs : pregnancyFAQs;
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [query, currentWeek]);

  const aiRecommendations = useMemo(
    () =>
      generateHealthRecommendations({
        pregnancyWeek: currentWeek,
        symptoms: Array.isArray(healthData?.symptoms) ? healthData.symptoms : [],
        healthTrackerData: healthData,
      }),
    [currentWeek, healthData]
  );

  const freeArticles = useMemo(
    () => filteredArticles.filter((item) => !item.premium),
    [filteredArticles]
  );

  const premiumArticles = useMemo(
    () => filteredArticles.filter((item) => item.premium),
    [filteredArticles]
  );

  const toggleBookmark = (articleId) => {
    const next = bookmarks.includes(articleId)
      ? bookmarks.filter((id) => id !== articleId)
      : [...bookmarks, articleId];
    setBookmarks(next);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
  };

  const markArticleCompleted = (articleId) => {
    if (readArticles.includes(articleId)) return;
    const next = [...readArticles, articleId];
    setReadArticles(next);
    localStorage.setItem(ARTICLE_PROGRESS_KEY, JSON.stringify(next));
  };

  const markVideoWatched = (videoId) => {
    if (watchedVideos.includes(videoId)) return;
    const next = [...watchedVideos, videoId];
    setWatchedVideos(next);
    localStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(next));
  };

  const openArticle = (article) => {
    markArticleCompleted(article.id);
    navigate(`/articles/preg-${article.id}`);
  };

  const readArticle = (article) => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(article.content);
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  const shareArticle = async (article) => {
    const articleUrl = `${window.location.origin}/articles/preg-${article.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, text: article.content.slice(0, 120), url: articleUrl });
        return;
      } catch (error) {
        // fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(articleUrl);
    } catch (error) {
      // no-op fallback
    }
  };

  const handleArticleContextMenu = (event, article) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      article,
    });
  };

  return (
    <section className="preg-resource-page">
      <div className="resource-search">
        <span>🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, videos, and guides..."
        />
      </div>

      <section className="resource-section tone-lavender reco-highlight">
        <h3>AI Health Recommendations</h3>
        <p className="resource-muted">Recommended for week {currentWeek}</p>
        <div className="ai-reco-grid">
          {aiRecommendations.map((item) => (
            <article className="ai-reco-card" key={`${item.type}-${item.title}`}>
              <span className="ai-reco-icon">{recommendationIcon(item.type)}</span>
              <strong>{item.type.toUpperCase()}</strong>
              <p>{item.title}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="resource-section tone-offwhite">
        <div className="resource-tabs">
          {["articles", "videos", "guides", "faq"].map((tab) => (
            <button
              type="button"
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "faq" ? "FAQ" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "guides" ? (
        <section className="resource-section tone-teal">
          <h3>Pregnancy Guides</h3>
          <div className="guide-grid">
            {GUIDES.map((item) => (
              <article className="guide-card" key={item.title}>
                <div className="guide-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.subtitle}</p>
                <small>{item.pages}</small>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "articles" ? (
        <section className="resource-section tone-offwhite">
          <div className="section-head">
            <h3>Articles</h3>
            <button type="button">Week {currentWeek}</button>
          </div>
          <div className="article-type-tabs">
            <button
              type="button"
              className={articleView === "free" ? "active free" : "free"}
              onClick={() => setArticleView("free")}
            >
              Free Articles ({freeArticles.length})
            </button>
            <button
              type="button"
              className={articleView === "premium" ? "active premium" : "premium"}
              onClick={() => setArticleView("premium")}
            >
              Premium Articles ({premiumArticles.length})
            </button>
          </div>
          {summaryPanel ? (
            <div className="article-summary-panel">
              <strong>AI Summary</strong>
              <p>{summaryPanel}</p>
            </div>
          ) : null}
          {articleView === "free" ? (
            <div className="article-grid free-grid">
              {freeArticles.map((item) => {
                const isBookmarked = bookmarks.includes(item.id);
                return (
                  <article
                    className="article-card dynamic free"
                    key={item.id}
                    onContextMenu={(event) => handleArticleContextMenu(event, item)}
                  >
                    <div className="article-top">
                      <span className="emoji">📖</span>
                    </div>
                    <small>{item.category}</small>
                    <h4>{item.title}</h4>
                    <p>◷ {item.readTime}</p>
                    <div className="resource-actions-row">
                      <button type="button" onClick={() => openArticle(item)}>
                        Read
                      </button>
                      <button type="button" onClick={() => setSummaryPanel(summarizeArticle(item.content))}>
                        Summarize
                      </button>
                      <button type="button" onClick={() => readArticle(item)}>
                        Read Aloud
                      </button>
                      <button type="button" onClick={() => toggleBookmark(item.id)}>
                        {isBookmarked ? "Saved" : "Bookmark"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="article-grid premium-grid">
              {premiumArticles.map((item) => (
                <article
                  className="article-card dynamic premium"
                  key={item.id}
                  onContextMenu={(event) => handleArticleContextMenu(event, item)}
                >
                  <div className="article-top">
                    <span className="emoji">🔒</span>
                    <span className="popular premium">Premium</span>
                  </div>
                  <small>{item.category}</small>
                  <h4>{item.title}</h4>
                  <p>◷ {item.readTime}</p>
                  <div className="premium-preview">
                    <p>{item.content.slice(0, 220)}...</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (isSubscribed) {
                          openArticle(item);
                          return;
                        }
                        setOpenSubscription(true);
                      }}
                    >
                      {isSubscribed ? "Read Full Article" : "Subscribe to Read Full Article"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "videos" ? (
        <section className="resource-section tone-lavender">
          <div className="section-head">
            <h3>Video Library</h3>
            <button type="button">Recommended</button>
          </div>
          <div className="video-grid dynamic">
            {filteredVideos.map((item) => (
              <article className="video-card dynamic" key={item.id}>
                <div className="video-embed-wrap">
                  <iframe
                    src={item.embedUrl}
                    title={item.title}
                    width="100%"
                    height="210"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <small>{item.category}</small>
                <h4>{item.title}</h4>
                <p>{item.duration}</p>
                <button type="button" onClick={() => markVideoWatched(item.id)}>
                  {watchedVideos.includes(item.id) ? "Watched" : "Mark Watched"}
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {activeTab === "faq" ? (
        <section className="resource-section faq tone-teal">
          <h3>❔ Frequently Asked Questions</h3>
          <div className="faq-list">
            {filteredFaqs.map((item, index) => {
              const isOpen = openFaq === item.question;
              const colorClass = index % 3 === 0 ? "lavender" : index % 3 === 1 ? "teal" : "coral";
              return (
                <article className={`faq-item ${colorClass}`} key={item.question}>
                  <button
                    type="button"
                    className="faq-toggle"
                    onClick={() => setOpenFaq(isOpen ? null : item.question)}
                    aria-expanded={isOpen}
                  >
                    <div>
                      <h4>{item.question}</h4>
                      <small>Week {item.weekRange[0]}-{item.weekRange[1]}</small>
                    </div>
                    <span>{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen ? <p>{item.answer}</p> : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="resource-section tone-offwhite">
        <h3>Reading Progress</h3>
        <div className="progress-stats">
          <p>✔ {readArticles.length} Articles Completed</p>
          <p>📺 {watchedVideos.length} Videos Watched</p>
        </div>
      </section>

      <section className="resource-section tone-lavender">
        <h3>Saved Articles</h3>
        <div className="saved-article-list">
          {bookmarks.length ? (
            pregnancyArticles
              .filter((article) => bookmarks.includes(article.id))
              .map((article) => (
                <button key={article.id} type="button" onClick={() => openArticle(article)}>
                  {article.title}
                </button>
              ))
          ) : (
            <p className="resource-muted">No saved articles yet.</p>
          )}
        </div>
      </section>

      <section className="resource-help-strip">
        <div>
          <h3>📖 Need More Information?</h3>
          <p>
            Can't find what you're looking for? Our AI Assistant can help answer your questions, or
            you can connect with our community for peer support.
          </p>
        </div>
        <div className="help-actions">
          <button type="button" className="primary" onClick={() => navigate("/pregnancy-dashboard")}>Ask AI Assistant</button>
          <button type="button" className="ghost" onClick={() => navigate("/pregnancy/community")}>Join Community</button>
        </div>
      </section>

      {contextMenu.visible ? (
        <div
          className="article-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            type="button"
            onClick={() => {
              if (!contextMenu.article) return;
              setSummaryPanel(summarizeArticle(contextMenu.article.content));
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
          >
            Summarize
          </button>
          <button
            type="button"
            onClick={() => {
              if (!contextMenu.article) return;
              readArticle(contextMenu.article);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
          >
            Read Article
          </button>
          <button
            type="button"
            onClick={() => {
              if (!contextMenu.article) return;
              toggleBookmark(contextMenu.article.id);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
          >
            Save Article
          </button>
          <button
            type="button"
            onClick={() => {
              if (!contextMenu.article) return;
              shareArticle(contextMenu.article);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
          >
            Share
          </button>
        </div>
      ) : null}

      <SubscriptionModal
        open={openSubscription}
        onClose={() => setOpenSubscription(false)}
        onSubscribe={() => {
          localStorage.setItem("isSubscribed", "true");
          setOpenSubscription(false);
        }}
      />
    </section>
  );
}
