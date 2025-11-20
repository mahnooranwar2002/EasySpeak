import React, { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import axios from 'axios';
import { FaQuestion } from "react-icons/fa";
import { FaTachometerAlt, FaUsers, FaBox, FaCog } from "react-icons/fa";
import { HiViewGridAdd } from "react-icons/hi";
const AdminDashborad = () => {
    var [categories, SetCategory] = useState([]);
  var fetch_data = () => {
    axios.get("http://localhost:5000/fetchCategory").then((resp) => {
      SetCategory(resp.data);
    });
  };
            const [data, setdata] = useState([]);
   
    
    const fetchdata = async () => {
      try {
        const response = await axios.get("http://localhost:5000/admin-seekers");
        setdata(response.data);
      } catch (error) {
        console.error(error);
      }
    };
      const [faqs, setFaqs] = useState([]);


const fetchFaqs = async () => {
  try {
    const response = await axios.get("http://localhost:5000/faq_fetch");
    setFaqs(response.data);
  } catch (error) {
    console.error(error);
  }
};     const [listner, setlistner] = useState([]);
    const [query, setQuery] = useState("");
    
    const listnenerdata = async () => {
      try {
        const response = await axios.get("http://localhost:5000/admin-listeners");
        setlistner(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    

  useEffect(()=>{
    fetch_data();
    fetchdata();
    fetchFaqs();
    listnenerdata();
  })
  return (
    <div>
      <AdminLayout/>
<div className="users-container" style={{ marginLeft: "20%" }}>
<div className="container my-5 me-5">
  <div className="row g-4">
<div className="col-6">
      <div className="card h-100 border-0 shadow-lg rounded-4 p-4 d-flex flex-column justify-content-between">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold text-muted mb-0">Seekers</h6>
         <FaUsers className='fw-bold fs-2'/>
        </div>
        <h2 className="fw-bold mb-0" style={{color:"#005f59"}}>{data.length}</h2>
      </div>
    </div>
    {/* Destinations */}


    {/* Users */}
 
   
 

    {/* FAQs */}
    <div className="col-6">
      <div className="card h-100 border-0 shadow-lg rounded-4 p-4 d-flex flex-column justify-content-between">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold text-muted mb-0">Faq</h6>
         <FaQuestion className='fw-bold fs-2'/>
        </div>
        <h2 className="fw-bold mb-0"  style={{color:"#005f59"}}>{faqs.length}</h2>
      </div>
    </div>
        <div className="col-6">
      <div className="card h-100 border-0 shadow-lg rounded-4 p-4 d-flex flex-column justify-content-between">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold text-muted mb-0">Categories</h6>
         <HiViewGridAdd className='fw-bold fs-2'/>
        </div>
        <h2 className="fw-bold  mb-0"  style={{color:"#005f59"}}>{categories.length}</h2>
      </div>
    </div>
   <div className="col-6">
      <div className="card h-100 border-0 shadow-lg rounded-4 p-4 d-flex flex-column justify-content-between">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold text-muted mb-0">Listnener</h6>
         <HiViewGridAdd className='fw-bold fs-2'/>
        </div>
        <h2 className="fw-bold  mb-0"  style={{color:"#005f59"}}>{listner.length}</h2>
      </div>
    </div>
  </div>
</div>
</div>
    </div>
  )
}

export default AdminDashborad
