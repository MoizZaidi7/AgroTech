import User from '../models/User.js';

const checkInactivity = async (req, res, next) => {
  if (req.user) {
    const user = await User.findById(req.user._id);

    const inactivityLimit = 1 * 60 * 1000; // 1 minute in milliseconds
    const currentTime = Date.now();
    const lastActivityTime = user.lastActivity.getTime();

    if (currentTime - lastActivityTime > inactivityLimit) {
      // If the user has been inactive for more than 1 minute, log them out
      req.logout();  // Assuming you're using a session-based authentication strategy
      return res.status(401).json({ message: "You have been logged out due to inactivity." });
    }
  }
  next();
};

export { checkInactivity };
