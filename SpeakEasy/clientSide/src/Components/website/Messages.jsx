import axios from "axios";
import React, { useEffect, useState, useRef } from "react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaTimes, FaPaperPlane } from "react-icons/fa";
import { Link } from "react-router-dom";
import Nav from './Nav'
import Footer from './Footer'
// Backend URL

const Messages = () => {
  // --- User ID Logic (Assuming this is correct based on your JWT structure) ---
  const token = sessionStorage.getItem("userLogined") || "CURRENT_USER_ID";
  let userId = null;
  try {
    const tokenParts = token.split(".");
    const payload = JSON.parse(atob(tokenParts[1]));
    userId = payload.id; // Corrected user ID
  } catch (e) {
    console.error("JWT token parsing error:", e);
    // Fallback for development if token isn't set:
    userId = "65f3f33b1e7f6d3381a1a9e8"; // Use a dummy ID for testing if needed
  }
  const messagesEndRef = useRef(null);

  // --- STATE ---
  const [listeners, setListeners] = useState([]);
  const [selectedListener, setSelectedListener] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [partner, setPartner] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);

  // ----------------------------------------------------
  //  EFFECT 1: Fetch Listeners (runs once)
  // ----------------------------------------------------
  useEffect(() => {
    const fetchListeners = async () => {
      try {
        const res = await axios.get("http://localhost:5000/listeners");
        setListeners(res.data);
      } catch (err) {
        console.error("Error fetching listeners:", err);
      }
    };
    fetchListeners();
  }, []);

  // ----------------------------------------------------
  //  FUNCTION: Fetch Chat Data (Messages and Session Partner)
  // ----------------------------------------------------
  // const fetchChatData = async (sId) => {
  //     if (!sId) return;

  //     // 1. Join Socket Room
  //     socket.emit("joinRoom", sId);

  //     // 2. Fetch Messages
  //     try {
  //         const res = await axios.get(
  //             `http://localhost:5000/chat/${sId}/messages/${userId}`
  //         );
  //         setMessages(res.data);
  //     } catch (err) {
  //         console.error("Error fetching messages:", err);
  //     }
  // };

  // ----------------------------------------------------
  //  FUNCTION: Handles Listener Click (Session Setup)
  // ----------------------------------------------------
  const handleListenerClick = async (listener) => {
    setSelectedListener(listener);
    setMessages([]); // Clear previous messages
    setPartner(listener); // Set the partner

    // try {
    //     // ✅ FIX 2 & 3: Corrected API keys (seeker_id/listener_id) and session ID extraction (_id)
    //     const res = await axios.post("http://localhost:5000/chat/session", {
    //         seeker_id: userId, // Current user is the seeker
    //         listener_id: listener._id || listener.id, // Listener is the partner
    //     });

    //     // ✅ FIX: Use _id because your Mongoose model returns the MongoDB ID field
    //     const newSessionId = res.data._id;
    //     setSessionId(newSessionId);

    //     fetchChatData(newSessionId);
    // } catch (err) {
    //     console.error("Error finding/creating session:", err);
    //     toast.error("Failed to start chat session.");
    //     setSessionId(null);
    // }
  };

  // ----------------------------------------------------
  //  EFFECT 2 & 3: Socket and Scroll Logic
  // ----------------------------------------------------
  // useEffect(() => {
  //     if (!sessionId) return;

  //     socket.on("receiveMessage", (message) => {
  //         if (message.session_id.toString() === sessionId.toString()) {
  //             setMessages((prev) => [...prev, message]);
  //             // Scroll is handled by the separate useEffect below, but let's call it here too for speed
  //             scrollToBottom();
  //         }
  //     });

  //     socket.on("deleteMessageForUser", (payload) => {
  //         if (payload.userId.toString() === userId.toString()) {
  //             setMessages((prev) => prev.filter((m) => m._id !== payload._id));
  //         }
  //     });

  //     return () => {
  //         socket.off("receiveMessage");
  //         socket.off("deleteMessageForUser");
  //     };
  // }, [sessionId, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

  // ----------------------------------------------------
  //  FUNCTION: File Input Handler
  // ----------------------------------------------------
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files);
    setNewMessage(""); // Clear text when files are picked
  };

  // ----------------------------------------------------
  //  FUNCTION: Send Message (The main fix)
  // ----------------------------------------------------

 const handleSend = async (listener_id) => {
    // 1. Create a single FormData object to hold all data (text and files)
    const formData = new FormData();

    // Append the standard chat parameters
    formData.append("seeker_id", userId);
    formData.append("listener_id", listener_id);
    formData.append("sender_id", userId);
    
    // Append the text message (even if empty, it's part of the message)
    formData.append("text", newMessage);

    // 2. Append all selected media files
    // NOTE: 'media' must match the key used in your Multer setup (mediaUpload.array("media", 5))
    if (mediaFiles && mediaFiles.length > 0) {
        for (const file of mediaFiles) {
            formData.append("media", file);
        }
    }

    try {
        // 3. Send the single request with the combined formData object
        const response = await axios.post(
            "http://localhost:5000/Ichat",
            formData,
            {
                // Axios automatically sets the correct 'multipart/form-data' boundary 
                // when passing a FormData object, but we include it for clarity/safety.
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        // 4. Update UI/State ONLY after a successful request
        
        // Clear the text input
        setNewMessage(""); 
        setMediaFiles([])
        
     

    } catch (error) {
        // 5. Handle any errors from the request
        console.error("Error sending message:", error);
        // Alert the user or show a temporary error message
    }
};
  // ----------------------------------------------------
  //  FUNCTION: Delete Message
  // ----------------------------------------------------
  const handleDelete = async (id) => {
      try {
          await axios.delete(`http://localhost:5000/chat/message/${id}`);
          toast.success("Message Deleted Successfully");
          fetchMsg()
         
      } catch (err) {
          console.error("Error deleting message:", err);
          toast.error("Failed to delete message");
      }
  };

  // ----------------------------------------------------
  //  RENDER (UI) - Minor Fixes applied to Input
  // ----------------------------------------------------
var fetchMsg=()=>{
       axios
      .get(`http://localhost:5000/chats/${userId}/${partner?._id}`)
      .then((res) => {
        console.log(res.data);
        setMessages(res.data);
      });
}
  useEffect(() => {
  fetchMsg()
  });

  return (
    <>
    <Nav/>
    <div className="messages-container">
      <ToastContainer position="top-center" autoClose={2000} />

  
      <div className="msg-content">
        {/* 1. SIDEBAR */}
        <div className="sidebar"
        style={{backgroundColor:"#005f59"}}
        >
      
          <h3
            style={{
              margin: "0 0 10px 0",
              padding: "10px 0",
              color:"#ffffff",
         
              borderBottom: "1px solid #7f7472",
            }}
          >
            Listeners
          </h3>
          {listeners.length === 0 ? (
            <div className="error">
              <h4>"No listener available right now!"</h4>
            </div>
          ) : (

            <ul className="listener-list" id="mylist">
              {listeners.map((listener) => (
                <li
                  key={listener._id || listener.id}
                  className={
                    selectedListener?._id === (listener._id || listener.id)
                      ? "active"
                      : ""
                  }
                  onClick={() => handleListenerClick(listener)}
                >
                  <div className="img">
                    <img
                      src={`/profile_url/${listener.profile_image}`}
                      alt={listener.fullname}
                    />
                  </div>
                  <div className="contentbox">
                    <p>{listener.fullname}</p>
      
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 2. MESSAGE AREA */}
        <div className="message-area" style={chatAreaStyles.main}>
          {!selectedListener ? (
            <div style={chatAreaStyles.placeholder}>
              <h2>Select a listener to start chatting.</h2>
            </div>
          ) : (
            
            <>
              {/* --- Chat Header --- */}
              <div style={chatAreaStyles.header}>
                {partner?.profile_image ? (
                  <img
                    src={`/profile_url/${partner.profile_image}`}
                    alt="profile"
                    style={chatAreaStyles.profileImage}
                  />
                ) : (
                  <div style={chatAreaStyles.avatarPlaceholder}>
                    {(partner?.nickname ||
                      partner?.fullname ||
                      "?")[0].toUpperCase()}
                  </div>
                )}
                <h3 style={{ margin: 0 }}>
                  {partner ? partner.nickname || partner.fullname : "Chat"}
                </h3>
              </div>

              {/* --- Messages Window --- */}
              <div className="messageBOX" style={chatAreaStyles.messagesWindow}>
                {messages.length===0?(
                    <div className="error">
                     <h6>You haven't messaged {partner.fullname}  yet.</h6>
                    </div>
                ):(
                messages.map((msg) => {
                  const senderId =
                    msg.sender_id?._id?.toString?.() ||
                    msg.sender_id?.toString?.();
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
                                    style={{
                                      display: "inline-block",
                                      marginTop: "5px",
                                    }}
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
                })
                )}
                {/* Auto-scroll ref */}
                <div ref={messagesEndRef} />
              </div>

              {/* --- Input Area --- */}
              <div style={chatAreaStyles.inputArea}>
                {/* File Previews (Code is already correct) */}
                {mediaFiles.length > 0 && (
                  <div style={chatAreaStyles.filePreviews}>
                    {mediaFiles.map((file, idx) => {
                      const url = URL.createObjectURL(file);
                      const isImage = file.type.startsWith("image");
                      const isVideo = file.type.startsWith("video");

                      return (
                        <div key={idx} style={chatAreaStyles.previewItem}>
                          {isImage && (
                            <img
                              src={url}
                              alt="preview"
                              style={chatAreaStyles.previewImage}
                            />
                          )}
                          {isVideo && (
                            <video
                              src={url}
                              style={chatAreaStyles.previewVideo}
                            />
                          )}
                          {!isImage && !isVideo && (
                            <div style={chatAreaStyles.previewFile}>
                              📎 {file.name}
                            </div>
                          )}
                          <FaTimes
                            onClick={() =>
                              setMediaFiles((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            style={chatAreaStyles.previewRemove}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  type="file"
                  id="fileInput"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                {/* Input Row */}
                <div style={chatAreaStyles.inputRow}>
                  <button
                    onClick={() => document.getElementById("fileInput").click()}
                    style={chatAreaStyles.attachButton}
                    title="Attach file"
                  >
                    <FaPlus />
                  </button>

                  {/* UI FIX: Disabled prop hata diya taaki text type ho sake file ke saath bhi */}
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={"Type message..."}
                    name="text"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSend(partner._id)
                    }
                    style={{
                      ...chatAreaStyles.textInput,
                      // Conditional styling is fine, but removing `disabled` is key
                      backgroundColor: mediaFiles.length > 0 ? "#fff" : "white",
                      cursor: mediaFiles.length > 0 ? "text" : "text",
                    }}
                    // disabled={mediaFiles.length > 0} ❌ Ye line hata di gayi hai
                  />

                  <button
                    onClick={() => handleSend(partner._id)}
                    style={chatAreaStyles.sendButton}
                    disabled={!newMessage.trim() && mediaFiles.length === 0}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  <Footer/>
    </>
  );
};

export default Messages;
// ... (chatAreaStyles object remains the same)

// ----------------------------------------------------
//  STYLES (Used Inline for better self-containment)
//  NOTE: For cleaner code, these should be moved to a CSS/SCSS file.
// ----------------------------------------------------
const chatAreaStyles = {
  main: {
    display: "flex",
    flexDirection: "column",
    height: "100%", // Take full height of the message-area div
    borderLeft: "1px solid #ddd", // Separator from sidebar
  },
  placeholder: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#e0e0e0",
    backgroundColor: "#beb1afff",
  },
  header: {
    padding: "12px",
    backgroundColor: "#e0e0e0",
    borderBottom: "1px solid #ccc",
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  profileImage: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",

    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "16px",
  },
  messagesWindow: {
    flex: 1,
    padding: "12px",
    overflowY: "auto",
  },
  messageRow: {
    display: "flex",
    marginBottom: "8px",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: "8px 12px",
    borderRadius: "16px",
    border: "1px solid #ddd",
    boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  messageTime: {
    fontSize: "12px",
    textAlign: "right",
    marginTop: "4px",
    color: "#555",
  },
  fileLink: {
    display: "block",
    color: "blue",
    marginTop: "5px",
    fontSize: "14px",
    wordBreak: "break-all",
  },
  inputArea: {
    display: "flex",
    flexDirection: "column",
    borderTop: "1px solid #ccc",
    backgroundColor: "#fff",
    padding: "10px",
    gap: "8px",
    flexShrink: 0,
  },
  filePreviews: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  previewItem: {
    position: "relative",
    display: "inline-block",
  },
  previewImage: {
    width: "60px",
    height: "60px",
    borderRadius: "6px",
    objectFit: "cover",
  },
  previewVideo: {
    width: "80px",
    height: "60px",
    borderRadius: "6px",
    objectFit: "cover",
  },
  previewFile: {
    padding: "6px 10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#f5f5f5",
    fontSize: "12px",
  },
  previewRemove: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    background: "white",
    borderRadius: "50%",
    cursor: "pointer",
    color: "red",
    padding: "2px",
    fontSize: "12px",
    boxShadow: "0 0 2px rgba(0,0,0,0.5)",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  attachButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "20px",
    color: "#4CAF50",
  },
  textInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    outline: "none",
  },
  sendButton: {
    padding: "10px 16px",
    borderRadius: "20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

// ----------------------------------------------------
//  GLOBAL CONTAINER STYLES (from previous response)
//  Add this to your CSS file (or keep as inline styles on the main divs)
// ----------------------------------------------------
