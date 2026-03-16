// backend/create-sample-products.js
// Create sample products for ecommerce module

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Product from "./models/Product.js";
import EcommerceCategory from "./models/EcommerceCategory.js";

const createSampleProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    // Get or create categories
    console.log("📁 Setting up categories...");
    let hygieneCategory = await EcommerceCategory.findOne({ slug: "hygiene" });
    let wellnessCategory = await EcommerceCategory.findOne({ slug: "wellness" });
    let supplementsCategory = await EcommerceCategory.findOne({ slug: "supplements" });
    let accessoriesCategory = await EcommerceCategory.findOne({ slug: "accessories" });

    if (!hygieneCategory) {
      hygieneCategory = await EcommerceCategory.create({
        name: "Hygiene & Care",
        slug: "hygiene",
        description: "Personal hygiene and care products",
        icon: "🧴",
        isActive: true,
      });
      console.log("   ✅ Created Hygiene category");
    }

    if (!wellnessCategory) {
      wellnessCategory = await EcommerceCategory.create({
        name: "Wellness",
        slug: "wellness",
        description: "Wellness and health products",
        icon: "💊",
        isActive: true,
      });
      console.log("   ✅ Created Wellness category");
    }

    if (!supplementsCategory) {
      supplementsCategory = await EcommerceCategory.create({
        name: "Supplements",
        slug: "supplements",
        description: "Health supplements and vitamins",
        icon: "💊",
        isActive: true,
      });
      console.log("   ✅ Created Supplements category");
    }

    if (!accessoriesCategory) {
      accessoriesCategory = await EcommerceCategory.create({
        name: "Accessories",
        slug: "accessories",
        description: "Health and wellness accessories",
        icon: "🎁",
        isActive: true,
      });
      console.log("   ✅ Created Accessories category");
    }

    console.log("\n📦 Creating sample products...\n");

    const sampleProducts = [
      {
        name: "Organic Sanitary Pads - Regular",
        shortDescription: "Comfortable and absorbent organic cotton sanitary pads",
        description: "Made with 100% organic cotton, these pads are gentle on your skin and provide excellent protection. Hypoallergenic and free from harmful chemicals.",
        price: 299,
        originalPrice: 399,
        stock: 50,
        category: hygieneCategory._id,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        rating: { average: 4.5, count: 120 },
        image: "/images/dummy-organic-pads.svg",
        images: [{ url: "/images/dummy-organic-pads.svg", alt: "Organic Sanitary Pads" }],
      },
      {
        name: "Menstrual Cup - Size Small",
        shortDescription: "Reusable menstrual cup for comfortable period care",
        description: "Eco-friendly and cost-effective menstrual cup. Made from medical-grade silicone, safe for up to 10 years of use.",
        price: 599,
        originalPrice: 799,
        stock: 30,
        category: hygieneCategory._id,
        isActive: true,
        isFeatured: true,
        isBestSeller: false,
        rating: { average: 4.7, count: 85 },
        image: "/images/dummy-menstrual-cup.svg",
        images: [{ url: "/images/dummy-menstrual-cup.svg", alt: "Menstrual Cup" }],
      },
      {
        name: "Prenatal Vitamins - 60 Tablets",
        shortDescription: "Essential vitamins and minerals for expecting mothers",
        description: "Comprehensive prenatal vitamin formula with folic acid, iron, calcium, and DHA. Supports healthy pregnancy and fetal development.",
        price: 899,
        originalPrice: 1199,
        stock: 25,
        category: supplementsCategory._id,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        rating: { average: 4.6, count: 200 },
        image: "/images/dummy-prenatal-vitamins.svg",
        images: [{ url: "/images/dummy-prenatal-vitamins.svg", alt: "Prenatal Vitamins" }],
      },
      {
        name: "Iron Supplement - 90 Capsules",
        shortDescription: "High-quality iron supplement for women",
        description: "Gentle iron supplement that's easy on the stomach. Helps prevent iron deficiency and supports energy levels.",
        price: 499,
        originalPrice: 699,
        stock: 40,
        category: supplementsCategory._id,
        isActive: true,
        isFeatured: false,
        isBestSeller: true,
        rating: { average: 4.4, count: 150 },
        image: "/images/dummy-iron-supplement.svg",
        images: [{ url: "/images/dummy-iron-supplement.svg", alt: "Iron Supplement" }],
      },
      {
        name: "Calcium + Vitamin D3 - 120 Tablets",
        shortDescription: "Bone health support for women of all ages",
        description: "Essential calcium and vitamin D3 combination for strong bones and teeth. Especially important during pregnancy and menopause.",
        price: 649,
        originalPrice: 899,
        stock: 35,
        category: supplementsCategory._id,
        isActive: true,
        isFeatured: false,
        isBestSeller: false,
        rating: { average: 4.5, count: 95 },
        image: "/images/dummy-calcium-d3.svg",
        images: [{ url: "/images/dummy-calcium-d3.svg", alt: "Calcium + Vitamin D3" }],
      },
      {
        name: "Period Tracker App Subscription - 1 Year",
        shortDescription: "Premium subscription for period tracking and health insights",
        description: "Access to advanced period tracking features, health predictions, personalized insights, and premium content.",
        price: 999,
        originalPrice: 1499,
        stock: 999, // Digital product
        category: wellnessCategory._id,
        isActive: true,
        isFeatured: true,
        isBestSeller: false,
        rating: { average: 4.8, count: 500 },
        image: "/images/dummy-period-subscription.svg",
        images: [{ url: "/images/dummy-period-subscription.svg", alt: "Period Tracker Subscription" }],
      },
      {
        name: "Heating Pad for Cramps",
        shortDescription: "Reusable heating pad for menstrual pain relief",
        description: "Soft, comfortable heating pad that provides soothing heat therapy for menstrual cramps and muscle tension.",
        price: 799,
        originalPrice: 999,
        stock: 20,
        category: accessoriesCategory._id,
        isActive: true,
        isFeatured: false,
        isBestSeller: true,
        rating: { average: 4.3, count: 75 },
        image: "/images/dummy-heating-pad.svg",
        images: [{ url: "/images/dummy-heating-pad.svg", alt: "Heating Pad for Cramps" }],
      },
      {
        name: "Pregnancy Support Belt",
        shortDescription: "Comfortable support belt for expecting mothers",
        description: "Provides gentle support for your growing belly, reducing back pain and improving posture during pregnancy.",
        price: 1299,
        originalPrice: 1799,
        stock: 15,
        category: accessoriesCategory._id,
        isActive: true,
        isFeatured: false,
        isBestSeller: false,
        rating: { average: 4.6, count: 60 },
        image: "/images/dummy-pregnancy-belt.svg",
        images: [{ url: "/images/dummy-pregnancy-belt.svg", alt: "Pregnancy Support Belt" }],
      },
    ];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const productData of sampleProducts) {
      try {
        // Check if product already exists
        const existing = await Product.findOne({ name: productData.name });
        if (existing) {
          const hasImage = typeof existing.image === "string" && existing.image.trim();
          const hasImagesArray = Array.isArray(existing.images) && existing.images.length > 0;
          if (!hasImage || !hasImagesArray) {
            existing.image = productData.image;
            existing.images = productData.images;
            await existing.save();
            console.log(`   🔄 Updated image: ${productData.name}`);
            updated++;
          } else {
            console.log(`   ⚠️  Skipped: ${productData.name} (already exists)`);
            skipped++;
          }
          continue;
        }

        const product = await Product.create(productData);
        console.log(`   ✅ Created: ${product.name} (₹${product.price})`);
        created++;
      } catch (err) {
        console.error(`   ❌ Error creating ${productData.name}:`, err.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created} products`);
    console.log(`   Updated: ${updated} products`);
    console.log(`   Skipped: ${skipped} products (already exist)`);
    console.log(`   Total products in database: ${await Product.countDocuments()}`);

    await mongoose.connection.close();
    console.log("\n✅ Done! Products should now appear in the ecommerce module.");
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.errors) {
      Object.keys(err.errors).forEach(key => {
        console.error(`   - ${key}: ${err.errors[key].message}`);
      });
    }
    process.exit(1);
  }
};

createSampleProducts();
