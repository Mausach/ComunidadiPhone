// src/Pages/Ceo/Componentes/reportes/PanelClientes.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Form, InputGroup, Badge, Button, Spinner, Alert, Modal, Table, ListGroup } from 'react-bootstrap';
import { listarClientesReporte } from '../Helpers/ReportesMensuales';


const formatoFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const PanelClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });
  const alertRef = useRef(null);

  // Paginación
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(false);
  const [restantes, setRestantes] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [resumen, setResumen] = useState({ totalClientes: 0, totalActivos: 0, totalInactivos: 0 });

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todas');
  const [filtroSituacion, setFiltroSituacion] = useState('todas');

  // Modal detalle
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [clienteDetalle, setClienteDetalle] = useState(null);

  useEffect(() => {
    cargarDatos(1);
  }, []);

  const cargarDatos = async (paginaSolicitada = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listarClientesReporte({
        pagina: paginaSolicitada,
        limite: 50,
        ...(busqueda.trim() && { nombre: busqueda.trim() }),
        ...(filtroActivo !== 'todas' && { activo: filtroActivo }),
        ...(filtroSituacion !== 'todas' && { situacionCrediticia: filtroSituacion })
      });

      const clientesData = data?.data?.clientes || [];
      setClientes(Array.isArray(clientesData) ? clientesData : []);

      const pag = data?.data?.paginacion || {};
      setHayMas(pag.hayMas || false);
      setRestantes(pag.restantes || 0);
      setTotalClientes(pag.total || 0);
      setPagina(paginaSolicitada);

      const resumenData = data?.data?.resumen || {};
      setResumen(resumenData);
    } catch (err) {
      setError(err.message || 'Error al cargar los clientes');
      setClientes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCargarMas = async () => {
    setCargandoMas(true);
    setError('');
    try {
      const siguientePagina = pagina + 1;
      const data = await listarClientesReporte({
        pagina: siguientePagina,
        limite: 50,
        ...(busqueda.trim() && { nombre: busqueda.trim() }),
        ...(filtroActivo !== 'todas' && { activo: filtroActivo }),
        ...(filtroSituacion !== 'todas' && { situacionCrediticia: filtroSituacion })
      });

      const nuevosClientes = data?.data?.clientes || [];
      setClientes(prev => [...prev, ...(Array.isArray(nuevosClientes) ? nuevosClientes : [])]);

      const pag = data?.data?.paginacion || {};
      setHayMas(pag.hayMas || false);
      setRestantes(pag.restantes || 0);
      setPagina(siguientePagina);
    } catch (err) {
      setError(err.message || 'Error al cargar más clientes');
    } finally {
      setCargandoMas(false);
    }
  };

  const handleBuscar = () => cargarDatos(1);

  const handleLimpiar = () => {
    setBusqueda('');
    setFiltroActivo('todas');
    setFiltroSituacion('todas');
    cargarDatos(1);
  };

  const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => {
      if (alertRef.current) {
        alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  const handleVerCliente = (cliente) => {
    setClienteDetalle(cliente);
    setShowModalCliente(true);
  };

  const badgeSituacion = (situacion) => {
    const config = {
      1: { bg: 'success', label: 'Excelente', icon: 'bi-star-fill' },
      2: { bg: 'primary', label: 'Buena', icon: 'bi-hand-thumbs-up' },
      3: { bg: 'warning', label: 'Regular', icon: 'bi-exclamation-circle', text: 'dark' },
      4: { bg: 'danger', label: 'Mala', icon: 'bi-x-circle' },
      5: { bg: 'dark', label: 'Crítica', icon: 'bi-shield-x' }
    };
    const c = config[situacion] || { bg: 'secondary', label: 'Sin calificar', icon: 'bi-question-circle' };
    return (
      <Badge bg={c.bg} text={c.text || 'white'}>
        <i className={`bi ${c.icon} me-1`}></i>
        {c.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: '#3483FA' }} />
        <p className="text-muted mt-3">Cargando clientes...</p>
      </div>
    );
  }

  if (error && clientes.length === 0) {
    return (
      <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '8px' }}>
        <i className="bi bi-exclamation-triangle me-2"></i>{error}
        <button onClick={() => cargarDatos(1)} className="btn btn-link btn-sm ms-3" style={{ color: '#dc3545', textDecoration: 'underline' }}>
          Reintentar
        </button>
      </Alert>
    );
  }

  return (
    <div>
      {/* Cards de Resumen */}
      <Row className="g-3 mb-4">
        <Col lg={4} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #3483FA' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">TOTAL CLIENTES</small>
                  <h3 className="fw-bold mb-0" style={{ color: '#3483FA' }}>{resumen.totalClientes}</h3>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#e8f0fe' }}>
                  <i className="bi bi-people" style={{ color: '#3483FA', fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #00A650' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">ACTIVOS</small>
                  <h3 className="fw-bold mb-0" style={{ color: '#00A650' }}>{resumen.totalActivos}</h3>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#e6f4ea' }}>
                  <i className="bi bi-person-check" style={{ color: '#00A650', fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={12}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #6C757D' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">INACTIVOS</small>
                  <h3 className="fw-bold mb-0" style={{ color: '#6C757D' }}>{resumen.totalInactivos}</h3>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#f8f9fa' }}>
                  <i className="bi bi-person-slash" style={{ color: '#6C757D', fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
        <Card.Body className="p-3">
          <Row className="g-3 align-items-end">
            <Col lg={4} md={6}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e5e5' }}>
                  <i className="bi bi-search" style={{ color: '#999' }}></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre, apellido, DNI..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{ border: '1px solid #e5e5e5', fontSize: '0.9rem', padding: '10px 12px' }}
                />
              </InputGroup>
            </Col>
            <Col lg={2} md={6}>
              <Form.Select value={filtroActivo} onChange={(e) => setFiltroActivo(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                <option value="todas">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </Form.Select>
            </Col>
            <Col lg={2} md={6}>
              <Form.Select value={filtroSituacion} onChange={(e) => setFiltroSituacion(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                <option value="todas">Todas las situaciones</option>
                <option value="1">Excelente</option>
                <option value="2">Buena</option>
                <option value="3">Regular</option>
                <option value="4">Mala</option>
                <option value="5">Crítica</option>
              </Form.Select>
            </Col>
            <Col lg={4} md={6} className="d-flex justify-content-end gap-2">
              <small className="text-muted align-self-center">{clientes.length} clientes</small>
              <Button onClick={handleBuscar} variant="outline-primary" size="sm" className="rounded-3">
                <i className="bi bi-search me-1"></i>Buscar
              </Button>
              <Button onClick={handleLimpiar} variant="outline-secondary" size="sm" className="rounded-3">
                <i className="bi bi-eraser me-1"></i>Limpiar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de Clientes */}
      {clientes.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-people" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <p className="text-muted mt-3">No hay clientes con los filtros aplicados</p>
        </div>
      ) : (
        <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead className="bg-light">
                  <tr>
                    <th>Cliente</th>
                    <th>DNI</th>
                    <th>Contacto</th>
                    <th>Situación Crediticia</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(cliente => (
                    <tr key={cliente._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle me-2"
                            style={{
                              width: '36px', height: '36px',
                              backgroundColor: cliente.activo ? '#e6f4ea' : '#f8f9fa',
                              color: cliente.activo ? '#00A650' : '#6C757D',
                              fontWeight: 'bold', fontSize: '0.85rem'
                            }}
                          >
                            {cliente.nombre?.charAt(0)}{cliente.apellido?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', color: '#333' }}>{cliente.nombreCompleto}</div>
                            <small className="text-muted">{cliente.email || 'Sin email'}</small>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#666' }}>{cliente.dni || '-'}</td>
                      <td>
                        <div style={{ color: '#666' }}>{cliente.telefono || '-'}</div>
                        {cliente.telefono2 && <small className="text-muted">{cliente.telefono2}</small>}
                      </td>
                      <td>{badgeSituacion(cliente.situacionCrediticia)}</td>
                      <td>
                        <Badge bg={cliente.activo ? 'success' : 'secondary'}>
                          {cliente.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="rounded-3"
                          onClick={() => handleVerCliente(cliente)} title="Ver detalles">
                          <i className="bi bi-eye"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Botón Cargar más */}
      {hayMas && (
        <div className="text-center mt-3">
          <Button onClick={handleCargarMas} variant="outline-primary" className="rounded-3 px-4" disabled={cargandoMas}>
            {cargandoMas ? (
              <><Spinner size="sm" className="me-2" />Cargando...</>
            ) : (
              <><i className="bi bi-arrow-down me-2"></i>Cargar más ({restantes} restantes)</>
            )}
          </Button>
        </div>
      )}

      {/* Modal Detalle Cliente */}
      <Modal show={showModalCliente} onHide={() => setShowModalCliente(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className="bi bi-person me-2" style={{ color: '#3483FA' }}></i>
            Detalle del Cliente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {clienteDetalle && (
            <>
              <div className="text-center mb-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                  style={{
                    width: '80px', height: '80px',
                    backgroundColor: clienteDetalle.activo ? '#e6f4ea' : '#f8f9fa',
                    color: clienteDetalle.activo ? '#00A650' : '#6C757D',
                    fontSize: '2rem', fontWeight: 'bold'
                  }}
                >
                  {clienteDetalle.nombre?.charAt(0)}{clienteDetalle.apellido?.charAt(0)}
                </div>
                <h4 className="fw-bold mb-1" style={{ color: '#1a1a1a' }}>
                  {clienteDetalle.nombreCompleto}
                </h4>
                <div className="d-flex justify-content-center gap-2">
                  <Badge bg={clienteDetalle.activo ? 'success' : 'secondary'}>
                    {clienteDetalle.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {badgeSituacion(clienteDetalle.situacionCrediticia)}
                </div>
              </div>

              <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-info-circle me-2"></i>Información Personal
                </h6>
                <Row className="g-3">
                  <Col md={4}>
                    <small className="text-muted d-block">DNI</small>
                    <strong style={{ color: '#333' }}>{clienteDetalle.dni || 'N/A'}</strong>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">CUIL</small>
                    <span style={{ color: '#333' }}>{clienteDetalle.cuil || 'N/A'}</span>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Dirección</small>
                    <span style={{ color: '#333' }}>{clienteDetalle.direccion || 'N/A'}</span>
                  </Col>
                </Row>
              </div>

              <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-telephone me-2"></i>Contacto
                </h6>
                <Row className="g-3">
                  <Col md={4}>
                    <small className="text-muted d-block">Teléfono</small>
                    <span style={{ color: '#333' }}>{clienteDetalle.telefono || 'N/A'}</span>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Teléfono 2</small>
                    <span style={{ color: '#333' }}>{clienteDetalle.telefono2 || 'N/A'}</span>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Email</small>
                    <span style={{ color: '#333' }}>{clienteDetalle.email || 'N/A'}</span>
                  </Col>
                </Row>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShowModalCliente(false)} className="rounded-3">
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};