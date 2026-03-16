import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SubscriptionModal from "../../components/SubscriptionModal";
import { getPregnancyArticleById } from "../../data/pregnancyArticles";
import "./PregnancyArticleReader.css";

const BOOKMARK_KEY = "savedArticles";
const ARTICLE_PROGRESS_KEY = "pregnancy_read_articles";

const summarizeArticle = (text = "") =>
  String(text)
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(". ") + ".";

export default function PregnancyArticleReader() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState("");
  const [openSubscription, setOpenSubscription] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isReading, setIsReading] = useState(false);

  const article = useMemo(() => getPregnancyArticleById(articleId), [articleId]);
  const isSubscribed = localStorage.getItem("isSubscribed") === "true";

  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]");
    setBookmarks(Array.isArray(savedBookmarks) ? savedBookmarks : []);
  }, []);

  useEffect(() => {
    if (!article) return;
    const savedRead = JSON.parse(localStorage.getItem(ARTICLE_PROGRESS_KEY) || "[]");
    const list = Array.isArray(savedRead) ? savedRead : [];
    if (!list.includes(article.id)) {
      const next = [...list, article.id];
      localStorage.setItem(ARTICLE_PROGRESS_KEY, JSON.stringify(next));
    }
  }, [article]);

  useEffect(
    () => () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    },
    []
  );

  const toggleBookmark = () => {
    if (!article) return;
    const next = bookmarks.includes(article.id)
      ? bookmarks.filter((id) => id !== article.id)
      : [...bookmarks, article.id];
    setBookmarks(next);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
  };

  const readArticle = () => {
    if (!article || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(article.content);
    speech.rate = 1;
    speech.pitch = 1;
    speech.onstart = () => setIsReading(true);
    speech.onend = () => setIsReading(false);
    speech.onerror = () => setIsReading(false);
    window.speechSynthesis.speak(speech);
  };

  if (!article) {
    return (
      <section className="preg-article-page">
        <button type="button" onClick={() => navigate("/pregnancy-dashboard")} className="preg-article-back">
          ← Back
        </button>
        <article className="preg-article-card">
          <h1>Article not found</h1>
          <p>The requested pregnancy article is unavailable.</p>
        </article>
      </section>
    );
  }

  const isPremiumLocked = article.premium && !isSubscribed;
  const isSaved = bookmarks.includes(article.id);

  return (
    <section className="preg-article-page">
      <button type="button" onClick={() => navigate("/pregnancy-dashboard")} className="preg-article-back">
        ← Back to Pregnancy Mode
      </button>

      <article className="preg-article-card">
        <small>{article.category}</small>
        <h1>{article.title}</h1>
        <p className="preg-article-meta">
          Read Time: {article.readTime} • Week {article.weekRange[0]}-{article.weekRange[1]}
        </p>

        <div className="preg-article-actions">
          <button type="button" onClick={readArticle}>
            Read Aloud
          </button>
          <button type="button" onClick={() => setSummary(summarizeArticle(article.content))}>
            Summarize
          </button>
          <button type="button" onClick={toggleBookmark}>
            {isSaved ? "Saved" : "Bookmark"}
          </button>
          {isReading ? (
            <button
              type="button"
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsReading(false);
              }}
            >
              Stop Reading
            </button>
          ) : null}
        </div>

        {summary ? (
          <div className="preg-article-summary">
            <strong>AI Summary</strong>
            <p>{summary}</p>
          </div>
        ) : null}

        {isPremiumLocked ? (
          <div className="preg-premium-preview">
            <p>🔒 Premium Article</p>
            <p>{article.content.slice(0, 260)}...</p>
            <button type="button" onClick={() => setOpenSubscription(true)}>
              Subscribe to Read Full Article
            </button>
          </div>
        ) : (
          <div className="preg-article-content">
            <p>{article.content}</p>
          </div>
        )}
      </article>

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
