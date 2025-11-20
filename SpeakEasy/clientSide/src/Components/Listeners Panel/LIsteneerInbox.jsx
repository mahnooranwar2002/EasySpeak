import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiMoreVertical, FiMessageSquare, FiPhone, FiMail, FiX, FiSend } from "react-icons/fi";
import { FaUserCircle, FaCamera, FaPaperclip, FaSmile } from "react-icons/fa";
import ListnerLayout from "./ListnerLayout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListenerInbox = () => {
  const token = sessionStorage.getItem("listenerLogined");
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [selectedSeekerId, setSelectedSeekerId] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const menuRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Ensure token is present before attempting to split/parse
  if (!token) {
    console.error("No listener token found.");
    return <div>Access Denied. Please log in as a listener.</div>;
  }

  const tokenParts = token.split(".");
  const payload = JSON.parse(atob(tokenParts[1]));
  const userId = payload.id;

  useEffect(() => {
    fetchSeekers();
  }, [userId]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSeekers = async () => {
    try {
      setLoading(true);
      const url = `http://localhost:5000/getSeeker/${userId}`;
      const res = await axios.get(url);
      
      if (res.data.success) {
        setPartners(res.data.data || []);
      } else {
        setError("Failed to fetch seekers");
      }
    } catch (err) {
      console.error("Error fetching seekers:", err);
      setError("Error loading seekers data");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (seeker) => {
    try {
      console.log("Seeker ID:", seeker._id);
      console.log("Seeker Object:", seeker);
      
      setSelectedSeeker(seeker);
      setSelectedSeekerId(seeker._id);
      setShowChatModal(true);
      setOpenMenuId(null);
      setLoadingMessages(true);
      
      // Load existing messages for this seeker
      await fetchMessages(seeker._id);
    } catch (err) {
      console.error("Error in handleStartChat:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchMessages = async (seekerId) => {
    try {
      console.log("Fetching messages for seeker:", seekerId);
      
      const resp = await axios.get(`http://localhost:5000/chats-listener/${userId}/${seekerId}`);
      console.log("Messages response:", resp.data);

      // Set messages directly
      if (resp.data && Array.isArray(resp.data)) {
        setMessages(resp.data);
      } else if (resp.data && resp.data.data && Array.isArray(resp.data.data)) {
        setMessages(resp.data.data);
      } else {
        setMessages([]);
      }
      
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessages([]);
    }
  };

  // ✅ Complete Send Message Function
  const handleSendMessage = async () => {
    if ((!message.trim() && mediaFiles.length === 0) || sending) return;

    try {
      setSending(true);
      
      // ✅ Create FormData
      const formData = new FormData();
      
      // ✅ Use selectedSeekerId (which is set in handleStartChat)
      formData.append("seeker_id", selectedSeekerId);
      formData.append("listener_id", userId);
      formData.append("sender_id", userId);
      formData.append("text", message);
      
      // ✅ Add files if any
      if (mediaFiles.length > 0) {
        mediaFiles.forEach(file => {
          formData.append("media", file);
        });
      }

      console.log("Sending message to seeker:", selectedSeekerId);

      // ✅ Send to server
      const response = await axios.post(
        "http://localhost:5000/Ichat",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Message sent successfully:", response.data);

      // ✅ Immediate UI update
      const newMessage = {
        _id: Date.now(),
        text: message,
        sender_id: userId,
        sent_at: new Date(),
        type: "sent",
        // ✅ Add media to local message if files were sent
        media: mediaFiles.length > 0 ? mediaFiles.map(file => ({
          url: URL.createObjectURL(file),
          type: file.type.startsWith('image') ? 'image' : 
                file.type.startsWith('video') ? 'video' : 'file',
          name: file.name
        })) : []
      };

      setMessages(prev => [...prev, newMessage]);
      
      // ✅ Clear inputs
      setMessage("");
      setMediaFiles([]);
      
      toast.success("Message sent!");

      // ✅ Refresh from server
      setTimeout(() => {
        if (selectedSeekerId) {
          fetchMessages(selectedSeekerId);
        }
      }, 1000);
      
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
      
      // ✅ Optional: Show error details
      if (err.response) {
        console.error("Server response:", err.response.data);
      }
    } finally {
      setSending(false);
    }
  };

  // ✅ File attachment handler
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files);
  };

  // ✅ Remove file from attachments
  const removeFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ Enter key handler
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseModal = () => {
    setShowChatModal(false);
    setSelectedSeeker(null);
    setSelectedSeekerId(null);
    setMessage("");
    setMessages([]);
    setMediaFiles([]);
  };

  const handleDelete = async (id) => {
    try {
      // ✅ Confirm first
      const confirmDelete = window.confirm("Do you want to delete this message?");
      if (!confirmDelete) return;

      // ✅ Immediately update UI
      setMessages(prev => prev.filter(msg => msg._id !== id));
      
      await axios.delete(`http://localhost:5000/chat/message/${id}`);
      toast.success("Message Deleted Successfully");
      
      // ✅ Refresh messages
      fetchMessages(selectedSeekerId);
       
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Failed to delete message");
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

  if (loading) {
    return (
      <>
        <ListnerLayout />
        <div className="container my-5 d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ListnerLayout />
        <div className="container my-5 d-flex justify-content-center">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ListnerLayout />
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="users-container" style={{ marginLeft: "20%", padding: "20px" }}>
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="text-primary fw-bold">My Seekers</h2>
              <div className="badge bg-primary fs-6 px-3 py-2">
                {partners.length} {partners.length === 1 ? 'Seeker' : 'Seekers'}
              </div>
            </div>
            <p className="text-muted mb-0">Manage your conversations with seekers</p>
          </div>
        </div>

        {/* Seekers List */}
        {partners.length === 0 ? (
          <div className="row">
            <div className="col-12">
              <div className="card text-center py-5 border-0 shadow-sm">
                <div className="card-body">
                  <FaUserCircle className="text-muted mb-3" size={60} />
                  <h5 className="card-title text-dark">No Seekers Found</h5>
                  <p className="card-text text-muted">
                    You don't have any seekers yet. When seekers start conversations with you, they will appear here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            {partners.map((seeker) => (
              <div key={seeker._id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body d-flex flex-column">
                    {/* Header with avatar and menu */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        {seeker.profile_image ? (
                          <img 
                            src={`/profile_url/${seeker.profile_image}`}
                            alt={seeker.fullname}
                            className="rounded-circle me-3"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : (
                          <FaUserCircle 
                            className="text-primary me-3" 
                            size={50} 
                          />
                        )}
                        <div>
                          <h6 className="card-title mb-0 fw-bold text-dark">{seeker.fullname}</h6>
                          {seeker.nickname && (
                            <small className="text-muted">@{seeker.nickname}</small>
                          )}
                        </div>
                      </div>
                      
                      {/* Options Menu */}
                      <div className="dropdown" ref={menuRef}>
                        <button
                          className="btn btn-sm btn-light border-0 rounded-circle"
                          onClick={() => setOpenMenuId(
                            openMenuId === seeker._id ? null : seeker._id
                          )}
                          style={{ width: '32px', height: '32px' }}
                        >
                          <FiMoreVertical size={14} />
                        </button>
                        
                        {openMenuId === seeker._id && (
                          <div className="dropdown-menu show position-absolute shadow">
                            <button 
                              className="dropdown-item d-flex align-items-center"
                              onClick={() => handleStartChat(seeker)}
                            >
                              <FiMessageSquare className="me-2" />
                              Start Chat
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mb-3 flex-grow-1">
                      {seeker.email && (
                        <div className="d-flex align-items-center mb-2">
                          <FiMail size={14} className="text-muted me-2" />
                          <small className="text-muted text-truncate">{seeker.email}</small>
                        </div>
                      )}
                      {seeker.phone && (
                        <div className="d-flex align-items-center mb-2">
                          <FiPhone size={14} className="text-muted me-2" />
                          <small className="text-muted">{seeker.phone}</small>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="d-grid gap-2 mt-auto">
                      <button
                        className="btn btn-primary btn-sm d-flex align-items-center justify-content-center"
                        onClick={() => handleStartChat(seeker)}
                      >
                        <FiMessageSquare className="me-2" size={14} />
                        Start Conversation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedSeeker && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              
              {/* Modal Header with Seeker Info */}
              <div className="modal-header text-white border-0 rounded-top">
                <div className="d-flex align-items-center w-100">
                  {selectedSeeker.profile_image ? (
                    <img 
                      src={`/profile_url/${selectedSeeker.profile_image}`}
                      alt={selectedSeeker.fullname}
                      className="rounded-circle me-3"
                      style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                    />
                  ) : (
                    <FaUserCircle className="text-white me-3" size={45} />
                  )}
                  <div className="flex-grow-1">
                    <h6 className="modal-title mb-0 fw-bold">{selectedSeeker.fullname}</h6>
                    {selectedSeeker.nickname && (
                      <small className="text-light opacity-75">@{selectedSeeker.nickname}</small>
                    )}
                  </div>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={handleCloseModal}
                  ></button>
                </div>
              </div>

              {/* Modal Body - Chat Messages */}
              <div 
                className="modal-body p-0" 
                style={{ 
                  height: '60vh', 
                  backgroundColor: '#f8f9fa',
                  overflowY: 'auto'
                }}
              >
                {loadingMessages ? (
                  <div className="text-center text-muted h-100 d-flex flex-column justify-content-center align-items-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading messages...</span>
                    </div>
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted h-100 d-flex flex-column justify-content-center align-items-center">
                    <FiMessageSquare size={50} className="mb-3 opacity-50" />
                    <p className="mb-0">No messages yet</p> 
                    <small>Start a conversation with {selectedSeeker.fullname}</small>
                  </div>
                ) : (
                  <div className="p-3">
                    {messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`d-flex mb-3 ${
                          msg.sender_id === userId ? "justify-content-end" : "justify-content-start"
                        }`}
                      >
                        <div
                          className={`rounded-3 px-3 py-2 position-relative ${
                            msg.sender_id === userId
                              ? "bg-primary text-white"
                              : "bg-white border text-dark"
                          }`}
                          style={{ 
                            maxWidth: "70%", 
                            wordWrap: "break-word",
                            cursor: msg.sender_id === userId ? 'pointer' : 'default'
                          }}
                          onDoubleClick={() => {
                            if (msg.sender_id === userId) {
                              handleDelete(msg._id);
                            }
                          }}
                          title={msg.sender_id === userId ? "Double click to delete" : ""}
                        >
                          {/* ✅ Text Message */}
                          {msg.text && (
                            <div className="message-text">{msg.text}</div>
                          )}

                          {/* ✅ Media Files Display */}
                          {msg.media && msg.media.length > 0 && (
                            <div className="mt-2">
                              {msg.media.map((file, idx) => {
                                if (file.type === "image") {
                                  return (
                                    <a
                                      key={idx}
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
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
                                          maxHeight: "200px",
                                          borderRadius: "8px",
                                          objectFit: "cover"
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
                                        maxHeight: "200px",
                                        borderRadius: "8px",
                                        marginTop: "5px",
                                      }}
                                    >
                                      <source src={file.url} type="video/mp4" />
                                      Your browser does not support the video tag.
                                    </video>
                                  );
                                }
                                
                                return (
                                  <a
                                    key={idx}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: "block",
                                      color: "blue",
                                      marginTop: "5px",
                                      textDecoration: "none",
                                    }}
                                  >
                                    📎 {file.name || "Download file"}
                                  </a>
                                );
                              })}
                            </div>
                          )}

                          <small
                            className={`d-block text-end ${
                              msg.sender_id === userId ? "text-white-50" : "text-muted"
                            }`}
                            style={{ fontSize: "0.7rem" }}
                          >
                            {new Date(msg.sent_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Modal Footer - Message Input */}
              <div className="modal-footer border-top bg-white rounded-bottom">
                <div className="w-100">
                  
                  {/* File Previews */}
                  {mediaFiles.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {mediaFiles.map((file, index) => {
                        const url = URL.createObjectURL(file);
                        const isImage = file.type.startsWith('image');
                        const isVideo = file.type.startsWith('video');
                        
                        return (
                          <div key={index} className="position-relative" style={{width: '60px', height: '60px'}}>
                            {isImage ? (
                              <img 
                                src={url} 
                                alt="preview" 
                                className="rounded"
                                style={{width: '100%', height: '100%', objectFit: 'cover'}}
                              />
                            ) : isVideo ? (
                              <video 
                                src={url}
                                className="rounded"
                                style={{width: '100%', height: '100%', objectFit: 'cover'}}
                              />
                            ) : (
                              <div className="bg-light rounded d-flex align-items-center justify-content-center h-100">
                                <FaPaperclip />
                              </div>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0"
                              style={{width: '20px', height: '20px', fontSize: '10px'}}
                              onClick={() => removeFile(index)}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="input-group">
                    {/* File Attachment Button */}
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FaPaperclip />
                    </button>
                    
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      style={{display: 'none'}}
                      onChange={handleFileChange}
                    />
                    
                 
                    
                    {/* Message Input */}
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                    />
                    
                    {/* Emoji Button */}
                
                    
                    {/* Send Button */}
                    <button 
                      className="btn btn-primary d-flex align-items-center" 
                      type="button"
                      onClick={handleSendMessage}
                      disabled={(!message.trim() && mediaFiles.length === 0) || sending}
                    >
                      {sending ? (
                        <div className="spinner-border spinner-border-sm me-1" role="status">
                          <span className="visually-hidden">Sending...</span>
                        </div>
                      ) : (
                        <FiSend className="me-1" />
                      )}
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        .users-container {
          background-color: #f8f9fa;
          min-height: 100vh;
        }
        
        .card {
          transition: all 0.3s ease;
          border-radius: 12px;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
        }
        
        .dropdown-menu {
          z-index: 1060;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .modal-content {
          border-radius: 15px;
          overflow: hidden;
        }
        
        .message-text {
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
    </>
  );
};

export default ListenerInbox;