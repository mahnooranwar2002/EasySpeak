import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaTimes } from "react-icons/fa";

const socket = io("http://localhost:5000"); // ✅ backend ka URL

function Chat() {

  const userId = localStorage.getItem("userId");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [partner, setPartner] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]); // ✅ media state

useEffect(() => {
  socket.emit("joinRoom", sessionId);



  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/chat/${sessionId}/messages/${userId}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };
  fetchMessages();

  // ✅ Always listen for new incoming messages
  socket.on("receiveMessage", (message) => {
    if (message.session_id.toString() === sessionId.toString()) {
      setMessages((prev) => [...prev, message]);
    }
  });

  // ✅ Socket delete listener
  socket.on("deleteMessageForUser", (payload) => {
    if (payload.userId.toString() === userId.toString()) {
      setMessages((prev) => prev.filter((m) => m._id !== payload._id));
    }
  });

  return () => {
    socket.off("receiveMessage");
    socket.off("deleteMessageForUser");
  };
}, [sessionId, userId]);


  // ✅ file input handler
 // ✅ file input handler
const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  setMediaFiles(files);
  setNewMessage(""); // 🔄 clear text when files are picked
};


  // ✅ send message (with text + media)
const handleSend = async () => {
  if (!newMessage.trim() && mediaFiles.length === 0) return;

  try {
    // 1️⃣ Only text
    if (newMessage.trim() && mediaFiles.length === 0) {
      const formData = new FormData();
      formData.append("sender_id", userId);
      formData.append("lister_id", userId);
      formData.append("text", newMessage);

      const res = await axios.post(
        `http://localhost:5000/chat/msg`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      socket.emit("sendMessage", { ...res.data, sessionId });
    }

    // 2️⃣ Only files (ignore text if files exist)
    if (mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const formData = new FormData();
        formData.append("sender_id", userId);
        formData.append("text", ""); // no text with files
        formData.append("media", file);

        const res = await axios.post(
          `http://localhost:5000/chat/msg`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        socket.emit("sendMessage", { ...res.data, sessionId });
      }
    }

    // 🔄 Refresh messages
    const refreshed = await axios.get(
      `http://localhost:5000/chat/${sessionId}/messages/${userId}`
    );
    setMessages(refreshed.data);

    // reset inputs
    setNewMessage("");
    setMediaFiles([]);
window.location.reload();
  } catch (err) {
    console.error("Error sending message:", err);
  }
};

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/chat/message/${id}/${userId}`);

      toast.success("Message Deleted Successfully");

      // refresh messages
      const res = await axios.get(
        `http://localhost:5000/chat/${sessionId}/messages/${userId}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Failed to delete message");
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        height: "90vh",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: "12px",
          backgroundColor: "#4CAF50",
          color: "white",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {partner?.profile_image ? (
          <img
            src={`/profile_url/${partner.profile_image}`}
            alt="profile"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#007bff",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {(partner?.nickname || partner?.fullname || "?")[0].toUpperCase()}
          </div>
        )}

        <h3 style={{ margin: 0 }}>
          {partner ? partner.nickname || partner.fullname : "Chat"}
        </h3>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: "12px",
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg) => {
          const senderId =
            msg.sender_id?._id?.toString?.() || msg.sender_id?.toString?.();
          const isSender = senderId === userId?.toString();

          const time = new Date(
            msg.sent_at || msg.createdAt
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={msg._id}
              style={{
                display: "flex",
                justifyContent: isSender ? "flex-end" : "flex-start",
                marginBottom: "8px",
              }}
            >
              <div
                onDoubleClick={() => {
                  const confirmDelete = window.confirm(
                    "Do you want to delete this message?"
                  );
                  if (confirmDelete) {
                    handleDelete(msg._id);
                  }
                }}
                style={{
                  maxWidth: "70%",
                  padding: "8px 12px",
                  borderRadius: "16px",
                  backgroundColor: isSender ? "#DCF8C6" : "#fff",
                  border: "1px solid #ddd",
                  boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }}
                title={"Double click to delete"}
              >
                {msg.text && (
                  <div style={{ fontSize: "15px" }}>{msg.text}</div>
                )}

                {/* ✅ render media */}
                {msg.media?.length > 0 && (
                  <div style={{ marginTop: "5px" }}>
                    {msg.media.map((file, idx) => {
                   if (file.type === "image") {
  return (
    <a
      key={idx}
      href={file.url}
      download={file.name || "image"}
      style={{ display: "inline-block", marginTop: "5px" }}
    >
      <img
        src={file.url}
        alt="media"
        style={{
          maxWidth: "200px",
          borderRadius: "8px",
        }}
      />
    </a>
  );
}

                      if (file.type === "video") {
                        return (
                          <video
                            key={idx}
                            controls
                            style={{
                              maxWidth: "250px",
                              borderRadius: "8px",
                              marginTop: "5px",
                            }}
                          >
                            <source src={file.url} type="video/mp4" />
                          </video>
                        );
                      }
                      return (
                        <a
                          key={idx}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "block",
                            color: "blue",
                            marginTop: "5px",
                          }}
                        >
                          📎 {file.name}
                        </a>
                      );
                    })}
                  </div>
                )}

                <div
                  style={{
                    fontSize: "12px",
                    textAlign: "right",
                    marginTop: "4px",
                    color: "#555",
                  }}
                >
                  {time}
                </div>
              </div>
            </div>
          );
        })}
      </div>

