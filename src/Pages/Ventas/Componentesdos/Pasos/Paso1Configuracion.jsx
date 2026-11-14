// Ventas/Componentes/Pasos/Paso1Configuracion.jsx
import React from 'react';
import { Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { COLORS } from '../../../Cobranza/Helperss/colors';

const TIPOS = [
  { value: 'contado', label: 'Contado' },
  { value: 'sistema1', label: 'Sistema 1 (Con entrega)' },
  { value: 'sistema2', label: 'Sistema 2 (Sin entrega)' },
  { value: 'plan_canje', label: 'Plan Canje' },
  { value: 'plan_canje_cuotas', label: 'Plan Canje + Cuotas' }
];

const LOCALIDADES = ['santiago capital', 'la banda', 'añatuya', 'monte quemado'];

export const Paso1Configuracion = ({ formData, setFormData, isLoading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal, fontSize: '0.95rem' }}>
        <i className="bi bi-gear me-2" style={{ color: COLORS.azul }}></i>Configuración de la Venta
      </h6>
      <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>
                Tipo de Venta <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select name="tipoVenta" value={formData.tipoVenta} onChange={handleChange} className="rounded-3" disabled={isLoading}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>
                Localidad <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select name="localidad" value={formData.localidad} onChange={handleChange} className="rounded-3" disabled={isLoading}>
                <option value="">Seleccioná una localidad</option>
                {LOCALIDADES.map(loc => <option key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>
                <i className="bi bi-calendar me-1"></i>Fecha de la Venta
              </Form.Label>
              <Form.Control type="date" name="fechaRealizada" value={formData.fechaRealizada} onChange={handleChange}
                className="rounded-3" disabled={isLoading} max={new Date().toISOString().split('T')[0]} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>
                <i className="bi bi-calendar-check me-1"></i>Fecha de Entrega
              </Form.Label>
              <Form.Control type="date" name="fechaEntrega" value={formData.fechaEntrega} onChange={handleChange}
                className="rounded-3" disabled={isLoading || formData.tipoVenta === 'sistema2'} />
              {formData.tipoVenta === 'sistema2' && (
                <small style={{ color: COLORS.textoSecundario }}>Calculada automáticamente según cuota de entrega</small>
              )}
            </Form.Group>
          </Col>
        </Row>

        {formData.tipoVenta === 'plan_canje_cuotas' && (
          <Alert variant="info" className="mt-3 mb-0 rounded-3 py-2 px-3" style={{ fontSize: '0.85rem', backgroundColor: COLORS.azulSuave, color: COLORS.azul, border: 'none' }}>
            <i className="bi bi-info-circle me-2"></i>
            <strong>Canje + Cuotas:</strong> El cliente entrega un equipo como parte de pago y abona el resto en cuotas.
          </Alert>
        )}
      </div>
    </div>
  );
};