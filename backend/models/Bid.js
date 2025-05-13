import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  isWinning: { type: Boolean, default: false }
});

const Bid = mongoose.model("Bid" , bidSchema);
export default Bid;