// Cobranza-v2/Componentesdos/FichaRiesgoVendedor.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';

export const FichaRiesgoVendedor = ({ venta }) => {
  const r = venta.riesgo || {};
  return (
    <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '12px', backgroundColor: COLORS.cardBg }}>
      <Card.Body className="p-4">
        <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal }}>Riesgo al vender</h6>
        <div className="d-flex flex-column gap-2 small" style={{ color: COLORS.textoSecundario }}>
          <div className="d-flex justify-content-between"><span>Score</span><span className="fw-semibold">{r.score || '-'}</span></div>
          <div className="d-flex justify-content-between"><span>Entrega</span><span className="fw-semibold">{r.entrega || '-'}</span></div>
          <div className="d-flex justify-content-between"><span>Garante</span><span className="fw-semibold">{r.garante || '-'}</span></div>
          <div className="d-flex justify-content-between"><span>Domicilio</span><span className="fw-semibold">{r.domicilio || '-'}</span></div>
          <div className="d-flex justify-content-between"><span>Antigüedad</span><span className="fw-semibold">{r.antiguedad || '-'}</span></div>
        </div>
      </Card.Body>
    </Card>
  );
};