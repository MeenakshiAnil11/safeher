import React, { useEffect, useMemo, useState } from "react";
import { GoogleMap, InfoWindow, LoadScript, Marker } from "@react-google-maps/api";
import "./ExploreNearby.css";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";
const SEARCH_RADIUS_METERS = 2000;
const SEARCH_RADIUS_STEPS = [SEARCH_RADIUS_METERS, 5000, 10000];
const RESOURCE_TYPES = ["police", "hospital", "pharmacy", "cafe"];

const TYPE_CONFIG = {
  hospital: { label: "Hospital", icon: "🏥" },
  police: { label: "Police", icon: "🛡️" },
  pharmacy: { label: "Pharmacy", icon: "💊" },
  cafe: { label: "Safe Cafe", icon: "☕" },
};

const FILTER_CHIPS = [
  { type: "police", label: "Police Stations" },
  { type: "hospital", label: "Hospitals" },
  { type: "pharmacy", label: "Pharmacies" },
  { type: "cafe", label: "Safe Cafes" },
];

const libraries = ["places"];

const getDistanceKm = (from, to) => {
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

const normalizePlace = (place, userLocation, type) => {
  const lat = place.geometry?.location?.lat();
  const lng = place.geometry?.location?.lng();
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  const distanceKm = getDistanceKm(userLocation, { lat, lng });
  return {
    id: `${type}-${place.place_id}`,
    placeId: place.place_id,
    name: place.name || "Unknown Place",
    type,
    typeLabel: TYPE_CONFIG[type].label,
    icon: TYPE_CONFIG[type].icon,
    address: place.vicinity || place.formatted_address || "Address unavailable",
    phone: null,
    isOpenNow: place.opening_hours?.open_now ?? null,
    distanceKm,
    lat,
    lng,
  };
};

const getMarkerColor = (type) => {
  if (type === "hospital") return "#dc2626";
  if (type === "police") return "#2563eb";
  if (type === "pharmacy") return "#7c3aed";
  if (type === "cafe") return "#059669";
  return "#6b7280";
};

const createCategoryMarkerIcon = (type) => {
  const color = getMarkerColor(type);
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

export default function ExploreNearby() {
  const [activeTypes, setActiveTypes] = useState(RESOURCE_TYPES);
  const [sortMode, setSortMode] = useState("nearest");
  const [mapRef, setMapRef] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchNotice, setSearchNotice] = useState("");
  const [phoneLoadingId, setPhoneLoadingId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [activeRadius, setActiveRadius] = useState(SEARCH_RADIUS_METERS);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("safeher_saved_places") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const enrichPlace = (place) => {
    const safetyBase = {
      police: 88,
      hospital: 82,
      pharmacy: 72,
      cafe: 65,
    }[place.type] || 60;
    const openBonus = place.isOpenNow === true ? 8 : place.isOpenNow === false ? -6 : 0;
    const distancePenalty = Math.min(18, Math.round((place.distanceKm || 0) * 3.2));
    const score = Math.max(35, Math.min(98, safetyBase + openBonus - distancePenalty));
    const tone = score >= 75 ? "safe" : score >= 55 ? "moderate" : "risky";
    return {
      ...place,
      rating: Number(place.rating || place.user_ratings_total ? place.rating : 0) || 0,
      safetyScore: score,
      safetyTone: tone,
    };
  };

  const filteredItems = useMemo(() => {
    const base = nearbyLocations.filter((item) => activeTypes.includes(item.type));
    if (sortMode === "safest") {
      return [...base].sort((a, b) => (b.safetyScore || 0) - (a.safetyScore || 0));
    }
    if (sortMode === "highest-rated") {
      return [...base].sort((a, b) => (b.rating || b.safetyScore || 0) - (a.rating || a.safetyScore || 0));
    }
    return [...base].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [activeTypes, nearbyLocations, sortMode]);

  const insights = useMemo(() => {
    const hospitals = nearbyLocations.filter((item) => item.type === "hospital").length;
    const police = nearbyLocations.filter((item) => item.type === "police").length;
    const avgSafety = nearbyLocations.length
      ? nearbyLocations.reduce((sum, item) => sum + (item.safetyScore || 0), 0) / nearbyLocations.length
      : 0;
    const riskLevel = avgSafety >= 75 ? "Low Risk" : avgSafety >= 55 ? "Moderate Risk" : "Elevated Risk";
    return {
      hospitals,
      police,
      riskLevel,
      riskTone: avgSafety >= 75 ? "safe" : avgSafety >= 55 ? "moderate" : "risky",
    };
  }, [nearbyLocations]);

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setError("");
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationAccuracy(position.coords.accuracy ?? null);
      },
      (geoError) => {
        if (geoError?.code === 1) {
          setError("Location permission denied. Please allow location access in browser settings.");
          return;
        }
        setError("Unable to fetch your current location. Please try again.");
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestCurrentLocation();
  }, []);

  const fetchNearbyForType = (service, request) =>
    new Promise((resolve) => {
      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && Array.isArray(results)) {
          resolve({ results, status });
          return;
        }
        resolve({ results: [], status });
      });
    });

  const fetchTextFallbackForType = (service, location, type) =>
    new Promise((resolve) => {
      const queryByType = {
        hospital: "hospitals near me",
        police: "police station near me",
        pharmacy: "pharmacy near me",
        cafe: "safe cafe near me",
      };
      service.textSearch(
        {
          location,
          radius: SEARCH_RADIUS_METERS,
          query: queryByType[type] || `${type} near me`,
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && Array.isArray(results)) {
            resolve({ results, status });
            return;
          }
          resolve({ results: [], status });
        }
      );
    });

  const fetchOverpassForType = async (location, type, radiusMeters) => {
    const overpassTypeQuery = {
      police: '["amenity"="police"]',
      hospital: '["amenity"="hospital"]',
      pharmacy: '["amenity"="pharmacy"]',
      cafe: '["amenity"="cafe"]',
    };
    const query = `
      [out:json][timeout:25];
      (
        node${overpassTypeQuery[type]}(around:${radiusMeters},${location.lat},${location.lng});
        way${overpassTypeQuery[type]}(around:${radiusMeters},${location.lat},${location.lng});
      );
      out center 80;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams({ data: query }).toString(),
    });

    if (!response.ok) return [];
    const data = await response.json();
    const elements = Array.isArray(data?.elements) ? data.elements : [];

    return elements
      .map((element, index) => {
        const lat = element.lat ?? element.center?.lat;
        const lng = element.lon ?? element.center?.lon;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const distanceKm = getDistanceKm(location, { lat, lng });
        return {
          id: `${type}-osm-${element.id || index}`,
          placeId: `${type}-osm-${element.id || index}`,
          name: element.tags?.name || TYPE_CONFIG[type].label,
          type,
          typeLabel: TYPE_CONFIG[type].label,
          icon: TYPE_CONFIG[type].icon,
          address: element.tags?.["addr:full"] || element.tags?.["addr:street"] || "Address unavailable",
          phone: element.tags?.phone || null,
          isOpenNow: null,
          distanceKm,
          lat,
          lng,
        };
      })
      .filter(Boolean);
  };

  const fitMapBounds = (locations) => {
    if (!mapRef || !window.google?.maps) return;
    if (!Array.isArray(locations) || locations.length === 0) {
      if (userLocation) {
        mapRef.panTo(userLocation);
        mapRef.setZoom(14);
      }
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    if (userLocation) bounds.extend(userLocation);
    locations.forEach((item) => bounds.extend({ lat: item.lat, lng: item.lng }));
    mapRef.fitBounds(bounds);
  };

  const loadNearbyPlaces = async (mapInstance, location) => {
    if (!mapInstance || !location || !window.google?.maps?.places) return;
    setLoading(true);
    setError("");
    setSearchNotice("");
    try {
      const service = new window.google.maps.places.PlacesService(mapInstance);

      for (let i = 0; i < SEARCH_RADIUS_STEPS.length; i += 1) {
        const radius = SEARCH_RADIUS_STEPS[i];
        setActiveRadius(radius);
        if (i > 0) {
          setSearchNotice("No nearby places found. Expanding search radius...");
        }

        const byTypeResults = await Promise.all(
          RESOURCE_TYPES.map(async (type) => {
            const nearbyResult = await fetchNearbyForType(service, {
              location,
              radius,
              type,
            });
            const fallbackResult =
              nearbyResult.results.length === 0
                ? await fetchTextFallbackForType(service, location, type)
                : { results: [], status: "SKIPPED" };
            const rawResults = nearbyResult.results.length ? nearbyResult.results : fallbackResult.results;

            const normalized = rawResults
              .map((place) => normalizePlace(place, location, type))
              .filter(Boolean)
              .map((place) => enrichPlace({ ...place, rating: Number(place.rating) || 0 }));

            const sorted =
              type === "cafe"
                ? normalized.sort((a, b) => {
                    const safeA = /(safe|women|family|secure)/i.test(`${a.name || ""} ${a.address || ""}`) ? 1 : 0;
                    const safeB = /(safe|women|family|secure)/i.test(`${b.name || ""} ${b.address || ""}`) ? 1 : 0;
                    return safeB - safeA;
                  })
                : normalized;

            return {
              type,
              status: nearbyResult.status,
              results: sorted,
            };
          })
        );

        let merged = byTypeResults.flatMap((entry) => entry.results);

        if (merged.length === 0) {
          const osmByType = await Promise.all(
            RESOURCE_TYPES.map(async (type) => fetchOverpassForType(location, type, radius))
          );
          merged = osmByType.flat().map((item) => enrichPlace(item));
        }

        const uniqueByPlaceId = Array.from(new Map(merged.map((item) => [item.placeId, item])).values());
        const statuses = byTypeResults.map((entry) => entry.status);
        if (
          uniqueByPlaceId.length === 0 &&
          statuses.every((s) => s === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED)
        ) {
          setError("Places API request denied. Enable Places API + billing and allow this domain in API key restrictions.");
          break;
        }

        if (uniqueByPlaceId.length > 0) {
          setNearbyLocations(uniqueByPlaceId);
          setSearchNotice("");
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(location);
          uniqueByPlaceId.forEach((item) => bounds.extend({ lat: item.lat, lng: item.lng }));
          mapInstance.fitBounds(bounds);
          return;
        }
      }

      setNearbyLocations([]);
      mapInstance.panTo(location);
      mapInstance.setZoom(14);
      setError("No nearby places found. Try expanding search radius.");
    } catch (e) {
      console.error("Failed to fetch nearby places:", e);
      setError("Could not load nearby places right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleMapLoad = (mapInstance) => {
    setMapRef(mapInstance);
    if (userLocation) {
      loadNearbyPlaces(mapInstance, userLocation);
    }
  };

  useEffect(() => {
    if (mapRef && userLocation) {
      loadNearbyPlaces(mapRef, userLocation);
    }
  }, [mapRef, userLocation]);

  useEffect(() => {
    fitMapBounds(filteredItems);
  }, [mapRef, filteredItems, userLocation]);

  const fetchPhoneNumber = (locationItem) => {
    if (!mapRef || !window.google?.maps?.places || locationItem.phone) return;
    setPhoneLoadingId(locationItem.id);
    const service = new window.google.maps.places.PlacesService(mapRef);
    service.getDetails(
      {
        placeId: locationItem.placeId,
        fields: ["formatted_phone_number"],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.formatted_phone_number) {
          setNearbyLocations((prev) =>
            prev.map((item) =>
              item.id === locationItem.id ? { ...item, phone: place.formatted_phone_number } : item
            )
          );
        }
        setPhoneLoadingId(null);
      }
    );
  };

  const handleMarkerClick = (item) => {
    setSelectedLocation(item);
    if (!item.phone) {
      fetchPhoneNumber(item);
    }
  };

  const getDirectionsLink = (item) =>
    `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;

  const openCall = (item) => {
    if (!item.phone) return;
    window.open(`tel:${item.phone.replace(/\s+/g, "")}`, "_self");
  };

  const toggleSave = (item) => {
    setSavedIds((prev) => {
      const next = prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id];
      localStorage.setItem("safeher_saved_places", JSON.stringify(next));
      return next;
    });
  };

  const isApiConfigured = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY";

  const toggleType = (type) => {
    setActiveTypes((prev) => {
      if (prev.includes(type)) {
        const next = prev.filter((t) => t !== type);
        return next.length === 0 ? prev : next;
      }
      return [...prev, type];
    });
  };

  return (
    <section className="explore-nearby-page">
      <div className="explore-nearby-header">
        <h1>Explore Nearby</h1>
        <p>Find safe spaces and emergency services around you</p>
      </div>

      <div className="explore-nearby-filter-row">
        <span className="explore-nearby-filter-label">⌯ Categories:</span>
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.type}
            type="button"
            className={`explore-nearby-chip ${activeTypes.includes(chip.type) ? "active" : ""}`}
            onClick={() => toggleType(chip.type)}
          >
            {chip.label}
          </button>
        ))}
        <button
          type="button"
          className="explore-nearby-chip reset"
          onClick={() => setActiveTypes(RESOURCE_TYPES)}
        >
          Show All
        </button>
        <button type="button" className="explore-nearby-refresh" onClick={requestCurrentLocation}>
          Refresh Location
        </button>
      </div>
      {userLocation ? (
        <div className="explore-nearby-location-bar">
          <span>
            Your location: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
          </span>
          <span>
            Accuracy: {locationAccuracy ? `±${Math.round(locationAccuracy)}m` : "N/A"} · Radius: {activeRadius}m
          </span>
        </div>
      ) : null}

      <div className="explore-nearby-grid explore-layout">
        <article className="explore-nearby-map-card">
          <div className="safety-insights-row">
            <div className="insight-chip">
              <strong>{insights.hospitals}</strong>
              <span>Nearby hospitals</span>
            </div>
            <div className="insight-chip">
              <strong>{insights.police}</strong>
              <span>Police stations</span>
            </div>
            <div className={`insight-chip tone-${insights.riskTone}`}>
              <strong>{insights.riskLevel}</strong>
              <span>Area risk level</span>
            </div>
          </div>
          <div className="explore-nearby-legend">
            <span><i className="legend-dot hospital" /> Hospital</span>
            <span><i className="legend-dot police" /> Police</span>
            <span><i className="legend-dot pharmacy" /> Pharmacy</span>
            <span><i className="legend-dot cafe" /> Safe Cafe</span>
            <span><i className="legend-dot you" /> You</span>
          </div>
          {!isApiConfigured ? (
            <div className="explore-nearby-map-center">
              <div className="map-pin">🗺️</div>
              <h3>Google Maps API key missing</h3>
              <p>Add `REACT_APP_GOOGLE_MAPS_API_KEY` to load live nearby places.</p>
            </div>
          ) : (
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "520px", borderRadius: "14px" }}
                center={userLocation || { lat: 20.5937, lng: 78.9629 }}
                zoom={userLocation ? 14 : 5}
                onLoad={handleMapLoad}
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
                      path: window.google?.maps.SymbolPath.CIRCLE,
                      fillColor: "#2563eb",
                      fillOpacity: 1,
                      strokeColor: "#ffffff",
                      strokeWeight: 2,
                      scale: 7,
                    }}
                    label={{ text: "You", color: "#fff", fontSize: "10px", fontWeight: "700" }}
                  />
                ) : null}
                {filteredItems.map((item) => (
                  <Marker
                    key={item.id}
                    position={{ lat: item.lat, lng: item.lng }}
                    title={`${item.icon} ${item.name}`}
                    icon={createCategoryMarkerIcon(item.type)}
                    onClick={() => handleMarkerClick(item)}
                  />
                ))}
                {selectedLocation ? (
                  <InfoWindow
                    position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                    onCloseClick={() => setSelectedLocation(null)}
                  >
                    <div className="explore-nearby-infowindow">
                      <h4>
                        {selectedLocation.icon} {selectedLocation.name}
                      </h4>
                      <p><strong>Type:</strong> {selectedLocation.typeLabel}</p>
                      <p><strong>Address:</strong> {selectedLocation.address}</p>
                      <p><strong>Distance:</strong> {selectedLocation.distanceKm.toFixed(1)} km away</p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {selectedLocation.isOpenNow === null
                          ? "Status unknown"
                          : selectedLocation.isOpenNow
                          ? "Open"
                          : "Closed"}
                      </p>
                      {selectedLocation.phone ? (
                        <p><strong>Phone:</strong> {selectedLocation.phone}</p>
                      ) : (
                        <p><strong>Phone:</strong> {phoneLoadingId === selectedLocation.id ? "Loading..." : "Not available"}</p>
                      )}
                      <div className="explore-nearby-infowindow-actions">
                        <a href={getDirectionsLink(selectedLocation)} target="_blank" rel="noopener noreferrer">
                          Navigate
                        </a>
                        {selectedLocation.phone ? (
                          <button type="button" onClick={() => openCall(selectedLocation)}>Call</button>
                        ) : null}
                      </div>
                    </div>
                  </InfoWindow>
                ) : null}
              </GoogleMap>
            </LoadScript>
          )}
        </article>

        <aside className="explore-nearby-list-card">
          <h2>Nearby Resources ({filteredItems.length})</h2>
          <div className="sort-row">
            <button type="button" className={sortMode === "nearest" ? "active" : ""} onClick={() => setSortMode("nearest")}>
              Nearest
            </button>
            <button type="button" className={sortMode === "safest" ? "active" : ""} onClick={() => setSortMode("safest")}>
              Safest
            </button>
            <button
              type="button"
              className={sortMode === "highest-rated" ? "active" : ""}
              onClick={() => setSortMode("highest-rated")}
            >
              Highest rated
            </button>
          </div>
          {error ? <div className="explore-nearby-error">{error}</div> : null}
          {searchNotice ? <div className="explore-nearby-loading">{searchNotice}</div> : null}
          {loading ? (
            <div className="explore-nearby-skeleton" aria-hidden="true">
              {[1, 2, 3].map((item) => (
                <div key={item} className="skeleton-place-card">
                  <div className="skeleton-line skeleton-line-lg" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-line-sm" />
                </div>
              ))}
            </div>
          ) : null}
          <div className="explore-nearby-list">
            {filteredItems.map((item) => (
              <div
                className={`explore-nearby-item ${selectedLocation?.id === item.id ? "selected" : ""}`}
                key={item.id}
                onClick={() => {
                  setSelectedLocation(item);
                  if (mapRef) {
                    mapRef.panTo({ lat: item.lat, lng: item.lng });
                    mapRef.setZoom(15);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedLocation(item);
                  }
                }}
              >
                <div className="explore-nearby-item-head">
                  <div>
                    <h3>{item.icon} {item.name}</h3>
                    <small>{item.typeLabel}</small>
                  </div>
                  <button type="button" className={`open-btn ${item.isOpenNow === false ? "closed" : "open"}`}>
                    {item.isOpenNow === null ? "Status unknown" : item.isOpenNow ? "Open" : "Closed"}
                  </button>
                </div>
                <div className="resource-meta-row">
                  <span className="category-pill">{item.typeLabel}</span>
                  <span className={`safety-pill ${item.safetyTone}`}>
                    {item.safetyTone === "safe" ? "Safe" : item.safetyTone === "moderate" ? "Moderate" : "Risky"}
                  </span>
                </div>
                <p className="address">⌖ {item.address}</p>
                <p className="distance">{item.distanceKm.toFixed(1)} km away</p>
                <div className="explore-nearby-actions triple">
                  <button
                    type="button"
                    className="navigate-btn"
                    onClick={() => window.open(getDirectionsLink(item), "_blank", "noopener,noreferrer")}
                  >
                    ↗ Navigate
                  </button>
                  <button
                    type="button"
                    className="call-btn"
                    disabled={!item.phone && phoneLoadingId === item.id}
                    onClick={() => {
                      if (!item.phone) {
                        fetchPhoneNumber(item);
                        return;
                      }
                      openCall(item);
                    }}
                  >
                    {item.phone ? "📞 Call" : phoneLoadingId === item.id ? "Loading..." : "Get Phone"}
                  </button>
                  <button
                    type="button"
                    className={`save-btn ${savedIds.includes(item.id) ? "saved" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(item);
                    }}
                  >
                    {savedIds.includes(item.id) ? "✓ Saved" : "☆ Save"}
                  </button>
                </div>
                {item.phone ? <small className="phone-row">📱 {item.phone}</small> : null}
              </div>
            ))}
            {!loading && filteredItems.length === 0 ? (
              <div className="explore-nearby-empty">
                <strong>No nearby places found</strong>
                <p>Try increasing search radius</p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
