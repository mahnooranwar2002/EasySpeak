import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminLayout from './AdminLayout';

const Adminprofile = () => {
    // 1. State to hold the current user data (fetched from API)
    const [user, setUser] = useState(null); 
    
    // 2. State for form inputs (will be pre-filled with user data)
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
    });

    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const token = sessionStorage.getItem("adminlogined");

    // --- Data Fetching and Initialization ---
    useEffect(() => {
    if (token) {
      try {
        const tokenParts = token.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));
        const id = payload.id;
        // const role = payload.role; // role isn't used here, so it's commented out

        axios.get(`http://localhost:5000/profile/${id}`).then((res) => {
          setFormData(res.data);
        });
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
  }, [token]); 





    // --- Handlers ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfileImage(file);
        if (file) {
            setPreview(URL.createObjectURL(file)); // show instant preview
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            // Append form data
            data.append("fullname", formData.fullname);
            data.append("email", formData.email);
            // Append profile image only if a new file was selected
            if (profileImage) {
                data.append("profile_image", profileImage);
            }

            const res = await axios.put(
                `http://localhost:5000/profile/${user._id}`,
                data,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            toast.success("Profile updated successfully!");
            // Optionally update the local user state with the new data from the response
            setUser(res.data.user); 
            // The onClose and onUpdate calls were removed as this is a standalone page.

        } catch (err) {
            console.error("Update failed:", err);
            // Show a user-friendly error message
            toast.error("Failed to update profile. Please try again.");
        }
    };
    
    // The placeholder onClose function is now just an alert/log, as it was likely for a modal
    const handleCancel = () => {
        // In a standalone page, cancel typically means reverting changes or navigating back
        console.log("Edit cancelled."); 
        toast.info("Changes discarded.");
        // You might want to reload the user data here to reset the form:
        // window.location.reload(); 
    }


    // --- Render ---
    return (
      <>
        <AdminLayout/>
            <div className="container my-5 d-flex justify-content-center">
                <div
                    className="card shadow p-4"
                    style={{ maxWidth: "600px", width: "100%" }}
                >
                    <h2 className="text-center mb-4">Edit Profile</h2>

                    {/* Profile Image Preview */}
                    <div className="d-flex justify-content-center mb-4">
                        { formData.profile_image ? (
                            <img
                              src={`/profile_url/${formData?.profile_image}`}
                                alt="Profile Preview"
                                className="rounded-circle border border-2 border-primary object-fit-cover shadow-sm"
                                style={{ width: "96px", height: "96px" }} // Equivalent to w-24 h-24
                            />
                        ) : (
                            <div className="d-flex align-items-center justify-content-center rounded-circle bg-light text-secondary"
                                style={{ width: "96px", height: "96px" }}>
                                No Image
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="row g-3">
                        
                        {/* Fullname */}
                        <div className="col-12 mb-3">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="fullname"
                                value={formData.fullname}
                                onChange={handleChange}
                                placeholder="Full Name"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="col-12 mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                            />
                        </div>

                        {/* Profile Image Upload */}
                        <div className="col-12 mb-4">
                            <label className="form-label">Profile Image</label>
                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="col-12 d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                onClick={handleCancel} 
                                className="btn btn-secondary" 
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
      </> 
    );
}

export default Adminprofile;