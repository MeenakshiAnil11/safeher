import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import GoogleMapComponent from '../../components/GoogleMapComponent';
import './LocationHistory.css';

export default function LocationHistory() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // today, week, month, custom
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [locationHistory, setLocationHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState(null);

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
          item.latitude && item.longitude && item.timestamp
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
    for (let i = 0; i < 50; i++) {
      history.push({
        _id: i,
        timestamp: new Date(now - i * 15 * 60 * 1000).toISOString(),
        latitude: 12.9716 + (Math.random() - 0.5) * 0.01,
        longitude: 77.5946 + (Math.random() - 0.5) * 0.01,
        accuracy: 10 + Math.random() * 20,
        address: `Location ${i + 1}`
      });
    }
    return history;
  };

  const filterHistoryByDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = new Date();
        break;
      case 'custom':
        startDate = customRange.start ? new Date(customRange.start) : new Date(0);
        endDate = customRange.end ? new Date(customRange.end) : new Date();
        break;
      default:
        startDate = new Date(0);
        endDate = new Date();
    }

    const filtered = locationHistory.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startDate && itemDate <= endDate;
    });

    setFilteredHistory(filtered);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isPlaying && currentIndex < filteredHistory.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 1000 / playbackSpeed);
      return () => clearTimeout(timer);
    } else if (currentIndex >= filteredHistory.length - 1) {
      setIsPlaying(false);
      setCurrentIndex(0);
    }
  }, [isPlaying, currentIndex, filteredHistory.length, playbackSpeed]);

  const handleExportCSV = async () => {
    try {
      const csv = await api.get('/location/history/export?format=csv');
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
    const headers = ['Timestamp', 'Latitude', 'Longitude', 'Accuracy', 'Address'];
    const rows = filteredHistory.map(item => [
      item.timestamp,
      item.latitude,
      item.longitude,
      item.accuracy,
      item.address || 'N/A'
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
      doc.text(`Total Points: ${filteredHistory.length}`, 20, 40);
      if (stats) {
        doc.text(`Distance: ${stats.totalDistance}`, 20, 50);
        doc.text(`Duration: ${stats.duration}`, 20, 60);
      }
      
      // Add table
      doc.setFontSize(10);
      let y = 80;
      
      // Table headers
      doc.setTextColor(102, 126, 234);
      doc.setFont(undefined, 'bold');
      doc.text('Time', 20, y);
      doc.text('Coordinates', 60, y);
      doc.text('Accuracy', 130, y);
      
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
        doc.text(`${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`, 60, y);
        doc.text(`±${Math.round(item.accuracy)}m`, 130, y);
        doc.text(item.address || 'N/A', 170, y);
        
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

    return {
      totalPoints: filteredHistory.length,
      totalDistance: totalDistance.toFixed(2) + ' km',
      duration: formatDuration(duration),
      avgAccuracy: (filteredHistory.reduce((sum, item) => sum + item.accuracy, 0) / filteredHistory.length).toFixed(1) + ' m'
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

  const stats = calculateStats();

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
            className={dateRange === 'week' ? 'active' : ''}
            onClick={() => setDateRange('week')}
          >
            This Week
          </button>
          <button
            className={dateRange === 'month' ? 'active' : ''}
            onClick={() => setDateRange('month')}
          >
            This Month
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
      {stats && (
        <section className="stats-section">
          <div className="stat-card">
            <h3>Total Points</h3>
            <p>{stats.totalPoints}</p>
          </div>
          <div className="stat-card">
            <h3>Distance</h3>
            <p>{stats.totalDistance}</p>
          </div>
          <div className="stat-card">
            <h3>Duration</h3>
            <p>{stats.duration}</p>
          </div>
          <div className="stat-card">
            <h3>Avg Accuracy</h3>
            <p>{stats.avgAccuracy}</p>
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
              <option value={5}>5x</option>
            </select>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(currentIndex / filteredHistory.length) * 100}%` }}
              />
            </div>
            <span>
              {currentIndex + 1} / {filteredHistory.length}
            </span>
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
              trackingHistory={filteredHistory.map(item => ({
                latitude: item.latitude,
                longitude: item.longitude,
                timestamp: item.timestamp
              }))}
              zoom={18}
              height="400px"
              showTrackingPath={true}
            />
          ) : filteredHistory.length > 0 ? (
            <GoogleMapComponent
              location={{
                latitude: filteredHistory[currentIndex].latitude,
                longitude: filteredHistory[currentIndex].longitude,
                timestamp: filteredHistory[currentIndex].timestamp,
                accuracy: filteredHistory[currentIndex].accuracy || 10
              }}
              trackingHistory={filteredHistory.map(item => ({
                latitude: item.latitude,
                longitude: item.longitude,
                timestamp: item.timestamp
              }))}
              zoom={15}
              height="400px"
              showTrackingPath={true}
            />
          ) : (
            <div className="map-placeholder">
              No location history for selected date range
            </div>
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

