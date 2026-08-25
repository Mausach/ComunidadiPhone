// src/Pages/Ceo/Componentes/VentasContado.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Badge, Button, Spinner, Alert, Pagination, Collapse } from 'react-bootstrap';
import { listarVentasContado } from '../Helpers/ReportesMensuales';


const localidades = ['santiago capital', 'la banda', 'añatuya', 'monte quemado'];

export const VentasContado = () => {
  const [ventas, setVentas] = useState([]);
  const [paginacion, setPaginacion] = useState({ total: 0, pagina: 1, limite: 20, paginas: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroLocalidad, setFiltroLocalidad] = useState('todas');
  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // UI
  const [ventasExpandidas, setVentasExpandidas] = useState({});

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async (pagina = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const filtros = {
        ...(busqueda.trim() && { nombre: busqueda.trim() }),
        ...(filtroLocalidad !== 'todas' && { localidad: filtroLocalidad }),
        ...(filtroVendedor.trim() && { vendedor: filtroVendedor.trim() }),
        ...(fechaDesde && { fechaDesde }),
        ...(fechaHasta && { fechaHasta }),
        pagina,
        limite: paginacion.limite
      };

      const data = await listarVentasContado(filtros);
      setVentas(data?.data || []);
      setPaginacion(data?.paginacion || {});
    } catch (err) {
      setError(err.message || 'Error al cargar las ventas');
      setVentas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuscar = () => {
    cargarDatos(1);
  };

  const handleLimpiar = () => {
    setBusqueda('');
    setFiltroLocalidad('todas');
    setFiltroVendedor('');
    setFechaDesde('');
    setFechaHasta('');
    cargarDatos(1);
  };

  const toggleVenta = (id) => {
    setVentasExpandidas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatoMoneda = (v) => !v && v !== 0 ? '$0' : `$${v.toLocaleString('es-AR')}`;
  const formatoFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatoFechaHora = (f) => !f ? '-' : new Date(f).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const badgeMetodoPago = (metodo) => {
    const config = {
      'efectivo': 'success',
      'transferencia': 'primary',
      'dolares': 'info',
      'cripto': 'warning',
      'tarjeta_credito': 'danger'
    };
    return <Badge bg={config[metodo] || 'secondary'}>{metodo}</Badge>;
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: '#1a1a1a' }}>
          <i className="bi bi-cash me-2" style={{ color: '#00a650' }}></i>
          Ventas Directas
        </h3>
        <p className="text-muted">Ventas realizadas sin plan de cuotas (contado)</p>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} className="shadow-sm border-0 mb-3" style={{ borderRadius: '8px' }} dismissible
          onClose={() => setAlert({ show: false, message: '', variant: 'danger' })}>
          {alert.message}
        </Alert>
      )}

      {/* Cards de resumen del mes */}
{ventas.length > 0 && (
    <Row className="mb-4 g-3">
        <Col lg={3} md={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #00a650' }}>
                <Card.Body className="p-3 text-center">
                    <h3 className="fw-bold mb-0" style={{ color: '#00a650' }}>
                        {formatoMoneda(ventas.reduce((sum, v) => sum + (v.montoTotal || 0), 0))}
                    </h3>
                    <small style={{ color: '#999' }}>Total Vendido</small>
                </Card.Body>
            </Card>
        </Col>
        <Col lg={3} md={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
                <Card.Body className="p-3 text-center">
                    <h3 className="fw-bold mb-0" style={{ color: '#333' }}>
                        {ventas.length}
                    </h3>
                    <small style={{ color: '#999' }}>Ventas Realizadas</small>
                </Card.Body>
            </Card>
        </Col>
        <Col lg={3} md={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
                <Card.Body className="p-3 text-center">
                    <h3 className="fw-bold mb-0" style={{ color: '#3483FA' }}>
                        {ventas.reduce((sum, v) => sum + (v.cantidadPagos || 0), 0)}
                    </h3>
                    <small style={{ color: '#999' }}>Pagos Realizados</small>
                </Card.Body>
            </Card>
        </Col>
        <Col lg={3} md={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
                <Card.Body className="p-3 text-center">
                    <h3 className="fw-bold mb-0" style={{ color: '#dc3545' }}>
                        {formatoMoneda(ventas.reduce((sum, v) => sum + (v.montoPendiente || 0), 0))}
                    </h3>
                    <small style={{ color: '#999' }}>Pendiente Total</small>
                </Card.Body>
            </Card>
        </Col>
    </Row>
)}

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
        <Card.Body className="p-3">
          <Row className="g-3 align-items-end">
            <Col lg={3} md={6}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e5e5' }}>
                  <i className="bi bi-search" style={{ color: '#999' }}></i>
                </InputGroup.Text>
                <Form.Control placeholder="Buscar por nombre..." value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{ border: '1px solid #e5e5e5', fontSize: '0.9rem', padding: '10px 12px' }} />
              </InputGroup>
            </Col>
            <Col lg={2} md={6}>
              <Form.Select value={filtroLocalidad} onChange={(e) => setFiltroLocalidad(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                <option value="todas">Todas las localidades</option>
                {localidades.map(loc => (
                  <option key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>
                ))}
              </Form.Select>
            </Col>
            <Col lg={2} md={6}>
              <Form.Control placeholder="Vendedor..." value={filtroVendedor}
                onChange={(e) => setFiltroVendedor(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }} />
            </Col>
            <Col lg={2} md={6}>
              <Row className="g-2">
                <Col xs={6}>
                  <Form.Control type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
                    style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', padding: '8px 10px' }} />
                </Col>
                <Col xs={6}>
                  <Form.Control type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
                    style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.85rem', padding: '8px 10px' }} />
                </Col>
              </Row>
            </Col>
            <Col lg={3} md={6} className="d-flex gap-2 justify-content-end">
              <Button onClick={handleBuscar} className="rounded-3" style={{ backgroundColor: '#3483FA', borderColor: '#3483FA', fontWeight: '500' }}>
                <i className="bi bi-search me-1"></i>Buscar
              </Button>
              <Button onClick={handleLimpiar} variant="outline-secondary" className="rounded-3">
                <i className="bi bi-eraser me-1"></i>Limpiar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '8px' }}>
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button onClick={() => cargarDatos()} className="btn btn-link btn-sm ms-3" style={{ color: '#dc3545', textDecoration: 'underline' }}>
            Reintentar
          </button>
        </Alert>
      )}

      {/* Tabla */}
      {isLoading ? (
        <div className="text-center py-5"><Spinner animation="border" style={{ color: '#3483FA' }} /><p className="text-muted mt-3">Cargando ventas...</p></div>
      ) : ventas.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i><p className="text-muted mt-3">No hay ventas de contado registradas</p></div>
      ) : (
        <>
          <small className="text-muted">{paginacion.total} ventas encontradas</small>
          {ventas.map(venta => {
            const expandido = ventasExpandidas[venta._id] || false;
            return (
              <Card key={venta._id} className="shadow-sm border-0 mb-3" style={{ borderRadius: '8px' }}>
                <Card.Body className="p-0">
                  <div className="p-3" style={{ cursor: 'pointer', backgroundColor: expandido ? '#f8f9fa' : '#fff', borderRadius: '8px' }}
                    onClick={() => toggleVenta(venta._id)}>
                    <Row className="align-items-center">
                      <Col lg={3} md={4}>
                        <div className="d-flex align-items-center">
                          <div className="d-flex align-items-center justify-content-center me-3 rounded-circle"
                            style={{ width: '40px', height: '40px', backgroundColor: '#e6f7ee', color: '#00a650', fontWeight: '600' }}>
                            {venta.cliente?.nombre?.charAt(0)}{venta.cliente?.apellido?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-semibold">{venta.cliente?.apellido}, {venta.cliente?.nombre}</div>
                            <small className="text-muted">DNI: {venta.cliente?.dni || '-'}</small>
                          </div>
                        </div>
                      </Col>
                      <Col lg={2} md={4}>
                        <div className="fw-semibold">{venta.producto?.nombre}</div>
                        <small className="text-muted">{venta.producto?.modelo || '-'}</small>
                      </Col>
                      <Col lg={2} md={4}>
                        <div className="fw-bold text-success">{formatoMoneda(venta.montoTotal)}</div>
                        <small className="text-muted">{venta.cantidadPagos} pago(s)</small>
                      </Col>
                      <Col lg={2} md={4}>
                        <div className="text-muted small">
                          <i className="bi bi-geo-alt me-1"></i>{venta.localidad}
                        </div>
                        <div className="text-muted small">
                          <i className="bi bi-person me-1"></i>{venta.vendedor || '-'}
                        </div>
                      </Col>
                      <Col lg={2} md={4}>
                        <div className="text-muted small">
                          <i className="bi bi-calendar me-1"></i>{formatoFecha(venta.fechaRealizada)}
                        </div>
                      </Col>
                      <Col lg={1} md={4} className="text-end">
                        <i className={`bi bi-chevron-${expandido ? 'up' : 'down'}`} style={{ color: '#666' }}></i>
                      </Col>
                    </Row>
                  </div>

                  <Collapse in={expandido}>
                    <div>
                      <div className="p-3" style={{ borderTop: '1px solid #e5e5e5' }}>
                        <Row className="g-3">
                          <Col md={6}>
                            <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>
                              <i className="bi bi-wallet2 me-2" style={{ color: '#00a650' }}></i>Pagos Realizados
                            </h6>
                            {venta.pagos && venta.pagos.length > 0 ? (
                              venta.pagos.map((pago, idx) => (
                                <div key={idx} className="d-flex justify-content-between align-items-center p-2 bg-light rounded-3 mb-1">
                                  <span>{formatoMoneda(pago.monto)}</span>
                                  {badgeMetodoPago(pago.metodo)}
                                  <small className="text-muted">{formatoFecha(pago.fecha)}</small>
                                </div>
                              ))
                            ) : (
                              <small className="text-muted">Sin pagos registrados</small>
                            )}
                          </Col>
                          <Col md={6}>
                            <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>
                              <i className="bi bi-sticky me-2" style={{ color: '#ff7733' }}></i>Notas
                            </h6>
                            {venta.notas && venta.notas.length > 0 ? (
                              venta.notas.map((nota, idx) => (
                                <div key={idx} className="p-2 bg-light rounded-3 mb-1">
                                  <small>{nota.texto}</small>
                                  <div className="text-muted small mt-1">
                                    {nota.usuario || 'Sistema'} · {formatoFechaHora(nota.fecha)}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <small className="text-muted">Sin notas</small>
                            )}
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Collapse>
                </Card.Body>
              </Card>
            );
          })}

          {/* Paginación */}
          {paginacion.paginas > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                <Pagination.Prev onClick={() => cargarDatos(paginacion.pagina - 1)} disabled={paginacion.pagina === 1} />
                {Array.from({ length: paginacion.paginas }, (_, i) => i + 1).map(pag => (
                  <Pagination.Item key={pag} active={pag === paginacion.pagina} onClick={() => cargarDatos(pag)}>
                    {pag}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => cargarDatos(paginacion.pagina + 1)} disabled={paginacion.pagina === paginacion.paginas} />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};