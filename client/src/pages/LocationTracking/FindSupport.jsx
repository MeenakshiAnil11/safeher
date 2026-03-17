import React, { useEffect, useMemo, useState } from "react";
import { GoogleMap, InfoWindow, LoadScript, Marker } from "@react-google-maps/api";
import "./FindSupport.css";

const RADIUS_STEPS = [2500, 5000, 10000, 20000];
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

const haversineKm = (from, to) => {
  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export default function FindSupport() {
  const [supportItems, setSupportItems] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchNotice, setSearchNotice] = useState("");
  const [activeRadius, setActiveRadius] = useState(RADIUS_STEPS[0]);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (geoError) => {
        if (geoError?.code === 1) {
          setError("Location permission denied. Please allow location access.");
        } else {
          setError("Unable to access your location right now.");
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, []);

  const classifySupportType = (tags = {}) => {
    const amenity = String(tags.amenity || "").toLowerCase();
    const office = String(tags.office || "").toLowerCase();
    const socialFacility = String(tags.social_facility || "").toLowerCase();
    if (amenity === "police") return "Police";
    if (amenity === "hospital") return "Hospital";
    if (amenity === "shelter") return "NGO";
    if (amenity === "social_facility" || socialFacility.includes("shelter")) return "NGO";
    if (office === "ngo") return "NGO";
    return "NGO";
  };

  const fetchSupportCenters = async (location) => {
    setLoading(true);
    setError("");
    setSearchNotice("");

    try {
      for (let i = 0; i < RADIUS_STEPS.length; i += 1) {
        const radius = RADIUS_STEPS[i];
        setActiveRadius(radius);
        if (i > 0) {
          setSearchNotice("No support centers found nearby. Expanding search...");
        }

        const query = `
          [out:json][timeout:30];
          (
            node["amenity"="police"](around:${radius},${location.lat},${location.lng});
            way["amenity"="police"](around:${radius},${location.lat},${location.lng});
            node["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
            way["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
            node["amenity"="social_facility"](around:${radius},${location.lat},${location.lng});
            way["amenity"="social_facility"](around:${radius},${location.lat},${location.lng});
            node["amenity"="shelter"](around:${radius},${location.lat},${location.lng});
            way["amenity"="shelter"](around:${radius},${location.lat},${location.lng});
            node["office"="ngo"](around:${radius},${location.lat},${location.lng});
            way["office"="ngo"](around:${radius},${location.lat},${location.lng});
          );
          out center tags 200;
        `;

        const response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: new URLSearchParams({ data: query }).toString(),
        });

        if (!response.ok) continue;
        const data = await response.json();
        const elements = Array.isArray(data?.elements) ? data.elements : [];
        const mapped = elements
          .map((element, index) => {
            const lat = element.lat ?? element.center?.lat;
            const lng = element.lon ?? element.center?.lon;
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            const tags = element.tags || {};
            const type = classifySupportType(tags);
            const distanceKm = haversineKm(location, { lat, lng });
            return {
              id: `${element.type}-${element.id || index}`,
              name: tags.name || `${type} Center`,
              type,
              address: tags["addr:full"] || tags["addr:street"] || "Address unavailable",
              distanceKm,
              lat,
              lng,
              phone: tags.phone || "",
            };
          })
          .filter(Boolean);

        const unique = Array.from(new Map(mapped.map((item) => [item.id, item])).values()).sort(
          (a, b) => a.distanceKm - b.distanceKm
        );

        if (unique.length > 0) {
          setSupportItems(unique);
          setSearchNotice("");
          setLoading(false);
          return;
        }
      }

      setSupportItems([]);
      setError("No support centers found nearby.");
    } catch (fetchError) {
      setError("Could not load support centers right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      fetchSupportCenters(userLocation);
    }
  }, [userLocation]);

  const nearestSupportItems = useMemo(
    () => [...supportItems].sort((a, b) => a.distanceKm - b.distanceKm),
    [supportItems]
  );

  useEffect(() => {
    if (!userLocation) return undefined;
    const interval = window.setInterval(() => {
      fetchSupportCenters(userLocation);
    }, 60000);
    return () => window.clearInterval(interval);
  }, [userLocation]);

  const markerColorForType = (type) => {
    if (type === "Police") return "#2563eb";
    if (type === "Hospital") return "#dc2626";
    return "#059669";
  };

  const markerIconForType = (type) => {
    const color = markerColorForType(type);
    const svg = `
      <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="12" fill="${color}" stroke="#ffffff" stroke-width="3" />
        <circle cx="14" cy="14" r="4.5" fill="#ffffff" />
      </svg>
    `;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: window.google ? new window.google.maps.Size(28, 28) : undefined,
      anchor: window.google ? new window.google.maps.Point(14, 14) : undefined,
    };
  };

  useEffect(() => {
    if (!mapInstance || !window.google?.maps || !userLocation) return;
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(userLocation);
    supportItems.forEach((item) => bounds.extend({ lat: item.lat, lng: item.lng }));
    if (supportItems.length > 0) {
      mapInstance.fitBounds(bounds);
    } else {
      mapInstance.panTo(userLocation);
      mapInstance.setZoom(14);
    }
  }, [mapInstance, supportItems, userLocation]);

  const openDirections = (item) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`, "_blank");
  };

  const openCall = (item) => {
    if (!item.phone) return;
    window.open(`tel:${item.phone.replace(/\s+/g, "")}`, "_self");
  };

  const isMapReady = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY";

  return (
    <section className="find-support-page">
      <header className="find-support-head">
        <h1>Find Support</h1>
        <p>Access nearby police, hospitals, NGOs, and shelters from live map data</p>
      </header>

      <section className="find-support-alert">
        <div>
          <h2>Nearby Support Discovery</h2>
          <p>Radius: {activeRadius}m {searchNotice ? `· ${searchNotice}` : ""}</p>
        </div>
        <div className="find-support-alert-actions helpline-actions">
          <a className="helpline-btn emergency" href="tel:112" aria-label="Call 112 Emergency">
            <strong>112</strong>
            <span>24/7 Emergency</span>
          </a>
          <a className="helpline-btn women" href="tel:1091" aria-label="Call 1091 Women Helpline">
            <strong>1091</strong>
            <span>Women Helpline</span>
          </a>
          <a className="helpline-btn support" href="tel:181" aria-label="Call 181 Women Support">
            <strong>181</strong>
            <span>Women Safety Support</span>
          </a>
          <a className="helpline-btn medical" href="tel:108" aria-label="Call 108 Ambulance">
            <strong>108</strong>
            <span>Ambulance</span>
          </a>
          <button type="button" className="helpline-refresh-btn" onClick={() => userLocation && fetchSupportCenters(userLocation)}>
            🔄 Refresh Results
          </button>
        </div>
      </section>

      {error ? <div className="find-support-error">{error}</div> : null}

      <div className="find-support-grid">
        <article className="find-support-map-card">
          <div className="find-support-tags">
            {nearestSupportItems.slice(0, 3).map((item) => (
              <span key={item.id}>
                {item.type === "Police" ? "🛡️" : item.type === "Hospital" ? "🏥" : "🏠"} {item.name}
              </span>
            ))}
          </div>

          <div className="find-support-map-wrap">
            {!isMapReady ? (
              <div className="find-support-empty">Add `REACT_APP_GOOGLE_MAPS_API_KEY` to render map.</div>
            ) : (
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "520px", borderRadius: "12px" }}
                  center={userLocation || { lat: 20.5937, lng: 78.9629 }}
                  zoom={userLocation ? 14 : 5}
                  onLoad={setMapInstance}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                  }}
                >
                  {userLocation ? (
                    <Marker
                      position={userLocation}
                      title="Your Location"
                      icon={{
                        path: window.google?.maps?.SymbolPath?.CIRCLE,
                        fillColor: "#6C63FF",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                        scale: 7,
                      }}
                      label={{ text: "You", color: "#fff", fontSize: "10px", fontWeight: "700" }}
                    />
                  ) : null}
                  {supportItems.map((item) => (
                    <Marker
                      key={item.id}
                      position={{ lat: item.lat, lng: item.lng }}
                      title={`${item.type}: ${item.name}`}
                      icon={markerIconForType(item.type)}
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
                  {selectedItem ? (
                    <InfoWindow
                      position={{ lat: selectedItem.lat, lng: selectedItem.lng }}
                      onCloseClick={() => setSelectedItem(null)}
                    >
                      <div className="find-support-infowindow">
                        <h4>{selectedItem.name}</h4>
                        <p>{selectedItem.type}</p>
                      </div>
                    </InfoWindow>
                  ) : null}
                </GoogleMap>
              </LoadScript>
            )}
          </div>
        </article>

        <aside className="find-support-directory">
          <h2>Support Directory ({nearestSupportItems.length})</h2>
          <div className="find-support-list">
            {loading ? (
              <div className="find-support-skeleton" aria-hidden="true">
                {[1, 2, 3].map((idx) => (
                  <article className="find-support-skeleton-card" key={idx}>
                    <div className="skeleton-line skeleton-line-lg" />
                    <div className="skeleton-line skeleton-line-md" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-line-sm" />
                  </article>
                ))}
              </div>
            ) : nearestSupportItems.length === 0 ? (
              <div className="find-support-empty">No support centers found nearby. Expanding search...</div>
            ) : (
              nearestSupportItems.map((item) => (
              <article className="find-support-item" key={item.id}>
                <h3>{item.name}</h3>
                <small>{item.type}</small>
                <p className="address">⌖ {item.address}</p>
                <p className="meta-row">
                  <span>Distance:</span>
                  <strong>{item.distanceKm.toFixed(1)} km</strong>
                </p>
                <p className="meta-row">
                  <span>Location:</span>
                  <strong>{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</strong>
                </p>
                <div className="find-support-actions">
                  {item.phone ? (
                    <button
                      type="button"
                      className="call-now"
                      onClick={() => openCall(item)}
                    >
                      📞 Call
                    </button>
                  ) : null}
                  <button type="button" className="navigate" onClick={() => openDirections(item)}>
                    ↗ Navigate
                  </button>
                </div>
              </article>
              ))
            )}
          </div>
        </aside>
      </div>

    </section>
  );
}
