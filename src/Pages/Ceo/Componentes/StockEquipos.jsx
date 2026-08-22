// src/Pages/Ceo/Componentes/StockEquipos.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { listarStock, crearEquipo, editarEquipo, eliminarEquipo } from '../Helpers/stockApi';

const localidades = ['Santiago Capital', 'La Banda', 'Añatuya', 'Monte Quemado'];

export const StockEquipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroDisponible, setFiltroDisponible] = useState('todas');
  const [filtroLocalidad, setFiltroLocalidad] = useState('todas'); // 🆕

  // Modal crear/editar
  const [showModal, setShowModal] = useState(false);
  const [equipoEditar, setEquipoEditar] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', modelo: '', imei: '', color: '', bateria: '',
    localidad: '',
    estado: 'sellado', precioCompra: 0, precioVenta: 0,
    proveedor: { nombre: '', telefono: '' },
    disponible: true
  });
  const [saving, setSaving] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [equipoEliminar, setEquipoEliminar] = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setIsLoading(true); setError('');
    try {
      const data = await listarStock();
      const equiposData = data?.data?.stock || [];
      setEquipos(Array.isArray(equiposData) ? equiposData : []);
    } catch (err) {
      setError(err.message || 'Error al cargar el stock');
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 4000);
  };

  const equiposFiltrados = useMemo(() => {
    let resultado = Array.isArray(equipos) ? equipos : [];

    if (busqueda.trim()) {
      const t = busqueda.toLowerCase().trim();
      resultado = resultado.filter(e =>
        e.nombre?.toLowerCase().includes(t) || e.modelo?.toLowerCase().includes(t) ||
        e.imei?.includes(t) || e.color?.toLowerCase().includes(t) ||
        e.localidad?.toLowerCase().includes(t)
      );
    }
    if (filtroEstado !== 'todas') resultado = resultado.filter(e => e.estado === filtroEstado);
    if (filtroDisponible === 'true') resultado = resultado.filter(e => e.disponible);
    if (filtroDisponible === 'false') resultado = resultado.filter(e => !e.disponible);
    if (filtroLocalidad !== 'todas') resultado = resultado.filter(e => e.localidad === filtroLocalidad); // 🆕

    return resultado;
  }, [equipos, busqueda, filtroEstado, filtroDisponible, filtroLocalidad]);

  const handleCrear = () => {
    setEquipoEditar(null);
    setFormData({
      nombre: '', modelo: '', imei: '', color: '', bateria: '',
      localidad: '',
      estado: 'sellado', precioCompra: 0, precioVenta: 0,
      proveedor: { nombre: '', telefono: '' },
      disponible: true
    });
    setShowModal(true);
  };

  const handleEditar = (equipo) => {
    setEquipoEditar(equipo);
    setFormData({
      nombre: equipo.nombre || '', modelo: equipo.modelo || '', imei: equipo.imei || '',
      color: equipo.color || '', bateria: equipo.bateria || '',
      localidad: equipo.localidad || '',
      estado: equipo.estado || 'sellado',
      precioCompra: equipo.precioCompra || 0, precioVenta: equipo.precioVenta || 0,
      proveedor: {
        nombre: equipo.proveedor?.nombre || '',
        telefono: equipo.proveedor?.telefono || ''
      },
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
    if (!formData.nombre.trim()) { showAlert('El nombre del equipo es obligatorio', 'warning'); return; }
    if (!formData.precioVenta || formData.precioVenta <= 0) { showAlert('El precio de venta es obligatorio', 'warning'); return; }

    setSaving(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        modelo: formData.modelo.trim(),
        imei: formData.imei.trim(),
        color: formData.color.trim(),
        bateria: formData.bateria.trim(),
        localidad: formData.localidad,
        estado: formData.estado,
        precioCompra: parseFloat(formData.precioCompra) || 0,
        precioVenta: parseFloat(formData.precioVenta),
        proveedor: {
          nombre: formData.proveedor.nombre.trim(),
          telefono: formData.proveedor.telefono.trim()
        }
      };

      if (equipoEditar) {
        payload.disponible = formData.disponible;
      }

      if (equipoEditar) {
        await editarEquipo(equipoEditar._id, payload);
        showAlert('Equipo actualizado correctamente', 'success');
      } else {
        await crearEquipo(payload);
        showAlert('Equipo agregado al stock correctamente', 'success');
      }
      setShowModal(false);
      cargarDatos();
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
      showAlert('Equipo eliminado del stock', 'success');
      setShowDelete(false);
      setEquipoEliminar(null);
      cargarDatos();
    } catch (err) {
      showAlert(err.message || 'Error al eliminar el equipo', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const formatoMoneda = (v) => !v && v !== 0 ? '$0' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
  const formatoFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const badgeEstado = (estado) => {
    const config = {
      'nuevo': 'success', 'sellado': 'primary', 'semi nuevo': 'info', 'reacondicionado': 'warning', 'exhibicion': 'secondary'
    };
    return <Badge bg={config[estado] || 'secondary'} className="text-capitalize">{estado}</Badge>;
  };

  
  const estadosEquipo = [
    'sellado', 
    'semi nuevo', 
    'reacondicionado', 
    'exhibicion', 
    'bueno', 
    'regular', 
    'malo'
];

  if (isLoading) return <div className="text-center py-5"><Spinner animation="border" style={{ color: '#3483FA' }} /><p className="text-muted mt-3">Cargando stock...</p></div>;
  if (error) return <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '8px' }}><i className="bi bi-exclamation-triangle me-2"></i>{error}<button onClick={cargarDatos} className="btn btn-link btn-sm ms-3" style={{ color: '#dc3545', textDecoration: 'underline' }}>Reintentar</button></Alert>;

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: '#1a1a1a' }}><i className="bi bi-box-seam me-2" style={{ color: '#3483FA' }}></i>Stock de Equipos</h3>
        <p className="text-muted">Administrá el inventario de equipos disponibles</p>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} className="shadow-sm border-0 mb-3" style={{ borderRadius: '8px' }} onClose={() => setAlert({ show: false, message: '', variant: 'danger' })} dismissible>
          <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>{alert.message}
        </Alert>
      )}

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
        <Card.Body className="p-3">
          <Row className="g-3 align-items-end">
            <Col lg={3} md={6}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e5e5' }}><i className="bi bi-search" style={{ color: '#999' }}></i></InputGroup.Text>
                <Form.Control placeholder="Buscar por nombre, modelo, IMEI..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                  style={{ border: '1px solid #e5e5e5', fontSize: '0.9rem', padding: '10px 12px' }} />
              </InputGroup>
            </Col>
            <Col lg={2} md={6}>
              <Form.Select value={filtroLocalidad} onChange={(e) => setFiltroLocalidad(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                <option value="todas">Todas las localidades</option>
                {localidades.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </Form.Select>
            </Col>
            <Col lg={2} md={6}>
              <Form.Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                <option value="todas">Todos los estados</option>
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
            <Col lg={3} md={6} className="d-flex justify-content-end align-items-center gap-2">
              <small style={{ color: '#999' }}>{equiposFiltrados.length} equipos</small>
              <Button onClick={handleCrear} className="rounded-3" style={{ backgroundColor: '#3483FA', borderColor: '#3483FA', fontWeight: '500' }}>
                <i className="bi bi-plus-circle me-2"></i>Nuevo Equipo
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla */}
      {equiposFiltrados.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i><p className="text-muted mt-3">No hay equipos en stock con los filtros aplicados</p></div>
      ) : (
        <Card className="shadow-sm border-0" style={{ borderRadius: '8px' }}>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead className="bg-light">
                  <tr>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Equipo</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>IMEI</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Localidad</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Estado</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>P. Compra</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>P. Venta</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Disponible</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Ingreso</th>
                    <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {equiposFiltrados.map(eq => (
                    <tr key={eq._id} style={{ borderBottom: '1px solid #f5f5f5', opacity: eq.disponible ? 1 : 0.6 }}>
                      <td>
                        <div style={{ fontWeight: '500', color: '#333' }}>{eq.nombre}</div>
                        <small style={{ color: '#999' }}>{eq.modelo || '-'} · {eq.color || '-'}</small>
                      </td>
                      <td style={{ color: '#666', fontSize: '0.85rem' }}>{eq.imei || '-'}</td>
                      <td style={{ color: '#666', fontSize: '0.85rem' }}>
                        <Badge bg="light" text="dark" className="border">{eq.localidad || 'Sin localidad'}</Badge>
                      </td>
                      <td>{badgeEstado(eq.estado)}</td>
                      <td style={{ color: '#666' }}>{formatoMoneda(eq.precioCompra)}</td>
                      <td style={{ fontWeight: '500', color: '#198754' }}>{formatoMoneda(eq.precioVenta)}</td>
                      <td>
                        <Badge bg={eq.disponible ? 'success' : 'secondary'}>
                          {eq.disponible ? 'Sí' : 'Vendido'}
                        </Badge>
                      </td>
                      <td style={{ color: '#666', fontSize: '0.85rem' }}>{formatoFecha(eq.fechaIngreso)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm" className="rounded-3" onClick={() => handleEditar(eq)} title="Editar">
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button variant="outline-danger" size="sm" className="rounded-3" onClick={() => { setEquipoEliminar(eq); setShowDelete(true); }} title="Eliminar">
                            <i className="bi bi-trash3"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal Crear/Editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="stock-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className={`bi ${equipoEditar ? 'bi-pencil' : 'bi-plus-circle'} me-2`} style={{ color: '#3483FA' }}></i>
            {equipoEditar ? 'Editar Equipo' : 'Nuevo Equipo'}
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
                  <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} className="rounded-3" placeholder="Ej: iPhone 13" disabled={saving} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">Modelo</Form.Label>
                  <Form.Control name="modelo" value={formData.modelo} onChange={handleChange} className="rounded-3" placeholder="Ej: 13 pro max" disabled={saving} />
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-semibold text-secondary">IMEI</Form.Label>
                  <Form.Control name="imei" value={formData.imei} onChange={handleChange} className="rounded-3" placeholder="15 dígitos" disabled={saving} maxLength={15} />
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-semibold text-secondary">Color</Form.Label>
                  <Form.Control name="color" value={formData.color} onChange={handleChange} className="rounded-3" placeholder="Ej: Negro" disabled={saving} />
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-semibold text-secondary">Batería</Form.Label>
                  <Form.Control name="bateria" value={formData.bateria} onChange={handleChange} className="rounded-3" placeholder="Ej: 85%" disabled={saving} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="bi bi-geo-alt me-1"></i>Localidad de destino
                  </Form.Label>
                  <Form.Select name="localidad" value={formData.localidad} onChange={handleChange} className="rounded-3" disabled={saving}>
                    <option value="">Seleccionar localidad</option>
                    {localidades.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </Form.Select>
                </Col>
              </Row>
            </div>

            <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
              <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-tag me-2"></i>Estado y Precios
              </h6>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Label className="small fw-semibold text-secondary">Estado</Form.Label>
                  <Form.Select name="estado" value={formData.estado} onChange={handleChange} className="rounded-3" disabled={saving}>
                    {estadosEquipo.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-semibold text-secondary">Precio Compra ($)</Form.Label>
                  <InputGroup className="rounded-3">
                    <InputGroup.Text style={{ backgroundColor: '#fff' }}>$</InputGroup.Text>
                    <Form.Control type="number" name="precioCompra" value={formData.precioCompra} onChange={handleChange} className="rounded-end-3" disabled={saving} min={0} step={100} />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Label className="small fw-semibold text-secondary">Precio Venta ($) <span className="text-danger">*</span></Form.Label>
                  <InputGroup className="rounded-3">
                    <InputGroup.Text style={{ backgroundColor: '#fff' }}>$</InputGroup.Text>
                    <Form.Control type="number" name="precioVenta" value={formData.precioVenta} onChange={handleChange} className="rounded-end-3" disabled={saving} min={0} step={100} />
                  </InputGroup>
                </Col>
                {equipoEditar && (
                  <Col md={4}>
                    <Form.Label className="small fw-semibold text-secondary">Disponibilidad</Form.Label>
                    <Form.Select name="disponible" value={formData.disponible} onChange={(e) => setFormData(prev => ({ ...prev, disponible: e.target.value === 'true' }))} className="rounded-3" disabled={saving}>
                      <option value="true">Disponible</option>
                      <option value="false">Vendido</option>
                    </Form.Select>
                  </Col>
                )}
              </Row>
            </div>

            <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
              <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-truck me-2"></i>Proveedor <Badge bg="secondary" className="ms-1" style={{ fontSize: '0.65rem' }}>Opcional</Badge>
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">Nombre</Form.Label>
                  <Form.Control name="proveedor.nombre" value={formData.proveedor.nombre} onChange={handleChange} className="rounded-3" placeholder="Nombre del proveedor" disabled={saving} />
                </Col>
                <Col md={6}>
                  <Form.Label className="small fw-semibold text-secondary">Teléfono</Form.Label>
                  <Form.Control name="proveedor.telefono" value={formData.proveedor.telefono} onChange={handleChange} className="rounded-3" placeholder="Teléfono del proveedor" disabled={saving} />
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="rounded-3" disabled={saving}>Cancelar</Button>
            <Button variant="primary" type="submit" className="rounded-3 px-4"
              style={{ backgroundColor: '#3483FA', borderColor: '#3483FA', fontWeight: '500' }} disabled={saving}>
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
          <p style={{ color: '#333' }}>¿Estás seguro de eliminar <strong>{equipoEliminar?.nombre}</strong> del stock?</p>
          <p className="text-muted small">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShowDelete(false)} className="rounded-3" disabled={saving}>Cancelar</Button>
          <Button variant="danger" onClick={handleEliminar} className="rounded-3" disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .stock-modal .modal-dialog { max-width: 700px; }
        .stock-modal .modal-content { border-radius: 16px; overflow: hidden; }
        .stock-modal .modal-body { padding: 1.5rem; }
        @media (max-width: 768px) { .stock-modal .modal-dialog { max-width: 100%; margin: 1rem; } }
      `}</style>
    </Container>
  );
};