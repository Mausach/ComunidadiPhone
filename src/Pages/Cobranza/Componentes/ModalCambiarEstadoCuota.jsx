import { cambiarEstadoCuota } from '../Helpers/EditarEstadoCuota';
// Cobranza/Componentes/ModalCambiarEstadoCuota.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Row, Col, Button, Alert, Spinner, InputGroup
} from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';

// Componente Pill
const Pill = ({ children, bg, color, border, icon, style = {} }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '0.35em 0.7em',
    fontSize: '0.75rem', fontWeight: '600', borderRadius: '20px',
    backgroundColor: bg, color: color,
    border: border ? `1px solid ${border}` : 'none',
    whiteSpace: 'nowrap', ...style
  }}>
    {icon && <i className={`bi bi-${icon} me-1`}></i>}
    {children}
  </span>
);

export const ModalCambiarEstadoCuota = ({
  show, onHide, venta, cuota, onSuccess, usuario
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nuevoEstado: '',
    motivo: '',
    montoParcial: '',
    metodoPago: 'efectivo'
  });
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });

  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'dolares', label: 'Dólares' },
    { value: 'cripto', label: 'Criptomonedas' },
    { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' }
  ];

  // Cálculos de recargos
  const totalRecargosCuota = cuota?.recargos?.reduce((s, r) => s + r.monto, 0) || 0;
  const totalCuotaConRecargos = (cuota?.montoCuota || 0) + totalRecargosCuota;
  const montoPagadoAcumulado = cuota?.montoPagado || 0;
  const saldoPendiente = totalCuotaConRecargos - montoPagadoAcumulado;

  useEffect(() => {
    if (show && cuota) {
      setFormData({
        nuevoEstado: '',
        motivo: '',
        montoParcial: '',
        metodoPago: 'efectivo'
      });
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

  const handleSelectEstado = (estado) => {
    setFormData({
      ...formData,
      nuevoEstado: estado,
      montoParcial: estado === 'pago parcial' ? formData.montoParcial : ''
    });
    if (alert.show) setAlert({ show: false, message: '', variant: 'danger' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cuota) { showAlert('No se encontró la cuota', 'danger'); return; }
    if (!formData.nuevoEstado) { showAlert('Seleccioná un nuevo estado', 'warning'); return; }
    if (formData.nuevoEstado === cuota.estado_cuota) {
      showAlert(`La cuota ya está en estado "${formData.nuevoEstado}"`, 'warning');
      return;
    }

    // Validaciones por tipo
    if (formData.nuevoEstado === 'pago parcial') {
      const monto = parseFloat(formData.montoParcial);
      if (!monto || monto <= 0) { showAlert('Ingresá el monto parcial cobrado', 'warning'); return; }
      if (monto > saldoPendiente + 1) { // +1 de margen
        showAlert(`El monto (${formatMonto(monto)}) supera el saldo pendiente (${formatMonto(saldoPendiente)})`, 'warning');
        return;
      }
    }

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
          nombre: usuario?.user?.nombre + ' ' + usuario?.user?.apellido || 'Sistema'
        },
        motivo: formData.motivo || 'Sin especificar'
      };

      if (formData.nuevoEstado === 'pago parcial') {
        payload.montoParcial = parseFloat(formData.montoParcial);
        payload.metodoPago = formData.metodoPago;
      }
      if (formData.nuevoEstado === 'pagada') {
        payload.metodoPago = formData.metodoPago;
      }

      const result = await cambiarEstadoCuota(payload);
      showAlert(result.message || 'Estado actualizado exitosamente', 'success');

      setTimeout(() => { onHide(); if (onSuccess) onSuccess(); }, 1500);
    } catch (error) {
      showAlert(error.message || 'Error al cambiar el estado', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const formatMonto = (m) => !m && m !== 0 ? '$0' : `$${Number(m).toLocaleString('es-AR')}`;
  const formatFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Desglose pago parcial (primero recargos, después capital)
  const getDesglosePago = () => {
    const monto = parseFloat(formData.montoParcial) || 0;
    let restante = monto;
    let aRecargos = 0;
    let aCapital = 0;

    if (cuota?.recargos) {
      for (const r of cuota.recargos) {
        if (restante <= 0) break;
        const pago = Math.min(r.monto, restante);
        aRecargos += pago;
        restante -= pago;
      }
    }
    aCapital = restante;
    return { aRecargos, aCapital };
  };
  const desglose = getDesglosePago();

  // Opciones de estado (Cards)
  const opcionesEstado = [
    {
      value: 'pagada',
      titulo: 'Pagada',
      descripcion: 'El cliente abonó el total de la cuota.',
      icon: 'check-circle-fill',
      color: COLORS.verde,
      bgColor: COLORS.verdeSuave
    },
    {
      value: 'pago parcial',
      titulo: 'Pago Parcial',
      descripcion: 'El cliente abonó una parte del total.',
      icon: 'wallet2',
      color: COLORS.azul,
      bgColor: COLORS.azulSuave
    },
    {
      value: 'no pagada',
      titulo: 'No Pagada',
      descripcion: 'El cliente no abonó esta cuota (mora).',
      icon: 'x-circle-fill',
      color: COLORS.rojo,
      bgColor: COLORS.rojoSuave
    },
    {
      value: 'pendiente',
      titulo: 'Pendiente',
      descripcion: 'Revertir el estado a pendiente.',
      icon: 'clock-fill',
      color: COLORS.ambar,
      bgColor: COLORS.ambarSuave
    }
  ];

  const getEstadoPreviewTitle = () => {
    if (formData.nuevoEstado === 'pagada') return 'Cobro Total';
    if (formData.nuevoEstado === 'pago parcial') return 'Cobro Parcial';
    if (formData.nuevoEstado === 'no pagada') return 'Cuota Impaga';
    return 'Sin cambios';
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="cambiar-estado-modal">
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
          <i className="bi bi-sliders me-2" style={{ color: COLORS.azul }}></i>Ajustar Estado de Cuota
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pt-3">
        {alert.show && (
          <Alert variant={alert.variant} className="rounded-3 border-0 shadow-sm mb-3 d-flex align-items-center"
            style={{
              backgroundColor: alert.variant === 'success' ? COLORS.verdeSuave : alert.variant === 'warning' ? COLORS.ambarSuave : COLORS.rojoSuave,
              color: alert.variant === 'success' ? COLORS.verde : alert.variant === 'warning' ? COLORS.ambar : COLORS.rojo
            }}>
            <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : alert.variant === 'warning' ? 'exclamation-triangle' : 'x-circle'} me-2`}></i>
            <span className="flex-grow-1">{alert.message}</span>
            <Button variant="link" className="p-0 ms-2" style={{ color: 'inherit', opacity: 0.7 }} onClick={() => showAlert('')}><i className="bi bi-x-circle"></i></Button>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            
            {/* COLUMNA IZQUIERDA: Selección de estado y formulario */}
            <Col lg={8}>
              
              {/* Selección de Estado (Cards) */}
              <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                  <i className="bi bi-flag me-2"></i>Seleccionar Nuevo Estado
                </h6>
                <Row className="g-2">
                  {opcionesEstado.map((op) => {
                    const isSelected = formData.nuevoEstado === op.value;
                    const isCurrent = cuota?.estado_cuota === op.value;
                    return (
                      <Col sm={6} key={op.value}>
                        <div
                          onClick={() => !loading && handleSelectEstado(op.value)}
                          style={{
                            cursor: loading ? 'not-allowed' : 'pointer',
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? op.bgColor : COLORS.cardBg,
                            border: `2px solid ${isSelected ? op.color : COLORS.bordes}`,
                            transition: 'all 0.2s',
                            opacity: isCurrent ? 0.5 : 1,
                            position: 'relative'
                          }}
                        >
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <i className={`bi bi-${op.icon}`} style={{ color: op.color, fontSize: '1.2rem' }}></i>
                            <span className="fw-bold" style={{ color: COLORS.textoPrincipal }}>{op.titulo}</span>
                            {isCurrent && <Pill bg={COLORS.bgGeneral} color={COLORS.textoSecundario} style={{ marginLeft: 'auto', fontSize: '0.6rem' }}>Actual</Pill>}
                          </div>
                          <small style={{ color: COLORS.textoSecundario, fontSize: '0.75rem' }}>{op.descripcion}</small>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </div>

              {/* Formulario dinámico según estado */}
              {formData.nuevoEstado && formData.nuevoEstado !== cuota?.estado_cuota && (
                <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                    <i className="bi bi-pencil-square me-2"></i>Detalles de la Acción
                  </h6>

                  {/* PAGO PARCIAL */}
                  {formData.nuevoEstado === 'pago parcial' && (
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Monto a cobrar <span className="text-danger">*</span></Form.Label>
                          <InputGroup>
                            <InputGroup.Text style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.bordes }}>$</InputGroup.Text>
                            <Form.Control type="number" name="montoParcial" value={formData.montoParcial} onChange={handleChange}
                              placeholder="0" className="rounded-end-3" disabled={loading} min={1}
                              max={saldoPendiente} step="any" />
                          </InputGroup>
                          <Form.Text className="small" style={{ color: COLORS.textoSecundario }}>
                            Saldo pendiente: {formatMonto(saldoPendiente)}
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Método de Pago <span className="text-danger">*</span></Form.Label>
                          <Form.Select name="metodoPago" value={formData.metodoPago} onChange={handleChange} className="rounded-3" disabled={loading}>
                            {metodosPago.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      {formData.montoParcial && parseFloat(formData.montoParcial) > 0 && (
                        <Col md={12}>
                          <div className="p-2 rounded-3" style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.bordes}` }}>
                            <Row className="text-center small">
                              <Col xs={6}>
                                <span style={{ color: COLORS.textoSecundario }}>A recargos</span>
                                <div className="fw-semibold" style={{ color: COLORS.rojo }}>{formatMonto(desglose.aRecargos)}</div>
                              </Col>
                              <Col xs={6}>
                                <span style={{ color: COLORS.textoSecundario }}>A capital</span>
                                <div className="fw-semibold" style={{ color: COLORS.azul }}>{formatMonto(desglose.aCapital)}</div>
                              </Col>
                            </Row>
                          </div>
                        </Col>
                      )}
                    </Row>
                  )}

                  {/* PAGADA */}
                  {formData.nuevoEstado === 'pagada' && (
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Método de Pago <span className="text-danger">*</span></Form.Label>
                          <Form.Select name="metodoPago" value={formData.metodoPago} onChange={handleChange} className="rounded-3" disabled={loading}>
                            {metodosPago.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <div className="p-2 rounded-3 small" style={{ backgroundColor: COLORS.verdeSuave, color: COLORS.verde }}>
                          <i className="bi bi-info-circle me-1"></i>
                          Se cobrará el total de <strong>{formatMonto(totalCuotaConRecargos)}</strong>
                          {totalRecargosCuota > 0 && ` (incluye ${formatMonto(totalRecargosCuota)} de recargos)`}.
                        </div>
                      </Col>
                    </Row>
                  )}

                  {/* NO PAGADA */}
                  {formData.nuevoEstado === 'no pagada' && (
                    <div className="p-3 rounded-3 small" style={{ backgroundColor: COLORS.rojoSuave, color: COLORS.rojo }}>
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      <strong>Atención:</strong> Al marcar como No Pagada, la cuota entrará en mora y afectará la conducta del cliente.
                    </div>
                  )}

                  {/* PENDIENTE */}
                  {formData.nuevoEstado === 'pendiente' && (
                    <div className="p-3 rounded-3 small" style={{ backgroundColor: COLORS.ambarSuave, color: COLORS.ambar }}>
                      <i className="bi bi-info-circle me-1"></i>
                      La cuota volverá a estado pendiente, sin recargos ni pagos asociados a esta acción.
                    </div>
                  )}

                  {/* Motivo (para todos los estados) */}
                  <Form.Group className="mt-3">
                    <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>
                      <i className="bi bi-sticky me-1"></i>Motivo (opcional)
                    </Form.Label>
                    <Form.Control as="textarea" name="motivo" rows={2} value={formData.motivo} onChange={handleChange}
                      placeholder={
                        formData.nuevoEstado === 'pago parcial' ? 'Ej: Cliente abonó $5.000...' :
                        formData.nuevoEstado === 'pagada' ? 'Ej: Cliente abonó la cuota completa...' :
                        formData.nuevoEstado === 'no pagada' ? 'Ej: Cliente no pudo abonar...' :
                        'Ej: Error administrativo...'
                      }
                      className="rounded-3" disabled={loading} style={{ resize: 'none' }} />
                  </Form.Group>
                </div>
              )}
            </Col>

            {/* COLUMNA DERECHA: Resumen Sticky */}
            <Col lg={4}>
              <div className="rounded-3 p-3 sticky-top" style={{ backgroundColor: COLORS.azulOscuro, top: '1rem', color: '#fff' }}>
                <small className="text-uppercase fw-bold d-block mb-2" style={{ color: COLORS.azulSuave, letterSpacing: '1px', fontSize: '0.65rem' }}>
                  Resumen de la Cuota
                </small>
                
                <div className="mb-3">
                  <small style={{ color: COLORS.azulSuave }}>Cliente</small>
                  <div className="fw-semibold">{venta?.cliente?.nombre} {venta?.cliente?.apellido}</div>
                  <small style={{ color: COLORS.azulSuave }}>Cuota #{cuota?.numeroCuota} · Vence {formatFecha(cuota?.fechaCobro)}</small>
                </div>

                <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                <div className="mb-2 d-flex justify-content-between">
                  <small style={{ color: COLORS.azulSuave }}>Monto base</small>
                  <small className="fw-semibold">{formatMonto(cuota?.montoCuota)}</small>
                </div>
                {totalRecargosCuota > 0 && (
                  <div className="mb-2 d-flex justify-content-between">
                    <small style={{ color: COLORS.azulSuave }}>Recargos</small>
                    <small className="fw-semibold" style={{ color: COLORS.ambar }}>+{formatMonto(totalRecargosCuota)}</small>
                  </div>
                )}
                {montoPagadoAcumulado > 0 && (
                  <div className="mb-2 d-flex justify-content-between">
                    <small style={{ color: COLORS.azulSuave }}>Ya pagado</small>
                    <small className="fw-semibold" style={{ color: COLORS.verde }}>-{formatMonto(montoPagadoAcumulado)}</small>
                  </div>
                )}

                <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                <div className="d-flex justify-content-between align-items-end mb-2">
                  <small style={{ color: COLORS.azulSuave }}>Saldo pendiente</small>
                  <h3 className="fw-bold mb-0" style={{ color: '#fff' }}>{formatMonto(saldoPendiente)}</h3>
                </div>

                {formData.nuevoEstado && formData.nuevoEstado !== cuota?.estado_cuota && (
                  <div className="mt-3 p-2 rounded-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <small style={{ color: COLORS.azulSuave }} className="d-block">Nueva acción:</small>
                    <div className="fw-semibold" style={{ color: '#fff' }}>{getEstadoPreviewTitle()}</div>
                    {formData.nuevoEstado === 'pago parcial' && formData.montoParcial && (
                      <div className="fw-bold mt-1" style={{ color: COLORS.ambar }}>
                        Cobrando: {formatMonto(formData.montoParcial)}
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-100 rounded-3 py-2 mt-3" 
                  disabled={loading || !formData.nuevoEstado || formData.nuevoEstado === cuota?.estado_cuota}
                  style={{ backgroundColor: COLORS.verde, borderColor: COLORS.verde, color: '#fff', fontWeight: '600' }}
                >
                  {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-check-circle me-2"></i>Confirmar Cambio</>}
                </Button>
                <Button variant="link" className="w-100 rounded-3 mt-1 text-decoration-none" onClick={onHide} disabled={loading}
                  style={{ color: COLORS.azulSuave }}>
                  Cancelar
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};