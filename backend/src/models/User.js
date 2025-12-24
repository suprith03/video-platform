import mongoose from "mongoose"

export default mongoose.model("User", new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, enum: ["viewer", "editor", "admin"] },
  tenantId: String
}))
