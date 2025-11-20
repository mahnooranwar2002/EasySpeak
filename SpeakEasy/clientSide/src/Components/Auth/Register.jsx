import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [role, setRole] = useState(""); // dropdown value
  const navigate = useNavigate();
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

  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      fullname: "",
      email: "",
      password: "",
      profileImage: "",
   
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
  
    if (
      newErrors.fullname ||
      newErrors.email ||
      newErrors.password ||
      newErrors.profileImage 
    
    ) {
      SetError(newErrors);
    } else {
      const formData = new FormData();
      formData.append("fullname", fullname);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", "seeker");
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
        setRole("");
          fileInput.value = ''; 
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
    <div className="loginbox">
      <div className="overlay">
        <div className="box" id="regBox">
          <h3>Sign Up</h3>
          <p>Become a Part of Our Family</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
            {error.fullname && (
              <div className="error" style={{ color: "red" }}>{error.fullname}</div>
            )}
            <input
              type="text"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error.email && <div className="error" style={{ color: "red" }}>{error.email}</div>}
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error.password && (
              <div style={{ color: "red" }} className="error">{error.password}</div>
            )}
            {/* Profile Image */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files[0])}
            />

            {error.profileImage && (
              <div style={{ color: "red" }} className="error">{error.profileImage}</div>
            )}
            {/* Role Dropdown */}
        
            <input type="submit" value="Register" className="btn" />
          </form>
          <Link className="link" to={"/login"}>
            Already Have An Account ? Sign In
          </Link>
            <Link className="link" to={"/register"}>
          New User?create an account
          </Link>
             <Link className="link" to={"/verify-email"}>
            Verify the Account
          </Link>
    <Link className="link" to={"/forget-password"}>
                         Forget password
                       </Link>  
        </div>
      </div>
    </div>
  );
};

export default Register;
