import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['Admin', 'Farmer', 'Customer', 'Seller'], required: true },
  googleId: { type: String, unique: true, sparse: true  }, 
  profilePicture: { type: String },
  isActive: { type: Boolean, default: true },  
  isLoggedIn: { type : Boolean , default: false},
  verificationToken: { type: String }, 
  verificationTokenExpire: { type: Date }, 
});


const User = mongoose.model('User', userSchema);

export default User;