// Cobranza/Componentes/ItemVenta.jsx
import React, { useState } from 'react';
import { Card, Row, Col, Badge, Button, Popover, OverlayTrigger } from 'react-bootstrap';
import { ModalHistorialVenta } from './ModalHistorialVenta';

export const ItemVenta = ({ venta, onVerDetalle, loading }) => {
  const [showHistorial, setShowHistorial] = useState(false);

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

  const tieneDeuda = venta.montoPendiente > 0;

  // ==========================================
  // ASEGURAR QUE venta.cuotas SEA UN ARRAY
  // ==========================================
  const cuotas = Array.isArray(venta.cuotas) ? venta.cuotas : [];

  // Contar notas totales de la venta (incluyendo notas de cuotas)
  const contarNotas = () => {
    let total = 0;
    if (venta.notas && Array.isArray(venta.notas)) {
      total += venta.notas.length;
    }
    if (cuotas.length > 0) {
      cuotas.forEach(cuota => {
        if (cuota.notas && Array.isArray(cuota.notas)) {
          total += cuota.notas.length;
        }
      });
    }
    return total;
  };

  const totalNotas = contarNotas();

  // Popover para mostrar últimas notas
  const renderNotasPopover = (props) => {
    const todasLasNotas = [];

    if (venta.notas && Array.isArray(venta.notas)) {
      venta.notas.forEach(n => {
        todasLasNotas.push({
          ...n,
          tipo: 'Venta',
          cuota: null
        });
      });
    }

    if (cuotas.length > 0) {
      cuotas.forEach(cuota => {
        if (cuota.notas && Array.isArray(cuota.notas)) {
          cuota.notas.forEach(n => {
            todasLasNotas.push({
              ...n,
              tipo: `Cuota #${cuota.numeroCuota}`,
              cuota: cuota.numeroCuota
            });
          });
        }
      });
    }

    const notasRecientes = todasLasNotas
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5);

    if (notasRecientes.length === 0) {
      return (
        <Popover {...props} className="rounded-3 shadow-sm">
          <Popover.Header className="fw-semibold bg-light">
            <i className="bi bi-sticky me-2"></i>
            Notas
          </Popover.Header>
          <Popover.Body className="text-muted small">
            No hay notas registradas
          </Popover.Body>
        </Popover>
      );
    }

    return (
      <Popover {...props} className="rounded-3 shadow-sm" style={{ maxWidth: '350px' }}>
        <Popover.Header className="fw-semibold bg-light d-flex justify-content-between align-items-center">
          <span><i className="bi bi-sticky me-2"></i>Últimas notas</span>
          <Badge bg="primary" className="rounded-pill">{totalNotas} total</Badge>
        </Popover.Header>
        <Popover.Body className="p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {notasRecientes.map((nota, index) => (
            <div key={index} className="border-bottom py-1 last:border-0">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <small className="text-muted">{nota.tipo}</small>
                  <p className="mb-0 small">{nota.texto}</p>
                </div>
              </div>
              <div className="d-flex justify-content-between text-muted small">
                <span>{nota.usuario?.nombre || 'Sistema'}</span>
                <span>{new Date(nota.fecha).toLocaleDateString('es-AR')}</span>
              </div>
            </div>
          ))}
        </Popover.Body>
      </Popover>
    );
  };

  // Popover para resumen de cuotas
  const renderCuotasPopover = (props) => {
    if (!cuotas || cuotas.length === 0) {
      return (
        <Popover {...props} className="rounded-3 shadow-sm">
          <Popover.Header className="fw-semibold bg-light">Cuotas</Popover.Header>
          <Popover.Body className="text-muted small">Sin cuotas registradas</Popover.Body>
        </Popover>
      );
    }

    const pagadas = cuotas.filter(c => c.estado_cuota === 'pagada').length;
    const pendientes = cuotas.filter(c => c.estado_cuota === 'pendiente').length;
    const noPagadas = cuotas.filter(c => c.estado_cuota === 'no pagada').length;

    return (
      <Popover {...props} className="rounded-3 shadow-sm" style={{ maxWidth: '300px' }}>
        <Popover.Header className="fw-semibold bg-light">
          <i className="bi bi-grid me-2"></i>
          Resumen de cuotas
        </Popover.Header>
        <Popover.Body className="p-2">
          <div className="d-flex justify-content-between">
            <span className="text-muted small">Total</span>
            <span className="fw-semibold small">{cuotas.length}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted small">Pagadas</span>
            <span className="fw-semibold text-success small">{pagadas}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted small">Pendientes</span>
            <span className="fw-semibold text-warning small">{pendientes}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-muted small">No pagadas</span>
            <span className="fw-semibold text-danger small">{noPagadas}</span>
          </div>
          <hr className="my-1" />
          <div className="d-flex justify-content-between">
            <span className="text-muted small">Deuda total</span>
            <span className="fw-semibold text-danger small">{formatMonto(venta.montoPendiente)}</span>
          </div>

          {/* 👉 NUEVO: Mostrar cuotas en rango si existen */}
          {venta.cuotasEnRango && venta.cuotasEnRango.length > 0 && (
            <>
              <hr className="my-1" />
              <small className="text-warning fw-semibold d-block mb-1">
                <i className="bi bi-funnel me-1"></i>
                En este rango:
              </small>
              {venta.cuotasEnRango.map(cuota => (
                <div key={cuota.numeroCuota} className="d-flex justify-content-between bg-warning bg-opacity-10 rounded px-1 py-0 mb-1">
                  <span className="small">
                    <i className="bi bi-arrow-left me-1 text-warning"></i>
                    #{cuota.numeroCuota}
                  </span>
                  <span className="small text-muted">
                    {formatFecha(cuota.fechaCobro)}
                  </span>
                </div>
              ))}
            </>
          )}
        </Popover.Body>
      </Popover>
    );
  };

  return (
    <>
      <Card
        className="border-0 shadow-sm mb-3"
        style={{ borderRadius: '12px', transition: 'all 0.2s ease' }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
      >
        <Card.Body className="p-3 p-md-4">
          <Row className="align-items-center">
            {/* Columna 1: Cliente y producto */}
            <Col md={5} lg={4} className="mb-2 mb-md-0">
              <div className="d-flex align-items-start gap-3">
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

                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-semibold" style={{ fontSize: '1rem' }}>
                      {venta.cliente?.nombre} {venta.cliente?.apellido}
                    </span>
                    <small className="text-muted">
                      DNI: {venta.cliente?.dni || '-'}
                    </small>
                  </div>
                  <div className="d-flex gap-2 flex-wrap mt-1">
                    <small className="text-muted">
                      <i className="bi bi-phone me-1"></i>
                      {venta.producto?.nombre +' '+ venta.producto?.modelo || 'Sin producto'}
                    </small>
                    <small className="text-muted">
                      <i className="bi bi-geo-alt me-1"></i>
                      {venta.localidad || '-'}
                    </small>
                  </div>

                  {/* 👉 NUEVO: Indicador de cuota próxima */}
                  {venta.proximaCuota && (
                    <div className="mt-2">
                      {venta.proximaCuota.diasRestantes < 0 ? (
                        <Badge bg="danger" className="rounded-pill d-inline-flex align-items-center gap-1">
                          <i className="bi bi-exclamation-triangle-fill"></i>
                          Cuota #{venta.proximaCuota.numeroCuota} vencida hace {Math.abs(venta.proximaCuota.diasRestantes)} días
                          <span className="ms-1 fw-bold">{formatMonto(venta.proximaCuota.montoCuota)}</span>
                        </Badge>
                      ) : venta.proximaCuota.diasRestantes === 0 ? (
                        <Badge bg="danger" className="rounded-pill d-inline-flex align-items-center gap-1">
                          <i className="bi bi-exclamation-triangle-fill"></i>
                          Cuota #{venta.proximaCuota.numeroCuota} vence HOY
                          <span className="ms-1 fw-bold">{formatMonto(venta.proximaCuota.montoCuota)}</span>
                        </Badge>
                      ) : venta.proximaCuota.diasRestantes <= 3 ? (
                        <Badge bg="warning" text="dark" className="rounded-pill d-inline-flex align-items-center gap-1">
                          <i className="bi bi-clock"></i>
                          Cuota #{venta.proximaCuota.numeroCuota} en {venta.proximaCuota.diasRestantes} días
                          <span className="ms-1">{formatMonto(venta.proximaCuota.montoCuota)}</span>
                        </Badge>
                      ) : (
                        <Badge bg="info" className="rounded-pill d-inline-flex align-items-center gap-1">
                          <i className="bi bi-calendar"></i>
                          Próx: #{venta.proximaCuota.numeroCuota} - {formatFecha(venta.proximaCuota.fechaCobro)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* Columna 2: Montos y cuotas */}
            <Col md={4} lg={5} className="mb-2 mb-md-0">
              <Row className="g-2 text-center text-md-start">
                <Col xs={6} md={4}>
                  <small className="text-muted d-block">Total</small>
                  <span className="fw-semibold">{formatMonto(venta.montoTotal)}</span>
                </Col>
                <Col xs={6} md={4}>
                  <small className="text-muted d-block">Pendiente</small>
                  <span className={`fw-bold ${tieneDeuda ? 'text-danger' : 'text-success'}`}>
                    {formatMonto(venta.montoPendiente)}
                  </span>
                </Col>
                <Col xs={12} md={4}>
                  <div className="d-flex justify-content-center justify-content-md-start align-items-center gap-1">
                    {/* Icono de notas con popover */}
                    {totalNotas > 0 && (
                      <OverlayTrigger
                        trigger="click"
                        placement="bottom"
                        rootClose
                        overlay={renderNotasPopover}
                      >
                        <Badge
                          bg="info"
                          className="rounded-pill px-2 py-1 d-flex align-items-center gap-1"
                          style={{ cursor: 'pointer' }}
                        >
                          <i className="bi bi-sticky"></i>
                          {totalNotas}
                        </Badge>
                      </OverlayTrigger>
                    )}

                    {/* Icono de cuotas con popover */}
                  

                    {/* Badge de conducta */}
                    <Badge
                      bg={getConductaColor(venta.conducta_pago)}
                      className="rounded-pill px-2 py-1 d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-circle-fill" style={{ fontSize: '0.5rem' }}></i>
                      {getConductaLabel(venta.conducta_pago)}
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Col>

            {/* Columna 3: Acciones */}
            <Col md={3} lg={3} className="d-flex gap-2 justify-content-end">
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-3"
                onClick={() => setShowHistorial(true)}
                title="Ver historial de actividad"
                disabled={loading}
              >
                <i className="bi bi-clock-history me-1"></i>
                Historial
              </Button>

              <Button
                variant="primary"
                size="sm"
                className="rounded-3 flex-grow-1"
                onClick={() => onVerDetalle(venta._id)}
                disabled={loading}
                style={{
                  backgroundColor: '#3483FA',
                  borderColor: '#3483FA',
                  fontWeight: '500'
                }}
              >
                <i className="bi bi-clipboard-data me-1"></i>
                Gestión
              </Button>
            </Col>
          </Row>
        </Card.Body>

        <style>{`
          .popover {
            border: none;
          }
          .popover .popover-header {
            border-bottom: 1px solid #e9ecef;
          }
          .popover-body::-webkit-scrollbar {
            width: 4px;
          }
          .popover-body::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 2px;
          }
          .popover-body::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 2px;
          }
        `}</style>
      </Card>

      {/* ==========================================
          MODAL DE HISTORIAL
          ========================================== */}
      <ModalHistorialVenta
        show={showHistorial}
        onHide={() => setShowHistorial(false)}
        ventaId={venta._id}
      />
    </>
  );
};