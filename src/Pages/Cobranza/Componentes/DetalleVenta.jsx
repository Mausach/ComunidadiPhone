// Cobranza/Componentes/DetalleVenta.jsx

import React, { useState, useEffect } from 'react';
import { 
  Modal, Row, Col, Badge, Button, Card, 
  Table, Spinner, Alert, ProgressBar 
} from 'react-bootstrap';
import { obtenerDetalleVenta } from '../Helpers/DetalleVenta';
import { ModalCobro } from './ModalCobro';
import { ModalEditarFechaCuota } from './ModalEditarFechaCuota';
import { ModalEditarMontoCuota } from './ModalEditarMontoCuota';
import { ModalCambiarEstadoCuota } from './ModalCambiarEstadoCuota';
import { ModalAgregarNotaCuota } from './ModalAgregarNotaCuota';
import { ModalAgregarRecargo } from './ModalAgregarRecargo';

// Cobranza/Componentes/DetalleVenta.jsx

import { generarReciboPago } from '../Helpers/GenerarComprobanteCuotaPdf';


export const DetalleVenta = ({ 
  show, onHide, ventaId, onCobrar, onRefresh, usuario 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [venta, setVenta] = useState(null);

  const [showEditarFecha, setShowEditarFecha] = useState(false);
  const [showEditarMonto, setShowEditarMonto] = useState(false);
  const [showCambiarEstado, setShowCambiarEstado] = useState(false);
  const [showAgregarNota, setShowAgregarNota] = useState(false);
  const [showCobro, setShowCobro] = useState(false);
  const [showRecargo, setShowRecargo] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);

  useEffect(() => {
    if (show && ventaId) cargarDetalle();
  }, [show, ventaId]);

  const cargarDetalle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await obtenerDetalleVenta(ventaId);
      if (result.success) setVenta(result.venta);
    } catch (error) {
      setError(error.message || 'Error al cargar el detalle de la venta');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================
  const getConductaColor = (c) => ({
    'al dia': 'success', 'atrasado': 'danger', 'cancelado': 'secondary',
    'refinanciado': 'info', 'cobro judicial': 'dark', 'caducado': 'secondary'
  })[c] || 'secondary';

  const getConductaLabel = (c) => ({
    'al dia': 'Al día', 'atrasado': 'Atrasado', 'cancelado': 'Cancelado',
    'refinanciado': 'Refinanciado', 'cobro judicial': 'Cobro Judicial', 'caducado': 'Caducado'
  })[c] || c;

  const getEstadoCuotaColor = (e) => ({
    'pagada': 'success', 'pendiente': 'warning', 'pago parcial': 'info', 'no pagada': 'danger'
  })[e] || 'secondary';

  const getEstadoCuotaLabel = (e) => ({
    'pagada': 'Pagada ✅', 'pendiente': 'Pendiente ⏳', 'pago parcial': 'Pago Parcial 💰', 'no pagada': 'No pagada ❌'
  })[e] || e;

  const formatFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatFechaCompleta = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatMonto = (m) => !m && m !== 0 ? '$0' : `$${m.toLocaleString('es-AR')}`;

  // ==========================================
  // CÁLCULOS PARA EL DETALLE
  // ==========================================
  const totalCuotasMonto = venta?.cuotas?.reduce((s, c) => s + c.montoCuota, 0) || 0;
  const totalRecargos = venta?.cuotas?.reduce((s, c) => s + (c.recargos?.reduce((rs, r) => rs + r.monto, 0) || 0), 0) || 0;
  const totalPagadoCuotas = venta?.cuotas?.reduce((s, c) => s + (c.montoPagado || 0), 0) || 0;
  const totalPendienteReal = totalCuotasMonto + totalRecargos - totalPagadoCuotas;
  const cuotasPagadas = venta?.cuotas?.filter(c => c.estado_cuota === 'pagada').length || 0;
  const totalCuotas = venta?.cuotas?.length || 0;
  const porcentajeCuotas = totalCuotas > 0 ? Math.round((cuotasPagadas / totalCuotas) * 100) : 0;

  // ==========================================
  // MANEJADORES DE MODALES
  // ==========================================
  const handleAbrirRecargo = (cuota) => { setCuotaSeleccionada(cuota); setShowRecargo(true); };
  const handleRecargoExitoso = () => { setShowRecargo(false); setCuotaSeleccionada(null); cargarDetalle(); if (onRefresh) onRefresh(); };
  const handleAbrirCobro = (cuota) => { setCuotaSeleccionada(cuota); setShowCobro(true); };
  const handleCobroExitoso = () => { setShowCobro(false); setCuotaSeleccionada(null); cargarDetalle(); if (onRefresh) onRefresh(); };
  const handleAbrirEditarFecha = (cuota) => { setCuotaSeleccionada(cuota); setShowEditarFecha(true); };
  const handleEditarFechaExitoso = () => { setShowEditarFecha(false); setCuotaSeleccionada(null); cargarDetalle(); if (onRefresh) onRefresh(); };
  const handleAbrirEditarMonto = (cuota) => { setCuotaSeleccionada(cuota); setShowEditarMonto(true); };
  const handleEditarMontoExitoso = () => { setShowEditarMonto(false); setCuotaSeleccionada(null); cargarDetalle(); if (onRefresh) onRefresh(); };
  const handleAbrirCambiarEstado = (cuota) => { setCuotaSeleccionada(cuota); setShowCambiarEstado(true); };
  const handleCambiarEstadoExitoso = () => { setShowCambiarEstado(false); setCuotaSeleccionada(null); cargarDetalle(); if (onRefresh) onRefresh(); };
  const handleAbrirAgregarNota = (cuota) => { setCuotaSeleccionada(cuota); setShowAgregarNota(true); };
  const handleAgregarNotaExitoso = () => { setShowAgregarNota(false); setCuotaSeleccionada(null); cargarDetalle(); if (onRefresh) onRefresh(); };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" centered className="detalle-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            <i className="bi bi-file-text me-2" style={{ color: '#3483FA' }}></i>Detalle de Venta
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-3">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" className="mb-3" /><p className="text-muted">Cargando...</p></div>
          ) : error ? (
            <Alert variant="danger" className="rounded-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-3" style={{ fontSize: '1.5rem' }}></i>
                <div><h6 className="fw-bold mb-1">Error al cargar el detalle</h6><p className="mb-0 text-muted small">{error}</p></div>
                <Button variant="outline-danger" className="ms-auto rounded-3" onClick={cargarDetalle} size="sm"><i className="bi bi-arrow-counterclockwise me-1"></i>Reintentar</Button>
              </div>
            </Alert>
          ) : venta ? (
            <>
              {/* ==========================================
                  SECCIÓN 1: CLIENTE Y PRODUCTO
                  ========================================== */}
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Card className="border-0 bg-light" style={{ borderRadius: '12px' }}>
                    <Card.Body className="p-3">
                      <h6 className="fw-bold text-primary mb-2" style={{ fontSize: '0.85rem' }}><i className="bi bi-person me-2"></i>Cliente</h6>
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                          style={{ width: '48px', height: '48px', backgroundColor: '#e6f3ff', color: '#3483FA', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {venta.cliente?.nombre?.charAt(0)}{venta.cliente?.apellido?.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-semibold">{venta.cliente?.nombre} {venta.cliente?.apellido}</div>
                          <div className="text-muted small"><i className="bi bi-person-badge me-1"></i>DNI: {venta.cliente?.dni || '-'}</div>
                          <div className="text-muted small"><i className="bi bi-telephone me-1"></i>{venta.cliente?.telefono || '-'}</div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light" style={{ borderRadius: '12px' }}>
                    <Card.Body className="p-3">
                      <h6 className="fw-bold text-secondary mb-2" style={{ fontSize: '0.85rem' }}><i className="bi bi-phone me-2"></i>Producto</h6>
                      <div>
                        <div className="fw-semibold">{venta.producto?.nombre}</div>
                        {venta.producto?.modelo && <div className="text-muted small"><i className="bi bi-tag me-1"></i>Modelo: {venta.producto.modelo}</div>}
                        {venta.producto?.imei && <div className="text-muted small"><i className="bi bi-qr-code me-1"></i>IMEI: {venta.producto.imei}</div>}
                        <div className="text-muted small"><i className="bi bi-circle me-1"></i>Estado: {venta.producto?.estado || '-'}</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* ==========================================
                  SECCIÓN 2: RESUMEN DE MONTOS
                  ========================================== */}
              <Row className="g-3 mb-4">
                <Col md={3}>
                  <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '12px' }}>
                    <Card.Body className="py-3"><small className="text-muted d-block">Valor del Producto</small><h5 className="fw-bold mb-0" style={{ color: '#1a1a1a' }}>{formatMonto(venta.producto?.valor || venta.montoTotal)}</h5></Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '12px' }}>
                    <Card.Body className="py-3"><small className="text-muted d-block">Total Cuotas</small><h5 className="fw-bold mb-0 text-primary">{formatMonto(totalCuotasMonto)}</h5></Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '12px' }}>
                    <Card.Body className="py-3"><small className="text-muted d-block">Pagado de Cuotas</small><h5 className="fw-bold mb-0 text-success">{formatMonto(totalPagadoCuotas)}</h5></Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="border-0 shadow-sm text-center" style={{ borderRadius: '12px' }}>
                    <Card.Body className="py-3">
                      <small className="text-muted d-block">Saldo Pendiente</small>
                      <h5 className="fw-bold mb-0 text-danger">{formatMonto(totalPendienteReal)}</h5>
                      {totalRecargos > 0 && <small className="text-danger">(incluye {formatMonto(totalRecargos)} de recargos)</small>}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* ==========================================
                  SECCIÓN 3: CONDUCTA
                  ========================================== */}
              <Row className="g-3 mb-4">
                <Col md={12}>
                  <Card className="border-0 bg-light" style={{ borderRadius: '12px' }}>
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div><small className="text-muted d-block">Conducta de Pago</small><Badge bg={getConductaColor(venta.conducta_pago)} className="fs-6 px-3 py-2 mt-1">{getConductaLabel(venta.conducta_pago)}</Badge></div>
                        <div className="text-end"><small className="text-muted d-block">Vendedor</small><span className="fw-semibold">{venta.vendedor || '-'}</span><br /><small className="text-muted">Venta: {formatFechaCompleta(venta.fechaRealizada)}</small></div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* ==========================================
                  SECCIÓN 4: PROGRESO
                  ========================================== */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted"><i className="bi bi-pie-chart me-1"></i>Progreso de cuotas pagadas</small>
                  <small className="fw-semibold">{cuotasPagadas} de {totalCuotas} cuotas ({porcentajeCuotas}%)</small>
                </div>
                <ProgressBar now={porcentajeCuotas} variant={porcentajeCuotas === 100 ? 'success' : 'primary'} className="rounded-pill" style={{ height: '10px' }} label={porcentajeCuotas > 0 ? `${porcentajeCuotas}%` : ''} />
              </div>

              {/* ==========================================
                  SECCIÓN 5: CUOTAS
                  ========================================== */}
              <div className="mb-3">
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.95rem' }}>
                  <i className="bi bi-grid me-2" style={{ color: '#3483FA' }}></i>Cuotas
                  <Badge bg="secondary" className="ms-2 rounded-pill">{totalCuotas}</Badge>
                </h6>
                <div className="cuotas-table-wrapper">
                  <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="small">#</th>
                        <th className="small">Monto</th>
                        <th className="small">Recargos</th>
                        <th className="small">Pagado</th>
                        <th className="small">Saldo</th>
                        <th className="small">Fecha cobro</th>
                        <th className="small">Estado</th>
                        <th className="small">Días atraso</th>
                        <th className="small">Método</th>
                        <th className="small text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venta.cuotas?.map((cuota) => {
                        const totalRecargosCuota = cuota.recargos?.reduce((s, r) => s + r.monto, 0) || 0;
                        const saldoPendiente = (cuota.montoCuota + totalRecargosCuota) - (cuota.montoPagado || 0);
                        const tieneRecargos = totalRecargosCuota > 0;
                        return (
                          <tr key={cuota.numeroCuota} className={cuota.vencida ? 'table-danger' : ''}>
                            <td className="fw-semibold">{cuota.numeroCuota}</td>
                            <td>{formatMonto(cuota.montoCuota)}</td>
                            <td>
                              {tieneRecargos ? (
                                cuota.estado_cuota === 'pagada' ? (
                                  <span className="text-muted small" title="Recargos ya cobrados">
                                    +{formatMonto(totalRecargosCuota)} <Badge bg="secondary" className="ms-1 rounded-pill" style={{ fontSize: '0.6rem' }}>cobrado</Badge>
                                  </span>
                                ) : (
                                  <span className="text-danger fw-semibold" style={{ cursor: 'pointer' }} onClick={() => handleAbrirRecargo(cuota)} title={`${cuota.recargos.length} recargo(s). Click para ver/agregar`}>
                                    +{formatMonto(totalRecargosCuota)}
                                    <Badge bg="danger" className="ms-1 rounded-pill" style={{ fontSize: '0.6rem' }}>{cuota.recargos.length}</Badge>
                                  </span>
                                )
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="text-success">{cuota.montoPagado > 0 ? formatMonto(cuota.montoPagado) : '-'}</td>
                            <td className={saldoPendiente > 0 ? 'text-danger fw-semibold' : 'text-success'}>
                              {cuota.estado_cuota === 'pagada' ? '$0' : formatMonto(saldoPendiente)}
                            </td>
                            <td>{formatFecha(cuota.fechaCobro)}</td>
                            <td>
                              <Badge bg={getEstadoCuotaColor(cuota.estado_cuota)}
                                style={{ cursor: cuota.estado_cuota !== 'pagada' ? 'pointer' : 'default' }}
                                onClick={() => { if (cuota.estado_cuota !== 'pagada') handleAbrirCambiarEstado(cuota); }}
                                title={cuota.estado_cuota !== 'pagada' ? 'Click para cambiar estado' : ''}>
                                {getEstadoCuotaLabel(cuota.estado_cuota)}
                              </Badge>
                            </td>
                            <td>{cuota.diasAtraso > 0 ? <span className="text-danger fw-semibold">{cuota.diasAtraso} días</span> : <span className="text-muted">-</span>}</td>
                            <td>{cuota.metodoPago || '-'}</td>
                            <td>
                              <div className="d-flex gap-1 justify-content-center flex-wrap">
                                {cuota.estado_cuota !== 'pagada' && (
                                  <Button variant="outline-success" size="sm" className="rounded-3" onClick={() => handleAbrirCobro(cuota)} title="Cobrar cuota"><i className="bi bi-coin"></i></Button>
                                )}
                                {cuota.estado_cuota !== 'pagada' && (
                                  <Button variant="outline-danger" size="sm" className="rounded-3" onClick={() => handleAbrirRecargo(cuota)} title={tieneRecargos ? 'Ver/Agregar recargos' : 'Agregar recargo'}><i className="bi bi-percent"></i></Button>
                                )}
                                {cuota.estado_cuota !== 'pagada' && (
                                  <Button variant="outline-primary" size="sm" className="rounded-3" onClick={() => handleAbrirEditarFecha(cuota)} title="Editar fecha"><i className="bi bi-calendar"></i></Button>
                                )}
                                {cuota.estado_cuota !== 'pagada' && (
                                  <Button variant="outline-warning" size="sm" className="rounded-3" onClick={() => handleAbrirEditarMonto(cuota)} title="Editar monto"><i className="bi bi-currency-dollar"></i></Button>
                                )}
                                {cuota.estado_cuota !== 'pagada' && (
                                  <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => handleAbrirCambiarEstado(cuota)} title="Cambiar estado"><i className="bi bi-arrow-left-right"></i></Button>
                                )}
                                <Button variant="outline-info" size="sm" className="rounded-3" onClick={() => handleAbrirAgregarNota(cuota)} title="Agregar nota"><i className="bi bi-sticky"></i></Button>
                                
                                {/* 🆕 Botón PDF */}
                                <Button variant="outline-secondary" size="sm" className="rounded-3" 
                                  onClick={() => generarReciboPago(venta, cuota, cuota.metodoPago)} 
                                  title="Descargar comprobante PDF">
                                  <i className="bi bi-file-pdf"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </div>

              {/* Notas */}
              {venta.notas && venta.notas.length > 0 && (
                <div className="mt-3">
                  <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}><i className="bi bi-sticky me-2" style={{ color: '#6c757d' }}></i>Notas</h6>
                  <div className="bg-light rounded-3 p-3">
                    {venta.notas.map((nota, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-1">
                        <span className="small">{nota.texto}</span>
                        <span className="text-muted small">{formatFecha(nota.fecha)}{nota.usuario?.nombre && ` - ${nota.usuario.nombre}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={onHide} className="rounded-3"><i className="bi bi-x-circle me-1"></i>Cerrar</Button>
        </Modal.Footer>

        <style>{`
          .detalle-modal .modal-dialog { max-width: 1200px; }
          .detalle-modal .modal-content { border-radius: 16px; overflow: hidden; }
          .detalle-modal .modal-body { max-height: 80vh; overflow-y: auto; padding: 1.5rem; }
          .detalle-modal .modal-body::-webkit-scrollbar { width: 6px; }
          .detalle-modal .modal-body::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
          .detalle-modal .modal-body::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
          .cuotas-table-wrapper { max-height: 350px; overflow-y: auto; }
          .cuotas-table-wrapper::-webkit-scrollbar { width: 6px; }
          .cuotas-table-wrapper::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
          .cuotas-table-wrapper::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
          .detalle-modal .table th { position: sticky; top: 0; background: #f8f9fa; z-index: 1; }
          .table-danger { background-color: #fff5f5 !important; }
          @media (max-width: 768px) {
            .detalle-modal .modal-dialog { max-width: 100%; margin: 1rem; }
            .detalle-modal .modal-body { max-height: 85vh; padding: 1rem; }
          }
        `}</style>
      </Modal>

      {/* Modales anidados */}
      <ModalCobro show={showCobro} onHide={() => { setShowCobro(false); setCuotaSeleccionada(null); }} venta={venta} cuotaSeleccionada={cuotaSeleccionada} onSuccess={handleCobroExitoso} usuario={usuario} />
      <ModalAgregarRecargo show={showRecargo} onHide={() => { setShowRecargo(false); setCuotaSeleccionada(null); }} venta={venta} cuota={cuotaSeleccionada} onSuccess={handleRecargoExitoso} usuario={usuario} />
      <ModalEditarFechaCuota show={showEditarFecha} onHide={() => { setShowEditarFecha(false); setCuotaSeleccionada(null); }} venta={venta} cuota={cuotaSeleccionada} onSuccess={handleEditarFechaExitoso} usuario={usuario} />
      <ModalEditarMontoCuota show={showEditarMonto} onHide={() => { setShowEditarMonto(false); setCuotaSeleccionada(null); }} venta={venta} cuota={cuotaSeleccionada} onSuccess={handleEditarMontoExitoso} usuario={usuario} />
      <ModalCambiarEstadoCuota show={showCambiarEstado} onHide={() => { setShowCambiarEstado(false); setCuotaSeleccionada(null); }} venta={venta} cuota={cuotaSeleccionada} onSuccess={handleCambiarEstadoExitoso} usuario={usuario} />
      <ModalAgregarNotaCuota show={showAgregarNota} onHide={() => { setShowAgregarNota(false); setCuotaSeleccionada(null); }} venta={venta} cuota={cuotaSeleccionada} onSuccess={handleAgregarNotaExitoso} usuario={usuario} />
    </>
  );
};