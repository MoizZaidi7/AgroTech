import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/login";
import Register from "./pages/register"
import Dashboard from "./pages/dashboard"
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import DashAdmin from "./pages/dashboardadmin";
import DashFarmer from "./pages/dashboardFarmer";
import ManageUsers from "./pages/manageUsers";
import Header from "./components/Header";
import RegisterUserByAdmin from "./pages/RegisterUserByAdmin";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route
            path="/dashboardadmin"
            element={
              <PrivateRoute roles={['Admin']}>
                <DashAdmin />
              </PrivateRoute>
            }
          />
        <Route
            path="/ManageUsers"
            element={
              <PrivateRoute roles={['Admin']}>
                <ManageUsers />
              </PrivateRoute>
            }
          />
        <Route
            path="/RegisterUserByAdmin"
            element={
              <PrivateRoute roles={['Admin']}>
                <RegisterUserByAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboardfarmer"
            element={
              <PrivateRoute roles={['Farmer']}>
                <DashFarmer />
              </PrivateRoute>
            }
          />
      </Routes>
    </Router>
  );
};

export default App;
