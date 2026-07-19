// src/Pages/Ger_Comercial/index.jsx
import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';


// Importamos los componentes de otras páginas

import { NavBarGC } from './Componentes/NavBarGC';
import { Ventas } from '../Ventas/Ventas';
import { Cobranza } from '../Cobranza/Cobranza';
import { EquiposCanjeados } from '../Ceo/Componentes/EquiposCanjeados';


// Placeholders para lo que falta crear
const Reportes = () => (
  <div className="p-4">
    <h3>Reportes</h3>
    <p>Sección de reportes - En desarrollo</p>
  </div>
);

const DashboardGerCom = ({ usuario }) => (
  <div className="p-4">
    <h3>Dashboard Gerencia Comercial</h3>
    <p>Bienvenido, {usuario?.nombre}</p>
  </div>
);

export const Ger_Comercial = () => {
  const location = useLocation();
  const usuario = location.state?.user || JSON.parse(localStorage.getItem('user') || '{}');
  
  // Estado para controlar qué vista se muestra
  const [vistaActiva, setVistaActiva] = useState('dashboard');

  // Si no hay usuario, redirigir al login
  if (!usuario || !usuario.rol) {
    return <Navigate to="/" replace />;
  }

  // Verificar que el rol sea ger_com
  if (usuario.rol !== 'ger_com') {
    return <Navigate to="/" replace />;
  }

  // Renderizar la vista según la opción seleccionada
  const renderVista = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return <DashboardGerCom usuario={usuario} />;
      case 'ventas':
        return <Ventas mostrarNavbar={false} />;
      case 'cobranza':
        return <Cobranza />;
      case 'reportes':
        return <Reportes />;
      case 'equipos-canjeados':
        return <EquiposCanjeados />;
      default:
        return <DashboardGerCom usuario={usuario} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <NavBarGC
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
};
