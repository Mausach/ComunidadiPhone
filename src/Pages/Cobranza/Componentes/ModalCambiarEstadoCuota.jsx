// Cobranza/Componentes/ModalCambiarEstadoCuota.jsx

import { cambiarEstadoCuota } from '../Helpers/EditarEstadoCuota';

// Cobranza/Componentes/ModalCambiarEstadoCuota.jsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Row, Col, Button, Alert, Spinner, Badge, InputGroup 
} from 'react-bootstrap';


export const ModalCambiarEstadoCuota = ({ 
  show, 
  onHide, 
  venta, 
  cuota, 
  onSuccess,
  usuario 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nuevoEstado: '',
    motivo: '',
    montoParcial: '',
    metodoPago: 'efectivo'
  });
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'danger'
  });

  // Métodos de pago disponibles
  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'dolares', label: 'Dólares' },
    { value: 'cripto', label: 'Criptomonedas' },
    { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' }
  ];

  // ==========================================
  // INICIALIZAR FORMULARIO
  // ==========================================
  useEffect(() => {
    if (show && cuota) {
      setFormData({
        nuevoEstado: cuota.estado_cuota || 'pendiente',
        motivo: '',
        montoParcial: '',
        metodoPago: 'efectivo'
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

    // 👉 Validar que cuota existe
    if (!cuota) {
      showAlert('No se encontró la cuota seleccionada', 'danger');
      return;
    }

    // Validaciones
    if (!formData.nuevoEstado) {
      showAlert('Seleccioná un nuevo estado', 'warning');
      return;
    }

    if (formData.nuevoEstado === cuota.estado_cuota) {
      showAlert(`La cuota ya está en estado "${getEstadoLabel(formData.nuevoEstado)}"`, 'warning');
      return;
    }

    // Validar monto parcial si el estado es "pago parcial"
    if (formData.nuevoEstado === 'pago parcial') {
      const monto = parseFloat(formData.montoParcial);
      if (!monto || monto <= 0) {
        showAlert('Ingresá el monto parcial cobrado', 'warning');
        return;
      }
      // 👉 CORREGIDO: Permitir montos iguales o menores (antes era solo menores estrictos)
      if (monto > cuota.montoCuota) {
        showAlert('El monto parcial no puede ser mayor al monto total de la cuota. Si pagó todo, seleccioná "Pagada"', 'warning');
        return;
      }
      if (monto === cuota.montoCuota) {
        showAlert('El monto ingresado es igual al total de la cuota. Si pagó todo, seleccioná "Pagada"', 'warning');
        return;
      }
    }

    // Validar método de pago si pasa a pagada o pago parcial
    if ((formData.nuevoEstado === 'pagada' || formData.nuevoEstado === 'pago parcial') && !formData.metodoPago) {
      showAlert('Seleccioná el método de pago', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        idVenta: venta._id,
        numeroCuota: cuota.numeroCuota,
        nuevoEstado: formData.nuevoEstado,
        usuario: {
          nombre: usuario?.user.nombre + ' ' + usuario?.user.apellido || 'Sistema'
        },
        motivo: formData.motivo || 'Sin especificar'
      };

      // Agregar monto parcial y método de pago si corresponde
      if (formData.nuevoEstado === 'pago parcial') {
        payload.montoParcial = parseFloat(formData.montoParcial);
        payload.metodoPago = formData.metodoPago;
      }

      if (formData.nuevoEstado === 'pagada') {
        payload.metodoPago = formData.metodoPago;
      }

      const result = await cambiarEstadoCuota(payload);

      showAlert(result.message || 'Estado actualizado exitosamente', 'success');

      setTimeout(() => {
        onHide();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);

    } catch (error) {
      showAlert(error.message || 'Error al cambiar el estado', 'danger');
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
      'pago parcial': 'info',
      'no pagada': 'danger'
    };
    return colores[estado] || 'secondary';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      'pagada': 'Pagada ✅',
      'pendiente': 'Pendiente ⏳',
      'pago parcial': 'Pago Parcial 💰',
      'no pagada': 'No pagada ❌'
    };
    return labels[estado] || estado;
  };

  const getEstadoIcono = (estado) => {
    const iconos = {
      'pagada': 'bi-check-circle-fill',
      'pendiente': 'bi-clock-fill',
      'pago parcial': 'bi-wallet2',
      'no pagada': 'bi-x-circle-fill'
    };
    return iconos[estado] || 'bi-circle';
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

  // Opciones de estado disponibles
  const opcionesEstado = [
    { value: 'pendiente', label: 'Pendiente ⏳', color: 'warning' },
    { value: 'pagada', label: 'Pagada ✅', color: 'success' },
    { value: 'pago parcial', label: 'Pago Parcial 💰', color: 'info' },
    { value: 'no pagada', label: 'No pagada ❌', color: 'danger' }
  ];

  const getConductaPreview = () => {
    if (formData.nuevoEstado === 'pagada') {
      return 'Al actualizar a Pagada, la conducta de pago podría mejorar.';
    }
    if (formData.nuevoEstado === 'pago parcial') {
      return 'Se registra un pago parcial. La cuota sigue pendiente por el saldo restante.';
    }
    if (formData.nuevoEstado === 'no pagada') {
      return '⚠️ Al marcar como No pagada, la conducta de pago podría empeorar.';
    }
    return 'El cambio de estado puede afectar la conducta de pago del cliente.';
  };

  // 👉 CORREGIDO: Validar que cuota existe antes de calcular
  const getSaldoRestante = () => {
    if (cuota && formData.nuevoEstado === 'pago parcial' && formData.montoParcial && parseFloat(formData.montoParcial) > 0) {
      return cuota.montoCuota - parseFloat(formData.montoParcial);
    }
    return 0;
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="md"
      centered
      className="cambiar-estado-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-arrow-left-right me-2" style={{ color: '#6f42c1' }}></i>
          Cambiar Estado de Cuota
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
                <div className="text-muted small">Estado actual</div>
                <Badge bg={getEstadoColor(cuota.estado_cuota)} className="mt-1">
                  <i className={`${getEstadoIcono(cuota.estado_cuota)} me-1`}></i>
                  {getEstadoLabel(cuota.estado_cuota)}
                </Badge>
              </Col>
              <Col md={12} className="mt-2">
                <div className="text-muted small">Fecha de cobro</div>
                <div className="fw-semibold">{formatFecha(cuota.fechaCobro)}</div>
              </Col>
              {cuota.fechaCobrada && (
                <Col md={12} className="mt-2">
                  <div className="text-muted small">Fecha cobrada</div>
                  <div className="fw-semibold text-success">{formatFecha(cuota.fechaCobrada)}</div>
                </Col>
              )}
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
              NUEVO ESTADO
              ========================================== */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              Nuevo estado <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex gap-2 flex-wrap">
              {opcionesEstado.map((opcion) => (
                <Button
                  key={opcion.value}
                  variant={formData.nuevoEstado === opcion.value ? opcion.color : 'outline-secondary'}
                  className={`rounded-3 flex-grow-1 ${formData.nuevoEstado === opcion.value ? 'fw-semibold text-white' : ''}`}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      nuevoEstado: opcion.value,
                      montoParcial: opcion.value === 'pago parcial' ? formData.montoParcial : ''
                    });
                    if (alert.show) {
                      setAlert({ show: false, message: '', variant: 'danger' });
                    }
                  }}
                  disabled={loading}
                  style={{
                    backgroundColor: formData.nuevoEstado === opcion.value ? 
                      (opcion.color === 'warning' ? '#ffc107' : 
                       opcion.color === 'success' ? '#28a745' : 
                       opcion.color === 'info' ? '#0dcaf0' : 
                       opcion.color === 'danger' ? '#dc3545' : '#6c757d') : 'transparent',
                    borderColor: formData.nuevoEstado === opcion.value ? 
                      (opcion.color === 'warning' ? '#ffc107' : 
                       opcion.color === 'success' ? '#28a745' : 
                       opcion.color === 'info' ? '#0dcaf0' : 
                       opcion.color === 'danger' ? '#dc3545' : '#6c757d') : '',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className={`${getEstadoIcono(opcion.value)} me-1`}></i>
                  {opcion.label}
                </Button>
              ))}
            </div>
            <Form.Text className="text-muted small d-block mt-1">
              <i className="bi bi-info-circle me-1"></i>
              {formData.nuevoEstado && formData.nuevoEstado !== cuota?.estado_cuota ? (
                <span className="text-warning">
                  ⚠️ Vas a cambiar de "{getEstadoLabel(cuota?.estado_cuota)}" a "{getEstadoLabel(formData.nuevoEstado)}"
                </span>
              ) : (
                'Seleccioná el nuevo estado de la cuota'
              )}
            </Form.Text>
          </Form.Group>

          {/* ==========================================
              PREVISUALIZACIÓN DE CONDUCTA
              ========================================== */}
          {formData.nuevoEstado && formData.nuevoEstado !== cuota?.estado_cuota && (
            <div className={`rounded-3 p-2 mb-3 ${
              formData.nuevoEstado === 'pagada' ? 'bg-success bg-opacity-10' : 
              formData.nuevoEstado === 'pago parcial' ? 'bg-info bg-opacity-10' : 
              'bg-danger bg-opacity-10'
            }`}>
              <small className="text-muted d-flex align-items-center gap-1">
                <i className={`bi ${
                  formData.nuevoEstado === 'pagada' ? 'bi-check-circle text-success' : 
                  formData.nuevoEstado === 'pago parcial' ? 'bi-wallet2 text-info' : 
                  'bi-exclamation-triangle text-danger'
                }`}></i>
                {getConductaPreview()}
              </small>
            </div>
          )}

          {/* ==========================================
              MONTO PARCIAL (solo si es pago parcial)
              ========================================== */}
          {formData.nuevoEstado === 'pago parcial' && (
            <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f0f9ff' }}>
              <h6 className="fw-bold text-info mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-cash me-2"></i>
                Detalle del Pago Parcial
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">
                      Monto Cobrado ($) <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup className="rounded-3">
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="montoParcial"
                        value={formData.montoParcial}
                        onChange={handleChange}
                        placeholder="0"
                        className="rounded-end-3"
                        disabled={loading}
                        min={1}
                        max={cuota?.montoCuota - 1}
                      />
                    </InputGroup>
                    <Form.Text className="text-muted small">
                      Monto total de la cuota: {cuota ? formatMonto(cuota.montoCuota) : '-'}
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">
                      Método de Pago <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="metodoPago"
                      value={formData.metodoPago}
                      onChange={handleChange}
                      className="rounded-3"
                      disabled={loading}
                    >
                      {metodosPago.map(metodo => (
                        <option key={metodo.value} value={metodo.value}>
                          {metodo.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              {formData.montoParcial && parseFloat(formData.montoParcial) > 0 && cuota && (
                <div className="mt-3 p-2 bg-white rounded-3 border">
                  <Row className="text-center">
                    <Col xs={6}>
                      <small className="text-muted d-block">Monto Total Cuota</small>
                      <strong>{formatMonto(cuota.montoCuota)}</strong>
                    </Col>
                    <Col xs={6}>
                      <small className="text-muted d-block">Saldo Restante</small>
                      <strong className="text-danger">{formatMonto(getSaldoRestante())}</strong>
                    </Col>
                  </Row>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              MÉTODO DE PAGO (si es pagada)
              ========================================== */}
          {formData.nuevoEstado === 'pagada' && (
            <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f0fff4' }}>
              <h6 className="fw-bold text-success mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-credit-card me-2"></i>
                Método de Pago
              </h6>
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary">
                  ¿Cómo pagó? <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleChange}
                  className="rounded-3"
                  disabled={loading}
                >
                  {metodosPago.map(metodo => (
                    <option key={metodo.value} value={metodo.value}>
                      {metodo.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
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
              placeholder={
                formData.nuevoEstado === 'pago parcial' ? 'Ej: Cliente abonó $5.000, queda pendiente el resto...' :
                formData.nuevoEstado === 'pagada' ? 'Ej: Cliente abonó la cuota completa...' :
                'Ej: Cliente no pudo abonar esta cuota...'
              }
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
                backgroundColor: '#6f42c1',
                borderColor: '#6f42c1',
                fontWeight: '500'
              }}
              disabled={loading || !formData.nuevoEstado || formData.nuevoEstado === cuota?.estado_cuota}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Cambiar Estado
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

        .cambiar-estado-modal .modal-dialog {
          max-width: 580px;
        }

        .cambiar-estado-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
        }

        .cambiar-estado-modal .modal-body {
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .cambiar-estado-modal .modal-dialog {
            max-width: 100%;
            margin: 1rem;
          }
        }
      `}</style>
    </Modal>
  );
};