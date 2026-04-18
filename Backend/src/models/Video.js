import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    game: { type: String, required: true },

    videoUrl: { type: String, required: true },
    thumbnail: { type: String, required: true },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    commentsCount: { type: Number, default: 0 },

    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);
