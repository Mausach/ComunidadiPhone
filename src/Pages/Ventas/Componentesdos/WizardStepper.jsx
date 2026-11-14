// Ventas/Componentes/WizardStepper.jsx
import React from 'react';
import { COLORS } from '../../Cobranza/Helperss/colors';


export const WizardStepper = ({ pasos, pasoActual }) => (
  <div className="d-flex justify-content-center align-items-center gap-2 mb-4 flex-wrap">
    {pasos.map((paso, i) => {
      const activo = i === pasoActual;
      const completado = i < pasoActual;
      return (
        <React.Fragment key={paso.label}>
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
              style={{
                width: 32, height: 32,
                backgroundColor: completado ? COLORS.verde : activo ? COLORS.azul : COLORS.bordes,
                color: activo || completado ? '#fff' : COLORS.textoSecundario,
                fontSize: '0.85rem',
                transition: 'all 0.3s'
              }}
            >
              {completado ? <i className="bi bi-check"></i> : i + 1}
            </div>
            <span className="small fw-semibold" style={{ color: activo ? COLORS.azul : COLORS.textoSecundario }}>
              {paso.label}
            </span>
          </div>
          {i < pasos.length - 1 && (
            <div style={{ width: 40, height: 2, backgroundColor: completado ? COLORS.verde : COLORS.bordes }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);