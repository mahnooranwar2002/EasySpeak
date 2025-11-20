// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
  },
  email: {
    type: String,
    // ensures no duplicate emails
  },
  password: {
    type: String,
  },
  profile_image: {
    type: String, // can store URL or file path
  },
  role: {
    type: String,
  },
category:String,
about:String,

  status: { type: Number, default: 1 },
  verifyOpt: { type: String, default: "" },
  verifyOptExpireAt: { type: String, default: "" },
  isverify: { type: Boolean, default: false },
  joined_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
