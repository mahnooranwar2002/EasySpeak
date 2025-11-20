import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";

function Listeners() {
  const [listeners, setListeners] = useState([]);
  const [blockedSessions, setBlockedSessions] = useState([]); // ✅ track blocked listeners
  const navigate = useNavigate();
  const seekerId = localStorage.getItem("userId");
    const fetchListeners = async () => {
      try {
        const res = await axios.get("http://localhost:5000/listeners");
        setListeners(res.data);
      } catch (err) {
        console.error("Error fetching listeners:", err);
      }
    };

      var [categories, SetCategaries] = useState([]);
  var fetch_data = () => {
    axios.get("http://localhost:5000/active_Category").then((resp) => {
      SetCategaries(resp.data);
    });
  };

  useEffect(() => {
fetch_data();

//     const fetchSessions = async () => {
//   try {
//     const res = await axios.get(
//       `http://localhost:5000/sessions/seeker/${seekerId}`
//     );

//     // ✅ Only block if seeker was the one who blocked
//     const blocked = res.data
//       .filter((s) => s.isBlocked && s.blockedBy === seekerId)
//       .map((s) => s.listener_id._id);

//     setBlockedSessions(blocked);
//   } catch (err) {
//     console.error("Error fetching sessions:", err);
//   }
// };


    fetchListeners();

  }, [seekerId]);

  // const handleStartChat = async (listenerId) => {
  //   if (blockedSessions.includes(listenerId)) {
  //     alert("🚫 You blocked this listener. Cannot start chat.");
  //     return;
  //   }

  //   try {
  //     // 1. Create or fetch session
  //     const res = await axios.post("http://localhost:5000/chat/session", {
  //       seeker_id: seekerId,
  //       listener_id: listenerId,
  //     });

  //     const sessionId = res.data._id;
  //     // 2. Navigate to Chat.jsx
  //     navigate(`/chat/${sessionId}`);
  //   } catch (err) {
  //     console.error("Error starting chat:", err);
  //   }
  // };
var categoryWise=(category)=>{
	axios.get(`http://localhost:5000/Categorywise/${category}`).then((res)=>{
	setListeners	(res.data);
		
	})
}
  return (
    <>
      <Nav />
   
       <section id="bannarSec">
        <div id="overlay">
          <div className="container">
              <h3>Listeners </h3>
          </div>
        </div>
      </section>
      <div className="container categoryBox">
        {categories.length==0?(  
           <div className="container errorbox">
          <h2>No category is Available Now</h2>
        </div>):(
        <ul>
          <li onClick={()=>fetchListeners()}>All</li>
          {
            categories.map((m)=>(
               <li onClick={()=>categoryWise(m.name)}>{m.name}</li> 
            ))
          }
        </ul>
        )}
      </div>
      {listeners.length===0?(
        <div className="container errorbox">
          <h2>No listener is Available Now</h2>
        </div>
      ):(
      <div className="container listen-sec">
      
        
          {listeners.map((listener) => {
 
            return (
          <div className="card">
         <div>
                  {listener.profile_image ? (
                    <img
                      src={`/profile_url/${listener.profile_image}`}
                      alt={listener.fullname}
                      
                    />
                  ) : (
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: "#007bff",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "20px",
                      }}
                    >
                      {(listener.nickname || listener.fullname || "?")[0].toUpperCase()}
                    </div>
                  )}

                  <div className="card-content">
                    <strong>{listener.nickname || listener.fullname}</strong>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>
                      {listener.email}
                    </p>
                  </div>
                </div>

          
                 <Link className="btn" to={`/listners/${listener._id}`}>View Profile</Link>
           

          </div>
            );
          })}
      
      </div>
      )}
      <Footer />
    </>
  );
}

export default Listeners;
