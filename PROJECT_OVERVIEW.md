# SafeHer - Project Overview

**A Comprehensive Women's Health & Safety Application**

---

## 📋 Table of Contents

1. [Project Description](#project-description)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Core Features & Modules](#core-features--modules)
5. [Project Structure](#project-structure)
6. [Key Components](#key-components)
7. [Setup Requirements](#setup-requirements)
8. [API Endpoints](#api-endpoints)

---

## 🎯 Project Description

**SafeHer** is a comprehensive web application designed to provide women with essential health tracking, emergency safety features, and personalized wellness support. The application combines period tracking, health monitoring, emergency SOS capabilities, pregnancy management, and intelligent recommendations in a single, user-friendly platform.

The platform focuses on:
- **Safety First**: Instant SOS alerts with location sharing to trusted contacts
- **Health Awareness**: Comprehensive health tracking with personalized insights
- **Privacy & Security**: Secure authentication and data protection
- **User-Centric Design**: Intuitive interface with responsive design

---

## 💻 Technology Stack

### **Frontend**
- **Framework**: React.js 18+
- **Styling**: CSS3, Responsive Design
- **State Management**: React Hooks, Context API
- **Routing**: React Router v6
- **Maps Integration**: Google Maps API, Leaflet
- **Authentication**: Firebase Authentication (Google Sign-In)

### **Backend**
- **Runtime**: Node.js 22
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Cloud Database)
- **Authentication**: JWT (JSON Web Tokens), Firebase Admin SDK
- **File Upload**: Multer
- **Email Service**: Nodemailer (with Mailtrap/Gmail support)
- **Payment Gateway**: Razorpay

### **ML/AI Services**
- **Language**: Python 3.x
- **ML Framework**: Flask (API Services)
- **Libraries**: scikit-learn, pandas, numpy, joblib
- **Models**: Multiple trained models for predictions

### **Development Tools**
- **Version Control**: Git
- **Code Editor**: VS Code
- **Package Managers**: npm (Node.js), pip (Python)
- **API Testing**: Postman, Browser DevTools

---

## 🏗️ Architecture

The application follows a **three-tier architecture**:

```
┌─────────────────────────────────────────────────┐
│           Client Layer (React.js)               │
│  - User Interface                               │
│  - Components & Pages                            │
│  - State Management                              │
└─────────────────┬───────────────────────────────┘
                  │
                  │ HTTP/REST API
                  ▼
┌─────────────────────────────────────────────────┐
│        Server Layer (Node.js/Express)           │
│  - REST API Endpoints                            │
│  - Business Logic                                │
│  - Authentication & Authorization                 │
│  - Data Validation                               │
└─────────────────┬───────────────────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────────────────┐
│    Data & Services Layer                        │
│  - MongoDB Database                             │
│  - Flask ML Services (Python)                  │
│  - External APIs (Firebase, Google Maps)        │
│  - Email Services (Nodemailer)                 │
└─────────────────────────────────────────────────┘
```

### **Service Architecture**

- **Main Backend**: Node.js server running on port 5000
- **ML Services**: 5 Flask APIs running on ports 5002-5006
  - Health Risk Prediction (Port 5002)
  - Symptom Classification (Port 5003)
  - Pregnancy Health Prediction (Port 5004)
  - Mood Prediction (Port 5005)
  - Exercise Recommendation (Port 5006)
- **Frontend**: React app on port 3000

---

## 🎨 Core Features & Modules

### **1. User Authentication & Authorization**
- Email/Password registration and login
- Google Sign-In integration
- Password reset via email
- JWT-based session management
- Role-based access (User, Admin, Superadmin)
- Protected routes

### **2. Period Tracking**
- Menstrual cycle tracking with calendar view
- Period start/end date logging
- Cycle length and period length tracking
- Phase detection (Menstruation, Follicular, Ovulation, Luteal)
- Cycle predictions and statistics
- Symptoms logging during periods
- Admin dashboard for period tracking analytics

### **3. Health Tracker**
- **Vitals Tracking**: Weight, BMI, Blood Pressure, Heart Rate, Blood Sugar, Cholesterol, Iron Levels
- **Symptom Logging**: Physical, mental, and reproductive symptoms
- **Mood Tracking**: Daily mood entries with correlation analysis
- **Lifestyle Tracking**: Exercise, sleep, nutrition habits
- **Vaccination Records**: Track vaccination history
- **Medical Records**: Upload and store medical documents
- **Health Goals**: Set and track health goals with progress visualization
- **Risk Assessment**: Automatic health risk evaluation with color-coded warnings
- **Correlation Detection**: Links between sleep, mood, exercise, and symptoms
- **Analytics Dashboard**: Charts, trends, and insights

### **4. Emergency SOS System**
- One-tap SOS button with location sharing
- Automatic GPS location capture
- Real-time location tracking during emergencies
- Email and SMS alerts to emergency contacts
- SOS alert history and logs
- Integration with Google Maps for location visualization
- Contact management for trusted emergency contacts

### **5. Location Tracking**
- Real-time location monitoring
- Location history tracking
- Safe zones management
- Location sharing with contacts
- Interactive map interface
- Permission management

### **6. Pregnancy Management**
- Week-by-week pregnancy tracking
- Baby development information
- Pregnancy health prediction
- Appointment scheduling
- Medication reminders
- Vaccination tracking
- Wellness monitoring
- Baby name suggestions
- Pregnancy chat support
- Partner dashboard
- Weekly personalized messages

### **7. Fertility/Conceive Mode**
- Ovulation prediction
- Fertile window calculation
- Basal Body Temperature (BBT) tracking
- Cervical mucus monitoring
- Ovulation test integration
- Cycle analysis and insights

### **8. Exercise Recommendations**
- Personalized exercise suggestions based on:
  - Menstrual cycle phase
  - Energy levels
  - Mood state
  - Cramp intensity
  - Sleep quality
  - Stress levels
- Exercise type recommendations (rest, yoga, stretching, walking, cardio, strength, meditation)
- Safety notes and explanations
- Exercise history tracking
- Feedback system

### **9. Intelligent Health Predictions**
- **Health Risk Assessment**: Analyzes vitals to predict health risk levels
- **Mood Prediction**: Predicts mood based on symptoms, sleep, and lifestyle
- **Symptom Classification**: Classifies symptoms into categories and severity
- **Pregnancy Health Prediction**: Health insights during pregnancy

### **10. Resources & Education**
- Helplines directory with contact information
- Educational articles and resources
- Resource submission by users
- Admin content management
- Categorized content (Health, Safety, Pregnancy, etc.)

### **11. Perimenopause Support**
- Perimenopause symptom tracking
- Information and resources
- Support features

### **12. Subscription & Payments**
- Premium subscription plans (Free, Premium, Lifetime)
- Razorpay payment integration
- Payment history
- Subscription management

### **13. Contacts Management**
- Emergency contacts list
- Contact sharing and permissions
- Trusted contacts for SOS

### **14. Settings & Profile**
- User profile management
- Privacy settings
- Notification preferences
- Period reminder settings
- PIN lock security
- Data export

### **15. Admin Dashboard**
- User management
- Content management
- Period tracking analytics
- SOS logs and monitoring
- Health reports
- Resource management
- Educational content management
- System settings

---

## 📁 Project Structure

```
safeher-project4/
│
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── firebase.js         # Firebase config
│   │   ├── App.js              # Main app component
│   │   └── index.js            # Entry point
│   └── package.json
│
├── backend/                     # Node.js Backend
│   ├── controllers/            # Route controllers
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic services
│   ├── middleware/             # Auth & validation middleware
│   ├── config/                 # Configuration files
│   ├── utils/                  # Utility functions
│   ├── python/                 # Python ML services
│   │   └── ml_models/          # ML models and APIs
│   ├── server.js               # Main server file
│   └── package.json
│
├── uploads/                    # File uploads storage
│
└── Documentation Files          # Various .md files
```

---

## 🔧 Key Components

### **Frontend Components**

- **Authentication**: `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`
- **Dashboard**: `Dashboard.js`, `UserSidebar.jsx`
- **Period Tracker**: Period tracking pages and components
- **Health Tracker**: `Health.jsx`, `HealthLanding.jsx`, Health-related components
- **SOS System**: `SOSButton.jsx`, `SOSButtonNew.jsx`
- **Location**: `LocationTracking.jsx`, `GoogleMapComponent.jsx`
- **Pregnancy**: Pregnancy dashboard and tracking components
- **Admin**: Admin dashboard, user management, content management

### **Backend Services**

- **Authentication Service**: JWT tokens, password hashing
- **Period Service**: Cycle calculations, phase detection
- **Health Service**: Vitals, symptoms, goal tracking
- **SOS Service**: Emergency alerts, location sharing
- **ML Services**: Integration with Python Flask APIs
- **Email Service**: Notifications and alerts
- **Payment Service**: Subscription management

---

## ⚙️ Setup Requirements

### **Prerequisites**

1. **Node.js** (v22 or higher)
2. **MongoDB** (Atlas account or local MongoDB)
3. **Python** (3.x) with pip
4. **npm** (comes with Node.js)
5. **Git** (for version control)

### **Environment Variables**

Create `.env` file in `backend/` directory:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# Server
PORT=5000

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=path_to_service_account.json

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=SafeHer <no-reply@safeher.com>

# Payment
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Admin
ADMIN_EMAILS=admin@example.com
```

### **Installation Steps**

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd safeher-project4
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Install Python Dependencies**
   ```bash
   cd backend/python
   pip install -r requirements.txt
   ```

5. **Train ML Models** (Optional but recommended)
   ```bash
   cd backend/python/ml_models
   python health_risk_knn.py
   python symptom_bayesian_classifier.py
   python mood_svm_prediction.py
   python train_exercise_knn.py
   ```

6. **Start Services**
   - Backend: `cd backend && npm start`
   - Frontend: `cd client && npm start`
   - ML APIs: Run individual Python Flask APIs or use `start_ml_services.bat`

---

## 🌐 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google Sign-In
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/me` - Get current user profile

### **Period Tracking**
- `GET /api/periods` - Get user periods
- `POST /api/periods` - Add new period
- `PUT /api/periods/:id` - Update period
- `DELETE /api/periods/:id` - Delete period

### **Health Tracker**
- `GET /api/health/vitals` - Get vitals
- `POST /api/health/vitals` - Add vitals entry
- `GET /api/health/symptoms` - Get symptoms
- `POST /api/health/symptoms` - Add symptom
- `GET /api/health/goals` - Get health goals
- `POST /api/health/goals` - Create goal

### **SOS & Location**
- `POST /api/sos/send` - Send SOS alert
- `GET /api/sos/history` - Get SOS history
- `POST /api/location/share` - Share location

### **ML Predictions**
- `POST /api/health-risk/predict` - Health risk prediction
- `POST /api/mood/prediction` - Mood prediction
- `POST /api/symptom-classification/classify` - Symptom classification
- `POST /api/exercise/recommend` - Exercise recommendation

### **Admin**
- `GET /api/admin/users` - Get all users
- `GET /api/admin/sos-logs` - Get SOS logs
- `POST /api/admin/content` - Create content

---

## 📊 Database Schema

### **Main Collections**
- **Users**: User profiles, authentication data
- **Periods**: Menstrual cycle data
- **Vitals**: Health vitals entries
- **Symptoms**: Symptom logs
- **Health Goals**: User health goals
- **SOS Alerts**: Emergency alert records
- **Contacts**: Emergency contacts
- **Resources**: Educational resources
- **Subscriptions**: Payment and subscription data

---

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Secure file upload handling
- Environment variable protection
- Firebase security rules

---

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Edge, Safari)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Tablet devices

---

## 🚀 Deployment

The application can be deployed to:
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Heroku, AWS, DigitalOcean, or any Node.js hosting
- **Database**: MongoDB Atlas (already cloud-hosted)
- **ML Services**: Can be deployed separately or integrated into main backend

---

## 📝 Version

**Current Version**: 1.0  
**Development Status**: Production Ready  
**Last Updated**: January 2025

---

## 👥 Development

**Project**: SafeHer - Women's Health & Safety Application  
**Developer**: Meenakshi Anil  
**Institution**: MCA Mini Project 2025

---

*This document provides a comprehensive overview of the SafeHer project. For detailed implementation guides, refer to specific documentation files in the project repository.*

