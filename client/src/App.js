import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// User Pages
import Home from "./pages/Home";
import Features from "./pages/Features";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OAuthSuccess from "./pages/OAuthSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./screens/Dashboard";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Health from "./pages/Health";
import HealthLanding from "./pages/HealthLanding";
import Helplines from "./pages/Helplines";
import PeriodTracker from "./pages/PeriodTracker";
import PeriodTrackingOverview from "./pages/PeriodTracker/PeriodTrackingOverview";
import EducationArticleReader from "./pages/PeriodTracker/EducationArticleReader";
import ConceiveDashboard from "./pages/PeriodTracker/ConceiveDashboard";
import ArticleDetailRouter from "./pages/PeriodTracker/ArticleDetailRouter";
import PregnancyIntro from "./pages/PeriodTracker/PregnancyIntro";
import PregnancyDashboard from "./pages/PeriodTracker/PregnancyDashboard";
import PregnancyModeDashboard from "./pages/PeriodTracker/PregnancyModeDashboard";
import PregnancyWeekArticle from "./pages/PeriodTracker/PregnancyWeekArticle";
import CommunityPostDetail from "./pages/PeriodTracker/CommunityPostDetail";
import PregnancyArticleReader from "./pages/PeriodTracker/PregnancyArticleReader";
import PartnerDashboard from "./pages/PeriodTracker/PartnerDashboard";
import PartnerResourcePage from "./pages/PeriodTracker/PartnerResourcePage";
import PartnerResourceArticleReader from "./pages/PeriodTracker/PartnerResourceArticleReader";
import PerimenopauseDashboard from "./pages/PeriodTracker/PerimenopauseDashboard";
import Resources from "./pages/Resources";
import Quiz from "./pages/Quiz";
import Assessment from "./pages/Assessment";
import SubmitResource from "./pages/SubmitResource";
import MyContacts from "./pages/MyContacts";
import Settings from "./pages/Settings";
import FeedbackList from "./pages/FeedbackList";
import FeedbackForm from "./pages/FeedbackForm";
import LocationTracking from "./pages/LocationTracking";
import PaymentPage from "./pages/PaymentPage";
import Subscription from "./pages/Subscription";
import SelfCare from "./pages/SelfCare";

// E-commerce Pages
import ShopHome from "./pages/ShopHome";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import CategoryProducts from "./pages/CategoryProducts";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import EcommerceCollectionPage from "./pages/EcommerceCollectionPage";
import EcommerceSupportPage from "./pages/EcommerceSupportPage";
import EcommerceUserDashboard from "./pages/EcommerceUserDashboard";

