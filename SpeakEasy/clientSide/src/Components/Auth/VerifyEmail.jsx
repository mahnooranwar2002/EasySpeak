import axios from "axios";
import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const VerifyEmail = () => {
  const [VerifyAccount, setVerifyAccount] = useState({
    email: "",
    verifyOpt: "",
  });
  var inputHandle = (e) => {
    setVerifyAccount({ ...VerifyAccount, [e.target.name]: e.target.value });
  };
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const [error, SetError] = useState({
    email: "",
    verifyOpt: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      verifyOpt: "",
      email: "",
    };
    if (!VerifyAccount.email || !validateEmail(VerifyAccount.email)) {
      newErrors.email = "Email is required and must be a valid email address.";
    }
    if (!VerifyAccount.verifyOpt) {
      newErrors.verifyOpt = "Verify Opt is required !";
    }
    if (newErrors.email || newErrors.verifyOpt) {
      SetError(newErrors);
    } else {
      var response = await axios.post(
        "http://localhost:5000/verify_Account",
        VerifyAccount
      );
 console.log(response.data.message)
       if (response.data.success) {
           toast.success(response.data.message);
         SetError({
           verifyOpt:"",
             email: "",

           });
           setVerifyAccount({
               verifyOpt:"",
             email: "",

           })
         } else {
           toast.error(response.data.message, {
             position: "top-right",
           });
         }
    }
  };
  return (
    <div>
      <div className="loginbox">
        <div className="overlay">
          <div className="box" id="emailVerify">
            <h3>Verify Email</h3>
            <p>Complete your registration by verifying your email</p>
            <form onSubmit={handleSubmit} autoComplete="off">
              <input
                type="text"
                placeholder="Enter Email"
                name="email"
                value={VerifyAccount.email}
                onChange={inputHandle}
              />
              {error.email && (
                <div className="error" style={{ color: "red" }}>
                  {error.email}
                </div>
              )}
              <input
                type="text"
                placeholder="Enter Opt"
                name="verifyOpt"
                value={VerifyAccount.verifyOpt}
                onChange={inputHandle}
              />
              {error.verifyOpt && (
                <div className="error" style={{ color: "red" }}>
                  {error.verifyOpt}
                </div>
              )}
              <input type="submit" value="Verify Email" className="btn" />
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
    </div>
  );
};

export default VerifyEmail;
