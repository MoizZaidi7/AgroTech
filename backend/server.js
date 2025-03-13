import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import userRouter from "./routes/UserRoutes.js";
import adminRouter from "./routes/AdminRoutes.js";
import reportRouter from "./routes/ReportRoutes.js";
import connectDB from "./config/db.js";
import { Server } from 'socket.io';
import http from "http";
import { v4 as uuidv4 } from 'uuid'; // UUID package for unique visitor identification
import cookieParser from "cookie-parser"; // Cookie parser to manage cookies

// Load environment variables
dotenv.config();

// Initialize Express app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// Attach socket.io instance to app
app.set('socketio', io);

// Connect to MongoDB
connectDB();

// Web Analytics Data
let webAnalyticsData = {
  totalVisits: 0, // Initial visit count
  maxVisitedPage: '/dashboard',  // Initial max visited page (can be updated dynamically)
  visitTrends: [],  // To keep track of daily visit counts
  pageVisits: {},  // Object to track visits per route
  uniqueVisitors: new Set()  // To track unique visitors using session ID
};

// Middleware to track real visits
app.use(cookieParser()); // Use cookie parser to handle cookies

app.use((req, res, next) => {
  // Retrieve visitorId from cookies, or generate a new one if not present
  let visitorId = req.cookies.visitorId;

  // If visitorId doesn't exist, generate a new one and set it in the cookie
  if (!visitorId) {
    visitorId = uuidv4();
    res.cookie('visitorId', visitorId, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true }); // Set cookie for a year
  }

  // If this is a new visitor (i.e., a unique session), increment the total visit count
  if (!webAnalyticsData.uniqueVisitors.has(visitorId)) {
    webAnalyticsData.totalVisits++;
    webAnalyticsData.uniqueVisitors.add(visitorId); // Mark this visitor as tracked
  }

  // Track visit trends for the last 7 days (simulating daily visits)
  webAnalyticsData.visitTrends.push(webAnalyticsData.totalVisits);

  // Keep only the latest 7 days of data
  if (webAnalyticsData.visitTrends.length > 7) {
    webAnalyticsData.visitTrends.shift();
  }

  // Track page visits
  const currentPage = req.path;
  if (webAnalyticsData.pageVisits[currentPage]) {
    webAnalyticsData.pageVisits[currentPage]++;
  } else {
    webAnalyticsData.pageVisits[currentPage] = 1;
  }

  // Find the page with the maximum visits
  let maxPage = '';
  let maxVisits = 0;
  for (let page in webAnalyticsData.pageVisits) {
    if (webAnalyticsData.pageVisits[page] > maxVisits) {
      maxPage = page;
      maxVisits = webAnalyticsData.pageVisits[page];
    }
  }

  // Update maxVisitedPage
  webAnalyticsData.maxVisitedPage = maxPage;

  // Calculate the average session duration (You can modify this based on real logic)
  const avgSessionDuration = Math.floor(Math.random() * 5) + 1; // Random simulation for session duration
  webAnalyticsData.averageSessionDuration = `${avgSessionDuration}m ${Math.floor(Math.random() * 60)}s`;

  // Emit updated analytics data to all connected clients
  io.emit('webAnalyticsUpdate', webAnalyticsData);
  console.log('Emitting Web Analytics:', webAnalyticsData);

  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Send initial data when client connects
  socket.emit('webAnalyticsUpdate', webAnalyticsData);

  // Clean up when client disconnects
  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(helmet());

// Routes
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportRouter);

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
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
