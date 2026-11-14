// Cobranza-v2/Componentes/PanelMes.jsx
import React from 'react';
import { Button } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const PanelMes = ({ mesActual, onChangeMes }) => {
  // mesActual viene como "2026-11"
  const [anio, mes] = mesActual.split('-').map(Number);

  const handlePrev = () => {
    const nuevoMes = mes === 1 ? 12 : mes - 1;
    const nuevoAnio = mes === 1 ? anio - 1 : anio;
    onChangeMes(`${nuevoAnio}-${String(nuevoMes).padStart(2, '0')}`);
  };

  const handleNext = () => {
    const nuevoMes = mes === 12 ? 1 : mes + 1;
    const nuevoAnio = mes === 12 ? anio + 1 : anio;
    onChangeMes(`${nuevoAnio}-${String(nuevoMes).padStart(2, '0')}`);
  };

  return (
    <div className="d-flex align-items-center justify-content-between mb-4">
      <div className="d-flex align-items-center gap-3">
        <Button 
          variant="light" 
          onClick={handlePrev}
          className="rounded-circle shadow-sm"
          style={{ width: '40px', height: '40px', border: `1px solid ${COLORS.bordes}` }}
        >
          <i className="bi bi-chevron-left" style={{ color: COLORS.textoPrincipal }}></i>
        </Button>
        
        <h1 className="fw-bold mb-0" style={{ color: COLORS.textoPrincipal, fontSize: '2rem' }}>
          {MESES[mes - 1]} {anio}
        </h1>

        <Button 
          variant="light" 
          onClick={handleNext}
          className="rounded-circle shadow-sm"
          style={{ width: '40px', height: '40px', border: `1px solid ${COLORS.bordes}` }}
        >
          <i className="bi bi-chevron-right" style={{ color: COLORS.textoPrincipal }}></i>
        </Button>
      </div>
    </div>
  );
};