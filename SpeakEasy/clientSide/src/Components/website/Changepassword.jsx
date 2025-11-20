import React, { useState } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import axios from "axios";
import { toast } from "react-toastify";

const Changepassword = () => {
  var [error, SetError] = useState({
    password: "",
    comfirm_password: "",
  });
  var [password_Data, SetPassword] = useState({
    password: "",
    comfirm_password: "",
  });
  var passwordInputHandle = (e) => {
    SetPassword({ ...password_Data, [e.target.name]: e.target.value });
  };
  var updatePassword = (e) => {
    const token = sessionStorage.getItem("userLogined");
    const tokenParts = token.split(".");
    const payload = JSON.parse(atob(tokenParts[1]));
    const id = payload.id;

    e.preventDefault();
    var newError = {
      password: "",
      comfirm_password: "",
    };
    if (!password_Data.password.trim()) {
      newError.password = "password is required**";
    }
    if (!password_Data.comfirm_password.trim()) {
      newError.comfirm_password = "comfirm password is required**";
    } else if (password_Data.password != password_Data.comfirm_password) {
      newError.comfirm_password = "comfirm password is incorrect**";
    }
    if (newError.password || newError.comfirm_password) {
      SetError(newError);
    } else {
        alert("accc")
        console.log(id)
         console.log(password_Data.comfirm_password)
        console.log(password_Data.password)
      SetError({
        password: "",
        comfirm_password: "",
      });

      axios.put(`http://localhost:5000/update-Password/${id}`, password_Data);

      toast.success("your password is updated now !");
      SetPassword({
        password: "",
        comfirm_password: "",
      });
    }
  };
  return (
    <>
      <Nav />
      <section id="bannarSec">
        <div id="overlay">
          <div className="container">
            <h3>Change Password</h3>
          </div>
        </div>
      </section>
      <div className="container change-passBox">
        <div className="containerChild">
          <h3> Update Password</h3>
          <div className="blankDiv"></div>
          <form onSubmit={updatePassword}>
            <input
              type="password"
              onChange={passwordInputHandle}
              value={password_Data.password}
              name="password"
              placeholder="password"
            />

            {error.password && (
              <span className="text-danger">{error.password}</span>
            )}
            <input
              type="password"
              name="comfirm_password"
              placeholder="comfirm password"
              value={password_Data.comfirm_password}
              onChange={passwordInputHandle}
            />
            {error.comfirm_password && (
              <span className="text-danger">{error.comfirm_password}</span>
            )}

            <button className="btn">Update Password</button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Changepassword;
