import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One wishlist per user
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ products: 1 });

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function (productId) {
  return this.products.some(
    (id) => id.toString() === productId.toString()
  );
};

// Method to add product
wishlistSchema.methods.addProduct = function (productId) {
  if (!this.hasProduct(productId)) {
    this.products.push(productId);
  }
};

// Method to remove product
wishlistSchema.methods.removeProduct = function (productId) {
  this.products = this.products.filter(
    (id) => id.toString() !== productId.toString()
  );
};

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
