# SafeHer WELLNESS SPACE - Complete Project Overview

## 🎯 Project Introduction

**SafeHer WELLNESS SPACE** is a comprehensive women's health and safety application designed to empower women with tools for health tracking, emergency assistance, e-commerce, and wellness management. The platform serves both regular users and administrators with role-based access control.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Modules](#core-modules)
3. [User Features](#user-features)
4. [Admin Features](#admin-features)
5. [E-Commerce Module](#e-commerce-module)
6. [Project Flow](#project-flow)
7. [Technology Stack](#technology-stack)
8. [Database Models](#database-models)

---

## 🏗️ Architecture Overview

### **Frontend (React.js)**
- **Location**: `client/src/`
- **Framework**: React with React Router for navigation
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Styling**: CSS modules and inline styles
- **API Communication**: Axios-based API service

### **Backend (Node.js/Express)**
- **Location**: `backend/`
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **File Upload**: Multer for image handling
- **Payment Gateway**: Razorpay integration

### **Project Structure**
```
miniproject-copy/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/
├── backend/                # Node.js backend
│   ├── models/            # Mongoose models
│   ├── controllers/       # Business logic
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & validation
│   └── utils/             # Helper functions
└── uploads/               # Static file storage
```

---

## 🧩 Core Modules

### **1. Authentication & User Management**

#### **User Features:**
- **Registration**: Email/password signup with validation
- **Login**: JWT-based authentication
- **OAuth Integration**: Google OAuth login
- **Password Recovery**: Forgot password with email reset
- **Profile Management**: Update personal information, avatar
- **Settings**: Privacy settings, notifications, account management

#### **Admin Features:**
- **Admin Login**: Separate admin authentication
- **User Management**: View all users, search, filter, block/unblock
- **User Analytics**: User statistics and activity tracking

#### **Key Files:**
- `backend/models/User.js`
- `backend/controllers/authController.js`
- `backend/routes/authRoutes.js`
- `client/src/pages/Login.jsx`
- `client/src/pages/Register.jsx`
- `client/src/pages/Profile.jsx`
- `client/src/pages/admin/AdminUsers.jsx`

---

### **2. Period Tracking Module** 🩸

A comprehensive menstrual health tracking system with multiple modes:

#### **A. Period Tracking Mode**
- **Calendar View**: Visual calendar with period days highlighted
- **Cycle Logging**: Log start/end dates, flow intensity, symptoms
- **Cycle History**: View past cycles with statistics
- **Health Insights**: Cycle length analysis, predictions
- **Reminders**: Period start/end reminders
- **Educational Content**: Articles and resources
- **Exercise Recommendations**: ML-based exercise suggestions
- **Community Support**: User community features

#### **B. Conceive Mode** 👶
- **Fertility Tracking**: 
  - Basal Body Temperature (BBT) logging
  - Cervical mucus monitoring
  - Cervical position tracking
  - Ovulation test results
  - Intercourse logging
- **Fertility Insights**: 
  - Ovulation prediction
  - Fertile window calculation
  - Cycle analysis
  - BBT pattern recognition
- **Conceive Articles**: Educational content for conception
- **Dashboard**: Comprehensive fertility dashboard

#### **C. Pregnancy Mode** 🤰
- **Pregnancy Dashboard**: Week-by-week tracking
- **Health Logging**: 
  - Weight tracking
  - Blood pressure monitoring
  - Blood sugar levels
  - Fetal movement tracking
  - Symptom logging (nausea, fatigue, mood)
- **Baby Development Tracker**: Week-by-week baby growth
- **Appointment Tracker**: Medical appointments management
- **Medication Tracker**: Track medications and supplements
- **Vaccination Tracker**: Vaccination schedule
- **Pregnancy Chat**: AI-powered pregnancy chat assistant
- **Pregnancy Resource Hub**: Educational resources
- **Weekly Messages**: Personalized weekly updates
- **Partner Dashboard**: Shareable dashboard for partners
- **Baby Name Suggestion**: Name suggestions and bookmarking
- **Wellness Tracker**: Nutrition, exercise, sleep tracking

#### **D. Perimenopause Mode** 🧬
- **Symptom Tracking**: Hot flashes, night sweats, mood swings
- **Cycle Irregularity Tracking**: Monitor cycle changes
- **Sleep Quality Tracking**: Sleep patterns and interruptions
- **Weight & Body Changes**: Track physical changes
- **Exercise & Activity Logs**: Activity monitoring
- **Medications & Treatments**: Track hormone therapy, supplements
- **Medical Appointments**: Appointment management
- **Perimenopause Reports**: Health reports and insights
- **Community Support**: Perimenopause community

#### **Key Files:**
- `backend/models/Period.js`
- `backend/models/FertilityLog.js`
- `backend/models/PregnancyLog.js`
- `backend/models/PerimenopauseLog.js`
- `backend/controllers/periodController.js`
- `backend/controllers/fertilityController.js`
- `backend/controllers/pregnancyController.js`
- `backend/controllers/perimenopauseController.js`
- `client/src/pages/PeriodTracker.jsx`
- `client/src/pages/PeriodTracker/PeriodTrackingOverview.jsx`
- `client/src/pages/PeriodTracker/ConceiveDashboard.jsx`
- `client/src/pages/PeriodTracker/PregnancyModeDashboard.jsx`
- `client/src/pages/PeriodTracker/PerimenopauseDashboard.jsx`

#### **Admin Features:**
- View all period records
- Search and filter period data
- Manage educational content
- Manage exercise recommendations
- View user health data

---

### **3. Health Tracker Module** 💊

General health tracking beyond period tracking:

- **Vitals Tracking**: Blood pressure, heart rate, temperature, weight
- **Symptom Logging**: Track various symptoms
- **Mood Tracking**: Daily mood logging with ML predictions
- **Sleep Tracking**: Sleep hours and quality
- **Nutrition Logging**: Food intake and nutrition tracking
- **Exercise Logging**: Physical activity tracking
- **Health Goals**: Set and track health goals
- **Health Risk Assessment**: ML-based health risk prediction
- **Symptom Classification**: AI-powered symptom analysis

#### **Key Files:**
- `backend/models/Vital.js`
- `backend/models/Symptom.js`
- `backend/models/MoodLog.js`
- `backend/models/Sleep.js`
- `backend/models/Nutrition.js`
- `backend/models/HealthGoal.js`
- `backend/controllers/healthController.js`
- `backend/routes/healthRoutes.js`
- `client/src/pages/Health.jsx`
- `client/src/pages/HealthLanding.jsx`

---

### **4. SOS & Emergency Module** 🚨

Critical safety feature for emergency situations:

#### **Features:**
- **SOS Button**: One-click emergency alert
- **Location Tracking**: Automatic GPS location capture
- **Emergency Contacts**: Manage trusted contacts
- **Multi-Channel Alerts**:
  - Email alerts to emergency contacts
  - SMS notifications (Twilio integration)
  - Push notifications (Firebase Cloud Messaging)
- **Location Sharing**: Google Maps links with coordinates
- **SOS History**: View past SOS alerts
- **Admin SOS Logs**: Admin can view and manage all SOS alerts

#### **Key Files:**
- `backend/models/SOSLogs.js`
- `backend/models/Contact.js`
- `backend/controllers/sosController.js`
- `backend/routes/sosRoutes.js`
- `client/src/screens/Dashboard.js` (SOS button)
- `client/src/pages/admin/AdminSOSLogs.jsx`

---

### **5. Location Tracking Module** 📍

Comprehensive location-based safety features:

#### **Features:**
- **Live Map**: Real-time location tracking on map
- **Location History**: View past location records
- **Safe Zones**: Define and manage safe zones
- **SOS Alerts**: Emergency alerts with location
- **Dashboard Overview**: Location statistics and insights
- **Location Sharing**: Share location with trusted contacts

#### **Key Files:**
- `backend/models/SafeZone.js`
- `backend/controllers/locationController.js`
- `backend/routes/locationRoutes.js`
- `client/src/pages/LocationTracking.jsx`
- `client/src/pages/LocationTracking/LiveMap.jsx`
- `client/src/pages/LocationTracking/LocationHistory.jsx`
- `client/src/pages/LocationTracking/SafeZones.jsx`
- `client/src/pages/LocationTracking/SOSAlerts.jsx`

---

### **6. Helplines & Resources Module** 📞

Access to emergency helplines and resources:

#### **Features:**
- **Helpline Directory**: List of emergency helplines
- **Resource Library**: Educational resources and articles
- **Resource Submission**: Users can submit resources
- **Category Filtering**: Filter by categories
- **Search Functionality**: Search helplines and resources
- **Bookmarking**: Save favorite resources

#### **Admin Features:**
- Manage helplines (CRUD operations)
- Manage resources (approve/reject user submissions)
- Categorize resources
- View resource statistics

#### **Key Files:**
- `backend/models/Helpline.js`
- `backend/models/Resource.js`
- `backend/controllers/helplineController.js`
- `backend/controllers/resourceController.js`
- `client/src/pages/Helplines.jsx`
- `client/src/pages/Resources.jsx`
- `client/src/pages/SubmitResource.jsx`
- `client/src/pages/admin/AdminHelplines.jsx`
- `client/src/pages/admin/AdminResources.jsx`

---

### **7. E-Commerce Module** 🛒

Full-featured online shopping platform:

#### **User Features:**

**Shopping:**
- **Product Browsing**: Browse products by category
- **Product Search**: Search products by name/description
- **Product Details**: Detailed product pages with images
- **Category Navigation**: Shop by category
- **Shopping Cart**: Add/remove items, quantity management
- **Coupon System**: Apply discount coupons at checkout
- **Checkout Process**: Secure checkout with address management
- **Payment Integration**: Razorpay payment gateway
  - Online payment (card, UPI, netbanking)
  - Cash on Delivery (COD)
- **Order Management**:
  - Order history
  - Order tracking with status timeline
  - Order cancellation (for early stages)
  - Order details with timeline visualization
- **Reviews & Ratings**: Rate and review products

**Order Tracking Lifecycle:**
- **Placed** → **Confirmed** → **Packed** → **Shipped** → **Delivered**
- Optional: **Cancelled** / **Returned**
- Visual timeline with status badges
- Tracking number support for shipped orders

#### **Admin Features:**

**Product Management:**
- Create, update, delete products
- Upload product images (multiple images)
- Manage product categories
- Set prices, stock, descriptions
- Toggle product active/inactive status
- Bulk operations

**Inventory Management:**
- View stock levels
- Update stock quantities
- Low stock alerts
- Stock history

**Order Management:**
- View all orders
- Filter orders by status
- Update order status
- Add tracking numbers
- View order details
- Cancel/refund orders
- Stock restoration on cancellation

**Coupon Management:**
- Create discount coupons
- Set discount types (percentage/fixed)
- Set validity dates
- Set minimum purchase amounts
- Toggle coupon active/inactive
- View coupon usage statistics

**Reviews & Ratings (Trust Control):**
- View all product reviews
- Approve/hide reviews
- Remove abusive reviews
- View product ratings summary
- Average rating per product
- **Note**: Admin does NOT edit reviews, only moderates

**Payments & Transactions:**
- View all payment records
- Payment details:
  - Payment ID
  - Order ID
  - Amount
  - Payment status (Success/Failed)
  - Payment method
  - Date
- Highlight failed transactions
- Mark manual resolution for failed payments
- Integrate with Razorpay payment records

**Reports & Analytics:**
- Sales reports by category
- Monthly revenue reports
- Best-selling products
- Low-performing products
- Revenue and order trend charts
- Sales analytics dashboard

#### **Key Files:**
- `backend/models/Product.js`
- `backend/models/Category.js`
- `backend/models/EcommerceCategory.js`
- `backend/models/Cart.js`
- `backend/models/Order.js`
- `backend/models/Coupon.js`
- `backend/controllers/productController.js`
- `backend/controllers/cartController.js`
- `backend/controllers/orderController.js`
- `backend/controllers/couponController.js`
- `backend/controllers/reviewController.js`
- `backend/controllers/analyticsController.js`
- `client/src/pages/ShopHome.jsx`
- `client/src/pages/ProductDetail.jsx`
- `client/src/pages/Cart.jsx`
- `client/src/pages/Checkout.jsx`
- `client/src/pages/OrderHistory.jsx`
- `client/src/pages/OrderDetail.jsx`
- `client/src/pages/admin/ecommerce/EcommerceProducts.jsx`
- `client/src/pages/admin/ecommerce/EcommerceOrders.jsx`
- `client/src/pages/admin/ecommerce/EcommerceCoupons.jsx`
- `client/src/pages/admin/ecommerce/EcommerceReviews.jsx`
- `client/src/pages/admin/ecommerce/EcommercePayments.jsx`
- `client/src/pages/admin/ecommerce/EcommerceReports.jsx`

---

### **8. Assessment & Quiz Module** 📝

Educational and assessment tools:

- **Health Assessments**: Self-assessment questionnaires
- **Quiz System**: Interactive quizzes on health topics
- **Results & Insights**: Personalized results and recommendations

#### **Key Files:**
- `backend/models/Quiz.js`
- `client/src/pages/Assessment.jsx`
- `client/src/pages/Quiz.jsx`

---

### **9. Feedback & Support Module** 💬

User feedback and support system:

- **Feedback Form**: Submit feedback and suggestions
- **Feedback History**: View past feedback submissions
- **Admin Feedback Management**: View and respond to feedback

#### **Key Files:**
- `backend/models/Feedback.js`
- `backend/controllers/feedbackController.js`
- `client/src/pages/FeedbackForm.js`
- `client/src/pages/FeedbackList.jsx`
- `client/src/pages/AdminFeedback.jsx`

---

### **10. Machine Learning Features** 🤖

AI-powered health insights:

- **Health Risk Prediction**: ML-based health risk assessment
- **Symptom Classification**: AI symptom analysis
- **Mood Prediction**: Predict mood patterns
- **Pregnancy Health Prediction**: Pregnancy health insights
- **Exercise Recommendations**: ML-based exercise suggestions

#### **Key Files:**
- `backend/routes/healthRiskRoutes.js`
- `backend/routes/symptomClassificationRoutes.js`
- `backend/routes/moodPredictionRoutes.js`
- `backend/routes/pregnancyHealthRoutes.js`
- `backend/routes/exerciseRecommendationRoutes.js`
- `backend/python/ml_models/` (ML models)

---

## 🔄 Project Flow

### **User Registration & Login Flow:**

1. **New User:**
   - Visit homepage → Click "Register"
   - Fill registration form (name, email, password)
   - Account created → Redirected to login
   - Login → JWT token stored → Redirected to Dashboard

2. **Existing User:**
   - Visit homepage → Click "Login"
   - Enter credentials → JWT token stored → Dashboard

3. **OAuth Login:**
   - Click "Login with Google" → OAuth flow → Account created/logged in → Dashboard

### **Dashboard Flow:**

1. User lands on Dashboard after login
2. Dashboard shows:
   - Quick stats (vitals, period info)
   - SOS button (prominent)
   - Navigation cards to all modules
   - Recent activity

### **Period Tracking Flow:**

1. **Select Mode:**
   - User clicks "Period Tracking" from dashboard
   - Overview page shows 4 modes:
     - Period Tracking Mode
     - Conceive Mode
     - Pregnancy Mode
     - Perimenopause Mode

2. **Period Tracking Mode:**
   - Calendar view → Log period → View history → Get insights

3. **Conceive Mode:**
   - Intro page → Dashboard → Log fertility data → Get predictions

4. **Pregnancy Mode:**
   - Intro page → Dashboard → Log pregnancy data → Track baby development

5. **Perimenopause Mode:**
   - Intro page → Dashboard → Log symptoms → View reports

### **E-Commerce Flow:**

1. **Browsing:**
   - User clicks "E-commerce" from sidebar
   - Shop homepage → Browse products → Filter by category → Search

2. **Product Selection:**
   - Click product → Product detail page → View images, description, reviews
   - Add to cart → Cart page → Review items

3. **Checkout:**
   - Proceed to checkout → Enter shipping address
   - Apply coupon (optional) → Select payment method
   - Place order → Payment (Razorpay or COD)

4. **Order Tracking:**
   - Order confirmation → View in "My Orders"
   - Click order → See timeline (Placed → Confirmed → Packed → Shipped → Delivered)
   - Cancel order (if in early stages)

### **Admin E-Commerce Flow:**

1. **Product Management:**
   - Admin → E-commerce → Products
   - Create product → Upload images → Set price/stock → Save
   - Product appears in user shop

2. **Order Management:**
   - Admin → E-commerce → Orders
   - View all orders → Filter by status
   - Click order → Update status → Add tracking number
   - Status updates reflect in user's order tracking

3. **Coupon Management:**
   - Admin → E-commerce → Coupons
   - Create coupon → Set discount/validity → Activate
   - Users can apply at checkout

### **SOS Emergency Flow:**

1. **Trigger SOS:**
   - User clicks SOS button (Dashboard or Location Tracking)
   - 3-second countdown confirmation
   - Location captured automatically
   - Alert sent to emergency contacts

2. **Alert Distribution:**
   - Email sent to all emergency contacts
   - SMS sent (if Twilio configured)
   - Push notification sent (if FCM configured)
   - Location link included in all alerts

3. **Admin Monitoring:**
   - Admin → SOS Logs → View all SOS alerts
   - See location, timestamp, user details

### **Location Tracking Flow:**

1. **Enable Tracking:**
   - User → Location Tracking → Grant permissions
   - Live map shows current location

2. **Safe Zones:**
   - Define safe zones → Get alerts when entering/leaving

3. **Location History:**
   - View past locations → Filter by date

### **Health Tracker Flow:**

1. **Log Health Data:**
   - User → Health Tracker → Select category (Vitals, Symptoms, Mood, etc.)
   - Enter data → Save → View history

2. **Get Insights:**
   - ML models analyze data → Provide predictions and recommendations

---

## 🛠️ Technology Stack

### **Frontend:**
- **React.js**: UI framework
- **React Router**: Navigation
- **Axios**: HTTP client
- **CSS**: Styling
- **Firebase**: Push notifications (FCM)

### **Backend:**
- **Node.js**: Runtime
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM
- **JWT**: Authentication
- **Multer**: File uploads
- **Nodemailer**: Email service
- **Twilio**: SMS service (optional)
- **Razorpay**: Payment gateway

### **Machine Learning:**
- **Python**: ML models
- **TensorFlow/PyTorch**: ML frameworks (if used)
- **Flask/FastAPI**: ML API (if separate service)

### **Other Services:**
- **Firebase Admin SDK**: Push notifications
- **Google Maps API**: Location services
- **Geocoding API**: Address resolution

---

## 📊 Database Models

### **User & Authentication:**
- `User`: User accounts, profiles
- `Contact`: Emergency contacts

### **Period Tracking:**
- `Period`: Menstrual cycle records
- `FertilityLog`: Fertility tracking data
- `PregnancyLog`: Pregnancy health data
- `PerimenopauseLog`: Perimenopause symptoms

### **Health:**
- `Vital`: Health vitals (BP, heart rate, etc.)
- `Symptom`: Symptom logs
- `MoodLog`: Mood tracking
- `Sleep`: Sleep data
- `Nutrition`: Nutrition logs
- `HealthGoal`: Health goals

### **E-Commerce:**
- `Product`: Product catalog
- `Category`: Product categories
- `EcommerceCategory`: E-commerce specific categories
- `Cart`: Shopping cart
- `Order`: Order records
- `Coupon`: Discount coupons
- `Review`: Product reviews

### **Safety & Emergency:**
- `SOSLogs`: SOS alert records
- `SafeZone`: Safe zone definitions
- `Location`: Location tracking data

### **Resources:**
- `Helpline`: Emergency helplines
- `Resource`: Educational resources
- `EducationalTopic`: Educational content
- `Exercise`: Exercise recommendations

### **Pregnancy Specific:**
- `Appointment`: Medical appointments
- `Medication`: Medications tracking
- `Vaccination`: Vaccination records
- `PregnancyResource`: Pregnancy resources
- `PregnancyChat`: Chat history
- `WeeklyMessage`: Weekly pregnancy messages
- `BabyName`: Baby name suggestions
- `BookmarkedName`: Bookmarked names

### **Other:**
- `Feedback`: User feedback
- `Quiz`: Quiz questions
- `Event`: Calendar events
- `ExternalDirectory`: External resources

---

## 🎯 Key Features Summary

### **User Features:**
✅ User registration and authentication  
✅ Period tracking (4 modes)  
✅ Health tracking (vitals, symptoms, mood, sleep, nutrition)  
✅ SOS emergency alerts with location  
✅ Location tracking and safe zones  
✅ E-commerce shopping  
✅ Order tracking  
✅ Helplines and resources  
✅ Assessments and quizzes  
✅ Feedback submission  
✅ Profile management  
✅ Settings and preferences  

### **Admin Features:**
✅ Admin dashboard  
✅ User management  
✅ Period tracking data management  
✅ Health data management  
✅ SOS logs monitoring  
✅ Helpline management  
✅ Resource management  
✅ E-commerce management (products, orders, coupons, reviews, payments, reports)  
✅ Feedback management  
✅ Analytics and reports  

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: User vs Admin roles
- **Password Hashing**: bcrypt hashing
- **Protected Routes**: Route guards for authenticated pages
- **Admin-Only Routes**: Separate admin authentication
- **Input Validation**: Server-side validation
- **File Upload Security**: Multer file type validation

---

## 📱 Responsive Design

- Mobile-first approach
- Responsive layouts for all pages
- Touch-friendly interfaces
- Adaptive navigation (sidebar on desktop, hamburger on mobile)

---

## 🚀 Deployment Considerations

- **Environment Variables**: `.env` files for configuration
- **Static File Serving**: Express static middleware
- **CORS Configuration**: Configured for frontend-backend communication
- **Error Handling**: Comprehensive error handling
- **Logging**: Console logging for debugging

---

## 📝 Notes

- All modules are fully functional and integrated
- E-commerce module includes complete order tracking lifecycle
- Period tracking supports 4 distinct modes
- ML features provide AI-powered insights
- Payment integration with Razorpay
- Location services with Google Maps
- Multi-channel emergency alerts (Email, SMS, Push)

---

**This project represents a comprehensive women's health and safety platform with extensive features for both users and administrators.**
