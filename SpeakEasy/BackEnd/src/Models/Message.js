const mongoose = require("mongoose");

// Models/Message.js
const messageSchema = new mongoose.Schema(
  {
  
    seeker_id: { type:String, },
    listener_id:{ type:String, },
    sender_id: { type:String, },
    text: { type: String },
    media: [
      {
        url: String, // stored path/URL
        type: { type: String, enum: ["image", "video", "file"] }, // categorize media
        name: String, // original file name
        size: Number, // file size (optional)
      },
    ],
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sent_at: { type: Date, default: Date.now },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);




module.exports = mongoose.model("messages", messageSchema);
