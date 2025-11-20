import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "./Nav";
import Footer from "./Footer";
import EditProfileForm from "./EditProfileForm";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);


const token = sessionStorage.getItem('userLogined');

useEffect(() => {
  if (token) {
    const tokenParts = token.split(".");
    const payload = JSON.parse(atob(tokenParts[1]));
    const id = payload.id;
    const role = payload.role;

    axios.get(`http://localhost:5000/profile/${id}`).then((res) => {
      setUser(res.data);
    });


  }
},[]);



  return (
    <>
      <Nav />
       <section id="bannarSec">
        <div id="overlay">
          <div className="container">
              <h3>Profile</h3>
          </div>
        </div>
      </section>
      <div className="container userProfilecon">
        <div className="profileBox">
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6">
        <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md text-center">
          {/* Avatar */}
 
  <img
    src={`/profile_url/${user?.profile_image}`}
    alt="Profile"
    className="w-32 h-32 aspect-square mx-auto rounded-full border-4 border-blue-500 object-cover shadow-md"
  />





          {/* Info */}
          <h2 >{user?.fullname}</h2>
       
          <h3>
            Email: {user?.email}
          </h3>
          <h3 >
            Joined: {new Date(user?.joined_at).toLocaleDateString()}
          </h3>

          {/* Edit Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowEditForm(true)}
              className="editBtn"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
        </div>
      </div>

      {showEditForm && (
  <EditProfileForm
    user={user}
    onClose={() => setShowEditForm(false)}
    onUpdate={(updatedUser) => setUser(updatedUser)}
  />
)}


      <Footer />
    </>
  );
};

export default ProfilePage;
