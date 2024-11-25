import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/users/forgotPassword", { email });

      setSuccessMessage(response.data.message); // Message like "A reset link has been sent to your email."
      setLoading(false);
      // Redirect user to login page after success
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending reset link");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gradient-to-br from-green-100 to-white">
      <div className="w-full max-w-md p-8 bg-white rounded-md shadow-md">
        <h1 className="text-3xl font-bold text-green-700 mb-8">Forget Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter your email address"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
        <div className="mt-4 text-sm text-green-700">
          <button
            onClick={() => navigate("/login")}
            className="underline font-medium"
          >
            Remembered your password? Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
