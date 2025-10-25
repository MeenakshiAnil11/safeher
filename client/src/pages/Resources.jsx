// client/src/pages/Resources.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import ResourceSidebar from "../components/ResourceSidebar";
import Footer from "../components/Footer";
import api from "../services/api";
import "./resources.css";

// Resource dataset (can be moved to API later)
const RESOURCES = [
  // Legal Rights & Laws
  {
    id: "legal-1",
    title: "Know Your Legal Rights: A Quick Guide",
    type: "Article",
    category: "Legal Rights & Laws",
    verified: true,
    lang: ["en"],
    source: { name: "India.gov", url: "https://www.india.gov.in/" },
    link: "https://www.india.gov.in/",
    description: "Overview of women’s legal rights, complaint procedures, and key protections.",
    tags: ["rights", "law", "women"],
  },
  {
    id: "legal-2",
    title: "POSH at Workplace: Your Rights",
    type: "External Link",
    category: "Legal Rights & Laws",
    verified: true,
    lang: ["en"],
    source: { name: "WCD", url: "https://wcd.gov.in/" },
    link: "https://wcd.gov.in/",
    description: "Understanding workplace harassment law and redressal mechanisms.",
    tags: ["workplace", "harassment", "posh"],
  },
  // Health & Wellness
  {
    id: "health-1",
    title: "Mental Health: Coping with Stress",
    type: "Article",
    category: "Health & Wellness",
    verified: true,
    lang: ["en", "hi"],
    source: { name: "WHO", url: "https://www.who.int/" },
    link: "https://www.who.int/",
    description: "Evidence-based techniques to manage stress and seek help when needed.",
    tags: ["mental", "stress", "wellbeing"],
  },
  {
    id: "health-2",
    title: "Reproductive Health: Essentials",
    type: "Guide",
    category: "Health & Wellness",
    verified: true,
    lang: ["en"],
    source: { name: "UNICEF", url: "https://www.unicef.org/" },
    link: "https://www.unicef.org/",
    description: "Basics of reproductive health, hygiene, and care.",
    tags: ["reproductive", "hygiene"],
  },
  // Safety & Security
  {
    id: "safety-1",
    title: "Online Safety Checklist",
    type: "Checklist",
    category: "Safety & Security",
    verified: true,
    lang: ["en"],
    source: { name: "CERT-In", url: "https://www.cert-in.org.in/" },
    link: "https://www.cert-in.org.in/",
    description: "Practical tips to secure your online presence and devices.",
    tags: ["online", "privacy", "security"],
  },
  {
    id: "safety-2",
    title: "Safe Travel Guide",
    type: "Guide",
    category: "Safety & Security",
    verified: false,
    lang: ["en"],
    source: { name: "India.gov.in", url: "https://www.india.gov.in/topics/travel-tourism" },
    link: "https://www.india.gov.in/topics/travel-tourism",
    description: "How to plan and navigate trips with safety in mind.",
    tags: ["travel", "tips"],
  },
  // Education & Skills
  {
    id: "edu-1",
    title: "Scholarships for Women in STEM",
    type: "External Link",
    category: "Education & Skills",
    verified: true,
    lang: ["en"],
    source: { name: "Gov Scholarships", url: "https://scholarships.gov.in/" },
    link: "https://scholarships.gov.in/",
    description: "Updated list of scholarships and application tips.",
    tags: ["scholarship", "STEM"],
  },
  {
    id: "edu-2",
    title: "Self-Defense Basics for Beginners",
    type: "Video",
    category: "Education & Skills",
    verified: false,
    lang: ["en"],
    source: { name: "YouTube", url: "https://youtube.com/" },
    link: "https://youtube.com/",
    description: "Beginner-friendly techniques to build confidence.",
    tags: ["self-defense", "video"],
  },
  // Support Networks
  {
    id: "support-1",
    title: "Government Schemes for Women",
    type: "Article",
    category: "Support Networks",
    verified: true,
    lang: ["en"],
    source: { name: "WCD", url: "https://wcd.gov.in/" },
    link: "https://wcd.gov.in/",
    description: "Key government initiatives and how to access them.",
    tags: ["govt", "scheme"],
  },
  {
    id: "support-2",
    title: "NGO Directory (Women Support)",
    type: "External Link",
    category: "Support Networks",
    verified: false,
    lang: ["en"],
    source: { name: "NGO Darpan", url: "https://ngodarpan.gov.in/" },
    link: "https://ngodarpan.gov.in/",
    description: "Find NGOs and community groups in your region.",
    tags: ["ngo", "directory"],
  },
];

