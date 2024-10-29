import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDsB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;