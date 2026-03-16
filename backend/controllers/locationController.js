import SOSLogs from '../models/SOSLogs.js';
import Contact from '../models/Contact.js';

// Get dashboard overview data
export const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent SOS logs
    const recentSOSLogs = await SOSLogs.find({ userId })
      .sort({ timestamp: -1 })
      .limit(5);

    // Get emergency contacts
    const emergencyContacts = await Contact.find({ userId });

    // Get recent location activity (mock data for now)
    const recentActivity = recentSOSLogs.map(log => ({
      time: log.timestamp,
      place: log.address || 'Unknown location',
      action: 'SOS Alert'
    }));

    // Format SOS alerts
    const recentSOSAlerts = recentSOSLogs.map(log => ({
      time: log.timestamp,
      location: log.address,
      status: log.status || 'Unknown'
    }));

    // Calculate safety score based on various factors
    const totalAlerts = recentSOSLogs.length;
    const activeAlerts = recentSOSLogs.filter(log => log.status === 'Active').length;
    const hasContacts = emergencyContacts.length > 0;

    let safetyScore = 100;
    let safetyLevel = 'Safe';

    // Deduct points for active alerts
    if (activeAlerts > 0) {
      safetyScore -= activeAlerts * 20;
    }

    // Deduct points for recent alerts
    if (totalAlerts > 0) {
      safetyScore -= totalAlerts * 5;
    }

    // Check if user has contacts (good for safety)
    if (!hasContacts) {
      safetyScore -= 10;
    }

    // Ensure score is between 0 and 100
    safetyScore = Math.max(0, Math.min(100, safetyScore));

    // Determine safety level
    if (safetyScore >= 70) {
      safetyLevel = 'Safe';
    } else if (safetyScore >= 40) {
      safetyLevel = 'Moderate';
    } else {
      safetyLevel = 'Risky';
    }

    // Generate mock movement data for last 7 days
    const recentMovement = generateMockMovementData();

    res.json({
      trackingStatus: 'Active',
      lastUpdateTime: recentSOSLogs[0]?.timestamp || new Date().toISOString(),
      lastKnownLocation: recentSOSLogs[0] ? {
        latitude: recentSOSLogs[0].latitude,
        longitude: recentSOSLogs[0].longitude,
        address: recentSOSLogs[0].address
      } : null,
      safetyScore,
      safetyLevel,
      recentMovement,
      recentActivity,
      recentSOSAlerts
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ error: error.message });
  }
};

// Generate mock movement data for chart
const generateMockMovementData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    distance: Math.floor(Math.random() * 10) + 2
  }));
};

