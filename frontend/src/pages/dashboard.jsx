import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // Updated import for useNavigate

const DashboardPage = () => {
  const [showLoginPopup, setShowLoginPopup] = useState(false); // State for handling the login popup
  const [popupMessage, setPopupMessage] = useState(""); // State for the message in the popup
  const navigate = useNavigate(); // Using useNavigate for navigation

  const handleNavigationClick = (route) => {
    setShowLoginPopup(true);
    setPopupMessage("Can't Access This!Login First");
    setTimeout(() => {
      // Redirect to the login page after 3 seconds using navigate
      navigate("/login");
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Favicon */}
      <link rel="icon" type="image/png" href="/logo.png" />

      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/backvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Top Bar */}
      <motion.div
       className="fixed inset-x-0 top-0 flex justify-between items-center p-2 bg-white backdrop-blur-md z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 bg-opacity-70 rounded-full border-2 border-white"
          />
          <div className="flex flex-col">
            <span className="text-green-700 text-xl font-bold">AgroTech</span>
            <span className="text-green-600 text-xs font-medium italic">Cultivating Smarter Futures</span>
          </div>
        </motion.div>

        {/* Navigation Links */}
        <motion.div
          className="flex space-x-4 text-lg text-green-700"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <button
            onClick={() => handleNavigationClick("/")}
            className="hover:text-green-900"
          >
            Home
          </button>
          <button
            onClick={() => handleNavigationClick("/marketplace")}
            className="hover:text-green-900"
          >
            Marketplace
          </button>
          <Link to="/support" className="hover:text-green-900">Support</Link>
          <Link to="/login" className="hover:text-green-900">Login / SignUp</Link>
        </motion.div>
      </motion.div>

      {/* Login Popup */}
      {showLoginPopup && (
  <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
    <motion.div
      className="bg-white p-8 rounded-lg shadow-lg w-80 text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-lg font-bold text-gray-800 mb-4">
        {popupMessage}
      </p>
      <button
        onClick={() => setShowLoginPopup(false)}
        className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-800 transition-colors duration-300 mt-4"
      >
        Close
      </button>
    </motion.div>
  </div>
)}


      {/* Main Content Section */}
      <motion.div
        className="relative z-0 pt-24 px-6 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl font-bold text-center text-green-700 mb-8">
          Welcome to AgroTech Dashboard
        </h1>
        <p className="text-center text-lg text-gray-600">
          Manage your farming activities, monitor crops, and access resources.
        </p>

        {/* Additional content can go here */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-green-700">Crop Management</h2>
            <p className="text-sm text-gray-600 mt-2">
              Monitor crop health, water, nutrient levels, and yield.
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-green-700">Marketplace</h2>
            <p className="text-sm text-gray-600 mt-2">
              Buy, sell, and bid on agricultural products and services.
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h2 className="text-xl font-semibold text-green-700">Support</h2>
            <p className="text-sm text-gray-600 mt-2">
              Get help with using the platform, troubleshoot issues, and more.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
