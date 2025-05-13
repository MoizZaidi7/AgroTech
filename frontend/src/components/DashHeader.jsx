import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Redux/authslice";
import axiosInstance from "../utils/axiosConfig";

const DashHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const inactivityTimer = useRef(null);

  const INACTIVITY_LIMIT = 2 * 60 * 1000; // 2 minutes

  const handleLogout = async () => {
    try {
      await axiosInstance.post(
        "/users/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error during logout:", error.response?.data || error.message);
    }

    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

    inactivityTimer.current = setTimeout(() => {
      alert("Session expired due to inactivity.");
      handleLogout();
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetInactivityTimer));

    resetInactivityTimer(); // Start the timer initially

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  const handleHomeClick = () => {
    if (user?.userType === "Admin") navigate("/dashboardadmin");
    else if (user?.userType === "Farmer") navigate("/dashboardfarmer");
    else if (user?.userType === "Customer") navigate("/dashboardcustomer");
    else alert("Role not recognized. Please contact support.");
  };

  return (
    <div className="relative">
      <motion.div
        className="fixed inset-x-0 top-0 flex justify-between items-center p-4 z-50 bg-white/90 backdrop-blur-md shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Logo Section */}
        <motion.div
          className="flex items-center space-x-2 cursor-pointer"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          onClick={handleHomeClick}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 bg-opacity-70 rounded-full border-2 border-green-700"
          />
          <div className="flex flex-col">
            <span className="text-green-700 text-xl font-bold">AgroTech</span>
            <span className="text-green-600 text-xs font-medium italic">
              Cultivating Smarter Futures
            </span>
          </div>
        </motion.div>

        {/* Navigation Links */}
        <motion.div
          className="flex space-x-6 text-lg font-medium"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <Link
            to="#"
            onClick={handleHomeClick}
            className="text-green-700 hover:text-green-900 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/marketplace"
            className="text-green-700 hover:text-green-900 transition-colors"
          >
            Marketplace
          </Link>
          <Link
            to="/support"
            className="text-green-700 hover:text-green-900 transition-colors"
          >
            Support
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-1 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashHeader;
