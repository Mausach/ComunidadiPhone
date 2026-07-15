// Cobranza/Componentes/ModalCobro.jsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Row, Col, Button, Badge, 
  Alert, Spinner, Card 
} from 'react-bootstrap';
import { cobrarCuotas } from '../Helpers/CobrarCuotas';

export const ModalCobro = ({ 
  show, 
  onHide, 
  venta, 
  cuotaSeleccionada,
  onSuccess,
  usuario 
}) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'danger'
  });

  // Estado del formulario
  const [formData, setFormData] = useState({
    cuotas: [],
    metodoPago: 'efectivo',
    monto: 0,
    nota: ''
  });

  // ==========================================
  // INICIALIZAR FORMULARIO
  // ==========================================
  useEffect(() => {
    if (show && venta) {
      // ✅ Asegurarnos de que cuotas sea un array
      const cuotas = Array.isArray(venta.cuotas) ? venta.cuotas : [];
      
      // Si viene una cuota seleccionada, cobrar solo esa
      if (cuotaSeleccionada) {
        const cuota = cuotas.find(c => c.numeroCuota === cuotaSeleccionada.numeroCuota);
        if (cuota) {
          setFormData({
            cuotas: [{
              numeroCuota: cuota.numeroCuota,
              montoPagado: cuota.montoCuota || 0,
              metodoPago: 'efectivo'
            }],
            metodoPago: 'efectivo',
            monto: cuota.montoCuota || 0,
            nota: ''
          });
        }
      } else {
        // Si no, mostrar todas las cuotas pendientes
        const cuotasPendientes = cuotas
          .filter(c => c.estado_cuota === 'pendiente')
          .map(c => ({
            numeroCuota: c.numeroCuota,
            montoPagado: c.montoCuota || 0,
            metodoPago: 'efectivo'
          }));

        setFormData({
          cuotas: cuotasPendientes,
          metodoPago: 'efectivo',
          monto: cuotasPendientes.reduce((total, c) => total + (c.montoPagado || 0), 0),
          nota: ''
        });
      }
    }
  }, [show, venta, cuotaSeleccionada]);

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

  const handleCuotaChange = (index, field, value) => {
    const nuevasCuotas = [...formData.cuotas];
    nuevasCuotas[index] = { ...nuevasCuotas[index], [field]: value };
    
    // Recalcular monto total
    const total = nuevasCuotas.reduce((sum, c) => sum + (parseFloat(c.montoPagado) || 0), 0);
    
    setFormData({
      ...formData,
      cuotas: nuevasCuotas,
      monto: total
    });
  };

  const toggleCuota = (cuota) => {
    const cuotaExistente = formData.cuotas.find(c => c.numeroCuota === cuota.numeroCuota);
    
    if (cuotaExistente) {
      // Quitar cuota
      const nuevasCuotas = formData.cuotas.filter(c => c.numeroCuota !== cuota.numeroCuota);
      const total = nuevasCuotas.reduce((sum, c) => sum + (parseFloat(c.montoPagado) || 0), 0);
      setFormData({
        ...formData,
        cuotas: nuevasCuotas,
        monto: total
      });
    } else {
      // Agregar cuota
      const nuevasCuotas = [
        ...formData.cuotas,
        {
          numeroCuota: cuota.numeroCuota,
          montoPagado: cuota.montoCuota || 0,
          metodoPago: formData.metodoPago
        }
      ];
      const total = nuevasCuotas.reduce((sum, c) => sum + (parseFloat(c.montoPagado) || 0), 0);
      setFormData({
        ...formData,
        cuotas: nuevasCuotas,
        monto: total
      });
    }
  };

  // ==========================================
  // ENVÍO DEL FORMULARIO
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (formData.cuotas.length === 0) {
      showAlert('Seleccioná al menos una cuota para cobrar', 'warning');
      return;
    }

    if (!formData.metodoPago) {
      showAlert('Seleccioná un método de pago', 'warning');
      return;
    }

    // Verificar que todas las cuotas tengan monto
    for (const cuota of formData.cuotas) {
      if (!cuota.montoPagado || cuota.montoPagado <= 0) {
        showAlert(`La cuota ${cuota.numeroCuota} debe tener un monto mayor a 0`, 'warning');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        idVenta: venta._id,
        cuotas: formData.cuotas.map(c => ({
          numeroCuota: c.numeroCuota,
          montoPagado: parseFloat(c.montoPagado),
          metodoPago: formData.metodoPago
        })),
        cobrador: {
          nombre: usuario?.user.nombre + ' ' + usuario?.user.apellido || 'Sistema'
        },
        nota: formData.nota || ''
      };


      const result = await cobrarCuotas(payload);

      showAlert(result.message || 'Cuotas cobradas exitosamente', 'success');

      // Cerrar modal después del éxito
      setTimeout(() => {
        onHide();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);

    } catch (error) {
      showAlert(error.message || 'Error al procesar el cobro', 'danger');
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

  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'dolares', label: 'Dólares' },
    { value: 'cripto', label: 'Criptomonedas' },
    { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' }
  ];

  // ==========================================
  // OBTENER CUOTAS PENDIENTES (con seguridad)
  // ==========================================
  const cuotas = Array.isArray(venta?.cuotas) ? venta.cuotas : [];
  const cuotasPendientes = cuotas.filter(c => c.estado_cuota === 'pendiente');

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="cobro-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-coin me-2" style={{ color: '#28a745' }}></i>
          Cobrar Cuotas
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* ==========================================
            RESUMEN DEL CLIENTE
            ========================================== */}
        {venta && (
          <Card className="border-0 bg-light mb-3" style={{ borderRadius: '12px' }}>
            <Card.Body className="p-3">
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#e6f3ff',
                        color: '#3483FA',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}
                    >
                      {venta.cliente?.nombre?.charAt(0)}{venta.cliente?.apellido?.charAt(0)}
                    </div>
                    <div>
                      <div className="fw-semibold small">
                        {venta.cliente?.nombre} {venta.cliente?.apellido}
                      </div>
                      <div className="text-muted small">
                        <i className="bi bi-person-badge me-1"></i>
                        DNI: {venta.cliente?.dni || '-'}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="text-md-end">
                  <div className="text-muted small">Producto</div>
                  <div className="fw-semibold small">{venta.producto?.nombre}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
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
              SELECCIÓN DE CUOTAS
              ========================================== */}
          <div className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-grid me-1"></i>
              Seleccioná las cuotas a cobrar
            </Form.Label>
            
            {cuotasPendientes.length === 0 ? (
              <Alert variant="info" className="rounded-3">
                <i className="bi bi-info-circle me-2"></i>
                No hay cuotas pendientes para cobrar
              </Alert>
            ) : (
              <div className="border rounded-3 p-2" style={{ backgroundColor: '#f8f9fa' }}>
                {cuotasPendientes.map((cuota) => {
                  const seleccionada = formData.cuotas.some(c => c.numeroCuota === cuota.numeroCuota);
                  return (
                    <div 
                      key={cuota.numeroCuota}
                      className={`d-flex justify-content-between align-items-center p-2 rounded-2 mb-1 ${seleccionada ? 'bg-white border border-success' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleCuota(cuota)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <Form.Check
                          type="checkbox"
                          checked={seleccionada}
                          onChange={() => toggleCuota(cuota)}
                          className="mt-0"
                        />
                        <span className="fw-semibold">Cuota #{cuota.numeroCuota}</span>
                        <span className="text-muted small">
                          {formatMonto(cuota.montoCuota)}
                        </span>
                        {cuota.fechaCobro && (
                          <span className="text-muted small">
                            <i className="bi bi-calendar me-1"></i>
                            {formatFecha(cuota.fechaCobro)}
                          </span>
                        )}
                        {cuota.diasAtraso > 0 && (
                          <Badge bg="danger" className="rounded-pill">
                            {cuota.diasAtraso} días atraso
                          </Badge>
                        )}
                      </div>
                      {seleccionada && (
                        <div className="d-flex align-items-center gap-2">
                          <Form.Control
                            type="number"
                            className="form-control-sm"
                            style={{ width: '120px' }}
                            value={formData.cuotas.find(c => c.numeroCuota === cuota.numeroCuota)?.montoPagado || cuota.montoCuota}
                            onChange={(e) => {
                              const index = formData.cuotas.findIndex(c => c.numeroCuota === cuota.numeroCuota);
                              if (index !== -1) {
                                handleCuotaChange(index, 'montoPagado', parseFloat(e.target.value) || 0);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            min={0}
                            step={100}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ==========================================
              DATOS DEL PAGO
              ========================================== */}
          <Row className="g-3 mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Método de pago <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleChange}
                  className="rounded-3"
                  disabled={loading || formData.cuotas.length === 0}
                >
                  {metodosPago.map(m => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Monto total a cobrar
                </Form.Label>
                <div className="border rounded-3 p-2 bg-white text-center fw-bold text-success">
                  {formatMonto(formData.monto)}
                </div>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-secondary">
                  Cuotas seleccionadas
                </Form.Label>
                <div className="border rounded-3 p-2 bg-white text-center fw-semibold">
                  {formData.cuotas.length}
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* ==========================================
              NOTA (opcional)
              ========================================== */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">
              <i className="bi bi-sticky me-1"></i>
              Nota (opcional)
            </Form.Label>
            <Form.Control
              as="textarea"
              name="nota"
              rows={2}
              value={formData.nota}
              onChange={handleChange}
              placeholder="Agregá una nota sobre este cobro..."
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
              variant="success"
              type="submit"
              className="rounded-3 px-4"
              disabled={loading || formData.cuotas.length === 0}
              style={{
                backgroundColor: '#28a745',
                borderColor: '#28a745',
                fontWeight: '500'
              }}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <i className="bi bi-coin me-2"></i>
                  Confirmar Cobro
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

        .cobro-modal .modal-dialog {
          max-width: 700px;
        }

        .cobro-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
        }

        .cobro-modal .modal-body {
          max-height: 80vh;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .cobro-modal .modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .cobro-modal .modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .cobro-modal .modal-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .cobro-modal .modal-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .cobro-modal .form-check-input:checked {
          background-color: #28a745;
          border-color: #28a745;
        }

        @media (max-width: 768px) {
          .cobro-modal .modal-dialog {
            max-width: 100%;
            margin: 1rem;
          }
          
          .cobro-modal .modal-body {
            max-height: 85vh;
            padding: 1rem;
          }
        }
      `}</style>
    </Modal>
  );
};

