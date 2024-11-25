import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="flex h-screen">
      {/* Left Side: Register Form */}
      <div className="flex flex-col justify-center items-center w-1/3 bg-gradient-to-br from-green-100 to-white p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-8">REGISTER</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>} {/* Success message */}
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">User Type</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="Admin">Admin</option>
              <option value="Farmer">Farmer</option>
              <option value="Customer">Customer</option>
              <option value="Seller">Seller</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Button to navigate to Login */}
        <div className="mt-4 text-sm">
          <button
            onClick={() => navigate("/login")}
            className="text-green-600 hover:text-green-700"
          >
            Already have an account? Login
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

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded-md mb-4"
              placeholder="Enter OTP"
              required
            />
            {otpError && <p className="text-red-500 mb-4">{otpError}</p>}
            <button
              onClick={handleOtpSubmit}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
