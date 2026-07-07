import mongoose from "mongoose";

const watchPartySchema = new mongoose.Schema(
  {
    partyId: {
      type: String,
      required: true,
      unique: true,
    },

    hostId: {
      type: String,
      required: true,
    },

    videoId: {
      type: String,
      required: true,
    },

    participants: [
      {
        userId: String,
        username: String,
      },
    ],

    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("WatchParty", watchPartySchema);