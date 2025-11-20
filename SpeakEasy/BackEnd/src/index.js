var express = require("express");
var app = express();
var bodyparser = require("body-parser");
app.use(bodyparser.json());
var cors = require("cors");
app.use(cors());
require("./Models/Connection");
const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
var faq = require("./Models/Faq");
require("dotenv").config();
const { feedbackcontroller } = require("./feedbackController");
var websiteName = "SpeakEasy";
const User = require("./Models/User");
const ChatSession = require("./Models/ChatSession");
const Message = require("./Models/Message");
const bcrypt = require("bcrypt");
var multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
var categories = require("./Models/Category");
var appointment = require("./Models/Appointment");
var ContactUs= require("./Models/Contact")
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // or 'STARTTLS'
  auth: {
    user: "966313001@smtp-brevo.com",
    pass: "pM3zJ4CfYkmWxUT8",
  },
});
const cookieParser = require("cookie-parser");
var allowedOrigin = ["http://localhost:5173"];
app.use(
  cors({
    origin: allowedOrigin,
    credentials: false,
  })
);
app.use(cookieParser());
// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Go from BackEnd/src → clientSide/public/profile_url
    const imagePath = path.join(
      __dirname,
      "../../clientSide/public/profile_url"
    );
    cb(null, imagePath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // unique safe filename
  },
});
const chats = require("./Models/chats");
const upload = multer({ storage });