{/* Input */}
<div
  style={{
    display: "flex",
    flexDirection: "column", // stack previews on top of input
    borderTop: "1px solid #ccc",
    backgroundColor: "#fff",
    padding: "10px",
    gap: "8px",
  }}
>
  {/* ✅ File Previews */}
  {mediaFiles.length > 0 && (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "8px",
      }}
    >
      {mediaFiles.map((file, idx) => {
        const url = URL.createObjectURL(file);
        if (file.type.startsWith("image")) {
          return (
            <div
              key={idx}
              style={{
                position: "relative",
                display: "inline-block",
              }}
            >
              <img
                src={url}
                alt="preview"
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "6px",
                  objectFit: "cover",
                }}
              />
              <FaTimes
                onClick={() =>
                  setMediaFiles((prev) => prev.filter((_, i) => i !== idx))
                }
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "white",
                  borderRadius: "50%",
                  cursor: "pointer",
                  color: "red",
                  padding: "2px",
                }}
              />
            </div>
          );
        }
        if (file.type.startsWith("video")) {
          return (
            <div key={idx} style={{ position: "relative" }}>
              <video
                src={url}
                style={{
                  width: "80px",
                  height: "60px",
                  borderRadius: "6px",
                  objectFit: "cover",
                }}
              />
              <FaTimes
                onClick={() =>
                  setMediaFiles((prev) => prev.filter((_, i) => i !== idx))
                }
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "white",
                  borderRadius: "50%",
                  cursor: "pointer",
                  color: "red",
                  padding: "2px",
                }}
              />
            </div>
          );
        }
        return (
          <div
            key={idx}
            style={{
              padding: "6px 10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "#f5f5f5",
              fontSize: "12px",
              position: "relative",
            }}
          >
            📎 {file.name}
            <FaTimes
              onClick={() =>
                setMediaFiles((prev) => prev.filter((_, i) => i !== idx))
              }
              style={{
                marginLeft: "6px",
                cursor: "pointer",
                color: "red",
              }}
            />
          </div>
        );
      })}
    </div>
  )}

  {/* ✅ Hidden file input */}
  <input
    type="file"
    id="fileInput"
    multiple
    style={{ display: "none" }}
    onChange={handleFileChange}
  />

  {/* ✅ Input Row */}
  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
    <button
      onClick={() => document.getElementById("fileInput").click()}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "20px",
        color: "#4CAF50",
      }}
      title="Attach file"
    >
      <FaPlus />
    </button>

   <input
  value={newMessage}
  onChange={(e) => setNewMessage(e.target.value)}
  placeholder={
    mediaFiles.length > 0
      ? "Text disabled while sending files..."
      : "Type message..."
  }
  style={{
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    outline: "none",
    backgroundColor: mediaFiles.length > 0 ? "#f0f0f0" : "white",
    cursor: mediaFiles.length > 0 ? "not-allowed" : "text",
  }}
  disabled={mediaFiles.length > 0}
/>

    <button
      onClick={handleSend}
      style={{
        padding: "10px 16px",
        borderRadius: "20px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        cursor: "pointer",
      }}
    >
      Send
    </button>
  </div>
</div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}

export default Chat;
