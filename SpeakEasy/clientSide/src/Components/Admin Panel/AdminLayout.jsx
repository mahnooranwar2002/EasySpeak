
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState } from "react";

const AdminLayout = () => {
      const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);
  return (
    <div>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous"></link>
       <Sidebar isOpen={isOpen} />
      <div style={{ marginLeft: isOpen ? "230px" : "70px", transition: "margin-left 0.3s" }}>
        <Topbar toggleSidebar={toggleSidebar} />
        <div style={{ padding: "20px" }}>
         
        </div>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
    </div>
  )
}

export default AdminLayout;
