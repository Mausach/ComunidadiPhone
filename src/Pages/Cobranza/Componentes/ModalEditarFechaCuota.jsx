// Cobranza/Componentes/ModalEditarFechaCuota.jsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Row, Col, Button, Alert, Spinner 
} from 'react-bootstrap';
import { editarFechaCuota } from '../Helpers/editarFechaCuota';

export const ModalEditarFechaCuota = ({ 
  show, 
  onHide, 
  venta, 
  cuota, 
  onSuccess,
  usuario 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nuevaFecha: '',
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
      // Formatear fecha actual para el input date
      const fechaActual = cuota.fechaCobro ? new Date(cuota.fechaCobro) : new Date();
      const fechaFormateada = fechaActual.toISOString().split('T')[0];
      
      setFormData({
        nuevaFecha: fechaFormateada,
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
    if (!formData.nuevaFecha) {
      showAlert('La nueva fecha es obligatoria', 'warning');
      return;
    }

    // Validar que la fecha no sea anterior a hoy
    const fechaSeleccionada = new Date(formData.nuevaFecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
      showAlert('La fecha no puede ser anterior a hoy', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await editarFechaCuota({
        idVenta: venta._id,
        numeroCuota: cuota.numeroCuota,
        nuevaFecha: formData.nuevaFecha,
        usuario: {
          nombre: usuario?.nombre + ' ' + usuario?.apellido || 'Sistema'
        },
        motivo: formData.motivo || 'Sin especificar'
      });

      showAlert(result.message || 'Fecha actualizada exitosamente', 'success');

      setTimeout(() => {
        onHide();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);

    } catch (error) {
      showAlert(error.message || 'Error al actualizar la fecha', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtener el día mínimo permitido (hoy)
  const obtenerFechaMinima = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="md"
      centered
      className="editar-fecha-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-calendar me-2" style={{ color: '#3483FA' }}></i>
          Editar Fecha de Cuota
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* ==========================================
            RESUMEN DE LA CUOTA
            ========================================== */}
        {cuota && (
          <div className="bg-light rounded-3 p-3 mb-3">
            <Row>
              <Col md={6}>
                <div className="text-muted small">Cuota</div>
                <div className="fw-semibold">#{cuota.numeroCuota}</div>
              </Col>
              <Col md={6}>
                <div className="text-muted small">Monto</div>
                <div className="fw-semibold">${cuota.montoCuota?.toLocaleString()}</div>
              </Col>
              <Col md={12} className="mt-2">
                <div className="text-muted small">Fecha actual</div>
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
              NUEVA FECHA
              ========================================== */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Nueva fecha de cobro <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              name="nuevaFecha"
              value={formData.nuevaFecha}
              onChange={handleChange}
              className="rounded-3"
              disabled={loading}
              min={obtenerFechaMinima()}
            />
            <Form.Text className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              La fecha no puede ser anterior a hoy
            </Form.Text>
          </Form.Group>

          {/* ==========================================
              MOTIVO (opcional)
              ========================================== */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-sticky me-1"></i>
              Motivo del cambio (opcional)
            </Form.Label>
            <Form.Control
              as="textarea"
              name="motivo"
              rows={2}
              value={formData.motivo}
              onChange={handleChange}
              placeholder="Ej: Cliente solicitó extensión de plazo..."
              className="rounded-3"
              disabled={loading}
            />
          </Form.Group>

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
                backgroundColor: '#3483FA',
                borderColor: '#3483FA',
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
                  Guardar Cambios
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

        .editar-fecha-modal .modal-dialog {
          max-width: 500px;
        }

        .editar-fecha-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
        }

        .editar-fecha-modal .modal-body {
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .editar-fecha-modal .modal-dialog {
            max-width: 100%;
            margin: 1rem;
          }
        }
      `}</style>
    </Modal>
  );
};