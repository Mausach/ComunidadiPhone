

// src/Pages/Ceo/index.jsx

import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { NavBarCeo } from './Componentes/NavbarCeo';
import { ReportesCeo } from './Componentes/ReportesCeo';
import { HistorialCuotas } from './Componentes/HistorialPorCliente';
import { EquiposCanjeados } from './Componentes/EquiposCanjeados';
import { StockEquipos } from './Componentes/StockEquipos';

// Placeholders para las vistas


const DashboardCeo = ({ usuario }) => (
  <div className="p-4">
    <h3>Panel CEO</h3>
    <p>Bienvenido, {usuario?.nombre}</p>
  </div>
);

export const Ceo = () => {
  const location = useLocation();
  const usuario = location.state?.user || JSON.parse(localStorage.getItem('user') || '{}');

  const [vistaActiva, setVistaActiva] = useState('dashboard');

  if (!usuario || !usuario.rol) {
    
    return <Navigate to="/" replace />;
  }

  if (usuario.rol !== 'ceo') {
    
    return <Navigate to="/" replace />;
  }

 

  const renderVista = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return <DashboardCeo usuario={usuario} />;
      case 'reportes':
        return <ReportesCeo />;
      case 'historial-cuotas':
        return <HistorialCuotas />;
      case 'equipos-canjeados':
        return <EquiposCanjeados />;
      case 'stock':
        return <StockEquipos />;

      default:
        return <DashboardCeo usuario={usuario} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <NavBarCeo
        usuario={usuario}
        vistaActiva={vistaActiva}
        onCambiarVista={setVistaActiva}
      />
      <div>
        {renderVista()}
      </div>
    </div>
  );
};