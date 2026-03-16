import mongoose from "mongoose";
import dotenv from "dotenv";
import EcommerceCategory from "../models/EcommerceCategory.js";
import Product from "../models/Product.js";
import connectDB from "../config/db.js";

dotenv.config();

const categories = [
  {
    name: "Menstrual Care",
    slug: "menstrual-care",
    icon: "🩸",
    description: "Sanitary pads, tampons, menstrual cups & more",
    displayOrder: 1,
  },
  {
    name: "Pregnancy Care",
    slug: "pregnancy-care",
    icon: "🤰",
    description: "Prenatal vitamins, maternity wear & essentials",
    displayOrder: 2,
  },
  {
    name: "Wellness",
    slug: "wellness",
    icon: "💊",
    description: "Supplements, vitamins & health products",
    displayOrder: 3,
  },
  {
    name: "Personal Care",
    slug: "personal-care",
    icon: "✨",
    description: "Skincare, hygiene & self-care essentials",
    displayOrder: 4,
  },
];

const products = [
  // ========== MENSTRUAL CARE PRODUCTS ==========
  {
    name: "Organic Cotton Sanitary Pads - Regular",
    shortDescription: "Comfortable and absorbent organic cotton pads",
    description: "Made with 100% organic cotton, these sanitary pads are free from harmful chemicals and provide excellent absorbency. Perfect for regular flow days.",
    price: 299,
    originalPrice: 399,
    category: "menstrual-care",
    stock: 50,
    brand: "SafeHer",
    images: [
      { url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=500&fit=crop", alt: "Regular Sanitary Pads" },
      { url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=500&fit=crop", alt: "Regular Sanitary Pads Side View" },
    ],
    isFeatured: true,
    isBestSeller: true,
    tags: ["organic", "cotton", "regular"],
    specifications: {
      "Pack Size": "10 pads",
      "Material": "Organic Cotton",
      "Absorbency": "Regular",
    },
    healthBenefits: [
      "Free from harmful chemicals and toxins",
      "Reduces risk of skin irritation and allergies",
      "Breathable material prevents bacterial growth",
      "Comfortable for sensitive skin"
    ],
    usageInstructions: "Remove the pad from its wrapper. Peel off the adhesive backing and place the pad sticky side down on your underwear. Change every 4-6 hours or as needed. Dispose of used pads properly wrapped.",
    safetyInformation: {
      warnings: ["Do not flush pads down the toilet"],
      precautions: ["Change pads regularly to prevent odor and infection", "Store in a cool, dry place"],
      contraindications: [],
      sideEffects: []
    },
    ingredients: ["100% Organic Cotton", "Biodegradable Adhesive", "No Fragrances", "No Dyes"],
    manufacturer: "SafeHer Wellness Products"
  },
  {
    name: "Organic Cotton Sanitary Pads - Heavy Flow",
    shortDescription: "Extra absorbent pads for heavy flow days",
    description: "Maximum absorbency organic cotton pads designed for heavy flow days. Provides superior protection and comfort.",
    price: 349,
    originalPrice: 449,
    category: "menstrual-care",
    stock: 45,
    brand: "SafeHer",
    images: [
      { url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=500&fit=crop", alt: "Heavy Flow Sanitary Pads" },
    ],
    isFeatured: true,
    isBestSeller: false,
    tags: ["organic", "cotton", "heavy-flow"],
    specifications: {
      "Pack Size": "10 pads",
      "Material": "Organic Cotton",
      "Absorbency": "Heavy",
    },
  },
  {
    name: "Menstrual Cup - Size Small",
    shortDescription: "Reusable and eco-friendly menstrual cup",
    description: "Made from medical-grade silicone, this menstrual cup is reusable, eco-friendly, and can last for years. Comfortable and easy to use.",
    price: 599,
    originalPrice: 799,
    category: "menstrual-care",
    stock: 30,
    brand: "EcoFlow",
    images: [
      { url: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c4f?w=500&h=500&fit=crop", alt: "Menstrual Cup" },
      { url: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c4f?w=500&h=500&fit=crop", alt: "Menstrual Cup Close Up" },
    ],
    isFeatured: true,
    isBestSeller: true,
    tags: ["reusable", "eco-friendly", "silicone"],
    specifications: {
      "Size": "Small",
      "Material": "Medical Grade Silicone",
      "Capacity": "25ml",
    },
    healthBenefits: [
      "Eco-friendly and reusable, reducing waste",
      "No risk of Toxic Shock Syndrome",
      "Can be worn for up to 12 hours",
      "Cost-effective long-term solution"
    ],
    usageInstructions: "Wash hands thoroughly. Fold the cup and insert into the vagina. Rotate to ensure it opens fully and creates a seal. Remove by pinching the base to break the seal, then pull out gently. Empty contents, wash with mild soap, and reinsert. Sterilize by boiling for 5 minutes between cycles.",
    safetyInformation: {
      warnings: ["Consult a doctor if you experience unusual discomfort"],
      precautions: ["Wash hands before insertion and removal", "Clean thoroughly after each use", "Sterilize between cycles"],
      contraindications: ["Not recommended for IUD users without consulting a doctor"],
      sideEffects: ["Mild discomfort during initial use is normal"]
    },
    ingredients: ["Medical Grade Silicone"],
    manufacturer: "EcoFlow Health Products"
  },
  {
    name: "Menstrual Cup - Size Medium",
    shortDescription: "Medium size reusable menstrual cup",
    description: "Perfect for medium flow. Made from medical-grade silicone, comfortable and leak-proof design.",
    price: 649,
    originalPrice: 849,
    category: "menstrual-care",
    stock: 35,
    brand: "EcoFlow",
    images: [
      { url: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c4f?w=500&h=500&fit=crop", alt: "Menstrual Cup Medium" },
    ],
    isFeatured: false,
    isBestSeller: true,
    tags: ["reusable", "eco-friendly", "silicone"],
    specifications: {
      "Size": "Medium",
      "Material": "Medical Grade Silicone",
      "Capacity": "30ml",
    },
  },
  {
    name: "Organic Tampons - Regular (20 Pack)",
    shortDescription: "Organic cotton tampons for comfortable protection",
    description: "100% organic cotton tampons with smooth applicator. Free from chemicals, dyes, and fragrances.",
    price: 399,
    originalPrice: 499,
    category: "menstrual-care",
    stock: 40,
    brand: "PureFlow",
    images: [
      { url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=500&fit=crop", alt: "Organic Tampons" },
    ],
    isFeatured: false,
    isBestSeller: false,
    tags: ["organic", "tampons", "cotton"],
    specifications: {
      "Pack Size": "20 tampons",
      "Material": "Organic Cotton",
      "Absorbency": "Regular",
    },
  },
  {
    name: "Period Panties - Medium Size",
    shortDescription: "Reusable period underwear for leak-proof protection",
    description: "Comfortable, reusable period panties that can replace pads or tampons. Absorbent and leak-proof design.",
    price: 899,
    originalPrice: 1199,
    category: "menstrual-care",
    stock: 25,
    brand: "ComfortHer",
    images: [
      { url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=500&fit=crop", alt: "Period Panties" },
    ],
    isFeatured: true,
    isBestSeller: false,
    tags: ["reusable", "underwear", "eco-friendly"],
    specifications: {
      "Size": "Medium",
      "Material": "Bamboo Fiber",
      "Absorbency": "Medium",
    },
  },
  {
    name: "Menstrual Pain Relief Heat Patch",
    shortDescription: "Soothing heat patches for menstrual cramps",
    description: "Disposable heat patches that provide up to 8 hours of soothing heat to relieve menstrual cramps and discomfort.",
    price: 249,
    originalPrice: 349,
    category: "menstrual-care",
    stock: 60,
    brand: "ReliefHer",
    images: [
      { url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop", alt: "Heat Patch" },
    ],
    isFeatured: false,
    isBestSeller: true,
    tags: ["pain-relief", "heat-patch", "cramps"],
    specifications: {
      "Pack Size": "5 patches",
      "Duration": "8 hours",
      "Temperature": "40-45°C",
    },
  },
  {
    name: "Organic Panty Liners - 30 Pack",
    shortDescription: "Daily protection with organic cotton liners",
    description: "Light, breathable panty liners made from organic cotton. Perfect for daily use or light discharge.",
    price: 199,
    originalPrice: 299,
    category: "menstrual-care",
    stock: 70,
    brand: "SafeHer",
    images: [
      { url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=500&fit=crop", alt: "Panty Liners" },
    ],
    isFeatured: false,
    isBestSeller: false,
    tags: ["organic", "liners", "daily-use"],
    specifications: {
      "Pack Size": "30 liners",
      "Material": "Organic Cotton",
      "Thickness": "Ultra-thin",
    },
  },

  // ========== PREGNANCY CARE PRODUCTS ==========
  {
    name: "Prenatal Multivitamin - 60 Tablets",
    shortDescription: "Complete prenatal nutrition for expecting mothers",
    description: "Comprehensive prenatal multivitamin with folic acid, iron, and DHA. Supports healthy pregnancy and fetal development.",
    price: 899,
    originalPrice: 1199,
    category: "pregnancy-care",
    stock: 40,
    brand: "MamaCare",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop", alt: "Prenatal Vitamins" },
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop", alt: "Prenatal Vitamins Close Up" },
    ],
    isFeatured: true,
    isBestSeller: true,
    tags: ["prenatal", "vitamins", "folic-acid"],
    specifications: {
      "Tablets": "60",
      "Folic Acid": "800mcg",
      "Iron": "27mg",
    },
    healthBenefits: [
      "Prevents neural tube defects in developing babies",
      "Supports healthy fetal brain and spine development",
      "Reduces risk of anemia during pregnancy",
      "Supports maternal health and energy levels"
    ],
    usageInstructions: "Take one tablet daily with a meal or as directed by your healthcare provider. Best taken with food to reduce stomach upset. Do not exceed the recommended dosage.",
    safetyInformation: {
      warnings: ["Keep out of reach of children", "Do not take if allergic to any ingredients"],
      precautions: ["Consult your doctor before use", "May cause constipation - increase fiber intake", "Store in a cool, dry place"],
      contraindications: ["Not recommended if you have certain medical conditions - consult your doctor"],
      sideEffects: ["May cause mild nausea, constipation, or stomach upset"]
    },
    ingredients: ["Folic Acid", "Iron", "DHA", "Vitamin D", "Calcium", "Zinc", "Vitamin B12"],
    manufacturer: "MamaCare Pharmaceuticals"
  },
  {
    name: "Maternity Support Belt",
    shortDescription: "Comfortable support for growing belly",
    description: "Provides gentle support to your growing belly, reducing back pain and discomfort during pregnancy.",
    price: 1299,
    originalPrice: 1699,
    category: "pregnancy-care",
    stock: 25,
    brand: "ComfortMom",
    images: [
      { url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop", alt: "Maternity Belt" },
    ],
    isFeatured: false,
    isBestSeller: true,
    tags: ["maternity", "support", "comfort"],
    specifications: {
      "Size": "Adjustable",
      "Material": "Breathable Fabric",
      "Support Level": "Medium",
    },
  },
  {
    name: "Folic Acid Tablets - 90 Tablets",
    shortDescription: "Essential folic acid for healthy pregnancy",
    description: "High-quality folic acid supplement essential for preventing neural tube defects and supporting healthy fetal development.",
    price: 299,
    originalPrice: 399,
    category: "pregnancy-care",
    stock: 55,
    brand: "MamaCare",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop", alt: "Folic Acid Tablets" },
    ],
    isFeatured: true,
    isBestSeller: false,
    tags: ["folic-acid", "prenatal", "essential"],
    specifications: {
      "Tablets": "90",
      "Folic Acid": "5mg per tablet",
      "Dosage": "1 tablet daily",
    },
  },
  {
    name: "Pregnancy Pillow - U-Shaped",
    shortDescription: "Full body support pillow for comfortable sleep",
    description: "Ergonomic U-shaped pregnancy pillow provides support for your back, belly, and legs. Helps reduce discomfort and improve sleep quality.",
    price: 2499,
    originalPrice: 3299,
    category: "pregnancy-care",
    stock: 20,
    brand: "SleepWell",
    images: [
      { url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=500&fit=crop", alt: "Pregnancy Pillow" },
    ],
    isFeatured: true,
    isBestSeller: true,
    tags: ["pillow", "sleep", "comfort"],
    specifications: {
      "Shape": "U-Shaped",
      "Material": "Memory Foam",
      "Cover": "Removable & Washable",
    },
  },
  {
    name: "Stretch Mark Cream - 200ml",
    shortDescription: "Nourishing cream to prevent and reduce stretch marks",
    description: "Rich, hydrating cream with cocoa butter and vitamin E. Helps prevent and reduce the appearance of stretch marks during and after pregnancy.",
    price: 599,
    originalPrice: 799,
    category: "pregnancy-care",
    stock: 35,
    brand: "MamaCare",
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop", alt: "Stretch Mark Cream" },
    ],
    isFeatured: false,
    isBestSeller: true,
    tags: ["skincare", "stretch-marks", "moisturizer"],
    specifications: {
      "Volume": "200ml",
      "Key Ingredients": "Cocoa Butter, Vitamin E",
      "Usage": "Apply twice daily",
    },
  },
  {
    name: "Pregnancy Test Kit - 2 Pack",
    shortDescription: "Accurate early pregnancy detection",
    description: "Highly sensitive pregnancy test kit that can detect pregnancy as early as 6 days before your missed period.",
    price: 199,
    originalPrice: 299,
    category: "pregnancy-care",
    stock: 80,
    brand: "TestHer",
    images: [
      { url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop", alt: "Pregnancy Test" },
    ],
    isFeatured: false,
    isBestSeller: false,
    tags: ["test-kit", "pregnancy-test", "early-detection"],
    specifications: {
      "Pack Size": "2 tests",
      "Accuracy": "99%",
      "Detection": "6 days before missed period",
    },
  },
  {
    name: "Maternity Nursing Bra - Pack of 2",
    shortDescription: "Comfortable and supportive nursing bras",
    description: "Soft, stretchy nursing bras designed for comfort during pregnancy and breastfeeding. Easy clip-down design for convenient feeding.",
    price: 899,
    originalPrice: 1199,
    category: "pregnancy-care",
    stock: 30,
    brand: "ComfortMom",
    images: [
      { url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=500&fit=crop", alt: "Nursing Bra" },
    ],
    isFeatured: true,
    isBestSeller: false,
    tags: ["nursing-bra", "maternity", "comfort"],
    specifications: {
      "Pack Size": "2 bras",
      "Sizes": "S, M, L, XL",
      "Material": "Cotton & Spandex",
    },
  },
  {
    name: "DHA Omega-3 Supplement - 60 Capsules",
    shortDescription: "Essential DHA for baby's brain development",
    description: "High-quality DHA omega-3 supplement derived from algae. Essential for fetal brain and eye development during pregnancy.",
    price: 799,
    originalPrice: 999,
    category: "pregnancy-care",
    stock: 40,
    brand: "MamaCare",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop", alt: "DHA Supplement" },
    ],
    isFeatured: false,
    isBestSeller: true,
    tags: ["dha", "omega-3", "brain-development"],
    specifications: {
      "Capsules": "60",
      "DHA per capsule": "200mg",
      "Source": "Algae-based",
    },
  },

  // ========== WELLNESS PRODUCTS ==========
  {
    name: "Iron Supplement - 30 Capsules",
    shortDescription: "High-absorption iron for energy and wellness",
    description: "Gentle on stomach, high-absorption iron supplement to combat iron deficiency and boost energy levels.",
    price: 499,
    originalPrice: 699,
    category: "wellness",
    stock: 60,
    brand: "VitalHer",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop", alt: "Iron Supplement" },
    ],
    isFeatured: true,
    isBestSeller: false,
    tags: ["iron", "supplement", "energy"],
    specifications: {
      "Capsules": "30",
      "Iron Content": "65mg",
      "Type": "Ferrous Fumarate",
    },
    healthBenefits: [
      "Prevents and treats iron deficiency anemia",
      "Boosts energy levels and reduces fatigue",
      "Supports healthy red blood cell production",
      "Improves cognitive function and concentration"
    ],
    usageInstructions: "Take one capsule daily with food or as directed by your healthcare provider. Best taken with vitamin C-rich foods to enhance absorption. Avoid taking with tea or coffee as they can reduce absorption.",
    safetyInformation: {
      warnings: ["Keep out of reach of children", "Iron overdose can be dangerous"],
      precautions: ["May cause constipation - increase fiber and water intake", "May darken stools - this is normal"],
      contraindications: ["Not recommended if you have hemochromatosis or other iron storage diseases"],
      sideEffects: ["May cause constipation, nausea, or stomach upset"]
    },
    ingredients: ["Ferrous Fumarate", "Vitamin C", "Folic Acid"],
    manufacturer: "VitalHer Supplements"
  },
  {
    name: "Calcium + Vitamin D3 - 60 Tablets",
    shortDescription: "Strong bones and healthy teeth",
    description: "Essential calcium and vitamin D3 supplement for maintaining strong bones and healthy teeth.",
    price: 399,
    originalPrice: 599,
    category: "wellness",
    stock: 45,
    brand: "BoneHealth",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop", alt: "Calcium Vitamin D" },
    ],
    isFeatured: false,
    isBestSeller: true,
    tags: ["calcium", "vitamin-d", "bones"],
    specifications: {
      "Tablets": "60",
      "Calcium": "500mg",
      "Vitamin D3": "1000 IU",
    },
  },
  {
    name: "Women's Multivitamin - 90 Tablets",
    shortDescription: "Complete daily nutrition for women",
    description: "Comprehensive multivitamin specially formulated for women's health needs. Includes essential vitamins and minerals.",
    price: 699,
    originalPrice: 899,
    category: "wellness",
    stock: 50,
    brand: "VitalHer",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop", alt: "Women's Multivitamin" },
    ],
    isFeatured: true,
    isBestSeller: true,
    tags: ["multivitamin", "women-health", "daily-nutrition"],
    specifications: {
      "Tablets": "90",
      "Key Vitamins": "A, B, C, D, E",
      "Minerals": "Iron, Calcium, Zinc",
    },
  },
  {
    name: "Probiotics for Women - 30 Capsules",
    shortDescription: "Gut health and immune support",
    description: "Specially formulated probiotics for women's digestive and immune health. Contains 50 billion CFU per capsule.",
    price: 899,
    originalPrice: 1199,
    category: "wellness",
    stock: 35,
    brand: "GutHealth",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop", alt: "Probiotics" },
    ],
    isFeatured: true,
    isBestSeller: false,
    tags: ["probiotics", "gut-health", "immune-support"],
    specifications: {
      "Capsules": "30",
      "CFU": "50 billion per capsule",
      "Strains": "10 beneficial strains",
    },
  },
  {
    name: "Vitamin B12 Complex - 60 Tablets",
    shortDescription: "Energy boost and nerve health support",
    description: "High-potency B12 complex supplement to boost energy, support nerve health, and improve mood.",
    price: 449,
    originalPrice: 649,
    category: "wellness",
    stock: 55,
    brand: "VitalHer",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop", alt: "Vitamin B12" },
    ],
    isFeatured: false,
    isBestSeller: true,
    tags: ["b12", "energy", "nerve-health"],
    specifications: {
      "Tablets": "60",
      "B12 per tablet": "1000mcg",
      "Form": "Methylcobalamin",
    },
  },
  {
    name: "Magnesium Supplement - 60 Tablets",
    shortDescription: "Muscle relaxation and sleep support",
    description: "High-absorption magnesium supplement to support muscle function, reduce cramps, and promote better sleep.",
    price: 549,
    originalPrice: 749,
    category: "wellness",
    stock: 40,
    brand: "RelaxHer",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop", alt: "Magnesium Supplement" },
    ],
    isFeatured: false,
    isBestSeller: false,
    tags: ["magnesium", "muscle-relaxation", "sleep"],
    specifications: {
      "Tablets": "60",
      "Magnesium": "400mg per tablet",
      "Form": "Magnesium Citrate",
    },
  },
  {
    name: "Zinc + Vitamin C - 60 Tablets",
    shortDescription: "Immune system support and antioxidant",
    description: "Powerful combination of zinc and vitamin C to boost immune system and provide antioxidant protection.",
    price: 399,
    originalPrice: 599,
    category: "wellness",
    stock: 65,
    brand: "ImmuneBoost",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop", alt: "Zinc Vitamin C" },
    ],
    isFeatured: true,
    isBestSeller: true,
    tags: ["zinc", "vitamin-c", "immune-support"],
    specifications: {
      "Tablets": "60",
      "Zinc": "15mg",
      "Vitamin C": "1000mg",
    },
  },
  {
    name: "Evening Primrose Oil - 60 Capsules",
    shortDescription: "Hormonal balance and skin health",
    description: "Natural evening primrose oil supplement to support hormonal balance, reduce PMS symptoms, and promote healthy skin.",
    price: 649,
    originalPrice: 849,
    category: "wellness",
    stock: 30,
    brand: "BalanceHer",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop", alt: "Evening Primrose Oil" },
    ],
    isFeatured: false,
    isBestSeller: false,
    tags: ["hormonal-balance", "pms", "skin-health"],
    specifications: {
      "Capsules": "60",
      "Oil per capsule": "1000mg",
      "GLA": "10%",
    },
  },

  // ========== PERSONAL CARE PRODUCTS ==========
  {
    name: "Gentle Face Cleanser",
    shortDescription: "pH-balanced cleanser for sensitive skin",
    description: "Mild, pH-balanced face cleanser suitable for sensitive skin. Removes impurities without stripping natural oils.",
    price: 349,
    originalPrice: 499,
    category: "personal-care",
    stock: 70,
    brand: "PureSkin",
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop", alt: "Face Cleanser" },
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop", alt: "Face Cleanser Close Up" },
    ],
    isFeatured: true,
    isBestSeller: false,
    tags: ["skincare", "cleanser", "sensitive-skin"],
    specifications: {
      "Volume": "150ml",
      "pH Level": "5.5",
      "Skin Type": "All Types",
    },
    healthBenefits: [
      "Maintains skin's natural pH balance",
      "Gently removes impurities without over-drying",
      "Suitable for sensitive and acne-prone skin",
      "Prevents skin irritation and breakouts"
    ],
    usageInstructions: "Wet your face with lukewarm water. Apply a small amount of cleanser to your hands and work into a lather. Gently massage onto your face in circular motions for 30-60 seconds. Rinse thoroughly with water and pat dry. Use morning and evening.",
    safetyInformation: {
      warnings: ["Avoid contact with eyes", "Discontinue use if irritation occurs"],
      precautions: ["Patch test before first use", "Store in a cool, dry place"],
      contraindications: ["Not recommended if you have known allergies to any ingredients"],
      sideEffects: ["Rare: mild irritation or dryness"]
    },
    ingredients: ["Purified Water", "Glycerin", "Sodium Lauryl Sulfoacetate", "Aloe Vera Extract", "Chamomile Extract"],
    manufacturer: "PureSkin Cosmetics"
  },
  {
    name: "Moisturizing Body Lotion",
    shortDescription: "Deep hydration for dry skin",
    description: "Rich, nourishing body lotion with natural ingredients. Provides 24-hour hydration and leaves skin soft and smooth.",
    price: 449,
    originalPrice: 599,
    category: "personal-care",
    stock: 55,
    brand: "HydrateHer",
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop", alt: "Body Lotion" },
    ],
    isFeatured: false,
    isBestSeller: true,
    tags: ["moisturizer", "body-care", "hydration"],
    specifications: {
      "Volume": "400ml",
      "Key Ingredients": "Shea Butter, Aloe Vera",
      "Fragrance": "Unscented",
    },
  },
  {
    name: "Vitamin C Serum - 30ml",
    shortDescription: "Brightening and anti-aging serum",
    description: "Potent vitamin C serum to brighten skin, reduce dark spots, and fight signs of aging. Suitable for all skin types.",
    price: 799,
    originalPrice: 1099,
    category: "personal-care",
    stock: 40,
    brand: "GlowHer",
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop", alt: "Vitamin C Serum" },
    ],
    isFeatured: true,
    isBestSeller: true,
    tags: ["serum", "vitamin-c", "anti-aging"],
    specifications: {
      "Volume": "30ml",
      "Vitamin C": "20%",
      "Usage": "Apply morning and evening",
    },
  },
  {
    name: "Hyaluronic Acid Moisturizer - 50ml",
    shortDescription: "Intense hydration for plump, glowing skin",
    description: "Lightweight moisturizer with hyaluronic acid that provides intense hydration without feeling heavy or greasy.",
    price: 599,
    originalPrice: 799,
    category: "personal-care",
    stock: 50,
    brand: "HydrateHer",
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop", alt: "Hyaluronic Acid Moisturizer" },
    ],
    isFeatured: true,
    isBestSeller: false,
    tags: ["moisturizer", "hyaluronic-acid", "hydration"],
    specifications: {
      "Volume": "50ml",
      "Hyaluronic Acid": "2%",
      "Skin Type": "All Types",
    },
  },
  {
    name: "Gentle Exfoliating Scrub - 100ml",
    shortDescription: "Natural exfoliant for smooth, radiant skin",
    description: "Gentle exfoliating scrub with natural ingredients to remove dead skin cells and reveal smoother, brighter skin.",
    price: 449,
    originalPrice: 649,
    category: "personal-care",
    stock: 45,
    brand: "PureSkin",
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop", alt: "Exfoliating Scrub" },
    ],
    isFeatured: false,
    isBestSeller: true,
    tags: ["exfoliant", "scrub", "radiant-skin"],
    specifications: {
      "Volume": "100ml",
      "Key Ingredients": "Jojoba Beads, Aloe Vera",
      "Usage": "2-3 times per week",
    },
  },
  {
    name: "SPF 50 Sunscreen - 50ml",
    shortDescription: "Broad spectrum protection from UV rays",
    description: "Lightweight, non-greasy sunscreen with SPF 50 that provides broad spectrum protection against UVA and UVB rays.",
    price: 499,
    originalPrice: 699,
    category: "personal-care",
    stock: 60,
    brand: "ProtectHer",
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop", alt: "Sunscreen" },
    ],
    isFeatured: true,
    isBestSeller: true,
    tags: ["sunscreen", "spf", "uv-protection"],
    specifications: {
      "Volume": "50ml",
      "SPF": "50",
      "Protection": "Broad Spectrum",
    },
  },
  {
    name: "Nourishing Hair Oil - 100ml",
    shortDescription: "Deep conditioning treatment for healthy hair",
    description: "Rich hair oil blend with argan, coconut, and jojoba oils to nourish, strengthen, and add shine to your hair.",
    price: 399,
    originalPrice: 599,
    category: "personal-care",
    stock: 50,
    brand: "HairCare",
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop", alt: "Hair Oil" },
    ],
    isFeatured: false,
    isBestSeller: false,
    tags: ["hair-oil", "conditioning", "hair-care"],
    specifications: {
      "Volume": "100ml",
      "Key Oils": "Argan, Coconut, Jojoba",
      "Usage": "Apply to hair and scalp",
    },
  },
  {
    name: "Intimate Wash - 200ml",
    shortDescription: "pH-balanced intimate hygiene wash",
    description: "Gentle, pH-balanced intimate wash specially formulated to maintain natural pH balance and prevent irritation.",
    price: 299,
    originalPrice: 399,
    category: "personal-care",
    stock: 65,
    brand: "PureHer",
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop", alt: "Intimate Wash" },
    ],
    isFeatured: false,
    isBestSeller: true,
    tags: ["intimate-care", "hygiene", "ph-balanced"],
    specifications: {
      "Volume": "200ml",
      "pH Level": "3.5-4.5",
      "Key Ingredients": "Lactic Acid, Aloe Vera",
    },
  },
  {
    name: "Lip Balm with SPF 30 - 4.5g",
    shortDescription: "Moisturizing lip balm with sun protection",
    description: "Hydrating lip balm with SPF 30 to protect and moisturize your lips. Contains natural emollients and antioxidants.",
    price: 149,
    originalPrice: 249,
    category: "personal-care",
    stock: 80,
    brand: "ProtectHer",
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop", alt: "Lip Balm" },
    ],
    isFeatured: false,
    isBestSeller: false,
    tags: ["lip-balm", "spf", "moisturizer"],
    specifications: {
      "Weight": "4.5g",
      "SPF": "30",
      "Key Ingredients": "Beeswax, Shea Butter",
    },
  },
  {
    name: "Body Wash - Lavender - 300ml",
    shortDescription: "Soothing lavender body wash for relaxation",
    description: "Gentle body wash infused with lavender essential oil. Cleanses while providing a calming, relaxing experience.",
    price: 349,
    originalPrice: 499,
    category: "personal-care",
    stock: 55,
    brand: "RelaxHer",
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop", alt: "Body Wash" },
    ],
    isFeatured: false,
    isBestSeller: true,
    tags: ["body-wash", "lavender", "relaxing"],
    specifications: {
      "Volume": "300ml",
      "Fragrance": "Lavender",
      "Skin Type": "All Types",
    },
  },
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log("✅ Connected to database");

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await EcommerceCategory.deleteMany({});
    // await Product.deleteMany({});
    // console.log("🗑️  Cleared existing data");

    // Seed categories
    console.log("📦 Seeding categories...");
    const categoryMap = {};

    for (const catData of categories) {
      const existing = await EcommerceCategory.findOne({ slug: catData.slug });
      if (existing) {
        categoryMap[catData.slug] = existing._id;
        console.log(`   ✓ Category "${catData.name}" already exists`);
      } else {
        const category = await EcommerceCategory.create(catData);
        categoryMap[catData.slug] = category._id;
        console.log(`   ✓ Created category: ${catData.name}`);
      }
    }

    // Seed products
    console.log("🛍️  Seeding products...");
    for (const productData of products) {
      const categoryId = categoryMap[productData.category];
      if (!categoryId) {
        console.log(`   ⚠️  Category "${productData.category}" not found, skipping product`);
        continue;
      }

      const existing = await Product.findOne({ name: productData.name });
      if (existing) {
        console.log(`   ✓ Product "${productData.name}" already exists`);
      } else {
        const product = await Product.create({
          ...productData,
          category: categoryId,
        });
        console.log(`   ✓ Created product: ${productData.name}`);
      }
    }

    console.log("\n✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
