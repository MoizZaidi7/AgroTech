import React from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import DashAdmin from "./pages/dashboardadmin";
import Header from "./components/Header.jsx";
import DashHeader from "./components/DashHeader.jsx";
import DashFarmer from "./pages/dashboardFarmer.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

const AppRoutes = () => {
  return useRoutes([
    {
      path: "/",
      element: (
        <>
          <Header />
          <Dashboard />
        </>
      ),
    },
    {
      path: "/login",
      element: (
        <>
          <PublicRoute>
          <Login />
          </PublicRoute>
        </>
      ),
    },
    {
      path: "/register",
      element: (
        <>
          <Header />
          <Register />
        </>
      ),
    },
    {
      path: "/forgotPassword",
      element: (
        <>
          <Header />
          <ForgotPassword />
        </>
      ),
    },
    {
      path: "/resetPassword",
      element: (
        <>
          <Header />
          <ResetPassword />
        </>
      ),
    },
    {
      path: "/dashboardadmin",
      element: (
        <PrivateRoute roles={["Admin"]}>
          <>
            <DashHeader />
            <DashAdmin />
          </>
        </PrivateRoute>
      ),
    },
    {
      path: "/dashboardfarmer",
      element: (
        <PrivateRoute roles={["Farmer"]}>
          <>
            <DashHeader />
            <DashFarmer />
          </>
        </PrivateRoute>
      ),
    },
  ]);
};

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
