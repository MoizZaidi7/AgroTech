import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register"
import Dashboard from "./pages/dashboard"
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import DashAdmin from "./pages/dashboardadmin";
import ManageUsers from "./pages/manageUsers";
import Header from "./components/Header";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboardadmin" element={<DashAdmin />}/>
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/ManageUsers" element={<ManageUsers />} />

      </Routes>
    </Router>
  );
};

export default App;
