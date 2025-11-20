import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
const AdminprotectedRoutes = () => {
 var userlogined = JSON.parse(sessionStorage.getItem("adminlogined"));
   
 return userlogined ?<Outlet/>:<Navigate to={'/login'}></Navigate>
}

export default AdminprotectedRoutes

