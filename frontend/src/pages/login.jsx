import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Importing framer-motion

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setrememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
        rememberMe
      });

      // Save token to localStorage
      const { token, expiresIn } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("expiresIn", expiresIn); // Optional: Save expiration info if needed

      alert("Login successful!");
      navigate("/dashboard");
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen relative">
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
  
    {/* Login Block */}
    <div className="flex items-center justify-center w-full h-full absolute inset-0">
      <motion.div
        className="flex flex-col justify-center items-center p-8 rounded-lg shadow-xl w-full max-w-md space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Logo */}
        <motion.div
          className="absolute top-4 left-4 flex items-center space-x-3"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="h-12 w-12 rounded-full border-2 border-white"
          />
          <div className="flex flex-col">
            <span className="text-white text-2xl font-bold drop-shadow-lg">
              AgroTech
            </span>
            <span className="text-white text-sm font-medium italic drop-shadow-md">
              Cultivating Smarter Futures
            </span>
          </div>
        </motion.div>
  
        <motion.h1
          className="text-3xl font-bold text-center text-white mb-6 drop-shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          LOGIN
        </motion.h1>
  
        {/* Error and Success Messages */}
        {error && (
          <motion.p
            className="text-red-300 text-center mb-4 drop-shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {error}
          </motion.p>
        )}
  
        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              User Email
            </label>
            <motion.input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-transparent border border-white rounded-md text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your email"
              required
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Password
            </label>
            <motion.input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-transparent border border-white rounded-md text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your password"
              required
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            />
          </div>
  
          {/* Remember Me and Show Password */}
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center text-sm text-white">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2"
              />
              Show Password
            </label>
            <button
              onClick={() => navigate('/forgotPassword')}
              type="button"
              className="text-sm text-white hover:text-green-400 transition duration-300 ease-in-out">
              Forgot Password
            </button>
          </div>
  
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center text-sm text-white">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setrememberMe(!rememberMe)}
                className="mr-2"
              />
              Remember Me
            </label>
          </div>
  
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-green-400 text-white py-2 px-4 rounded-md hover:bg-green-500 transition duration-300 ease-in-out"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>
  
        {/* Switch to Register Page */}
        <motion.div
          className="mt-4 text-center text-sm text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <button
            onClick={() => navigate("/register")}
            className="text-green hover:text-green-400 transition duration-300 ease-in-out underline"
          >
            Don't have an account? Register
          </button>
        </motion.div>
      </motion.div>
    </div>
  </div>
  
  
  );
};

export default Login;
