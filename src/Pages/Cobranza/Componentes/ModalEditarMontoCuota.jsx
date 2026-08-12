// Cobranza/Componentes/ModalEditarMontoCuota.jsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Row, Col, Button, Alert, Spinner 
} from 'react-bootstrap';
import { editarMontoCuota } from '../Helpers/EditarMontoCuota';

export const ModalEditarMontoCuota = ({ 
  show, 
  onHide, 
  venta, 
  cuota, 
  onSuccess,
  usuario 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nuevoMonto: '',
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
        nuevoMonto: cuota.montoCuota || '',
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
    const monto = parseFloat(formData.nuevoMonto);
    if (!monto || monto <= 0) {
      showAlert('El nuevo monto debe ser mayor a 0', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await editarMontoCuota({
        idVenta: venta._id,
        numeroCuota: cuota.numeroCuota,
        nuevoMonto: monto,
        usuario: {
           nombre: usuario?.user.nombre + ' ' + usuario?.user.apellido || 'Sistema'
        },
        motivo: formData.motivo || 'Sin especificar'
      });

      showAlert(result.message || 'Monto actualizado exitosamente', 'success');

      setTimeout(() => {
        onHide();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);

    } catch (error) {
      showAlert(error.message || 'Error al actualizar el monto', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================

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

  // Calcular nuevo total de la venta
  const calcularNuevoTotal = () => {
    const montoActual = parseFloat(cuota?.montoCuota) || 0;
    const nuevoMonto = parseFloat(formData.nuevoMonto) || 0;
    const diferencia = nuevoMonto - montoActual;
    const totalActual = venta?.montoTotal || 0;
    return totalActual + diferencia;
  };

  // Calcular diferencia
  const calcularDiferencia = () => {
    const montoActual = parseFloat(cuota?.montoCuota) || 0;
    const nuevoMonto = parseFloat(formData.nuevoMonto) || 0;
    return nuevoMonto - montoActual;
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="md"
      centered
      className="editar-monto-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-currency-dollar me-2" style={{ color: '#fd7e14' }}></i>
          Editar Monto de Cuota
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
                <div className="text-muted small">Monto actual</div>
                <div className="fw-semibold">{formatMonto(cuota.montoCuota)}</div>
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
              NUEVO MONTO
              ========================================== */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Nuevo monto de la cuota <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              name="nuevoMonto"
              value={formData.nuevoMonto}
              onChange={handleChange}
              placeholder="Ingresá el nuevo monto"
              className="rounded-3"
              disabled={loading}
              min={1}
              step="any"
            />
            <Form.Text className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              El monto debe ser mayor a 0
            </Form.Text>
          </Form.Group>

          {/* ==========================================
              PREVISUALIZACIÓN DE CAMBIOS
              ========================================== */}
          {formData.nuevoMonto && parseFloat(formData.nuevoMonto) > 0 && (
            <div className="bg-light rounded-3 p-2 mb-3">
              <Row className="text-center small">
                <Col>
                  <div className="text-muted">Monto actual</div>
                  <div className="fw-semibold">{formatMonto(cuota?.montoCuota)}</div>
                </Col>
                <Col>
                  <div className="text-muted">Nuevo monto</div>
                  <div className="fw-semibold text-primary">{formatMonto(parseFloat(formData.nuevoMonto))}</div>
                </Col>
                <Col>
                  <div className="text-muted">Diferencia</div>
                  <div className={`fw-semibold ${calcularDiferencia() > 0 ? 'text-success' : 'text-danger'}`}>
                    {calcularDiferencia() > 0 ? '+' : ''}{formatMonto(calcularDiferencia())}
                  </div>
                </Col>
                <Col>
                  <div className="text-muted">Nuevo total venta</div>
                  <div className="fw-semibold">{formatMonto(calcularNuevoTotal())}</div>
                </Col>
              </Row>
            </div>
          )}

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
              placeholder="Ej: Se aplicó descuento por pronto pago..."
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
                backgroundColor: '#fd7e14',
                borderColor: '#fd7e14',
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

        .editar-monto-modal .modal-dialog {
          max-width: 550px;
        }

        .editar-monto-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
        }

        .editar-monto-modal .modal-body {
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .editar-monto-modal .modal-dialog {
            max-width: 100%;
            margin: 1rem;
          }
        }
      `}</style>
    </Modal>
  );
};