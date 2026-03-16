// client/src/pages/Helplines.jsx
import React, { useEffect, useMemo, useState } from "react";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import HelplinesSidebar from "../components/HelplinesSidebar";
import api from "../services/api";
import "./helplines.css";
import "../components/helplinesSidebar.css";

// Static helplines - Women-focused contacts only
const HELPLINES = [
  // Emergency Services for Women
  {
    id: "police-100",
    name: "Police - Emergency",
    number: "100",
    category: "Emergency",
    verified: true,
    availability: "24/7",
    description: {
      en: "Police emergency service for immediate safety and assistance in emergencies.",
      hi: "तत्काल सहायता और आपातकालीन सुरक्षा के लिए पुलिस आपातकालीन सेवा।",
    },
    whatsapp: null,
  },
  {
    id: "ambulance-108",
    name: "Ambulance - Medical Emergency",
    number: "108",
    category: "Health",
    verified: true,
    availability: "24/7",
    description: {
      en: "Emergency medical ambulance service for health emergencies.",
      hi: "स्वास्थ्य आपातकाल के लिए आपातकालीन चिकित्सा एम्बुलेंस सेवा।",
    },
    whatsapp: null,
  },
  // Women-specific support
  {
    id: "women-181",
    name: "Women Helpline",
    number: "181",
    category: "Women",
    verified: true,
    availability: "24/7",
    description: {
      en: "National women helpline for women in distress and seeking support.",
      hi: "संकट में महिलाओं के लिए राष्ट्रीय महिला हेल्पलाइन।",
    },
    whatsapp: null,
  },
  {
    id: "domestic-1091",
    name: "Domestic Violence Helpline",
    number: "1091",
    category: "Legal",
    verified: true,
    availability: "24/7",
    description: {
      en: "Support for domestic violence victims, abuse, and harassment cases.",
      hi: "घरेलू हिंसा, दुर्व्यवहार और उत्पीड़न के पीड़ितों के लिए सहायता।",
    },
    whatsapp: null,
  },
  // Mental health and psychological support
  {
    id: "mental-9152987821",
    name: "Suicide Prevention Support",
    number: "+91 9152987821",
    category: "Psychological",
    verified: true,
    availability: "24/7",
    description: {
      en: "Mental health support, counseling, and suicide prevention for women.",
      hi: "महिलाओं के लिए मानसिक स्वास्थ्य सहायता और आत्महत्या रोकथाम।",
    },
    whatsapp: null,
  },
  // Women's support NGO
  {
    id: "ngo-sakhi",
    name: "Sakhi Women Support",
    number: "+91 9000000000",
    category: "NGO",
    verified: false,
    availability: "10:00–18:00",
    description: {
      en: "NGO offering legal aid, counseling, and support for women's issues.",
      hi: "महिलाओं के मुद्दों के लिए कानूनी सहायता, परामर्श और सहायता प्रदान करने वाला एनजीओ।",
    },
    whatsapp: "+919000000000",
  },
];

const CATEGORIES = [
  "All",
  "Emergency",
  "Health",
  "Women",
  "Legal",
  "Psychological",
  "NGO",
];

const FAVORITES_KEY = "safeher_favorites";

