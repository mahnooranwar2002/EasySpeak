import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
// Removed Bootstrap CSS/JS imports as we're using custom CSS now
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "../../assets/style.css";
const Listenerstopbar = ({ toggleSidebar }) => {
  const navigate = useNavigate(); // Initialize navigate

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/logout");
      sessionStorage.clear();

      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const token = sessionStorage.getItem("listenerLogined");
  var [name, fetchName] = useState({});

  useEffect(() => {
    if (token) {
      try {
        const tokenParts = token.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));
        const id = payload.id;
        // const role = payload.role; // role isn't used here, so it's commented out

        axios.get(`http://localhost:5000/profile/${id}`).then((res) => {
          fetchName(res.data);
        });
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
  }, [token]); // Added token to dependency array for completeness

  return (
    <div className="topbar">
      {/* Left */}
      <div className="topbar-left">
        <FaBars size={22} className="toggle-icon" onClick={toggleSidebar} />
        <h3 className="topbar-title">Listnener Panel</h3>
      </div>

      {/* Right - Custom CSS Dropdown */}
      <div className="custom-dropdown">
        <button className="dropdown-toggle-btn">
          <img
            src={`/profile_url/${name.profile_image}`}
            alt="Profile"
            width={25}
            height={25}
            className="rounded-circle me-2"
          />
          <span className="profile-name">{name.fullname}</span>
          {/* Optional: Add a subtle down arrow icon here if desired */}
        </button>

        <ul className="custom-dropdown-menu">
          <li>
            <Link className="dropdown-item" to={"/listener/Listner_profile"}>
              Profile
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to={"/listener/ChangePassword"}>
              Change Password
            </Link>
          </li>
       
          <li className="dropdown-divider"></li>
          <li>
            <a
              className="dropdown-item text-danger"
              href="#"
              onClick={handleLogout}
            >
              Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Listenerstopbar;
