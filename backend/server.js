import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import userRouter from "./routes/UserRoutes.js";
import AdminRouter from "./routes/AdminRoutes.js";
import connectDB from "./config/db.js";


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));  // Allow requests from React frontend
app.use(express.json()); // Parse JSON requests
app.use(helmet()); // Secure HTTP headers

// Routes
app.use('/api/users', userRouter); // User-related routes
app.use('/api/admin', AdminRouter); // Admin-specific routes


// Default Route
app.get('/', (req, res) => {
  res.send("Welcome to AgroTech Application Farmers!!!");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected error occurred",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
