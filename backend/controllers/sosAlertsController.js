import SOSLogs from '../models/SOSLogs.js';
import Contact from '../models/Contact.js';
import User from '../models/User.js';

// Get SOS alerts with filters
export const getSOSAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, dateRange } = req.query;

    let query = { user: userId };

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by date range
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      query.createdAt = { $gte: startDate };
    }

    const alerts = await SOSLogs.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    // Enrich with notification and response counts
    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        const contacts = await Contact.find({ user: userId });
        return {
          ...alert.toObject(),
          latitude: alert.coords?.lat,
          longitude: alert.coords?.lng,
          notificationsCount: contacts.length,
          responsesCount: 0 // Would need a separate responses collection
        };
      })
    );

    res.json(enrichedAlerts);
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    res.status(500).json({ error: error.message });
  }
};

// Acknowledge an alert
export const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const alert = await SOSLogs.findOneAndUpdate(
      { _id: id, user: userId },
      { status: 'acknowledged', acknowledgedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: error.message });
  }
};

// Escalate an alert
export const escalateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { message } = req.body;

    const alert = await SOSLogs.findOne({ _id: id, user: userId });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Update alert status
    alert.status = 'escalated';
    alert.escalatedAt = new Date();
    await alert.save();

    // Here you would send email to police with alert details
    // For now, we'll just log it
    console.log('Escalating to police:', {
      alertId: alert._id,
      location: alert.coords,
      time: alert.createdAt,
      message
    });

    res.json({ message: 'Alert escalated to police', alert });
  } catch (error) {
    console.error('Error escalating alert:', error);
    res.status(500).json({ error: error.message });
  }
};

// Resolve an alert
export const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const alert = await SOSLogs.findOneAndUpdate(
      { _id: id, user: userId },
      { status: 'closed', resolvedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: error.message });
  }
};

