import User from '../models/User.js';

const updateLastActivity = async (req, res, next) => {
  if (req.user) {
    // Update the last activity timestamp for the logged-in user
    await User.findByIdAndUpdate(req.user._id, { lastActivity: Date.now() });
  }
  next();
};

export { updateLastActivity };
