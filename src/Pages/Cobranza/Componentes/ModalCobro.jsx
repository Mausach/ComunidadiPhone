// Cobranza/Componentes/ModalCobro.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Row, Col, Button, Alert, Spinner, Card, InputGroup
} from 'react-bootstrap';
import { cobrarCuotas } from '../Helpers/CobrarCuotas';
import { COLORS } from '../Helperss/colors'; // Ajustá la ruta

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

export const ModalCobro = ({
  show, onHide, venta, cuotaSeleccionada, onSuccess, usuario
}) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });
  const [formData, setFormData] = useState({ cuotas: [], nota: '' });


  // ==========================================
  // INICIALIZAR FORMULARIO
  // ==========================================
  useEffect(() => {
    if (show && venta) {
      const cuotasBase = Array.isArray(venta.cuotas) ? venta.cuotas : [];
      let seleccionInicial = [];

      if (cuotaSeleccionada) {
        const cuota = cuotasBase.find(c => c.numeroCuota === cuotaSeleccionada.numeroCuota);
        if (cuota) {
          const totalRecargos = (cuota.recargos || []).reduce((s, r) => s + r.monto, 0);
          const saldoReal = (cuota.montoCuota || 0) + totalRecargos - (cuota.montoPagado || 0);
          seleccionInicial = [{
            numeroCuota: cuota.numeroCuota,
            montoCuota: cuota.montoCuota || 0,
            totalRecargos,
            saldoReal,
            pagos: [{ monto: saldoReal, metodo: 'efectivo' }],
            seleccionada: true
          }];
        }
      } else {
        seleccionInicial = cuotasBase
          .filter(c => c.estado_cuota === 'pendiente' || c.estado_cuota === 'pago parcial')
          .map(c => {
            const totalRecargos = (c.recargos || []).reduce((s, r) => s + r.monto, 0);
            const saldoReal = (c.montoCuota || 0) + totalRecargos - (c.montoPagado || 0);
            return {
              numeroCuota: c.numeroCuota,
              montoCuota: c.montoCuota || 0,
              totalRecargos,
              saldoReal,
              pagos: [{ monto: saldoReal, metodo: 'efectivo' }],
              seleccionada: false
            };
          });
      }

      setFormData({ cuotas: seleccionInicial, nota: '' });
    }
  }, [show, venta, cuotaSeleccionada]);

  // ==========================================
  // MANEJADORES
  // ==========================================
  const showAlert = (message, variant = 'danger') => {
    if (!message) { setAlert({ show: false, message: '', variant: 'danger' }); return; }
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  const toggleCuota = (numeroCuota) => {
    setFormData(prev => ({
      ...prev,
      cuotas: prev.cuotas.map(c => c.numeroCuota === numeroCuota ? { ...c, seleccionada: !c.seleccionada } : c)
    }));
  };

  const handlePagoChange = (numeroCuota, pagoIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      cuotas: prev.cuotas.map(c => {
        if (c.numeroCuota === numeroCuota) {
          const nuevosPagos = [...c.pagos];
          nuevosPagos[pagoIndex] = { ...nuevosPagos[pagoIndex], [field]: value };
          return { ...c, pagos: nuevosPagos };
        }
        return c;
      })
    }));
  };

  const agregarPagoMixto = (numeroCuota) => {
    setFormData(prev => ({
      ...prev,
      cuotas: prev.cuotas.map(c => {
        if (c.numeroCuota === numeroCuota) {
          // Si ya hay 1 pago y se agrega otro, dividimos el saldo para ayudar al usuario
          if (c.pagos.length === 1 && parseFloat(c.pagos[0].monto) > 0) {
            const totalActual = parseFloat(c.pagos[0].monto);
            const mitad = Math.round(totalActual / 2);
            return {
              ...c,
              pagos: [
                { monto: mitad, metodo: 'efectivo' },
                { monto: totalActual - mitad, metodo: 'transferencia' }
              ]
            };
          }
          return { ...c, pagos: [...c.pagos, { monto: 0, metodo: 'transferencia' }] };
        }
        return c;
      })
    }));
  };

  const eliminarPagoMixto = (numeroCuota, pagoIndex) => {
    setFormData(prev => ({
      ...prev,
      cuotas: prev.cuotas.map(c => {
        if (c.numeroCuota === numeroCuota) {
          return { ...c, pagos: c.pagos.filter((_, i) => i !== pagoIndex) };
        }
        return c;
      })
    }));
  };

  // ==========================================
  // CÁLCULOS
  // ==========================================
  const cuotasSeleccionadas = formData.cuotas.filter(c => c.seleccionada);

  const calcularTotalCobrar = () => {
    return cuotasSeleccionadas.reduce((total, c) => {
      return total + c.pagos.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
    }, 0);
  };

  const calcularSaldoCuota = (c) => {
    const totalPagado = c.pagos.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
    return c.saldoReal - totalPagado;
  };

  const calcularTotalSaldoReal = () => {
    return cuotasSeleccionadas.reduce((sum, c) => sum + c.saldoReal, 0);
  };

  // ==========================================
  // ENVÍO DEL FORMULARIO
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cuotasSeleccionadas.length === 0) {
      showAlert('Seleccioná al menos una cuota', 'warning');
      return;
    }

    // ==========================================
    // VALIDACIONES POR CUOTA
    // ==========================================
    for (const cuota of cuotasSeleccionadas) {
      const pagosValidos = cuota.pagos.filter(p => parseFloat(p.monto) > 0);
      const totalPagado = pagosValidos.reduce((sum, p) => sum + parseFloat(p.monto), 0);
      const saldoReal = cuota.saldoReal;

      // 1. Debe tener al menos un pago
      if (pagosValidos.length === 0) {
        showAlert(`La cuota #${cuota.numeroCuota} no tiene ningún pago cargado`, 'warning');
        return;
      }

      // 2. Si es mixto, debe tener al menos 2 métodos distintos
      if (pagosValidos.length >= 2) {
        const metodosUnicos = new Set(pagosValidos.map(p => p.metodo));
        if (metodosUnicos.size < 2) {
          showAlert(`La cuota #${cuota.numeroCuota} tiene 2 pagos pero con el mismo método. Usá al menos 2 métodos distintos.`, 'warning');
          return;
        }
      }

      // 3. La suma debe coincidir con el saldo real (± $1 por redondeo)
      if (Math.abs(totalPagado - saldoReal) > 1) {
        showAlert(
          `La cuota #${cuota.numeroCuota} tiene un saldo de ${formatMonto(saldoReal)} pero estás cobrando ${formatMonto(totalPagado)}. Ajustá los montos.`,
          'warning'
        );
        return;
      }
    }

    setLoading(true);
    try {
      // ==========================================
      // ARMAR PAYLOAD (Compatibilidad con Mixto)
      // ==========================================
      const cuotasPayload = cuotasSeleccionadas.map(c => {
        const pagosValidos = c.pagos
          .filter(p => parseFloat(p.monto) > 0)
          .map(p => ({
            metodo: p.metodo,
            monto: parseFloat(p.monto)
          }));

        const esMixto = pagosValidos.length > 1;
        const totalPagado = pagosValidos.reduce((sum, p) => sum + p.monto, 0);

        return {
          numeroCuota: c.numeroCuota,
          metodoPago: esMixto ? 'mixto' : pagosValidos[0].metodo,
          montoPagado: totalPagado, // El backend lo usa como total
          pagos: pagosValidos      // Obligatorio cuando es mixto
        };
      });
      console.log(usuario)
      const payload = {
        idVenta: venta._id,
        cuotas: cuotasPayload,
        cobrador: {
          nombre: usuario?.nombre + ' ' + usuario?.apellido || 'Sistema'
        },
        nota: formData.nota || '' // Si está vacío, el backend genera su propia auditoría
      };

      console.log('📤 Payload enviado:', payload); // Debug rápido

      const result = await cobrarCuotas(payload);
      showAlert(result.message || 'Cuotas cobradas exitosamente', 'success');
      setTimeout(() => { onHide(); if (onSuccess) onSuccess(); }, 1500);
    } catch (error) {
      showAlert(error.message || 'Error al procesar el cobro', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HELPERS VISUALES
  // ==========================================
  const formatMonto = (monto) => !monto && monto !== 0 ? '$0' : `$${Number(monto).toLocaleString('es-AR')}`;
  const formatFecha = (fecha) => !fecha ? '-' : new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo', icon: 'cash-coin' },
    { value: 'transferencia', label: 'Transferencia', icon: 'bank' },
    { value: 'dolares', label: 'Dólares', icon: 'currency-dollar' },
    { value: 'cripto', label: 'Cripto', icon: 'currency-bitcoin' },
    { value: 'tarjeta_credito', label: 'Tarjeta', icon: 'credit-card' }
  ];

  const cuotasVenta = Array.isArray(venta?.cuotas) ? venta.cuotas : [];

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="cobro-modal">
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
          <i className="bi bi-coin me-2" style={{ color: COLORS.verde }}></i>Registrar Cobro
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

            {/* COLUMNA IZQUIERDA: Lista de Cuotas */}
            <Col lg={8}>
              <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                    <i className="bi bi-list-check me-2"></i>Cuotas a Cobrar
                  </h6>
                  <small style={{ color: COLORS.textoSecundario }}>{cuotasSeleccionadas.length} seleccionada(s)</small>
                </div>

                {cuotasVenta.filter(c => c.estado_cuota === 'pendiente' || c.estado_cuota === 'pago parcial').length === 0 ? (
                  <Alert variant="info" className="rounded-3 border-0 mb-0" style={{ backgroundColor: COLORS.azulSuave, color: COLORS.azul }}>
                    <i className="bi bi-info-circle me-2"></i>No hay cuotas pendientes para cobrar
                  </Alert>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {formData.cuotas.map((c) => {
                      const cuotaOriginal = cuotasVenta.find(cv => cv.numeroCuota === c.numeroCuota);
                      const saldo = calcularSaldoCuota(c);

                      return (
                        <div key={c.numeroCuota}
                          className="rounded-3 overflow-hidden"
                          style={{
                            backgroundColor: COLORS.cardBg,
                            border: `2px solid ${c.seleccionada ? COLORS.verde : COLORS.bordes}`,
                            transition: 'all 0.2s'
                          }}>

                          {/* Header de la Cuota */}
                          <div className="p-3 d-flex justify-content-between align-items-center"
                            style={{ cursor: 'pointer', backgroundColor: c.seleccionada ? COLORS.verdeSuave : 'transparent' }}
                            onClick={() => toggleCuota(c.numeroCuota)}>
                            <div className="d-flex align-items-center gap-3">
                              <Form.Check type="checkbox" checked={c.seleccionada} onChange={() => toggleCuota(c.numeroCuota)}
                                style={{ transform: 'scale(1.2)' }} onClick={(e) => e.stopPropagation()} />
                              <div>
                                <div className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
                                  Cuota #{c.numeroCuota}
                                  {cuotaOriginal?.diasAtraso > 0 && (
                                    <Pill bg={COLORS.rojoSuave} color={COLORS.rojo} style={{ marginLeft: '8px' }}>
                                      {cuotaOriginal.diasAtraso}d atraso
                                    </Pill>
                                  )}
                                </div>
                                <small style={{ color: COLORS.textoSecundario }}>
                                  Vence {formatFecha(cuotaOriginal?.fechaCobro)} · Base {formatMonto(c.montoCuota)}
                                  {c.totalRecargos > 0 && ` + ${formatMonto(c.totalRecargos)} recargos`}
                                </small>
                              </div>
                            </div>
                            <div className="text-end">
                              <small style={{ color: COLORS.textoSecundario }}>Saldo Real</small>
                              <div className="fw-bold" style={{ color: COLORS.rojo, fontSize: '1.1rem' }}>{formatMonto(c.saldoReal)}</div>
                            </div>
                          </div>

                          {/* Detalle de Pagos (solo si está seleccionada) */}
                          {c.seleccionada && (
                            <div className="p-3" style={{ backgroundColor: COLORS.bgGeneral, borderTop: `1px solid ${COLORS.bordes}` }}>
                              <small className="d-block mb-2 fw-semibold" style={{ color: COLORS.textoSecundario }}>
                                <i className="bi bi-wallet2 me-1"></i>Desglose de Pago (Mixto permitido):
                              </small>

                              {c.pagos.map((pago, pIdx) => (
                                <Row key={pIdx} className="g-2 mb-2 align-items-center">
                                  <Col xs={5} md={4}>
                                    <Form.Select
                                      value={pago.metodo}
                                      onChange={(e) => handlePagoChange(c.numeroCuota, pIdx, 'metodo', e.target.value)}
                                      className="rounded-3 border-0 bg-white"
                                      style={{ fontSize: '0.85rem' }}
                                    >
                                      {metodosPago.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </Form.Select>
                                  </Col>
                                  <Col xs={5} md={6}>
                                    <InputGroup size="sm">
                                      <InputGroup.Text style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.bordes }}>$</InputGroup.Text>
                                      <Form.Control
                                        type="number"
                                        value={pago.monto}
                                        onChange={(e) => handlePagoChange(c.numeroCuota, pIdx, 'monto', e.target.value)}
                                        className="border-0"
                                        style={{ fontSize: '0.85rem' }}
                                        min={0} step={100}
                                      />
                                    </InputGroup>
                                  </Col>
                                  <Col xs={2} className="d-flex gap-1">
                                    {c.pagos.length > 1 ? (
                                      <Button variant="link" size="sm" className="p-0 text-danger" onClick={() => eliminarPagoMixto(c.numeroCuota, pIdx)}>
                                        <i className="bi bi-trash3"></i>
                                      </Button>
                                    ) : (
                                      <Button variant="link" size="sm" className="p-0" style={{ color: COLORS.textoSecundario }} disabled>
                                        <i className="bi bi-dash"></i>
                                      </Button>
                                    )}
                                  </Col>
                                </Row>
                              ))}

                              <div className="d-flex justify-content-between align-items-center mt-2">
                                <Button variant="link" size="sm" className="p-0 text-decoration-none"
                                  onClick={() => agregarPagoMixto(c.numeroCuota)}
                                  style={{ color: COLORS.azul, fontSize: '0.8rem', fontWeight: 600 }}>
                                  <i className="bi bi-plus-circle me-1"></i>Agregar método de pago
                                </Button>

                                {saldo > 0 ? (
                                  <Pill bg={COLORS.ambarSuave} color={COLORS.ambar}>
                                    Falta cobrar {formatMonto(saldo)}
                                  </Pill>
                                ) : saldo < 0 ? (
                                  <Pill bg={COLORS.rojoSuave} color={COLORS.rojo}>
                                    Excede por {formatMonto(Math.abs(saldo))}
                                  </Pill>
                                ) : (
                                  <Pill bg={COLORS.verdeSuave} color={COLORS.verde} icon="check-circle">
                                    Saldo cubierto
                                  </Pill>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Nota */}
              <div className="rounded-3 p-3 mt-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>
                  <i className="bi bi-sticky me-1"></i>Nota del cobro (opcional)
                </Form.Label>
                <Form.Control as="textarea" rows={2} value={formData.nota}
                  onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                  placeholder="Ej: El cliente entregó $5.000 en efectivo y el resto por transferencia..."
                  className="rounded-3" disabled={loading} style={{ resize: 'none' }} />
              </div>
            </Col>

            {/* COLUMNA DERECHA: Resumen Sticky */}
            <Col lg={4}>
              <div className="rounded-3 p-3 sticky-top" style={{ backgroundColor: COLORS.azulOscuro, top: '1rem', color: '#fff' }}>
                <small className="text-uppercase fw-bold d-block mb-2" style={{ color: COLORS.azulSuave, letterSpacing: '1px', fontSize: '0.65rem' }}>
                  Resumen del Cobro
                </small>

                <div className="mb-3">
                  <small style={{ color: COLORS.azulSuave }}>Cliente</small>
                  <div className="fw-semibold">{venta?.cliente?.nombre} {venta?.cliente?.apellido}</div>
                  <small style={{ color: COLORS.azulSuave }}>DNI: {venta?.cliente?.dni}</small>
                </div>

                <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small style={{ color: COLORS.azulSuave }}>Total a cobrar</small>
                    <h3 className="fw-bold mb-0" style={{ color: '#fff' }}>{formatMonto(calcularTotalCobrar())}</h3>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small style={{ color: COLORS.azulSuave }}>Total real</small>
                    <small style={{ color: COLORS.azulSuave }}>{formatMonto(calcularTotalSaldoReal())}</small>
                  </div>
                </div>

                <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                <div className="d-flex flex-column gap-2 mb-3">
                  <small style={{ color: COLORS.azulSuave }}><i className="bi bi-pie-chart me-1"></i>Distribución:</small>
                  {cuotasSeleccionadas.length === 0 ? (
                    <small style={{ color: COLORS.azulSuave }}>Ninguna cuota seleccionada</small>
                  ) : (
                    metodosPago.map(m => {
                      const totalMetodo = cuotasSeleccionadas.reduce((sum, c) => {
                        return sum + c.pagos
                          .filter(p => p.metodo === m.value)
                          .reduce((s, p) => s + (parseFloat(p.monto) || 0), 0);
                      }, 0);

                      if (totalMetodo === 0) return null;
                      return (
                        <div key={m.value} className="d-flex justify-content-between align-items-center">
                          <small><i className={`bi bi-${m.icon} me-1`}></i>{m.label}</small>
                          <small className="fw-semibold">{formatMonto(totalMetodo)}</small>
                        </div>
                      );
                    })
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-100 rounded-3 py-2"
                  disabled={loading || cuotasSeleccionadas.length === 0}
                  style={{ backgroundColor: COLORS.verde, borderColor: COLORS.verde, color: '#fff', fontWeight: '600' }}
                >
                  {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Procesando...</> : <><i className="bi bi-check-circle me-2"></i>Confirmar Cobro</>}
                </Button>
                <Button variant="link" className="w-100 rounded-3 mt-2 text-decoration-none" onClick={onHide} disabled={loading}
                  style={{ color: COLORS.azulSuave }}>
                  Cancelar
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <style>{`
        .cobro-modal .modal-content { border-radius: 16px; }
        .cobro-modal .modal-body { max-height: 85vh; overflow-y: auto; }
        .cobro-modal .modal-body::-webkit-scrollbar { width: 6px; }
        .cobro-modal .modal-body::-webkit-scrollbar-thumb { background: ${COLORS.bordes}; border-radius: 3px; }
        @media (max-width: 991px) {
          .cobro-modal .modal-body { max-height: 90vh; }
        }
      `}</style>
    </Modal>
  );
};

