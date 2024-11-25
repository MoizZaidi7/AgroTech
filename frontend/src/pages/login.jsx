import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

      const { token } = response.data;
      localStorage.setItem("authToken", token);
      alert("Login successful!");
      navigate("/dashboard");
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side: Login Form */}
      <div className="flex flex-col justify-center items-center w-1/3 bg-gradient-to-br from-green-100 to-white p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-8">LOGIN</h1>
        <div className="flex justify-center mb-4 space-x-6">
          <button className="text-green-700 font-medium underline">User Login</button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="w-full max-w-xs">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">User Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center text-sm">
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
            className="text-sm text-green-600 hover:underline">
            Forget Password
            </button>
          </div>
          <div className="flex items-center justify-between mb-4">
            {/* Remember Me Checkbox */}
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setrememberMe(!rememberMe)}
                className="mr-2"
              />
              Remember Me
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {/* Switch to Register Page */}
        <div className="mt-4 text-sm text-green-700">
          <button
            onClick={() => navigate("/register")}
            className="underline font-medium"
          >
            Don't have an account? Register
          </button>
        </div>
      </div>

      {/* Right Side: Background Image */}
      <div
        className="w-2/3 bg-cover bg-center"
        style={{
          backgroundImage: "url('/Agrotech.webp')",
        }}
      >
        <div className="h-full flex flex-col justify-center items-center bg-opacity-50 bg-gray-700 text-white">
          <h2 className="text-4xl font-bold mb-2">AgroTech</h2>
          <p className="text-lg">Where Farming Meets Technology.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

