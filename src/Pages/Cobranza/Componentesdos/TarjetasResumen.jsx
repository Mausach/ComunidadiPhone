// Cobranza-v2/Componentes/TarjetasResumen.jsx
import React from 'react';
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';

const formatMoneda = (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v || 0);

export const TarjetasResumen = ({ resumen }) => {
  const { aCobrar = 0, cobrado = 0, vencido = 0, efectividad = 0 } = resumen || {};

  return (
    <Row className="g-3 mb-4">
      {/* A Cobrar */}
      <Col xl={3} lg={6}>
        <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-3">
            <small className="d-block mb-1" style={{ color: COLORS.textoSecundario, fontWeight: '500' }}>
              A cobrar en el mes
            </small>
            <h3 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal }}>
              {formatMoneda(aCobrar)}
            </h3>
            <small style={{ color: COLORS.textoSecundario }}>
              Total esperado del mes
            </small>
          </Card.Body>
        </Card>
      </Col>

      {/* Cobrado */}
      <Col xl={3} lg={6}>
        <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-3">
            <small className="d-block mb-1" style={{ color: COLORS.textoSecundario, fontWeight: '500' }}>
              Cobrado
            </small>
            <h3 className="fw-bold mb-1" style={{ color: COLORS.verde }}>
              {formatMoneda(cobrado)}
            </h3>
            <small style={{ color: COLORS.textoSecundario }}>
              Cuotas pagadas del mes
            </small>
          </Card.Body>
        </Card>
      </Col>

      {/* Vencido */}
      <Col xl={3} lg={6}>
        <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-3">
            <small className="d-block mb-1" style={{ color: COLORS.textoSecundario, fontWeight: '500' }}>
              Vencido sin cobrar
            </small>
            <h3 className="fw-bold mb-1" style={{ color: COLORS.rojo }}>
              {formatMoneda(vencido)}
            </h3>
            <small style={{ color: COLORS.textoSecundario }}>
              Cuotas con recargos
            </small>
          </Card.Body>
        </Card>
      </Col>

      {/* Efectividad */}
      <Col xl={3} lg={6}>
        <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-3">
            <small className="d-block mb-1" style={{ color: COLORS.textoSecundario, fontWeight: '500' }}>
              Efectividad
            </small>
            <h3 className="fw-bold mb-2" style={{ color: COLORS.ambar }}>
              {efectividad}%
            </h3>
            <ProgressBar 
              now={efectividad} 
              style={{ height: '6px', backgroundColor: COLORS.bordes }}
              variant="warning"
            />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};