import React, { useEffect, useState } from 'react'
import ListnerLayout from './ListnerLayout'
import { FaCommentMedical } from "react-icons/fa6";
const ListnenrsDashboard = () => {
     const token = sessionStorage.getItem("listenerLogined");
      // Ensure token is present before attempting to split/parse
      if (!token) {
          // Handle unauthenticated state if necessary (e.g., redirect to login)
          console.error("No listener token found.");
          return <div>Access Denied. Please log in as a listener.</div>;
      }
  
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const id = payload.id; // Listener ID
  
      const [data, setdata] = useState([]);
  
      // Function to fetch all appointments for the listener
      const fetchdata = async () => {
          try {
              // ✅ Corrected: The endpoint should be '/Get_appointment/LISTENER_ID' (as per your code)
              const response = await axios.get(`http://localhost:5000/Get_appointment/${id}`);
              // Check if response.data.data exists before setting state
              setdata(response.data.data || []); 
          } catch (error) {
              console.error("Error fetching appointments:", error);
          }
      };
      useEffect(()=>{
        fetchdata();
      })
  return (
    <div>
      <ListnerLayout></ListnerLayout>
      <div className="users-container" style={{ marginLeft: "20%" }}>
      <div className="container my-5 me-5">
  <div className="row g-4">
<div className="col-6">
      <div className="card h-100 border-0 shadow-lg rounded-4 p-4 d-flex flex-column justify-content-between">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold text-muted mb-0">Appointments</h6>
      <FaCommentMedical className='fw-bold fs-2'/>
        </div>
        <h2 className="fw-bold  mb-0" style={{color:"#005f59"}}>{data.length}</h2>
      </div>
    </div>
    
    </div>
 
 
  
</div>
    </div>
     </div>
  )
}

export default ListnenrsDashboard
