import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

// Pages
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import DashAdmin from "./pages/dashboardadmin";
import DashFarmer from "./pages/dashboardFarmer.jsx";
import ReportsPage from "./pages/Reports.jsx";

// Components
import Header from "./components/Header.jsx";
import DashHeader from "./components/DashHeader.jsx";
import { ChatbotWidget } from "./components/ChatBotWidget";
import MarketPlace from "./pages/Marketplace.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<><Header /><Dashboard /></>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<><Header /><Register /></>} />
      <Route path="/forgotPassword" element={<><Header /><ForgotPassword /></>} />
      <Route path="/resetPassword" element={<><Header /><ResetPassword /></>} />
      <Route path="/marketplace" element={<><MarketPlace /></>} />

      {/* Private Routes */}
      <Route path="/dashboardadmin" element={
        <PrivateRoute roles={["Admin"]}>
          <><DashHeader /><DashAdmin /></>
        </PrivateRoute>
      }/>

      <Route path="/dashboardfarmer" element={
        <PrivateRoute roles={["Farmer"]}>
          <><DashHeader /><DashFarmer /></>
        </PrivateRoute>
      }/>
      {/* Reports Module - Admin Only */}
      <Route path="/reports" element={
        <PrivateRoute roles={["Admin"]}>
          <><DashHeader /><ReportsPage /></>
        </PrivateRoute>
      }/>
    </Routes>
  );
};

const App = () => {
  const location = useLocation();
  const hideChatbotOn = [
    "/login",
    "/register",
    "/forgotPassword",
    "/resetPassword",
    "/dashboardadmin",
    "/reports", // Optional: Hide chatbot on reports page
  ];

  return (
    <>
      <AppRoutes />
      {!hideChatbotOn.includes(location.pathname) && <ChatbotWidget />}
    </>
  );
};

// Root App with Router
export default function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
