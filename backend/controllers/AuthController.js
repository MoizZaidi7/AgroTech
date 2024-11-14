import bcrypt from 'bcryptjs';
import generateToken from '../utils/generate.js';
import User from '../models/User.js';


// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password, userType } = req.body;
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      // Validate userType
      const validUserTypes = ['Admin', 'Farmer', 'Customer', 'Seller'];
      if (!validUserTypes.includes(userType)) {
            return res.status(400).json({ message: 'Invalid user type' });
         }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user object and save it
      const newUser = new User({ username, email, password: hashedPassword, userType});
      await newUser.save();
  
      // Generate JWT token
      const token = generateToken(newUser._id);  
      // Return the newly created user and token
      res.status(201).json({ user: newUser, token });
    } catch (error) {
      console.log("error",error)
      res.status(500).json({ message: 'Error registering user', error });
    }
  };
  
  // Login an existing user
  const loginUser = async (req, res) => {
    const { email, password, rememberMe } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Check if the password is valid
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' });
  
      // Generate JWT token
      const expiresIn = rememberMe ? '7d' : '1h';
      const token = generateToken(user._id, expiresIn);
  
      // Return the logged-in user and token
      res.status(200).json({ user, token });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  };
  
  export {loginUser, registerUser};