import React, { useRef, useEffect, useState } from "react";
import { Link, Links, useNavigate } from "react-router-dom";
import axios from "axios";
import Messageicon from "./Messageicon";
import Chatboticon from "./Chatboticon";

const Nav = () => {
  const navRef = useRef(null);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("userLogined");

  useEffect(() => {
    if (token) {
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const id = payload.id;
      const role = payload.role;

      axios.get(`http://localhost:5000/profile/${id}`).then((res) => {
        fetchName(res.data);
      });
    }
  }, []);

  const [unreadCount, setUnreadCount] = useState(0);
  var [name, fetchName] = useState({});
  useEffect(() => {});
  // useEffect(() => {
  //   // jab localStorage change ho, update states
  //   const handleStorageChange = () => {
  //     setFullname(localStorage.getItem("fullname"));
  //     setRole(localStorage.getItem("role"));
  //     setIsLoggedIn(!!localStorage.getItem("userId"));
  //   };

  //   window.addEventListener("storage", handleStorageChange);
  //   handleStorageChange(); // first time run
  //   return () => window.removeEventListener("storage", handleStorageChange);
  // }, []);

  // // ✅ Fetch unread messages count
  // useEffect(() => {
  //   const fetchUnread = async () => {
  //     if (!isLoggedIn || !role) return;
  //     try {
  //       const userId = sessionStorage.getItem("userId");
  //       let url = "";

  //       if (role === "listener") {
  //         url = `http://localhost:5000/sessions/listener/${userId}`;
  //       } else if (role === "seeker") {
  //         url = `http://localhost:5000/sessions/seeker/${userId}`;
  //       }

  //       if (url) {
  //         const res = await axios.get(url);
  //         // sum of all unread counts across sessions
  //         const totalUnread = res.data.reduce(
  //           (sum, session) => sum + (session.unreadCount || 0),
  //           0
  //         );
  //         setUnreadCount(totalUnread);
  //       }
  //     } catch (err) {
  //       console.error("❌ Failed to fetch unread count:", err);
  //     }
  //   };

  //   fetchUnread();

  //   // ✅ refresh every 10s
  //   const interval = setInterval(fetchUnread, 10000);
  //   return () => clearInterval(interval);
  // }, [isLoggedIn, role]);

  const navbar = () => {
    navRef.current.style.display = "block";
  };

  const handleInboxClick = () => {
    if (!name.role) {
      navigate("/login");
    } else {
      navigate("/chats"); // ✅ always go to inbox route
    }
  };

  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/logout");
      sessionStorage.clear();

      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  const handleInboxlistenerClick = () => {
    if (!name.role) {
      navigate("/login");
    } else {
      navigate("/inbox"); // ✅ always go to inbox route
    }
  };

  return (
    <header>
      <p>Begin Your Path to Healing with SpeakEasy. </p>
      <div className="container" id="navbar">
        <h2>
          Speak<span> Easy</span>
        </h2>

        <nav ref={navRef}>
          <ul>
            <li>
              <Link to={"/"}>Home</Link>
            </li>
            <li>
              <Link to={"/about"}>About</Link>
            </li>
            <li>
              <Link to={"/service"}>Services</Link>
            </li>
             <li>
                <Link to={"/listners"}>Listeners</Link>
              </li>
      

               <li>
              <Link to={"/web/faq"}>FAQ</Link>
            </li>

        <li>
              <Link to={"/contact"}>Contact</Link>
            </li>
        
          </ul>
        </nav>

        <div className="link">
          <i className="ri-facebook-circle-line"></i>
          <i className="ri-instagram-line"></i>
          <i className="ri-linkedin-box-line"></i>
        </div>

        <div className="startedLin">
          {token ? (
            <div className="dropdown">
              <button
                className="dropdown-toggle startedLink"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {name.fullname}
                <i className="fa fa-caret-down"></i>
              </button>
              {showDropdown && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/profile" className="dropdown-item">
                      Profile
                    </Link>
                  </li>
                <li>
                    <Link to="/web/myappoint" className="dropdown-item">
                    Appointments
                    </Link>
                  </li>
                
                        <li>
                    <Link to="/change-password" className="dropdown-item">
                      Change Password
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      style={{
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "6px",
                        backgroundColor: "red",
                        color: "white",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <div className="startedLink">
              <Link to={"/login"}>Get Start</Link>
            </div>
          )}
        </div>

        <i className="ri-menu-unfold-4-line menu" onClick={() => navbar()}></i>
      </div>
      <Messageicon/>
        <Chatboticon />
    </header>
  );
};

export default Nav;
