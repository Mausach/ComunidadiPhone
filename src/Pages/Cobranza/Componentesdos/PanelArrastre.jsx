// Cobranza-v2/Componentesdos/PanelArrastre.jsx
import React from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';

const formatMoneda = (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v || 0);

export const PanelPagosDestiempo = ({ data, loading, onVerDetalle }) => {
  if (loading) {
    return (
      <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" size="sm" variant="primary" />
        </Card.Body>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="shadow-sm border-0 mb-3" style={{ borderRadius: '12px' }}>
      <Card.Body className="p-4">
        <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal, fontSize: '0.95rem' }}>
          Pagos a destiempo
        </h6>
        
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small style={{ color: COLORS.textoSecundario }}>Cuotas fuera de término</small>
          <span className="fw-semibold" style={{ color: COLORS.textoPrincipal }}>
            {data.resumen?.cantidadCuotas || 0}
          </span>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <small style={{ color: COLORS.textoSecundario }}>Monto recuperado</small>
          <span className="fw-bold" style={{ color: COLORS.verde }}>
            {formatMoneda(data.resumen?.montoTotal)}
          </span>
        </div>

        <Button 
          variant="link" 
          className="w-100 text-decoration-none fw-semibold p-0 text-start"
          style={{ color: COLORS.azul }}
          onClick={onVerDetalle}
        >
          Ver detalle de cuotas <i className="bi bi-arrow-right ms-1"></i>
        </Button>
      </Card.Body>
    </Card>
  );
};