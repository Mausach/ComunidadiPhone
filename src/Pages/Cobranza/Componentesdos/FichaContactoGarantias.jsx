// Cobranza-v2/Componentesdos/FichaContactoGarantias.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';

export const FichaContactoGarantias = ({ venta }) => {
  const c = venta.cliente || {};
  return (
    <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '12px', backgroundColor: COLORS.cardBg }}>
      <Card.Body className="p-4">
        <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal }}>Contacto y garantías</h6>
        <div className="d-flex flex-column gap-2 small" style={{ color: COLORS.textoSecundario }}>
          <div className="d-flex justify-content-between"><span>Celular</span><span className="fw-semibold text-end">{c.telefono || '-'}</span></div>
          <div className="d-flex justify-content-between"><span>Alternativo</span><span className="fw-semibold text-end">{c.telefono2 || '-'}</span></div>
          <div className="d-flex justify-content-between"><span>Garante</span><span className="fw-semibold text-end">{venta.garante?.nombre || '-'}</span></div>
          <div className="d-flex justify-content-between"><span>Celular garante</span><span className="fw-semibold text-end">{venta.garante?.telefono || '-'}</span></div>
          <div className="d-flex justify-content-between"><span>Celulock</span><span className="fw-semibold text-end">{venta.celulock || '-'}</span></div>
        </div>
      </Card.Body>
    </Card>
  );
};