import User from "../models/User.js";

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      settings: user.settings || {
        notifications: {
          enablePeriodReminder: true,
          enableOvulationReminder: true,
          reminderDaysBeforePeriod: 2,
          reminderDaysBeforeOvulation: 1,
          email: "",
          phone: "",
        },
        privacy: {
          enablePinLock: false,
          pinHash: "",
        },
        locale: "en",
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    // Validate settings structure
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: "Invalid settings format" });
    }

    // If PIN lock is enabled, hash the PIN
    if (settings.privacy && settings.privacy.enablePinLock && settings.privacy.pin) {
      const bcrypt = await import('bcryptjs');
      settings.privacy.pinHash = await bcrypt.hash(settings.privacy.pin, 10);
      delete settings.privacy.pin; // Remove plain PIN from storage
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { settings },
      { new: true, runValidators: true }
    ).select('settings');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Settings updated successfully",
      settings: user.settings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};