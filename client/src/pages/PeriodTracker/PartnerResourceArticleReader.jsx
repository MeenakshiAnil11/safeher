import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { partnerResourcesContent } from "../../data/partnerResourcesContent";
import "./PartnerResourceArticleReader.css";

const BOOKMARK_KEY = "partnerResourceBookmarks";

const summarizeText = (text = "") =>
  String(text)
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(". ") + ".";

const allArticles = Object.values(partnerResourcesContent).flatMap((item) => item.articles || []);

export default function PartnerResourceArticleReader() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [summary, setSummary] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [isReading, setIsReading] = useState(false);

  const article = useMemo(() => allArticles.find((item) => item.id === id), [id]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]");
    setBookmarks(Array.isArray(saved) ? saved : []);
  }, []);

  useEffect(
    () => () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    },
    []
  );

  const toggleBookmark = () => {
    if (!article) return;
    const next = bookmarks.includes(article.id)
      ? bookmarks.filter((item) => item !== article.id)
      : [...bookmarks, article.id];
    setBookmarks(next);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
  };

  const readAloud = () => {
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
      <section className="partner-article-page">
        <button type="button" className="partner-article-back" onClick={() => navigate("/pregnancy-dashboard")}>
          ← Back
        </button>
        <article className="partner-article-card">
          <h1>Article not found</h1>
        </article>
      </section>
    );
  }

  return (
    <section className="partner-article-page">
      <button type="button" className="partner-article-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <article className="partner-article-card">
        <h1>{article.title}</h1>
        <p className="partner-article-range">
          Week {article.weekRange[0]}-{article.weekRange[1]}
        </p>

        <div className="partner-article-actions">
          <button type="button" onClick={readAloud}>Read aloud</button>
          <button type="button" onClick={() => setSummary(summarizeText(article.content))}>Summarize</button>
          <button type="button" onClick={toggleBookmark}>
            {bookmarks.includes(article.id) ? "Bookmarked" : "Bookmark"}
          </button>
          {isReading ? (
            <button
              type="button"
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsReading(false);
              }}
            >
              Stop
            </button>
          ) : null}
        </div>

        {summary ? (
          <div className="partner-article-summary">
            <strong>Summary</strong>
            <p>{summary}</p>
          </div>
        ) : null}

        <p className="partner-article-content">{article.content}</p>
      </article>
    </section>
  );
}
