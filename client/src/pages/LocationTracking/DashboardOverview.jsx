import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../services/api';
import './DashboardOverview.css';

export default function DashboardOverview({ currentLocation, isTracking, sosActive, onToggleTracking }) {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    trackingStatus: 'No Signal',
    lastUpdateTime: null,
    lastKnownLocation: null,
    safetyScore: 75,
    safetyLevel: 'Safe',
    recentMovement: [],
    recentActivity: [],
    recentSOSAlerts: []
  });

  useEffect(() => {
    // Update dashboard data when currentLocation changes
    if (currentLocation) {
      setDashboardData(prev => ({
        ...prev,
        lastKnownLocation: currentLocation,
        lastUpdateTime: currentLocation.timestamp,
        trackingStatus: isTracking ? 'Active' : 'Paused'
      }));
    }
  }, [currentLocation, isTracking]);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 seconds
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [isTracking, sosActive]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/location/dashboard');
      setDashboardData({
        ...response.data,
        trackingStatus: isTracking ? 'Active' : 'Paused',
        lastUpdateTime: currentLocation?.timestamp || response.data.lastUpdateTime
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback data
      setDashboardData({
        trackingStatus: isTracking ? 'Active' : 'Paused',
        lastUpdateTime: currentLocation?.timestamp,
        lastKnownLocation: currentLocation,
        safetyScore: 75,
        safetyLevel: 'Safe',
        recentMovement: generateMockMovementData(),
        recentActivity: [],
        recentSOSAlerts: []
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockMovementData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      distance: Math.floor(Math.random() * 10) + 2
    }));
  };

  const toggleTracking = () => {
    if (onToggleTracking) {
      onToggleTracking();
    }
  };

  const getSafetyColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSafetyBadgeColor = (level) => {
    if (level === 'Safe') return 'bg-green-100 text-green-800';
    if (level === 'Moderate') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="dashboard-overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="card skeleton">
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="card skeleton h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview space-y-6">
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tracking Status Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Tracking Status</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              dashboardData.trackingStatus === 'Active' ? 'bg-green-100 text-green-800' :
              dashboardData.trackingStatus === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {dashboardData.trackingStatus}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Last Update</p>
            <p className="text-lg font-semibold">
              {dashboardData.lastUpdateTime 
                ? new Date(dashboardData.lastUpdateTime).toLocaleString()
                : 'Never'}
            </p>
          </div>
          <button
            onClick={toggleTracking}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {isTracking ? 'Pause Tracking' : 'Start Tracking'}
          </button>
        </div>

        {/* Last Known Location Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Last Known Location</h3>
            <span className="text-2xl">📍</span>
          </div>
          {dashboardData.lastKnownLocation && dashboardData.lastKnownLocation.latitude && dashboardData.lastKnownLocation.longitude ? (
            <>
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">Coordinates</p>
                <p className="text-sm font-mono text-gray-800">
                  {dashboardData.lastKnownLocation.latitude.toFixed(6)}, {dashboardData.lastKnownLocation.longitude.toFixed(6)}
                </p>
              </div>
              {dashboardData.lastKnownLocation.address && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="text-sm text-gray-800 line-clamp-2">
                    {dashboardData.lastKnownLocation.address}
                  </p>
                </div>
              )}
              <button className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                View Full Map
              </button>
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">No location data available</p>
          )}
        </div>

        {/* Safety Score Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Safety Score</h3>
            <span className="text-2xl">🛡️</span>
          </div>
          <div className="text-center mb-4">
            <div className={`text-5xl font-bold ${getSafetyColor(dashboardData.safetyScore)}`}>
              {dashboardData.safetyScore}
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getSafetyBadgeColor(dashboardData.safetyLevel)}`}>
              {dashboardData.safetyLevel}
            </span>
          </div>
          <p className="text-xs text-gray-600 text-center">
            Based on location patterns and safe zone proximity
          </p>
        </div>
      </div>

      {/* Middle Section - Map and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mini Live Map Preview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Map Preview</h3>
          <div className="h-64 rounded-lg overflow-hidden border border-gray-200 relative">
            {currentLocation ? (
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.longitude - 0.005},${currentLocation.latitude - 0.005},${currentLocation.longitude + 0.005},${currentLocation.latitude + 0.005}&layer=mapnik&marker=${currentLocation.latitude},${currentLocation.longitude}&lat=${currentLocation.latitude}&lon=${currentLocation.longitude}&zoom=17`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                title="Live Location Map"
                style={{ border: 'none' }}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p className="text-sm">No location data</p>
                </div>
              </div>
            )}
            {/* Custom marker overlay */}
            {currentLocation && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                pointerEvents: 'none'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: sosActive ? '#ff4444' : '#007bff',
                  border: '4px solid white',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  animation: 'pulse 2s infinite'
                }}>
                  {sosActive ? '🚨' : '📍'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Movement Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Movement (km/day)</h3>
          {dashboardData.recentMovement.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboardData.recentMovement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                  formatter={(value) => [`${value} km`, 'Distance']}
                />
                <Line 
                  type="monotone" 
                  dataKey="distance" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No movement data available
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Location Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          {dashboardData.recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Place</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData.recentActivity.map((activity, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-800">
                        {new Date(activity.time).toLocaleTimeString()}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-800">{activity.place}</td>
                      <td className="px-3 py-2 text-xs">
                        <span className={`px-2 py-1 rounded-full ${
                          activity.action === 'Entered' ? 'bg-green-100 text-green-800' :
                          activity.action === 'Left' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {activity.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No recent activity
            </div>
          )}
        </div>

        {/* Recent SOS Alerts */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent SOS Alerts</h3>
          {dashboardData.recentSOSAlerts.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentSOSAlerts.map((alert, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚨</span>
                      <span className="text-sm font-medium text-gray-800">
                        {new Date(alert.time).toLocaleString()}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.status === 'Active' ? 'bg-red-100 text-red-800' :
                      alert.status === 'Acknowledged' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  {alert.location && (
                    <p className="text-xs text-gray-600 line-clamp-1">
                      📍 {alert.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No SOS alerts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

