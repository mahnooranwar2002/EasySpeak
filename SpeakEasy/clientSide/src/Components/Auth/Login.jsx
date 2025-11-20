import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  var navigate = useNavigate();
  const [loginedUser, setLoginedUser] = useState({
    email: "",
    password: "",
  });
  const [errorlogined, setErrorlogined] = useState({
    email: "",
    password: "",
  });

  const logined = async (e) => {
    e.preventDefault();
    const newError = {
      email: "",
      password: "",
    };

    if (!loginedUser.email.trim()) {
      newError.email = "Email is required **";
    } else if (validateEmail(loginedUser.email)) {
      newError.email = "Invalid email address **";
    }

    if (!loginedUser.password.trim()) {
      newError.password = "Password is required **";
    }

    if (newError.email || newError.password) {
      setErrorlogined(newError);
      console.log(newError);
    } else {
      setErrorlogined({
        email: "",
        password: "",
      });

      try {
        const response = await axios.post(
          "http://localhost:5000/login",
          loginedUser
        );

        if (response.data.success) {
          if (response.data.role === "admin") {
            navigate("/admin/dashboard");
            sessionStorage.setItem(
              "adminlogined",
              JSON.stringify(response.data.token)
            );
          } else if (response.data.role === "seeker") {
            navigate("/");

            sessionStorage.setItem(
              "userLogined",
              JSON.stringify(response.data.token)
            );
          } else {
            navigate("/listener/Dashboard");

            sessionStorage.setItem(
              "listenerLogined",
              JSON.stringify(response.data.token)
            );
          }
        } else {
          toast.error(response.data.message);
          // console.log(response.data);
        }
      } catch (error) {
        toast.error("An error occurred");
      }
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return !emailRegex.test(email);
  };

  const inputHandle = (e) => {
    setLoginedUser({ ...loginedUser, [e.target.name]: e.target.value });
  };

  return (
    <div className="loginbox">
      <div className="overlay">
        <div className="box" id="logBox">
          <h3>Sign In</h3>
          <p>Welcome Back! Sign In Here</p>
          <form onSubmit={logined}>
            <input
              type="text"
              placeholder="Enter Email"
              value={loginedUser.email}
              onChange={inputHandle}
              name="email"
            />
            {errorlogined.email && (
              <div style={{ color: "red" }} className="error">
                {errorlogined.email}
              </div>
            )}
            <input
              type="password"
              placeholder="Enter Password"
              value={loginedUser.password}
              onChange={inputHandle}
              name="password"
            />
            {errorlogined.password && (
              <div style={{ color: "red" }} className="error">
                {errorlogined.password}
              </div>
            )}
            <input type="submit" value="Login" className="btn" />
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

export default Login;
