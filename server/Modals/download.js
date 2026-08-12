import mongoose from "mongoose";

const downloadSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },

    downloadedAt: {
      type: Date,
      default: Date.now,
    },

    planAtDownload:{
    type:String,
    enum:[
        "free",
        "bronze",
        "silver",
        "gold"
    ],
    required:true
},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Download", downloadSchema);