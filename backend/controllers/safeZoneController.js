import SafeZone from '../models/SafeZone.js';

// Get all safe zones for a user
export const getSafeZones = async (req, res) => {
  try {
    const userId = req.user.id;
    const zones = await SafeZone.find({ user: userId, isActive: true })
      .sort({ createdAt: -1 });
    
    res.json(zones);
  } catch (error) {
    console.error('Error fetching safe zones:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new safe zone
export const createSafeZone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, latitude, longitude, radius } = req.body;

    const zone = await SafeZone.create({
      user: userId,
      name,
      description,
      latitude,
      longitude,
      radius
    });

    res.status(201).json(zone);
  } catch (error) {
    console.error('Error creating safe zone:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a safe zone
export const updateSafeZone = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, latitude, longitude, radius } = req.body;

    const zone = await SafeZone.findOneAndUpdate(
      { _id: id, user: userId },
      { name, description, latitude, longitude, radius, updatedAt: new Date() },
      { new: true }
    );

    if (!zone) {
      return res.status(404).json({ error: 'Safe zone not found' });
    }

    res.json(zone);
  } catch (error) {
    console.error('Error updating safe zone:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a safe zone
export const deleteSafeZone = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const zone = await SafeZone.findOneAndUpdate(
      { _id: id, user: userId },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!zone) {
      return res.status(404).json({ error: 'Safe zone not found' });
    }

    res.json({ message: 'Safe zone deleted successfully' });
  } catch (error) {
    console.error('Error deleting safe zone:', error);
    res.status(500).json({ error: error.message });
  }
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
};

