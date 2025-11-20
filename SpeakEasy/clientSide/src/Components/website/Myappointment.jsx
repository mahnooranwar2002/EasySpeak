import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import axios from "axios";

const Myappointment = () => {
  const token = sessionStorage.getItem("userLogined");

  const tokenParts = token.split(".");
  const payload = JSON.parse(atob(tokenParts[1]));
  const id = payload.id; // Listener ID

  const [data, setdata] = useState([]);

  // 2. New State for Modal/Popup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Function to handle the opening of the modal
  const Statushandle = (appointmentData) => {
    setSelectedAppointment(appointmentData);
    setIsModalOpen(true);
  };

  // Function to fetch all appointments for the listener
  const fetchdata = async () => {
    try {
      // ✅ Corrected: The endpoint should be '/Get_appointment/LISTENER_ID' (as per your code)
      const response = await axios.get(
        `http://localhost:5000/Get_appointment_user/${id}`
      );
      // Check if response.data.data exists before setting state
      setdata(response.data.data || []);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    fetchdata();
  });
     const handleDelete = async (appointmentId) => {
  
                // Assuming this is the correct backend endpoint for deleting an appointment
                await axios.delete(`http://localhost:5000/appointment_del/${appointmentId}`); 
                toast.error("Appointment deleted successfully!", {
                    position: "top-right",
                });
             
                fetchdata(); 
        
             
            
        }
    
  return (
    <>
      <Nav></Nav>
      <section id="bannarSec">
        <div id="overlay">
          <div className="container">
            <h3>Appointment</h3>
          </div>
        </div>
      </section>

      {data.length == 0 ? (
        <h4>
          {" "}
          <div className="container" id="errorBox">
            <h2>You haven't booked an appointment</h2>
          </div>
        </h4>
      ) : (
        <div className="container">
          {" "}
          <table className="wishlist-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Timing</th>
                <th>Date</th>
                <th>status</th>

                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((w) => (
                <tr key={w.id}>
                  <td>{w.Listner_name}</td>
                  <td>{w.appointment_time}</td>
                  <td>{w.date}</td>
                  <td>{w.status}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(w._id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Myappointment;
