import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
const ListnenerRoutesprotected = () => {
 var userlogined = JSON.parse(sessionStorage.getItem("listenerLogined"));
   
 return userlogined ?<Outlet/>:<Navigate to={'/login'}></Navigate>
}

export default ListnenerRoutesprotected
