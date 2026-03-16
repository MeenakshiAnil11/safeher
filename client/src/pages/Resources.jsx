// client/src/pages/Resources.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
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

const FAV_KEY = "safeher_resources_bookmarks";
const RECENT_KEY = "safeher_resources_recent";
const ALL_PAGE_TABS = ["All Resources", "Recommended for You", "Saved", "Recently Viewed"];
const ALL_PAGE_CATEGORIES = [
  "All Categories",
  "Health & Wellness",
  "Safety & Security",
  "Education & Skills",
  "Legal Rights & Laws",
  "Support Networks",
];
const ALL_PAGE_TYPES = ["All Types", "Article", "Video", "Guide", "Checklist", "PDF", "External Link"];
const HERO_SLIDES = [
  {
    id: "slide-1",
    title: "Breaking Barriers: Women in Leadership Masterclass",
    description: "Learn from successful women leaders about navigating career challenges and achieving professional excellence.",
    category: "Career & Education",
    badge: "Trending Now",
    image: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "slide-2",
    title: "Financial Freedom: Smart Money Management for Women",
    description: "Master the essentials of budgeting, investing, and building long-term financial security.",
    category: "Financial Literacy",
    badge: "Editor's Pick",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "slide-3",
    title: "Mindfulness and Wellness for Everyday Strength",
    description: "Build emotional resilience through guided practices, stress management, and self-care routines.",
    category: "Health & Wellness",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80",
  },
];
const HERO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1400&q=80";
const HASH_TO_CATEGORY = {
  health: "Health & Wellness",
  safety: "Safety & Security",
  legal: "Legal Rights & Laws",
  helplines: "Support Networks",
  career: "Education & Skills",
  lifestyle: "Health & Wellness",
  finance: "Education & Skills",
};

const CATEGORY_DESCRIPTIONS = {
  "All Resources": "Browse trusted and verified resources curated for women's wellbeing and growth.",
  "Health & Wellness": "Fitness, nutrition, mental health guides, and wellness resources.",
  "Safety & Security": "Safety checklists, emergency preparedness, and practical self-protection resources.",
  "Education & Skills": "Learning opportunities, scholarships, career growth, and skill-building resources.",
  "Legal Rights & Laws": "Understand your rights, legal protections, and access to law-related support.",
  "Support Networks": "Find helplines, communities, services, and trusted support organizations.",
};

