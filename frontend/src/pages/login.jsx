import React, { useState } from "react";
import axiosInstance from "../utils/axiosconfig";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../firebase/firebase"; // Import Firebase auth instance
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"; // Import Google Sign-In methods
import { login } from '../Redux/authslice';
import { useDispatch } from 'react-redux';



const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setrememberMe] = useState(false);

  // Initialize Google Auth Provider
  const provider = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post("http://localhost:5000/api/users/login", {
        email,
        password,
        rememberMe,
      });

      const { token, expiresIn, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("expiresIn", expiresIn);
      localStorage.setItem("user", user);

      dispatch(login({ user, token }));


      alert("Login successful!");
      // Navigate based on user role or type
    if (user.userType === "Admin") {
      navigate("/dashboardadmin");
    } else if (user.userType === "Farmer") {
      navigate("/dashboardFarmer");
    } 
    else {
      navigate("/dashboard"); // Fallback to a generic dashboard
    }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await axiosInstance.post("http://localhost:5000/api/users/google-login", {
        email: user.email,
        name: user.displayName,
        profilePicture: user.photoURL,
        googleId: user.uid,
      });

      alert("Google Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error during Google Sign-In:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen relative">
      <div className="absolute inset-0 w-full h-full">
        <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
          <source src="/backvideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="flex items-center justify-center w-full h-full absolute inset-0">
        <motion.div
          className="flex flex-col justify-center items-center p-8 rounded-lg shadow-xl w-full max-w-md space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="text-3xl font-bold text-center text-white mb-6 drop-shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            LOGIN
          </motion.h1>

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
              <label className="block text-sm font-medium mb-2 text-white">User Email</label>
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
              <label className="block text-sm font-medium mb-2 text-white">Password</label>
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
                onClick={() => navigate("/forgotPassword")}
                type="button"
                className="text-sm text-white hover:text-green-400 transition duration-300 ease-in-out"
              >
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

          {/* Google Sign-In Button */}
          <div className="mt-4 w-full">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
            >
              <img
                src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
                alt="Google Logo"
                className="h-5 w-5 mr-2"
              />
              {loading ? "Signing in with Google..." : "Sign in with Google"}
            </button>
          </div>

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
