import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const Add_listener = () => {
  var [categories, SetCategaries] = useState([]);
  var fetch_data = () => {
    axios.get("http://localhost:5000/active_Category").then((resp) => {
      SetCategaries(resp.data);
    });
  };
  useEffect(() => {
    fetch_data();
  });

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setcategory] = useState(1);
  const [about, setabout] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [role, setRole] = useState(""); // dropdown value

  const fileInput = document.querySelector('input[type="file"]');
  const validateImage = (file) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|svg)$/;
    return imageRegex.test(file.name);
  };
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const [error, SetError] = useState({
    fullname: "",
    email: "",
    password: "",
    profileImage: "",
    about: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      fullname: "",
      email: "",
      password: "",
      profileImage: "",
      about: "",
      category: "",
    };
    if (!fullname || fullname.length < 3) {
      newErrors.fullname =
        "Full name is required and must be at least 3 characters.";
    }
    if (!email || !validateEmail(email)) {
      newErrors.email = "Email is required and must be a valid email address.";
    }
    if (!password || password.length < 8) {
      newErrors.password =
        "Password is required and must be at least 8 characters.";
    }

    if (profileImage && !validateImage(profileImage)) {
      newErrors.profileImage = "Invalid image file.";
    } else if (!profileImage) {
      newErrors.profileImage = "Profile image is required.";
    }
    if (!about) {
      newErrors.about = "about is required";
    }
    if (!category) {
      newErrors.category = "category is required";
    }
    if (
      newErrors.fullname ||
      newErrors.email ||
      newErrors.password ||
      newErrors.about ||
      newErrors.profileImage
    ) {
      SetError(newErrors);
    } else {
      const formData = new FormData();
      formData.append("fullname", fullname);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", "listener");
      formData.append("about", about);
         formData.append("category", category);
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      const response = await axios.post(
        "http://localhost:5000/register",
        formData
      );
      if (response.data.success) {
        toast.success(response.data.massege);
        setFullname("");
        setEmail("");
        setPassword("");
        setProfileImage(null);
        setcategory(1);
        setRole("");
        setabout("");
        fileInput.value = "";
        SetError({
          fullname: "",
          email: "",
          password: "",
          profileImage: "",
          role: "",
        });

      } else {
        toast.error(response.data.massege, {
          position: "top-right",
        });
      }
    }
  };

  return (
    <div>
      <AdminLayout />
      <div className="container my-5 d-flex justify-content-center">
        <div
          className="card shadow p-4"
          style={{ maxWidth: "600px", width: "100%" }}
        >
          <h2 className="mb-4 text-center">Add New Listener</h2>

          <form onSubmit={handleSubmit}>
            {/* Full Name Input */}
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
              {error.fullname && (
                <div className="error" style={{ color: "red" }}>
                  {error.fullname}
                </div>
              )}
            </div>

            {/* Email Input */}
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error.email && (
                <div className="error" style={{ color: "red" }}>
                  {error.email}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <select
                name="category"
                id=""
                 value={category} 
                className="form-select"
                onChange={(e) => setcategory(e.target.value)}
              >
                <option value={1} hidden>
                  Select a Category
                </option>
                {categories.map((m) => (
                  <option value={m.name}>{m.name}</option>
                ))}
              </select>
              {error.category && (
                <div className="error" style={{ color: "red" }}>
                  {error.category}
                </div>
              )}
            </div>
            {/* Password Input */}
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error.password && (
                <div style={{ color: "red" }} className="error">
                  {error.password}
                </div>
              )}
            </div>

            {/* Profile Image Input */}
            <div className="mb-3">
              <label className="form-label">Profile Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files[0])}
              />

              {error.profileImage && (
                <div style={{ color: "red" }} className="error">
                  {error.profileImage}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">About</label>
              <textarea
                class="form-control"
                name="about"
                value={about}
                onChange={(e) => setabout(e.target.value)}
                id="exampleFormControlTextarea1"
                rows="3"
              ></textarea>
              {error.about && (
                <div style={{ color: "red" }} className="error">
                  {error.about}
                </div>
              )}
            </div>
            {/* Submit Button (usually doesn't need a wrapper div/label) */}
            <div className="text-end">
              <button type="submit" className="btn btn-primary px-4">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add_listener;
