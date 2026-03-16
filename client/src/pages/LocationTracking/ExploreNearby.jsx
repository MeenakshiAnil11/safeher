import React, { useEffect, useMemo, useState } from "react";
import { GoogleMap, InfoWindow, LoadScript, Marker } from "@react-google-maps/api";
import "./ExploreNearby.css";

const FILTERS = ["All Locations", "Hospitals", "Police Stations", "Safe Cafes"];
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";
const SEARCH_RADIUS_METERS = 2000;

const TYPE_CONFIG = {
  hospital: { label: "Hospital", icon: "🏥" },
  police: { label: "Police", icon: "🛡️" },
  cafe: { label: "Cafe", icon: "☕" },
};

const FILTER_TO_TYPES = {
  "All Locations": ["hospital", "police", "cafe"],
  Hospitals: ["hospital"],
  "Police Stations": ["police"],
  "Safe Cafes": ["cafe"],
};

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
  const [activeFilter, setActiveFilter] = useState("All Locations");
  const [mapRef, setMapRef] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneLoadingId, setPhoneLoadingId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  const filteredItems = useMemo(() => {
    const allowedTypes = FILTER_TO_TYPES[activeFilter] || FILTER_TO_TYPES["All Locations"];
    return nearbyLocations
      .filter((item) => allowedTypes.includes(item.type))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [activeFilter, nearbyLocations]);

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

  const loadNearbyPlaces = async (mapInstance, location, selectedFilter = activeFilter) => {
    if (!mapInstance || !location || !window.google?.maps?.places) return;
    setLoading(true);
    setError("");
    try {
      const service = new window.google.maps.places.PlacesService(mapInstance);
      const allowedTypes = FILTER_TO_TYPES[selectedFilter] || FILTER_TO_TYPES["All Locations"];

      const byTypeResults = await Promise.all(
        allowedTypes.map(async (type) => {
          const nearbyResult = await fetchNearbyForType(service, {
            location,
            radius: SEARCH_RADIUS_METERS,
            type,
          });
          const fallbackResult =
            nearbyResult.results.length === 0
              ? await fetchTextFallbackForType(service, location, type)
              : { results: [], status: "SKIPPED" };
          const rawResults = nearbyResult.results.length ? nearbyResult.results : fallbackResult.results;

          const normalized = rawResults
            .map((place) => normalizePlace(place, location, type))
            .filter(Boolean);

          // "Safe Cafes": prioritize safety-oriented names in ordering
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

      const merged = byTypeResults.flatMap((entry) => entry.results);

      const uniqueByPlaceId = Array.from(new Map(merged.map((item) => [item.placeId, item])).values());
      setNearbyLocations(uniqueByPlaceId);
      const statuses = byTypeResults.map((entry) => entry.status);
      if (
        uniqueByPlaceId.length === 0 &&
        statuses.every((s) => s === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED)
      ) {
        setError("Places API request denied. Enable Places API + billing and allow this domain in API key restrictions.");
      }
      if (uniqueByPlaceId.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(location);
        uniqueByPlaceId.forEach((item) => bounds.extend({ lat: item.lat, lng: item.lng }));
        mapInstance.fitBounds(bounds);
      } else {
        mapInstance.panTo(location);
        mapInstance.setZoom(14);
        setError("No nearby places found. Try expanding search radius.");
      }
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
      loadNearbyPlaces(mapRef, userLocation, activeFilter);
    }
  }, [mapRef, userLocation, activeFilter]);

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

  const isApiConfigured = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY";

  return (
    <section className="explore-nearby-page">
      <div className="explore-nearby-header">
        <h1>Explore Nearby</h1>
        <p>Find safe spaces and emergency services around you</p>
      </div>

      <div className="explore-nearby-filter-row">
        <span className="explore-nearby-filter-label">⌯ Filter:</span>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`explore-nearby-chip ${activeFilter === f ? "active" : ""}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
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
            Accuracy: {locationAccuracy ? `±${Math.round(locationAccuracy)}m` : "N/A"}
          </span>
        </div>
      ) : null}

      <div className="explore-nearby-grid">
        <article className="explore-nearby-map-card">
          <div className="explore-nearby-legend">
            <span><i className="legend-dot hospital" /> Hospital</span>
            <span><i className="legend-dot police" /> Police</span>
            <span><i className="legend-dot cafe" /> Cafe</span>
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
          <h2>Nearby Locations ({filteredItems.length})</h2>
          {error ? <div className="explore-nearby-error">{error}</div> : null}
          {loading ? <div className="explore-nearby-loading">Loading nearby places...</div> : null}
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
                <p className="address">⌖ {item.address}</p>
                <p className="distance">{item.distanceKm.toFixed(1)} km away</p>
                <div className="explore-nearby-actions">
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
                </div>
                {item.phone ? <small className="phone-row">📱 {item.phone}</small> : null}
              </div>
            ))}
            {!loading && filteredItems.length === 0 ? (
              <div className="explore-nearby-empty">No nearby places found. Try expanding search radius.</div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
