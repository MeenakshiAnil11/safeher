import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { initSocket } from "./utils/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin early
import "./utils/firebaseAdmin.js";

import authRoutes from "./routes/authRoutes.js";
import periodRoutes from "./routes/periodRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; 
import healthRoutes from "./routes/healthRoutes.js";

// ✅ ADD THIS
import feedbackRoutes from "./routes/feedback.js";
import educationalContentRoutes from "./routes/educationalContentRoutes.js";
import trackerAdminRoutes from "./routes/trackerAdminRoutes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://safeher-4.onrender.com"],
    credentials: true,
  })
);

app.options("*", cors());

// Serve uploaded files - use absolute path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/periods", periodRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes); 
app.use("/api/health", healthRoutes);

// ✅ ADD THIS LINE BELOW YOUR OTHER ROUTES
app.use("/api/feedback", feedbackRoutes);
app.use("/api/educational-content", educationalContentRoutes);
app.use("/api/admin/tracker", trackerAdminRoutes);

// Public + user routes for helplines/resources
import helplineRoutes from "./routes/helplineRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import sosRoutes from "./routes/sosRoutes.js";
import fertilityRoutes from "./routes/fertilityRoutes.js";
import pregnancyRoutes from "./routes/pregnancyRoutes.js";
import perimenopauseRoutes from "./routes/perimenopauseRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import medicationRoutes from "./routes/medicationRoutes.js";
import vaccinationRoutes from "./routes/vaccinationRoutes.js";
import wellnessRoutes from "./routes/wellnessRoutes.js";
import babyNameRoutes from "./routes/babyNameRoutes.js";
import pregnancyResourceRoutes from "./routes/pregnancyResourceRoutes.js";
import pregnancyChatRoutes from "./routes/pregnancyChatRoutes.js";
import weeklyMessageRoutes from "./routes/weeklyMessageRoutes.js";
import partnerDashboardRoutes from "./routes/partnerDashboardRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import doctorProfileRoutes from "./routes/doctorProfileRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";

// E-commerce Routes
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

// ML Routes
import healthRiskRoutes from "./routes/healthRiskRoutes.js";
import symptomClassificationRoutes from "./routes/symptomClassificationRoutes.js";
import pregnancyHealthRoutes from "./routes/pregnancyHealthRoutes.js";
import moodPredictionRoutes from "./routes/moodPredictionRoutes.js";
import exerciseRecommendationRoutes from "./routes/exerciseRecommendationRoutes.js";

// Forum Routes
import forumRoutes from "./routes/forumRoutes.js";

// Subscription Routes
import subscriptionRoutes from "./routes/subscriptionRoutes.js";

// Address Routes
import addressRoutes from "./routes/addressRoutes.js";

app.use("/api/helplines", helplineRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/fertility", fertilityRoutes);
app.use("/api/pregnancy", pregnancyRoutes);
app.use("/api/perimenopause", perimenopauseRoutes);
app.use("/api/pregnancy/appointments", appointmentRoutes);
app.use("/api/pregnancy/medications", medicationRoutes);
app.use("/api/pregnancy/vaccinations", vaccinationRoutes);
app.use("/api/pregnancy/wellness", wellnessRoutes);
app.use("/api/pregnancy/baby-names", babyNameRoutes);
app.use("/api/pregnancy/resources", pregnancyResourceRoutes);
app.use("/api/pregnancy/chat", pregnancyChatRoutes);
app.use("/api/pregnancy/weekly-messages", weeklyMessageRoutes);
app.use("/api/pregnancy/partner-dashboard", partnerDashboardRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/doctor-profile", doctorProfileRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/activity", activityRoutes);

// E-commerce Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/analytics", analyticsRoutes);

// ML Routes
app.use("/api/health-risk", healthRiskRoutes);
app.use("/api/symptom-classification", symptomClassificationRoutes);
app.use("/api/pregnancy/health-prediction", pregnancyHealthRoutes);
app.use("/api/mood/prediction", moodPredictionRoutes);
app.use("/api/exercise", exerciseRecommendationRoutes);

// Forum Routes
app.use("/api/forum", forumRoutes);

// Subscription Routes
app.use("/api/subscription", subscriptionRoutes);

// Address Routes
app.use("/api/addresses", addressRoutes);

// User Telehealth Routes (must come first, before admin routes)
import userTelehealthRoutes from "./routes/userTelehealthRoutes.js";
app.use("/api/telehealth", userTelehealthRoutes);

// Telehealth Notification Routes
import telehealthNotificationRoutes from "./routes/telehealthNotificationRoutes.js";
app.use("/api/telehealth/notifications", telehealthNotificationRoutes);

// Telehealth Routes (Admin)
import telehealthRoutes from "./routes/telehealthRoutes.js";
app.use("/api/telehealth/admin", telehealthRoutes);

// Debug: Log all registered routes
console.log('🔧 Registered ML Routes:');
console.log('  - /api/health-risk/*');
console.log('  - /api/symptom-classification/*');
console.log('  - /api/pregnancy/health-prediction/*');
console.log('  - /api/mood/prediction/*');
console.log('  - /api/exercise/*');

// Health check route
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ ok: true, from: "backend" });
});

// Create HTTP server and attach Socket.io
const httpServer = createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (with Socket.io)`));
