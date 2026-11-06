// src/Pages/Ceo/Componentes/ModalDetalleVenta.jsx

import React, { useState } from 'react';
import { Modal, Row, Col, Badge, Button, Card, Table, ProgressBar, Nav, Tab } from 'react-bootstrap';

// ==========================================
// HELPERS DE FORMATO
// ==========================================
const formatoMoneda = (v) => {
  if (!v && v !== 0) return '$0';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
};

const formatoFecha = (f) => {
  if (!f) return '-';
  return new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatoFechaHora = (f) => {
  if (!f) return '-';
  return new Date(f).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ==========================================
// BADGES
// ==========================================
const badgeTipoVenta = (tipo) => {
  const config = {
    contado: { bg: 'success', icon: 'bi-cash-coin', label: 'Contado' },
    plan_canje: { bg: 'warning', text: 'dark', icon: 'bi-arrow-repeat', label: 'Plan Canje' },
    sistema1: { bg: 'primary', icon: 'bi-calendar-check', label: 'Sistema 1' },
    sistema2: { bg: 'info', icon: 'bi-calendar-event', label: 'Sistema 2' }
  };
  const c = config[tipo] || { bg: 'secondary', icon: 'bi-question', label: tipo };
  return (
    <Badge bg={c.bg} text={c.text || 'white'}>
      <i className={`bi ${c.icon} me-1`}></i>
      {c.label}
    </Badge>
  );
};

const badgeConducta = (conducta) => {
  const config = {
    'al dia': { bg: 'success', label: 'Al día' },
    'atrasado': { bg: 'danger', label: 'Atrasado' },
    'cancelado': { bg: 'primary', label: 'Cancelado' },
    'refinanciado': { bg: 'warning', text: 'dark', label: 'Refinanciado' },
    'cobro judicial': { bg: 'dark', label: 'Cobro Judicial' },
    'caducado': { bg: 'secondary', label: 'Caducado' }
  };
  const c = config[conducta] || { bg: 'secondary', label: conducta };
  return <Badge bg={c.bg} text={c.text || 'white'}>{c.label}</Badge>;
};

const badgeEstadoCuota = (estado) => {
  const config = {
    'pagada': { bg: 'success', label: 'Pagada' },
    'pendiente': { bg: 'warning', text: 'dark', label: 'Pendiente' },
    'pago parcial': { bg: 'info', label: 'Pago parcial' },
    'no pagada': { bg: 'danger', label: 'No pagada' }
  };
  const c = config[estado] || { bg: 'secondary', label: estado || '-' };
  return <Badge bg={c.bg} text={c.text || 'white'}>{c.label}</Badge>;
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export const ModalDetalleVenta = ({ show, onHide, venta }) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!venta) return null;

  const porcentaje = venta.cuotasResumen?.porcentajeCobrado || 0;
  const saldoPendiente = (venta.montoTotal || 0) - (venta.montoPagado || 0);

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
          <i className="bi bi-file-earmark-text me-2" style={{ color: '#3483FA' }}></i>
          Detalle Completo de la Venta
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* ==========================================
            HEADER RESUMEN
            ========================================== */}
        <div className="bg-light rounded-3 p-3 mb-3">
          <Row className="align-items-center g-3">
            <Col md={6}>
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '56px', height: '56px',
                    backgroundColor: '#e8f0fe', color: '#3483FA',
                    fontWeight: 'bold', fontSize: '1.2rem'
                  }}
                >
                  {venta.cliente?.nombre?.charAt(0)}{venta.cliente?.apellido?.charAt(0)}
                </div>
                <div>
                  <h5 className="fw-bold mb-1" style={{ color: '#1a1a1a' }}>
                    {venta.cliente?.apellido}, {venta.cliente?.nombre}
                  </h5>
                  <div className="d-flex gap-2 flex-wrap">
                    {badgeTipoVenta(venta.tipoVenta)}
                    {badgeConducta(venta.conducta_pago)}
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <Row className="text-md-end g-2">
                <Col xs={6} md={4}>
                  <small className="text-muted d-block">Total</small>
                  <strong style={{ color: '#1a1a1a' }}>{formatoMoneda(venta.montoTotal)}</strong>
                </Col>
                <Col xs={6} md={4}>
                  <small className="text-muted d-block">Pagado</small>
                  <strong style={{ color: '#00A650' }}>{formatoMoneda(venta.montoPagado)}</strong>
                </Col>
                <Col xs={12} md={4}>
                  <small className="text-muted d-block">Pendiente</small>
                  <strong style={{ color: saldoPendiente > 0 ? '#dc3545' : '#00A650' }}>
                    {formatoMoneda(saldoPendiente)}
                  </strong>
                </Col>
              </Row>
            </Col>
          </Row>

          {venta.tieneCuotas && (
            <div className="mt-3">
              <div className="d-flex justify-content-between mb-1">
                <small className="text-muted">
                  Progreso de pago: {venta.cuotasResumen?.pagadas || 0}/{venta.cuotasResumen?.total || 0} cuotas
                </small>
                <small className="fw-bold" style={{ color: porcentaje === 100 ? '#00A650' : '#3483FA' }}>
                  {porcentaje}%
                </small>
              </div>
              <ProgressBar
                now={porcentaje}
                style={{ height: '8px', borderRadius: '4px' }}
                variant={porcentaje === 100 ? 'success' : porcentaje >= 50 ? 'warning' : 'danger'}
              />
            </div>
          )}
        </div>

        {/* ==========================================
            TABS DE NAVEGACIÓN
            ========================================== */}
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav variant="pills" className="mb-3 flex-wrap gap-1">
            <Nav.Item>
              <Nav.Link eventKey="general" className="rounded-3 small">
                <i className="bi bi-info-circle me-1"></i>General
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="producto" className="rounded-3 small">
                <i className="bi bi-phone me-1"></i>Producto
              </Nav.Link>
            </Nav.Item>
            {venta.tieneCuotas && (
              <Nav.Item>
                <Nav.Link eventKey="cuotas" className="rounded-3 small">
                  <i className="bi bi-grid me-1"></i>Cuotas ({venta.cuotas?.length || 0})
                </Nav.Link>
              </Nav.Item>
            )}
            {venta.pagos && venta.pagos.length > 0 && (
              <Nav.Item>
                <Nav.Link eventKey="pagos" className="rounded-3 small">
                  <i className="bi bi-wallet2 me-1"></i>Pagos ({venta.pagos.length})
                </Nav.Link>
              </Nav.Item>
            )}
            {venta.descuentos && venta.descuentos.length > 0 && (
              <Nav.Item>
                <Nav.Link eventKey="descuentos" className="rounded-3 small">
                  <i className="bi bi-tag me-1"></i>Descuentos ({venta.descuentos.length})
                </Nav.Link>
              </Nav.Item>
            )}
            {venta.requiereGarante && venta.garante && (
              <Nav.Item>
                <Nav.Link eventKey="garante" className="rounded-3 small">
                  <i className="bi bi-person-check me-1"></i>Garante
                </Nav.Link>
              </Nav.Item>
            )}
            {venta.notas && venta.notas.length > 0 && (
              <Nav.Item>
                <Nav.Link eventKey="notas" className="rounded-3 small">
                  <i className="bi bi-sticky me-1"></i>Notas ({venta.notas.length})
                </Nav.Link>
              </Nav.Item>
            )}
            {venta.documentacion?.urlCarpeta && (
              <Nav.Item>
                <Nav.Link eventKey="docs" className="rounded-3 small">
                  <i className="bi bi-folder-fill me-1"></i>Docs
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>

          <Tab.Content>
            {/* ==========================================
                TAB GENERAL
                ========================================== */}
            <Tab.Pane eventKey="general">
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-3">
                  <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem' }}>
                    <i className="bi bi-info-circle me-2" style={{ color: '#3483FA' }}></i>
                    Datos Generales
                  </h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">N° Contrato</span>
                        <span className="fw-semibold small">{venta.numeroContrato || '-'}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Tipo de Venta</span>
                        <span className="fw-semibold small">
                          {badgeTipoVenta(venta.tipoVenta)}
                        </span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Fecha Realizada</span>
                        <span className="fw-semibold small">{formatoFecha(venta.fechaRealizada)}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Fecha Entrega</span>
                        <span className="fw-semibold small">{formatoFecha(venta.fechaEntrega)}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Localidad</span>
                        <span className="fw-semibold small text-capitalize">{venta.localidad || '-'}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Vendedor</span>
                        <span className="fw-semibold small">{venta.vendedor || '-'}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Conducta de Pago</span>
                        <span>{badgeConducta(venta.conducta_pago)}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Estado</span>
                        <Badge bg={venta.estado !== false ? 'success' : 'secondary'}>
                          {venta.estado !== false ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                    </Col>
                  </Row>

                  <h6 className="fw-bold mt-4 mb-3" style={{ fontSize: '0.9rem' }}>
                    <i className="bi bi-person me-2" style={{ color: '#3483FA' }}></i>
                    Datos del Cliente
                  </h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Nombre completo</span>
                        <span className="fw-semibold small">
                          {venta.cliente?.apellido}, {venta.cliente?.nombre}
                        </span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">DNI</span>
                        <span className="fw-semibold small">{venta.cliente?.dni || '-'}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Teléfono</span>
                        <span className="fw-semibold small">{venta.cliente?.telefono || '-'}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Email</span>
                        <span className="fw-semibold small">{venta.cliente?.email || '-'}</span>
                      </div>
                    </Col>
                    <Col md={12}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Dirección</span>
                        <span className="fw-semibold small">{venta.cliente?.direccion || '-'}</span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* ==========================================
                TAB PRODUCTO
                ========================================== */}
            <Tab.Pane eventKey="producto">
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-3">
                  <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem' }}>
                    <i className="bi bi-phone me-2" style={{ color: '#3483FA' }}></i>
                    Datos del Producto
                  </h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Nombre</span>
                        <span className="fw-semibold small">{venta.producto?.nombre || '-'}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Modelo</span>
                        <span className="fw-semibold small">{venta.producto?.modelo || '-'}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Color</span>
                        <span className="fw-semibold small">{venta.producto?.color || '-'}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Batería</span>
                        <span className="fw-semibold small">{venta.producto?.bateria || '-'}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">IMEI</span>
                        <span className="fw-semibold small" style={{ fontFamily: 'monospace' }}>
                          {venta.producto?.imei || '-'}
                        </span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Estado</span>
                        <span className="fw-semibold small text-capitalize">{venta.producto?.estado || '-'}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between border-bottom py-1">
                        <span className="text-muted small">Valor</span>
                        <span className="fw-bold small" style={{ color: '#3483FA' }}>
                          {formatoMoneda(venta.producto?.valor)}
                        </span>
                      </div>
                    </Col>
                  </Row>

                  {venta.tipoVenta === 'plan_canje' && venta.equipoCanje && (
                    <>
                      <h6 className="fw-bold mt-4 mb-3" style={{ fontSize: '0.9rem' }}>
                        <i className="bi bi-arrow-left-right me-2" style={{ color: '#fd7e14' }}></i>
                        Equipo Canje Entregado
                      </h6>
                      <Row className="g-3">
                        <Col md={6}>
                          <div className="d-flex justify-content-between border-bottom py-1">
                            <span className="text-muted small">Nombre</span>
                            <span className="fw-semibold small">{venta.equipoCanje.nombre || '-'}</span>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="d-flex justify-content-between border-bottom py-1">
                            <span className="text-muted small">Modelo</span>
                            <span className="fw-semibold small">{venta.equipoCanje.modelo || '-'}</span>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="d-flex justify-content-between border-bottom py-1">
                            <span className="text-muted small">IMEI</span>
                            <span className="fw-semibold small" style={{ fontFamily: 'monospace' }}>
                              {venta.equipoCanje.imei || '-'}
                            </span>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="d-flex justify-content-between border-bottom py-1">
                            <span className="text-muted small">Estado</span>
                            <span className="fw-semibold small text-capitalize">{venta.equipoCanje.estado || '-'}</span>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="d-flex justify-content-between border-bottom py-1">
                            <span className="text-muted small">Valor Tasado</span>
                            <span className="fw-bold small" style={{ color: '#fd7e14' }}>
                              {formatoMoneda(venta.equipoCanje.valorTasado)}
                            </span>
                          </div>
                        </Col>
                      </Row>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* ==========================================
                TAB CUOTAS
                ========================================== */}
            {venta.tieneCuotas && (
              <Tab.Pane eventKey="cuotas">
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
                        <thead className="bg-light">
                          <tr>
                            <th>#</th>
                            <th>Monto</th>
                            <th>Pagado</th>
                            <th>Vence</th>
                            <th>Estado</th>
                            <th>Cobrada</th>
                            <th>Método</th>
                            <th>Notas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {venta.cuotas?.map((cuota, idx) => (
                            <tr key={idx}>
                              <td className="fw-semibold">{cuota.numeroCuota}</td>
                              <td>{formatoMoneda(cuota.montoCuota)}</td>
                              <td style={{ color: cuota.montoPagado > 0 ? '#00A650' : '#999' }}>
                                {formatoMoneda(cuota.montoPagado)}
                              </td>
                              <td>{formatoFecha(cuota.fechaCobro)}</td>
                              <td>{badgeEstadoCuota(cuota.estado_cuota)}</td>
                              <td>{formatoFecha(cuota.fechaCobrada)}</td>
                              <td className="text-capitalize">{cuota.metodoPago || '-'}</td>
                              <td>
                                {cuota.notas && cuota.notas.length > 0 ? (
                                  <Badge bg="info" className="rounded-pill">
                                    <i className="bi bi-sticky me-1"></i>
                                    {cuota.notas.length}
                                  </Badge>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Notas de cuotas expandidas */}
                    {venta.cuotas?.some(c => c.notas && c.notas.length > 0) && (
                      <div className="p-3 border-top">
                        <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>
                          <i className="bi bi-sticky me-2"></i>
                          Notas de Cuotas
                        </h6>
                        {venta.cuotas.map((cuota, idx) => (
                          cuota.notas && cuota.notas.length > 0 && (
                            <div key={idx} className="mb-2 p-2 bg-light rounded-2">
                              <small className="fw-bold" style={{ color: '#3483FA' }}>
                                Cuota #{cuota.numeroCuota}
                              </small>
                              {cuota.notas.map((n, i) => (
                                <div key={i} className="mt-1 small">
                                  <span className="text-muted">
                                    {formatoFechaHora(n.fecha)} - {n.usuario?.nombre || 'Sistema'}:
                                  </span>
                                  <span className="ms-1">{n.texto}</span>
                                </div>
                              ))}
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>
            )}

            {/* ==========================================
                TAB PAGOS
                ========================================== */}
            {venta.pagos && venta.pagos.length > 0 && (
              <Tab.Pane eventKey="pagos">
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-0">
                    <Table hover className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
                      <thead className="bg-light">
                        <tr>
                          <th>Fecha</th>
                          <th>Monto</th>
                          <th>Método</th>
                          <th>Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {venta.pagos.map((pago, idx) => (
                          <tr key={idx}>
                            <td>{formatoFecha(pago.fecha)}</td>
                            <td className="fw-semibold" style={{ color: '#00A650' }}>
                              {formatoMoneda(pago.monto)}
                            </td>
                            <td className="text-capitalize">{pago.metodo}</td>
                            <td>
                              {pago.notas && pago.notas.length > 0 ? (
                                <div>
                                  {pago.notas.map((n, i) => (
                                    <div key={i} className="small">
                                      <span className="text-muted">{formatoFecha(n.fecha)}:</span> {n.texto}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            )}

            {/* ==========================================
                TAB DESCUENTOS
                ========================================== */}
            {venta.descuentos && venta.descuentos.length > 0 && (
              <Tab.Pane eventKey="descuentos">
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-0">
                    <Table hover className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
                      <thead className="bg-light">
                        <tr>
                          <th>Fecha</th>
                          <th>Monto</th>
                          <th>Descripción</th>
                          <th>Usuario</th>
                        </tr>
                      </thead>
                      <tbody>
                        {venta.descuentos.map((desc, idx) => (
                          <tr key={idx}>
                            <td>{formatoFecha(desc.fecha)}</td>
                            <td className="fw-semibold" style={{ color: '#dc3545' }}>
                              -{formatoMoneda(desc.monto)}
                            </td>
                            <td>{desc.descripcion}</td>
                            <td className="text-muted">{desc.usuario?.nombre || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            )}

            {/* ==========================================
                TAB GARANTE
                ========================================== */}
            {venta.requiereGarante && venta.garante && (
              <Tab.Pane eventKey="garante">
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem' }}>
                      <i className="bi bi-person-check me-2" style={{ color: '#fd7e14' }}></i>
                      Datos del Garante
                    </h6>
                    <Row className="g-3">
                      <Col md={6}>
                        <div className="d-flex justify-content-between border-bottom py-1">
                          <span className="text-muted small">Nombre completo</span>
                          <span className="fw-semibold small">
                            {venta.garante.apellido}, {venta.garante.nombre}
                          </span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="d-flex justify-content-between border-bottom py-1">
                          <span className="text-muted small">DNI</span>
                          <span className="fw-semibold small">{venta.garante.dni || '-'}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="d-flex justify-content-between border-bottom py-1">
                          <span className="text-muted small">CUIL</span>
                          <span className="fw-semibold small">{venta.garante.cuil || '-'}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="d-flex justify-content-between border-bottom py-1">
                          <span className="text-muted small">Teléfono</span>
                          <span className="fw-semibold small">{venta.garante.telefono || '-'}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="d-flex justify-content-between border-bottom py-1">
                          <span className="text-muted small">Teléfono 2</span>
                          <span className="fw-semibold small">{venta.garante.telefono2 || '-'}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="d-flex justify-content-between border-bottom py-1">
                          <span className="text-muted small">Email</span>
                          <span className="fw-semibold small">{venta.garante.email || '-'}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="d-flex justify-content-between border-bottom py-1">
                          <span className="text-muted small">Relación</span>
                          <span className="fw-semibold small">{venta.garante.relacion || '-'}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="d-flex justify-content-between border-bottom py-1">
                          <span className="text-muted small">Ocupación</span>
                          <span className="fw-semibold small">{venta.garante.ocupacion || '-'}</span>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className="d-flex justify-content-between border-bottom py-1">
                          <span className="text-muted small">Dirección</span>
                          <span className="fw-semibold small">{venta.garante.direccion || '-'}</span>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            )}

            {/* ==========================================
                TAB NOTAS
                ========================================== */}
            {venta.notas && venta.notas.length > 0 && (
              <Tab.Pane eventKey="notas">
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-3">
                    {venta.notas.map((nota, idx) => (
                      <div key={idx} className="border-bottom py-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <Badge bg="secondary" className="mb-1" style={{ fontSize: '0.65rem' }}>
                              {nota.tipo || 'general'}
                            </Badge>
                            <p className="mb-1 small">{nota.texto}</p>
                            <small className="text-muted">
                              <i className="bi bi-person me-1"></i>
                              {nota.usuario?.nombre || 'Sistema'}
                              <span className="ms-2">
                                <i className="bi bi-clock me-1"></i>
                                {formatoFechaHora(nota.fecha)}
                              </span>
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Tab.Pane>
            )}

            {/* ==========================================
                TAB DOCUMENTACIÓN
                ========================================== */}
            {venta.documentacion?.urlCarpeta && (
              <Tab.Pane eventKey="docs">
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
                          <i className="bi bi-folder-fill me-2" style={{ color: '#FFC107' }}></i>
                          Documentación Cargada
                        </h6>
                        <small className="text-muted">
                          Subido el {formatoFecha(venta.documentacion.fechaSubida)}
                          {venta.documentacion.subidoPor && ` por ${venta.documentacion.subidoPor}`}
                        </small>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        href={venta.documentacion.urlCarpeta}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-3"
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>
                        Abrir carpeta
                      </Button>
                    </div>
                    {venta.documentacion.notas && (
                      <div className="bg-light rounded-2 p-2 mt-3">
                        <small className="text-muted d-block mb-1">Notas:</small>
                        <span className="small">{venta.documentacion.notas}</span>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>
            )}
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="secondary" onClick={onHide} className="rounded-3">
          <i className="bi bi-x-circle me-1"></i>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};