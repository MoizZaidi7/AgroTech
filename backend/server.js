import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/UserRoutes.js';
import connectDB from "./config/db.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));  // Allow requests from React frontend
app.use(express.json());  // Parse JSON requests

// Routes
app.use('/api/users', userRouter);

// Default Route
app.get('/', (req, res) => {
  res.send("Welcome to AgroTech Application Farmers!!!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
