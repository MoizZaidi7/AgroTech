import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Helper function to determine the dashboard path based on user type
  const getDashboardPath = (userType) => {
    switch (userType) {
      case "Admin":
        return "/dashboardadmin";
      case "Farmer":
        return "/dashboardfarmer";
      case "Customer":
        return "/dashboardcustomer";
      case "Seller":
        return "/dashboardseller";
      default:
        return "/dashboard";
    }
  };

  // Check if the user is authenticated and trying to access restricted public routes
  if (isAuthenticated) {
    // Allow navigation to login and register pages even if authenticated
    const allowedPaths = ["/login", "/register"];
    if (!allowedPaths.includes(location.pathname)) {
      return <Navigate to={getDashboardPath(user?.userType)} replace />;
    }
  }

  // Render children for unauthenticated users or for allowed paths
  return children;
};

export default PublicRoute;
