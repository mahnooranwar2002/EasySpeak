import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const Messageicon = () => {
      // const token = sessionStorage.getItem("userLogined");

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {

 
    const fetchUnread = async () => {
        const token = sessionStorage.getItem("userLogined");
      if (token) {
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const id = payload.id;
      const role = payload.role;

  
    
      try {
      
        let url = "";

          url = `http://localhost:5000/sessions/seeker/${id}`;
        

        if (url) {
          const res = await axios.get(url);
          // sum of all unread counts across sessions
          const totalUnread = res.data.reduce(
            (sum, session) => sum + (session.unreadCount || 0),
            0
          );
          setUnreadCount(totalUnread);
          console.log(totalUnread)
        }
      } catch (err) {
        console.error("❌ Failed to fetch unread count:", err);
      }
    };}

    fetchUnread();
    // ✅ refresh every 10s
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="container msg-Section">
        <div className="Chatboticon">
          <Link to={"/chats"}>
            <i class="ri-discuss-fill"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Messageicon;
