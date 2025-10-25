import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

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
import Health from "./pages/Health";
import Helplines from "./pages/Helplines";
import PeriodTracker from "./pages/PeriodTracker";
import PeriodTrackingOverview from "./pages/PeriodTracker/PeriodTrackingOverview";
import ConceiveIntro from "./pages/PeriodTracker/ConceiveIntro";
import ConceiveDashboard from "./pages/PeriodTracker/ConceiveDashboard";
import PregnancyIntro from "./pages/PeriodTracker/PregnancyIntro";
import PregnancyDashboard from "./pages/PeriodTracker/PregnancyDashboard";
import PerimenopauseIntro from "./pages/PeriodTracker/PerimenopauseIntro";
import PerimenopauseIntroSimple from "./pages/PeriodTracker/PerimenopauseIntroSimple";
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
import AdminProfile from "./pages/admin/AdminProfile";

// Wrappers
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

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
        path="/admin/profile"
        element={
          <AdminRoute>
            <AdminProfile />
          </AdminRoute>
        }
      />
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
              <ProtectedRoute>
                <Dashboard />
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
            path="/period-tracking/conceive-intro"
            element={
              <ProtectedRoute>
                <ConceiveIntro />
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
                <PregnancyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perimenopause-intro"
            element={
              <ProtectedRoute>
                <PerimenopauseIntroSimple />
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
        </>
      )}
    </Routes>
  );
}

// ---------------- App Component ----------------
function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
