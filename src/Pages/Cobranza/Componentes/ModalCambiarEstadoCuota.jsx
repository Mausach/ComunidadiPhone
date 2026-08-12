
import { cambiarEstadoCuota } from '../Helpers/EditarEstadoCuota';

// Cobranza/Componentes/ModalCambiarEstadoCuota.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Row, Col, Button, Alert, Spinner, Badge, InputGroup
} from 'react-bootstrap';


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

  // ==========================================
  // CÁLCULOS DE RECARGOS
  // ==========================================
  const totalRecargosCuota = cuota?.recargos?.reduce((s, r) => s + r.monto, 0) || 0;
  const totalCuotaConRecargos = (cuota?.montoCuota || 0) + totalRecargosCuota;
  const montoPagadoAcumulado = cuota?.montoPagado || 0;

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

    if (!cuota) { showAlert('No se encontró la cuota seleccionada', 'danger'); return; }
    if (!formData.nuevoEstado) { showAlert('Seleccioná un nuevo estado', 'warning'); return; }
    if (formData.nuevoEstado === cuota.estado_cuota) {
      showAlert(`La cuota ya está en estado "${getEstadoLabel(formData.nuevoEstado)}"`, 'warning');
      return;
    }

    // Validar monto parcial (incluye recargos)
    if (formData.nuevoEstado === 'pago parcial') {
      const monto = parseFloat(formData.montoParcial);
      if (!monto || monto <= 0) { showAlert('Ingresá el monto parcial cobrado', 'warning'); return; }

      const maximoPermitido = totalCuotaConRecargos - montoPagadoAcumulado;
      if (monto > maximoPermitido) {
        showAlert(`El monto parcial ($${monto.toLocaleString()}) supera el saldo pendiente ($${maximoPermitido.toLocaleString()}). Total cuota + recargos: $${totalCuotaConRecargos.toLocaleString()}`, 'warning');
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

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================
  const getEstadoColor = (e) => ({ 'pagada': 'success', 'pendiente': 'warning', 'pago parcial': 'info', 'no pagada': 'danger' })[e] || 'secondary';
  const getEstadoLabel = (e) => ({ 'pagada': 'Pagada ✅', 'pendiente': 'Pendiente ⏳', 'pago parcial': 'Pago Parcial 💰', 'no pagada': 'No pagada ❌' })[e] || e;
  const getEstadoIcono = (e) => ({ 'pagada': 'bi-check-circle-fill', 'pendiente': 'bi-clock-fill', 'pago parcial': 'bi-wallet2', 'no pagada': 'bi-x-circle-fill' })[e] || 'bi-circle';
  const formatMonto = (m) => !m && m !== 0 ? '$0' : `$${m.toLocaleString('es-AR')}`;
  const formatFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const opcionesEstado = [
    { value: 'pendiente', label: 'Pendiente ⏳', color: 'warning' },
    { value: 'pagada', label: 'Pagada ✅', color: 'success' },
    { value: 'pago parcial', label: 'Pago Parcial 💰', color: 'info' },
    { value: 'no pagada', label: 'No pagada ❌', color: 'danger' }
  ];

  const getConductaPreview = () => {
    if (formData.nuevoEstado === 'pagada') return 'Al actualizar a Pagada, la conducta de pago podría mejorar.';
    if (formData.nuevoEstado === 'pago parcial') return 'Se registra un pago parcial. Primero se pagan recargos, luego capital.';
    if (formData.nuevoEstado === 'no pagada') return '⚠️ Al marcar como No pagada, la conducta de pago podría empeorar.';
    return 'El cambio de estado puede afectar la conducta de pago del cliente.';
  };

  // Calcular cómo se distribuye el pago parcial (primero recargos, luego capital)
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

  return (
    <Modal show={show} onHide={onHide} size="md" centered className="cambiar-estado-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-arrow-left-right me-2" style={{ color: '#6f42c1' }}></i>Cambiar Estado de Cuota
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {cuota && (
          <div className="bg-light rounded-3 p-3 mb-3">
            <Row>
              <Col md={4}><div className="text-muted small">Cuota</div><div className="fw-semibold">#{cuota.numeroCuota}</div></Col>
              <Col md={4}><div className="text-muted small">Monto base</div><div className="fw-semibold">{formatMonto(cuota.montoCuota)}</div></Col>
              <Col md={4}>
                <div className="text-muted small">Estado actual</div>
                <Badge bg={getEstadoColor(cuota.estado_cuota)} className="mt-1">
                  <i className={`${getEstadoIcono(cuota.estado_cuota)} me-1`}></i>{getEstadoLabel(cuota.estado_cuota)}
                </Badge>
              </Col>
              {totalRecargosCuota > 0 && (
                <Col md={12} className="mt-2">
                  <div className="text-muted small">Recargos acumulados</div>
                  <div className="fw-semibold text-danger">{formatMonto(totalRecargosCuota)}</div>
                </Col>
              )}
              <Col md={12} className="mt-2">
                <div className="text-muted small">Total a pagar (con recargos)</div>
                <div className="fw-semibold">{formatMonto(totalCuotaConRecargos)}</div>
              </Col>
              {montoPagadoAcumulado > 0 && (
                <Col md={12} className="mt-2">
                  <div className="text-muted small">Ya pagado</div>
                  <div className="fw-semibold text-success">{formatMonto(montoPagadoAcumulado)}</div>
                </Col>
              )}
              <Col md={12} className="mt-2"><div className="text-muted small">Fecha de cobro</div><div className="fw-semibold">{formatFecha(cuota.fechaCobro)}</div></Col>
              {cuota.fechaCobrada && (
                <Col md={12} className="mt-2"><div className="text-muted small">Fecha cobrada</div><div className="fw-semibold text-success">{formatFecha(cuota.fechaCobrada)}</div></Col>
              )}
            </Row>
          </div>
        )}

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
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary">Nuevo estado <span className="text-danger">*</span></Form.Label>
            <div className="d-flex gap-2 flex-wrap">
              {opcionesEstado.map((opcion) => (
                <Button key={opcion.value}
                  variant={formData.nuevoEstado === opcion.value ? opcion.color : 'outline-secondary'}
                  className={`rounded-3 flex-grow-1 ${formData.nuevoEstado === opcion.value ? 'fw-semibold text-white' : ''}`}
                  onClick={() => {
                    setFormData({ ...formData, nuevoEstado: opcion.value, montoParcial: opcion.value === 'pago parcial' ? formData.montoParcial : '' });
                    if (alert.show) setAlert({ show: false, message: '', variant: 'danger' });
                  }}
                  disabled={loading}
                  style={{
                    backgroundColor: formData.nuevoEstado === opcion.value ?
                      (opcion.color === 'warning' ? '#ffc107' : opcion.color === 'success' ? '#28a745' : opcion.color === 'info' ? '#0dcaf0' : opcion.color === 'danger' ? '#dc3545' : '#6c757d') : 'transparent',
                    borderColor: formData.nuevoEstado === opcion.value ?
                      (opcion.color === 'warning' ? '#ffc107' : opcion.color === 'success' ? '#28a745' : opcion.color === 'info' ? '#0dcaf0' : opcion.color === 'danger' ? '#dc3545' : '#6c757d') : '',
                    transition: 'all 0.2s ease'
                  }}>
                  <i className={`${getEstadoIcono(opcion.value)} me-1`}></i>{opcion.label}
                </Button>
              ))}
            </div>
            <Form.Text className="text-muted small d-block mt-1">
              <i className="bi bi-info-circle me-1"></i>
              {formData.nuevoEstado && formData.nuevoEstado !== cuota?.estado_cuota ? (
                <span className="text-warning">⚠️ Vas a cambiar de "{getEstadoLabel(cuota?.estado_cuota)}" a "{getEstadoLabel(formData.nuevoEstado)}"</span>
              ) : 'Seleccioná el nuevo estado de la cuota'}
            </Form.Text>
          </Form.Group>

          {formData.nuevoEstado && formData.nuevoEstado !== cuota?.estado_cuota && (
            <div className={`rounded-3 p-2 mb-3 ${formData.nuevoEstado === 'pagada' ? 'bg-success bg-opacity-10' : formData.nuevoEstado === 'pago parcial' ? 'bg-info bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
              <small className="text-muted d-flex align-items-center gap-1">
                <i className={`bi ${formData.nuevoEstado === 'pagada' ? 'bi-check-circle text-success' : formData.nuevoEstado === 'pago parcial' ? 'bi-wallet2 text-info' : 'bi-exclamation-triangle text-danger'}`}></i>
                {getConductaPreview()}
              </small>
            </div>
          )}

          {/* PAGO PARCIAL */}
          {formData.nuevoEstado === 'pago parcial' && (
            <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f0f9ff' }}>
              <h6 className="fw-bold text-info mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-cash me-2"></i>Detalle del Pago Parcial
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Monto Cobrado ($) <span className="text-danger">*</span></Form.Label>
                    <InputGroup className="rounded-3">
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control type="number" name="montoParcial" value={formData.montoParcial} onChange={handleChange}
                        placeholder="0" className="rounded-end-3" disabled={loading} min={1}
                        max={totalCuotaConRecargos - montoPagadoAcumulado} step="any" />
                    </InputGroup>
                    <Form.Text className="text-muted small">
                      Saldo pendiente: {formatMonto(totalCuotaConRecargos - montoPagadoAcumulado)}
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Método de Pago <span className="text-danger">*</span></Form.Label>
                    <Form.Select name="metodoPago" value={formData.metodoPago} onChange={handleChange} className="rounded-3" disabled={loading}>
                      {metodosPago.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              {formData.montoParcial && parseFloat(formData.montoParcial) > 0 && cuota && (
                <div className="mt-3 p-2 bg-white rounded-3 border">
                  <Row className="text-center small">
                    <Col xs={6}><div className="text-muted">Total cuota + recargos</div><strong>{formatMonto(totalCuotaConRecargos)}</strong></Col>
                    <Col xs={6}><div className="text-muted">Saldo pendiente</div><strong className="text-danger">{formatMonto(totalCuotaConRecargos - montoPagadoAcumulado - parseFloat(formData.montoParcial || 0))}</strong></Col>
                  </Row>
                  {(desglose.aRecargos > 0 || desglose.aCapital > 0) && (
                    <Row className="text-center small mt-2 pt-2 border-top">
                      <Col xs={6}>
                        <div className="text-muted">A recargos</div>
                        <strong className="text-danger">{formatMonto(desglose.aRecargos)}</strong>
                      </Col>
                      <Col xs={6}>
                        <div className="text-muted">A capital</div>
                        <strong className="text-primary">{formatMonto(desglose.aCapital)}</strong>
                      </Col>
                    </Row>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PAGADA */}
          {formData.nuevoEstado === 'pagada' && (
            <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f0fff4' }}>
              <h6 className="fw-bold text-success mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-credit-card me-2"></i>Método de Pago
              </h6>
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary">¿Cómo pagó? <span className="text-danger">*</span></Form.Label>
                <Form.Select name="metodoPago" value={formData.metodoPago} onChange={handleChange} className="rounded-3" disabled={loading}>
                  {metodosPago.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </Form.Select>
              </Form.Group>
              {totalRecargosCuota > 0 && (
                <div className="mt-2 p-2 bg-white rounded-3 border">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Se cobrará el total de <strong>{formatMonto(totalCuotaConRecargos)}</strong> (incluye {formatMonto(totalRecargosCuota)} de recargos). Los recargos se limpiarán automáticamente.
                  </small>
                </div>
              )}
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small text-secondary"><i className="bi bi-sticky me-1"></i>Motivo del cambio (opcional)</Form.Label>
            <Form.Control as="textarea" name="motivo" rows={2} value={formData.motivo} onChange={handleChange}
              placeholder={formData.nuevoEstado === 'pago parcial' ? 'Ej: Cliente abonó $5.000...' : formData.nuevoEstado === 'pagada' ? 'Ej: Cliente abonó la cuota completa...' : 'Ej: Cliente no pudo abonar esta cuota...'}
              className="rounded-3" disabled={loading} />
          </Form.Group>

          <div className="d-flex gap-2 justify-content-end pt-3 mt-3 border-top">
            <Button variant="secondary" onClick={onHide} className="rounded-3" disabled={loading}><i className="bi bi-x-circle me-1"></i>Cancelar</Button>
            <Button variant="primary" type="submit" className="rounded-3 px-4"
              style={{ backgroundColor: '#6f42c1', borderColor: '#6f42c1', fontWeight: '500' }}
              disabled={loading || !formData.nuevoEstado || formData.nuevoEstado === cuota?.estado_cuota}>
              {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-check-circle me-2"></i>Cambiar Estado</>}
            </Button>
          </div>
        </Form>
      </Modal.Body>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .cambiar-estado-modal .modal-dialog { max-width: 580px; }
        .cambiar-estado-modal .modal-content { border-radius: 16px; overflow: hidden; }
        .cambiar-estado-modal .modal-body { padding: 1.5rem; }
        @media (max-width: 768px) { .cambiar-estado-modal .modal-dialog { max-width: 100%; margin: 1rem; } }
      `}</style>
    </Modal>
  );
};