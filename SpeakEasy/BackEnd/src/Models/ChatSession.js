const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  rating: Number,
  comment: String
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  seeker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  listener_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: "active" }, // ✅ important
  started_at: { type: Date, default: Date.now },
  ended_at: { type: Date },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  isMuted: { type: Boolean, default: false },   // ✅ new
blockedAt: { type: Date },
blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
isBlocked: { type: Boolean, default: false },
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);