const CATEGORIES = [
  "All",
  "Legal Rights & Laws",
  "Health & Wellness",
  "Safety & Security",
  "Education & Skills",
  "Support Networks",
];

const TYPES = ["All", "Article", "PDF", "Guide", "Video", "Checklist", "External Link"];
const FAV_KEY = "safeher_resources_bookmarks";
const RECENT_KEY = "safeher_resources_recent";

function SectionHeader({ title, description }) {
  return (
    <div className="hv-head container">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>
    </div>
  );
}

export default function Resources() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get active section from URL hash, default to 'all'
  const getActiveTab = () => {
    const hash = location.hash.substring(1); // Remove the '#'
    return hash || 'all';
  };

  const [tab, setTab] = useState(getActiveTab());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [lang, setLang] = useState("en");
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [remoteResources, setRemoteResources] = useState([]);
  const [events, setEvents] = useState([]);

  // Update tab when hash changes
  useEffect(() => {
    setTab(getActiveTab());
  }, [location.hash]);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Load approved resources from server (public)
  useEffect(() => {
    let mounted = true;
    api
      .get("/resources")
      .then((res) => {
        if (!mounted) return;
        const list = (res.data?.resources || []).map((r) => ({
          id: r._id || r.title,
          title: r.title,
          type: r.type || "Article",
          category: r.category || "General",
          verified: r.approved === true,
          lang: ["en"],
          source: { name: r.region || "", url: r.url || "#" },
          link: r.url || "#",
          description: r.description || "",
          tags: [],
        }));
        setRemoteResources(list);
      })
      .catch(() => setRemoteResources([]));
    return () => {
      mounted = false;
    };
  }, []);

  // Load published events from server (public)
  useEffect(() => {
    let mounted = true;
    api
      .get("/resources/events")
      .then((res) => {
        if (!mounted) return;
        const list = (res.data?.events || []).map((e) => ({
          id: e._id,
          title: e.title,
          type: e.type,
          date: e.date,
          time: e.time,
          location: e.location,
          url: e.url,
          description: e.description,
          bannerImage: e.bannerImage,
        }));
        setEvents(list);
      })
      .catch(() => setEvents([]));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // 🚀 Merge static and API resources
    const base =
      remoteResources.length > 0
        ? [...RESOURCES, ...remoteResources]
        : RESOURCES;
    let list = base.filter(
      (r) =>
        (category === "All" || r.category === category) &&
        (type === "All" || r.type === type) &&
        (r.lang?.includes?.(lang) ?? true) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          (r.description || "").toLowerCase().includes(q) ||
          (r.category || "").toLowerCase().includes(q) ||
          (r.type || "").toLowerCase().includes(q) ||
          (r.tags || []).some((t) => (t || "").toLowerCase().includes(q)))
    );
    list.sort((a, b) => {
      const favA = bookmarks.includes(a.id) ? 1 : 0;
      const favB = bookmarks.includes(b.id) ? 1 : 0;
      if (favA !== favB) return favB - favA;
      if (a.verified !== b.verified) return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [query, category, type, lang, bookmarks, remoteResources]);

  const toggleBookmark = (id) => {
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const addToRecentlyViewed = (id) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter(item => item.id !== id); // Remove if already exists
      const newEntry = { id, timestamp: Date.now() };
      return [newEntry, ...filtered].slice(0, 10); // Keep only 10 most recent
    });
  };

  const share = (r) => {
    const url = r.link;
    const text = `${r.title} — ${url}`;
    if (navigator.share) {
      navigator.share({ title: r.title, text, url }).catch(() => {});
    } else {
      const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(wa, "_blank");
    }
  };

  const downloadIfPdf = (r) => {
    if (r.type !== "PDF") return;
    if (r.link.startsWith("/")) {
      const a = document.createElement("a");
      a.href = r.link;
      a.download = (r.title || "resource").replace(/\s+/g, "_") + ".pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      window.open(r.link, "_blank", "noopener,noreferrer");
    }
  };

  const saved = [...RESOURCES, ...remoteResources].filter((r) => bookmarks.includes(r.id));

  const recent = [...RESOURCES, ...remoteResources]
    .filter((r) => recentlyViewed.some(item => item.id === r.id))
    .sort((a, b) => {
      const aTime = recentlyViewed.find(item => item.id === a.id)?.timestamp || 0;
      const bTime = recentlyViewed.find(item => item.id === b.id)?.timestamp || 0;
      return bTime - aTime; // Most recent first
    });

  const renderSearchSection = () => (
    <section className="container res-section">
      <div className="search-section">
        <h2>🔍 Search Resources</h2>
        <p>Find resources by keywords, categories, or content type</p>

        <div className="search-controls">
          <div className="search-wrap">
            <span className="icon">🔎</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keywords (e.g., rights, mental health, scholarship)"
            />
          </div>
          <div className="filters">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">हिन्दी (beta)</option>
            </select>
          </div>
        </div>

        <div className="res-grid">
          {filtered.map((r) => (
            <article key={r.id} className="res-card">
              <div className="res-badges">
                {r.verified && <span className="verified">✅ Verified</span>}
                <span className="pill type">{r.type}</span>
              </div>
              <h3 className="res-title-text">{r.title}</h3>
              <p className="res-desc">{r.description}</p>
              <div className="res-meta">
                <span className="pill cat">{r.category}</span>
                <a href={r.source.url} target="_blank" rel="noreferrer" className="source">
                  Source: {r.source.name}
                </a>
              </div>
              <div className="res-card-actions">
                <a className="btn primary small" href={r.link} target="_blank" rel="noreferrer" onClick={() => addToRecentlyViewed(r.id)}>
                  Open
                </a>
                {r.type === "PDF" && (
                  <button className="btn ghost small" onClick={() => downloadIfPdf(r)}>
                    Download
                  </button>
                )}
                <button className="btn ghost small" onClick={() => share(r)}>
                  Share
                </button>
                <button
                  className={`btn small ${bookmarks.includes(r.id) ? "fav" : ""}`}
                  onClick={() => toggleBookmark(r.id)}
                  title="Bookmark"
                >
                  {bookmarks.includes(r.id) ? "★ Bookmarked" : "☆ Bookmark"}
                </button>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty">No resources found. Try a different keyword, category, or type.</div>
        )}
      </div>
    </section>
  );

  const renderAllResourcesSection = () => (
    <section className="container res-section">
      <div className="all-resources-section">
        <h2>📚 All Resources</h2>
        <p>Browse our complete collection of verified resources</p>

        <div className="res-grid">
          {filtered.map((r) => (
            <article key={r.id} className="res-card">
              <div className="res-badges">
                {r.verified && <span className="verified">✅ Verified</span>}
                <span className="pill type">{r.type}</span>
              </div>
              <h3 className="res-title-text">{r.title}</h3>
              <p className="res-desc">{r.description}</p>
              <div className="res-meta">
                <span className="pill cat">{r.category}</span>
                <a href={r.source.url} target="_blank" rel="noreferrer" className="source">
                  Source: {r.source.name}
                </a>
              </div>
              <div className="res-card-actions">
                <a className="btn primary small" href={r.link} target="_blank" rel="noreferrer" onClick={() => addToRecentlyViewed(r.id)}>
                  Open
                </a>
                {r.type === "PDF" && (
                  <button className="btn ghost small" onClick={() => downloadIfPdf(r)}>
                    Download
                  </button>
                )}
                <button className="btn ghost small" onClick={() => share(r)}>
                  Share
                </button>
                <button
                  className={`btn small ${bookmarks.includes(r.id) ? "fav" : ""}`}
                  onClick={() => toggleBookmark(r.id)}
                  title="Bookmark"
                >
                  {bookmarks.includes(r.id) ? "★ Bookmarked" : "☆ Bookmark"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );

  const renderCategorySection = () => {
    const categoryMap = {
      safety: "Safety & Security",
      legal: "Legal Rights & Laws",
      health: "Health & Wellness",
      helplines: "Support Networks"
    };

    const displayCategory = categoryMap[tab] || "All";

    return (
      <section className="container res-section">
        <div className="category-section">
          <h2>🗂️ {displayCategory}</h2>
          <p>Resources in the {displayCategory.toLowerCase()} category</p>

          <div className="res-grid">
            {filtered.filter(r => displayCategory === "All" || r.category === displayCategory).map((r) => (
              <article key={r.id} className="res-card">
                <div className="res-badges">
                  {r.verified && <span className="verified">✅ Verified</span>}
                  <span className="pill type">{r.type}</span>
                </div>
                <h3 className="res-title-text">{r.title}</h3>
                <p className="res-desc">{r.description}</p>
                <div className="res-meta">
                  <span className="pill cat">{r.category}</span>
                  <a href={r.source.url} target="_blank" rel="noreferrer" className="source">
                    Source: {r.source.name}
                  </a>
                </div>
                <div className="res-card-actions">
                  <a className="btn primary small" href={r.link} target="_blank" rel="noreferrer" onClick={() => addToRecentlyViewed(r.id)}>
                    Open
                  </a>
                  {r.type === "PDF" && (
                    <button className="btn ghost small" onClick={() => downloadIfPdf(r)}>
                      Download
                    </button>
                  )}
                  <button className="btn ghost small" onClick={() => share(r)}>
                    Share
                  </button>
                  <button
                    className={`btn small ${bookmarks.includes(r.id) ? "fav" : ""}`}
                    onClick={() => toggleBookmark(r.id)}
                    title="Bookmark"
                  >
                    {bookmarks.includes(r.id) ? "★ Bookmarked" : "☆ Bookmark"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderSavedSection = () => (
    <section className="container res-section">
      <div className="saved-section">
        <h2>⭐ Saved / Bookmarked Resources</h2>
        <p>Your personal collection of saved resources</p>

        {saved.length > 0 ? (
          <div className="res-grid">
            {saved.map((r) => (
              <article key={r.id} className="res-card">
                <div className="res-badges">
                  {r.verified && <span className="verified">✅ Verified</span>}
                  <span className="pill type">{r.type}</span>
                </div>
                <h3 className="res-title-text">{r.title}</h3>
                <p className="res-desc">{r.description}</p>
                <div className="res-meta">
                  <span className="pill cat">{r.category}</span>
                  <a href={r.source.url} target="_blank" rel="noreferrer" className="source">
                    Source: {r.source.name}
                  </a>
                </div>
                <div className="res-card-actions">
                  <a className="btn primary small" href={r.link} target="_blank" rel="noreferrer">
                    Open
                  </a>
                  {r.type === "PDF" && (
                    <button className="btn ghost small" onClick={() => downloadIfPdf(r)}>
                      Download
                    </button>
                  )}
                  <button className="btn ghost small" onClick={() => share(r)}>
                    Share
                  </button>
                  <button className="btn small fav" onClick={() => toggleBookmark(r.id)}>
                    ★ Saved
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>You haven't saved any resources yet.</p>
            <p>Browse resources and click the bookmark button to save them here.</p>
          </div>
        )}
      </div>
    </section>
  );

  const renderRecentSection = () => (
    <section className="container res-section">
      <div className="recent-section">
        <h2>⏱️ Recently Viewed Resources</h2>
        <p>Resources you've accessed recently</p>

        {recent.length > 0 ? (
          <div className="res-grid">
            {recent.map((r) => (
              <article key={r.id} className="res-card">
                <div className="res-badges">
                  {r.verified && <span className="verified">✅ Verified</span>}
                  <span className="pill type">{r.type}</span>
                </div>
                <h3 className="res-title-text">{r.title}</h3>
                <p className="res-desc">{r.description}</p>
                <div className="res-meta">
                  <span className="pill cat">{r.category}</span>
                  <a href={r.source.url} target="_blank" rel="noreferrer" className="source">
                    Source: {r.source.name}
                  </a>
                </div>
                <div className="res-card-actions">
                  <a className="btn primary small" href={r.link} target="_blank" rel="noreferrer" onClick={() => addToRecentlyViewed(r.id)}>
                    Open
                  </a>
                  {r.type === "PDF" && (
                    <button className="btn ghost small" onClick={() => downloadIfPdf(r)}>
                      Download
                    </button>
                  )}
                  <button className="btn ghost small" onClick={() => share(r)}>
                    Share
                  </button>
                  <button
                    className={`btn small ${bookmarks.includes(r.id) ? "fav" : ""}`}
                    onClick={() => toggleBookmark(r.id)}
                    title="Bookmark"
                  >
                    {bookmarks.includes(r.id) ? "★ Bookmarked" : "☆ Bookmark"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>You haven't viewed any resources yet.</p>
            <p>Browse resources and click "Open" to see them here.</p>
          </div>
        )}
      </div>
    </section>
  );

  const renderSubmitSection = () => (
    <section className="container res-section">
      <div className="submit-section">
        <h2>➕ Submit a Resource</h2>
        <p>Help expand our resource collection by contributing valuable content</p>

        <div className="submit-card">
          <p>Know of a helpful resource that could benefit others in our community?</p>
          <p>We welcome submissions of articles, guides, videos, and other educational materials related to women's safety, health, and empowerment.</p>
          <button className="btn primary" onClick={() => navigate("/submit-resource")}>
            Submit Resource
          </button>
        </div>
      </div>
    </section>
  );

  const renderEventsSection = () => (
    <section className="container res-section">
      <div className="events-section">
        <h2>🗓️ Events & Webinars</h2>
        <p>Upcoming events, workshops, and online webinars</p>

        {events.length > 0 ? (
          <div className="res-grid">
            {events.map((e) => (
              <article key={e.id} className="res-card">
                <div className="res-badges">
                  <span className="pill type">{e.type}</span>
                </div>
                {e.bannerImage && (
                  <img src={e.bannerImage} alt={e.title} className="event-banner" />
                )}
                <h3 className="res-title-text">{e.title}</h3>
                <p className="res-desc">{e.description}</p>
                <div className="res-meta">
                  <span className="pill cat">📅 {new Date(e.date).toLocaleDateString()}</span>
                  {e.time && <span className="pill cat">🕒 {e.time}</span>}
                  {e.location && <span className="pill cat">📍 {e.location}</span>}
                </div>
                <div className="res-card-actions">
                  {e.url && (
                    <a className="btn primary small" href={e.url} target="_blank" rel="noreferrer">
                      Register / Join
                    </a>
                  )}
                  <button className="btn ghost small" onClick={() => share({ title: e.title, link: e.url || "#" })}>
                    Share
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="events-placeholder">
            <p>No upcoming events at the moment.</p>
            <p>Stay tuned for announcements about upcoming workshops, seminars, and online sessions.</p>
          </div>
        )}
      </div>
    </section>
  );

  const renderExternalSection = () => (
    <section className="container res-section">
      <div className="external-section">
        <h2>🌐 External Resource Directories</h2>
        <p>Links to comprehensive external resource collections</p>

        <div className="external-links">
          <div className="external-card">
            <h3>Government Portals</h3>
            <p>Official government resources and schemes</p>
            <a href="https://wcd.nic.in/" target="_blank" rel="noopener noreferrer" className="btn primary small">
              Visit WCD Portal
            </a>
          </div>
          <div className="external-card">
            <h3>NGO Directories</h3>
            <p>Find NGOs and support organizations</p>
            <a href="https://ngodarpan.gov.in/" target="_blank" rel="noopener noreferrer" className="btn primary small">
              Visit NGO Darpan
            </a>
          </div>
          <div className="external-card">
            <h3>International Organizations</h3>
            <p>Global resources from WHO, UNICEF, and others</p>
            <a href="https://www.who.int/" target="_blank" rel="noopener noreferrer" className="btn primary small">
              Visit WHO
            </a>
          </div>
        </div>
      </div>
    </section>
  );

  const renderInteractiveSection = () => (
    <section className="container res-section">
      <div className="interactive-section">
        <h2>Interactive Tools</h2>
        <div className="interactive-grid">
          <div className="quiz-card">
            <div>
              <h3>Quiz: Know Your Legal Rights</h3>
              <p>Test your knowledge and discover gaps to learn more.</p>
            </div>
            <button className="btn primary" onClick={() => navigate("/quiz")}>
              Start Quiz
            </button>
          </div>
          <div className="quiz-card">
            <div>
              <h3>Self-Assessment: Stress Check</h3>
              <p>Quick 2-minute check-in with suggested resources.</p>
            </div>
            <button className="btn primary" onClick={() => navigate("/assessment")}>
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="dashboard-container page-with-header">
      <UserHeader />
      <div className="dashboard-body">
        <ResourceSidebar />

        <main className="dashboard-main">
          <SectionHeader
            title="Resource Hub"
            description="Trusted, verified knowledge for safety, health, and growth."
          />

          {tab === "search" && renderSearchSection()}
          {tab === "all" && renderAllResourcesSection()}
          {(tab === "categories" || tab === "safety" || tab === "legal" || tab === "health" || tab === "helplines") && renderCategorySection()}
          {tab === "saved" && renderSavedSection()}
          {tab === "recent" && renderRecentSection()}
          {tab === "quiz" && renderInteractiveSection()}
          {tab === "submit" && renderSubmitSection()}
          {tab === "events" && renderEventsSection()}
          {tab === "external" && renderExternalSection()}
        </main>
      </div>
      <Footer />
    </div>
  );
}