// Forum Pages
import ForumHome from "./pages/ForumHome";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import MyPosts from "./pages/MyPosts";
import BookmarkedPosts from "./pages/BookmarkedPosts";
import TrendingPosts from "./pages/TrendingPosts";
import Wishlist from "./pages/Wishlist";
import AdminForum from "./pages/admin/AdminForum";
import ForumDashboard from "./pages/admin/forum/ForumDashboard";
import ForumPosts from "./pages/admin/forum/ForumPosts";
import ForumComments from "./pages/admin/forum/ForumComments";
import ForumReports from "./pages/admin/forum/ForumReports";
import ForumUserActivity from "./pages/admin/forum/ForumUserActivity";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSOSLogs from "./pages/admin/AdminSOSLogs";
import AdminHelplines from "./pages/admin/AdminHelplines";
import AdminResources from "./pages/admin/AdminResources";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminFeedback from "./pages/AdminFeedback";
import AdminHealth from "./pages/admin/AdminHealth";
import AdminPeriodTracking from "./pages/admin/AdminPeriodTracking";
import AdminEcommerce from "./pages/admin/AdminEcommerce";
import EcommerceDashboard from "./pages/admin/ecommerce/EcommerceDashboard";
import EcommerceProducts from "./pages/admin/ecommerce/EcommerceProducts";
import EcommerceCategories from "./pages/admin/ecommerce/EcommerceCategories";
import EcommerceInventory from "./pages/admin/ecommerce/EcommerceInventory";
import EcommerceOrders from "./pages/admin/ecommerce/EcommerceOrders";
import EcommerceCoupons from "./pages/admin/ecommerce/EcommerceCoupons";
import EcommerceReviews from "./pages/admin/ecommerce/EcommerceReviews";
import EcommercePayments from "./pages/admin/ecommerce/EcommercePayments";
import EcommerceReports from "./pages/admin/ecommerce/EcommerceReports";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminTrackerManagement from "./pages/admin/AdminTrackerManagement";
import PeriodTrackerAdminPage from "./pages/admin/tracker/PeriodTrackerAdminPage";
import ConceiveTrackerAdminPage from "./pages/admin/tracker/ConceiveTrackerAdminPage";
import PregnancyTrackerAdminPage from "./pages/admin/tracker/PregnancyTrackerAdminPage";
import PerimenopauseTrackerAdminPage from "./pages/admin/tracker/PerimenopauseTrackerAdminPage";
import AdminTelehealth from "./pages/admin/AdminTelehealth";
import TelehealthDashboard from "./pages/admin/telehealth/TelehealthDashboard";
import DoctorManagement from "./pages/admin/telehealth/DoctorManagement";
import AppointmentManagement from "./pages/admin/telehealth/AppointmentManagement";
import UserManagement from "./pages/admin/telehealth/UserManagement";
import PaymentManagement from "./pages/admin/telehealth/PaymentManagement";
import ReportsAnalytics from "./pages/admin/telehealth/ReportsAnalytics";
import ContentManagement from "./pages/admin/telehealth/ContentManagement";
import SecurityCompliance from "./pages/admin/telehealth/SecurityCompliance";
import TelehealthSettings from "./pages/admin/telehealth/Settings";

// User Telehealth Pages
import Telehealth from "./pages/Telehealth";
import UserTelehealthDashboard from "./pages/telehealth/TelehealthDashboard";
import DoctorDirectory from "./pages/telehealth/DoctorDirectory";
import Appointments from "./pages/telehealth/Appointments";
import AppointmentHistory from "./pages/telehealth/AppointmentHistory";
import HealthData from "./pages/telehealth/HealthData";
import Prescriptions from "./pages/telehealth/Prescriptions";
import Consultation from "./pages/telehealth/Consultation";
import Consultations from "./pages/telehealth/Consultations";
import Payments from "./pages/telehealth/Payments";
import TelehealthNotifications from "./pages/telehealth/Notifications";
import UserTelehealthSettings from "./pages/telehealth/TelehealthSettings";

// Doctor Telehealth Pages
import DoctorLayout from "./pages/doctor/DoctorLayout";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorConsultation from "./pages/doctor/DoctorConsultation";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorEarnings from "./pages/doctor/DoctorEarnings";
import DoctorNotifications from "./pages/doctor/DoctorNotifications";
import DoctorSettings from "./pages/doctor/DoctorSettings";

// Wrappers
import ProtectedRoute from "./components/ProtectedRoute";
import UserRoute from "./components/UserRoute";
import AdminRoute from "./components/AdminRoute";
import DoctorRoute from "./components/DoctorRoute";

