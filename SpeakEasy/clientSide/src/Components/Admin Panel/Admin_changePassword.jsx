import AdminLayout from "./AdminLayout";
import React, { useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";
const Admin_changePassword = () => {
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
    const token = sessionStorage.getItem("adminlogined");
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
     
      console.log(id);
      console.log(password_Data.comfirm_password);
      console.log(password_Data.password);
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
    <div>
      <AdminLayout></AdminLayout>
      <div className="container my-5 d-flex justify-content-center">
        <div
          className="card shadow p-4"
          style={{ maxWidth: "600px", width: "100%" }}
        >
          <h2 className="text-center mb-4">Update Password</h2>

          {/* Profile Image Preview */}

          <form onSubmit={updatePassword}>
            <div className="col-12 mb-3">
              <label className="form-label">New Password</label>
              <input
                className="form-control"
                type="password"
                onChange={passwordInputHandle}
                value={password_Data.password}
                name="password"
                placeholder="password"
              />
              {error.password && (
                <span className="text-danger">{error.password}</span>
              )}
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Comfirm Password</label>
              <input
                className="form-control"
                type="password"
                onChange={passwordInputHandle}
                value={password_Data.comfirm_password}
                name="comfirm_password"
                placeholder="comfirm password"
              />
              {error.comfirm_password && (
                <span className="text-danger">{error.comfirm_password}</span>
              )}
            </div>

            <div className="col-12 d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin_changePassword;
