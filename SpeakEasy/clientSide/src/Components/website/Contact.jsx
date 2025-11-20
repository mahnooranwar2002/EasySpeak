import React, { useState } from "react";
import axios from "axios";
import Nav from "./Nav";
import Footer from "./Footer";
import { toast } from "react-toastify";

const Contact = () => {
   const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
    message: ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (optional but if provided, validate)
    if (formData.contact_number && !/^[0-9+\-\s()]{10,}$/.test(formData.contact_number)) {
      newErrors.contact_number = "Please enter a valid phone number";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post("http://localhost:5000/addcontact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contact_number: formData.contact_number.trim() || null,
        message: formData.message.trim()
      });

    
        toast.success("Message sent successfully!");
        // Reset form
        setFormData({
          name: "",
          email: "",
          contact_number: "",
          message: ""
        });
        setErrors({});
    
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Nav></Nav>
      <section id="bannarSec">
        <div id="overlay">
          <div className="container">
            <h3>Contact Us</h3>
          </div>
        </div>
      </section>
      <div className="container" id="contactBox">
        <div className="right-wrapper">
          <h5>Send us a message</h5>
          <h4>Let's start talking with us</h4>
          <p>
            Vestibulum phasellus class molestie donec ligula pharetra odio. Sem
            ligula hac aliquam magnis placerat massa.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <input type="text" className="control con" placeholder="Name"    name="name"
              value={formData.name}
              onChange={handleChange} />
            </div>
               {errors.name && <div className="error-text">{errors.name}</div>}
            <div className="row">
              <input type="text" className="control con" placeholder="Email"     name="email"
              value={formData.email}
              
              onChange={handleChange}/>
{errors.email && <div className="error-text">{errors.email}</div>}
            
            </div>
            <div className="row">
              <textarea
                style={{ resize: "none" }}
                placeholder="write a massage"
               name="message"
              className={`text-area`}
              value={formData.message}
              onChange={handleChange}
                
                id=""
             
              ></textarea>
               {errors.message && <div className="error-text">{errors.message}</div>}
            </div>
            <div className="row">
              <input type="submit" value="Send" className="btn" />
            </div>
          </form>
 

        </div>
        <div className="left-wrapper">
          <img src="img/img_5.png" alt="" />
        </div>
      </div>
      {/* service  start */}
      <section id="serviceSec">
        <div className="container">
          <div className="row">
            <div className="card">
              <div className="inner">
                <i class="ri-brain-line"></i>
                <h3>Presence</h3>
                <p>
                  Vivamus nec class taciti magna donec est tempor maximus
                  suspendisse efficitur ipsum.
                </p>
                <a href="">learn more</a>
              </div>
            </div>
            <div className="card" id="innerTwo">
              <div className="inner">
                <i class="ri-layout-masonry-fill"></i>
                <h3>Therapy Sessions</h3>
                <p>
                  Vivamus nec class taciti magna donec est tempor maximus
                  suspendisse efficitur ipsum.
                </p>
                <a href="">learn more</a>
              </div>
            </div>
            <div className="card">
              <div className="inner">
                <i class="ri-dna-fill"></i>

                <h3>Counseling Services</h3>
                <p>
                  Vivamus nec class taciti magna donec est tempor maximus
                  suspendisse efficitur ipsum.
                </p>
                <a href="">learn more</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* service end */}
      <Footer></Footer>
    </>
  );
};

export default Contact;
