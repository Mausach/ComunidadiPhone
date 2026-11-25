// src/Pages/Ceo/Componentes/ModalEditarVenta.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Button, Form, Tab, Nav, Spinner, Alert, Table } from 'react-bootstrap';
import { COLORS } from '../../Cobranza/Helperss/colors';
import { editarVenta, agregarCuotasVenta } from '../Helpers/EditarVenta';

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

const formatoFecha = (f) => !f ? '' : new Date(f).toISOString().split('T')[0];
const LOCALIDADES = ['santiago capital', 'la banda', 'añatuya', 'monte quemado'];

export const ModalEditarVenta = ({ show, onHide, venta, usuario, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('generales');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });

  // Estados del formulario
  const [formData, setFormData] = useState({
    localidad: '',
    fechaRealizada: '',
    fechaEntrega: '',
    vendedor: '',
    conducta_pago: '',
    estado: true,
    garante: {},
    pagos: [],
    descuentos: [],
  });

  // Estados para Cuotas
  const [cuotasEditadas, setCuotasEditadas] = useState([]);
  const [cuotasNuevas, setCuotasNuevas] = useState([]);

  useEffect(() => {
    if (show && venta) {
      setFormData({
        localidad: venta.localidad || '',
        fechaRealizada: formatoFecha(venta.fechaRealizada),
        fechaEntrega: formatoFecha(venta.fechaEntrega),
        vendedor: venta.vendedor || '',
        conducta_pago: venta.conducta_pago || 'al dia',
        estado: venta.estado !== false,
        garante: venta.garante ? { ...venta.garante } : {},
        pagos: venta.pagos ? venta.pagos.map(p => ({ monto: p.monto, metodo: p.metodo, notas: p.notas, fecha: p.fecha })) : [],
        descuentos: venta.descuentos ? venta.descuentos.map(d => ({ monto: d.monto, descripcion: d.descripcion })) : [],
      });

      if (venta.cuotas && venta.cuotas.length > 0) {
        setCuotasEditadas(venta.cuotas.map(c => ({
          numeroCuota: c.numeroCuota,
          montoCuotaOriginal: c.montoCuota,
          montoCuota: c.montoCuota,
          fechaCobro: formatoFecha(c.fechaCobro)
        })));
      } else {
        setCuotasEditadas([]);
      }
      setCuotasNuevas([]);
      setActiveTab('generales');
      setAlert({ show: false, message: '', variant: 'danger' });
    }
  }, [show, venta]);

  const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleGaranteChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, garante: { ...prev.garante, [name]: value } }));
  };

  // --- Manejo de Cuotas ---
  const handleCuotaChange = (index, value) => {
    const nuevas = [...cuotasEditadas];
    nuevas[index].montoCuota = value;
    setCuotasEditadas(nuevas);
  };

  const agregarCuotaNueva = () => {
    setCuotasNuevas(prev => [...prev, { montoCuota: 0, fechaCobro: '' }]);
  };
  const handleNuevaCuotaChange = (index, field, value) => {
    const nuevas = [...cuotasNuevas];
    nuevas[index][field] = value;
    setCuotasNuevas(nuevas);
  };
  const eliminarCuotaNueva = (index) => {
    setCuotasNuevas(prev => prev.filter((_, i) => i !== index));
  };

  // --- Manejo de Pagos ---
  const handlePagoChange = (i, field, value) => {
    const nuevos = [...formData.pagos];
    nuevos[i] = { ...nuevos[i], [field]: value };
    setFormData(prev => ({ ...prev, pagos: nuevos }));
  };
  const agregarPago = () => setFormData(prev => ({ ...prev, pagos: [...prev.pagos, { monto: 0, metodo: 'efectivo', notas: [] }] }));
  const eliminarPago = (i) => setFormData(prev => ({ ...prev, pagos: prev.pagos.filter((_, idx) => idx !== i) }));

  // --- Manejo de Descuentos ---
  const handleDescuentoChange = (i, field, value) => {
    const nuevos = [...formData.descuentos];
    nuevos[i] = { ...nuevos[i], [field]: value };
    setFormData(prev => ({ ...prev, descuentos: nuevos }));
  };
  const agregarDescuento = () => setFormData(prev => ({ ...prev, descuentos: [...prev.descuentos, { monto: 0, descripcion: '' }] }));
  const eliminarDescuento = (i) => setFormData(prev => ({ ...prev, descuentos: prev.descuentos.filter((_, idx) => idx !== i) }));

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Filtrar cuotas editadas
      const cuotasConCambios = cuotasEditadas
        .filter(c => c.montoCuota !== c.montoCuotaOriginal)
        .map(c => ({ numeroCuota: c.numeroCuota, montoCuota: parseFloat(c.montoCuota) }));

      // 2. Armar payload base
      const payload = {
        localidad: formData.localidad,
        fechaRealizada: formData.fechaRealizada,
        fechaEntrega: formData.fechaEntrega || null,
        vendedor: formData.vendedor,
        conducta_pago: formData.conducta_pago,
        estado: formData.estado,
        garante: formData.garante,
        pagos: formData.pagos.filter(p => p.monto > 0).map(p => ({
          monto: parseFloat(p.monto),
          metodo: p.metodo,
          notas: p.notas || [],
          fecha: p.fecha
        })),
        descuentos: formData.descuentos.filter(d => d.monto > 0).map(d => ({
          monto: parseFloat(d.monto),
          descripcion: d.descripcion
        }))
      };

      if (cuotasConCambios.length > 0) {
        payload.cuotas = cuotasConCambios;
      }

      // 3. Ejecutar edición base
      await editarVenta(venta._id, payload);

      // 4. Si hay cuotas nuevas, llamar al endpoint de agregar
      if (cuotasNuevas.length > 0) {
        const nuevasValidas = cuotasNuevas.filter(c => parseFloat(c.montoCuota) > 0);
        if (nuevasValidas.length > 0) {
          await agregarCuotasVenta(venta._id, nuevasValidas, usuario);
        }
      }

      showAlert('Venta actualizada exitosamente', 'success');
      setTimeout(() => {
        onHide();
        if (onRefresh) onRefresh();
      }, 1500);
    } catch (err) {
      showAlert(err.message || 'Error al editar la venta', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!venta) return null;

  const metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'dolares', label: 'Dólares' },
    { value: 'cripto', label: 'Criptomonedas' },
    { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' }
  ];

  const conductas = [
    { value: 'al dia', label: 'Al día' },
    { value: 'atrasado', label: 'Atrasado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'refinanciado', label: 'Refinanciado' },
    { value: 'cobro judicial', label: 'Cobro Judicial' },
    { value: 'caducado', label: 'Caducado' }
  ];

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
          <i className="bi bi-pencil-square me-2" style={{ color: COLORS.azul }}></i>
          Editar Venta
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pt-3">
        {alert.show && (
          <Alert variant={alert.variant} className="rounded-3 border-0 shadow-sm mb-3"
            style={{
              backgroundColor: alert.variant === 'success' ? COLORS.verdeSuave : alert.variant === 'warning' ? COLORS.ambarSuave : COLORS.rojoSuave,
              color: alert.variant === 'success' ? COLORS.verde : alert.variant === 'warning' ? COLORS.ambar : COLORS.rojo
            }} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'danger' })}>
            {alert.message}
          </Alert>
        )}

        {/* Contexto */}
        <div className="rounded-3 p-3 mb-4" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: '48px', height: '48px', backgroundColor: COLORS.azulSuave, color: COLORS.azul, fontWeight: 'bold', fontSize: '1rem' }}>
              {venta.cliente?.nombre?.charAt(0)}{venta.cliente?.apellido?.charAt(0)}
            </div>
            <div>
              <strong style={{ color: COLORS.textoPrincipal, fontSize: '1rem' }}>{venta.cliente?.apellido}, {venta.cliente?.nombre}</strong>
              <div className="small" style={{ color: COLORS.textoSecundario }}>
                <i className="bi bi-phone me-1"></i>{venta.producto?.nombre} {venta.producto?.modelo} · Contrato {venta.numeroContrato || '-'}
              </div>
            </div>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="pills" className="mb-3 flex-wrap gap-2">
              {[
                { key: 'generales', label: 'Generales', icon: 'info-circle' },
                ...(venta.tieneCuotas || venta.tipoVenta === 'sistema1' || venta.tipoVenta === 'sistema2' || venta.tipoVenta === 'plan_canje_cuotas'
                  ? [{ key: 'cuotas', label: `Cuotas (${cuotasEditadas.length + cuotasNuevas.length})`, icon: 'grid' }]
                  : []),
                { key: 'pagos', label: `Pagos (${formData.pagos.length})`, icon: 'wallet2' },
                { key: 'descuentos', label: `Descuentos (${formData.descuentos.length})`, icon: 'tag' },
                ...(venta.requiereGarante && formData.garante?.nombre ? [{ key: 'garante', label: 'Garante', icon: 'person-check' }] : []),
              ].map(tab => (
                <Nav.Item key={tab.key}>
                  <Nav.Link eventKey={tab.key} className="rounded-3 small"
                    style={{
                      padding: '8px 16px',
                      color: activeTab === tab.key ? COLORS.azul : COLORS.textoSecundario,
                      backgroundColor: activeTab === tab.key ? COLORS.azulSuave : 'transparent',
                      fontWeight: activeTab === tab.key ? '600' : '500'
                    }}>
                    <i className={`bi bi-${tab.icon} me-1`}></i>{tab.label}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>

            <Tab.Content>
              {/* TAB GENERALES */}
              <Tab.Pane eventKey="generales">
                <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                    <i className="bi bi-info-circle me-2"></i>Datos Generales
                  </h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}><i className="bi bi-geo-alt me-1"></i>Localidad</Form.Label>
                      <Form.Select name="localidad" value={formData.localidad} onChange={handleChange} className="rounded-3" disabled={loading}>
                        <option value="">Seleccionar localidad</option>
                        {LOCALIDADES.map(loc => <option key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}><i className="bi bi-person-badge me-1"></i>Vendedor</Form.Label>
                      <Form.Control name="vendedor" value={formData.vendedor} onChange={handleChange} className="rounded-3" />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}><i className="bi bi-calendar me-1"></i>Fecha Realizada</Form.Label>
                      <Form.Control type="date" name="fechaRealizada" value={formData.fechaRealizada} onChange={handleChange} className="rounded-3" />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}><i className="bi bi-calendar-check me-1"></i>Fecha Entrega</Form.Label>
                      <Form.Control type="date" name="fechaEntrega" value={formData.fechaEntrega} onChange={handleChange} className="rounded-3" disabled={!venta.fechaEntrega} />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}><i className="bi bi-flag me-1"></i>Conducta de Pago</Form.Label>
                      <Form.Select name="conducta_pago" value={formData.conducta_pago} onChange={handleChange} className="rounded-3">
                        {conductas.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}><i className="bi bi-toggle-on me-1"></i>Estado</Form.Label>
                      <Form.Check type="switch" id="estado-switch" label={formData.estado ? 'Activa' : 'Inactiva'} checked={formData.estado} onChange={handleChange} name="estado" />
                    </Col>
                  </Row>
                </div>
              </Tab.Pane>

              {/* TAB CUOTAS */}
              {(venta.tieneCuotas || venta.tipoVenta === 'sistema1' || venta.tipoVenta === 'sistema2' || venta.tipoVenta === 'plan_canje_cuotas') && (
                <Tab.Pane eventKey="cuotas">
                  <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                    <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                      <i className="bi bi-grid me-2"></i>Gestión de Cuotas
                    </h6>

                    <div className="mb-4">
                      <small className="d-block mb-2 fw-semibold" style={{ color: COLORS.textoSecundario }}>Cuotas Existentes</small>
                      {cuotasEditadas.length === 0 && <div className="text-muted small">No hay cuotas registradas.</div>}
                      {cuotasEditadas.length > 0 && (
                        <div className="table-responsive rounded-3" style={{ border: `1px solid ${COLORS.bordes}` }}>
                          <Table size="sm" className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
                            <thead style={{ backgroundColor: COLORS.cardBg }}>
                              <tr>
                                <th style={{ padding: '12px' }}>#</th>
                                <th style={{ padding: '12px' }}>Vencimiento</th>
                                <th style={{ padding: '12px' }}>Monto Original</th>
                                <th style={{ padding: '12px' }}>Nuevo Monto</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cuotasEditadas.map((c, i) => (
                                <tr key={i} style={{ borderBottom: `1px solid ${COLORS.bordes}` }}>
                                  <td className="fw-semibold" style={{ padding: '8px 12px' }}>#{c.numeroCuota}</td>
                                  <td style={{ padding: '8px 12px', color: COLORS.textoSecundario }}>{c.fechaCobro || '-'}</td>
                                  <td style={{ padding: '8px 12px', color: COLORS.textoSecundario }}>${c.montoCuotaOriginal.toLocaleString('es-AR')}</td>
                                  <td style={{ padding: '8px 12px' }}>
                                    <Form.Control
                                      type="number"
                                      value={c.montoCuota}
                                      onChange={(e) => handleCuotaChange(i, e.target.value)}
                                      className="rounded-3"
                                      size="sm"
                                      style={{ width: '120px' }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </div>

                    <div className="pt-3" style={{ borderTop: `1px solid ${COLORS.bordes}` }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="fw-semibold" style={{ color: COLORS.verde }}>
                          <i className="bi bi-plus-circle me-1"></i>Agregar Cuotas Nuevas
                        </small>
                        <Button variant="outline-success" size="sm" className="rounded-3" onClick={agregarCuotaNueva} style={{ borderColor: COLORS.verde, color: COLORS.verde }}>
                          <i className="bi bi-plus-lg me-1"></i>Agregar Cuota
                        </Button>
                      </div>
                      {cuotasNuevas.length === 0 && (
                        <div className="small text-muted">No has agregado nuevas cuotas aún.</div>
                      )}
                      {cuotasNuevas.map((c, i) => (
                        <Row key={i} className="g-2 mb-2 align-items-end">
                          <Col md={5}>
                            <Form.Label className="small" style={{ color: COLORS.textoSecundario }}>Monto ($)</Form.Label>
                            <Form.Control type="number" value={c.montoCuota} onChange={(e) => handleNuevaCuotaChange(i, 'montoCuota', e.target.value)} className="rounded-3" placeholder="Ej: 50000" />
                          </Col>
                          <Col md={5}>
                            <Form.Label className="small" style={{ color: COLORS.textoSecundario }}>Fecha de Cobro (Opcional)</Form.Label>
                            <Form.Control type="date" value={c.fechaCobro} onChange={(e) => handleNuevaCuotaChange(i, 'fechaCobro', e.target.value)} className="rounded-3" />
                          </Col>
                          <Col md={2}>
                            <Button variant="outline-danger" size="sm" className="rounded-3 w-100" onClick={() => eliminarCuotaNueva(i)} style={{ borderColor: COLORS.rojo, color: COLORS.rojo }}>
                              <i className="bi bi-trash3"></i>
                            </Button>
                          </Col>
                        </Row>
                      ))}
                    </div>
                  </div>
                </Tab.Pane>
              )}

              {/* TAB PAGOS */}
              <Tab.Pane eventKey="pagos">
                <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                    <i className="bi bi-wallet2 me-2"></i>Pagos Iniciales
                  </h6>
                  <div className="d-flex justify-content-end mb-2">
                    <Button variant="outline-primary" size="sm" className="rounded-3" onClick={agregarPago} style={{ borderColor: COLORS.azul, color: COLORS.azul }}>
                      <i className="bi bi-plus-circle me-1"></i>Agregar Pago
                    </Button>
                  </div>
                  {formData.pagos.length === 0 && (
                    <div className="text-center py-3 small" style={{ color: COLORS.textoSecundario }}>
                      No hay pagos registrados. Hacé clic en "Agregar Pago".
                    </div>
                  )}
                  {formData.pagos.map((pago, i) => (
                    <Row key={i} className="g-2 mb-2 align-items-end">
                      <Col md={4}>
                        <Form.Label className="small" style={{ color: COLORS.textoSecundario }}>Monto</Form.Label>
                        <Form.Control type="number" value={pago.monto} onChange={(e) => handlePagoChange(i, 'monto', e.target.value)} className="rounded-3" />
                      </Col>
                      <Col md={4}>
                        <Form.Label className="small" style={{ color: COLORS.textoSecundario }}>Método</Form.Label>
                        <Form.Select value={pago.metodo} onChange={(e) => handlePagoChange(i, 'metodo', e.target.value)} className="rounded-3">
                          {metodosPago.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </Form.Select>
                      </Col>
                      <Col md={4}>
                        <Button variant="outline-danger" size="sm" className="rounded-3 w-100" onClick={() => eliminarPago(i)} style={{ borderColor: COLORS.rojo, color: COLORS.rojo }}>
                          <i className="bi bi-trash3"></i> Quitar
                        </Button>
                      </Col>
                    </Row>
                  ))}
                </div>
              </Tab.Pane>

              {/* TAB DESCUENTOS */}
              <Tab.Pane eventKey="descuentos">
                <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                    <i className="bi bi-tag me-2"></i>Descuentos
                  </h6>
                  <div className="d-flex justify-content-end mb-2">
                    <Button variant="outline-primary" size="sm" className="rounded-3" onClick={agregarDescuento} style={{ borderColor: COLORS.azul, color: COLORS.azul }}>
                      <i className="bi bi-plus-circle me-1"></i>Agregar Descuento
                    </Button>
                  </div>
                  {formData.descuentos.length === 0 && (
                    <div className="text-center py-3 small" style={{ color: COLORS.textoSecundario }}>
                      No hay descuentos registrados. Hacé clic en "Agregar Descuento".
                    </div>
                  )}
                  {formData.descuentos.map((desc, i) => (
                    <Row key={i} className="g-2 mb-2 align-items-end">
                      <Col md={4}>
                        <Form.Label className="small" style={{ color: COLORS.textoSecundario }}>Monto</Form.Label>
                        <Form.Control type="number" value={desc.monto} onChange={(e) => handleDescuentoChange(i, 'monto', e.target.value)} className="rounded-3" />
                      </Col>
                      <Col md={6}>
                        <Form.Label className="small" style={{ color: COLORS.textoSecundario }}>Descripción</Form.Label>
                        <Form.Control type="text" value={desc.descripcion} onChange={(e) => handleDescuentoChange(i, 'descripcion', e.target.value)} className="rounded-3" />
                      </Col>
                      <Col md={2}>
                        <Button variant="outline-danger" size="sm" className="rounded-3 w-100" onClick={() => eliminarDescuento(i)} style={{ borderColor: COLORS.rojo, color: COLORS.rojo }}>
                          <i className="bi bi-trash3"></i>
                        </Button>
                      </Col>
                    </Row>
                  ))}
                </div>
              </Tab.Pane>

              {/* TAB GARANTE */}
              {venta.requiereGarante && formData.garante?.nombre && (
                <Tab.Pane eventKey="garante">
                  <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                    <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.ambar }}>
                      <i className="bi bi-person-check me-2"></i>Datos del Garante
                    </h6>
                    <Row className="g-3">
                      {['nombre', 'apellido', 'dni', 'cuil', 'telefono', 'telefono2', 'email', 'relacion', 'ocupacion', 'direccion', 'localidad'].map(campo => (
                        <Col md={6} key={campo}>
                          <Form.Label className="small fw-semibold text-capitalize" style={{ color: COLORS.textoSecundario }}>
                            <i className={`bi bi-${campo === 'email' ? 'envelope' : campo.includes('telefono') ? 'telephone' : 'person'} me-1`}></i>
                            {campo.replace('_', ' ')}
                          </Form.Label>
                          <Form.Control name={campo} value={formData.garante[campo] || ''} onChange={handleGaranteChange} className="rounded-3" />
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Tab.Pane>
              )}
            </Tab.Content>
          </Tab.Container>

          <div className="d-flex justify-content-between align-items-center mt-4 pt-4" style={{ borderTop: `1px solid ${COLORS.bordes}` }}>
            <small style={{ color: COLORS.textoSecundario }}>
              <i className="bi bi-info-circle me-1"></i>
              Los cambios se aplican solo a los campos permitidos.
            </small>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={onHide} className="rounded-3" disabled={loading} style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-3 px-4" disabled={loading}
                style={{ backgroundColor: COLORS.azul, borderColor: COLORS.azul, color: '#fff', fontWeight: '600' }}>
                {loading ? <><Spinner size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-check-circle me-2"></i>Guardar Cambios</>}
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};