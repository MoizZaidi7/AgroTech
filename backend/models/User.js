import mongoose from "mongoose";

// Define allowed email domains
const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'agrotech.com']; 

// Define user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(email) {
        const domain = email.split('@')[1]; // Extract domain
        return allowedDomains.includes(domain); // Check if domain is in allowed list
      },
      message: (props) => `${props.value} is not a valid email domain!`
    }
  },
  password: { type: String, required: true, select: false },
  userType: { 
    type: String, 
    enum: ['Admin', 'Farmer', 'Customer', 'Seller'], 
    required: true 
  },
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String, default: null },
  phoneNumber: { type: String, required: false },
  isActive: { type: Boolean, default: true },
  isLoggedIn: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpire: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to enforce one admin rule
userSchema.pre('save', async function(next) {
  if (this.userType === 'Admin') {
    const existingAdminCount = await mongoose.model('User').countDocuments({ userType: 'Admin' });

    if (existingAdminCount > 0) {
      const error = new Error('Only one Admin user is allowed!');
      next(error); // Stop saving the user if an admin already exists
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
