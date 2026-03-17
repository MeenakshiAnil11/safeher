import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart, Bar, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import api from '../../services/api';
import GoogleMapComponent from '../../components/GoogleMapComponent';
import './LocationHistory.css';

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDuration = (ms) => {
  if (!ms || ms <= 0) return '0m';
  const totalMinutes = Math.floor(ms / MINUTE_MS);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatDateTime = (ts) => {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return 'Invalid time';
  return d.toLocaleString();
};

const getFilterBounds = (filterKey, customRange) => {
  const now = new Date();
  if (filterKey === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }
  if (filterKey === 'last7') {
    return { start: new Date(now.getTime() - 7 * DAY_MS), end: now };
  }
  if (filterKey === 'custom') {
    const start = customRange.start ? new Date(customRange.start) : new Date(0);
    const end = customRange.end ? new Date(`${customRange.end}T23:59:59`) : now;
    return { start, end };
  }
  return { start: new Date(0), end: now };
};

export default function LocationHistory() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last7'); // today, last7, custom
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [locationHistory, setLocationHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const animationRef = useRef(null);
  const lastTickRef = useRef(0);

  useEffect(() => {
    fetchLocationHistory();
  }, []);

  useEffect(() => {
    filterHistoryByDateRange();
  }, [dateRange, customRange, locationHistory]);

  const fetchLocationHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/location/history');
      console.log('Location history data:', response.data);
      
      if (response.data && response.data.length > 0) {
        // Ensure all required fields are present
        const validHistory = response.data.filter(item => 
          Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)) && item.timestamp
        ).map(item => ({
          _id: item._id || item.timestamp,
          timestamp: item.timestamp,
          latitude: item.latitude,
          longitude: item.longitude,
          accuracy: item.accuracy || 10,
          address: item.address || 'Address not available'
        }));
        
        setLocationHistory(validHistory);
      } else {
        console.log('No location history found, using mock data');
        setLocationHistory(generateMockHistory());
      }
    } catch (error) {
      console.error('Error fetching location history:', error);
      // Use mock data for demo
      setLocationHistory(generateMockHistory());
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistory = () => {
    const now = new Date();
    const history = [];
    for (let i = 0; i < 120; i++) {
      history.push({
        _id: i,
        timestamp: new Date(now - i * 15 * 60 * 1000).toISOString(),
        latitude: 12.9716 + Math.sin(i / 8) * 0.004 + (Math.random() - 0.5) * 0.0012,
        longitude: 77.5946 + Math.cos(i / 9) * 0.004 + (Math.random() - 0.5) * 0.0012,
        accuracy: 8 + Math.random() * 18,
        address: `Location ${i + 1}`
      });
    }
    return history;
  };

  const filterHistoryByDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    const bounds = getFilterBounds(dateRange, customRange);
    startDate = bounds.start;
    endDate = bounds.end;

    const filtered = locationHistory.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startDate && itemDate <= endDate;
    });

    setFilteredHistory(filtered);
    setReplayProgress(0);
    setSelectedLocation(null);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const replayMeta = useMemo(() => {
    if (filteredHistory.length < 2) return null;
    let cumulative = 0;
    const segments = [];
    for (let i = 1; i < filteredHistory.length; i++) {
      const a = filteredHistory[i - 1];
      const b = filteredHistory[i];
      const startTs = new Date(a.timestamp).getTime();
      const endTs = new Date(b.timestamp).getTime();
      const duration = Math.max(1000, endTs - startTs);
      segments.push({
        start: a,
        end: b,
        startMs: cumulative,
        endMs: cumulative + duration,
      });
      cumulative += duration;
    }
    return { totalDurationMs: cumulative, segments };
  }, [filteredHistory]);

  const replayState = useMemo(() => {
    if (!replayMeta || !replayMeta.totalDurationMs) return null;
    const targetMs = clamp(replayProgress, 0, 1) * replayMeta.totalDurationMs;
    const segment =
      replayMeta.segments.find((item) => targetMs >= item.startMs && targetMs <= item.endMs) ||
      replayMeta.segments[replayMeta.segments.length - 1];
    const segDuration = Math.max(1, segment.endMs - segment.startMs);
    const localT = clamp((targetMs - segment.startMs) / segDuration, 0, 1);
    const latitude =
      Number(segment.start.latitude) +
      (Number(segment.end.latitude) - Number(segment.start.latitude)) * localT;
    const longitude =
      Number(segment.start.longitude) +
      (Number(segment.end.longitude) - Number(segment.start.longitude)) * localT;
    const replayTimestamp = new Date(
      new Date(segment.start.timestamp).getTime() +
        (new Date(segment.end.timestamp).getTime() - new Date(segment.start.timestamp).getTime()) * localT
    ).toISOString();
    return { latitude, longitude, replayTimestamp };
  }, [replayMeta, replayProgress]);

  useEffect(() => {
    if (!isPlaying || !replayMeta?.totalDurationMs) return undefined;
    const tick = (now) => {
      if (!lastTickRef.current) lastTickRef.current = now;
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      setReplayProgress((prev) => {
        const increment = (delta * playbackSpeed) / replayMeta.totalDurationMs;
        const next = prev + increment;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
      animationRef.current = window.requestAnimationFrame(tick);
    };
    animationRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastTickRef.current = 0;
    };
  }, [isPlaying, playbackSpeed, replayMeta]);

  useEffect(() => {
    if (!isPlaying && animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastTickRef.current = 0;
    }
  }, [isPlaying]);

  const getExportQuery = () => {
    const { start, end } = getFilterBounds(dateRange, customRange);
    const params = new URLSearchParams({
      format: 'csv',
      from: start.toISOString(),
      to: end.toISOString()
    });
    return params.toString();
  };

  const handleExportCSV = async () => {
    try {
      const csv = await api.get(`/location/history/export?${getExportQuery()}`);
      const blob = new Blob([csv.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `location-history-${dateRange}-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      // Generate CSV client-side as fallback
      exportCSVClientSide();
    }
  };

  const exportCSVClientSide = () => {
    const headers = ['Timestamp', 'Address', 'Latitude', 'Longitude', 'Accuracy'];
    const rows = filteredHistory.map(item => [
      item.timestamp,
      item.address || 'N/A',
      item.latitude,
      item.longitude,
      item.accuracy
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `location-history-${dateRange}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Client-side PDF generation using jsPDF
    try {
      const jsPDF = window.jspdf;
      
      if (!jsPDF) {
        // If jsPDF is not loaded, try dynamic import
        import('jspdf').then(({ default: jsPDF }) => {
          generatePDF(jsPDF);
        }).catch(() => {
          alert('PDF export library is not loaded. Installing...');
          // Install jspdf dynamically
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then(() => {
            generatePDF(window.jspdf);
          });
        });
      } else {
        generatePDF(jsPDF);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('PDF export is not available. Please try CSV export instead.');
    }
  };

  const loadScript = (url) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const generatePDF = (jsPDF) => {
    try {
      const doc = new jsPDF.jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(102, 126, 234);
      doc.text('Location History Report', 105, 20, { align: 'center' });
      
      // Add summary
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Points: ${analytics?.pointCount || filteredHistory.length}`, 20, 40);
      if (analytics) {
        doc.text(`Distance: ${analytics.totalDistanceLabel}`, 20, 50);
        doc.text(`Duration: ${analytics.trackingDurationLabel}`, 20, 60);
      }
      
      // Add table
      doc.setFontSize(10);
      let y = 80;
      
      // Table headers
      doc.setTextColor(102, 126, 234);
      doc.setFont(undefined, 'bold');
      doc.text('Time', 20, y);
      doc.text('Address', 60, y);
      doc.text('Coordinates', 135, y);
      doc.text('Accuracy', 195, y);
      
      y += 5;
      doc.text('Address', 170, y);
      
      y += 10;
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      
      // Table rows
      filteredHistory.slice(0, 30).forEach((item, index) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        doc.text(new Date(item.timestamp).toLocaleString().substring(0, 16), 20, y);
        doc.text((item.address || 'N/A').substring(0, 28), 60, y);
        doc.text(`${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`, 135, y);
        doc.text(`±${Math.round(item.accuracy)}m`, 195, y);
        
        y += 8;
      });
      
      doc.save(`location-history-${dateRange}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try CSV export instead.');
    }
  };

  const handleRowClick = (location) => {
    console.log('Selected location:', location);
    setSelectedLocation(location);
    
    // Scroll to map section
    const mapSection = document.querySelector('.map-section');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const calculateStats = () => {
    if (filteredHistory.length === 0) return null;

    let totalDistance = 0;
    for (let i = 1; i < filteredHistory.length; i++) {
      const prev = filteredHistory[i - 1];
      const curr = filteredHistory[i];
      totalDistance += calculateDistance(
        prev.latitude, prev.longitude,
        curr.latitude, curr.longitude
      );
    }

    const startTime = new Date(filteredHistory[0].timestamp);
    const endTime = new Date(filteredHistory[filteredHistory.length - 1].timestamp);
    const duration = endTime - startTime;

    const durationHours = duration / (1000 * 60 * 60);
    const avgSpeed = durationHours > 0 ? totalDistance / durationHours : 0;

    const timeline = [];
    for (let i = 1; i < filteredHistory.length; i++) {
      const prev = filteredHistory[i - 1];
      const curr = filteredHistory[i];
      const gapMs = new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime();
      const gapMinutes = gapMs / MINUTE_MS;
      const segmentDistance = calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
      if (segmentDistance < 0.03 && gapMinutes >= 5) {
        timeline.push({
          type: 'stop',
          time: curr.timestamp,
          title: 'Stop detected',
          description: `${gapMinutes.toFixed(0)} min stop near ${curr.address || 'unknown area'}`,
        });
      } else if (segmentDistance < 0.1 && gapMinutes >= 10) {
        timeline.push({
          type: 'pause',
          time: curr.timestamp,
          title: 'Pause in movement',
          description: `${gapMinutes.toFixed(0)} min pause`,
        });
      }
      if (gapMinutes >= 30) {
        timeline.push({
          type: 'inactivity',
          time: curr.timestamp,
          title: 'Unusual inactivity',
          description: `${gapMinutes.toFixed(0)} min inactive period`,
        });
      }
    }

    return {
      pointCount: filteredHistory.length,
      totalDistanceKm: totalDistance,
      totalDistanceLabel: `${totalDistance.toFixed(2)} km`,
      avgSpeedLabel: `${avgSpeed.toFixed(1)} km/h`,
      trackingDurationMs: duration,
      trackingDurationLabel: formatDuration(duration),
      avgAccuracyLabel: `${(
        filteredHistory.reduce((sum, item) => sum + item.accuracy, 0) / filteredHistory.length
      ).toFixed(1)} m`,
      timelineEvents: timeline.sort((a, b) => new Date(b.time) - new Date(a.time))
    };
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDuration = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const analytics = calculateStats();

  const timelineEvents = analytics?.timelineEvents || [];

  const movementChartData = useMemo(() => {
    if (!filteredHistory.length) return [];
    const grouped = new Map();
    filteredHistory.forEach((point) => {
      const dt = new Date(point.timestamp);
      const key = dt.toISOString().slice(0, 10);
      const value = grouped.get(key) || { key, date: dt.toLocaleDateString(), distance: 0, points: 0 };
      value.points += 1;
      grouped.set(key, value);
    });

    const ordered = Array.from(grouped.values()).sort((a, b) => a.key.localeCompare(b.key));
    for (let i = 1; i < filteredHistory.length; i++) {
      const prev = filteredHistory[i - 1];
      const curr = filteredHistory[i];
      const key = new Date(curr.timestamp).toISOString().slice(0, 10);
      const slot = ordered.find((item) => item.key === key);
      if (slot) slot.distance += haversineKm(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    }
    return ordered.map((item) => ({ ...item, distance: Number(item.distance.toFixed(2)) }));
  }, [filteredHistory]);

  const routePathHistory = useMemo(
    () =>
      filteredHistory.map((item) => ({
        latitude: item.latitude,
        longitude: item.longitude,
        timestamp: item.timestamp
      })),
    [filteredHistory]
  );

  const sampledTrackingHistory = useMemo(() => {
    if (routePathHistory.length <= 60) return routePathHistory;
    const step = Math.max(2, Math.ceil(routePathHistory.length / 45));
    return routePathHistory.filter((_, idx) => idx % step === 0 || idx === routePathHistory.length - 1);
  }, [routePathHistory]);

  const mapPolylines = useMemo(() => {
    if (routePathHistory.length < 2) return [];
    return [
      {
        path: routePathHistory.map((item) => ({ lat: item.latitude, lng: item.longitude })),
        strokeColor: '#6C63FF',
        strokeOpacity: 0.9,
        strokeWeight: 4
      }
    ];
  }, [routePathHistory]);

  const mapMarkers = useMemo(() => {
    if (!filteredHistory.length) return [];
    const first = filteredHistory[0];
    const last = filteredHistory[filteredHistory.length - 1];
    const markers = [
      { lat: first.latitude, lng: first.longitude, title: 'Start point' },
      { lat: last.latitude, lng: last.longitude, title: 'End point' }
    ];
    if (replayState) {
      markers.push({ lat: replayState.latitude, lng: replayState.longitude, title: 'Replay marker' });
    }
    return markers;
  }, [filteredHistory, replayState]);

  if (loading) {
    return (
      <div className="location-history-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading location history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="location-history-container">
      {/* Date Range Picker */}
      <section className="date-range-section">
        <h2>📅 Date Range</h2>
        <div className="date-range-buttons">
          <button
            className={dateRange === 'today' ? 'active' : ''}
            onClick={() => setDateRange('today')}
          >
            Today
          </button>
          <button
            className={dateRange === 'last7' ? 'active' : ''}
            onClick={() => setDateRange('last7')}
          >
            Last 7 Days
          </button>
          <button
            className={dateRange === 'custom' ? 'active' : ''}
            onClick={() => setDateRange('custom')}
          >
            Custom Range
          </button>
        </div>

        {dateRange === 'custom' && (
          <div className="custom-range-inputs">
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
              placeholder="End Date"
            />
          </div>
        )}
      </section>

      {/* Stats Cards */}
      {analytics && (
        <section className="stats-section">
          <div className="stat-card">
            <h3>Total Distance Travelled</h3>
            <p>{analytics.totalDistanceLabel}</p>
          </div>
          <div className="stat-card">
            <h3>Average Speed</h3>
            <p>{analytics.avgSpeedLabel}</p>
          </div>
          <div className="stat-card">
            <h3>Tracking Duration</h3>
            <p>{analytics.trackingDurationLabel}</p>
          </div>
          <div className="stat-card">
            <h3>Location Points</h3>
            <p>{analytics.pointCount}</p>
          </div>
        </section>
      )}

      {/* Map and Timeline Controls */}
      <section className="map-section">
        <div className="map-controls">
          <h2>🗺️ Route Map</h2>
          <div className="playback-controls">
            <button
              onClick={handlePlayPause}
              className="play-pause-btn"
              disabled={!replayMeta}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
            </select>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(replayProgress || 0) * 100}%` }}
              />
            </div>
            <span>
              {replayMeta ? `${Math.round((replayProgress || 0) * 100)}%` : '0%'}
            </span>
            <span className="replay-time">🕒 {replayState ? formatDateTime(replayState.replayTimestamp) : 'Replay not started'}</span>
          </div>
        </div>

        <div className="map-container">
          {selectedLocation ? (
            <GoogleMapComponent
              location={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                timestamp: selectedLocation.timestamp,
                accuracy: selectedLocation.accuracy || 10
              }}
              trackingHistory={sampledTrackingHistory}
              zoom={18}
              height="400px"
              showTrackingPath={false}
              polylines={mapPolylines}
              markers={mapMarkers}
            />
          ) : filteredHistory.length > 0 ? (
            <GoogleMapComponent
              location={{
                latitude: replayState?.latitude || filteredHistory[0].latitude,
                longitude: replayState?.longitude || filteredHistory[0].longitude,
                timestamp: replayState?.replayTimestamp || filteredHistory[0].timestamp,
                accuracy: filteredHistory[0].accuracy || 10
              }}
              trackingHistory={sampledTrackingHistory}
              zoom={15}
              height="400px"
              showTrackingPath={false}
              polylines={mapPolylines}
              markers={mapMarkers}
            />
          ) : (
            <div className="map-placeholder">
              No location history for selected date range
            </div>
          )}
        </div>
      </section>

      <section className="analytics-panel">
        <div className="movement-chart-card">
          <h2>📈 Movement Analytics</h2>
          {movementChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={movementChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, key) => (key === 'distance' ? [`${value} km`, 'Distance'] : [value, 'Points'])} />
                <Bar dataKey="distance" fill="#6C63FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-box">No chart data for this range.</div>
          )}
        </div>
        <div className="timeline-card">
          <h2>🧭 Timeline Events</h2>
          {timelineEvents.length > 0 ? (
            <div className="timeline-list">
              {timelineEvents.slice(0, 25).map((event, idx) => (
                <div key={`${event.time}-${idx}`} className={`timeline-item ${event.type}`}>
                  <div className="timeline-head">
                    <strong>{event.title}</strong>
                    <span>{formatDateTime(event.time)}</span>
                  </div>
                  <p>{event.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-box">No stops or inactivity events detected.</div>
          )}
        </div>
      </section>

      {/* Location Table */}
      <section className="table-section">
        <div className="table-header">
          <h2>📍 Location History</h2>
          <div className="export-buttons">
            <button onClick={handleExportCSV} className="export-btn">
              📥 Export CSV
            </button>
            <button onClick={handleExportPDF} className="export-btn">
              📄 Export PDF
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="location-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Coordinates</th>
                <th>Address</th>
                <th>Accuracy</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.slice(0, 100).map((item, index) => (
                <tr
                  key={item._id || index}
                  onClick={() => handleRowClick(item)}
                  className={selectedLocation?._id === item._id ? 'selected' : ''}
                >
                  <td>{new Date(item.timestamp).toLocaleString()}</td>
                  <td className="mono">
                    {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                  </td>
                  <td>{item.address || 'N/A'}</td>
                  <td>±{Math.round(item.accuracy)}m</td>
                  <td>
                    <button 
                className="center-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick(item);
                }}
              >
                📍 Center
              </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

