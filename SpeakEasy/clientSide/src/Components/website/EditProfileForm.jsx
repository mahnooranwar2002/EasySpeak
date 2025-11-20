import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const EditProfileForm = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullname: user.fullname,
    email: user.email,
    role: user.role,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(
    user.profile_image ? `/profile_url/${user.profile_image}` : null
  );

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
      data.append("fullname", formData.fullname);
      data.append("email", formData.email);
      data.append("role", formData.role);
      if (profileImage) {
        data.append("profile_image", profileImage);
      }

      const res = await axios.put(
        `http://localhost:5000/profile/${user._id}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
toast.success("the user profile is updated")
      onUpdate(res.data.user); // update parent state
      onClose(); // close modal
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="editProfileForrm">
      <div className="box">
        {/* Close button */}
    <div className="buttondiv">
          <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>
    </div>

        <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>

        {/* Profile Image Preview */}
        <div className="flex justify-center mb-4">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-24 aspect-square rounded-full border-2 border-blue-400 object-cover shadow-md"
            />
          ) : (
            <div className="w-24 h-24 aspect-square flex items-center justify-center rounded-full bg-gray-300 text-gray-600">
              No Image
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fullname */}
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            placeholder="Full Name"
          
            required
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"

            required
          />

          {/* Role */}
      

          {/* Profile Image Upload */}
          <div>
          
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          {/* Buttons */}
          <div className="lastbtn">
            <button
              type="button"
              onClick={onClose}
              className="closbtn"
            >
              Cancel
            </button>
            <button
              type="submit"
        className="saveBtn"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;
