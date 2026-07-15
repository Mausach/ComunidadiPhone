import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

export const Admin = () => {
  const location = useLocation();
  const usuario = location.state;
  console.log(usuario)
  const navigate = useNavigate();

  return (
    <div>Admin </div>
  )
}
