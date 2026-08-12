// Cobranza/Componentes/ModalRecargoCuota.jsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Row, Col, Button, Alert, Spinner, Badge 
} from 'react-bootstrap';
import { editarRecargoCuota } from '../Helpers/EditarRecargo';


export const ModalRecargoCuota = ({ 
  show, 
  onHide, 
  venta, 
  cuota, 
  onSuccess,
  usuario 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nuevoMontoRecargo: '',
    motivo: ''
  });
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'danger'
  });

  // ==========================================
  // INICIALIZAR FORMULARIO
  // ==========================================
  useEffect(() => {
    if (show && cuota) {
      setFormData({
        nuevoMontoRecargo: cuota.recargo?.monto || '',
        motivo: ''
      });
    }
  }, [show, cuota]);

  // ==========================================
  // MANEJADORES
  // ==========================================
  const showAlert = (message, variant = 'danger') => {
    if (!message) {
      setAlert({ show: false, message: '', variant: 'danger' });
      return;
    }
    setAlert({ show: true, message, variant });
    setTimeout(() => {
      setAlert({ show: false, message: '', variant: 'danger' });
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (alert.show) setAlert({ show: false, message: '', variant: 'danger' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const monto = parseFloat(formData.nuevoMontoRecargo);
    if (isNaN(monto) || monto < 0) {
      showAlert('El recargo debe ser 0 o mayor', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await editarRecargoCuota({
        idVenta: venta._id,
        numeroCuota: cuota.numeroCuota,
        nuevoMontoRecargo: monto,
        usuario: {
          nombre: usuario?.user?.nombre + ' ' + usuario?.user?.apellido || 'Sistema'
        },
        motivo: formData.motivo || (monto === 0 ? 'Recargo eliminado' : 'Recargo por mora')
      });

      showAlert(result.message || 'Recargo actualizado exitosamente', 'success');

      setTimeout(() => {
        onHide();
        if (onSuccess) onSuccess();
      }, 1500);

    } catch (error) {
      showAlert(error.message || 'Error al actualizar el recargo', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================
  const formatMonto = (monto) => {
    if (!monto && monto !== 0) return '$0';
    return `$${monto.toLocaleString('es-AR')}`;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const tieneRecargo = cuota?.recargo?.monto > 0;

  return (
    <Modal show={show} onHide={onHide} size="md" centered className="recargo-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className={`bi ${tieneRecargo ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`} style={{ color: '#dc3545' }}></i>
          {tieneRecargo ? 'Editar Recargo' : 'Agregar Recargo'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* Resumen de la cuota */}
        {cuota && (
          <div className="bg-light rounded-3 p-3 mb-3">
            <Row>
              <Col md={4}>
                <div className="text-muted small">Cuota</div>
                <div className="fw-semibold">#{cuota.numeroCuota}</div>
              </Col>
              <Col md={4}>
                <div className="text-muted small">Monto base</div>
                <div className="fw-semibold">{formatMonto(cuota.montoCuota)}</div>
              </Col>
              <Col md={4}>
                <div className="text-muted small">Recargo actual</div>
                <div className={`fw-semibold ${tieneRecargo ? 'text-danger' : 'text-muted'}`}>
                  {tieneRecargo ? formatMonto(cuota.recargo.monto) : 'Sin recargo'}
                </div>
              </Col>
              <Col md={12} className="mt-2">
                <div className="text-muted small">Total a pagar</div>
                <div className="fw-semibold">
                  {formatMonto(cuota.montoCuota + (cuota.recargo?.monto || 0))}
                </div>
              </Col>
              <Col md={12} className="mt-2">
                <div className="text-muted small">Fecha de cobro</div>
                <div className="fw-semibold">{formatFecha(cuota.fechaCobro)}</div>
              </Col>
            </Row>
          </div>
        )}

        {/* Alertas */}
        {alert.show && (
          <Alert variant={alert.variant}
            className="d-flex align-items-center rounded-3 border-0 shadow-sm mb-3"
            style={{ padding: '10px 14px', fontSize: '0.9rem', animation: 'fadeIn 0.3s ease' }}>
            <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'x-circle'} me-2`}></i>
            <span className="flex-grow-1">{alert.message}</span>
            <Button variant="link" className="p-0 ms-2 text-decoration-none" style={{ color: 'inherit', opacity: 0.7 }}
              onClick={() => setAlert({ show: false, message: '', variant: 'danger' })}>
              <i className="bi bi-x-circle"></i>
            </Button>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* Monto del recargo */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Monto del recargo ($) <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              name="nuevoMontoRecargo"
              value={formData.nuevoMontoRecargo}
              onChange={handleChange}
              placeholder="0 = sin recargo"
              className="rounded-3"
              disabled={loading}
              min={0}
              step="any"
            />
            <Form.Text className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              Poné 0 para eliminar el recargo. El recargo se suma al monto base de la cuota.
            </Form.Text>
          </Form.Group>

          {/* Previsualización */}
          {formData.nuevoMontoRecargo !== '' && parseFloat(formData.nuevoMontoRecargo) >= 0 && (
            <div className="bg-light rounded-3 p-2 mb-3">
              <Row className="text-center small">
                <Col>
                  <div className="text-muted">Monto base</div>
                  <div className="fw-semibold">{formatMonto(cuota?.montoCuota)}</div>
                </Col>
                <Col>
                  <div className="text-muted">Recargo</div>
                  <div className={`fw-semibold ${parseFloat(formData.nuevoMontoRecargo) > 0 ? 'text-danger' : 'text-success'}`}>
                    {parseFloat(formData.nuevoMontoRecargo) > 0 ? '+' : ''}{formatMonto(parseFloat(formData.nuevoMontoRecargo))}
                  </div>
                </Col>
                <Col>
                  <div className="text-muted">Total a pagar</div>
                  <div className="fw-semibold text-primary">
                    {formatMonto((cuota?.montoCuota || 0) + parseFloat(formData.nuevoMontoRecargo || 0))}
                  </div>
                </Col>
              </Row>
              {parseFloat(formData.nuevoMontoRecargo) === 0 && cuota?.recargo?.monto > 0 && (
                <div className="text-center mt-2">
                  <Badge bg="warning" text="dark">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Se eliminará el recargo actual de {formatMonto(cuota.recargo.monto)}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Motivo */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-sticky me-1"></i>
              Motivo (opcional)
            </Form.Label>
            <Form.Control
              as="textarea"
              name="motivo"
              rows={2}
              value={formData.motivo}
              onChange={handleChange}
              placeholder={parseFloat(formData.nuevoMontoRecargo) === 0 ? 'Ej: Cliente regularizó su situación...' : 'Ej: Recargo por 15 días de atraso...'}
              className="rounded-3"
              disabled={loading}
            />
          </Form.Group>

          {/* Botones */}
          <div className="d-flex gap-2 justify-content-end pt-3 mt-3 border-top">
            <Button variant="secondary" onClick={onHide} className="rounded-3" disabled={loading}>
              <i className="bi bi-x-circle me-1"></i>Cancelar
            </Button>
            <Button variant="primary" type="submit" className="rounded-3 px-4"
              style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', fontWeight: '500' }}
              disabled={loading}>
              {loading ? (
                <><Spinner as="span" animation="border" size="sm" className="me-2" />Guardando...</>
              ) : (
                <><i className="bi bi-check-circle me-2"></i>Guardar Recargo</>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .recargo-modal .modal-dialog { max-width: 550px; }
        .recargo-modal .modal-content { border-radius: 16px; overflow: hidden; }
        .recargo-modal .modal-body { padding: 1.5rem; }
        @media (max-width: 768px) {
          .recargo-modal .modal-dialog { max-width: 100%; margin: 1rem; }
        }
      `}</style>
    </Modal>
  );
};