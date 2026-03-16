# 🎨 SafeHer Project - Complete Flow Guide for Figma Design

## 📋 Table of Contents
1. [Home Screen](#1-home-screen)
2. [Authentication Flow](#2-authentication-flow)
3. [User Dashboard](#3-user-dashboard)
4. [Core Modules Flow](#4-core-modules-flow)
5. [Admin Panel Flow](#5-admin-panel-flow)
6. [UI Components Reference](#6-ui-components-reference)

---

## 1. Home Screen

### **Landing Page (`/`)**

**Layout:**
- **Header**: Logo (🛡️ SafeHer), Navigation (Features, About, Contact), Login/Register buttons
- **Hero Section**: 
  - Large heading: "Empowering Women's Safety and Wellness"
  - Subtitle: Description of SafeHer
  - Two CTA buttons: "Create your free account" (Primary) and "Login" (Secondary)
  - Privacy note: "Private by default. You control your data."
- **Quick Actions Grid** (4 cards):
  1. 🚨 **Instant SOS** - Emergency alerts with location
  2. 👣 **Safe Walk** - Real-time route sharing
  3. 💗 **Health Hub** - Cycle tracking and wellness
  4. 🤝 **Trusted Network** - Support circle
- **Feature Grid**: Detailed feature cards
- **Footer**: Links, social media, contact info

**User Actions:**
- Click "Create your free account" → Navigate to `/register`
- Click "Login" → Navigate to `/login`
- Click "Features" → Navigate to `/features`
- Click "About" → Navigate to `/about`
- Click "Contact" → Navigate to `/contact`

---

## 2. Authentication Flow

### **2.1 Registration Page (`/register`)**

**Layout:**
- Split screen design:
  - **Left Panel**: Branding, hero image, tagline
  - **Right Panel**: Registration form

**Form Fields:**
1. Full Name (text input)
2. Email (email input)
3. Phone Number (10 digits, text input)
4. Date of Birth (date picker)
5. Password (password input with strength indicator)
   - Requirements: 8+ chars, uppercase, lowercase, number, special char
6. Confirm Password (password input)
7. Terms & Conditions checkbox
8. Submit button: "Create Account"
9. Link: "Already have an account? Login"

**Validation:**
- Real-time validation feedback
- Error messages below fields
- Success message on completion

**After Registration:**
- Success message: "Account created successfully!"
- Auto-redirect to `/login` after 2 seconds

---

### **2.2 Login Page (`/login`)**

**Layout:**
- Split screen design (similar to registration)
- **Left Panel**: Branding, hero image
- **Right Panel**: Login form

**Form Fields:**
1. Email (email input)
2. Password (password input with show/hide toggle)
3. "Forgot password?" link
4. Submit button: "Login"
5. Divider: "OR"
6. Google Sign-In button (with Google logo)
7. Link: "Don't have an account? Register"

**After Login:**
- **Regular User**: Redirect to `/dashboard`
- **Admin User**: Redirect to `/admin/dashboard`
- Store JWT token and user data in localStorage

---

### **2.3 Forgot Password (`/forgot-password`)**

**Layout:**
- Centered form
- **Fields:**
  1. Email input
  2. Submit button: "Send Reset Link"
  3. Back to login link

**Flow:**
- User enters email → Receives reset link via email
- Click link → Navigate to `/reset-password/:token`
- Reset password form → New password → Confirm → Success → Login

---

## 3. User Dashboard

### **3.1 Main Dashboard (`/dashboard`)**

**Layout:**
- **Header** (Fixed top):
  - Logo + "SafeHer" text
  - Navigation: Home, Health Tracker, Period Tracker, Resources, Helplines
  - Search bar (centered)
  - Notification bell icon
  - User avatar (with dropdown: Profile, Settings, Logout)

- **Sidebar** (Left, collapsible):
  - User info card (avatar, name, email)
  - Navigation menu:
    - 📊 Dashboard
    - 💗 Health Vitals
    - 📅 Period Tracker
    - 🩺 Telehealth
    - 📍 Location Tracking
    - 📞 Helplines
    - 📚 Resources
    - 💬 Community Forum
    - 🛍️ E-commerce
    - ❤️ My Wishlist
    - 📦 My Orders
    - 📇 My Emergency Contacts
    - 💬 Feedback
    - ⚙️ Settings
    - 👤 Profile

- **Main Content Area**:
  - **Hero Section**:
    - Greeting: "Good morning/afternoon/evening, [First Name]"
    - Title: "Your wellbeing summary 🌱"
    - Description text
    - **SOS Button** (Large, prominent, red/pink):
      - Icon: 🚨
      - Text: "Send SOS Alert"
      - Hint: "We will notify your trusted contacts instantly with your exact location."
      - Features: 📍 GPS Location, 📧 Email Alert, 📱 SMS Alert
    - Meta pills: "Next period: [date]" | "Last SOS: [time]"

  - **Health Snapshot Section**:
    - Section header: "Health Snapshot" + "Update vitals" button
    - **Metrics Grid** (6 cards):
      1. 🌸 **Next Period**: Days until next period, expected date
      2. 🆘 **Last SOS Alert**: Time since last alert
      3. ❤️ **Heart Rate**: Current BPM, goal range
      4. 🩺 **Blood Pressure**: Systolic/Diastolic, target
      5. ⚖️ **BMI**: Current BMI value
      6. 🏋️ **Weight**: Current weight in kg

  - **Quick Actions Section**:
    - Cards linking to:
      - Period Tracking
      - Health Tracker
      - Location Tracking
      - E-commerce
      - Forum
      - Resources

  - **Recent Activity Section**:
    - Recent period logs
    - Recent health entries
    - Recent forum posts

---

## 4. Core Modules Flow

### **4.1 Period Tracking Module (`/period-tracking`)**

#### **Overview Page** (Mode Selection):
- **4 Mode Cards**:
  1. **Period Tracking Mode** 📅
     - Description: Track your menstrual cycle
     - Button: "Start Tracking"
  2. **Conceive Mode** 👶
     - Description: Fertility tracking and ovulation prediction
     - Button: "Start Tracking"
  3. **Pregnancy Mode** 🤰
     - Description: Pregnancy health and baby development
     - Button: "Start Tracking"
  4. **Perimenopause Mode** 🧬
     - Description: Track perimenopause symptoms
     - Button: "Start Tracking"

#### **Period Tracking Mode**:
- **Calendar View**:
  - Monthly calendar
  - Period days highlighted (pink/red)
  - Ovulation day marked
  - Fertile window highlighted
  - Click date to log period
- **Log Period Form**:
  - Start date (date picker)
  - End date (date picker)
  - Intensity: Light/Medium/Heavy (radio buttons)
  - Symptoms: Multi-select checkboxes
  - Mood: Dropdown
  - Notes: Text area
  - Save button
- **Cycle History**:
  - List of past cycles
  - Statistics: Average cycle length, average duration
  - Irregularity flag
- **Insights Panel**:
  - Next period prediction
  - Ovulation date
  - Fertile window
  - Cycle regularity status

#### **Conceive Mode**:
- **Intro Page**: Information about fertility tracking
- **Dashboard**:
  - Fertility calendar
  - BBT (Basal Body Temperature) chart
  - Ovulation prediction
  - Fertile window indicator
  - Daily log form:
    - BBT input
    - Cervical mucus (dropdown)
    - Cervical position (dropdown)
    - Ovulation test result (positive/negative)
    - Intercourse log (checkbox)
    - Symptoms
    - Mood
    - Energy level
  - Fertility insights panel

#### **Pregnancy Mode**:
- **Intro Page**: Welcome to pregnancy tracking
- **Dashboard**:
  - Week/Trimester indicator
  - Baby development card (current week)
  - Health log form:
    - Weight
    - Blood pressure
    - Blood sugar
    - Fetal movement count
    - Symptoms (nausea, fatigue, mood, etc.)
    - Sleep hours
    - Exercise
    - Medications
  - Appointment tracker
  - Baby name suggestions
  - Weekly messages
  - Partner dashboard link

#### **Perimenopause Mode**:
- **Intro Page**: Information about perimenopause
- **Dashboard**:
  - Symptom tracking form
  - Cycle irregularity tracker
  - Sleep quality tracker
  - Weight tracking
  - Exercise logs
  - Medication tracker
  - Reports and insights

---

### **4.2 Health Tracker Module (`/health`)**

#### **Landing Page**:
- **Categories Grid**:
  1. 💗 **Vitals** - BP, Heart Rate, Weight, BMI
  2. 😷 **Symptoms** - Physical, mental, reproductive
  3. 😊 **Mood** - Daily mood tracking
  4. 😴 **Sleep** - Sleep hours and quality
  5. 🍎 **Nutrition** - Food intake tracking
  6. 🏃 **Exercise** - Physical activity
  7. 🎯 **Health Goals** - Set and track goals
  8. 📊 **Analytics** - Charts and insights

#### **Vitals Page**:
- **Form**:
  - Weight (kg)
  - Height (cm)
  - BMI (auto-calculated)
  - Blood Pressure (Systolic/Diastolic)
  - Heart Rate (BPM)
  - Blood Sugar (mg/dL)
  - Cholesterol (mg/dL)
  - Iron Levels
  - Date
  - Save button
- **History Table**: List of all vitals entries
- **Charts**: Trends over time

#### **Symptoms Page**:
- **Log Form**:
  - Symptom type: Physical/Mental/Reproductive (tabs)
  - Symptom selection (multi-select)
  - Severity: Mild/Moderate/Severe
  - Duration
  - Notes
  - Date
- **Symptom History**: Timeline view
- **ML Insights**: AI-powered symptom analysis

#### **Mood Page**:
- **Mood Tracker**:
  - Mood selection: Happy, Sad, Anxious, Excited, Calm, etc.
  - Intensity slider (1-10)
  - Triggers (multi-select)
  - Notes
  - Date
- **Mood Calendar**: Visual mood calendar
- **ML Predictions**: Mood pattern predictions

#### **Analytics Dashboard**:
- **Charts**:
  - Vitals trends (line charts)
  - Symptom frequency (bar chart)
  - Mood patterns (heatmap)
  - Sleep quality trends
  - Health risk assessment (color-coded)
- **Insights Panel**: ML-generated recommendations

---

### **4.3 Location Tracking Module (`/location-tracking`)**

#### **Dashboard Overview**:
- **Stats Cards**:
  - Current location (address)
  - Tracking status (Active/Inactive)
  - Total locations logged
  - Safe zones count
- **Quick Actions**:
  - Start/Stop tracking button
  - View live map
  - View history
  - Manage safe zones
  - Trigger SOS

#### **Live Map** (`/location-tracking/live`):
- **Google Maps Integration**:
  - Current location marker
  - Real-time location updates
  - Share location button
  - Stop tracking button
- **Sidebar**:
  - Current address
  - Coordinates
  - Tracking time
  - Battery status indicator

#### **Location History** (`/location-tracking/history`):
- **Timeline View**:
  - List of past locations
  - Date and time
  - Address
  - Map preview
  - Filter by date range
- **Map View**: All locations on map

#### **Safe Zones** (`/location-tracking/safe-zones`):
- **List of Safe Zones**:
  - Zone name
  - Address
  - Radius
  - Status (Active/Inactive)
  - Edit/Delete buttons
- **Add Safe Zone Form**:
  - Zone name
  - Address (with map picker)
  - Radius (slider)
  - Save button

#### **SOS Alerts** (`/location-tracking/sos`):
- **SOS Button** (Large, red)
- **History**: List of past SOS alerts
- **Alert Details**:
  - Timestamp
  - Location (with map)
  - Contacts notified
  - Status

---

### **4.4 E-Commerce Module (`/shop`)**

#### **Shop Homepage**:
- **Header**:
  - Search bar
  - Category filter dropdown
  - Cart icon (with item count badge)
- **Banner**: Promotional banner
- **Categories Grid**: Product categories
- **Featured Products**: Carousel
- **Product Grid**:
  - Product cards:
    - Product image
    - Product name
    - Price
    - Rating stars
    - "Add to Cart" button
    - "View Details" link

#### **Product Detail Page** (`/shop/product/:id`):
- **Product Images**: Image gallery (multiple images)
- **Product Info**:
  - Product name
  - Price
  - Rating and reviews count
  - Description
  - Specifications
  - Stock status
- **Quantity Selector**: +/- buttons
- **Action Buttons**:
  - "Add to Cart" (Primary)
  - "Add to Wishlist" (Secondary)
- **Reviews Section**:
  - Review cards (user, rating, comment, date)
  - "Write Review" button

#### **Shopping Cart** (`/cart`):
- **Cart Items Table**:
  - Product image
  - Product name
  - Price
  - Quantity (with +/-)
  - Subtotal
  - Remove button
- **Summary Sidebar**:
  - Subtotal
  - Shipping
  - Discount (if coupon applied)
  - Total
  - Coupon code input
  - "Apply Coupon" button
  - "Proceed to Checkout" button

#### **Checkout Page** (`/checkout`):
- **Shipping Address Form**:
  - Full name
  - Phone
  - Address line 1
  - Address line 2
  - City
  - State
  - Pincode
  - Save as default checkbox
- **Order Summary**:
  - Items list
  - Subtotal
  - Shipping
  - Discount
  - Total
- **Payment Method**:
  - Radio buttons: Online Payment (Razorpay) / Cash on Delivery
- **Place Order Button**

#### **Order Confirmation** (`/order-confirmation`):
- **Success Message**: "Order placed successfully!"
- **Order Details**:
  - Order ID
  - Order date
  - Items
  - Total amount
  - Payment method
  - Shipping address
- **Action Buttons**:
  - "View Order" → `/shop/orders/:id`
  - "Continue Shopping" → `/shop`

#### **My Orders** (`/shop/orders`):
- **Orders List**:
  - Order cards:
    - Order ID
    - Order date
    - Total amount
    - Status badge (Placed, Confirmed, Packed, Shipped, Delivered)
    - "View Details" button
- **Filter**: By status dropdown

#### **Order Detail** (`/shop/orders/:id`):
- **Order Info**:
  - Order ID
  - Order date
  - Status timeline (visual):
    - ✅ Placed
    - ✅ Confirmed
    - ⏳ Packed
    - ⏳ Shipped
    - ⏳ Delivered
  - Tracking number (if shipped)
- **Items List**: Product details
- **Shipping Address**
- **Payment Info**
- **Cancel Order Button** (if status allows)

#### **Wishlist** (`/wishlist`):
- **Wishlist Items Grid**:
  - Product cards
  - "Move to Cart" button
  - "Remove" button

---

### **4.5 Community Forum (`/forum`)**

#### **Forum Homepage**:
- **Header**:
  - Search bar
  - "Create Post" button
  - Filter: All, Trending, My Posts, Bookmarked
- **Categories Tabs**: All, Health, Period, Pregnancy, General
- **Posts Feed**:
  - Post cards:
    - User avatar and name
    - Post title
    - Post content (truncated)
    - Category badge
    - Like count
    - Comment count
    - Bookmark icon
    - Timestamp
    - "Read More" link

#### **Create Post** (`/forum/create`):
- **Form**:
  - Title (text input)
  - Category (dropdown)
  - Content (rich text editor)
  - Tags (multi-select)
  - Attach image (optional)
  - Publish button
  - Save as draft button

#### **Post Detail** (`/forum/post/:id`):
- **Post Header**:
  - User info
  - Post title
  - Category badge
  - Timestamp
  - Edit/Delete buttons (if owner)
- **Post Content**: Full content
- **Actions**:
  - Like button (with count)
  - Comment button
  - Bookmark button
  - Share button
- **Comments Section**:
  - Comment form (at top)
  - Comments list:
    - User avatar and name
    - Comment text
    - Timestamp
    - Like button
    - Reply button
    - Report button

#### **My Posts** (`/forum/my-posts`):
- **Posts List**: User's own posts
- **Filter**: Published, Drafts
- **Actions**: Edit, Delete, View

#### **Bookmarked Posts** (`/forum/bookmarked`):
- **Posts List**: Bookmarked posts
- **Remove bookmark** button

---

### **4.6 Telehealth Module (`/telehealth`)**

#### **Dashboard**:
- **Welcome Card**: User name, greeting
- **Quick Stats**:
  - Upcoming appointments
  - Past consultations
  - Prescriptions
  - Health records
- **Quick Actions**:
  - Book Appointment
  - View Doctors
  - View Appointments
  - View Prescriptions

#### **Doctor Directory** (`/telehealth/doctors`):
- **Search and Filters**:
  - Search bar
  - Specialty filter
  - Availability filter
  - Rating filter
- **Doctors Grid**:
  - Doctor cards:
    - Doctor photo
    - Doctor name
    - Specialty
    - Rating stars
    - Experience
    - Consultation fee
    - "Book Appointment" button
    - "View Profile" link

#### **Appointments** (`/telehealth/appointments`):
- **Tabs**: Upcoming, Past, Cancelled
- **Appointment Cards**:
  - Doctor name and photo
  - Date and time
  - Status badge
  - Consultation type (Video/Audio/Text)
  - "Join Call" button (if upcoming)
  - "Reschedule" button
  - "Cancel" button

#### **Book Appointment** (`/telehealth/book`):
- **Doctor Selection**: Choose doctor
- **Date Picker**: Select date
- **Time Slots**: Available time slots
- **Consultation Type**: Video/Audio/Text (radio buttons)
- **Reason**: Text area
- **Payment**: Consultation fee
- **Book Button**

#### **Prescriptions** (`/telehealth/prescriptions`):
- **Prescriptions List**:
  - Doctor name
  - Date
  - Medications list
  - Instructions
  - Download PDF button

---

### **4.7 Helplines (`/helplines`)**

#### **Helplines Page**:
- **Search Bar**: Search helplines
- **Category Filter**: Safety, Health, Legal, etc.
- **Helplines Grid**:
  - Helpline cards:
    - Organization name
    - Category badge
    - Phone number (clickable)
    - Description
    - "Call" button
    - "Save" button

---

### **4.8 Resources (`/resources`)**

#### **Resources Hub**:
- **Sidebar Navigation**:
  - 🔍 Search
  - 📚 All Resources
  - 🗂️ Categories (Safety, Legal, Health, Helplines)
  - ⭐ Saved
  - ⏱️ Recently Viewed
  - 🧠 Quiz and Assessment
  - ➕ Add Resources
  - 🗓️ Webinars & Events
  - 🌐 External Resources

- **Main Content**:
  - **Resource Cards**:
    - Resource title
    - Category
    - Description
    - Author/Organization
    - "Read More" link
    - Save button
  - **Filter and Sort**: By category, date, popularity

#### **Submit Resource** (`/resources/submit`):
- **Form**:
  - Title
  - Category
  - Description
  - Link/URL
  - File upload (optional)
  - Submit button

---

### **4.9 Profile (`/profile`)**

#### **Profile Page**:
- **Profile Header**:
  - Avatar (with edit button)
  - Name
  - Email
  - Member since date
- **Tabs**:
  1. **Personal Info**:
     - Name, Email, Phone, Date of Birth, Gender
     - Edit button
  2. **Health Summary**:
     - Health stats overview
     - Recent vitals
     - Cycle info
  3. **Activity**:
     - Recent posts
     - Recent orders
     - Recent health logs

---

### **4.10 Settings (`/settings`)**

#### **Settings Page**:
- **Sections**:
  1. **Account Settings**:
     - Change password form
     - Delete account option
  2. **Privacy Settings**:
     - Profile visibility
     - Data sharing preferences
  3. **Notifications**:
     - Email notifications toggle
     - SMS notifications toggle
     - Push notifications toggle
  4. **Preferences**:
     - Language
     - Theme (Light/Dark)
     - Units (Metric/Imperial)

---

## 5. Admin Panel Flow

### **5.1 Admin Login (`/admin/login`)**

- **Simple Form**:
  - Email input
  - Password input
  - Login button
  - Error messages

**After Login**: Redirect to `/admin/dashboard`

---

### **5.2 Admin Dashboard (`/admin/dashboard`)**

#### **Layout**:
- **Admin Header** (Fixed top):
  - Logo + "SafeHer Admin"
  - Page title
  - Notifications bell
  - Admin user menu (avatar, name, dropdown: Profile, Settings, Logout)

- **Admin Sidebar** (Left):
  - Dashboard
  - Users
  - Resources
  - Forum Moderation
  - E-commerce
  - Telehealth
  - Reports
  - SOS Logs
  - Helplines
  - Health Data
  - Period Tracking
  - Settings
  - Feedback

- **Main Content**:
  - **Stats Cards** (4 cards):
    1. Total Users
    2. Active Users
    3. SOS Triggered
    4. Pending Resources
  - **Quick Links**: Links to major sections
  - **Recent Activity**: Recent user registrations, SOS alerts, etc.

---

### **5.3 User Management (`/admin/users`)**

- **Header**:
  - Search bar
  - Filter: All, Active, Blocked
  - Export button
- **Users Table**:
  - Columns: Name, Email, Phone, Role, Status, Joined Date, Actions
  - Actions: View, Block/Unblock, Delete
- **User Detail Modal**:
  - Full user info
  - Activity history
  - Block/Unblock button

---

### **5.4 E-Commerce Management (`/admin/ecommerce`)**

#### **Sub-sections**:
1. **Products** (`/admin/ecommerce/products`):
   - Products table
   - Add Product button
   - Edit/Delete actions
   - Product form: Name, Description, Price, Stock, Images, Category

2. **Orders** (`/admin/ecommerce/orders`):
   - Orders table with filters
   - Order detail: Update status, Add tracking number
   - Status timeline

3. **Coupons** (`/admin/ecommerce/coupons`):
   - Coupons list
   - Create Coupon form
   - Edit/Delete actions

4. **Reviews** (`/admin/ecommerce/reviews`):
   - Reviews list
   - Approve/Hide actions
   - Remove abusive reviews

5. **Payments** (`/admin/ecommerce/payments`):
   - Payment records table
   - Filter by status
   - Payment details

6. **Reports** (`/admin/ecommerce/reports`):
   - Sales charts
   - Revenue reports
   - Best-selling products
   - Analytics dashboard

---

### **5.5 Forum Moderation (`/admin/forum`)**

- **Tabs**:
  1. **Dashboard**: Forum statistics
  2. **Posts**: All posts, filter by status, approve/delete
  3. **Comments**: All comments, moderate
  4. **Reports**: Reported content, resolve/dismiss
  5. **Users**: User activity in forum

---

### **5.6 SOS Logs (`/admin/sos`)**

- **SOS Alerts Table**:
  - User name
  - Timestamp
  - Location (with map link)
  - Status
  - View details button
- **Map View**: All SOS locations on map

---

### **5.7 Resources Management (`/admin/resources`)**

- **Resources Table**:
  - Title, Category, Author, Status
  - Approve/Reject buttons
  - Edit/Delete actions
- **Add Resource Form**

---

### **5.8 Period Tracking Management (`/admin/period-tracking`)**

- **User Period Data**:
  - Search by user
  - Period records table
  - Statistics
- **Educational Content**: Manage articles
- **Exercise Recommendations**: Manage exercises

---

## 6. UI Components Reference

### **Color Palette**:
- **Primary**: Pink (#EC4899) - Main brand color
- **Secondary**: Purple (#8B5CF6) - Accent color
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Danger**: Red (#EF4444)
- **Info**: Blue (#3B82F6)
- **Background**: White/Light Gray
- **Text**: Dark Gray (#1F2937)

### **Typography**:
- **Headings**: Bold, 24px-32px
- **Body**: Regular, 16px
- **Small Text**: 14px
- **Font Family**: System fonts (Arial, sans-serif)

### **Buttons**:
- **Primary**: Pink background, white text, rounded
- **Secondary**: White background, pink border, pink text
- **Danger**: Red background, white text
- **Sizes**: Small, Medium, Large

### **Cards**:
- White background
- Rounded corners (12px)
- Box shadow
- Padding: 20px

### **Forms**:
- Input fields: Border, rounded, padding
- Labels: Above inputs
- Error messages: Red text below inputs
- Success messages: Green text

### **Icons**:
- Emoji icons used throughout
- Font Awesome icons in admin panel
- Size: 20px-24px

### **Layout**:
- **Header Height**: 64px (fixed)
- **Sidebar Width**: 250px (collapsible to 60px)
- **Content Padding**: 24px
- **Max Content Width**: 1200px (centered)

---

## 🎯 Key Design Principles

1. **User-Centric**: Clean, intuitive interface
2. **Accessibility**: High contrast, readable fonts
3. **Responsive**: Mobile-first design
4. **Consistency**: Same components across pages
5. **Visual Hierarchy**: Clear information structure
6. **Feedback**: Loading states, success/error messages
7. **Safety First**: Prominent SOS button, easy access

---

## 📱 Mobile Considerations

- **Hamburger Menu**: Collapsible sidebar
- **Bottom Navigation**: Quick access to main features
- **Touch-Friendly**: Large buttons (min 44px)
- **Swipe Gestures**: For cards and lists
- **Simplified Forms**: Stacked inputs

---

This guide provides a complete overview of the SafeHer project flow for your Figma design. Each section can be designed as separate frames/pages in Figma, with proper navigation flows and component states.
