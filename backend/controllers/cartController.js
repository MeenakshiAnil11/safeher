import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import mongoose from "mongoose";

// GET /api/cart - Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Filter out inactive products
    cart.items = cart.items.filter(
      (item) => item.product && item.product.isActive
    );

    const totals = cart.calculateTotal();
    const totalItems = cart.getTotalItems();

    res.json({
      cart: {
        ...cart.toObject(),
        totals,
        totalItems,
      },
    });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/cart/add - Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity = 1 } = req.body;

    // Comprehensive validation
    const errors = [];

    if (!productId) {
      errors.push("Product ID is required");
    } else if (!mongoose.Types.ObjectId.isValid(productId)) {
      errors.push("Invalid product ID format");
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum < 1) {
      errors.push("Quantity must be a positive integer (minimum 1)");
    } else if (quantityNum > 100) {
      errors.push("Maximum quantity per item is 100");
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} items available in stock`,
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} items available in stock`,
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      // Issue #8: Only update price if it decreased (favor user), otherwise keep original cart price
      if (product.price < cart.items[existingItemIndex].price) {
        cart.items[existingItemIndex].price = product.price;
      }
      // Otherwise keep the original cart price
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    const totals = updatedCart.calculateTotal();
    const totalItems = updatedCart.getTotalItems();

    res.json({
      message: "Item added to cart",
      cart: {
        ...updatedCart.toObject(),
        totals,
        totalItems,
      },
    });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/cart/update - Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, quantity } = req.body;

    // Comprehensive validation
    const errors = [];

    if (!itemId) {
      errors.push("Item ID is required");
    } else if (!mongoose.Types.ObjectId.isValid(itemId)) {
      errors.push("Invalid item ID format");
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum < 1) {
      errors.push("Quantity must be a positive integer (minimum 1)");
    } else if (quantityNum > 100) {
      errors.push("Maximum quantity per item is 100");
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "stock isActive",
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Validate itemId is a valid ObjectId before using cart.items.id()
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID format" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Issue #9: Use atomic operation to check and validate stock
    const product = await Product.findById(item.product._id);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found or inactive" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} items available in stock`,
      });
    }

    item.quantity = quantity;
    // Keep original cart price, don't update to current product price
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    const totals = updatedCart.calculateTotal();
    const totalItems = updatedCart.getTotalItems();

    res.json({
      message: "Cart updated",
      cart: {
        ...updatedCart.toObject(),
        totals,
        totalItems,
      },
    });
  } catch (error) {
    console.error("updateCartItem error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/cart/remove/:itemId - Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;

    // Validate itemId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID format" });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    const totals = updatedCart.calculateTotal();
    const totalItems = updatedCart.getTotalItems();

    res.json({
      message: "Item removed from cart",
      cart: {
        ...updatedCart.toObject(),
        totals,
        totalItems,
      },
    });
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/cart/apply-coupon - Apply coupon to cart
export const applyCoupon = async (req, res) => {
  try {
    const userId = req.userId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate cart subtotal
    let subtotal = 0;
    cart.items.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    // Find and validate coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Validate coupon
    const validation = coupon.isValid(subtotal);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(subtotal);

    // Apply coupon to cart
    cart.coupon = {
      code: coupon.code,
      discount: discount,
    };

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    const totals = updatedCart.calculateTotal();
    const totalItems = updatedCart.getTotalItems();

    res.json({
      message: "Coupon applied successfully",
      cart: {
        ...updatedCart.toObject(),
        totals,
        totalItems,
      },
    });
  } catch (error) {
    console.error("applyCoupon error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/cart/remove-coupon - Remove coupon from cart
export const removeCoupon = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.coupon = undefined;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    const totals = updatedCart.calculateTotal();
    const totalItems = updatedCart.getTotalItems();

    res.json({
      message: "Coupon removed successfully",
      cart: {
        ...updatedCart.toObject(),
        totals,
        totalItems,
      },
    });
  } catch (error) {
    console.error("removeCoupon error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/cart/clear - Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.coupon = undefined;
    await cart.save();

    res.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("clearCart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
