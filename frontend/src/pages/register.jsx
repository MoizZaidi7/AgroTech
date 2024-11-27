import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Importing framer-motion

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    userType: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // New state for success message
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Registration successful:", data);
        setShowOtpModal(true);
        setSuccessMessage("Registration successful! Please verify your OTP.");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setOtpError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("OTP verified successfully:", data);
        setShowOtpModal(false);
        setSuccessMessage("Registration successful! You can now log in.");
        setTimeout(() => {
          navigate("/login"); // Navigate to login after success
        }, 2000); // Delay before navigating
      } else {
        setOtpError(data.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("Error during OTP verification:", err);
      setOtpError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
<div>
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

  {/* Logo */}
  <motion.div
    className="absolute top-4 left-4 flex items-center space-x-3"
    initial={{ opacity: 0, x: -100 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 1 }}
  >
    {/* Logo */}
    <img
      src="/logo.png"
      alt="Logo"
      className="h-12 w-12 bg-opacity-70 rounded-full border-2 border-white"
    />
    {/* Text */}
    <div className="flex flex-col">
      <span className="text-white text-2xl font-bold drop-shadow-lg">
        AgroTech
      </span>
      <span className="text-white text-sm font-medium italic drop-shadow-md">
        Cultivating Smarter Futures
      </span>
    </div>
  </motion.div>

  {/* Centered Form Container */}
  <motion.div
    className="absolute inset-0 flex items-center justify-center"
  >
    <motion.div
      className="w-full max-w-md px-6 py-8 rounded-lg shadow-lg"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      style={{ background: 'transparent' }} // Remove background
    >
      <motion.h1
        className="text-3xl font-bold text-center mb-6 text-white drop-shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        REGISTER
      </motion.h1>
      {error && (
        <motion.p
          className="text-red-500 text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {error}
        </motion.p>
      )}
      {successMessage && (
        <motion.p
          className="text-green-500 text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {successMessage}
        </motion.p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <label className="block text-sm font-medium mb-2 text-white">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
            placeholder="Enter your username"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <label className="block text-sm font-medium mb-2 text-white">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
            placeholder="Enter your email"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <label className="block text-sm font-medium mb-2 text-white">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-500"
            placeholder="Enter your password"
            required
          />
        </motion.div>

        {/* Custom User Type Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="relative"
        >
          <label className="block text-sm font-medium mb-2 text-white">User Type</label>
          <div
            className="w-full px-4 py-2 text-sm bg-transparent border-b-2 border-white rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer transition-all duration-500"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {formData.userType}
          </div>
          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-black bg-opacity-75 border border-white rounded-md shadow-lg z-10 transition-all duration-300">
              {["Admin", "Farmer", "Customer", "Seller"].map((type) => (
                <div
                  key={type}
                  onClick={() => {
                    setFormData({ ...formData, userType: type });
                    setDropdownOpen(false);
                  }}
                  className="px-4 py-2 text-sm text-white hover:bg-green-500 cursor-pointer transition-colors duration-300"
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.button
          type="submit"
          className="w-full bg-green-400 text-white py-2 px-4 rounded-md hover:bg-green-500 transition duration-300 ease-in-out"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          {loading ? "Registering..." : "Register"}
        </motion.button>
      </form>

      <p className="text-center text-sm mt-4 text-white">
        Already have an account?{" "}
        <span
          className="cursor-pointer text-green-400 hover:underline"
          onClick={() => navigate("/login")}
        >
          Login
        </span>
      </p>
    </motion.div>
  </motion.div>

  {/* OTP Modal */}
  {showOtpModal && (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white text-black p-6 rounded-lg shadow-lg w-80"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">OTP Verification</h2>
        {otpError && <p className="text-red-500 mb-4">{otpError}</p>}
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md"
          placeholder="Enter OTP"
        />
        <div className="flex justify-center mt-4">
          <motion.button
            onClick={handleOtpSubmit}
            className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Verify OTP
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )}
</div>


  )};
export default Register;
