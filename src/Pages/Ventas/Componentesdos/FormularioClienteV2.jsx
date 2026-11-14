// Ventas/Componentes/FormularioCliente.jsx
import React, { useState } from 'react';
import { 
  Form, Row, Col, Button, Card, Spinner, Tabs, Tab, InputGroup, Badge, Stack
} from 'react-bootstrap';
import { buscarCliente } from '../Helpers/BuscarClienteExist';
import { COLORS } from '../../Cobranza/Helperss/colors'; // Ajustá la ruta si es necesario

export const FormularioCliente = ({ onSubmit, isLoading, alert, showAlert }) => {
  const [modo, setModo] = useState('nuevo');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    cuil: '',
    telefono: '',
    telefono2: '',
    email: '',
    direccion: '',
    referencia_dir: '', // 👈 NUEVO CAMPO
    situacionCrediticia: 1
  });
  const [dniBusqueda, setDniBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (alert?.show) showAlert('', '');
  };

  const handleBuscarCliente = async () => {
    if (!dniBusqueda.trim() || dniBusqueda.length !== 8) {
      showAlert('Ingresá un DNI válido de 8 dígitos', 'warning');
      return;
    }
    setBuscando(true);
    try {
      const result = await buscarCliente(dniBusqueda);
      if (result.success && result.cliente) {
        const cliente = result.cliente;
        setFormData({
          nombre: cliente.nombre || '',
          apellido: cliente.apellido || '',
          dni: cliente.dni || '',
          cuil: cliente.cuil || '',
          telefono: cliente.telefono || '',
          telefono2: cliente.telefono2 || '',
          email: cliente.email || '',
          direccion: cliente.direccion || '',
          referencia_dir: cliente.referencia_dir || '', // 👈 NUEVO CAMPO
          situacionCrediticia: cliente.situacionCrediticia || 1
        });
        setClienteEncontrado(cliente);
        showAlert('Cliente encontrado correctamente', 'success');
      }
    } catch (error) {
      showAlert(error.message || 'Cliente no encontrado. Verificá el DNI.', 'warning');
      setClienteEncontrado(null);
      // Resetear form
      setFormData({
        nombre: '', apellido: '', dni: '', cuil: '',
        telefono: '', telefono2: '', email: '', direccion: '',
        referencia_dir: '', situacionCrediticia: 1
      });
    } finally {
      setBuscando(false);
    }
  };

  const handleLimpiarBusqueda = () => {
    setDniBusqueda('');
    setClienteEncontrado(null);
    setFormData({
      nombre: '', apellido: '', dni: '', cuil: '',
      telefono: '', telefono2: '', email: '', direccion: '',
      referencia_dir: '', situacionCrediticia: 1
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.dni.trim()) {
      showAlert('El nombre, apellido y DNI son obligatorios', 'warning');
      return;
    }
    const dniRegex = /^\d{8}$/;
    if (!dniRegex.test(formData.dni)) {
      showAlert('El DNI debe tener 8 dígitos numéricos', 'warning');
      return;
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showAlert('El formato del email no es válido', 'warning');
      return;
    }
    if (formData.cuil.trim() && !/^\d{2}-\d{8}-\d$/.test(formData.cuil)) {
      showAlert('El CUIL debe tener el formato XX-XXXXXXXX-X', 'warning');
      return;
    }
    const esExistente = modo === 'existente' && clienteEncontrado !== null;
    onSubmit(formData, esExistente);
  };

  // --- Helpers visuales ---
  const getSituacionColor = (value) => ({
    1: 'success', 2: 'info', 3: 'warning', 4: 'danger', 5: 'dark'
  })[value] || 'success';

  const getSituacionText = (value) => ({
    1: 'Normal - Sin problemas crediticios',
    2: 'Monitoreo - Atraso leve',
    3: 'Riesgo medio - Atraso de un mes',
    4: 'Riesgo alto - Atraso de 3 meses',
    5: 'Irrecuperable - Deudas en estado judicial'
  })[value] || 'Normal';

  return (
    <Card className="border-0 shadow-sm position-relative" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: COLORS.cardBg }}>
      {/* Overlay de carga */}
      {isLoading && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 10, backdropFilter: 'blur(4px)' }}>
          <Spinner animation="border" style={{ color: COLORS.azul, width: '3rem', height: '3rem' }} />
          <p className="mt-3 fw-semibold" style={{ color: COLORS.azulOscuro }}>Verificando cliente...</p>
          <small style={{ color: COLORS.textoSecundario }}>Por favor, esperá un momento</small>
        </div>
      )}

      <Card.Body className="p-4 p-md-5">
        {/* Header */}
        <div className="text-center mb-4">
          <h4 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal }}>
            <i className="bi bi-person-plus me-2" style={{ color: COLORS.azul }}></i>Datos del Cliente
          </h4>
          <p className="small mb-0" style={{ color: COLORS.textoSecundario }}>
            {modo === 'nuevo' ? 'Completá los datos del cliente para comenzar la venta' : 'Buscá un cliente existente por su DNI'}
          </p>
        </div>

        {/* Alerta */}
        {alert?.show && (
          <div className={`alert alert-${alert.variant} d-flex align-items-center rounded-3 border-0 shadow-sm mb-3`}
            style={{ padding: '10px 14px', fontSize: '0.9rem', backgroundColor: alert.variant === 'success' ? COLORS.verdeSuave : alert.variant === 'warning' ? COLORS.ambarSuave : COLORS.rojoSuave, color: alert.variant === 'success' ? COLORS.verde : alert.variant === 'warning' ? COLORS.ambar : COLORS.rojo }}>
            <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
            <span className="flex-grow-1">{alert.message}</span>
            <Button variant="link" className="p-0 ms-2 text-decoration-none" style={{ color: 'inherit', opacity: 0.7 }} onClick={() => showAlert('', '')}>
              <i className="bi bi-x-circle"></i>
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs activeKey={modo} onSelect={(k) => {
          setModo(k);
          if (k === 'nuevo') handleLimpiarBusqueda();
          if (alert?.show) showAlert('', '');
        }} className="mb-4">
          <Tab eventKey="nuevo" title={<span><i className="bi bi-person-plus me-1"></i>Nuevo Cliente</span>} />
          <Tab eventKey="existente" title={<span><i className="bi bi-search me-1"></i>Cliente Existente</span>} />
        </Tabs>

        {/* Buscador (solo modo existente) */}
        {modo === 'existente' && (
          <div className="rounded-3 p-3 mb-4" style={{ backgroundColor: COLORS.bgGeneral }}>
            <Row className="g-2 align-items-end">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>
                    DNI del Cliente <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup className="rounded-3 overflow-hidden">
                    <InputGroup.Text style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.bordes }}>
                      <i className="bi bi-person-badge" style={{ color: COLORS.azul }}></i>
                    </InputGroup.Text>
                    <Form.Control type="text" placeholder="8 dígitos sin puntos" value={dniBusqueda}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setDniBusqueda(value);
                        if (clienteEncontrado) { setClienteEncontrado(null); handleLimpiarBusqueda(); }
                      }}
                      disabled={buscando || isLoading} maxLength={8}
                      style={{ borderColor: COLORS.bordes }}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex gap-2">
                <Button variant="primary" onClick={handleBuscarCliente} className="rounded-3 flex-grow-1"
                  disabled={buscando || !dniBusqueda || dniBusqueda.length !== 8 || isLoading}
                  style={{ backgroundColor: COLORS.azul, borderColor: COLORS.azul }}>
                  {buscando ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Buscando...</> : <><i className="bi bi-search me-1"></i>Buscar</>}
                </Button>
                {clienteEncontrado && (
                  <Button variant="outline-secondary" onClick={handleLimpiarBusqueda} className="rounded-3" disabled={isLoading} style={{ borderColor: COLORS.bordes }}>
                    <i className="bi bi-x-lg"></i>
                  </Button>
                )}
              </Col>
            </Row>

            {clienteEncontrado && (
              <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: COLORS.verdeSuave, border: `1px solid ${COLORS.verde}` }}>
                <Row className="g-2">
                  <Col md={6}><small style={{ color: COLORS.textoSecundario }}>Nombre Completo</small><div className="fw-semibold">{clienteEncontrado.nombre} {clienteEncontrado.apellido}</div></Col>
                  <Col md={6}><small style={{ color: COLORS.textoSecundario }}>DNI</small><div className="fw-semibold">{clienteEncontrado.dni}</div></Col>
                  <Col md={6}><small style={{ color: COLORS.textoSecundario }}>Email</small><div className="fw-semibold">{clienteEncontrado.email || '-'}</div></Col>
                  <Col md={6}><small style={{ color: COLORS.textoSecundario }}>Teléfono</small><div className="fw-semibold">{clienteEncontrado.telefono || '-'}</div></Col>
                </Row>
                <div className="mt-2"><Badge style={{ backgroundColor: COLORS.verde, color: '#fff' }}><i className="bi bi-check-circle me-1"></i>Cliente verificado</Badge></div>
              </div>
            )}
          </div>
        )}

        {/* Formulario */}
        {(modo === 'nuevo' || clienteEncontrado) && (
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {/* Bloque 1: Identificación */}
              <Col md={6}>
                <div className="rounded-3 p-3 h-100" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                    <i className="bi bi-person me-2"></i>Identificación
                  </h6>
                  <Stack gap={2}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Nombre <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                        placeholder="Ingresá el nombre" className="rounded-3" disabled={isLoading || !!clienteEncontrado} />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Apellido <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" name="apellido" value={formData.apellido} onChange={handleChange}
                        placeholder="Ingresá el apellido" className="rounded-3" disabled={isLoading || !!clienteEncontrado} />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>DNI <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" name="dni" value={formData.dni} onChange={handleChange}
                        placeholder="8 dígitos sin puntos" className="rounded-3" disabled={isLoading || !!clienteEncontrado} maxLength={8} />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>CUIL</Form.Label>
                      <Form.Control type="text" name="cuil" value={formData.cuil} onChange={handleChange}
                        placeholder="XX-XXXXXXXX-X (opcional)" className="rounded-3" disabled={isLoading || !!clienteEncontrado} />
                    </Form.Group>
                  </Stack>
                </div>
              </Col>

              {/* Bloque 2: Contacto */}
              <Col md={6}>
                <div className="rounded-3 p-3 h-100" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                    <i className="bi bi-geo-alt me-2"></i>Contacto y Ubicación
                  </h6>
                  <Stack gap={2}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Email</Form.Label>
                      <Form.Control type="email" name="email" value={formData.email} onChange={handleChange}
                        placeholder="ejemplo@correo.com (opcional)" className="rounded-3" disabled={isLoading || !!clienteEncontrado} />
                    </Form.Group>
                    <Row className="g-2">
                      <Col sm={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Teléfono</Form.Label>
                          <Form.Control type="text" name="telefono" value={formData.telefono} onChange={handleChange}
                            placeholder="Principal" className="rounded-3" disabled={isLoading || !!clienteEncontrado} />
                        </Form.Group>
                      </Col>
                      <Col sm={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Teléfono Secundario</Form.Label>
                          <Form.Control type="text" name="telefono2" value={formData.telefono2} onChange={handleChange}
                            placeholder="Alternativo" className="rounded-3" disabled={isLoading || !!clienteEncontrado} />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Dirección <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" name="direccion" value={formData.direccion} onChange={handleChange}
                        placeholder="Calle y número" className="rounded-3" disabled={isLoading || !!clienteEncontrado} />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Referencia de Dirección</Form.Label>
                      <Form.Control type="text" name="referencia_dir" value={formData.referencia_dir} onChange={handleChange}
                        placeholder="Ej: Casa de rejas verdes, entre calles..." className="rounded-3" disabled={isLoading || !!clienteEncontrado} />
                    </Form.Group>
                  </Stack>
                </div>
              </Col>

              {/* Bloque 3: Situación Crediticia */}
              <Col md={12}>
                <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.ambar }}>
                    <i className="bi bi-credit-card me-2"></i>Situación Crediticia
                  </h6>
                  <Row className="align-items-center">
                    <Col md={7}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Situación del Cliente</Form.Label>
                        <Form.Select name="situacionCrediticia" value={formData.situacionCrediticia} onChange={handleChange}
                          className="rounded-3" disabled={isLoading || !!clienteEncontrado}>
                          <option value={1}>1 - Normal - Sin problemas crediticios</option>
                          <option value={2}>2 - Monitoreo - Atraso leve</option>
                          <option value={3}>3 - Riesgo medio - Atraso de un mes</option>
                          <option value={4}>4 - Riesgo alto - Atraso de 3 meses</option>
                          <option value={5}>5 - Irrecuperable - Deudas en estado judicial</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={5} className="d-flex align-items-center mt-3 mt-md-0">
                      <div className="p-3 rounded-3 w-100" style={{
                        backgroundColor: `var(--bs-${getSituacionColor(formData.situacionCrediticia)}-bg-subtle)`,
                        border: `1px solid var(--bs-${getSituacionColor(formData.situacionCrediticia)})`
                      }}>
                        <small className="d-block" style={{ color: COLORS.textoSecundario }}>
                          <i className="bi bi-info-circle me-1"></i>Estado actual:
                        </small>
                        <span className="fw-semibold small" style={{ color: COLORS.textoPrincipal }}>
                          {getSituacionText(formData.situacionCrediticia)}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            {/* Botonera */}
            <div className="d-flex justify-content-end pt-4 mt-4" style={{ borderTop: `1px solid ${COLORS.bordes}` }}>
              <Button variant="primary" type="submit" className="rounded-3 px-4"
                style={{ backgroundColor: COLORS.azulOscuro, borderColor: COLORS.azulOscuro, fontWeight: '600', minWidth: '180px' }} disabled={isLoading}>
                {isLoading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Procesando...</> : <><i className="bi bi-check-circle me-2"></i>{modo === 'existente' && clienteEncontrado ? 'Usar este Cliente' : 'Crear Cliente'}</>}
              </Button>
            </div>

            {/* Stepper visual */}
            <div className="d-flex justify-content-center gap-4 mt-4">
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-center rounded-circle me-2"
                  style={{ width: '24px', height: '24px', backgroundColor: COLORS.azul, color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>1</div>
                <span className="small fw-semibold" style={{ color: COLORS.azul }}>Cliente</span>
              </div>
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-center rounded-circle me-2"
                  style={{ width: '24px', height: '24px', backgroundColor: COLORS.bordes, color: COLORS.textoSecundario, fontSize: '0.75rem', fontWeight: 'bold' }}>2</div>
                <span className="small" style={{ color: COLORS.textoSecundario }}>Venta</span>
              </div>
            </div>
          </Form>
        )}
      </Card.Body>

      <style>{`
        .nav-tabs .nav-link { color: ${COLORS.textoSecundario}; border: none; border-bottom: 3px solid transparent; font-weight: 500; }
        .nav-tabs .nav-link:hover { color: ${COLORS.azul}; }
        .nav-tabs .nav-link.active { color: ${COLORS.azul}; background-color: transparent; border-bottom: 3px solid ${COLORS.azul}; }
        .nav-tabs .nav-link:focus-visible { outline: none; }
      `}</style>
    </Card>
  );
};