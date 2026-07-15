
import { obtenerDetalleVenta } from '../Helpers/DetalleVenta';

// Cobranza/Componentes/ModalHistorialVenta.jsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, Row, Col, Badge, Button, Card, 
  Spinner, Alert 
} from 'react-bootstrap';


export const ModalHistorialVenta = ({ 
  show, 
  onHide, 
  ventaId 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [venta, setVenta] = useState(null);
  const [notasCompletas, setNotasCompletas] = useState([]);

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
        console.log('📊 Datos de venta cargados:', data);
      }
    } catch (error) {
      setError(error.message || 'Error al cargar el historial');
      console.error('❌ Error al cargar detalle:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PROCESAR NOTAS DE VENTA Y CUOTAS
  // ==========================================
  const procesarNotas = (data) => {
    const todasLasNotas = [];

    // 1. Notas de la venta
    if (data.notas && Array.isArray(data.notas) && data.notas.length > 0) {
      data.notas.forEach(nota => {
        todasLasNotas.push({
          ...nota,
          tipo: '📋 Venta',
          cuotaNumero: null,
          cuotaEstado: null,
          montoCuota: null,
          esNotaVenta: true,
          fecha: new Date(nota.fecha)
        });
      });
    }

    // 2. Notas de las cuotas
    if (data.cuotas && Array.isArray(data.cuotas) && data.cuotas.length > 0) {
      data.cuotas.forEach(cuota => {
        if (cuota.notas && Array.isArray(cuota.notas) && cuota.notas.length > 0) {
          cuota.notas.forEach(nota => {
            todasLasNotas.push({
              ...nota,
              tipo: `💰 Cuota #${cuota.numeroCuota}`,
              cuotaNumero: cuota.numeroCuota,
              cuotaEstado: cuota.estado_cuota,
              montoCuota: cuota.montoCuota,
              fechaCobro: cuota.fechaCobro,
              esNotaVenta: false,
              fecha: new Date(nota.fecha)
            });
          });
        }
      });
    }

    // Ordenar por fecha (más reciente primero)
    todasLasNotas.sort((a, b) => b.fecha - a.fecha);
    
    console.log('📝 Notas procesadas:', todasLasNotas);
    setNotasCompletas(todasLasNotas);
  };

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================

  const getConductaColor = (conducta) => {
    const colores = {
      'al dia': 'success',
      'atrasado': 'danger',
      'cancelado': 'secondary',
      'refinanciado': 'info',
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
      'no pagada': 'danger'
    };
    return colores[estado] || 'secondary';
  };

  const getEstadoCuotaLabel = (estado) => {
    const labels = {
      'pagada': 'Pagada ✅',
      'pendiente': 'Pendiente ⏳',
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

  const formatMonto = (monto) => {
    if (!monto) return '$0';
    return `$${monto.toLocaleString('es-AR')}`;
  };

  // Obtener tipo de venta con emoji
  const getTipoVentaEmoji = (tipo) => {
    const tipos = {
      'contado': '💵',
      'sistema1': '📋',
      'sistema2': '📋',
      'plan_canje': '🔄'
    };
    return tipos[tipo] || '📦';
  };

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
                SECCIÓN 3: LISTA DE NOTAS COMPLETAS
                ========================================== */}
            <div>
              <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-sticky me-2" style={{ color: '#6c757d' }}></i>
                Historial de Notas
                <Badge bg="secondary" className="ms-2 rounded-pill">
                  {notasCompletas.length}
                </Badge>
              </h6>

              {notasCompletas.length === 0 ? (
                <div className="text-center py-3 text-muted small">
                  <i className="bi bi-inbox me-1"></i>
                  No hay notas registradas
                </div>
              ) : (
                <div className="notas-list">
                  {notasCompletas.map((nota, index) => (
                    <div 
                      key={index} 
                      className="border-bottom py-2 last:border-0"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          {/* Badges de la nota */}
                          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                            <Badge 
                              bg={nota.esNotaVenta ? 'secondary' : 'info'}
                              className="rounded-pill"
                              style={{ fontSize: '0.65rem' }}
                            >
                              {nota.tipo}
                            </Badge>
                            
                            {!nota.esNotaVenta && nota.cuotaEstado && (
                              <Badge 
                                bg={getEstadoCuotaColor(nota.cuotaEstado)}
                                className="rounded-pill"
                                style={{ fontSize: '0.65rem' }}
                              >
                                {getEstadoCuotaLabel(nota.cuotaEstado)}
                              </Badge>
                            )}
                            
                            {!nota.esNotaVenta && nota.montoCuota && (
                              <span className="text-muted small">
                                {formatMonto(nota.montoCuota)}
                              </span>
                            )}
                          </div>

                          {/* Texto de la nota */}
                          <p className="mb-1 small">{nota.texto}</p>

                          {/* Información de usuario y fecha */}
                          <div className="d-flex gap-3 text-muted small flex-wrap">
                            <span>
                              <i className="bi bi-person me-1"></i>
                              {nota.usuario?.nombre && nota.usuario.nombre !== 'undefined undefined' 
                                ? nota.usuario.nombre 
                                : 'Sistema'}
                            </span>
                            <span>
                              <i className="bi bi-clock me-1"></i>
                              {formatFecha(nota.fecha)}
                            </span>
                            {!nota.esNotaVenta && nota.fechaCobro && (
                              <span>
                                <i className="bi bi-calendar me-1"></i>
                                Fecha cobro: {formatFecha(nota.fechaCobro)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

        .notas-list {
          max-height: 350px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .notas-list::-webkit-scrollbar {
          width: 4px;
        }

        .notas-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }

        .notas-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
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