export default function Resources() {
  const location = useLocation();

  const getActiveTab = () => {
    const hash = location.hash.substring(1);
    return hash || "all";
  };

  const [tab, setTab] = useState(getActiveTab());
  const [category, setCategory] = useState("All Categories");
  const [allQuery, setAllQuery] = useState("");
  const [allCategory, setAllCategory] = useState("All Categories");
  const [allType, setAllType] = useState("All Types");
  const [allVerifiedOnly, setAllVerifiedOnly] = useState(false);
  const [allViewTab, setAllViewTab] = useState("All Resources");
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroImageFailed, setHeroImageFailed] = useState(false);
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

  useEffect(() => {
    setTab(getActiveTab());
  }, [location.hash]);

  useEffect(() => {
    if (HASH_TO_CATEGORY[tab]) setCategory(HASH_TO_CATEGORY[tab]);
    if (tab === "all") setCategory("All Categories");
  }, [tab]);

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setHeroImageFailed(false);
  }, [heroIndex]);

  useEffect(() => {
    if (tab !== "all") return;
    setAllCategory("All Categories");
    setAllType("All Types");
    setAllQuery("");
    setAllVerifiedOnly(false);
    setAllViewTab("All Resources");
  }, [tab]);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

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
          tags: [r.category || "resource"],
        }));
        setRemoteResources(list);
      })
      .catch(() => setRemoteResources([]));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    api
      .get("/resources/events")
      .then((res) => {
        if (!mounted) return;
        const list = (res.data?.events || []).map((e) => ({
          id: e._id,
          title: e.title,
          type: e.type || "Event",
          date: e.date,
        }));
        setEvents(list);
      })
      .catch(() => setEvents([]));
    return () => {
      mounted = false;
    };
  }, []);

  const allResources = useMemo(
    () => (remoteResources.length > 0 ? [...RESOURCES, ...remoteResources] : RESOURCES),
    [remoteResources]
  );

  const withAssets = useMemo(
    () =>
      allResources.map((r, i) => ({
        ...r,
        duration: r.duration || `${8 + (i % 53)} min read`,
        image:
          r.image ||
          [
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
          ][i % 6],
      })),
    [allResources]
  );

  const filtered = useMemo(() => {
    let list = withAssets.filter(
      (r) => category === "All Categories" || r.category === category
    );
    list.sort((a, b) => {
      if (a.verified !== b.verified) return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [category, withAssets]);

  const toggleBookmark = (id) => {
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const addToRecentlyViewed = (id) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      const newEntry = { id, timestamp: Date.now() };
      return [newEntry, ...filtered].slice(0, 10);
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

  const saved = withAssets.filter((r) => bookmarks.includes(r.id));

  const recent = withAssets
    .filter((r) => recentlyViewed.some((item) => item.id === r.id))
    .sort((a, b) => {
      const aTime = recentlyViewed.find((item) => item.id === a.id)?.timestamp || 0;
      const bTime = recentlyViewed.find((item) => item.id === b.id)?.timestamp || 0;
      return bTime - aTime;
    });

  const allFiltered = useMemo(() => {
    const q = allQuery.trim().toLowerCase();
    let list = withAssets.filter(
      (r) =>
        (allCategory === "All Categories" || r.category === allCategory) &&
        (allType === "All Types" || r.type === allType) &&
        (!allVerifiedOnly || r.verified) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          (r.description || "").toLowerCase().includes(q) ||
          (r.category || "").toLowerCase().includes(q) ||
          (r.type || "").toLowerCase().includes(q) ||
          (r.tags || []).some((t) => (t || "").toLowerCase().includes(q)))
    );
    list.sort((a, b) => {
      if (a.verified !== b.verified) return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [allCategory, allType, allVerifiedOnly, allQuery, withAssets]);

  const displayedAllResources = useMemo(() => {
    if (allViewTab === "Saved") return saved;
    if (allViewTab === "Recently Viewed") return recent;
    if (allViewTab === "Recommended for You") return allFiltered.slice(0, 9);
    return allFiltered;
  }, [allFiltered, allViewTab, recent, saved]);

  const getDisplayedResources = () => {
    if (tab === "saved") return saved;
    if (tab === "recent") return recent;
    return filtered;
  };

  const displayedResources = getDisplayedResources();
  const heroSlide = HERO_SLIDES[heroIndex];
  const activeCategoryLabel = category === "All Categories" ? "All Resources" : category;
  const categoryDescription = CATEGORY_DESCRIPTIONS[activeCategoryLabel] || CATEGORY_DESCRIPTIONS["All Resources"];
  const metricPool = tab === "saved" || tab === "recent" ? displayedResources : filtered;
  const totalCount = metricPool.length;
  const verifiedCount = metricPool.filter((r) => r.verified).length;
  const bookmarkedCount = metricPool.filter((r) => bookmarks.includes(r.id)).length;

  return (
    <div className="resource-page-shell page-with-header">
      <UserHeader />
      <div className="resource-layout">
        <ResourceSidebar />
        <main className="resource-main-wrap">
          {tab === "all" ? (
            <>
              <section className="all-resource-main-header">
                <h1>Resource Hub</h1>
                <p>Trusted, Verified Knowledge for Women's Safety, Health, and Growth</p>
                <div className="all-resource-toolbar-chips">
                  <button type="button">🌐 Language</button>
                  <button type="button">🔊 Text-to-Speech</button>
                  <button type="button">☀ High Contrast</button>
                </div>
              </section>

              <section className="all-resource-hero-banner">
                <img
                  src={heroImageFailed ? HERO_FALLBACK_IMAGE : heroSlide.image}
                  alt={heroSlide.title}
                  onError={() => setHeroImageFailed(true)}
                />
                <div className="all-resource-hero-overlay">
                  <div className="all-resource-hero-badges">
                    <span>{heroSlide.badge}</span>
                    <span>{heroSlide.category}</span>
                  </div>
                  <h2>{heroSlide.title}</h2>
                  <p>{heroSlide.description}</p>
                  <button type="button">Read More</button>
                </div>
                <button className="all-hero-arrow left" type="button" onClick={() => setHeroIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}>
                  ‹
                </button>
                <button className="all-hero-arrow right" type="button" onClick={() => setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length)}>
                  ›
                </button>
                <div className="all-hero-dots">
                  {HERO_SLIDES.map((s, i) => (
                    <button key={s.id} type="button" className={i === heroIndex ? "active" : ""} onClick={() => setHeroIndex(i)} />
                  ))}
                </div>
              </section>

              <section className="all-resource-search-filter-wrap">
                <div className="all-resource-search-box">
                  <span>⌕</span>
                  <input
                    type="text"
                    value={allQuery}
                    onChange={(e) => setAllQuery(e.target.value)}
                    placeholder="Search resources by title, description, or tags..."
                  />
                </div>
                <select value={allCategory} onChange={(e) => setAllCategory(e.target.value)}>
                  {ALL_PAGE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select value={allType} onChange={(e) => setAllType(e.target.value)}>
                  {ALL_PAGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <label className="all-verified-toggle">
                  <input type="checkbox" checked={allVerifiedOnly} onChange={(e) => setAllVerifiedOnly(e.target.checked)} />
                  <span>Verified Only</span>
                </label>
              </section>

              <section className="all-resource-view-tabs">
                {ALL_PAGE_TABS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={allViewTab === item ? "active" : ""}
                    onClick={() => setAllViewTab(item)}
                  >
                    {item}
                  </button>
                ))}
              </section>

              <div className="all-resource-results-meta">
                <span>Showing {displayedAllResources.length} resources</span>
                <select>
                  <option>Sort by: Most Recent</option>
                  <option>Sort by: A-Z</option>
                </select>
              </div>

              <section className="all-resource-cards-grid">
                {displayedAllResources.map((r) => (
                  <article key={r.id} className="all-resource-hub-card">
                    <div className="all-resource-card-image-wrap">
                      <img src={r.image} alt={r.title} />
                      {r.verified && <span className="verified-mark">✓</span>}
                    </div>
                    <div className="all-resource-card-body">
                      <div className="all-resource-card-top-row">
                        <span className="all-resource-category-badge">{r.category}</span>
                        <span className="all-resource-type">{r.type}</span>
                      </div>
                      <h3>{r.title}</h3>
                      <p>{r.description}</p>
                      <div className="all-resource-card-source-row">
                        <span>Source: {r.source?.name || "SafeHer"}</span>
                        <span>{r.duration}</span>
                      </div>
                      <div className="all-resource-tag-row">
                        {(r.tags || []).slice(0, 3).map((tag) => (
                          <span key={`${r.id}-${tag}`}>{tag}</span>
                        ))}
                      </div>
                      <div className="all-resource-card-actions">
                        <a
                          className="all-resource-open-btn"
                          href={r.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => addToRecentlyViewed(r.id)}
                        >
                          <span>↗</span>
                          Open
                        </a>
                        <button className="all-resource-icon-btn" type="button" onClick={() => share(r)} aria-label="Share resource">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
                            <path d="M8.7 10.9L15.3 7.1M8.7 13.1L15.3 16.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          className={`all-resource-icon-btn ${bookmarks.includes(r.id) ? "active" : ""}`}
                          type="button"
                          onClick={() => toggleBookmark(r.id)}
                          aria-label="Save resource"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarks.includes(r.id) ? "currentColor" : "none"}>
                            <path d="M6 4h12v16l-6-3-6 3V4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              <section className="all-resource-events-strip">
                <div className="all-events-strip-head">
                  <h3>📅 Upcoming Webinars & Events</h3>
                  <button type="button">View All</button>
                </div>
                <div className="all-events-strip-grid">
                  {(events.length > 0
                    ? events.slice(0, 3).map((e) => ({
                        id: e.id,
                        title: e.title,
                        date: new Date(e.date).toLocaleDateString(),
                        type: e.type || "Event",
                      }))
                    : [
                        { id: "e1", title: "Financial Planning Workshop", date: "Mar 15, 2026", type: "Free" },
                        { id: "e2", title: "Career Coaching Session", date: "Mar 18, 2026", type: "Live" },
                        { id: "e3", title: "Mental Health Awareness Week", date: "Mar 20, 2026", type: "Series" },
                      ]
                  ).map((event) => (
                    <article key={event.id} className="all-event-pill-card">
                      <span>{event.type}</span>
                      <h4>{event.title}</h4>
                      <p>{event.date}</p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="resource-category-hero">
                <div className="resource-category-icon-wrap">
                  <span className="resource-category-icon">♡</span>
                </div>
                <div>
                  <h2>{activeCategoryLabel}</h2>
                  <p>{categoryDescription}</p>
                </div>
              </section>

              <section className="resource-metrics-grid">
                <article className="resource-metric-card">
                  <div className="resource-metric-label">Total Resources</div>
                  <div className="resource-metric-value">{totalCount}</div>
                  <span className="resource-metric-icon pink">♡</span>
                </article>
                <article className="resource-metric-card">
                  <div className="resource-metric-label">Verified</div>
                  <div className="resource-metric-value">{verifiedCount}</div>
                  <span className="resource-metric-icon green">✓</span>
                </article>
                <article className="resource-metric-card">
                  <div className="resource-metric-label">Bookmarked</div>
                  <div className="resource-metric-value">{bookmarkedCount}</div>
                  <span className="resource-metric-icon coral">🔖</span>
                </article>
              </section>

              <section className="resource-list-head">
                <h3>Available Resources</h3>
              </section>

              <section className="resource-cards-grid">
                {displayedResources.map((r) => (
                  <article key={r.id} className="resource-hub-card">
                    <div className="resource-card-image-wrap">
                      <img src={r.image} alt={r.title} />
                      {r.verified && <span className="verified-mark">✓</span>}
                    </div>
                    <div className="resource-card-body">
                      <div className="resource-card-top-row">
                        <span className="resource-category-badge">{r.category}</span>
                        <span className={`resource-type-badge ${r.type.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{r.type}</span>
                        {r.verified && <span className="resource-verified-badge">Verified</span>}
                      </div>
                      <h3>{r.title}</h3>
                      <p>{r.description}</p>
                      <div className="resource-card-source-row">
                        <span>Source: {r.source?.name || "SafeHer"}</span>
                      </div>
                      <div className="resource-card-actions">
                        <a
                          className="resource-open-btn"
                          href={r.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => addToRecentlyViewed(r.id)}
                        >
                          <span>↗</span>
                          Open
                        </a>
                        <button className="resource-icon-btn" type="button" onClick={() => share(r)} aria-label="Share resource">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
                            <path d="M8.7 10.9L15.3 7.1M8.7 13.1L15.3 16.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          className={`resource-icon-btn ${bookmarks.includes(r.id) ? "active" : ""}`}
                          type="button"
                          onClick={() => toggleBookmark(r.id)}
                          aria-label="Save resource"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarks.includes(r.id) ? "currentColor" : "none"}>
                            <path d="M6 4h12v16l-6-3-6 3V4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {r.type === "PDF" && (
                          <button className="resource-icon-btn" type="button" onClick={() => downloadIfPdf(r)} aria-label="Download PDF">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M12 3v11m0 0l4-4m-4 4l-4-4M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
                {displayedResources.length === 0 && (
                  <div className="resource-empty-state">
                    <h4>No resources found</h4>
                    <p>Try another category from the sidebar.</p>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
