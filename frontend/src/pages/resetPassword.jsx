import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the token from the query params
  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token.");
    }
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    console.log("Token extracted from URL:", token);
    console.log("New password being submitted:", newPassword);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/users/resetPassword/${token}`, {
        newPassword,
      });
      console.log("Response from server:", response.data);


      if (response.data.message === "Password reset successfully") {
        setSuccess("Password reset successfully. Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000); // Redirect to login page after success
      } else {
        setError(response.data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Error in password reset request:", err.response?.data);
      setError(err.response?.data?.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <form onSubmit={handleResetPassword} className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Reset Password</h1>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Enter new password"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Confirm new password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
