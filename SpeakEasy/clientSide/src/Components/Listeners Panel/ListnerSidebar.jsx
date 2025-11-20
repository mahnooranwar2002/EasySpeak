
import React from "react";
import { Link } from "react-router-dom";
import { FaQuestion } from "react-icons/fa";
import { FaTachometerAlt, FaUsers, FaBox, FaCog } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import "../../assets/style.css";
import { GrAssistListening } from "react-icons/gr";
import { HiViewGridAdd } from "react-icons/hi";
import { FaCommentMedical } from "react-icons/fa6";
const ListnerSidebar = ({ isOpen }) => {
  return (
    <div>
        <div className={`sidebar-container ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <h2 className="brand">{isOpen ? "Speak Easy" : "NA"}</h2>
      </div>

      <ul className="sidebar-menu">
        <li>
          <Link to="/listener/Dashboard" className="menu-link">
            <FaTachometerAlt className="menu-icon" />
            {isOpen && <span>Dashboard</span>}
          </Link>
        </li>
        <li>
          <Link to="/Listener/appoinments" className="menu-link">
            <FaCommentMedical className="menu-icon" />
            {isOpen && <span>Appointments</span>}
          </Link>
        </li>
        <li>
          <Link to="/Listener/msg" className="menu-link">
            <FaCommentMedical className="menu-icon" />
            {isOpen && <span>Chats</span>}
          </Link>
        </li>
    
      </ul>
    </div>
    </div>
  )
}

export default ListnerSidebar