/* ---------------- SERVER + SOCKET.IO ---------------- */
const http = require("http");
const server = http.createServer(app); // ✅ Express ko HTTP server me wrap karo

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React app
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (sessionId) => {
    socket.join(sessionId);
    console.log(`User joined room: ${sessionId}`);
  });

  socket.on("sendMessage", (msg) => {
    io.to(msg.sessionId).emit("receiveMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ---------------- AUTH ---------------- */

// ✅ Register API with file upload + role
app.post("/register", upload.single("profile_image"), async (req, res) => {
  try {
    const { fullname, email, password, role, about, category } = req.body;

    if (!fullname || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    let profile_image = null;
    if (req.file) {
      profile_image = req.file.filename;
    }
    var emailExisting = await User.findOne({ email });
    if (emailExisting) {
      return res.json({
        success: false,
        massege: "email is already register !",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // var verifyOptExpireAt = Date.now() + 24 * 60 * 60 + 10000;
    const OTP_EXPIRATION_TIME = 24 * 60 * 60 * 1000 + 10000; // 1 day and 10 seconds
    var verifyOptExpireAt = Date.now() + OTP_EXPIRATION_TIME;
    var Otp = String(Math.floor(100000 + Math.random() * 900000));

    const newUser = new User({
      fullname,
      email,
      verifyOpt: Otp,
      password: hashedPassword,
      verifyOptExpireAt: verifyOptExpireAt,
      profile_image,
      role,
      about,
      category,
    });
    var mailOptions = {
      from: "mahnnooranwar191@gmail.com",
      to: email,
      subject: `welcome to ${websiteName}`,
      text: `weclome to ${websiteName}. your account is created With email id :${email} and please verify the account with this  OPT  ${Otp} `,
    };
    await transporter.sendMail(mailOptions);
    await newUser.save();

    return res.json({
      success: true,
      massege: "User registered successfully !",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// for verify the account
app.post("/verify_Account", async (req, res) => {
  const { verifyOpt, email } = req.body;

  if (!verifyOpt || !email) {
    return res.json({ success: false, message: "OTP and email are required" });
  }

  try {
    // Check user across all collections
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.json({ success: false, message: "User not found" });
    }

    if (findUser.verifyOpt !== verifyOpt) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (findUser.verifyOptExpireAt < Date.now()) {
      return res.json({ success: false, message: "Expired OTP" });
    }

    // Activate account
    findUser.isverify = true;
    findUser.verifyOpt = "";
    findUser.verifyOptExpireAt = "";
    await findUser.save();

    return res.json({
      success: true,
      message: "Account activated successfully!",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

// Login

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    const findEmail = await User.findOne({ email });

    if (!findEmail) {
      return res.json({
        success: false,
        message: "Email is invalid",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, findEmail.password);

    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: "Password is invalid",
      });
    }

    const isVerified = findEmail.isverify;

    if (!isVerified) {
      return res.json({
        success: false,
        message: "Sorry, your account is not verified",
      });
    }
    const Active = findEmail.status == 1;

    if (!Active) {
      return res.json({
        success: false,
        message: "Your account is deactivate by Admin",
      });
    }
    const userToken = jwt.sign(
      { id: findEmail._id, role: findEmail.role },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "2d",
      }
    );

    res.cookie("token", userToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Logged in successfully",
      token: userToken,
      role: findEmail.role,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});
app.put("/forgetPassword", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.json({
        success: false,
        message: "The email is not registered yet !",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    userData.hash_password = hashedPassword;
    await userData.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});
// Get user profile
app.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // password hide
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update profile
app.put("/profile/:id", upload.single("profile_image"), async (req, res) => {
  try {
    const { fullname, email, role } = req.body;
    let updateData = { fullname, email, role };

    if (req.file) {
      updateData.profile_image = req.file.filename; // ✅ correct field
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- USERS ---------------- */

app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// ✅ Get all listeners

/* ---------------- CHAT (Session-based only) ---------------- */
// ✅ absolute path to public/uploads (so multer always finds it)
const uploadPath = path.join(__dirname, "../../clientSide/public/uploads");

// Storage setup
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // save inside clientSide/public/uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const mediaUpload = multer({ storage: mediaStorage });

// ✅ Serve uploads statically
app.use("/uploads", express.static(uploadPath));

// Create new message with media

// app.post(
//   "/chat/message",
//   mediaUpload.array("media", 5),
//   async (req, res) => {
//     try {
//       const { sessionId } = req.params;
//       const { sender_id, text,listener_id,seeker_id } = req.body;

//       // const session = await ChatSession.findById(sessionId);
//       // if (!session) return res.status(404).json({ error: "Session not found" });

//       // // ✅ AUTO-REVIVE session for both seeker and listener
//       // session.deletedBy = session.deletedBy.filter(
//       //   (id) => !id.equals(session.seeker_id) && !id.equals(session.listener_id)
//       // );
//       // await session.save();

//       const mediaFiles = req.files.map((file) => ({
//         url: `/uploads/${file.filename}`,
//         type: file.mimetype.startsWith("image")
//           ? "image"
//           : file.mimetype.startsWith("video")
//           ? "video"
//           : "file",
//         name: file.originalname,
//         size: file.size,
//       }));

//       const messageData = {
//         session_id:12344,
//         seeker_id:seeker_id,
//         listener_id:listener_id,
//         sender_id,
//         text: text || null,
//         media: mediaFiles,
//         sent_at: new Date(),
//         readBy: [sender_id],
//       };

//       const message = await Message.create(messageData);
//       await message.populate("sender_id", "fullname nickname");

//       // io.to(sessionId).emit("receiveMessage", message);

//       res.json(message);
//     } catch (err) {
//       console.error("❌ Error creating message:", err);
//       res.status(500).json({ error: "Failed to create message" });
//     }
//   }
// );
app.post("/Ichat", mediaUpload.array("media", 5), (req, res) => {
  // 1. Process the uploaded files
  const mediaFiles = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    type: file.mimetype.startsWith("image")
      ? "image"
      : file.mimetype.startsWith("video")
      ? "video"
      : "file", // Could be 'document' or more specific
    name: file.originalname,
    size: file.size,
  }));

  // 2. Prepare the complete chat object to be saved
  const chatData = {
    ...req.body, // Include text content, sender ID, etc., from the form fields
    media: mediaFiles, // Add the processed media file data
  };

  // 3. Save the complete data to the database
  chats
    .create(chatData)
    .then((r) => {
      // Send back a more descriptive success response if needed
      res.status(200).send("Message and media saved successfully.");
    })
    .catch((error) => {
      // It's good practice to handle errors
      console.error("Error saving chat:", error);
      res.status(500).send("Error saving message and media.");
    });
});
app.delete("/chat/message/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await chats.findByIdAndDelete(id);
  } catch (err) {
    console.error("❌ Error deleting message:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/chats/:seeker_id/:listener_id", async (req, res) => {
  try {
    // Extract the seeker_id and sender_id from the URL parameters.
    const { seeker_id, listener_id } = req.params;

    // Use a robust query to find chats between the two users, regardless of
    // who initiated the conversation. The $or operator checks for both
    // possible combinations of sender and receiver IDs.
    const chatMessages = await chats.find({
      $or: [
        { seeker_id: seeker_id, listener_id: listener_id },
        { seeker_id: seeker_id, listener_id: listener_id },
      ],
    });

    // Send the found chat messages back as a JSON response.
    // If no messages are found, an empty array will be returned.
    res.json(chatMessages);
  } catch (error) {
    // If an error occurs during the database query, log it and
    // send a 500 status code with an error message to the client.
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ error: "Failed to retrieve chat messages." });
  }
});
// Mark messages as read
app.patch("/chat/:sessionId/read/:userId", async (req, res) => {
  try {
    const { sessionId, userId } = req.params;

    await Message.updateMany(
      {
        session_id: sessionId,
        readBy: { $ne: userId }, // not already read
        deletedBy: { $ne: userId },
      },
      { $push: { readBy: userId } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error marking as read:", err);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

/* ---------------- INBOX ---------------- */

// ✅ Get all chat sessions for a listener (exclude deleted ones)
app.get("/sessions/listener/:listenerId", async (req, res) => {
  try {
    const listenerId = new mongoose.Types.ObjectId(req.params.listenerId);

    const sessions = await ChatSession.find({
      listener_id: listenerId,
      deletedBy: { $ne: listenerId },
    }).populate("seeker_id", "fullname nickname profile_image");

    const sessionsWithLastMsg = await Promise.all(
      sessions.map(async (session) => {
        const lastMsg = await Message.findOne({
          session_id: session._id,
          deletedBy: { $ne: listenerId },
        }).sort({ sent_at: -1 });

        // ✅ Count unread (from seeker → listener)
        const unreadCount = await Message.countDocuments({
          session_id: session._id,
          sender_id: session.seeker_id,
          deletedBy: { $ne: listenerId },
          readBy: { $ne: listenerId },
        });

        return {
          ...session.toObject(),
          lastMessage: lastMsg
            ? {
                text: lastMsg.text || null,
                media:
                  lastMsg.media?.length > 0
                    ? {
                        type: lastMsg.media[0].type, // "image" | "video" | "file"
                        name: lastMsg.media[0].name,
                      }
                    : null,
              }
            : null,

          lastMessageTime: lastMsg ? lastMsg.sent_at : null,
          unreadCount,
        };
      })
    );

    res.json(sessionsWithLastMsg);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ✅ Get all chat sessions for a seeker (exclude deleted ones)
app.get("/sessions/seeker/:seekerId", async (req, res) => {
  try {
    const seekerId = new mongoose.Types.ObjectId(req.params.seekerId);

    const sessions = await ChatSession.find({
      seeker_id: seekerId,
      deletedBy: { $ne: seekerId },
    }).populate("listener_id", "fullname nickname profile_image");

    const sessionsWithLastMsg = await Promise.all(
      sessions.map(async (session) => {
        const lastMsg = await Message.findOne({
          session_id: session._id,
          deletedBy: { $ne: seekerId }, // 👈 only visible msgs
        }).sort({ sent_at: -1 });

        // ✅ Count unread messages (from listener → seeker)
        const unreadCount = await Message.countDocuments({
          session_id: session._id,
          sender_id: session.listener_id, // only msgs sent by listener
          deletedBy: { $ne: seekerId },
          readBy: { $ne: seekerId }, // not read yet
        });

        return {
          ...session.toObject(),
          lastMessage: lastMsg
            ? {
                text: lastMsg.text || null,
                media:
                  lastMsg.media?.length > 0
                    ? {
                        type: lastMsg.media[0].type, // "image" | "video" | "file"
                        name: lastMsg.media[0].name,
                      }
                    : null,
              }
            : null,

          lastMessageTime: lastMsg ? lastMsg.sent_at : null,
          unreadCount,
        };
      })
    );

    res.json(sessionsWithLastMsg);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ✅ Create or revive a chat session between seeker + listener

// app.post("/chat/session", async (req, res) => {
//   const { seeker_id, listener_id } = req.body;

//   try {
//     // 1) Check if session exists (ignore deletedBy filter)
//     let session = await ChatSession.findOne({ seeker_id, listener_id });

//     if (session) {
//       // 2) Agar session hai lekin user ne delete kar rakha hai → revive karo
//       const seekerObj = new mongoose.Types.ObjectId(seeker_id);
//       const listenerObj = new mongoose.Types.ObjectId(listener_id);

//       session.deletedBy = session.deletedBy.filter(
//         (id) => !id.equals(seekerObj) && !id.equals(listenerObj)
//       );

//       await session.save();
//     } else {
//       // 3) Bilkul naya session create karo (agar pehle kabhi bana hi nahi tha)
//       session = new ChatSession({ seeker_id, listener_id });
//       await session.save();
//     }

//     res.json(session);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to create session" });
//   }
// });

// Get session details
app.get("/chat/:sessionId", async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId).populate(
      "seeker_id listener_id",
      "fullname nickname profile_image"
    );

    if (!session) return res.status(404).json({ error: "Session not found" });

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Soft-delete (hide) message for a user
app.delete("/chat/message/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const msg = await chats.findById(messageId);
  } catch (err) {
    console.error("❌ Error deleting message:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get all messages in a session (hide only for current user)
// ✅ Get all messages in a session (respect block + hide deleted)
app.get("/chat/:sessionId/messages/:userId", async (req, res) => {
  try {
    const { sessionId, userId } = req.params;
    const userObjId = new mongoose.Types.ObjectId(userId);

    const session = await ChatSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    // show all messages for the session except those hidden for this user
    const query = {
      session_id: sessionId,
      $nor: [{ deletedBy: userObjId }],
    };

    const msgs = await Message.find(query)
      .populate("sender_id", "fullname nickname")
      .sort({ sent_at: 1 });

    res.json(msgs);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ Soft delete session for a user (hide from their inbox only)
app.delete("/chat/session/:sessionId/:userId", async (req, res) => {
  try {
    const { sessionId, userId } = req.params;
    const userObjId = new mongoose.Types.ObjectId(userId);

    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    // 1) Mark session hidden for user
    if (!session.deletedBy.some((id) => id.equals(userObjId))) {
      session.deletedBy.push(userObjId);
      await session.save();
    }

    // 2) Mark ALL messages in this session hidden for user
    await Message.updateMany(
      { session_id: sessionId, deletedBy: { $ne: userObjId } },
      { $push: { deletedBy: userObjId } }
    );

    res.json({ message: "Chat hidden for user only", _id: sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete chat session" });
  }
});
// Get messages of a session
app.get("/chat/:sessionId/messages", async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    let query = { session_id: req.params.sessionId };

    // ✅ Only show messages BEFORE block time
    if (session.blockedAt) {
      query.sent_at = { $lt: session.blockedAt };
    }

    const messages = await Message.find(query).sort({ sent_at: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ Logout API
app.post("/logout", (req, res) => {
  try {
    // Agar aap tokens use karte to yahan blacklist karte
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Block / Unblock session
// PATCH /chat/session/:id/block
app.patch("/chat/session/:id/block", async (req, res) => {
  const { id } = req.params;
  const { isBlocked, blockedBy } = req.body; // frontend should send blockedBy when blocking (current user id)

  try {
    // fetch BEFORE update so we have previous blockedAt info
    const sessionBefore = await ChatSession.findById(id);
    if (!sessionBefore && !isBlocked) {
      // if there's no session and user is trying to unblock, nothing to do
    }

    const update = {};
    if (isBlocked) {
      update.isBlocked = true;
      update.blockedAt = new Date();
      if (blockedBy) update.blockedBy = blockedBy;
    } else {
      // unblocking: keep blockedAt and blockedBy for history, only set isBlocked = false
      update.isBlocked = false;
    }

    const session = await ChatSession.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!session) return res.status(404).json({ error: "Session not found" });

    // If we are *unblocking*, retroactively hide messages that were sent during the blocked window
    if (
      !isBlocked &&
      sessionBefore &&
      sessionBefore.blockedAt &&
      sessionBefore.blockedBy
    ) {
      const blockerObjId = new mongoose.Types.ObjectId(sessionBefore.blockedBy);
      const blockTime = sessionBefore.blockedAt;

      // mark messages sent during the block by the *other* user as deleted for the blocker
      await Message.updateMany(
        {
          session_id: id,
          sender_id: { $ne: blockerObjId },
          sent_at: { $gte: blockTime },
          deletedBy: { $ne: blockerObjId },
        },
        { $addToSet: { deletedBy: blockerObjId } }
      );

      // find those message ids so we can emit delete events to clients in the room
      const affected = await Message.find(
        {
          session_id: id,
          sender_id: { $ne: blockerObjId },
          sent_at: { $gte: blockTime },
        },
        { _id: 1 }
      );

      affected.forEach((m) => {
        io.to(id).emit("deleteMessageForUser", {
          _id: m._id,
          userId: blockerObjId.toString(),
        });
      });
    }

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update block status" });
  }
});

app.get("/lister_data/:id", (req, res) => {
  User.findById(req.params.id).then((resp) => {
    res.send(resp);
  });
});
// app.put("/update-Password/:id", async (req, res) => {
//   var find_id = await User.findById(req.params.id);
//   const hashedPassword = await bcrypt.hash(req.body.password, 10);
//   find_id.password = hashedPassword;
//   find_id.save();
//   res.send("password updated!");
// });
app.put("/update-Password/:id", async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).send("New password is required.");
  }

  try {
    // 1. Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Find the user and update the password field in one go
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true, runValidators: true } // {new: true} returns the updated document
    );

    // Handle case where user is not found
    if (!updatedUser) {
      return res.status(404).send("User not found.");
    }

    res.status(200).send(`${hashedPassword}`);
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).send("Internal Server Error: Could not update password.");
  }
});
//Gemini Route
app.post("/api/feedback", feedbackcontroller);

// faq

app.post("/add_faq", async (req, res) => {
  faq.create(req.body).then(() => {
    res.send("faq created");
  });
});
app.get("/faq_fetch", (req, res) => {
  faq.find().then((resp) => {
    res.send(resp);
  });
});
app.get("/faq_find/:id", (req, res) => {
  faq.findById(req.params.id).then((resp) => {
    res.send(resp);
  });
});
app.put("/faq_edit/:id", (req, res) => {
  faq.findByIdAndUpdate(req.params.id, req.body).then((resp) => {
    res.send("the faq is updated now");
  });
});
app.delete("/faq_del/:id", (req, res) => {
  faq.findByIdAndDelete(req.params.id).then((resp) => {
    res.send("the faq is deleted now");
  });
});
app.get("/faq_search/search", async (req, res) => {
  var query = req.query.q || "";
  var items = await faq.find({
    subject: { $regex: query, $options: "i" },
  });
  res.send(items);
});

// Category
app.post("/add_category", async (req, res) => {
  var { name, status } = req.body;
  try {
    var nameExisitng = await categories.findOne({ name });
    if (nameExisitng) {
      return res.json({
        success: false,
        massege: "category name  is already existing !",
      });
    }
    await categories.create(req.body);
    return res.json({
      success: true,
      massege: "Category is added successfully !",
    });
  } catch (error) {
    return res.json({ success: false, massege: error.message });
  }
});

app.get("/fetchCategory", (req, res) => {
  categories.find().then((resp) => {
    res.send(resp);
  });
});
app.put("/statusCate/:id", async (req, res) => {
  var find_id = await categories.findById(req.params.id);
  find_id.status = find_id.status == 1 ? 0 : 1;
  find_id.save();
  res.send("updated !");
});

app.delete("/category_del/:id", (req, res) => {
  categories.findByIdAndDelete(req.params.id).then((ress) => {
    res.send("product is deleted !");
  });
});
app.get("/search_Cate/search", async (req, res) => {
  var query = req.query.q || "";
  var items = await categories.find({
    name: { $regex: query, $options: "i" },
  });
  res.send(items);
});
app.get("/find_Cate/:id", (req, res) => {
  categories.findById(req.params.id).then((resp) => {
    res.send(resp);
  });
});

app.put("/update_Cate/:id", (req, res) => {
  categories.findByIdAndUpdate(req.params.id, req.body).then((resp) => {
    res.send("updated !");
  });
});
app.get("/Categorywise/:category", (req, res) => {
  User.find({
    category: req.params.category,
    role: "listener",
    isverify: true,
    status: 1,
  }).then((resp) => {
    res.send(resp);
  });
});
app.get("/active_Category", (req, res) => {
  categories.find({ status: 1 }).then((resp) => {
    res.send(resp);
  });
});
app.get("/listeners", async (req, res) => {
  try {
    const listeners = await User.find({
      role: "listener",
      isverify: true,
      status: 1,
    });
    res.json(listeners);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/admin-listeners", async (req, res) => {
  try {
    const listeners = await User.find({ role: "listener" });
    res.json(listeners);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
app.put("/status-user/:id", async (req, res) => {
  var find_id = await User.findById(req.params.id);
  find_id.status = find_id.status == 1 ? 0 : 1;
  find_id.save();
  res.send("updated !");
});
app.delete("/user_del/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id).then((ress) => {
    res.send("product is deleted !");
  });
});
app.get("/search_listener/search", async (req, res) => {
  var query = req.query.q || "";
  var items = await User.find({
    role: "listener",
    fullname: { $regex: query, $options: "i" },
  });
  res.send(items);
});
app.get("/admin-seekers", async (req, res) => {
  try {
    const seeker = await User.find({ role: "seeker" });
    res.json(seeker);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
app.get("/search_seeker/search", async (req, res) => {
  var query = req.query.q || "";
  var items = await User.find({
    role: "seeker",
    fullname: { $regex: query, $options: "i" },
  });
  res.send(items);
});

app.post("/add_appointment", async (req, res) => {
  try {
    var {
      user_id,
      Listner_id,
      user_name,
      Listner_name,
      email,
      reason,
      date,

      appointment_time,
    } = req.body;
    var Userdata = await User.findById( user_id );
    var ListnerData = await User.findById(Listner_id );

    const newAppointment = await appointment.create({
      user_id: Userdata._id,
      user_name: Userdata.fullname,
      email: Userdata.email,
      Listner_name: ListnerData.fullname,
      Listner_id: ListnerData._id,
      reason,
      appointment_time,
      status: "Scheduled",
      date,
    });

    return res.json({
      success: true,
      message: "Appointment booked successfully",
      data: newAppointment,
    });
  } catch (error) {
    console.error("Appointment Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get('/Get_appointment/:Listner_id', async (req, res) => {
    try {
        // 1. Extract the ID from the URL parameters
        const listnerId = req.params.Listner_id;

        // 2. CRITICAL FIX: Use the correct Mongoose query syntax
        // Search the 'appointment' collection where the 'Listner_id' field matches the extracted ID.
        const appointments = await appointment.find({ Listner_id: listnerId });

        // 3. Optional: Check if any appointments were found
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No appointments found for this listener." 
            });
        }

        // 4. Send the successful response
        return res.json({
            success: true,
            data: appointments
        });

    } catch (error) {
        // 5. Catch and handle any server or database errors
        console.error("Error fetching listener appointments:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error while retrieving appointments." 
        });
    }
});
app.put("/appointment_Status/:id", async (req, res) => {
  try {
    const updatedTrip = await appointment.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
    });

 return   res.send('the status is updated now');
  } catch (error) {
    console.error("Error updating trip status:", error);
    res.status(500).send({ message: "Error updating trip status" });
  }
});
app.get("/search_appo/:Listner_id/search", async (req, res) => {
  var query = req.query.q || "";
  var items = await User.find({
    Listner_id: req.params.Listner_id,
    user_name: { $regex: query, $options: "i" },
  });
  res.send(items);
});

app.delete("/appointment_del/:id", (req, res) => {
  appointment.findByIdAndDelete(req.params.id).then((ress) => {
    res.send("product is deleted !");
  });
});



// listener Inbox
app.get("/sessionsINbox/listener/:listener_id", async (req, res) => {
  try {
    const listenerId = req.params.listener_id;

    const chatss = await chats.find({
      listener_id: listenerId,
      deletedBy: { $ne: listenerId },
    }).populate("seeker_id", "fullname nickname profile_image");



    res.json(chatss);
  
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
app.get("/getSeeker/:listener_id", async (req, res) => {
  try {
    const listenerId = req.params.listener_id;

    // Pehle chats mein listener ke sessions find karein
    const sessions = await chats.find({ 
      listener_id: listenerId 
    });

    // Sabhi seeker IDs collect karein
    const seekerIds = sessions.map(session => session.seeker_id);

    // Fir un seekers ki details laein
    const userData = await User.find({ 
      _id: { $in: seekerIds } 
    }).select("fullname nickname profile_image email phone");

    res.json({
      success: true,
      data: userData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
app.get("/chats-listener/:listener_id/:seeker_id", async (req, res) => {
  try {
    const listenerId = req.params.listener_id;
 const userId = req.params.seeker_id;
    const chatss = await chats.find({
      listener_id: listenerId,
      seeker_id:userId,
      deletedBy: { $ne: listenerId },
    }).populate("seeker_id", "fullname nickname profile_image");



    res.json(chatss);
  
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
app.post("/addcontact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await ContactUs.create({
      name,
      email,
    
      message,
    });
    res.status(200).send("Contact message added successfully");
  } catch (err) {
    console.error(err);
    res.send("Error adding contact message");
  }
});

// Get all contact messages
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await ContactUs.find();
    res.send(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching contacts");
  }
});
app.delete("/delcon/:id", (req, res) => {
  ContactUs.findByIdAndDelete(req.params.id).then(() => {
    res.send("delete !");
  });
});
app.get("/search_contact/search", async (req, res) => {
  var query = req.query.q || "";
  var items = await ContactUs.find({
    email: { $regex: query, $options: "i" },
    name: { $regex: query, $options: "i" },
  });
  res.send(items);
});


app.get('/Get_appointment_user/:user_id', async (req, res) => {
    try {
        // 1. Extract the ID from the URL parameters
        const userId = req.params.user_id;

  
        const appointments = await appointment.find({ user_id: userId });

   
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No appointments found for this listener." 
            });
        }

    
        return res.json({
            success: true,
            data: appointments
        });

    } catch (error) {
  
        console.error("Error fetching listener appointments:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error while retrieving appointments." 
        });
    }
});
/* ---------------- START SERVER ---------------- */
server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
