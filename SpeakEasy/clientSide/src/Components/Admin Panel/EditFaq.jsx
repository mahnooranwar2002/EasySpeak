import axios from "axios";
import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate को इम्पोर्ट करें
import AdminLayout from "./AdminLayout";

const EditFaq = () => {


  const { id } = useParams();
 
  const navigate = useNavigate(); 
  
  const [form, setForm] = useState({
    subject: "",
    faqQuestion: "",
    faqAnswer: "",
  });

  const [error, setError] = useState({
    subject: "",
    faqQuestion: "",
    faqAnswer: "",
  });


  useEffect(() => {
    axios
      .get(`http://localhost:5000/faq_find/${id}`)
      .then((res) => {
        // फ़ॉर्म स्टेट को फ़ेच किए गए डेटा से सेट करें
        setForm({
          subject: res.data.subject,
          faqQuestion: res.data.faqQuestion,
          faqAnswer: res.data.faqAnswer,
        });
      })
      .catch((err) => {
        console.error("Error fetching FAQ:", err);
        toast.error("Failed to load FAQ data.");
      });
  }, [id]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    
    setError(prevError => ({
      ...prevError,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    let newError = {
      subject: "",
      faqQuestion: "",
      faqAnswer: "",
    };

    let isValid = true;
    if (!form.subject.trim()) {
      newError.subject = "The subject is required **";
      isValid = false;
    }
    if (!form.faqQuestion.trim()) {
      newError.faqQuestion = "The Faq Question is required **";
      isValid = false;
    }
    if (!form.faqAnswer.trim()) {
      newError.faqAnswer = "The Faq Answer is required **";
      isValid = false;
    }

    if (!isValid) {
      setError(newError);
      return; 
    }

    // Update Logic
    try {
      
      await axios.put(`http://localhost:5000/faq_edit/${id}`, {
        subject: form.subject,
        faqQuestion: form.faqQuestion,
        faqAnswer: form.faqAnswer,
      });

      toast.success("The Faq is Updated now!", {
        position: "top-right",
      });

    

    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Error updating FAQ: " + (error.response?.data?.error || "Server error"));
    }
  };

  return (
    <>
      <AdminLayout />
      <div className="container my-5 d-flex justify-content-center">
        <div className="card shadow p-4" style={{ maxWidth: "600px", width: "100%" }}>
          <h2 className="mb-4 text-center">Update FAQ</h2>

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label">FAQ Subject</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Subject"
                name="subject"
                value={form.subject} // ✅ value form स्टेट से बंधा है
                onChange={handleChange} // ✅ form स्टेट को अपडेट करने के लिए नया हैंडलर
              />
              {error.subject && <span className="text-danger">{error.subject}</span>}
            </div>


            <div className="mb-3">
              <label className="form-label">FAQ Question</label>
              <textarea
                className="form-control"
                name="faqQuestion"
                placeholder="Enter Question"
                value={form.faqQuestion} // ✅ value form स्टेट से बंधा है
                onChange={handleChange} // ✅ form स्टेट को अपडेट करने के लिए नया हैंडलर
                rows="3"
              ></textarea>
              {error.faqQuestion && (
                <span className="text-danger">{error.faqQuestion}</span>
              )}
            </div>


            <div className="mb-3">
              <label className="form-label">FAQ Answer</label>
              <textarea
                className="form-control"
                name="faqAnswer"
                placeholder="Enter Answer"
                value={form.faqAnswer} // ✅ value form स्टेट से बंधा है
                onChange={handleChange} // ✅ form स्टेट को अपडेट करने के लिए नया हैंडलर
                rows="4"
              ></textarea>
              {error.faqAnswer && (
                <span className="text-danger">{error.faqAnswer}</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-end">
              <button type="submit" className="btn btn-primary px-4">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

    </>
  )
}

export default EditFaq