// Ventas/Componentes/ResumenVenta.jsx
import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { COLORS } from '../../Cobranza/Helperss/colors';

const formatMonto = (m) => `$${Number(m || 0).toLocaleString('es-AR')}`;

export const ResumenVenta = ({ formData, clienteData, calcularMontoTotal }) => {
  const tiposLabel = {
    contado: 'Contado',
    sistema1: 'Sistema 1',
    sistema2: 'Sistema 2',
    plan_canje: 'Plan Canje',
    plan_canje_cuotas: 'Canje + Cuotas'
  };

  return (
    <Card className="border-0 shadow-sm sticky-top" style={{ borderRadius: '12px', backgroundColor: COLORS.bgGeneral, top: '1rem' }}>
      <Card.Body className="p-3">
        <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal, fontSize: '0.85rem' }}>
          <i className="bi bi-clipboard-data me-2"></i>Resumen
        </h6>
        <div className="d-flex flex-column gap-2 small" style={{ color: COLORS.textoSecundario }}>
          <div><strong>Cliente:</strong> {clienteData?.nombre} {clienteData?.apellido}</div>
          <div><strong>DNI:</strong> {clienteData?.dni}</div>
          <div><strong>Tipo:</strong> {tiposLabel[formData.tipoVenta] || formData.tipoVenta}</div>
          <div><strong>Localidad:</strong> {formData.localidad || '-'}</div>
          <div><strong>Producto:</strong> {formData.producto.nombre || '-'}</div>
          {formData.equipoCanje?.nombre && (
            <div><strong>Canje:</strong> {formData.equipoCanje.nombre} ({formatMonto(formData.equipoCanje.valorTasado)})</div>
          )}
          {(formData.montoCuota > 0 && formData.cantidadCuotas > 0) && (
            <div><strong>Cuotas:</strong> {formData.cantidadCuotas} × {formatMonto(formData.montoCuota)}</div>
          )}
        </div>
        <hr style={{ borderColor: COLORS.bordes }} />
        <div className="d-flex justify-content-between align-items-center">
          <small style={{ color: COLORS.textoSecundario }}>Monto Total</small>
          <h5 className="fw-bold mb-0" style={{ color: COLORS.verde }}>
            {formatMonto(calcularMontoTotal ? calcularMontoTotal(formData) : 0)}
          </h5>
        </div>
      </Card.Body>
    </Card>
  );
};