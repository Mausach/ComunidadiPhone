// Ventas/Componentes/FormularioCliente.jsx
import React, { useState } from 'react';
import { 
  Form, Row, Col, Button, Card, Spinner, Tabs, Tab, InputGroup 
} from 'react-bootstrap';
import { buscarCliente } from '../Helpers/BuscarClienteExist';


export const FormularioCliente = ({ 
  onSubmit, 
  isLoading, 
  alert, 
  showAlert 
}) => {
  const [modo, setModo] = useState('nuevo');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    cuil: '',
    telefono: '',
    email: '',
    direccion: '',
    situacionCrediticia: 1
  });
  const [dniBusqueda, setDniBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (alert?.show) {
      showAlert('', '');
    }
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
          email: cliente.email || '',
          direccion: cliente.direccion || '',
          situacionCrediticia: cliente.situacionCrediticia || 1
        });
        
        setClienteEncontrado(cliente);
        showAlert('Cliente encontrado correctamente', 'success');
      }
      
    } catch (error) {
      showAlert(error.message || 'Cliente no encontrado. Verificá el DNI.', 'warning');
      setClienteEncontrado(null);
      setFormData({
        nombre: '',
        apellido: '',
        dni: '',
        cuil: '',
        telefono: '',
        email: '',
        direccion: '',
        situacionCrediticia: 1
      });
    } finally {
      setBuscando(false);
    }
  };

  const handleLimpiarBusqueda = () => {
    setDniBusqueda('');
    setClienteEncontrado(null);
    setFormData({
      nombre: '',
      apellido: '',
      dni: '',
      cuil: '',
      telefono: '',
      email: '',
      direccion: '',
      situacionCrediticia: 1
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

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showAlert('El formato del email no es válido', 'warning');
        return;
      }
    }

    if (formData.cuil.trim()) {
      const cuilRegex = /^\d{2}-\d{8}-\d$/;
      if (!cuilRegex.test(formData.cuil)) {
        showAlert('El CUIL debe tener el formato XX-XXXXXXXX-X', 'warning');
        return;
      }
    }

    // Determinar si es cliente existente
    const esExistente = modo === 'existente' && clienteEncontrado !== null;
    
    // Enviar al padre con la bandera
    onSubmit(formData, esExistente);
  };

  const getSituacionText = (value) => {
    const opciones = {
      1: 'Normal - Sin problemas crediticios',
      2: 'Monitoreo - Atraso leve',
      3: 'Riesgo medio - Atraso de un mes',
      4: 'Riesgo alto - Atraso de 3 meses',
      5: 'Irrecuperable - Deudas en estado judicial'
    };
    return opciones[value] || 'Normal - Sin problemas crediticios';
  };

  const getSituacionColor = (value) => {
    const colores = {
      1: 'success',
      2: 'info',
      3: 'warning',
      4: 'danger',
      5: 'dark'
    };
    return colores[value] || 'success';
  };

  return (
    <Card className="border-0 shadow-sm position-relative" style={{ borderRadius: '16px', overflow: 'hidden' }}>
      {isLoading && (
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            zIndex: 10,
            backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 fw-semibold text-primary" style={{ fontSize: '1.1rem' }}>
            <i className="bi bi-hourglass-split me-2"></i>
            Verificando cliente...
          </p>
          <p className="text-muted small">Por favor esperá un momento</p>
        </div>
      )}

      <Card.Body className="p-4 p-md-5">
        <div className="text-center mb-4">
          <h4 className="fw-bold mb-1" style={{ color: '#1a1a1a' }}>
            <i className="bi bi-person-plus me-2" style={{ color: '#3483FA' }}></i>
            Datos del Cliente
          </h4>
          <p className="text-muted small mb-0">
            {modo === 'nuevo' 
              ? 'Completá los datos del cliente para comenzar la venta' 
              : 'Buscá un cliente existente por su DNI'}
          </p>
        </div>

        {alert?.show && (
          <div 
            className={`alert alert-${alert.variant} d-flex align-items-center rounded-3 border-0 shadow-sm mb-3`}
            style={{
              padding: '10px 14px',
              fontSize: '0.9rem',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'x-circle'} me-2`}></i>
            <span className="flex-grow-1">{alert.message}</span>
            <Button
              variant="link"
              className="p-0 ms-2 text-decoration-none"
              style={{ color: 'inherit', opacity: 0.7 }}
              onClick={() => showAlert('', '')}
            >
              <i className="bi bi-x-circle"></i>
            </Button>
          </div>
        )}

        <Tabs
          activeKey={modo}
          onSelect={(k) => {
            setModo(k);
            if (k === 'nuevo') {
              handleLimpiarBusqueda();
            }
            if (alert?.show) {
              showAlert('', '');
            }
          }}
          className="mb-3"
          style={{ borderColor: '#dee2e6' }}
        >
          <Tab 
            eventKey="nuevo" 
            title={
              <span>
                <i className="bi bi-person-plus me-1"></i>
                Nuevo Cliente
              </span>
            }
          />
          <Tab 
            eventKey="existente" 
            title={
              <span>
                <i className="bi bi-search me-1"></i>
                Cliente Existente
              </span>
            }
          />
        </Tabs>

        {modo === 'existente' && (
          <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
            <Row className="g-2 align-items-end">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">
                    DNI del Cliente <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup className="rounded-3">
                    <InputGroup.Text>
                      <i className="bi bi-person-badge"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="8 dígitos sin puntos"
                      value={dniBusqueda}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setDniBusqueda(value);
                        if (clienteEncontrado) {
                          setClienteEncontrado(null);
                          handleLimpiarBusqueda();
                        }
                      }}
                      className="rounded-end-3"
                      disabled={buscando || isLoading}
                      maxLength={8}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleBuscarCliente}
                  className="rounded-3 flex-grow-1"
                  disabled={buscando || !dniBusqueda || dniBusqueda.length !== 8 || isLoading}
                  style={{ backgroundColor: '#3483FA', borderColor: '#3483FA' }}
                >
                  {buscando ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-1"></i>
                      Buscar
                    </>
                  )}
                </Button>
                {clienteEncontrado && (
                  <Button
                    variant="outline-secondary"
                    onClick={handleLimpiarBusqueda}
                    className="rounded-3"
                    disabled={isLoading}
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                )}
              </Col>
            </Row>

            {clienteEncontrado && (
              <div className="mt-3 p-2 bg-white rounded-3 border border-success">
                <Row className="g-2">
                  <Col md={6}>
                    <small className="text-muted d-block">Nombre Completo</small>
                    <span className="fw-semibold">
                      {clienteEncontrado.nombre} {clienteEncontrado.apellido}
                    </span>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">DNI</small>
                    <span className="fw-semibold">{clienteEncontrado.dni}</span>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">Email</small>
                    <span className="fw-semibold">{clienteEncontrado.email || '-'}</span>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">Teléfono</small>
                    <span className="fw-semibold">{clienteEncontrado.telefono || '-'}</span>
                  </Col>
                </Row>
                <div className="mt-2">
                  <span className="badge bg-success">
                    <i className="bi bi-check-circle me-1"></i>
                    Cliente verificado
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {(modo === 'nuevo' || clienteEncontrado) && (
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold text-primary mb-3" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-person me-2"></i>
                    Identificación y Datos Personales
                  </h6>
                  <div className="d-flex flex-column gap-2">
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">
                        Nombre <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ingresá el nombre"
                        className="rounded-3"
                        disabled={isLoading || !!clienteEncontrado}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">
                        Apellido <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        placeholder="Ingresá el apellido"
                        className="rounded-3"
                        disabled={isLoading || !!clienteEncontrado}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">
                        DNI <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="dni"
                        value={formData.dni}
                        onChange={handleChange}
                        placeholder="8 dígitos sin puntos"
                        className="rounded-3"
                        disabled={isLoading || !!clienteEncontrado}
                        maxLength={8}
                      />
                      <Form.Text className="text-muted small">
                        <i className="bi bi-info-circle me-1"></i>
                        8 dígitos numéricos
                      </Form.Text>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">CUIL</Form.Label>
                      <Form.Control
                        type="text"
                        name="cuil"
                        value={formData.cuil}
                        onChange={handleChange}
                        placeholder="Formato: XX-XXXXXXXX-X"
                        className="rounded-3"
                        disabled={isLoading || !!clienteEncontrado}
                      />
                      <Form.Text className="text-muted small">
                        <i className="bi bi-info-circle me-1"></i>
                        Ejemplo: 20-12345678-9 (opcional)
                      </Form.Text>
                    </Form.Group>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-geo-alt me-2"></i>
                    Contacto y Ubicación
                  </h6>
                  <div className="d-flex flex-column gap-2">
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ejemplo@correo.com (opcional)"
                        className="rounded-3"
                        disabled={isLoading || !!clienteEncontrado}
                      />
                      <Form.Text className="text-muted small">
                        <i className="bi bi-info-circle me-1"></i>
                        Opcional - Se validará formato si se ingresa
                      </Form.Text>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">Teléfono</Form.Label>
                      <Form.Control
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Ingresá el teléfono (opcional)"
                        className="rounded-3"
                        disabled={isLoading || !!clienteEncontrado}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">
                        Dirección <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        placeholder="Calle y número"
                        className="rounded-3"
                        disabled={isLoading || !!clienteEncontrado}
                      />
                    </Form.Group>
                  </div>
                </div>
              </Col>

              <Col md={12}>
                <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold text-warning mb-3" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-credit-card me-2"></i>
                    Situación Crediticia
                  </h6>
                  <Row>
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-secondary">
                          Situación Crediticia
                        </Form.Label>
                        <Form.Select
                          name="situacionCrediticia"
                          value={formData.situacionCrediticia}
                          onChange={handleChange}
                          className="rounded-3"
                          disabled={isLoading || !!clienteEncontrado}
                        >
                          <option value={1}>1 - Normal - Sin problemas crediticios</option>
                          <option value={2}>2 - Monitoreo - Atraso leve</option>
                          <option value={3}>3 - Riesgo medio - Atraso de un mes</option>
                          <option value={4}>4 - Riesgo alto - Atraso de 3 meses</option>
                          <option value={5}>5 - Irrecuperable - Deudas en estado judicial</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex align-items-center">
                      <div className={`p-2 bg-${getSituacionColor(formData.situacionCrediticia)} bg-opacity-10 rounded-3 w-100 border border-${getSituacionColor(formData.situacionCrediticia)}`}>
                        <small className="text-muted d-block">
                          <i className="bi bi-info-circle me-1"></i>
                          Estado actual:
                        </small>
                        <span className={`fw-semibold small text-${getSituacionColor(formData.situacionCrediticia)}`}>
                          {getSituacionText(formData.situacionCrediticia)}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

            <div className="d-flex justify-content-end pt-3 mt-3 border-top">
              <Button
                variant="primary"
                type="submit"
                className="rounded-3 px-4"
                style={{
                  backgroundColor: '#3483FA',
                  borderColor: '#3483FA',
                  fontWeight: '500',
                  minWidth: '180px'
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    {modo === 'existente' && clienteEncontrado ? 'Usar este Cliente' : 'Crear Cliente'}
                  </>
                )}
              </Button>
            </div>

            <div className="d-flex justify-content-center gap-3 mt-3">
              <div className="d-flex align-items-center">
                <span className="badge bg-primary rounded-circle me-1" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  1
                </span>
                <span className="small fw-semibold" style={{ color: '#3483FA' }}>Cliente</span>
              </div>
              <div className="d-flex align-items-center">
                <span className="badge bg-secondary rounded-circle me-1" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  2
                </span>
                <span className="small text-muted">Venta</span>
              </div>
            </div>
          </Form>
        )}
      </Card.Body>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .alert-warning {
          background-color: #fef6e6;
          color: #856404;
          border-left: 4px solid #ffa900;
        }

        .alert-danger {
          background-color: #fde8e8;
          color: #721c24;
          border-left: 4px solid #dc3545;
        }

        .alert-success {
          background-color: #e6f4ea;
          color: #155724;
          border-left: 4px solid #28a745;
        }

        .alert-info {
          background-color: #e6f3ff;
          color: #004085;
          border-left: 4px solid #17a2b8;
        }

        .nav-tabs .nav-link {
          color: #6c757d;
          border: none;
          border-bottom: 3px solid transparent;
          padding: 0.5rem 1rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .nav-tabs .nav-link:hover {
          border-color: transparent;
          color: #3483FA;
        }

        .nav-tabs .nav-link.active {
          color: #3483FA;
          background-color: transparent;
          border-bottom: 3px solid #3483FA;
        }

        .nav-tabs .nav-link:focus-visible {
          outline: none;
        }
      `}</style>
    </Card>
  );
};