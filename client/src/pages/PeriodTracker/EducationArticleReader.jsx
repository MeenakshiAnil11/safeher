import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaChevronRight, FaLock, FaVolumeUp } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { isSubscribedLocal, subscribeToSubscriptionUpdates } from "../../services/subscriptionAccess";
import { educationArticles } from "../../data/educationArticles";
import "./educationArticleReader.css";

function summarize(text) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 3).join(" ");
}

export default function EducationArticleReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);
  const [summary, setSummary] = useState("");
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(isSubscribedLocal());

  const article = useMemo(() => educationArticles.find((item) => item.id === id), [id]);

  useEffect(() => {
    const closeMenu = () => setMenu((prev) => ({ ...prev, visible: false }));
    window.addEventListener("click", closeMenu);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToSubscriptionUpdates((subscribed) => {
      setIsSubscribed(Boolean(subscribed));
    });
    return unsubscribe;
  }, []);

  if (!article) {
    return (
      <div className="education-reader-missing">
        <h2>Article not found</h2>
        <button
          type="button"
          onClick={() => navigate("/period-tracker", { state: { activeTab: "education" } })}
        >
          Back to Education
        </button>
      </div>
    );
  }

  const isPremiumLocked = article.type === "premium" && !isSubscribed;
  const maxReadablePage = isPremiumLocked ? 0 : article.pages.length - 1;
  const safePageIndex = Math.min(pageIndex, maxReadablePage);
  const totalPagesVisible = isPremiumLocked ? 1 : article.pages.length;

  const text = article.pages[safePageIndex] || "";
  const currentPageContent = !isPremiumLocked
    ? text
    : text.split("\n\n").filter(Boolean).slice(0, 2).join("\n\n");

  const progress = Math.round(((safePageIndex + 1) / totalPagesVisible) * 100);

  const onReadAloud = () => {
    if (!currentPageContent) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(currentPageContent);
    utter.rate = 1;
    utter.pitch = 1;
    utter.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const onContextMenu = (e) => {
    e.preventDefault();
    setMenu({ visible: true, x: e.pageX, y: e.pageY });
  };

  const onSummarize = () => {
    setSummary(summarize(currentPageContent));
    setMenu((prev) => ({ ...prev, visible: false }));
  };

  const goNext = () => {
    if (safePageIndex < maxReadablePage) {
      setPageIndex((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (safePageIndex > 0) {
      setPageIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="education-reader">
      <div className="reader-topbar">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/period-tracker", { state: { activeTab: "education" } })}
        >
          <FaArrowLeft /> Back to Education
        </button>
        <button type="button" className="read-btn" onClick={isSpeaking ? stopReading : onReadAloud}>
          <FaVolumeUp /> {isSpeaking ? "Stop Reading" : "Read Aloud"}
        </button>
      </div>

      <header className="reader-header">
        <h1>{article.title}</h1>
        <div className="reader-meta">
          <span>{article.category}</span>
          <span>{article.readingTime}</span>
          <span>{article.difficulty}</span>
          <span className={`type-badge ${article.type}`}>{article.type}</span>
        </div>
      </header>

      <div className="reader-progress">
        <div className="reader-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-text">
        Page {safePageIndex + 1} / {totalPagesVisible}
      </p>

      {summary && (
        <section className="summary-box">
          <h3>Article Summary</h3>
          <p>{summary}</p>
        </section>
      )}

      <article className="reader-content" onContextMenu={onContextMenu}>
        {currentPageContent}
      </article>

      {menu.visible && (
        <div className="article-context-menu" style={{ top: menu.y, left: menu.x }}>
          <button type="button" onClick={onSummarize}>Summarize Article</button>
          <button type="button" onClick={onReadAloud}>Read Aloud</button>
        </div>
      )}

      <div className="reader-nav">
        <button type="button" disabled={safePageIndex === 0} onClick={goPrev}>
          Previous Page
        </button>
        <button type="button" disabled={safePageIndex >= maxReadablePage} onClick={goNext}>
          Next Page <FaChevronRight />
        </button>
      </div>

      {isPremiumLocked && (
        <section className="premium-lock-banner">
          <FaLock />
          <p>Unlock full article with subscription</p>
          <button type="button" onClick={() => navigate("/payment-page")}>
            Subscribe Now
          </button>
        </section>
      )}
    </div>
  );
}
