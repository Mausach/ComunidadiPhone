

// src/Pages/Ceo/Componentes/reportes/PanelClientes.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Form, InputGroup, Button, Spinner, Alert, Modal, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { listarClientesReporte, obtenerRepVentas } from '../Helpers/ReportesMensuales';
import { VentaCard } from './CardVentas';
import { ModalEditarCliente } from './ModalEditarCliente';
import { COLORS } from '../../Cobranza/Helperss/colors';

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

const formatoFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const PanelClientes = ({ usuario }) => {
  const navigate = useNavigate();
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

  // Modales
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [clienteDetalle, setClienteDetalle] = useState(null);
  const [showEditarCliente, setShowEditarCliente] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [showModalVentas, setShowModalVentas] = useState(false);
  const [clienteVentas, setClienteVentas] = useState(null);
  const [ventasCliente, setVentasCliente] = useState([]);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [errorVentas, setErrorVentas] = useState('');
  const [paginaVentas, setPaginaVentas] = useState(1);
  const [hayMasVentas, setHayMasVentas] = useState(false);
  const [totalVentas, setTotalVentas] = useState(0);
  const [cargandoMasVentas, setCargandoMasVentas] = useState(false);

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

      setResumen(data?.data?.resumen || { totalClientes: 0, totalActivos: 0, totalInactivos: 0 });
    } catch (err) {
      setError(err.message || 'Error al cargar los clientes');
      setClientes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCargarMas = async () => {
    setCargandoMas(true);
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
    setTimeout(() => { if (alertRef.current) alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  const handleVerCliente = (cliente) => {
    setClienteDetalle(cliente);
    setShowModalCliente(true);
  };

  const handleEditarCliente = (cliente) => {
    setClienteEditar(cliente);
    setShowEditarCliente(true);
  };

  const handleCerrarEditarCliente = () => {
    setShowEditarCliente(false);
    setClienteEditar(null);
  };

  const handleClienteActualizado = () => {
    cargarDatos(pagina);
    if (clienteDetalle) {
      setShowModalCliente(false);
      setClienteDetalle(null);
    }
    showAlert('Cliente actualizado correctamente', 'success');
  };

  const cargarVentasCliente = async (cliente, paginaSolicitada = 1) => {
    if (paginaSolicitada === 1) {
      setLoadingVentas(true);
      setVentasCliente([]);
      setErrorVentas('');
    } else {
      setCargandoMasVentas(true);
    }

    try {
      const data = await obtenerRepVentas({ dni: cliente.dni, pagina: paginaSolicitada, limite: 10 });
      const nuevas = data?.data?.ventas || [];
      const pag = data?.data?.paginacion || {};

      setVentasCliente(prev => paginaSolicitada === 1 ? nuevas : [...prev, ...nuevas]);
      setHayMasVentas(pag.hayMas || false);
      setTotalVentas(pag.total || 0);
      setPaginaVentas(paginaSolicitada);
    } catch (err) {
      setErrorVentas(err.message || 'Error al cargar las ventas del cliente');
    } finally {
      setLoadingVentas(false);
      setCargandoMasVentas(false);
    }
  };

  const handleVerVentas = (cliente) => {
    setClienteVentas(cliente);
    setShowModalVentas(true);
    setPaginaVentas(1);
    setHayMasVentas(false);
    setTotalVentas(0);
    cargarVentasCliente(cliente, 1);
  };

  const handleCerrarModalVentas = () => {
    setShowModalVentas(false);
    setClienteVentas(null);
    setVentasCliente([]);
    setErrorVentas('');
  };

  const handleCargarMasVentas = () => {
    if (!clienteVentas) return;
    cargarVentasCliente(clienteVentas, paginaVentas + 1);
  };

  const handleRefreshVentas = () => {
    if (!clienteVentas) return;
    cargarVentasCliente(clienteVentas, 1);
  };

  // Configuración de Pills para Situación Crediticia
  const pillSituacion = (situacion) => {
    const config = {
      1: { bg: COLORS.verdeSuave, color: COLORS.verde, label: 'Excelente', icon: 'star-fill' },
      2: { bg: COLORS.azulSuave, color: COLORS.azul, label: 'Buena', icon: 'hand-thumbs-up' },
      3: { bg: COLORS.ambarSuave, color: COLORS.ambar, label: 'Regular', icon: 'exclamation-circle' },
      4: { bg: COLORS.rojoSuave, color: COLORS.rojo, label: 'Mala', icon: 'x-circle' },
      5: { bg: COLORS.azulOscuro, color: '#fff', label: 'Crítica', icon: 'shield-x' }
    };
    const c = config[situacion] || { bg: COLORS.bgGeneral, color: COLORS.textoSecundario, label: 'Sin calificar', icon: 'question-circle' };
    return <Pill bg={c.bg} color={c.color} icon={c.icon}>{c.label}</Pill>;
  };

  if (isLoading) return (
    <div className="text-center py-5">
      <Spinner animation="border" style={{ color: COLORS.azul }} />
      <p className="mt-3" style={{ color: COLORS.textoSecundario }}>Cargando clientes...</p>
    </div>
  );

  if (error && clientes.length === 0) return (
    <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
      <i className="bi bi-exclamation-triangle me-2"></i>{error}
      <Button onClick={() => cargarDatos(1)} variant="link" className="ms-3" style={{ color: COLORS.rojo, textDecoration: 'underline' }}>
        Reintentar
      </Button>
    </Alert>
  );

  return (
    <div>
      {alert.show && (
        <Alert ref={alertRef} variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'danger' })}
          className="shadow-sm border-0 mb-3"
          style={{
            borderRadius: '12px',
            backgroundColor: alert.variant === 'success' ? COLORS.verdeSuave : alert.variant === 'warning' ? COLORS.ambarSuave : COLORS.rojoSuave,
            color: alert.variant === 'success' ? COLORS.verde : alert.variant === 'warning' ? COLORS.ambar : COLORS.rojo
          }}>
          <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'info-circle'} me-2`}></i>
          {alert.message}
        </Alert>
      )}

      {/* KPIs */}
      <Row className="g-3 mb-4">
        <Col lg={4} md={6}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '12px', borderLeft: `4px solid ${COLORS.azul}` }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small style={{ color: COLORS.textoSecundario }} className="d-block mb-1">TOTAL CLIENTES</small>
                  <h3 className="fw-bold mb-0" style={{ color: COLORS.azul }}>{resumen.totalClientes}</h3>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: COLORS.azulSuave }}>
                  <i className="bi bi-people" style={{ color: COLORS.azul, fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '12px', borderLeft: `4px solid ${COLORS.verde}` }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small style={{ color: COLORS.textoSecundario }} className="d-block mb-1">ACTIVOS</small>
                  <h3 className="fw-bold mb-0" style={{ color: COLORS.verde }}>{resumen.totalActivos}</h3>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: COLORS.verdeSuave }}>
                  <i className="bi bi-person-check" style={{ color: COLORS.verde, fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={12}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '12px', borderLeft: `4px solid ${COLORS.textoSecundario}` }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small style={{ color: COLORS.textoSecundario }} className="d-block mb-1">INACTIVOS</small>
                  <h3 className="fw-bold mb-0" style={{ color: COLORS.textoSecundario }}>{resumen.totalInactivos}</h3>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: COLORS.bgGeneral }}>
                  <i className="bi bi-person-slash" style={{ color: COLORS.textoSecundario, fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <Card.Body className="p-3">
          <Row className="g-2 align-items-end">
            <Col lg={4} md={6}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: COLORS.bgGeneral, borderColor: COLORS.bordes }}>
                  <i className="bi bi-search" style={{ color: COLORS.textoSecundario }}></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre, apellido o DNI..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                  style={{ borderColor: COLORS.bordes }}
                  className="rounded-end-3"
                />
              </InputGroup>
            </Col>
            <Col lg={2} md={6}>
              <Form.Select value={filtroActivo} onChange={(e) => setFiltroActivo(e.target.value)} className="rounded-3" style={{ borderColor: COLORS.bordes }}>
                <option value="todas">Estado: Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </Form.Select>
            </Col>
            <Col lg={2} md={6}>
              <Form.Select value={filtroSituacion} onChange={(e) => setFiltroSituacion(e.target.value)} className="rounded-3" style={{ borderColor: COLORS.bordes }}>
                <option value="todas">Situación: Todas</option>
                <option value="1">Excelente</option>
                <option value="2">Buena</option>
                <option value="3">Regular</option>
                <option value="4">Mala</option>
                <option value="5">Crítica</option>
              </Form.Select>
            </Col>
            <Col lg={4} md={6} className="d-flex justify-content-end gap-2">
              <small style={{ color: COLORS.textoSecundario }} className="align-self-center">{clientes.length} clientes</small>
              <Button onClick={handleBuscar} variant="outline-primary" size="sm" className="rounded-3" style={{ color: COLORS.azul, borderColor: COLORS.azul }}>
                <i className="bi bi-search me-1"></i>Buscar
              </Button>
              <Button onClick={handleLimpiar} variant="outline-secondary" size="sm" className="rounded-3" style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
                <i className="bi bi-eraser me-1"></i>Limpiar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de Clientes */}
      {clientes.length === 0 ? (
        <div className="text-center py-5" style={{ color: COLORS.textoSecundario }}>
          <i className="bi bi-people" style={{ fontSize: '3rem' }}></i>
          <p className="mt-3">No hay clientes con los filtros aplicados</p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead style={{ backgroundColor: COLORS.bgGeneral }}>
                  <tr>
                    {['Cliente', 'DNI', 'Contacto', 'Situación Crediticia', 'Estado', 'Acciones'].map(h => (
                      <th key={h} style={{ color: COLORS.textoSecundario, fontWeight: '600', padding: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(cliente => (
                    <tr key={cliente._id} style={{ borderBottom: `1px solid ${COLORS.bordes}` }}>
                      <td style={{ padding: '12px' }}>
                        <div className="d-flex align-items-center">
                          <div className="d-flex align-items-center justify-content-center rounded-circle me-2"
                            style={{
                              width: '36px', height: '36px',
                              backgroundColor: cliente.activo ? COLORS.verdeSuave : COLORS.bgGeneral,
                              color: cliente.activo ? COLORS.verde : COLORS.textoSecundario,
                              fontWeight: 'bold', fontSize: '0.85rem'
                            }}>
                            {cliente.nombre?.charAt(0)}{cliente.apellido?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: COLORS.textoPrincipal }}>{cliente.nombreCompleto}</div>
                            <small style={{ color: COLORS.textoSecundario }}>{cliente.email || 'Sin email'}</small>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: COLORS.textoSecundario }}>{cliente.dni || '-'}</td>
                      <td>
                        <div style={{ color: COLORS.textoPrincipal }}>{cliente.telefono || '-'}</div>
                        {cliente.telefono2 && <small style={{ color: COLORS.textoSecundario }}>{cliente.telefono2}</small>}
                      </td>
                      <td>{pillSituacion(cliente.situacionCrediticia)}</td>
                      <td>
                        <Pill bg={cliente.activo ? COLORS.verdeSuave : COLORS.bgGeneral} color={cliente.activo ? COLORS.verde : COLORS.textoSecundario}>
                          {cliente.activo ? 'Activo' : 'Inactivo'}
                        </Pill>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm" className="rounded-3"
                            onClick={() => handleVerCliente(cliente)} title="Ver detalles"
                            style={{ borderColor: COLORS.azul, color: COLORS.azul }}>
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button variant="outline-success" size="sm" className="rounded-3"
                            onClick={() => handleVerVentas(cliente)} title="Ver ventas del cliente"
                            style={{ borderColor: COLORS.verde, color: COLORS.verde }}>
                            <i className="bi bi-file-earmark-bar-graph"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {hayMas && (
        <div className="text-center mt-3">
          <Button onClick={handleCargarMas} variant="outline-primary" className="rounded-3 px-4" disabled={cargandoMas}
            style={{ borderColor: COLORS.azul, color: COLORS.azul }}>
            {cargandoMas ? <><Spinner size="sm" className="me-2" />Cargando...</> : <><i className="bi bi-arrow-down me-2"></i>Cargar más ({restantes} restantes)</>}
          </Button>
        </div>
      )}

      {/* MODAL DETALLE CLIENTE */}
      <Modal show={showModalCliente} onHide={() => setShowModalCliente(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
            <i className="bi bi-person me-2" style={{ color: COLORS.azul }}></i>
            Detalle del Cliente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pt-3">
          {clienteDetalle && (
            <>
              <div className="text-center mb-4">
                <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                  style={{
                    width: '80px', height: '80px',
                    backgroundColor: clienteDetalle.activo ? COLORS.verdeSuave : COLORS.bgGeneral,
                    color: clienteDetalle.activo ? COLORS.verde : COLORS.textoSecundario,
                    fontSize: '2rem', fontWeight: 'bold'
                  }}>
                  {clienteDetalle.nombre?.charAt(0)}{clienteDetalle.apellido?.charAt(0)}
                </div>
                <h4 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal }}>
                  {clienteDetalle.nombreCompleto}
                </h4>
                <div className="d-flex justify-content-center gap-2">
                  <Pill bg={clienteDetalle.activo ? COLORS.verdeSuave : COLORS.bgGeneral} color={clienteDetalle.activo ? COLORS.verde : COLORS.textoSecundario}>
                    {clienteDetalle.activo ? 'Activo' : 'Inactivo'}
                  </Pill>
                  {pillSituacion(clienteDetalle.situacionCrediticia)}
                </div>
              </div>

              <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                  <i className="bi bi-info-circle me-2"></i>Información Personal
                </h6>
                <Row className="g-3">
                  <Col md={4}>
                    <small style={{ color: COLORS.textoSecundario }} className="d-block">DNI</small>
                    <strong style={{ color: COLORS.textoPrincipal }}>{clienteDetalle.dni || 'N/A'}</strong>
                  </Col>
                  <Col md={4}>
                    <small style={{ color: COLORS.textoSecundario }} className="d-block">CUIL</small>
                    <span style={{ color: COLORS.textoPrincipal }}>{clienteDetalle.cuil || 'N/A'}</span>
                  </Col>
                  <Col md={4}>
                    <small style={{ color: COLORS.textoSecundario }} className="d-block">Dirección</small>
                    <span style={{ color: COLORS.textoPrincipal }}>{clienteDetalle.direccion || 'N/A'}</span>
                  </Col>
                </Row>
              </div>

              <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                  <i className="bi bi-telephone me-2"></i>Contacto
                </h6>
                <Row className="g-3">
                  <Col md={4}>
                    <small style={{ color: COLORS.textoSecundario }} className="d-block">Teléfono</small>
                    <span style={{ color: COLORS.textoPrincipal }}>{clienteDetalle.telefono || 'N/A'}</span>
                  </Col>
                  <Col md={4}>
                    <small style={{ color: COLORS.textoSecundario }} className="d-block">Teléfono 2</small>
                    <span style={{ color: COLORS.textoPrincipal }}>{clienteDetalle.telefono2 || 'N/A'}</span>
                  </Col>
                  <Col md={4}>
                    <small style={{ color: COLORS.textoSecundario }} className="d-block">Email</small>
                    <span style={{ color: COLORS.textoPrincipal }}>{clienteDetalle.email || 'N/A'}</span>
                  </Col>
                </Row>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 px-4 pb-4 d-flex justify-content-between">
          <Button variant="outline-warning" className="rounded-3" onClick={() => handleEditarCliente(clienteDetalle)}
            title="Editar datos del cliente" style={{ borderColor: COLORS.ambar, color: COLORS.ambar }}>
            <i className="bi bi-pencil-square me-1"></i>Editar
          </Button>
          <Button variant="outline-secondary" onClick={() => setShowModalCliente(false)} className="rounded-3"
            style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL VENTAS DEL CLIENTE */}
      <Modal show={showModalVentas} onHide={handleCerrarModalVentas} size="xl" centered scrollable>
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
            <i className="bi bi-file-earmark-bar-graph me-2" style={{ color: COLORS.azul }}></i>
            Ventas del Cliente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pt-3">
          {clienteVentas && (
            <div className="d-flex align-items-center gap-3 p-3 mb-3 rounded-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
              <div className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: '48px', height: '48px',
                  backgroundColor: COLORS.azulSuave, color: COLORS.azul,
                  fontWeight: 'bold', fontSize: '1rem'
                }}>
                {clienteVentas.nombre?.charAt(0)}{clienteVentas.apellido?.charAt(0)}
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold" style={{ color: COLORS.textoPrincipal }}>{clienteVentas.nombreCompleto}</div>
                <small style={{ color: COLORS.textoSecundario }}>
                  DNI: {clienteVentas.dni} · {totalVentas} venta{totalVentas !== 1 ? 's' : ''}
                </small>
              </div>
            </div>
          )}

          {loadingVentas && (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: COLORS.azul }} />
              <p className="mt-3" style={{ color: COLORS.textoSecundario }}>Cargando ventas...</p>
            </div>
          )}

          {!loadingVentas && errorVentas && (
            <Alert variant="danger" className="border-0" style={{ borderRadius: '12px', backgroundColor: COLORS.rojoSuave, color: COLORS.rojo }}>
              <i className="bi bi-exclamation-triangle me-2"></i>{errorVentas}
              <Button onClick={() => cargarVentasCliente(clienteVentas, 1)} variant="link" className="ms-3" style={{ color: COLORS.rojo, textDecoration: 'underline' }}>
                Reintentar
              </Button>
            </Alert>
          )}

          {!loadingVentas && !errorVentas && ventasCliente.length === 0 && (
            <div className="text-center py-5" style={{ color: COLORS.textoSecundario }}>
              <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
              <p className="mt-3">Este cliente no tiene ventas registradas</p>
            </div>
          )}

          {!loadingVentas && !errorVentas && ventasCliente.length > 0 && (
            <>
              {ventasCliente.map(v => (
                <VentaCard key={v._id} venta={v} usuario={usuario} onRefresh={handleRefreshVentas} />
              ))}

              {hayMasVentas && (
                <div className="text-center mt-3">
                  <Button onClick={handleCargarMasVentas} variant="outline-primary" className="rounded-3 px-4" disabled={cargandoMasVentas}
                    style={{ borderColor: COLORS.azul, color: COLORS.azul }}>
                    {cargandoMasVentas ? <><Spinner size="sm" className="me-2" />Cargando...</> : <><i className="bi bi-arrow-down me-2"></i>Cargar más ventas</>}
                  </Button>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 px-4 pb-4">
          <Button variant="outline-secondary" onClick={handleCerrarModalVentas} className="rounded-3"
            style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL EDITAR CLIENTE */}
      <ModalEditarCliente
        show={showEditarCliente}
        onHide={handleCerrarEditarCliente}
        cliente={clienteEditar}
        setRefreshData={handleClienteActualizado}
        navigate={navigate}
      />
    </div>
  );
};