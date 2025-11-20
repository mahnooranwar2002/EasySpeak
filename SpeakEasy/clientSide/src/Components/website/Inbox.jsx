import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiMoreVertical } from "react-icons/fi";
import { FaCamera, FaVideo, FaPaperclip } from "react-icons/fa";


function Inbox() {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role"); // ✅ seeker or listener
  const [sessions, setSessions] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, [userId, role]);

  const fetchSessions = async () => {
    try {
      const url =
        role === "listener"
          ? `http://localhost:5000/sessions/listener/${userId}`
          : `http://localhost:5000/sessions/seeker/${userId}`;

      const res = await axios.get(url);
      setSessions(res.data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  // Utility to truncate file names (max 20 chars by default)
const truncateFileName = (name, maxLength = 20) => {
  if (!name) return "";
  return name.length > maxLength
    ? name.substring(0, maxLength - 3) + "..."
    : name;
};


  const handleDelete = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/chat/session/${sessionId}/${userId}`
      );
      await fetchSessions();
      setOpenMenuId(null);
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const handleBlock = async (sessionId, block) => {
    try {
      await axios.patch(
        `http://localhost:5000/chat/session/${sessionId}/block`,
        {
          isBlocked: block,
          blockedBy: userId,
        }
      );

      await fetchSessions();
      setOpenMenuId(null);
    } catch (err) {
      console.error("Error updating block status:", err);
    }
  };

  // ✅ Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>{role === "listener" ? "Inbox" : "My Chats"}</h2>

      {role === "seeker" && (
        <button
          onClick={() => navigate("/gemini")}
          style={{
            marginBottom: "15px",
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
           Chat With Gemini
        </button>
      )}

      {sessions.length === 0 ? (
        <p>No chats yet.</p>
      ) : (
        <ul>
          {sessions.map((session) => {
            // ✅ Partner user identify based on role
            const partner =
              role === "listener" ? session.seeker_id : session.listener_id;

            return (
              <li
                key={session._id}
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  margin: "5px 0",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {/* Chat Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    onClick={() => {
                      if (session.isBlocked && session.blockedBy === userId) {
                        alert("🚫 This chat is blocked. You cannot send messages.");
                      } else {
                        axios.patch(
                          `http://localhost:5000/chat/${session._id}/read/${userId}`
                        );
                        navigate(`/chat/${session._id}`);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <strong>{partner.nickname || partner.fullname}</strong>
                    <br />
          <span style={{ color: "#555", display: "flex", alignItems: "center", gap: "5px" }}>
  {session.isBlocked && session.blockedBy === userId ? (
    "🚫 This chat is blocked"
  ) : session.lastMessage ? (
    session.lastMessage.text ? (
      session.lastMessage.text
    ) : session.lastMessage.media ? (
      <>
        {session.lastMessage.media.type === "image" && (
          <>
            <FaCamera /> <span>Photo</span>
          </>
        )}
        {session.lastMessage.media.type === "video" && (
          <>
            <FaVideo /> <span>Video</span>
          </>
        )}
        {session.lastMessage.media.type === "file" && (
          <>
           <FaPaperclip /> <span>{truncateFileName(session.lastMessage.media.name)}</span>

          </>
        )}
      </>
    ) : (
      "No messages yet"
    )
  ) : (
    "No messages yet"
  )}
</span>


                  </div>

                  {/* Unread Badge */}
                  {session.unreadCount > 0 && (
                    <span
                      style={{
                        background: "red",
                        color: "white",
                        borderRadius: "50%",
                        padding: "4px 8px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {session.unreadCount}
                    </span>
                  )}
                </div>

                {/* Right Side: Time + Menu */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    position: "relative",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    {session.lastMessageTime
                      ? new Date(session.lastMessageTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>

                  <FiMoreVertical
                    onClick={() =>
                      setOpenMenuId(openMenuId === session._id ? null : session._id)
                    }
                    style={{
                      marginTop: "5px",
                      fontSize: "20px",
                      cursor: "pointer",
                    }}
                  />

                  {openMenuId === session._id && (
                    <div
                      ref={menuRef}
                      style={{
                        position: "absolute",
                        top: "30px",
                        right: "0",
                        background: "white",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                        zIndex: 100,
                      }}
                    >
                      <button
                        onClick={() => handleBlock(session._id, !session.isBlocked)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "10px 15px",
                          cursor: "pointer",
                          width: "100%",
                          textAlign: "left",
                        }}
                      >
                        {session.isBlocked ? "Unblock" : "Block"}
                      </button>

                      <button
                        onClick={() => handleDelete(session._id)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "10px 15px",
                          cursor: "pointer",
                          color: "red",
                          width: "100%",
                          textAlign: "left",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Inbox;
