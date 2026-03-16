import Address from "../models/Address.js";

// GET /api/addresses - Get all addresses for current user
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    res.json({ addresses });
  } catch (error) {
    console.error("getAddresses error:", error);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
};

// POST /api/addresses - Create new address
export const createAddress = async (req, res) => {
  try {
    const {
      label,
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    // Validation
    if (!name || !phone || !addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({
        message: "Name, phone, address line 1, city, state, and postal code are required",
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await Address.updateMany(
        { user: req.userId },
        { $set: { isDefault: false } }
      );
    }

    const address = await Address.create({
      user: req.userId,
      label: label || "Home",
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country: country || "India",
      isDefault: isDefault || false,
    });

    res.status(201).json({ address });
  } catch (error) {
    console.error("createAddress error:", error);
    res.status(500).json({ message: "Failed to create address" });
  }
};

// PUT /api/addresses/:id - Update address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      label,
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    const address = await Address.findOne({ _id: id, user: req.userId });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If this is set as default, unset other defaults
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { user: req.userId, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }

    // Update fields
    if (label) address.label = label;
    if (name) address.name = name;
    if (phone) address.phone = phone;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    res.json({ address });
  } catch (error) {
    console.error("updateAddress error:", error);
    res.status(500).json({ message: "Failed to update address" });
  }
};

// DELETE /api/addresses/:id - Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("deleteAddress error:", error);
    res.status(500).json({ message: "Failed to delete address" });
  }
};

// PUT /api/addresses/:id/set-default - Set address as default
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, user: req.userId });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Unset other defaults
    await Address.updateMany(
      { user: req.userId, _id: { $ne: id } },
      { $set: { isDefault: false } }
    );

    // Set this as default
    address.isDefault = true;
    await address.save();

    res.json({ address });
  } catch (error) {
    console.error("setDefaultAddress error:", error);
    res.status(500).json({ message: "Failed to set default address" });
  }
};
