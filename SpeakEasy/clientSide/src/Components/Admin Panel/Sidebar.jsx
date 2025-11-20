import React from "react";
import { Link } from "react-router-dom";
import { FaQuestion } from "react-icons/fa";
import { FaTachometerAlt, FaUsers, FaBox, FaCog } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import "../../assets/style.css";
import { GrAssistListening } from "react-icons/gr";
import { HiViewGridAdd } from "react-icons/hi";
import { FaPhone } from "react-icons/fa6";
const Sidebar = ({ isOpen }) => {
  return (
    <div className={`sidebar-container ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <h2 className="brand">{isOpen ? "Speak Easy" : "NA"}</h2>
      </div>

      <ul className="sidebar-menu">
        <li>
          <Link to="/admin/dashboard" className="menu-link">
            <FaTachometerAlt className="menu-icon" />
            {isOpen && <span>Dashboard</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin/seekers" className="menu-link">
            <FaUsers className="menu-icon" />
            {isOpen && <span>Seekers</span>}
          </Link>
        </li>
        <li>
          <Link to="/faq" className="menu-link">
            <FaQuestion  className="menu-icon" />
            {isOpen && <span> faq</span>}
          </Link>
        </li>
           <li>
          <Link to="/admin/contact" className="menu-link">
            <FaPhone   className="menu-icon" />
            {isOpen && <span> Contact</span>}
          </Link>
        </li>
     
        <li>
          <Link to="/admin/Categories" className="menu-link">
            <HiViewGridAdd  className="menu-icon" />
            {isOpen && <span>Categories</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin/listenerTable" className="menu-link">
            <GrAssistListening  className="menu-icon" />
            {isOpen && <span>Listener</span>}
          </Link>
        </li>
     
      </ul>
    </div>
  );
};

export default Sidebar;
