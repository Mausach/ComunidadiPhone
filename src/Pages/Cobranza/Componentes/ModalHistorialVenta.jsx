
import { obtenerDetalleVenta } from '../Helpers/DetalleVenta';

// Cobranza/Componentes/ModalHistorialVenta.jsx

import React, { useState, useEffect } from 'react';
import { 
  Modal, Row, Col, Badge, Button, Card, 
  Spinner, Alert, Accordion 
} from 'react-bootstrap';


export const ModalHistorialVenta = ({ 
  show, 
  onHide, 
  ventaId 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [venta, setVenta] = useState(null);
  const [notasAgrupadas, setNotasAgrupadas] = useState([]);
  const [activeKey, setActiveKey] = useState(null);

  // ==========================================
  // CARGAR DETALLE COMPLETO DE LA VENTA
  // ==========================================
  useEffect(() => {
    if (show && ventaId) {
      cargarDetalle();
    }
  }, [show, ventaId]);

  const cargarDetalle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await obtenerDetalleVenta(ventaId);
      if (result.success) {
        const data = result.venta;
        setVenta(data);
        procesarNotas(data);
      }
    } catch (error) {
      setError(error.message || 'Error al cargar el historial');
      console.error('❌ Error al cargar detalle:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PROCESAR NOTAS AGRUPADAS POR CUOTA/VENTA
  // ==========================================
  const procesarNotas = (data) => {
    const grupos = [];

    // 1. Grupo: Notas de la venta
    if (data.notas && Array.isArray(data.notas) && data.notas.length > 0) {
      grupos.push({
        id: 'venta',
        titulo: '📋 Notas de la Venta',
        icono: 'bi-file-text',
        color: '#6c757d',
        bgColor: '#f8f9fa',
        cantidad: data.notas.length,
        notas: data.notas.map(nota => ({
          ...nota,
          fecha: new Date(nota.fecha)
        })).sort((a, b) => b.fecha - a.fecha)
      });
    }

    // 2. Grupos: Notas por cada cuota que tenga notas
    if (data.cuotas && Array.isArray(data.cuotas)) {
      data.cuotas.forEach(cuota => {
        if (cuota.notas && Array.isArray(cuota.notas) && cuota.notas.length > 0) {
          const estadoColor = getEstadoCuotaColor(cuota.estado_cuota);
          const estadoBg = {
            'success': '#e6f7ee',
            'warning': '#fff3ed',
            'danger': '#ffeaea',
            'info': '#e8f0fe'
          }[estadoColor] || '#f8f9fa';

          grupos.push({
            id: `cuota-${cuota.numeroCuota}`,
            titulo: `💰 Cuota #${cuota.numeroCuota}`,
            subtitulo: `${formatMonto(cuota.montoCuota)} · ${getEstadoCuotaLabel(cuota.estado_cuota)}`,
            icono: 'bi-cash-stack',
            color: getEstadoCuotaColorHex(cuota.estado_cuota),
            bgColor: estadoBg,
            cantidad: cuota.notas.length,
            cuotaNumero: cuota.numeroCuota,
            estadoCuota: cuota.estado_cuota,
            montoCuota: cuota.montoCuota,
            fechaCobro: cuota.fechaCobro,
            notas: cuota.notas.map(nota => ({
              ...nota,
              fecha: new Date(nota.fecha)
            })).sort((a, b) => b.fecha - a.fecha)
          });
        }
      });
    }

    setNotasAgrupadas(grupos);
  };

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================

  const getConductaColor = (conducta) => {
    const colores = {
      'al dia': 'success',
      'atrasado': 'danger',
      'cancelado': 'success',
      'refinanciado': 'warning',
      'cobro judicial': 'dark',
      'caducado': 'secondary'
    };
    return colores[conducta] || 'secondary';
  };

  const getConductaLabel = (conducta) => {
    const labels = {
      'al dia': 'Al día',
      'atrasado': 'Atrasado',
      'cancelado': 'Cancelado',
      'refinanciado': 'Refinanciado',
      'cobro judicial': 'Cobro Judicial',
      'caducado': 'Caducado'
    };
    return labels[conducta] || conducta;
  };

  const getEstadoCuotaColor = (estado) => {
    const colores = {
      'pagada': 'success',
      'pendiente': 'warning',
      'pago parcial': 'info',
      'no pagada': 'danger'
    };
    return colores[estado] || 'secondary';
  };

  const getEstadoCuotaColorHex = (estado) => {
    const colores = {
      'pagada': '#00a650',
      'pendiente': '#ff7733',
      'pago parcial': '#3483FA',
      'no pagada': '#dc3545'
    };
    return colores[estado] || '#666';
  };

  const getEstadoCuotaLabel = (estado) => {
    const labels = {
      'pagada': 'Pagada ✅',
      'pendiente': 'Pendiente ⏳',
      'pago parcial': 'Pago Parcial 💰',
      'no pagada': 'No pagada ❌'
    };
    return labels[estado] || estado;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFechaCorta = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatMonto = (monto) => {
    if (!monto) return '$0';
    return `$${monto.toLocaleString('es-AR')}`;
  };

  const getTipoVentaEmoji = (tipo) => {
    const tipos = {
      'contado': '💵',
      'sistema1': '📋',
      'sistema2': '📋',
      'plan_canje': '🔄'
    };
    return tipos[tipo] || '📦';
  };

  // Total de notas
  const totalNotas = notasAgrupadas.reduce((sum, g) => sum + g.cantidad, 0);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="historial-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-clock-history me-2" style={{ color: '#6c757d' }}></i>
          Historial de Actividad
          {totalNotas > 0 && (
            <Badge bg="secondary" className="ms-2 rounded-pill">
              {totalNotas} {totalNotas === 1 ? 'nota' : 'notas'}
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="secondary" className="mb-3" />
            <p className="text-muted">Cargando historial...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="rounded-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-3" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <h6 className="fw-bold mb-1">Error al cargar el historial</h6>
                <p className="mb-0 text-muted small">{error}</p>
              </div>
              <Button
                variant="outline-danger"
                className="ms-auto rounded-3"
                onClick={cargarDetalle}
                size="sm"
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                Reintentar
              </Button>
            </div>
          </Alert>
        ) : venta ? (
          <>
            {/* ==========================================
                SECCIÓN 1: CLIENTE Y PRODUCTO
                ========================================== */}
            <Row className="g-3 mb-3">
              <Col md={7}>
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#e6f3ff',
                      color: '#3483FA',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}
                  >
                    {venta.cliente?.nombre?.charAt(0)}{venta.cliente?.apellido?.charAt(0)}
                  </div>
                  <div>
                    <div className="fw-semibold">
                      {venta.cliente?.nombre} {venta.cliente?.apellido}
                    </div>
                    <div className="text-muted small">
                      <i className="bi bi-person-badge me-1"></i>
                      DNI: {venta.cliente?.dni || '-'}
                    </div>
                    <div className="text-muted small">
                      <i className="bi bi-telephone me-1"></i>
                      {venta.cliente?.telefono || '-'}
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={5}>
                <div className="bg-light rounded-3 p-2">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Producto</span>
                    <span className="fw-semibold small">{venta.producto?.nombre}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Tipo</span>
                    <span className="fw-semibold small">
                      {getTipoVentaEmoji(venta.tipoVenta)} {venta.tipoVenta}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Conducta</span>
                    <Badge bg={getConductaColor(venta.conducta_pago)}>
                      {getConductaLabel(venta.conducta_pago)}
                    </Badge>
                  </div>
                </div>
              </Col>
            </Row>

            {/* ==========================================
                SECCIÓN 2: RESUMEN DE CUOTAS
                ========================================== */}
            {venta.cuotas && venta.cuotas.length > 0 && (
              <div className="mb-3">
                <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-grid me-2" style={{ color: '#6c757d' }}></i>
                  Resumen de Cuotas
                </h6>
                <div className="bg-light rounded-3 p-2">
                  <Row className="text-center g-0">
                    <Col>
                      <small className="text-muted d-block">Total</small>
                      <span className="fw-semibold">{venta.cuotas.length}</span>
                    </Col>
                    <Col>
                      <small className="text-muted d-block">Pagadas</small>
                      <span className="fw-semibold text-success">
                        {venta.cuotas.filter(c => c.estado_cuota === 'pagada').length}
                      </span>
                    </Col>
                    <Col>
                      <small className="text-muted d-block">Pendientes</small>
                      <span className="fw-semibold text-warning">
                        {venta.cuotas.filter(c => c.estado_cuota === 'pendiente').length}
                      </span>
                    </Col>
                    <Col>
                      <small className="text-muted d-block">No pagadas</small>
                      <span className="fw-semibold text-danger">
                        {venta.cuotas.filter(c => c.estado_cuota === 'no pagada').length}
                      </span>
                    </Col>
                  </Row>
                </div>
              </div>
            )}

            {/* ==========================================
                SECCIÓN 3: NOTAS AGRUPADAS (ACORDEÓN)
                ========================================== */}
            <div>
              <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-sticky me-2" style={{ color: '#6c757d' }}></i>
                Historial de Notas
              </h6>

              {notasAgrupadas.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  <i className="bi bi-inbox" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}></i>
                  No hay notas registradas
                </div>
              ) : (
                <Accordion 
                  activeKey={activeKey} 
                  onSelect={(key) => setActiveKey(key)}
                  className="notas-accordion"
                >
                  {notasAgrupadas.map((grupo, idx) => (
                    <Accordion.Item 
                      eventKey={String(idx)} 
                      key={grupo.id}
                      className="border-0 mb-2"
                    >
                      <Accordion.Header 
                        className="rounded-3 shadow-sm"
                        style={{
                          backgroundColor: grupo.bgColor,
                          borderLeft: `4px solid ${grupo.color}`,
                          borderRadius: '8px',
                          padding: '4px 0'
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                          <div className="d-flex align-items-center gap-2">
                            <i className={`${grupo.icono}`} style={{ color: grupo.color, fontSize: '1.1rem' }}></i>
                            <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                              {grupo.titulo}
                            </span>
                            {grupo.subtitulo && (
                              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                {grupo.subtitulo}
                              </span>
                            )}
                          </div>
                          <Badge 
                            style={{
                              backgroundColor: grupo.color,
                              color: '#fff',
                              fontWeight: '600',
                              fontSize: '0.7rem',
                              padding: '4px 10px',
                              borderRadius: '10px'
                            }}
                          >
                            {grupo.cantidad}
                          </Badge>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body className="pt-3 pb-2">
                        {grupo.notas.map((nota, notaIdx) => (
                          <div 
                            key={notaIdx}
                            className="mb-3 pb-3"
                            style={{
                              borderBottom: notaIdx < grupo.notas.length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}
                          >
                            <p className="mb-2" style={{ fontSize: '0.9rem', color: '#333', lineHeight: '1.5' }}>
                              {nota.texto}
                            </p>
                            <div className="d-flex align-items-center gap-3 text-muted flex-wrap" style={{ fontSize: '0.75rem' }}>
                              <span className="d-flex align-items-center gap-1">
                                <i className="bi bi-person"></i>
                                {nota.usuario?.nombre && nota.usuario.nombre !== 'undefined undefined' 
                                  ? nota.usuario.nombre 
                                  : 'Sistema'}
                              </span>
                              <span className="d-flex align-items-center gap-1">
                                <i className="bi bi-clock"></i>
                                {formatFecha(nota.fecha)}
                              </span>
                              {!grupo.id.startsWith('venta') && grupo.fechaCobro && (
                                <span className="d-flex align-items-center gap-1">
                                  <i className="bi bi-calendar"></i>
                                  Vence: {formatFechaCorta(grupo.fechaCobro)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              )}
            </div>
          </>
        ) : null}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="secondary" onClick={onHide} className="rounded-3">
          <i className="bi bi-x-circle me-1"></i>
          Cerrar
        </Button>
      </Modal.Footer>

      {/* Estilos */}
      <style>{`
        .historial-modal .modal-dialog {
          max-width: 700px;
        }

        .historial-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
        }

        .historial-modal .modal-body {
          max-height: 80vh;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .historial-modal .modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .historial-modal .modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .historial-modal .modal-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .historial-modal .modal-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .notas-accordion .accordion-button {
          background-color: transparent !important;
          box-shadow: none !important;
          padding: 12px 16px;
        }

        .notas-accordion .accordion-button:not(.collapsed) {
          background-color: transparent !important;
          box-shadow: none !important;
        }

        .notas-accordion .accordion-button::after {
          background-size: 0.9rem;
        }

        .notas-accordion .accordion-body {
          padding: 8px 16px 16px 20px;
        }

        @media (max-width: 768px) {
          .historial-modal .modal-dialog {
            max-width: 100%;
            margin: 1rem;
          }
          
          .historial-modal .modal-body {
            max-height: 85vh;
            padding: 1rem;
          }
        }
      `}</style>
    </Modal>
  );
};