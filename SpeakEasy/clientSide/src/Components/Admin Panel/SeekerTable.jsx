import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "./AdminLayout";

const SeekerTable = () => {
          const [data, setdata] = useState([]);
    const [query, setQuery] = useState("");
    
    const fetchdata = async () => {
      try {
        const response = await axios.get("http://localhost:5000/admin-seekers");
        setdata(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    
    const handleDelete = async (id) => {
      try {
        await axios.delete(`http://localhost:5000/user_del/${id}`);
        toast.error("The Faq is deleted now!", {
          position: "top-right",
        });
      } catch (error) {
        console.error(error);
      }
    };
    
    const searchdata = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/search_seeker/search?q=${query}`);
        setdata(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    
    useEffect(() => {
      if (query.length !== 0) {
        searchdata();
      } else {
        fetchdata();
      }
    },);
      function Statushandle(id) {
    axios.put(`http://localhost:5000/status-user/${id}`).then(() => {
      toast.success("The user status is upated now ", {
        position: "top-right",
      });
    });
  }
  return (
      <div>
     <AdminLayout/>
      <div className="users-container" style={{ marginLeft: "20%" }}>
        <div className="users-header">
          <h2>Seeker list</h2>
          <div>
            <input
              type="text"
              placeholder="Search data..."
              className="search-input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
            />
           
          
          </div>
        </div>

        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>email</th>
                <th>Satus</th>

                <th className="action-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((cat, index) => (
                  <tr key={cat.id}>
                    <td>{index + 1}</td>
                    <td>{cat.fullname}</td>
                    <td>{cat.email}</td>
                    <td>{cat.status==1?("Activate"):("Deactivate")}</td>
                    <td>
                     
    <button
                        className="btn btn-delete btn-warning text-white"
                        onClick={() => {
                          Statushandle(cat._id);
                        }}
                      >
                        Status
                      </button>
                      <button
                        className="btn btn-delete btn-danger"
                        onClick={() => {
                          handleDelete(cat._id);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No data found for {query}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SeekerTable
