import React from "react";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import DashAdmin from "./pages/dashboardadmin";
import DashFarmer from "./pages/dashboardfarmer";
import ManageUsers from "./pages/manageUsers";
import Header from "./components/Header";
import DashHeader from "./components/DashHeader.jsx";
import RegisterUserByAdmin from "./pages/RegisterUserByAdmin.jsx";
import PublicRoute from "./routes/publicroute.jsx";

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
        <PublicRoute>
        <>
          <Header />
          <Login />
        </>
        </PublicRoute>
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
      path: "/ManageUsers",
      element: (
        <PrivateRoute roles={["Admin"]}>
          <>
            <DashHeader />
            <ManageUsers />
          </>
        </PrivateRoute>
      ),
    },
    {
      path: "/RegisterUserByAdmin",
      element: (
        <PrivateRoute roles={["Admin"]}>
          <>
            <DashHeader />
            <RegisterUserByAdmin />
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
