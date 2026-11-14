// src/Pages/Ger_Comercial/index.jsx
import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';


// Importamos los componentes de otras páginas


import { Ventas } from '../Ventas/Ventas';
import { CobranzaV2 } from '../Cobranza/CobranzaV2';
import { EquiposUnificados } from '../Ger_Comercial/Componentedos/EquiposUnificadosV2';
import { NavBarAdmin } from './Componentes/NavBarAdmin';



export const Admin = () => {
  const location = useLocation();
  const usuario = location.state?.user || JSON.parse(localStorage.getItem('user') || '{}');

  // Estado para controlar qué vista se muestra
  const [vistaActiva, setVistaActiva] = useState('dashboard');

  // Si no hay usuario, redirigir al login
  if (!usuario || !usuario.rol) {
    return <Navigate to="/" replace />;
  }

  // Verificar que el rol sea ger_com
  if (usuario.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Renderizar la vista según la opción seleccionada
  const renderVista = () => {
    switch (vistaActiva) {
      
      case 'ventas':
        return <Ventas mostrarNavbar={false} />;
      case 'cobranza':
        return <CobranzaV2 mostrarNavbar={false} />;
      case 'stock':
        return <EquiposUnificados />;
      default:
        return <CobranzaV2 mostrarNavbar={false} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <NavBarAdmin
        usuario={usuario}
        vistaActiva={vistaActiva}
        onCambiarVista={setVistaActiva}
      />

      {/* Contenido dinámico según vista seleccionada */}
      <div>
        {renderVista()}
      </div>
    </div>
  );




}







