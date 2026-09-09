// src/Pages/Ceo/Componentes/EquiposUnificados.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Badge, Button, Spinner, Alert, Modal, Table } from 'react-bootstrap';
import { listarEquipos, crearEquipoStock, crearEquipoCanje, editarEquipo, eliminarEquipo } from '../Helpers/stockunicoapi';

const localidades = ['santiago capital', 'la banda', 'añatuya', 'monte quemado'];
const estadosEquipo = ['sellado', 'semi nuevo', 'reacondicionado', 'exhibicion', 'bueno', 'regular', 'malo'];

export const EquiposUnificados = () => {
  const [equipos, setEquipos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });
  const alertRef = useRef(null);

  const [totales, setTotales] = useState({
    totalCostoStock: 0,
    totalVentaStock: 0,
    totalTasadoCanje: 0,
    totalVentaGeneral: 0,
    totalStockCantidad: 0,
    totalCanjeCantidad: 0
  });

  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(false);
  const [restantes, setRestantes] = useState(0);
  const [totalEquipos, setTotalEquipos] = useState(0);

  const [busqueda, setBusqueda] = useState('');
  const [filtroOrigen, setFiltroOrigen] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroDisponible, setFiltroDisponible] = useState('todas');
  const [filtroLocalidad, setFiltroLocalidad] = useState('todas');

  const [showModal, setShowModal] = useState(false);
  const [equipoEditar, setEquipoEditar] = useState(null);
  const [tipoEquipo, setTipoEquipo] = useState('stock');
  const [formData, setFormData] = useState({
    nombre: '', modelo: '', capacidad: '', imei: '', color: '', bateria: '',
    localidad: '', estado: 'sellado',
    precioCompra: 0, precioVenta: 0, valorTasado: 0,
    proveedor: { nombre: '', telefono: '', email: '', factura: '' },
    ventaOrigen: '',
    disponible: true
  });
  const [saving, setSaving] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [equipoEliminar, setEquipoEliminar] = useState(null);

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detalleData, setDetalleData] = useState(null);
  const [tipoDetalle, setTipoDetalle] = useState('');
  const [equipoContexto, setEquipoContexto] = useState(null);

  // 👉 NUEVO: Modal de notas
  const [showNotasModal, setShowNotasModal] = useState(false);
  const [equipoNotas, setEquipoNotas] = useState(null);

  useEffect(() => { cargarDatos(1); }, []);

  const cargarDatos = async (paginaSolicitada = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listarEquipos({
        pagina: paginaSolicitada,
        limite: 50,
        ...(busqueda.trim() && { nombre: busqueda.trim() }),
        ...(filtroOrigen !== 'todos' && { origen: filtroOrigen }),
        ...(filtroEstado !== 'todos' && { estado: filtroEstado }),
        ...(filtroDisponible !== 'todas' && { disponible: filtroDisponible }),
        ...(filtroLocalidad !== 'todas' && { localidad: filtroLocalidad })
      });

      const equiposData = data?.data?.equipos || [];
      setEquipos(Array.isArray(equiposData) ? equiposData : []);

      const pag = data?.data?.paginacion || {};
      setHayMas(pag.hayMas || false);
      setRestantes(pag.restantes || 0);
      setTotalEquipos(pag.total || 0);
      setPagina(paginaSolicitada);

      const totals = data?.data?.totales || {};
      setTotales(totals);
    } catch (err) {
      setError(err.message || 'Error al cargar los equipos');
      setEquipos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCargarMas = async () => {
    setCargandoMas(true);
    setError('');
    try {
      const siguientePagina = pagina + 1;
      const data = await listarEquipos({
        pagina: siguientePagina,
        limite: 50,
        ...(busqueda.trim() && { nombre: busqueda.trim() }),
        ...(filtroOrigen !== 'todos' && { origen: filtroOrigen }),
        ...(filtroEstado !== 'todos' && { estado: filtroEstado }),
        ...(filtroDisponible !== 'todas' && { disponible: filtroDisponible }),
        ...(filtroLocalidad !== 'todas' && { localidad: filtroLocalidad })
      });

      const nuevosEquipos = data?.data?.equipos || [];
      setEquipos(prev => [...prev, ...(Array.isArray(nuevosEquipos) ? nuevosEquipos : [])]);

      const pag = data?.data?.paginacion || {};
      setHayMas(pag.hayMas || false);
      setRestantes(pag.restantes || 0);
      setPagina(siguientePagina);

      const totals = data?.data?.totales || {};
      setTotales(totals);
    } catch (err) {
      setError(err.message || 'Error al cargar más equipos');
    } finally {
      setCargandoMas(false);
    }
  };

  const handleBuscar = () => cargarDatos(1);

  const handleLimpiar = () => {
    setBusqueda('');
    setFiltroOrigen('todos');
    setFiltroEstado('todos');
    setFiltroDisponible('todas');
    setFiltroLocalidad('todas');
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

  const handleCrear = (tipo = 'stock') => {
    setEquipoEditar(null);
    setTipoEquipo(tipo);
    setFormData({
      nombre: '', modelo: '', capacidad: '', imei: '', color: '', bateria: '',
      localidad: '', estado: tipo === 'stock' ? 'sellado' : 'bueno',
      precioCompra: 0, precioVenta: 0, valorTasado: 0,
      proveedor: { nombre: '', telefono: '', email: '', factura: '' },
      ventaOrigen: '',
      disponible: true
    });
    setShowModal(true);
  };

  const handleEditar = (equipo) => {
    setEquipoEditar(equipo);
    setTipoEquipo(equipo.origen);
    setFormData({
      nombre: equipo.nombre || '',
      modelo: equipo.modelo || '',
      capacidad: equipo.capacidad || '',
      imei: equipo.imei || '',
      color: equipo.color || '',
      bateria: equipo.bateria || '',
      localidad: equipo.localidad || '',
      estado: equipo.estado || (equipo.origen === 'stock' ? 'sellado' : 'bueno'),
      precioCompra: equipo.precioCompra || 0,
      precioVenta: equipo.precioVenta || 0,
      valorTasado: equipo.valorTasado || 0,
      proveedor: {
        nombre: equipo.proveedor?.nombre || '',
        telefono: equipo.proveedor?.telefono || '',
        email: equipo.proveedor?.email || '',
        factura: equipo.proveedor?.factura || ''
      },
      ventaOrigen: equipo.ventaOrigen?._id || '',
      disponible: equipo.disponible !== undefined ? equipo.disponible : true
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('proveedor.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, proveedor: { ...prev.proveedor, [field]: value } }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      showAlert('El nombre del equipo es obligatorio', 'warning');
      return;
    }

    if (tipoEquipo === 'stock' && (!formData.precioVenta || formData.precioVenta <= 0)) {
      showAlert('El precio de venta es obligatorio para stock', 'warning');
      return;
    }

    if (tipoEquipo === 'canje' && (!formData.valorTasado || formData.valorTasado <= 0)) {
      showAlert('El valor tasado es obligatorio para canje', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        modelo: formData.modelo.trim(),
        capacidad: formData.capacidad.trim(),
        imei: formData.imei.trim(),
        color: formData.color.trim(),
        bateria: formData.bateria.trim(),
        localidad: formData.localidad,
        estado: formData.estado
      };

      if (tipoEquipo === 'stock') {
        payload.precioCompra = parseFloat(formData.precioCompra) || 0;
        payload.precioVenta = parseFloat(formData.precioVenta);
        payload.proveedor = {
          nombre: formData.proveedor.nombre.trim(),
          telefono: formData.proveedor.telefono.trim(),
          email: formData.proveedor.email.trim(),
          factura: formData.proveedor.factura.trim()
        };
      } else {
        payload.valorTasado = parseFloat(formData.valorTasado);
        if (formData.ventaOrigen) {
          payload.ventaOrigen = formData.ventaOrigen;
        }
      }

      if (equipoEditar) {
        payload.disponible = formData.disponible;
        await editarEquipo(equipoEditar._id, payload);
        setShowModal(false);
        showAlert('Equipo actualizado correctamente', 'success');
        cargarDatos(1);
      } else {
        if (tipoEquipo === 'stock') {
          await crearEquipoStock(payload);
          showAlert('Equipo agregado al stock correctamente', 'success');
        } else {
          await crearEquipoCanje(payload);
          showAlert('Equipo de canje agregado correctamente', 'success');
        }
        setShowModal(false);
        cargarDatos(1);
      }
    } catch (err) {
      showAlert(err.message || 'Error al guardar el equipo', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!equipoEliminar) return;
    setSaving(true);
    try {
      await eliminarEquipo(equipoEliminar._id);
      setShowDelete(false);
      setEquipoEliminar(null);
      showAlert('Equipo eliminado correctamente', 'success');
      cargarDatos(1);
    } catch (err) {
      showAlert(err.message || 'Error al eliminar el equipo', 'danger');
      setShowDelete(false);
    } finally {
      setSaving(false);
    }
  };

  const handleVerDetalle = (equipo, tipo) => {
    setEquipoContexto(equipo);
    if (tipo === 'ventaAsociada' && equipo.ventaAsociada) {
      setDetalleData(equipo.ventaAsociada);
      setTipoDetalle('ventaAsociada');
      setShowDetalleModal(true);
    } else if (tipo === 'ventaOrigen' && equipo.ventaOrigen) {
      setDetalleData(equipo.ventaOrigen);
      setTipoDetalle('ventaOrigen');
      setShowDetalleModal(true);
    }
  };

  // 👉 NUEVO: Función para ver notas
  const handleVerNotas = (equipo) => {
    setEquipoNotas(equipo);
    setShowNotasModal(true);
  };

  const formatoMoneda = (v) => !v && v !== 0 ? '$0' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
  const formatoFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const badgeOrigen = (origen) => {
    if (origen === 'canje') {
      return <Badge bg="warning" text="dark" className="text-capitalize"><i className="bi bi-arrow-repeat me-1"></i>Canje</Badge>;
    }
    return <Badge bg="primary" className="text-capitalize"><i className="bi bi-box-seam me-1"></i>Stock</Badge>;
  };

  const badgeEstado = (estado) => {
    const config = {
      'sellado': 'primary',
      'semi nuevo': 'info',
      'reacondicionado': 'warning',
      'exhibicion': 'secondary',
      'bueno': 'success',
      'regular': 'warning',
      'malo': 'danger'
    };
    return <Badge bg={config[estado] || 'secondary'} className="text-capitalize">{estado}</Badge>;
  };

  const badgeConducta = (conducta) => {
    const config = {
      'al dia': 'success',
      'cancelado': 'secondary',
      'refinanciado': 'info',
      'atrasado': 'warning',
      'cobro judicial': 'danger',
      'caducado': 'dark'
    };
    return <Badge bg={config[conducta] || 'secondary'}>{conducta || 'N/A'}</Badge>;
  };

  // 👉 NUEVO: Badge para tipo de nota
  const badgeTipoNota = (tipo) => {
    const config = {
      'general': 'secondary',
      'importante': 'danger',
      'mantenimiento': 'warning',
      'reparacion': 'info'
    };
    return <Badge bg={config[tipo] || 'secondary'}>{tipo || 'general'}</Badge>;
  };

  if (isLoading) return (
    <div className="text-center py-5">
      <Spinner animation="border" style={{ color: '#3483FA' }} />
      <p className="text-muted mt-3">Cargando equipos...</p>
    </div>
  );

  if (error && equipos.length === 0) return (
    <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '8px' }}>
      <i className="bi bi-exclamation-triangle me-2"></i>{error}
      <button onClick={() => cargarDatos(1)} className="btn btn-link btn-sm ms-3" style={{ color: '#dc3545', textDecoration: 'underline' }}>
        Reintentar
      </button>
    </Alert>
  );

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: '#1a1a1a' }}>
          <i className="bi bi-phone me-2" style={{ color: '#3483FA' }}></i>
          Inventario de Equipos
        </h3>
        <p className="text-muted">
          Administrá el inventario unificado · {totalEquipos} equipos en total
        </p>
      </div>

      {alert.show && (
        <Alert 
          ref={alertRef}
          variant={alert.variant} 
          className="shadow-sm border-0 mb-3" 
          style={{ 
            borderRadius: '8px',
            animation: 'fadeIn 0.3s ease',
            position: 'sticky',
            top: '10px',
            zIndex: 999
          }}
          onClose={() => setAlert({ show: false, message: '', variant: 'danger' })} 
          dismissible
        >
          <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : alert.variant === 'warning' ? 'exclamation-triangle' : 'x-circle'} me-2`}></i>
          {alert.message}
        </Alert>
      )}

      {/* Totales del Reporte */}
      <Row className="g-3 mb-4">
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #3483FA' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">Costo Total Stock</small>
                  <h4 className="fw-bold mb-0" style={{ color: '#1a1a1a' }}>{formatoMoneda(totales.totalCostoStock)}</h4>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#e3f2fd' }}>
                  <i className="bi bi-cash-stack" style={{ color: '#3483FA', fontSize: '1.2rem' }}></i>
                </div>
              </div>
              <small className="text-muted">{totales.totalStockCantidad || 0} equipos stock</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #198754' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">Venta Total Stock</small>
                  <h4 className="fw-bold mb-0" style={{ color: '#198754' }}>{formatoMoneda(totales.totalVentaStock)}</h4>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#d4edda' }}>
                  <i className="bi bi-graph-up-arrow" style={{ color: '#198754', fontSize: '1.2rem' }}></i>
                </div>
              </div>
              <small className="text-muted">Precio de venta equipos stock</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #ffc107' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">Total Tasado Canje</small>
                  <h4 className="fw-bold mb-0" style={{ color: '#1a1a1a' }}>{formatoMoneda(totales.totalTasadoCanje)}</h4>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#fff3cd' }}>
                  <i className="bi bi-arrow-repeat" style={{ color: '#ffc107', fontSize: '1.2rem' }}></i>
                </div>
              </div>
              <small className="text-muted">{totales.totalCanjeCantidad || 0} equipos canje</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #6f42c1' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">Venta General</small>
                  <h4 className="fw-bold mb-0" style={{ color: '#6f42c1' }}>{formatoMoneda(totales.totalVentaGeneral)}</h4>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#f3e8ff' }}>
                  <i className="bi bi-wallet2" style={{ color: '#6f42c1', fontSize: '1.2rem' }}></i>
                </div>
              </div>
              <small className="text-muted">Stock + Canje</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
        <Card.Body className="p-3">
          <Row className="g-3 align-items-end">
            <Col lg={3} md={6}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e5e5' }}>
                  <i className="bi bi-search" style={{ color: '#999' }}></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre, modelo, IMEI..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{ border: '1px solid #e5e5e5', fontSize: '0.9rem', padding: '10px 12px' }}
                />
              </InputGroup>
            </Col>

            <Col lg={2} md={6}>
              <Form.Select value={filtroOrigen} onChange={(e) => setFiltroOrigen(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                <option value="todos">Todos los orígenes</option>
                <option value="stock">Stock</option>
                <option value="canje">Canje</option>
              </Form.Select>
            </Col>

            <Col lg={2} md={6}>
              <Form.Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                <option value="todos">Todos los estados</option>
                {estadosEquipo.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
              </Form.Select>
            </Col>

            <Col lg={2} md={6}>
              <Form.Select value={filtroDisponible} onChange={(e) => setFiltroDisponible(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                <option value="todas">Todos</option>
                <option value="true">Disponibles</option>
                <option value="false">Vendidos</option>
              </Form.Select>
            </Col>

            <Col lg={3} md={12} className="d-flex justify-content-end align-items-center gap-2 flex-wrap">
              <small style={{ color: '#999' }}>{equipos.length} equipos</small>
              <Button onClick={handleBuscar} className="rounded-3" variant="outline-primary" size="sm">
                <i className="bi bi-search me-1"></i>Buscar
              </Button>
              <Button onClick={handleLimpiar} className="rounded-3" variant="outline-secondary" size="sm">
                <i className="bi bi-eraser me-1"></i>Limpiar
              </Button>
              <Button onClick={() => handleCrear('stock')} className="rounded-3" size="sm"
                style={{ backgroundColor: '#3483FA', borderColor: '#3483FA', fontWeight: '500' }}>
                <i className="bi bi-plus-circle me-1"></i>Stock
              </Button>
              <Button onClick={() => handleCrear('canje')} className="rounded-3" size="sm"
                style={{ backgroundColor: '#ffc107', borderColor: '#ffc107', fontWeight: '500', color: '#1a1a1a' }}>
                <i className="bi bi-arrow-repeat me-1"></i>Canje
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla */}
      {equipos.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <p className="text-muted mt-3">No hay equipos con los filtros aplicados</p>
        </div>
      ) : (
        <Card className="shadow-sm border-0" style={{ borderRadius: '8px' }}>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead className="bg-light">
                  <tr>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Origen</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Equipo</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Capacidad</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>IMEI</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Estado</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Valor</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Referencias</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Disponible</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Ingreso</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {equipos.map(eq => (
                    <tr key={eq._id}
                      style={{
                        borderBottom: '1px solid #f5f5f5',
                        opacity: eq.disponible ? 1 : 0.6
                      }}
                    >
                      <td>{badgeOrigen(eq.origen)}</td>
                      <td>
                        <div style={{ fontWeight: '500', color: '#333' }}>{eq.nombre}</div>
                        <small style={{ color: '#999' }}>{eq.modelo || '-'} · {eq.color || '-'}</small>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="border">{eq.capacidad || '-'}</Badge>
                      </td>
                      <td style={{ color: '#666', fontSize: '0.85rem' }}>{eq.imei || '-'}</td>
                      <td>{badgeEstado(eq.estado)}</td>
                      <td style={{ color: '#666' }}>
                        {eq.origen === 'stock' ? (
                          <>
                            <div><small className="text-muted">Compra:</small> {formatoMoneda(eq.precioCompra)}</div>
                            <div><small className="text-muted">Venta:</small> <strong style={{ color: '#198754' }}>{formatoMoneda(eq.precioVenta)}</strong></div>
                          </>
                        ) : (
                          <div><small className="text-muted">Tasado:</small> <strong>{formatoMoneda(eq.valorTasado)}</strong></div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {eq.ventaOrigen && (
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="rounded-3 text-start w-100"
                              onClick={() => handleVerDetalle(eq, 'ventaOrigen')}
                              title="Ver de quién vino este equipo"
                              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            >
                              <i className="bi bi-arrow-left-circle me-1"></i>
                              Vino de: {eq.ventaOrigen?.cliente?.nombre} {eq.ventaOrigen?.cliente?.apellido}
                            </Button>
                          )}

                          {eq.ventaAsociada && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="rounded-3 text-start w-100"
                              onClick={() => handleVerDetalle(eq, 'ventaAsociada')}
                              title="Ver a quién se vendió"
                              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            >
                              <i className="bi bi-receipt me-1"></i>
                              Vendido a: {eq.ventaAsociada?.cliente?.nombre} {eq.ventaAsociada?.cliente?.apellido}
                            </Button>
                          )}

                          {!eq.ventaOrigen && !eq.ventaAsociada && (
                            <span className="text-muted">-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg={eq.disponible ? 'success' : 'secondary'}>
                          {eq.disponible ? 'Sí' : 'No'}
                        </Badge>
                      </td>
                      <td style={{ color: '#666', fontSize: '0.85rem' }}>{formatoFecha(eq.fechaIngreso)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm" className="rounded-3"
                            onClick={() => handleEditar(eq)} title="Editar">
                            <i className="bi bi-pencil"></i>
                          </Button>
                          {eq.notas && eq.notas.length > 0 && (
                            <Button variant="outline-info" size="sm" className="rounded-3"
                              onClick={() => handleVerNotas(eq)} title={`Ver notas (${eq.notas.length})`}>
                              <i className="bi bi-chat-left-text"></i>
                              {eq.notas.length > 1 && <span className="ms-1">{eq.notas.length}</span>}
                            </Button>
                          )}
                          <Button variant="outline-danger" size="sm" className="rounded-3"
                            onClick={() => { setEquipoEliminar(eq); setShowDelete(true); }} title="Eliminar">
                            <i className="bi bi-trash3"></i>
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

      {/* Modal Crear/Editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="equipo-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className={`bi ${equipoEditar ? 'bi-pencil' : tipoEquipo === 'canje' ? 'bi-arrow-repeat' : 'bi-plus-circle'} me-2`}
              style={{ color: tipoEquipo === 'canje' ? '#ffc107' : '#3483FA' }}></i>
            {equipoEditar ? 'Editar Equipo' : tipoEquipo === 'canje' ? 'Nuevo Equipo de Canje' : 'Nuevo Equipo de Stock'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardar}>
          <Modal.Body className="pt-3">
            <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
              <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-phone me-2"></i>Datos del Equipo
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">Nombre <span className="text-danger">*</span></Form.Label>
                  <Form.Control name="nombre" value={formData.nombre} onChange={handleChange}
                    className="rounded-3" placeholder="Ej: iPhone 13" disabled={saving} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">Modelo</Form.Label>
                  <Form.Control name="modelo" value={formData.modelo} onChange={handleChange}
                    className="rounded-3" placeholder="Ej: 13 pro max" disabled={saving} />
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-semibold text-secondary">Capacidad</Form.Label>
                  <Form.Control name="capacidad" value={formData.capacidad} onChange={handleChange}
                    className="rounded-3" placeholder="Ej: 128GB" disabled={saving} />
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-semibold text-secondary">IMEI</Form.Label>
                  <Form.Control name="imei" value={formData.imei} onChange={handleChange}
                    className="rounded-3" placeholder="15 dígitos" disabled={saving} maxLength={15} />
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-semibold text-secondary">Color</Form.Label>
                  <Form.Control name="color" value={formData.color} onChange={handleChange}
                    className="rounded-3" placeholder="Ej: Negro" disabled={saving} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">Batería</Form.Label>
                  <Form.Control name="bateria" value={formData.bateria} onChange={handleChange}
                    className="rounded-3" placeholder="Ej: 85%" disabled={saving} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="bi bi-geo-alt me-1"></i>Localidad
                  </Form.Label>
                  <Form.Select name="localidad" value={formData.localidad} onChange={handleChange}
                    className="rounded-3" disabled={saving}>
                    <option value="">Seleccionar localidad</option>
                    {localidades.map(loc => <option key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>)}
                  </Form.Select>
                </Col>
              </Row>
            </div>

            <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
              <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-tag me-2"></i>Estado y {tipoEquipo === 'canje' ? 'Valor Tasado' : 'Precios'}
              </h6>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Label className="small fw-semibold text-secondary">Estado</Form.Label>
                  <Form.Select name="estado" value={formData.estado} onChange={handleChange}
                    className="rounded-3" disabled={saving}>
                    {estadosEquipo.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                  </Form.Select>
                </Col>
                {tipoEquipo === 'stock' ? (
                  <>
                    <Col md={4}>
                      <Form.Label className="small fw-semibold text-secondary">Precio Compra ($)</Form.Label>
                      <InputGroup className="rounded-3">
                        <InputGroup.Text style={{ backgroundColor: '#fff' }}>$</InputGroup.Text>
                        <Form.Control type="number" name="precioCompra" value={formData.precioCompra}
                          onChange={handleChange} className="rounded-end-3" disabled={saving} min={0} step={100} />
                      </InputGroup>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small fw-semibold text-secondary">Precio Venta ($) <span className="text-danger">*</span></Form.Label>
                      <InputGroup className="rounded-3">
                        <InputGroup.Text style={{ backgroundColor: '#fff' }}>$</InputGroup.Text>
                        <Form.Control type="number" name="precioVenta" value={formData.precioVenta}
                          onChange={handleChange} className="rounded-end-3" disabled={saving} min={0} step={100} />
                      </InputGroup>
                    </Col>
                  </>
                ) : (
                  <Col md={4}>
                    <Form.Label className="small fw-semibold text-secondary">Valor Tasado ($) <span className="text-danger">*</span></Form.Label>
                    <InputGroup className="rounded-3">
                      <InputGroup.Text style={{ backgroundColor: '#fff' }}>$</InputGroup.Text>
                      <Form.Control type="number" name="valorTasado" value={formData.valorTasado}
                        onChange={handleChange} className="rounded-end-3" disabled={saving} min={0} step={100} />
                    </InputGroup>
                  </Col>
                )}
                {equipoEditar && (
                  <Col md={4}>
                    <Form.Label className="small fw-semibold text-secondary">Disponibilidad</Form.Label>
                    <Form.Select name="disponible" value={formData.disponible}
                      onChange={(e) => setFormData(prev => ({ ...prev, disponible: e.target.value === 'true' }))}
                      className="rounded-3" disabled={saving}>
                      <option value="true">Disponible</option>
                      <option value="false">Vendido</option>
                    </Form.Select>
                  </Col>
                )}
              </Row>
            </div>

            {tipoEquipo === 'stock' && (
              <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-truck me-2"></i>Proveedor <Badge bg="secondary" className="ms-1" style={{ fontSize: '0.65rem' }}>Opcional</Badge>
                </h6>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label className="small fw-semibold text-secondary">Nombre</Form.Label>
                    <Form.Control name="proveedor.nombre" value={formData.proveedor.nombre}
                      onChange={handleChange} className="rounded-3" placeholder="Nombre del proveedor" disabled={saving} />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="small fw-semibold text-secondary">Teléfono</Form.Label>
                    <Form.Control name="proveedor.telefono" value={formData.proveedor.telefono}
                      onChange={handleChange} className="rounded-3" placeholder="Teléfono del proveedor" disabled={saving} />
                  </Col>
                </Row>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="rounded-3" disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" className="rounded-3 px-4"
              style={{
                backgroundColor: tipoEquipo === 'canje' ? '#ffc107' : '#3483FA',
                borderColor: tipoEquipo === 'canje' ? '#ffc107' : '#3483FA',
                color: tipoEquipo === 'canje' ? '#1a1a1a' : '#fff',
                fontWeight: '500'
              }} disabled={saving}>
              {saving ? <><Spinner size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-check-circle me-2"></i>Guardar Equipo</>}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} size="sm" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className="bi bi-exclamation-triangle me-2" style={{ color: '#dc3545' }}></i>Eliminar Equipo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: '#333' }}>¿Estás seguro de eliminar <strong>{equipoEliminar?.nombre}</strong>?</p>
          <p className="text-muted small">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShowDelete(false)} className="rounded-3" disabled={saving}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleEliminar} className="rounded-3" disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Detalle de Venta */}
      <Modal show={showDetalleModal} onHide={() => setShowDetalleModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className={`bi ${tipoDetalle === 'ventaAsociada' ? 'bi-receipt' : 'bi-arrow-left-circle'} me-2`}
              style={{ color: tipoDetalle === 'ventaAsociada' ? '#198754' : '#0dcaf0' }}></i>
            {tipoDetalle === 'ventaAsociada' ? 'Venta Asociada' : 'Venta de Origen'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {equipoContexto && (
            <Alert variant="light" className="border mb-3" style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>Equipo:</strong> {equipoContexto.nombre} {equipoContexto.modelo} ·
              <Badge bg={equipoContexto.origen === 'canje' ? 'warning' : 'primary'} text={equipoContexto.origen === 'canje' ? 'dark' : 'white'} className="ms-2">
                {equipoContexto.origen}
              </Badge>
            </Alert>
          )}

          {detalleData ? (
            <div>
              {/* Cliente y Venta */}
              <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-person me-2"></i>Cliente y Venta
                </h6>
                <Row className="g-3">
                  <Col md={6}>
                    <small className="text-muted d-block">Cliente</small>
                    <strong style={{ color: '#333' }}>
                      {detalleData.cliente?.nombre} {detalleData.cliente?.apellido}
                    </strong>
                    <div><small className="text-muted">DNI: {detalleData.cliente?.dni || 'N/A'}</small></div>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">Tipo de Venta</small>
                    <Badge bg="primary">{detalleData.tipoVenta || 'N/A'}</Badge>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Fecha</small>
                    <span style={{ color: '#333' }}>{formatoFecha(detalleData.fechaRealizada)}</span>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Localidad</small>
                    <span style={{ color: '#333' }}>{detalleData.localidad || 'N/A'}</span>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Vendedor</small>
                    <span style={{ color: '#333' }}>{detalleData.vendedor || 'N/A'}</span>
                  </Col>
                </Row>
              </div>

              {/* Producto Entregado */}
              <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-phone me-2"></i>Producto Entregado
                </h6>
                <Row className="g-3">
                  <Col md={4}>
                    <small className="text-muted d-block">Nombre</small>
                    <strong style={{ color: '#333' }}>{detalleData.producto?.nombre || 'N/A'}</strong>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Modelo</small>
                    <span style={{ color: '#333' }}>{detalleData.producto?.modelo || 'N/A'}</span>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">IMEI</small>
                    <span style={{ color: '#333' }}>{detalleData.producto?.imei || 'N/A'}</span>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Estado</small>
                    <Badge bg="secondary">{detalleData.producto?.estado || 'N/A'}</Badge>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Valor</small>
                    <strong style={{ color: '#198754' }}>{formatoMoneda(detalleData.producto?.valor)}</strong>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Batería</small>
                    <span style={{ color: '#333' }}>{detalleData.producto?.bateria || 'N/A'}</span>
                  </Col>
                </Row>
              </div>

              {/* Montos */}
              <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-cash me-2"></i>Montos
                </h6>
                <Row className="g-3">
                  <Col md={3}>
                    <small className="text-muted d-block">Monto Total</small>
                    <strong style={{ color: '#198754' }}>{formatoMoneda(detalleData.montoTotal)}</strong>
                  </Col>
                  <Col md={3}>
                    <small className="text-muted d-block">Monto Pagado</small>
                    <span style={{ color: '#333' }}>{formatoMoneda(detalleData.montoPagado)}</span>
                  </Col>
                  <Col md={3}>
                    <small className="text-muted d-block">Saldo</small>
                    <span style={{ color: '#dc3545' }}>
                      {formatoMoneda((detalleData.montoTotal || 0) - (detalleData.montoPagado || 0))}
                    </span>
                  </Col>
                  <Col md={3}>
                    <small className="text-muted d-block">Conducta</small>
                    {badgeConducta(detalleData.conducta_pago)}
                  </Col>
                </Row>
              </div>

              {/* Pagos Realizados */}
              {detalleData.pagos && detalleData.pagos.length > 0 && (
                <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-credit-card me-2"></i>Pagos Realizados
                  </h6>
                  {detalleData.pagos.map((pago, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center py-1" style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <span style={{ color: '#333' }}>
                        <Badge bg="light" text="dark" className="me-2">{pago.metodo}</Badge>
                        {formatoFecha(pago.fecha)}
                      </span>
                      <strong style={{ color: '#198754' }}>{formatoMoneda(pago.monto)}</strong>
                    </div>
                  ))}
                </div>
              )}

              {/* Cuotas */}
              {detalleData.cuotas && detalleData.cuotas.length > 0 && (
                <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-calendar3 me-2"></i>Cuotas
                    <Badge bg="info" className="ms-2">{detalleData.frecuenciaCuota || 'N/A'}</Badge>
                  </h6>
                  <div className="table-responsive">
                    <Table size="sm" className="mb-0" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Monto</th>
                          <th>Pagado</th>
                          <th>Estado</th>
                          <th>Fecha Cobro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalleData.cuotas.map((cuota, idx) => (
                          <tr key={idx}>
                            <td>{cuota.numeroCuota || idx + 1}</td>
                            <td>{formatoMoneda(cuota.montoCuota)}</td>
                            <td>{formatoMoneda(cuota.montoPagado)}</td>
                            <td>
                              <Badge bg={
                                cuota.estado_cuota === 'pagada' ? 'success' :
                                  cuota.estado_cuota === 'pago parcial' ? 'warning' :
                                    cuota.estado_cuota === 'no pagada' ? 'danger' : 'secondary'
                              }>
                                {cuota.estado_cuota || 'pendiente'}
                              </Badge>
                            </td>
                            <td>{formatoFecha(cuota.fechaCobrada)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted">No hay información disponible</p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShowDetalleModal(false)} className="rounded-3">
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 👉 NUEVO: Modal de Notas */}
      <Modal show={showNotasModal} onHide={() => setShowNotasModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className="bi bi-chat-left-text me-2" style={{ color: '#3483FA' }}></i>
            Notas del Equipo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {equipoNotas && (
            <>
              <div className="mb-4">
                <div className="fw-bold" style={{ fontSize: '1.1rem' }}>
                  {equipoNotas.nombre} {equipoNotas.modelo}
                </div>
                <div className="d-flex gap-2 mt-1">
                  <Badge bg={equipoNotas.origen === 'canje' ? 'warning' : 'primary'} 
                    text={equipoNotas.origen === 'canje' ? 'dark' : 'white'}>
                    {equipoNotas.origen}
                  </Badge>
                  <Badge bg="light" text="dark" className="border">
                    <i className="bi bi-chat-left-text me-1"></i>
                    {equipoNotas.notas?.length || 0} notas
                  </Badge>
                </div>
              </div>
              
              {equipoNotas.notas && equipoNotas.notas.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {equipoNotas.notas.map((nota, idx) => (
                    <div key={idx} className="border rounded-3 p-3 mb-2" 
                      style={{ 
                        backgroundColor: nota.tipo === 'importante' ? '#fde8e8' : 
                          nota.tipo === 'mantenimiento' ? '#fff3cd' : 
                          nota.tipo === 'reparacion' ? '#e3f2fd' : '#f8f9fa'
                      }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        {badgeTipoNota(nota.tipo)}
                        <small className="text-muted">
                          <i className="bi bi-calendar me-1"></i>
                          {nota.fechaFormateada || formatoFecha(nota.fecha)}
                        </small>
                      </div>
                      <p className="mb-1" style={{ color: '#333', fontSize: '0.9rem' }}>
                        {nota.texto}
                      </p>
                      <small className="text-muted">
                        <i className="bi bi-person me-1"></i>
                        {nota.usuario?.nombre || 'Sistema'}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-chat-square-text" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <p className="text-muted mt-2">No hay notas para este equipo</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShowNotasModal(false)} className="rounded-3">
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(-10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .equipo-modal .modal-dialog { max-width: 700px; }
        .equipo-modal .modal-content { border-radius: 16px; overflow: hidden; }
        .equipo-modal .modal-body { padding: 1.5rem; }
        @media (max-width: 768px) { 
          .equipo-modal .modal-dialog { max-width: 100%; margin: 1rem; } 
        }
      `}</style>
    </Container>
  );
};