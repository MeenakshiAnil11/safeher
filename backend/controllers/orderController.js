import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Razorpay from "razorpay";
import { sendEmail } from "../config/mailer.js";

const formatPaymentMethod = (method = "") => {
  if (method === "cod") return "Cash on Delivery";
  if (method === "upi") return "UPI Payment";
  if (method === "razorpay") return "Razorpay";
  if (method === "wallet") return "Wallet";
  return method || "N/A";
};

const sendOrderConfirmationEmail = async (order) => {
  try {
    const userEmail = order?.user?.email;
    if (!userEmail) return;

    const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
    const orderLink = `${frontendBase}/shop/orders/${order._id}`;
    const trackingLine = order?.trackingNumber
      ? `Tracking: ${order.trackingNumber}`
      : "Tracking details will be shared once the order is shipped.";

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e6e8ee;">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #e6e8ee;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #e6e8ee;text-align:right;">Rs ${Number(item.price).toFixed(2)}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;color:#1f2937;">
        <h2 style="margin:0 0 12px;">Order Confirmation</h2>
        <p style="margin:0 0 8px;">Thanks for your purchase. Your order has been placed successfully.</p>
        <p style="margin:0 0 16px;"><strong>Order ID:</strong> ${order.orderNumber}</p>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e6e8ee;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px;text-align:left;">Product</th>
              <th style="padding:10px;text-align:center;">Qty</th>
              <th style="padding:10px;text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="margin-top:12px;padding:12px;border:1px solid #e6e8ee;border-radius:8px;background:#ffffff;">
          <p style="margin:0 0 6px;"><strong>Total Paid:</strong> Rs ${Number(order.total || 0).toFixed(2)}</p>
          <p style="margin:0 0 6px;"><strong>Payment Method:</strong> ${formatPaymentMethod(order.paymentMethod)}</p>
          <p style="margin:0;"><strong>${trackingLine}</strong></p>
        </div>
        <p style="margin:16px 0 0;">
          View your order: <a href="${orderLink}" target="_blank" rel="noreferrer">${orderLink}</a>
        </p>
      </div>
    `;

    await sendEmail({
      to: userEmail,
      subject: `Order Confirmed: ${order.orderNumber}`,
      html,
    });
  } catch (error) {
    console.error("Order confirmation email failed:", error.message);
  }
};

const sendOrderStatusUpdateEmail = async (order, previousStatus = "") => {
  try {
    const userEmail = order?.user?.email;
    const currentStatus = String(order?.orderStatus || "").toLowerCase();

    if (!userEmail || !["shipped", "delivered"].includes(currentStatus)) return;
    if (previousStatus && previousStatus.toLowerCase() === currentStatus) return;

    const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
    const orderLink = `${frontendBase}/shop/orders/${order._id}`;
    const statusTitle = currentStatus === "shipped" ? "Your order has been shipped" : "Your order has been delivered";
    const statusText =
      currentStatus === "shipped"
        ? "Good news! Your order is now on the way."
        : "Your order has been delivered successfully.";

    const trackingBlock = order?.trackingNumber
      ? `<p style="margin:0 0 8px;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>`
      : "";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;color:#1f2937;">
        <h2 style="margin:0 0 12px;">${statusTitle}</h2>
        <p style="margin:0 0 10px;">${statusText}</p>
        <p style="margin:0 0 8px;"><strong>Order ID:</strong> ${order.orderNumber}</p>
        <p style="margin:0 0 8px;"><strong>Current Status:</strong> ${currentStatus.toUpperCase()}</p>
        ${trackingBlock}
        <p style="margin:12px 0 0;">
          View your order: <a href="${orderLink}" target="_blank" rel="noreferrer">${orderLink}</a>
        </p>
      </div>
    `;

    await sendEmail({
      to: userEmail,
      subject: `Order Update: ${order.orderNumber} is ${currentStatus.toUpperCase()}`,
      html,
    });
  } catch (error) {
    console.error("Order status update email failed:", error.message);
  }
};

// POST /api/orders - Create new order
export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Ensure userId is ObjectId
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;

    const { shippingAddress, paymentMethod, notes, paymentId, selectedItemIds, upiId } = req.body;

    // Comprehensive validation
    const errors = [];

    if (!shippingAddress) {
      errors.push("Shipping address is required");
    } else {
      // Validate shipping address fields
      if (!shippingAddress.name || !shippingAddress.name.trim()) {
        errors.push("Name is required in shipping address");
      } else if (shippingAddress.name.trim().length < 2) {
        errors.push("Name must be at least 2 characters");
      } else if (shippingAddress.name.trim().length > 100) {
        errors.push("Name must not exceed 100 characters");
      }

      if (!shippingAddress.phone || !shippingAddress.phone.trim()) {
        errors.push("Phone number is required in shipping address");
      } else if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim())) {
        errors.push("Please enter a valid 10-digit Indian phone number");
      }

      if (!shippingAddress.addressLine1 || !shippingAddress.addressLine1.trim()) {
        errors.push("Address line 1 is required");
      } else if (shippingAddress.addressLine1.trim().length < 5) {
        errors.push("Address line 1 must be at least 5 characters");
      } else if (shippingAddress.addressLine1.trim().length > 200) {
        errors.push("Address line 1 must not exceed 200 characters");
      }

      if (shippingAddress.addressLine2 && shippingAddress.addressLine2.trim().length > 200) {
        errors.push("Address line 2 must not exceed 200 characters");
      }

      if (!shippingAddress.city || !shippingAddress.city.trim()) {
        errors.push("City is required");
      } else if (shippingAddress.city.trim().length < 2) {
        errors.push("City must be at least 2 characters");
      } else if (shippingAddress.city.trim().length > 50) {
        errors.push("City must not exceed 50 characters");
      }

      if (!shippingAddress.state || !shippingAddress.state.trim()) {
        errors.push("State is required");
      } else if (shippingAddress.state.trim().length < 2) {
        errors.push("State must be at least 2 characters");
      } else if (shippingAddress.state.trim().length > 50) {
        errors.push("State must not exceed 50 characters");
      }

      if (!shippingAddress.postalCode || !shippingAddress.postalCode.trim()) {
        errors.push("Postal code is required");
      } else if (!/^\d{6}$/.test(shippingAddress.postalCode.trim())) {
        errors.push("Please enter a valid 6-digit Indian postal code");
      }

      if (shippingAddress.country && shippingAddress.country.trim().length > 50) {
        errors.push("Country must not exceed 50 characters");
      }
    }

    if (!paymentMethod) {
      errors.push("Payment method is required");
    } else if (!["razorpay", "cod", "upi", "wallet"].includes(paymentMethod)) {
      errors.push("Invalid payment method. Must be one of: razorpay, cod, upi, wallet");
    }

    // Validate paymentId if payment method is razorpay
    if (paymentMethod === "razorpay" && !paymentId) {
      errors.push("Payment ID is required for Razorpay payments");
    }
    if (paymentMethod === "upi") {
      const normalizedUpiId = String(upiId || "").trim();
      if (!normalizedUpiId) {
        errors.push("UPI ID is required for UPI payments");
      } else if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(normalizedUpiId)) {
        errors.push("Enter a valid UPI ID");
      }
      if (!paymentId) {
        errors.push("Payment ID is required for UPI payments");
      }
    }

    // Validate notes if provided
    if (notes && notes.trim().length > 500) {
      errors.push("Notes must not exceed 500 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userObjectId }).populate({
      path: "items.product",
      select: "name price images stock isActive",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Filter cart items to only include selected items (if provided)
    let itemsToProcess = cart.items;
    if (selectedItemIds && Array.isArray(selectedItemIds) && selectedItemIds.length > 0) {
      // Validate all selected item IDs are valid ObjectIds
      const invalidIds = selectedItemIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        return res.status(400).json({ 
          message: "Invalid item IDs provided",
          invalidIds 
        });
      }
      
      itemsToProcess = cart.items.filter(item => 
        selectedItemIds.includes(item._id.toString())
      );
      
      if (itemsToProcess.length === 0) {
        return res.status(400).json({ message: "No valid items selected for checkout" });
      }
    }

    // Validate stock, check price changes, and prepare order items
    const orderItems = [];
    let subtotal = 0;
    const priceMismatches = [];

    for (const cartItem of itemsToProcess) {
      const product = cartItem.product;
      if (!product || !product.isActive) {
        return res
          .status(400)
          .json({ message: `Product ${product?.name || "Unknown"} is not available` });
      }

      // Check for price changes (Issue #5)
      if (cartItem.price !== product.price) {
        priceMismatches.push({
          product: product.name,
          cartPrice: cartItem.price,
          currentPrice: product.price
        });
      }

      // Use cart price instead of product price (Issue #1)
      const itemTotal = cartItem.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: cartItem.price, // Use cart price, not current product price
        quantity: cartItem.quantity,
        image: product.images?.[0]?.url || "",
      });
    }

    // Warn about price changes (Issue #5)
    if (priceMismatches.length > 0) {
      return res.status(400).json({
        message: "Product prices have changed. Please review your cart.",
        priceMismatches
      });
    }

    // Re-validate coupon at checkout (Issue #3)
    let discount = 0;
    let couponToUse = null;
    if (cart.coupon && cart.coupon.code) {
      const coupon = await Coupon.findOne({ code: cart.coupon.code });
      if (coupon) {
        const validation = coupon.isValid(subtotal);
        if (validation.valid) {
          discount = coupon.calculateDiscount(subtotal);
          couponToUse = {
            code: coupon.code,
            discount: discount
          };
        } else {
          // Remove invalid coupon
          cart.coupon = undefined;
          await cart.save();
          return res.status(400).json({
            message: "Coupon is no longer valid",
            couponError: validation.message
          });
        }
      } else {
        // Coupon not found, remove it
        cart.coupon = undefined;
        await cart.save();
      }
    }

    // Calculate totals
    const shipping = subtotal >= 500 ? 0 : 50; // Free shipping above 500
    const total = subtotal + shipping - discount;

    // Generate order number
    const orderNumber = Order.generateOrderNumber();

    // Use MongoDB transaction for atomic operations (Issue #4)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create order within transaction
      const orderData = {
        orderNumber,
        user: userObjectId,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        subtotal,
        shipping,
        discount,
        total,
        coupon: couponToUse,
        notes,
        paymentStatus: paymentMethod === "cod" ? "pending" : paymentId ? "paid" : "pending",
        orderStatus: "placed",
        paymentId: paymentId || undefined,
        upiId: paymentMethod === "upi" ? String(upiId || "").trim().toLowerCase() : undefined,
      };

      const orderArray = await Order.create([orderData], { session });
      const order = orderArray[0];

      // Atomic stock updates for multiple products (Issue #2 & #6)
      const bulkOps = itemsToProcess.map(cartItem => ({
        updateOne: {
          filter: { 
            _id: cartItem.product._id,
            stock: { $gte: cartItem.quantity } // Only update if stock is sufficient
          },
          update: { $inc: { stock: -cartItem.quantity } }
        }
      }));

      const stockUpdateResult = await Product.bulkWrite(bulkOps, { session });
      
      // Check if all stock updates succeeded
      if (stockUpdateResult.modifiedCount !== itemsToProcess.length) {
        // Some products didn't have enough stock
        const failedProducts = [];
        for (let i = 0; i < itemsToProcess.length; i++) {
          const product = await Product.findById(itemsToProcess[i].product._id).session(session);
          if (product.stock < itemsToProcess[i].quantity) {
            failedProducts.push({
              product: product.name,
              available: product.stock,
              requested: itemsToProcess[i].quantity
            });
          }
        }
        throw new Error(`Insufficient stock for: ${failedProducts.map(p => p.product).join(', ')}`);
      }

      // Increment coupon usage if coupon was applied (within transaction)
      if (couponToUse && couponToUse.code) {
        const coupon = await Coupon.findOne({ code: couponToUse.code }).session(session);
        if (coupon) {
          coupon.usedCount += 1;
          await coupon.save({ session });
        }
      }

      // Remove only selected items from cart (or all items if no selection specified)
      if (selectedItemIds && Array.isArray(selectedItemIds) && selectedItemIds.length > 0) {
        cart.items = cart.items.filter(item => 
          !selectedItemIds.includes(item._id.toString())
        );
        // Clear coupon if cart becomes empty after removing selected items
        if (cart.items.length === 0) {
          cart.coupon = undefined;
        }
      } else {
        // Remove all items and clear coupon
        cart.items = [];
        cart.coupon = undefined;
      }
      
      await cart.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Fetch the order with populated fields after transaction commits
      const populatedOrder = await Order.findById(order._id)
        .populate("user", "name email")
        .populate("items.product", "name images")
        .lean();

      if (!populatedOrder) {
        console.error("Order created but not found:", order._id);
        throw new Error("Order was created but could not be retrieved");
      }

      console.log("Order created successfully:", {
        orderId: populatedOrder._id,
        orderNumber: populatedOrder.orderNumber,
        userId: populatedOrder.user?._id || populatedOrder.user,
        status: populatedOrder.orderStatus
      });

      await sendOrderConfirmationEmail(populatedOrder);

      res.status(201).json({
        message: "Order created successfully",
        order: populatedOrder,
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      
      // If payment was already processed but order creation failed (Issue #7)
      if (paymentId && paymentMethod === "razorpay") {
        // Log for manual review - in production, you might want to initiate refund
        console.error("Order creation failed after payment:", {
          paymentId,
          userId,
          error: error.message
        });
        return res.status(500).json({
          message: "Order creation failed after payment. Please contact support with payment ID.",
          paymentId,
          error: error.message
        });
      }
      
      throw error;
    }

  } catch (error) {
    console.error("createOrder error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/orders - Get user's orders
export const getOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Ensure userId is ObjectId
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;

    const query = { user: userObjectId };
    if (status) {
      query.orderStatus = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      orders: orders || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getOrders error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/orders/:id - Get single order
export const getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId })
      .populate("items.product", "name images description")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("getOrderById error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/orders/reorder/:orderId - Reorder items from a previous order
export const reorderOrder = async (req, res) => {
  try {
    console.log("Reorder API hit");
    const userId = req.userId;
    const orderId = req.params?.orderId || req.body?.orderId;
    console.log("Order ID:", orderId, "User ID:", userId);

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Valid orderId is required" });
    }

    const order = await Order.findOne({ _id: orderId, user: userId }).lean();
    console.log("Order found:", Boolean(order));
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    console.log("Order item count:", Array.isArray(order.items) ? order.items.length : 0);
    if (!order.items || order.items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const addedItems = [];
    const skippedItems = [];

    for (const orderItem of order.items || []) {
      console.log("Processing item:", {
        itemId: orderItem?._id?.toString?.() || null,
        product: orderItem?.product?.toString?.() || null,
        productId: orderItem?.productId?.toString?.() || null,
        quantity: orderItem?.quantity,
        qty: orderItem?.qty,
      });
      const productRef = orderItem?.productId || orderItem?.product || "";
      const productId = String(productRef || "");
      const requestedQty = Number(orderItem?.quantity ?? orderItem?.qty ?? 0);

      if (!mongoose.Types.ObjectId.isValid(productId) || requestedQty < 1) {
        console.log("Invalid item data, skipping:", { productId, requestedQty });
        skippedItems.push({
          productId: productId || null,
          name: orderItem?.name || "Unknown product",
          quantity: requestedQty || 0,
          reason: "Invalid product data",
        });
        continue;
      }

      const product = await Product.findById(productId).select("name stock isActive price").lean();
      console.log("Product:", product ? { id: product._id, stock: product.stock, isActive: product.isActive } : null);
      if (!product || !product.isActive) {
        console.log("Product not found/inactive, skipping:", productId);
        skippedItems.push({
          productId,
          name: orderItem?.name || product?.name || "Unknown product",
          quantity: requestedQty,
          reason: "Product no longer available",
        });
        continue;
      }

      if (product.stock < requestedQty) {
        console.log("Out of stock, skipping:", { productId, requestedQty, stock: product.stock });
        skippedItems.push({
          productId,
          name: product.name || orderItem?.name || "Unknown product",
          quantity: requestedQty,
          availableStock: product.stock,
          reason: "Some items are out of stock",
        });
        continue;
      }

      const existingIndex = cart.items.findIndex((item) => item.product.toString() === productId);
      if (existingIndex !== -1) {
        const nextQty = Number(cart.items[existingIndex].quantity || 0) + requestedQty;
        if (nextQty > product.stock) {
          console.log("Cart merge exceeds stock, skipping:", { productId, nextQty, stock: product.stock });
          skippedItems.push({
            productId,
            name: product.name || orderItem?.name || "Unknown product",
            quantity: requestedQty,
            availableStock: product.stock,
            reason: "Some items are out of stock",
          });
          continue;
        }
        cart.items[existingIndex].quantity = nextQty;
        if (product.price < cart.items[existingIndex].price) {
          cart.items[existingIndex].price = product.price;
        }
      } else {
        cart.items.push({
          product: product._id,
          quantity: requestedQty,
          price: product.price,
        });
      }

      addedItems.push({
        productId,
        name: product.name || orderItem?.name || "Unknown product",
        quantity: requestedQty,
      });
    }

    if (addedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No available items to reorder",
        addedCount: 0,
        skippedCount: skippedItems.length,
        skippedItems,
      });
    }

    await cart.save();
    console.log("Cart updated:", { userId, addedCount: addedItems.length, skippedCount: skippedItems.length });

    const message =
      skippedItems.length > 0
        ? "Reorder completed with partial success"
        : "Items reordered successfully";

    return res.status(200).json({
      success: true,
      message,
      addedCount: addedItems.length,
      skippedCount: skippedItems.length,
      addedItems,
      skippedItems,
    });
  } catch (error) {
    console.error("reorderOrder error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// PUT /api/orders/:id/cancel - Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "delivered" || order.orderStatus === "cancelled") {
      return res.status(400).json({
        message: `Cannot cancel order with status: ${order.orderStatus}`,
      });
    }

    // Restore stock using atomic bulk operations
    const restoreOps = order.items.map(item => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: item.quantity } }
      }
    }));
    
    if (restoreOps.length > 0) {
      await Product.bulkWrite(restoreOps);
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancelledReason = reason || "Cancelled by user";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("cancelOrder error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/orders/request-refund/:orderId - User requests refund for cancelled UPI order
export const requestOrderRefund = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Only cancelled orders can be refunded",
      });
    }

    if (order.paymentMethod !== "upi") {
      return res.status(400).json({
        success: false,
        message: "Refund is only applicable for UPI orders",
      });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    if (!order.paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID missing",
      });
    }

    if (order.refundStatus && order.refundStatus !== "None") {
      return res.status(400).json({
        success: false,
        message: "Refund already requested or processed",
      });
    }

    order.refundStatus = "Requested";
    order.refundRequestedAt = new Date();
    await order.save();

    return res.json({
      success: true,
      message: "Refund requested successfully",
      refundStatus: order.refundStatus,
    });
  } catch (error) {
    console.error("requestOrderRefund error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST /api/orders/admin/:id/refund - Admin approves and processes refund via Razorpay
export const processOrderRefundByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision = "approve" } = req.body || {};
    const normalizedDecision = String(decision).toLowerCase();

    if (!["approve", "reject"].includes(normalizedDecision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be approve or reject",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.refundStatus !== "Requested") {
      return res.status(400).json({
        success: false,
        message: "Invalid refund state",
      });
    }

    if (normalizedDecision === "reject") {
      order.refundStatus = "Rejected";
      order.refundProcessedAt = new Date();
      await order.save();
      return res.json({
        success: true,
        message: "Refund request rejected",
        order,
      });
    }

    if (order.orderStatus !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order must be cancelled",
      });
    }
    if (order.paymentMethod !== "upi") {
      return res.status(400).json({
        success: false,
        message: "Refund is only applicable for UPI orders",
      });
    }
    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }
    if (!order.paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID missing",
      });
    }

    order.refundStatus = "Processing";
    await order.save();

    try {
      const keyId = process.env.RAZORPAY_KEY_ID || "";
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
      if (!keyId || !keySecret) {
        throw new Error("Razorpay keys are missing");
      }

      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      // Fetch payment details first to avoid requesting more than captured.
      const payment = await razorpay.payments.fetch(order.paymentId);
      const capturedAmountPaise = Number(payment?.amount || 0);
      const alreadyRefundedPaise = Number(payment?.amount_refunded || 0);
      const remainingRefundablePaise = capturedAmountPaise - alreadyRefundedPaise;

      if (remainingRefundablePaise <= 0 || payment?.status === "refunded") {
        order.refundStatus = "Completed";
        order.refundProcessedAt = new Date();
        order.paymentStatus = "refunded";
        await order.save();
        return res.json({
          success: true,
          message: "Payment is already fully refunded",
          refundId: order.refundId || "",
        });
      }

      const requestedAmountPaise = Math.round(Number(order.total || 0) * 100);
      if (!requestedAmountPaise || requestedAmountPaise <= 0) {
        throw new Error("Invalid refund amount");
      }

      const amountToRefundPaise = Math.min(requestedAmountPaise, remainingRefundablePaise);

      const refund = await razorpay.payments.refund(order.paymentId, {
        amount: amountToRefundPaise,
      });

      order.refundStatus = "Completed";
      order.refundId = refund?.id || "";
      order.refundProcessedAt = new Date();
      order.paymentStatus = "refunded";
      await order.save();

      return res.json({
        success: true,
        message: "Refund completed successfully",
        refundId: order.refundId,
      });
    } catch (refundError) {
      console.error("Admin refund processing error:", refundError);
      // Keep request pending so admin can retry after fixing payment mismatch/network issues.
      order.refundStatus = "Requested";
      await order.save();
      return res.status(500).json({
        success: false,
        message:
          refundError?.error?.description ||
          refundError?.description ||
          refundError?.message ||
          "Refund failed",
      });
    }
  } catch (error) {
    console.error("processOrderRefundByAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// PUT /api/orders/:id/return-request - User requests return/refund
export const requestReturnRefund = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "delivered") {
      return res.status(400).json({ message: "Return/refund can be requested only for delivered orders" });
    }

    if (order.returnRequest?.status === "requested") {
      return res.status(400).json({ message: "Return request is already pending" });
    }

    order.returnRequest = {
      status: "requested",
      reason: (reason || "").trim() || "No reason provided",
      requestedAt: new Date(),
      refundStatus: "pending",
      adminNote: "",
    };

    await order.save();
    res.json({ message: "Return/refund request submitted", order });
  } catch (error) {
    console.error("requestReturnRefund error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========== ADMIN ONLY ROUTES ==========

// GET /api/admin/orders - Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, refundStatus, orderNumber, userEmail, page = 1, limit = 50 } = req.query;

    const query = {};

    // Filter by order status
    if (status) {
      const normalizedStatus = String(status).toLowerCase();
      if (normalizedStatus === "processing" || normalizedStatus === "pending") {
        query.orderStatus = { $in: ["placed", "confirmed", "packed", "shipped"] };
      } else {
        query.orderStatus = status;
      }
    }

    // Filter by payment status
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (refundStatus) {
      query.refundStatus = refundStatus;
    }

    // Search by order number
    if (orderNumber) {
      query.orderNumber = new RegExp(orderNumber, "i");
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Build aggregation pipeline for user email search
    let ordersQuery = Order.find(query)
      .populate("user", "name email phone")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    let orders = await ordersQuery;

    // Filter by user email if provided
    if (userEmail) {
      orders = orders.filter(
        (order) =>
          order.user?.email?.toLowerCase().includes(userEmail.toLowerCase()) ||
          order.user?.name?.toLowerCase().includes(userEmail.toLowerCase())
      );
    }

    const total = await Order.countDocuments(query);

    res.json({
      orders: orders || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/admin/orders/:id - Get single order by ID (Admin only)
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("user", "name email phone")
      .populate("items.product", "name images description price stock")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("getOrderByIdAdmin error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/orders/:id/status - Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, trackingNumber, notes } = req.body;
    const normalizedStatus = orderStatus === "processing" ? "placed" : orderStatus;

    const validStatuses = ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"];
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const previousStatus = String(order.orderStatus || "");

    // If cancelling, restore stock using atomic bulk operations
    if (normalizedStatus === "cancelled" && order.orderStatus !== "cancelled") {
      const restoreOps = order.items.map(item => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: item.quantity } }
        }
      }));
      
      if (restoreOps.length > 0) {
        await Product.bulkWrite(restoreOps);
      }
      
      order.cancelledAt = new Date();
      order.cancelledReason = notes || "Cancelled by admin";
    }

    // If marking as delivered, update payment status if pending
    if (normalizedStatus === "delivered" && order.paymentStatus === "pending" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
    }

    order.orderStatus = normalizedStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("items.product", "name images")
      .lean();

    if (["shipped", "delivered"].includes(normalizedStatus) && previousStatus !== normalizedStatus) {
      await sendOrderStatusUpdateEmail(populatedOrder, previousStatus);
    }

    res.json({
      message: "Order status updated successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/orders/admin/:id/return-decision - Approve or reject user return/refund
export const decideReturnRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, adminNote } = req.body;

    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be approve or reject" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.returnRequest?.status !== "requested") {
      return res.status(400).json({ message: "No pending return request for this order" });
    }

    if (decision === "approve") {
      order.returnRequest.status = "approved";
      order.returnRequest.refundStatus = "processed";
      order.returnRequest.decidedAt = new Date();
      order.returnRequest.adminNote = adminNote || "Return approved by admin";
      order.orderStatus = "returned";
      if (order.paymentStatus === "paid") {
        order.paymentStatus = "refunded";
      }
    } else {
      order.returnRequest.status = "rejected";
      order.returnRequest.refundStatus = "rejected";
      order.returnRequest.decidedAt = new Date();
      order.returnRequest.adminNote = adminNote || "Return request rejected by admin";
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("items.product", "name images")
      .lean();

    res.json({
      message: `Return request ${decision}d successfully`,
      order: populatedOrder,
    });
  } catch (error) {
    console.error("decideReturnRefund error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/orders/:id/payment-status - Update payment status (Admin only)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;
    if (paymentStatus === "refunded" && order.returnRequest?.status && order.returnRequest.status !== "none") {
      order.returnRequest.refundStatus = "processed";
      if (order.returnRequest.status === "approved") {
        order.returnRequest.status = "completed";
      }
    }
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("items.product", "name images")
      .lean();

    res.json({
      message: "Payment status updated successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("updatePaymentStatus error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/orders/:id/invoice - Generate and download invoice PDF
export const generateInvoice = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId })
      .populate("user", "name email phone")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validate PDFDocument is available
    if (!PDFDocument) {
      return res.status(500).json({ message: "PDF generation not available" });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice-${order.orderNumber}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Company/Store Header
    doc.fontSize(24).font('Helvetica-Bold').text('Women\'s Health Store', 50, 50);
    doc.fontSize(12).font('Helvetica').text('Invoice', 50, 85);
    doc.moveDown();

    // Invoice Details
    doc.fontSize(10).font('Helvetica');
    doc.text(`Invoice Number: ${order.orderNumber}`, 50, 120);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })}`, 50, 135);
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 50, 150);
    if (order.paymentId) {
      doc.text(`Transaction ID: ${order.paymentId}`, 50, 165);
    }
    doc.moveDown();

    // Billing Address
    let yPos = 200;
    doc.fontSize(12).font('Helvetica-Bold').text('Billing Address:', 50, yPos);
    yPos += 20;
    doc.fontSize(10).font('Helvetica');
    doc.text(order.shippingAddress.name, 50, yPos);
    yPos += 15;
    doc.text(order.shippingAddress.addressLine1, 50, yPos);
    yPos += 15;
    if (order.shippingAddress.addressLine2) {
      doc.text(order.shippingAddress.addressLine2, 50, yPos);
      yPos += 15;
    }
    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
      50,
      yPos
    );
    yPos += 15;
    doc.text(`Phone: ${order.shippingAddress.phone}`, 50, yPos);

    // Shipping Address (same as billing for now)
    yPos = 200;
    doc.fontSize(12).font('Helvetica-Bold').text('Shipping Address:', 300, yPos);
    yPos += 20;
    doc.fontSize(10).font('Helvetica');
    doc.text(order.shippingAddress.name, 300, yPos);
    yPos += 15;
    doc.text(order.shippingAddress.addressLine1, 300, yPos);
    yPos += 15;
    if (order.shippingAddress.addressLine2) {
      doc.text(order.shippingAddress.addressLine2, 300, yPos);
      yPos += 15;
    }
    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
      300,
      yPos
    );
    yPos += 15;
    doc.text(`Phone: ${order.shippingAddress.phone}`, 300, yPos);

    // Items Table Header
    yPos = 320;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Item', 50, yPos);
    doc.text('Quantity', 300, yPos);
    doc.text('Price', 400, yPos);
    doc.text('Total', 480, yPos);

    // Draw line
    doc.moveTo(50, yPos + 15).lineTo(550, yPos + 15).stroke();

    // Items
    yPos += 30;
    doc.fontSize(10).font('Helvetica');
    order.items.forEach((item) => {
      const itemName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;
      doc.text(itemName, 50, yPos, { width: 240 });
      doc.text(item.quantity.toString(), 300, yPos);
      doc.text(`₹${item.price.toFixed(2)}`, 400, yPos);
      doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 480, yPos);
      yPos += 20;
      
      // Add new page if needed
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }
    });

    // Summary
    yPos += 20;
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
    yPos += 20;

    doc.text('Subtotal:', 400, yPos);
    doc.text(`₹${order.subtotal.toFixed(2)}`, 480, yPos);
    yPos += 20;

    doc.text('Shipping:', 400, yPos);
    doc.text(order.shipping === 0 ? 'FREE' : `₹${order.shipping.toFixed(2)}`, 480, yPos);
    yPos += 20;

    if (order.discount > 0) {
      doc.text(`Discount${order.coupon?.code ? ` (${order.coupon.code})` : ''}:`, 400, yPos);
      doc.text(`-₹${order.discount.toFixed(2)}`, 480, yPos);
      yPos += 20;
    }

    doc.fontSize(14).font('Helvetica-Bold');
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
    yPos += 20;
    doc.text('Total:', 400, yPos);
    doc.text(`₹${order.total.toFixed(2)}`, 480, yPos);

    // Footer
    yPos += 40;
    doc.fontSize(10).font('Helvetica');
    doc.text('Thank you for your purchase!', 50, yPos, { align: 'center' });
    doc.text('For any queries, please contact our support team.', 50, yPos + 15, { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("generateInvoice error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};
