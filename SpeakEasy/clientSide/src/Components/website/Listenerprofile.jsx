import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import axios from "axios";

const Listenerprofile = () => {
  var { id } = useParams();
  var [data, SetData] = useState({});
  useEffect(() => {
    axios.get(`http://localhost:5000/lister_data/${id}`).then((res) => {
      SetData(res.data);
    });
  });
  const formatDate = (isoString) => {
    if (!isoString) return "N/A";

    try {
      const dateObject = new Date(isoString);
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return dateObject.toLocaleDateString(undefined, options);
    } catch (e) {
      return "Invalid Date";
    }
  };
  return (
    <div>
      <Nav />
      <section id="bannarSec">
        <div id="overlay">
          <div className="container">
            <h3> Listeners Profile </h3>
          </div>
        </div>
      </section>

      <div className="container listenerProfile">
        <div className="right-wrapper">
          <img src={`/profile_url/${data.profile_image}`} alt="" />
        </div>
        <div className="left-wrapper">
          <h3>{data.fullname}</h3>
          <div className="blankDiv"></div>
        <div className="basicinfo">
            {data.joined_at && (
            <p>
              Joined Since:<strong> **{formatDate(data.joined_at)}**</strong>
            </p>
          )}
       <p>{data.category||"acdfg"}</p>

        </div>
        <div className="content-section">
        <h5>Bio</h5>
          <p>{data.about}</p>
          </div>
          <Link to={'/web/appointments'} className="btn">Booked Appointment</Link>
        </div>
      </div>
          
      <Footer />
    </div>
  );
};

export default Listenerprofile;
