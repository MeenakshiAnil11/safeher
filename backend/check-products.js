// backend/check-products.js
// Check products in database and test API

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Product from "./models/Product.js";

const checkProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    // Check total products
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products in database: ${totalProducts}\n`);

    if (totalProducts === 0) {
      console.log("❌ No products found in database!");
      console.log("💡 This is why products are not showing in the ecommerce module.");
      console.log("   You need to add products through the admin panel or create them manually.\n");
      await mongoose.connection.close();
      return;
    }

    // Check active vs inactive
    const activeProducts = await Product.countDocuments({ isActive: true });
    const inactiveProducts = await Product.countDocuments({ isActive: false });
    
    console.log(`   Active products: ${activeProducts}`);
    console.log(`   Inactive products: ${inactiveProducts}\n`);

    // Show sample products
    const products = await Product.find()
      .select("name price stock isActive category createdAt")
      .populate("category", "name")
      .limit(10)
      .lean();

    console.log("📦 Sample products:");
    products.forEach((product, idx) => {
      console.log(`   ${idx + 1}. ${product.name}`);
      console.log(`      Price: ₹${product.price}`);
      console.log(`      Stock: ${product.stock}`);
      console.log(`      Active: ${product.isActive ? "Yes" : "No"}`);
      console.log(`      Category: ${product.category?.name || "None"}`);
      console.log("");
    });

    // Test API endpoint
    console.log("\n🧪 Testing API endpoint...");
    try {
      const response = await fetch("http://localhost:5000/api/products?limit=10&includeInactive=true");
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ API working! Found ${data.products?.length || 0} products`);
        if (data.products && data.products.length > 0) {
          console.log(`   First product: ${data.products[0].name}`);
        }
      } else {
        console.log(`❌ API error: ${data.message || "Unknown error"}`);
      }
    } catch (apiErr) {
      console.log("⚠️  Could not test API (backend might not be running)");
      console.log("   Error:", apiErr.message);
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.message.includes("ENOTFOUND") || err.message.includes("getaddrinfo")) {
      console.error("\n💡 MongoDB connection failed. Check your connection.");
    }
    process.exit(1);
  }
};

checkProducts();
