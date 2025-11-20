import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';


const ProtectedRoutes = () => {
 var userlogined = JSON.parse(sessionStorage.getItem("userLogined"));
   
 return userlogined ?<Outlet/>:<Navigate to={'/login'}></Navigate>
}

export default ProtectedRoutes
