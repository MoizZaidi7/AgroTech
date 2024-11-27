import jwt from 'jsonwebtoken';
import User from '../models/User.js';  // Import the User model to fetch user data

const authMiddleware = async (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', verified); // Debugging line

    // Find user by the ID in the token (ensure user exists and attach userType)
    const user = await User.findById(verified.id).select('userType'); // Adjust according to your schema

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user and userType to the request object
    req.user = { id: user._id, userType: user.userType }; // Attach only the needed fields
    console.log('User data attached to request:', req.user); // Debugging line

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle different JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // General error handling
    console.error('JWT Verification Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default authMiddleware;
