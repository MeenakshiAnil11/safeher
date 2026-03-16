import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { conceiveArticlesData, getConceiveArticleById } from "../../data/conceiveArticlesData";
import "./ConceiveArticleDetail.css";

export default function ConceiveArticleDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [summary, setSummary] = useState("");
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });
  const [isReading, setIsReading] = useState(false);

  const article = useMemo(() => getConceiveArticleById(articleId), [articleId]);
  const sectionIds = useMemo(
    () =>
      article?.contentSections?.map((section, index) => ({
        id: `section-${index + 1}`,
        heading: section.heading,
      })) || [],
    [article]
  );

  useEffect(() => {
    if (!article) return undefined;

    const updateProgressAndSection = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const articleElement = document.getElementById("conceive-article-root");
      if (!articleElement) return;

      const articleTop = articleElement.offsetTop;
      const articleHeight = articleElement.offsetHeight;
      const articleScrollable = Math.max(1, articleHeight - window.innerHeight);
      const traveled = Math.max(0, Math.min(articleScrollable, scrollTop - articleTop));
      const percentage = Math.max(0, Math.min(100, (traveled / articleScrollable) * 100));
      setProgress(percentage);

      let currentSection = sectionIds[0]?.id || "";
      sectionIds.forEach((section) => {
        const node = document.getElementById(section.id);
        if (!node) return;
        if (scrollTop >= node.offsetTop - 140) {
          currentSection = section.id;
        }
      });
      setActiveSection(currentSection);
    };

    updateProgressAndSection();
    window.addEventListener("scroll", updateProgressAndSection, { passive: true });
    window.addEventListener("resize", updateProgressAndSection);
    return () => {
      window.removeEventListener("scroll", updateProgressAndSection);
      window.removeEventListener("resize", updateProgressAndSection);
    };
  }, [article, sectionIds]);

  const handleTocClick = (id) => {
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const articleText = useMemo(() => {
    if (!article) return "";
    const sectionText = article.contentSections.map((section) => `${section.heading}. ${section.text}`).join(" ");
    const factsText = article.quickFacts.join(". ");
    return `${article.title}. ${article.intro}. ${sectionText}. ${factsText}. Fertility learning is most effective when education and tracking work together.`;
  }, [article]);

  const closeContextMenu = () => setMenu((prev) => ({ ...prev, visible: false }));

  useEffect(() => {
    if (!menu.visible) return undefined;

    const handleGlobalClick = () => closeContextMenu();
    const handleEsc = (event) => {
      if (event.key === "Escape") closeContextMenu();
    };

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleEsc);
    window.addEventListener("scroll", handleGlobalClick, { passive: true });

    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("scroll", handleGlobalClick);
    };
  }, [menu.visible]);

  useEffect(() => () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  const handleRightClick = (event) => {
    event.preventDefault();
    setMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const summarizeArticle = () => {
    const sentences = articleText
      .split(/[.!?]+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
    const nextSummary = `${sentences.slice(0, 4).join(". ")}.`;
    setSummary(nextSummary);
    closeContextMenu();
  };

  const readArticle = () => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      closeContextMenu();
      return;
    }
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(articleText);
    speech.rate = 1;
    speech.pitch = 1;
    speech.onstart = () => setIsReading(true);
    speech.onend = () => setIsReading(false);
    speech.onerror = () => setIsReading(false);
    window.speechSynthesis.speak(speech);
    closeContextMenu();
  };

  const stopReading = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsReading(false);
  };

  const handleBackNavigation = () => {
    const fallbackPath = location.state?.from || "/period-tracking/conceive";
    navigate(fallbackPath, { state: { activeTab: "articles" } });
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Article not found</h1>
          <p className="text-gray-600 mb-6">The article you are trying to open does not exist.</p>
          <button
            type="button"
            onClick={() => navigate("/period-tracking/conceive")}
            className="bg-pink-500 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  const isSubscribed = localStorage.getItem("isSubscribed") === "true";
  if (article.isPaid && !isSubscribed) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Premium article</h1>
          <p className="text-gray-600 mb-6">Subscribe to read this article in full.</p>
          <button
            type="button"
            onClick={() => navigate("/payment-page")}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Go to Subscription
          </button>
        </div>
      </div>
    );
  }

  const relatedArticles = conceiveArticlesData
    .filter((item) => item.id !== article.id && (item.category === article.category || item.tags.some((tag) => article.tags.includes(tag))))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      <div className="reading-progress">
        <div className="reading-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="article-page-shell">
        <button type="button" onClick={handleBackNavigation} className="article-back-btn">
          ← Back
        </button>

        <article id="conceive-article-root" className="article-container">
          <div className="article-content" onContextMenu={handleRightClick}>
            <img src={article.heroImage} alt={article.title} className="article-hero-image" />
            <div className="article-content-inner">
              {summary ? (
                <div className="article-summary-box">
                  <h3>Article Summary</h3>
                  <p>{summary}</p>
                </div>
              ) : null}

              {isReading ? (
                <div className="article-reading-controls">
                  <button type="button" onClick={stopReading} className="article-stop-reading-btn">
                    Stop Reading
                  </button>
                </div>
              ) : null}

              <h1>{article.title}</h1>
              <p className="article-meta">
                {article.author} • {new Date(article.date).toLocaleDateString()} • {article.readTime}
              </p>
              <p>{article.intro}</p>

              {article.contentSections.map((section, index) => (
                <section key={section.heading} id={`section-${index + 1}`} className="article-section">
                  <h2>{section.heading}</h2>
                  <img src={section.image} alt={section.heading} />
                  <p>{section.text}</p>
                </section>
              ))}

              <section className="article-highlight-box">
                <h3>Quick Facts</h3>
                <ul>
                  {article.quickFacts.map((fact) => (
                    <li key={fact}>• {fact}</li>
                  ))}
                </ul>
              </section>

              <section className="article-section">
                <h3>Conclusion</h3>
                <p>Fertility learning is most effective when education and tracking work together. Keep using your SafeHer logs to personalize what you learn here.</p>
              </section>

              <section className="article-related-section">
                <h3>Related Articles</h3>
                <div className="article-related-grid">
                  {relatedArticles.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        navigate(`/articles/${item.id}`, {
                          state: {
                            from: "/period-tracking/conceive",
                            activeTab: "articles",
                          },
                        })
                      }
                      className="article-related-card"
                    >
                      <p className="article-related-title">{item.title}</p>
                      <p className="article-related-time">{item.readTime}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <aside className="article-sidebar">
            <h3>On this page</h3>
            <ul>
              {sectionIds.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleTocClick(item.id)}
                    className={`article-sidebar-link ${activeSection === item.id ? "active" : ""}`}
                  >
                    {item.heading}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </article>
      </div>

      {menu.visible ? (
        <div className="article-context-menu" style={{ top: menu.y, left: menu.x }}>
          <div
            role="button"
            tabIndex={0}
            onClick={summarizeArticle}
            onKeyDown={(event) => event.key === "Enter" && summarizeArticle()}
          >
            🧠 Summarize Article
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={readArticle}
            onKeyDown={(event) => event.key === "Enter" && readArticle()}
          >
            🔊 Read Aloud
          </div>
        </div>
      ) : null}
    </div>
  );
}
