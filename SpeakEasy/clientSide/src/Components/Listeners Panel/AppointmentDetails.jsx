import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // useNavigate is not used, so I removed it
import { toast } from "react-toastify";
import ListnerLayout from './ListnerLayout';

// 1. New component for the Modal/Popup
const AppointmentModal = ({ appointment, onClose, onUpdateStatus }) => {
    if (!appointment) return null;

    return (
        // Modal Backdrop
        <div className="modal-backdrop" style={modalBackdropStyle}>
            {/* Modal Content */}
            <div className="modal-content" style={modalContentStyle}>
                <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                <h3>Appointment Details</h3>
                <hr/>
                <p><strong>Seeker:</strong> {appointment.user_name}</p>
                <p><strong>Email:</strong> {appointment.email}</p>
                <p><strong>Date:</strong> {appointment.date}</p>
                <p><strong>Time:</strong> {appointment.appointment_time}</p>
                <p><strong>Reason:</strong> {appointment.reason}</p>
                <p><strong>Current Status:</strong> <span style={{ fontWeight: 'bold', color: getStatusColor(appointment.status) }}>{appointment.status}</span></p>

                {/* Status Update Section */}
                <div style={{ marginTop: '20px' }}>
                    <strong>Update Status:</strong>
                    <select 
                        className="form-select"
                        defaultValue={appointment.status}
                        onChange={(e) => onUpdateStatus(appointment._id, e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

// Helper function for status color (optional, but nice)
const getStatusColor = (status) => {
    switch(status) {
        case 'Scheduled': return 'blue';
        case 'Ongoing': return 'orange';
        case 'Completed': return 'green';
        case 'Cancelled': return 'red';
        default: return 'gray';
    }
}


const AppointmentDetails = () => {
    
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
    const [query, setQuery] = useState("");
    
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
            const response = await axios.get(`http://localhost:5000/Get_appointment/${id}`);
            // Check if response.data.data exists before setting state
            setdata(response.data.data || []); 
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    };
    
    // Function to handle appointment deletion
    // NOTE: Your delete function uses /user_del, which suggests it's deleting a user/FAQ, not an appointment.
    // It should ideally be an /appointment_del or similar. I've left the original logic but corrected the toast message.
    const handleDelete = async (appointmentId) => {
  
                // Assuming this is the correct backend endpoint for deleting an appointment
                await axios.delete(`http://localhost:5000/appointment_del/${appointmentId}`); 
                toast.error("Appointment deleted successfully!", {
                    position: "top-right",
                });
             
                fetchdata(); 
        
             
            
        }
    
    
    // Function to handle the search (Your current search implementation is a bit complex)
    const searchdata = async () => {
        try {
            // Assuming this endpoint searches all appointments, not just the listener's
            // You might want to update your backend to filter by LISTENER_ID AND search query
            
            const response = await axios.get(`http://localhost:5000/search_appo/${id}/search?q=${query}`);
            setdata(response.data );
            console.log(response)
        } catch (error) {
            console.error("Error during search:", error);
        }
    };
    
    // Custom logic for useEffect dependencies
    useEffect(() => {
        // Run search only if query has content
        if (query.length > 0) {
            // Debounce might be useful here to avoid too many requests
            searchdata();
        } else {
            // Fetch all appointments when query is empty
            fetchdata();
        }
    }, [query]); // Dependency array: Re-run when query changes
    
    // Fetch data initially on mount (and only on mount)
    useEffect(() => {
        fetchdata();
    }, []);

    // Function to update status (called from both table and modal)
    const updateStatus = async (appointmentId, status) => {
        try {
            await axios.put(`http://localhost:5000/appointment_Status/${appointmentId}`, { status: status });
            toast.success("Status updated successfully!", { position: "top-right" });
            
            // 3. Update the data locally and close the modal (if open)
            setdata(prevData => prevData.map(app => 
                app._id === appointmentId ? { ...app, status: status } : app
            ));
            setIsModalOpen(false);
            setSelectedAppointment(null);
            
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Failed to update status.", { position: "top-right" });
        }
    };

    return (
        <div>
            <ListnerLayout/>

            {/* Render the Modal if it's open */}
            <AppointmentModal 
                appointment={selectedAppointment} 
                onClose={() => setIsModalOpen(false)} 
                onUpdateStatus={updateStatus}
            />

            <div className="users-container" style={{ marginLeft: "20%" }}>
                <div className="users-header">
                    <h2>Appointment List</h2>
                    <div>
                        <input
                            type="text"
                            placeholder="Search data..."
                            className="search-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Seeker Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th className="action-col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((cat, index) => (
                                    // Make sure you use cat._id for the key if your database uses _id
                                    <tr key={cat._id || index}> 
                                        <td>{index + 1}</td>
                                        <td>{cat.user_name}</td>
                                        <td>{cat.email}</td>
                                        <td>
                                            {/* Display current status text */}
                                            <span style={{ fontWeight: 'bold', color: getStatusColor(cat.status) }}>
                                                {cat.status}
                                            </span>
                                        </td>
                                        <td>
                                            {/* We don't need the <Link to="edit_faq"> or the <select> here anymore. 
                                                The Status button now opens the modal for viewing/editing. */}
                                            
                                            {/* ✅ CORRECTED: This button now uses Statushandle to open the modal 
                                                and passes the ENTIRE appointment object */}
                                            <button
                                                className="btn btn-info text-white"
                                                onClick={() => {
                                                    Statushandle(cat); 
                                                }}
                                            >
                                                Details
                                            </button>
                                            
                                            <button
                                                className="btn btn-delete btn-danger"
                                                onClick={() => {
                                                    handleDelete(cat._id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">
                                        No appointments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AppointmentDetails

// Basic CSS styles for the modal (you should move these to a CSS file)
const modalBackdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    position: 'relative',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
};

const closeButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    border: 'none',
    background: 'transparent',
    fontSize: '24px',
    cursor: 'pointer',
};