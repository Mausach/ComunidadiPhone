// Cobranza/Componentes/ModalAgregarNotaCuota.jsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Row, Col, Button, Alert, Spinner, Badge 
} from 'react-bootstrap';
import { agregarNotaCuota } from '../Helpers/AgregarNotaCuota';

export const ModalAgregarNotaCuota = ({ 
  show, 
  onHide, 
  venta, 
  cuota, 
  onSuccess,
  usuario 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    texto: ''
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
        texto: ''
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
    setAlert({
      show: true,
      message,
      variant,
    });

    setTimeout(() => {
      setAlert({ show: false, message: '', variant: 'danger' });
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (alert.show) {
      setAlert({ show: false, message: '', variant: 'danger' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.texto || formData.texto.trim() === '') {
      showAlert('El texto de la nota es obligatorio', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await agregarNotaCuota({
        idVenta: venta._id,
        numeroCuota: cuota.numeroCuota,
        texto: formData.texto.trim(),
        usuario: {
          nombre: usuario?.nombre + ' ' + usuario?.apellido || 'Sistema'
        }
      });

      showAlert(result.message || 'Nota agregada exitosamente', 'success');

      setTimeout(() => {
        onHide();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);

    } catch (error) {
      showAlert(error.message || 'Error al agregar la nota', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================

  const getEstadoColor = (estado) => {
    const colores = {
      'pagada': 'success',
      'pendiente': 'warning',
      'no pagada': 'danger'
    };
    return colores[estado] || 'secondary';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      'pagada': 'Pagada ✅',
      'pendiente': 'Pendiente ⏳',
      'no pagada': 'No pagada ❌'
    };
    return labels[estado] || estado;
  };

  const formatMonto = (monto) => {
    if (!monto) return '$0';
    return `$${monto.toLocaleString('es-AR')}`;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Sugerencias de notas rápidas
  const sugerencias = [
    'Cliente se comunicó para coordinar pago',
    'Se realizó recordatorio de pago',
    'Cliente solicita extensión de plazo',
    'Se acordó nuevo plan de pago',
    'Cliente no pudo ser contactado',
    'Pago recibido en efectivo',
    'Pago recibido por transferencia',
    'Se emitió comprobante de pago'
  ];

  const insertarSugerencia = (texto) => {
    setFormData({
      texto: texto
    });
    if (alert.show) {
      setAlert({ show: false, message: '', variant: 'danger' });
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="md"
      centered
      className="agregar-nota-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-sticky me-2" style={{ color: '#17a2b8' }}></i>
          Agregar Nota a Cuota
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* ==========================================
            RESUMEN DE LA CUOTA
            ========================================== */}
        {cuota && (
          <div className="bg-light rounded-3 p-3 mb-3">
            <Row>
              <Col md={4}>
                <div className="text-muted small">Cuota</div>
                <div className="fw-semibold">#{cuota.numeroCuota}</div>
              </Col>
              <Col md={4}>
                <div className="text-muted small">Monto</div>
                <div className="fw-semibold">{formatMonto(cuota.montoCuota)}</div>
              </Col>
              <Col md={4}>
                <div className="text-muted small">Estado</div>
                <Badge bg={getEstadoColor(cuota.estado_cuota)} className="mt-1">
                  {getEstadoLabel(cuota.estado_cuota)}
                </Badge>
              </Col>
              <Col md={12} className="mt-2">
                <div className="text-muted small">Fecha de cobro</div>
                <div className="fw-semibold">{formatFecha(cuota.fechaCobro)}</div>
              </Col>
            </Row>
          </div>
        )}

        {/* ==========================================
            ALERTAS
            ========================================== */}
        {alert.show && (
          <Alert 
            variant={alert.variant}
            className="d-flex align-items-center rounded-3 border-0 shadow-sm mb-3"
            style={{
              padding: '10px 14px',
              fontSize: '0.9rem',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'x-circle'} me-2`}></i>
            <span className="flex-grow-1">{alert.message}</span>
            <Button
              variant="link"
              className="p-0 ms-2 text-decoration-none"
              style={{ color: 'inherit', opacity: 0.7 }}
              onClick={() => setAlert({ show: false, message: '', variant: 'danger' })}
            >
              <i className="bi bi-x-circle"></i>
            </Button>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* ==========================================
              SUGERENCIAS RÁPIDAS
              ========================================== */}
          <div className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-lightning me-1"></i>
              Sugerencias rápidas
            </Form.Label>
            <div className="d-flex flex-wrap gap-1">
              {sugerencias.map((sugerencia, index) => (
                <Button
                  key={index}
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-3"
                  onClick={() => insertarSugerencia(sugerencia)}
                  disabled={loading}
                  style={{ fontSize: '0.75rem' }}
                >
                  {sugerencia}
                </Button>
              ))}
            </div>
          </div>

          {/* ==========================================
              TEXTO DE LA NOTA
              ========================================== */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Nota <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              name="texto"
              rows={4}
              value={formData.texto}
              onChange={handleChange}
              placeholder="Escribí la nota aquí..."
              className="rounded-3"
              disabled={loading}
            />
            <Form.Text className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              La nota quedará registrada en el historial de la cuota
            </Form.Text>
          </Form.Group>

          {/* ==========================================
              VISTA PREVIA DE LA NOTA
              ========================================== */}
          {formData.texto && formData.texto.trim() !== '' && (
            <div className="bg-light rounded-3 p-2 mb-3">
              <small className="text-muted d-block">Vista previa:</small>
              <div className="bg-white rounded-2 p-2 border">
                <div className="d-flex align-items-start gap-2">
                  <i className="bi bi-person-circle text-secondary mt-1"></i>
                  <div>
                    <div className="fw-semibold small">
                      {usuario?.user.nombre + ' ' + usuario?.user.apellido || 'Sistema'}
                    </div>
                    <div className="text-muted small">{new Date().toLocaleString('es-AR')}</div>
                    <p className="mb-0 small">{formData.texto}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              BOTONES DE ACCIÓN
              ========================================== */}
          <div className="d-flex gap-2 justify-content-end pt-3 mt-3 border-top">
            <Button
              variant="secondary"
              onClick={onHide}
              className="rounded-3"
              disabled={loading}
            >
              <i className="bi bi-x-circle me-1"></i>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="rounded-3 px-4"
              style={{
                backgroundColor: '#17a2b8',
                borderColor: '#17a2b8',
                fontWeight: '500'
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Guardar Nota
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>

      {/* Estilos */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .agregar-nota-modal .modal-dialog {
          max-width: 550px;
        }

        .agregar-nota-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
        }

        .agregar-nota-modal .modal-body {
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .agregar-nota-modal .modal-dialog {
            max-width: 100%;
            margin: 1rem;
          }
        }
      `}</style>
    </Modal>
  );
};