import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  userType: { type: String, enum: ['Admin', 'Farmer', 'Customer', 'Seller'], required: true },
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },
  phoneNumber: { type: String, required: false }, // New field for phone number
  isActive: { type: Boolean, default: true },
  isLoggedIn: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpire: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

export default User;
