import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', verified); // Debugging line

    // Attach the decoded payload (e.g., user ID) to the request object
    req.user = verified;

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
