import mongoose from "mongoose"

export default mongoose.model("Video", new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  tenantId: String,
  filename: String,
  status: String,
  sensitivity: String
}, { timestamps: true }))
