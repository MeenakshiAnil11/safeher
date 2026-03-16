import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// GET /api/wishlist - Get current user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.userId })
      .populate("products", "name price originalPrice images stock category slug isActive")
      .lean();

    res.json({ products: wishlist?.products || [] });
  } catch (error) {
    console.error("getWishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/wishlist/toggle/:productId - Add/remove product
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).select("_id isActive");
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found or inactive" });
    }

    let wishlist = await Wishlist.findOne({ user: req.userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.userId, products: [] });
    }

    if (wishlist.hasProduct(productId)) {
      wishlist.removeProduct(productId);
      await wishlist.save();
      return res.json({ message: "Removed from wishlist", inWishlist: false });
    } else {
      wishlist.addProduct(productId);
      await wishlist.save();
      return res.json({ message: "Added to wishlist", inWishlist: true });
    }
  } catch (error) {
    console.error("toggleWishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/wishlist/:productId - Remove a product
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
    wishlist.removeProduct(productId);
    await wishlist.save();
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/wishlist - Clear wishlist
export const clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate({ user: req.userId }, { products: [] });
    res.json({ message: "Wishlist cleared" });
  } catch (error) {
    console.error("clearWishlist error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
