// Cobranza/Componentes/ModalAgregarRecargo.jsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Row, Col, Button, Alert, Spinner, Badge 
} from 'react-bootstrap';
import { agregarRecargoCuota } from '../Helpers/AgregarRecargoCuota';


export const ModalAgregarRecargo = ({ 
  show, onHide, venta, cuota, onSuccess, usuario 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    montoRecargo: '',
    motivo: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });

  useEffect(() => {
    if (show && cuota) {
      setFormData({ montoRecargo: '', motivo: '' });
    }
  }, [show, cuota]);

  const showAlert = (message, variant = 'danger') => {
    if (!message) { setAlert({ show: false, message: '', variant: 'danger' }); return; }
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (alert.show) setAlert({ show: false, message: '', variant: 'danger' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const monto = parseFloat(formData.montoRecargo);
    if (!monto || monto <= 0) { showAlert('El monto del recargo debe ser mayor a 0', 'warning'); return; }
    if (!formData.motivo.trim()) { showAlert('El motivo del recargo es obligatorio', 'warning'); return; }

    setLoading(true);
    try {
      const result = await agregarRecargoCuota({
        idVenta: venta._id,
        numeroCuota: cuota.numeroCuota,
        montoRecargo: monto,
        motivo: formData.motivo,
        porcentajeAplicado: porcentajeNuevoRecargo,
        usuario: { nombre: usuario?.user?.nombre + ' ' + usuario?.user?.apellido || 'Sistema' }
      });

      showAlert(result.message || 'Recargo agregado exitosamente', 'success');
      setTimeout(() => { onHide(); if (onSuccess) onSuccess(); }, 1500);
    } catch (error) {
      showAlert(error.message || 'Error al agregar el recargo', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const formatMonto = (m) => !m && m !== 0 ? '$0' : `$${m.toLocaleString('es-AR')}`;
  const formatFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Cálculos de recargos
  const totalRecargosActual = cuota?.recargos?.reduce((s, r) => s + r.monto, 0) || 0;
  const nuevoRecargo = parseFloat(formData.montoRecargo) || 0;
  const totalRecargosNuevo = totalRecargosActual + nuevoRecargo;
  const montoBase = cuota?.montoCuota || 0;

  // Porcentajes
  const porcentajeActual = montoBase > 0 ? ((totalRecargosActual / montoBase) * 100).toFixed(1) : 0;
  const porcentajeNuevoRecargo = montoBase > 0 ? ((nuevoRecargo / montoBase) * 100).toFixed(1) : 0;
  const porcentajeTotal = montoBase > 0 ? ((totalRecargosNuevo / montoBase) * 100).toFixed(1) : 0;

  return (
    <Modal show={show} onHide={onHide} size="md" centered className="recargo-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-percent me-2" style={{ color: '#dc3545' }}></i>
          Agregar Recargo
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* Resumen de la cuota */}
        {cuota && (
          <div className="bg-light rounded-3 p-3 mb-3">
            <Row>
              <Col md={4}><div className="text-muted small">Cuota</div><div className="fw-semibold">#{cuota.numeroCuota}</div></Col>
              <Col md={4}><div className="text-muted small">Monto base</div><div className="fw-semibold">{formatMonto(montoBase)}</div></Col>
              <Col md={4}>
                <div className="text-muted small">Recargos acumulados</div>
                <div className={`fw-semibold ${totalRecargosActual > 0 ? 'text-danger' : 'text-muted'}`}>
                  {totalRecargosActual > 0 ? (
                    <>{formatMonto(totalRecargosActual)} <small>({porcentajeActual}%)</small></>
                  ) : 'Sin recargos'}
                </div>
              </Col>
              <Col md={12} className="mt-2">
                <div className="text-muted small">Total a pagar</div>
                <div className="fw-semibold">{formatMonto(montoBase + totalRecargosActual)}</div>
              </Col>
              <Col md={12} className="mt-2"><div className="text-muted small">Vencimiento</div><div className="fw-semibold">{formatFecha(cuota.fechaCobro)}</div></Col>
            </Row>

            {/* Historial de recargos */}
            {cuota.recargos && cuota.recargos.length > 0 && (
              <div className="mt-2 pt-2 border-top">
                <small className="text-muted fw-semibold">Historial ({cuota.recargos.length}):</small>
                {cuota.recargos.map((r, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center small mt-1">
                    <span><Badge bg="danger" className="me-1">+{formatMonto(r.monto)}</Badge>{r.motivo}</span>
                    <span className="text-muted">{formatFecha(r.fecha)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alertas */}
        {alert.show && (
          <Alert variant={alert.variant} className="d-flex align-items-center rounded-3 border-0 shadow-sm mb-3"
            style={{ padding: '10px 14px', fontSize: '0.9rem', animation: 'fadeIn 0.3s ease' }}>
            <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'x-circle'} me-2`}></i>
            <span className="flex-grow-1">{alert.message}</span>
            <Button variant="link" className="p-0 ms-2 text-decoration-none" style={{ color: 'inherit', opacity: 0.7 }}
              onClick={() => setAlert({ show: false, message: '', variant: 'danger' })}><i className="bi bi-x-circle"></i></Button>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Monto del recargo */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Monto del recargo ($) <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control type="number" name="montoRecargo" value={formData.montoRecargo} onChange={handleChange}
              placeholder="Ingresá el monto del recargo" className="rounded-3" disabled={loading} min={1} step="any" />
          </Form.Group>

          {/* Previsualización con porcentajes */}
          {nuevoRecargo > 0 && (
            <div className="bg-light rounded-3 p-3 mb-3">
              <Row className="text-center small">
                <Col xs={4}>
                  <div className="text-muted">Recargos actuales</div>
                  <div className="fw-semibold text-danger">{formatMonto(totalRecargosActual)}</div>
                  <small className="text-muted">{porcentajeActual}% del monto</small>
                </Col>
                <Col xs={4}>
                  <div className="text-muted">Nuevo recargo</div>
                  <div className="fw-semibold text-danger">+{formatMonto(nuevoRecargo)}</div>
                  <small className="text-muted">{porcentajeNuevoRecargo}% del monto</small>
                </Col>
                <Col xs={4}>
                  <div className="text-muted">Total acumulado</div>
                  <div className="fw-semibold text-primary">{formatMonto(totalRecargosNuevo)}</div>
                  <Badge bg={porcentajeTotal > 20 ? 'danger' : porcentajeTotal > 10 ? 'warning' : 'info'}>
                    {porcentajeTotal}% del monto
                  </Badge>
                </Col>
              </Row>
            </div>
          )}

          {/* Motivo */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-sticky me-1"></i>Motivo <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control as="textarea" name="motivo" rows={2} value={formData.motivo} onChange={handleChange}
              placeholder="Ej: Recargo por 15 días de atraso..." className="rounded-3" disabled={loading} />
          </Form.Group>

          {/* Botones */}
          <div className="d-flex gap-2 justify-content-end pt-3 mt-3 border-top">
            <Button variant="secondary" onClick={onHide} className="rounded-3" disabled={loading}>
              <i className="bi bi-x-circle me-1"></i>Cancelar
            </Button>
            <Button variant="primary" type="submit" className="rounded-3 px-4"
              style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', fontWeight: '500' }}
              disabled={loading || !formData.montoRecargo || !formData.motivo.trim()}>
              {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-plus-circle me-2"></i>Agregar Recargo</>}
            </Button>
          </div>
        </Form>
      </Modal.Body>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .recargo-modal .modal-dialog { max-width: 550px; }
        .recargo-modal .modal-content { border-radius: 16px; overflow: hidden; }
        .recargo-modal .modal-body { padding: 1.5rem; }
        @media (max-width: 768px) { .recargo-modal .modal-dialog { max-width: 100%; margin: 1rem; } }
      `}</style>
    </Modal>
  );
};