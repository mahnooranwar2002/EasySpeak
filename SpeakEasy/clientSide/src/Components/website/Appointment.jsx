import React, { useRef, useEffect, useState } from "react";
import Nav from './Nav'
import Footer from './Footer'
import axios from "axios";
import { toast } from "react-toastify";

const Appointment = () => {

 var [name, fetchName] = useState({});
  const token = sessionStorage.getItem("userLogined");

  useEffect(() => {
    if (token) {
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const id = payload.id;
      const role = payload.role;

      axios.get(`http://localhost:5000/profile/${id}`).then((res) => {
        fetchName(res.data);
      });
    }
    fetchListeners();
  }, []);
    const [listeners, setListeners] = useState([]);
 // ✅ track blocked listeners


    const fetchListeners = async () => {
      try {
        const res = await axios.get("http://localhost:5000/listeners");
        setListeners(res.data);
      } catch (err) {
        console.error("Error fetching listeners:", err);
      }
    };
var [appoint,SetApoint]=useState({
    user_id:"",
    Listner_id:"",
    appointment_time:"",
    date:"",
    reason:""
})
var handleInput=(e)=>{
    SetApoint({...appoint,[e.target.name]:e.target.value})
}

var BookedAnAppoint=(e)=>{
e.preventDefault();
   const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));
      const id = payload.id;
appoint.user_id =id

axios.post('http://localhost:5000/add_appointment',appoint).then(()=>(
  SetApoint({
      user_id:"",
    Listner_id:1,
    appointment_time:"",
    date:"",
    reason:""
  }),
  toast.success("your appointment is booked now ")
))

}

  return (
    <div>
        <Nav/>
            <section id="bannarSec">
        <div id="overlay">
          <div className="container">
              <h3>Appointment</h3>
          </div>
        </div>
        </section>
        <div className="container appointmentBox">
         <form onSubmit={BookedAnAppoint}>
           <h4>Make an Appointment</h4>
           <div className="blankDiv"></div>
            <input type="text" placeholder='Time'value={name.fullname} readOnly disabled />

             <input type="text" placeholder='Time' value={name.email} readOnly disabled/>
            
         <input type="time" placeholder='Time' value={appoint.appointment_time} name="appointment_time" onChange={handleInput} />
         <input type="date" placeholder='' value={appoint.date}  onChange={handleInput} name="date"  min={new Date().toISOString().split("T")[0]} />
      
        
           <select  id="" name="Listner_id" onChange={handleInput} >
                <option value={1} disabled>Select Your Listneners</option> 
        {listeners.map(listner=>(
           <option value={listner._id}>{listner.fullname}</option> 
        ))}
           </select>
    <textarea className="text-area" name="reason" value={appoint.reason} onChange={handleInput}/>
    <input type="submit"  value={"Booked a Appointment"} className="btn"/>
         </form>
</div>
<Footer/>





    </div>
  )
}

export default Appointment