// ---------------- App Routes ----------------
function AppRoutes() {
  const location = useLocation();

  const isAdminPage =
    location.pathname.startsWith("/admin") && location.pathname !== "/admin/login";

  return (
    <Routes>
      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/sos"
        element={
          <AdminRoute>
            <AdminSOSLogs />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/helplines"
        element={
          <AdminRoute>
            <AdminHelplines />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/resources"
        element={
          <AdminRoute>
            <AdminResources />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <AdminReports />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/feedback"
        element={
          <AdminRoute>
            <AdminFeedback />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/health"
        element={
          <AdminRoute>
            <AdminHealth />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/period-tracking"
        element={
          <AdminRoute>
            <AdminPeriodTracking />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tracker"
        element={
          <AdminRoute>
            <AdminTrackerManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tracker/period"
        element={
          <AdminRoute>
            <PeriodTrackerAdminPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tracker/conceive"
        element={
          <AdminRoute>
            <ConceiveTrackerAdminPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tracker/pregnancy"
        element={
          <AdminRoute>
            <PregnancyTrackerAdminPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tracker/perimenopause"
        element={
          <AdminRoute>
            <PerimenopauseTrackerAdminPage />
          </AdminRoute>
        }
      />
      {/* E-commerce Routes */}
      <Route
        path="/admin/ecommerce"
        element={
          <AdminRoute>
            <AdminEcommerce />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<EcommerceDashboard />} />
        <Route path="dashboard" element={<Navigate to="/admin/ecommerce/overview" replace />} />
        <Route path="products" element={<EcommerceProducts />} />
        <Route path="categories" element={<EcommerceCategories />} />
        <Route path="inventory" element={<EcommerceInventory />} />
        <Route path="orders" element={<EcommerceOrders />} />
        <Route path="coupons" element={<EcommerceCoupons />} />
        <Route path="reviews" element={<EcommerceReviews />} />
        <Route path="payments" element={<EcommercePayments />} />
        <Route path="reports" element={<EcommerceReports />} />
      </Route>
      {/* Telehealth Routes */}
      <Route
        path="/admin/telehealth"
        element={
          <AdminRoute>
            <AdminTelehealth />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TelehealthDashboard />} />
        <Route path="doctors" element={<DoctorManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="appointments" element={<AppointmentManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="reports" element={<ReportsAnalytics />} />
        <Route path="content" element={<ContentManagement />} />
        <Route path="security" element={<SecurityCompliance />} />
        <Route path="settings" element={<TelehealthSettings />} />
      </Route>
      <Route
        path="/admin/profile"
        element={
          <AdminRoute>
            <AdminProfile />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/forum"
        element={
          <AdminRoute>
            <AdminForum />
          </AdminRoute>
        }
      >
        <Route index element={<ForumDashboard />} />
        <Route path="dashboard" element={<ForumDashboard />} />
        <Route path="posts" element={<ForumPosts />} />
        <Route path="comments" element={<ForumComments />} />
        <Route path="reports" element={<ForumReports />} />
        <Route path="users" element={<ForumUserActivity />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Public & User Protected Routes */}
      {!isAdminPage && (
        <>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* User Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <UserRoute>
                <Dashboard />
              </UserRoute>
            }
          />
          <Route
            path="/forum/users/:userId"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health"
            element={
              <ProtectedRoute>
                <HealthLanding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health-tracker"
            element={
              <ProtectedRoute>
                <Health />
              </ProtectedRoute>
            }
          />
          <Route
            path="/helplines"
            element={
              <ProtectedRoute>
                <Helplines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/period-tracker"
            element={
              <ProtectedRoute>
                <PeriodTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/period-tracking"
            element={
              <ProtectedRoute>
                <PeriodTrackingOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/education/article/:id"
            element={
              <ProtectedRoute>
                <EducationArticleReader />
              </ProtectedRoute>
            }
          />
          <Route
            path="/period-tracking/conceive-intro"
            element={
              <ProtectedRoute>
                <Navigate to="/period-tracking/conceive" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/period-tracking/conceive"
            element={
              <ProtectedRoute>
                <ConceiveDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/articles/:articleId"
            element={
              <ProtectedRoute>
                <ArticleDetailRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pregnancy/articles/:articleId"
            element={
              <ProtectedRoute>
                <PregnancyArticleReader />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pregnancy/week/:week"
            element={
              <ProtectedRoute>
                <PregnancyWeekArticle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/period-tracking/pregnancy-intro"
            element={
              <ProtectedRoute>
                <PregnancyIntro />
              </ProtectedRoute>
            }
          />
          <Route
            path="/period-tracking/pregnancy"
            element={
              <ProtectedRoute>
                <PregnancyModeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/period-tracking/pregnancy-dashboard"
            element={
              <ProtectedRoute>
                <PregnancyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pregnancy-dashboard"
            element={
              <ProtectedRoute>
                <PregnancyModeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pregnancy/care-plan"
            element={
              <ProtectedRoute>
                <PregnancyModeDashboard initialTab="care-plan" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pregnancy/community"
            element={
              <ProtectedRoute>
                <PregnancyModeDashboard initialTab="community" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/post/:postId"
            element={
              <ProtectedRoute>
                <CommunityPostDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner-dashboard/:token"
            element={<PartnerDashboard />}
          />
          <Route
            path="/partner-dashboard"
            element={
              <ProtectedRoute>
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner-resources/birth-plan"
            element={
              <ProtectedRoute>
                <PartnerResourcePage categorySlug="birth-plan" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner-resources/labor-support"
            element={
              <ProtectedRoute>
                <PartnerResourcePage categorySlug="labor-support" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner-resources/new-dad"
            element={
              <ProtectedRoute>
                <PartnerResourcePage categorySlug="new-dad" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner-resources/article/:id"
            element={
              <ProtectedRoute>
                <PartnerResourceArticleReader />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perimenopause-intro"
            element={
              <ProtectedRoute>
                <Navigate to="/period-tracking/perimenopause" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/period-tracking/perimenopause"
            element={
              <ProtectedRoute>
                <PerimenopauseDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            }
          />
          {/* Forum Routes */}
          <Route
            path="/forum"
            element={
              <ProtectedRoute>
                <ForumHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/posts/:id"
            element={
              <ProtectedRoute>
                <PostDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/create"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/posts/:id/edit"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/my-posts"
            element={
              <ProtectedRoute>
                <MyPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/bookmarked"
            element={
              <ProtectedRoute>
                <BookmarkedPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/trending"
            element={
              <ProtectedRoute>
                <TrendingPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-contacts"
            element={
              <ProtectedRoute>
                <MyContacts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <FeedbackForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-feedback"
            element={
              <ProtectedRoute>
                <FeedbackList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit-resource"
            element={
              <ProtectedRoute>
                <SubmitResource />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location-tracking"
            element={
              <ProtectedRoute>
                <LocationTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-page"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/selfcare"
            element={
              <ProtectedRoute>
                <SelfCare />
              </ProtectedRoute>
            }
          />

          {/* Telehealth Routes */}
          <Route
            path="/telehealth"
            element={
              <ProtectedRoute>
                <Telehealth />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserTelehealthDashboard />} />
            <Route path="dashboard" element={<UserTelehealthDashboard />} />
            <Route path="doctors" element={<DoctorDirectory />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="history" element={<AppointmentHistory />} />
            <Route path="records" element={<HealthData />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="payments" element={<Payments />} />
            <Route path="consultations" element={<Consultations />} />
            <Route path="consultation/:appointmentId" element={<Consultation />} />
            <Route path="notifications" element={<TelehealthNotifications />} />
            <Route path="settings" element={<UserTelehealthSettings />} />
          </Route>

          {/* Doctor Telehealth Routes */}
          <Route
            path="/doctor"
            element={
              <DoctorRoute>
                <DoctorLayout />
              </DoctorRoute>
            }
          >
            <Route index element={<DoctorDashboard />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="consultations" element={<DoctorConsultation />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="earnings" element={<DoctorEarnings />} />
            <Route path="notifications" element={<DoctorNotifications />} />
            <Route path="settings" element={<DoctorSettings />} />
          </Route>

          {/* E-commerce Routes */}
          <Route path="/shop" element={<ShopHome />} />
          <Route path="/shop/products/:id" element={<ProductDetail />} />
          <Route
            path="/shop/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route path="/shop/category/:slug" element={<CategoryProducts />} />
          <Route path="/shop/search" element={<ShopHome />} />
          <Route path="/shop/offers" element={<EcommerceCollectionPage type="offers" />} />
          <Route path="/shop/best-sellers" element={<EcommerceCollectionPage type="bestSellers" />} />
          <Route path="/shop/new-arrivals" element={<EcommerceCollectionPage type="newArrivals" />} />
          <Route path="/shop/support" element={<EcommerceSupportPage />} />
          <Route path="/shop/dashboard" element={<EcommerceUserDashboard />} />
          <Route
            path="/shop/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/order-confirmation/:id"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/orders"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
        </>
      )}
    </Routes>
  );
}

// ---------------- App Component ----------------
function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <AppRoutes />
    </Router>
  );
}

export default App;
