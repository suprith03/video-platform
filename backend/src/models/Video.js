import mongoose from "mongoose"

const videoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tenantId: { type: String, required: true },

    filename: { type: String, required: true },

    status: {
      type: String,
      enum: ["uploaded", "processing", "completed", "failed"],
      default: "uploaded"
    },

    sensitivity: {
      type: String,
      enum: ["safe", "flagged"]
    },

    assignedUsers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ]
  },
  { timestamps: true }
)

export default mongoose.model("Video", videoSchema)
