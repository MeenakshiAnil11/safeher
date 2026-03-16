import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    coupon: {
      code: String,
      discount: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total price
cartSchema.methods.calculateTotal = function () {
  let subtotal = 0;
  this.items.forEach((item) => {
    subtotal += item.price * item.quantity;
  });
  
  const discount = this.coupon?.discount || 0;
  const total = subtotal - discount;
  
  return {
    subtotal: subtotal.toFixed(2),
    discount: discount.toFixed(2),
    total: Math.max(0, total).toFixed(2),
  };
};

// Get total items count
cartSchema.methods.getTotalItems = function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