export default function Helplines() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("");
  const [availability, setAvailability] = useState("");
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(false);
  const [myLocation, setMyLocation] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState(null);
  const [locError, setLocError] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [remoteHelplines, setRemoteHelplines] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'favorites', 'recent', 'mostCalled'
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [manualAddress, setManualAddress] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Load active helplines from server (public)
  useEffect(() => {
    let mounted = true;
    api
      .get("/helplines")
      .then((res) => {
        if (!mounted) return;
        const list = (res.data?.helplines || []).map((h) => ({
          id: h._id || `${h.name}-${h.number}`,
          name: h.name,
          number: h.number,
          category: (h.category || "other").toString().replace(/^./, (c) => c.toUpperCase()),
          verified: true,
          availability: "24/7",
          description: { en: h.notes || h.name, hi: h.notes || h.name },
          whatsapp: null,
        }));
        setRemoteHelplines(list);
      })
      .catch(() => setRemoteHelplines([]));
    return () => {
      mounted = false;
    };
  }, []);

  // Geolocation with retry mechanism (uses GPS)
  const requestLocation = (attempt = 0) => {
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported on this device");
      return;
    }
    setLocLoading(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const accuracy = Math.round(pos.coords.accuracy);
        setCoords({ 
          lat: pos.coords.latitude, 
          lon: pos.coords.longitude 
        });
        setLocationAccuracy(accuracy);
        setRetryCount(0);
        setLocLoading(false);
      },
      (err) => {
        if (attempt < 2) {
          setLocError(`Retrying... (Attempt ${attempt + 2}/3)`);
          setTimeout(() => requestLocation(attempt + 1), 2000);
        } else {
          setCoords(null);
          setLocLoading(false);
          setLocError("Unable to get precise GPS location. Use manual address search or try again in an open area.");
          setRetryCount(0);
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 30000, 
        maximumAge: 0 
      }
    );
  };

  // Reverse geocode to human-readable address (best-effort)
  useEffect(() => {
    if (!coords) {
      setAddress(null);
      return;
    }
    const controller = new AbortController();
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lon}`;
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setAddress(d?.display_name || null))
      .catch(() => setAddress(null));
    return () => controller.abort();
  }, [coords]);

  // Sync myLocation with geolocation request
  useEffect(() => {
    if (myLocation && !coords) {
      requestLocation();
    }
  }, [myLocation]);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    return () => document.body.classList.remove('dark');
  }, [darkMode]);

  const handleFilterChange = (filters) => {
    setCategory(filters.category || "All");
    setRegion(filters.region || "");
    setAvailability(filters.availability || "");
    setLanguage(filters.language || "en");
  };

  const handleSearch = (term) => {
    setQuery(term);
  };

  // Export CSV handler (basic implementation)
  const handleExport = (type) => {
    if (type === 'csv') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + filtered.map(h => `"${h.name}","${h.number}","${h.category}","${h.availability}","${h.description.en}"`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "helplines.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // PDF can be added later with jsPDF
  };

  // Filtered list (merge remote + static fallback)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Merge static defaults with backend-provided helplines so users always see all key numbers
    const base = remoteHelplines.length > 0 ? [...HELPLINES, ...remoteHelplines] : HELPLINES;
    let list = base.filter((h) => {
      const matchesCategory = category === "All" || h.category === category;
      const matchesQuery = !q ||
        h.name.toLowerCase().includes(q) ||
        h.number.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q);
      const matchesRegion = !region.trim() ||
        h.name.toLowerCase().includes(region.toLowerCase()) ||
        (h.description.en && h.description.en.toLowerCase().includes(region.toLowerCase())) ||
        (h.description.hi && h.description.hi.toLowerCase().includes(region.toLowerCase()));
      const matchesAvailability = !availability || h.availability === availability;
      const matchesViewMode = viewMode === 'favorites' ? favorites.includes(h.id) : true;
      return matchesCategory && matchesQuery && matchesRegion && matchesAvailability && matchesViewMode;
    });

    // Sort: favorites first, then verified, then name
    list.sort((a, b) => {
      const favA = favorites.includes(a.id) ? 1 : 0;
      const favB = favorites.includes(b.id) ? 1 : 0;
      if (favA !== favB) return favB - favA;
      if (a.verified !== b.verified) return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [query, category, region, availability, favorites, remoteHelplines, language, viewMode]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const smsLink = (h) => {
    const message = encodeURIComponent(
      `SOS: I need help. Contact: ${h.name} ${h.number}. My location: (share from phone).`
    );
    // sms URI scheme varies; this generic format works on most phones
    return `sms:?&body=${message}`;
  };

  const mapsNearbyUrl = (term) => {
    if (coords?.lat && coords?.lon) {
      // Use precise coordinates when available for better results
      return `https://www.google.com/maps/search/${encodeURIComponent(term)}/@${coords.lat},${coords.lon},15z`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(term)}+near+me`;
  };

  const handleShowFavorites = () => {
    setViewMode('favorites');
  };

  const handleShowRecent = () => {
    setViewMode('recent');
  };

  const handleShowMostCalled = () => {
    setViewMode('mostCalled');
  };

  return (
    <div className="helplines-page page-with-header">
      <UserHeader />

      <div className="helplines-layout">
        <HelplinesSidebar
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          myLocation={myLocation}
          onMyLocationChange={setMyLocation}
          darkMode={darkMode}
          onDarkModeChange={setDarkMode}
          language={language}
          onLanguageChange={setLanguage}
          onShowFavorites={handleShowFavorites}
          onShowRecent={handleShowRecent}
          onShowMostCalled={handleShowMostCalled}
        />

        <div className="helplines-main">
          <div className="hl-head container">
            <div>
              <h1 className="page-title">Helpline Directory</h1>
              <p className="page-subtitle">
                Centralized, verified access to emergency and support services.
              </p>
            </div>
            <div className="hl-head-actions">
              <button className="btn danger" onClick={() => (window.location.href = "tel:100")}>🚨 Call Police 100</button>
              <a className="btn ghost" href={mapsNearbyUrl("police station")} target="_blank" rel="noreferrer">Nearby Police</a>
              <button className="btn ghost" onClick={requestLocation}>Use GPS</button>
            </div>
          </div>

          {(coords || locLoading || locError) && (
            <section className="container nearby">
              <div className="nearby-card">
                <div>
                  <h3>Localized Support</h3>
                  {locLoading && <p>Detecting your location…</p>}
                  {!locLoading && coords && (
                    <>
                      <p>
                        Location: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                        {address ? ` — ${address}` : ""}
                      </p>
                      <p>Get directions to nearby services:</p>
                    </>
                  )}
                  {!locLoading && locError && (
                    <p className="error">{locError}</p>
                  )}
                </div>
                <div className="nearby-actions">
                  <a className="btn small" href={mapsNearbyUrl("police station")} target="_blank" rel="noreferrer">Police Stations</a>
                  <a className="btn small" href={mapsNearbyUrl("hospital")} target="_blank" rel="noreferrer">Hospitals</a>
                  <a className="btn small" href={mapsNearbyUrl("ngo women support")} target="_blank" rel="noreferrer">NGOs</a>
                </div>
              </div>
            </section>
          )}

          <section className="container list-wrap">
            {filtered.length === 0 ? (
              <div className="empty">No helplines found. Try another search or category.</div>
            ) : (
              <ul className="hl-list">
                {filtered.map((h) => (
                  <li key={h.id} className="hl-item">
                    <div className="hl-main">
                      <div className="hl-title">
                        <span className="hl-name">{h.name}</span>
                        {h.verified && <span className="verified">✅ Verified</span>}
                        <span className={`pill ${h.category.toLowerCase()}`}>{h.category}</span>
                      </div>
                      <div className="hl-desc">
                        {h.description[language] || h.description.en}
                      </div>
                      <div className="hl-meta">
                        <span>Availability: {h.availability}</span>
                        <span>Contact: {h.number}</span>
                      </div>
                    </div>
                    <div className="hl-actions">
                      <a href={`tel:${h.number.replace(/\s/g, "")}`} className="btn primary small">📞 Call</a>
                      {h.whatsapp && (
                        <a
                          className="btn ghost small"
                          href={`https://wa.me/${h.whatsapp.replace(/\+/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                      <a className="btn ghost small" href={smsLink(h)}>📩 SOS SMS</a>
                      <button
                        className={`btn small ${favorites.includes(h.id) ? "fav" : ""}`}
                        onClick={() => toggleFavorite(h.id)}
                        title="Toggle favorite"
                      >
                        {favorites.includes(h.id) ? "★ Favorite" : "☆ Favorite"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <a className="floating-sos" href="tel:100" title="Emergency Police 100">🚨</a>

      <Footer />
    </div>
  );
}