// Dev/Componentes/ModalCrearUsuario.jsx
import React, { useState } from 'react';
import { Modal, Form, Row, Col, Button } from 'react-bootstrap';
import { crearUsuario } from '../Helpers/AltaNuevoUsuario';


export const ModalCrearUsuario = ({
  show,
  onHide,
  setRefreshData,
  navigate,
  usuario
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    localidad: '',
    rol: 'ventas'
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'danger'
  });

  const showAlert = (message, variant = 'danger') => {
    setAlert({
      show: true,
      message,
      variant,
    });

    setTimeout(() => {
      setAlert({ show: false, message: '', variant: 'danger' });
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      showAlert('El nombre es obligatorio', 'warning');
      return;
    }

    if (!formData.apellido.trim()) {
      showAlert('El apellido es obligatorio', 'warning');
      return;
    }

    if (!formData.dni.trim()) {
      showAlert('El DNI es obligatorio', 'warning');
      return;
    }

    if (formData.dni.length !== 8) {
      showAlert('El DNI debe tener 8 dígitos', 'warning');
      return;
    }

    if (!formData.email.trim()) {
      showAlert('El email es obligatorio', 'warning');
      return;
    }

    if (!formData.telefono.trim()) {
      showAlert('El teléfono es obligatorio', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await crearUsuario(formData, setRefreshData, navigate);

      showAlert(result.message || 'Usuario creado exitosamente', 'success');

      // Limpiar formulario y cerrar modal
      setTimeout(() => {
        setFormData({
          nombre: '',
          apellido: '',
          dni: '',
          email: '',
          telefono: '',
          localidad: '',
          rol: 'ventas'
        });
        onHide();
      }, 1500);

    } catch (error) {
      showAlert(error.message || 'Error al crear el usuario', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="create-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-person-plus me-2"></i>
          Nuevo Usuario
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* Alertas */}
        {alert.show && (
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
              onClick={() => setAlert({ show: false, message: '', variant: 'danger' })}
            >
              <i className="bi bi-x-circle"></i>
            </Button>
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            {/* Columna 1: Datos Personales */}
            <Col md={6}>
              <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold text-primary mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-person me-2"></i>
                  Datos Personales
                </h6>
                <div className="d-flex flex-column gap-2">
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Nombre *</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ingresá el nombre"
                      className="rounded-3"
                      disabled={loading}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Apellido *</Form.Label>
                    <Form.Control
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Ingresá el apellido"
                      className="rounded-3"
                      disabled={loading}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">DNI *</Form.Label>
                    <Form.Control
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      placeholder="8 dígitos"
                      className="rounded-3"
                      disabled={loading}
                      maxLength={8}
                      required
                    />
                    <Form.Text className="text-muted small">
                      <i className="bi bi-info-circle me-1"></i>
                      8 dígitos sin puntos
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>
            </Col>

            {/* Columna 2: Datos de Contacto */}
            <Col md={6}>
              <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-envelope me-2"></i>
                  Datos de Contacto
                </h6>
                <div className="d-flex flex-column gap-2">
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ejemplo@correo.com"
                      className="rounded-3"
                      disabled={loading}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Teléfono *</Form.Label>
                    <Form.Control
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ingresá el teléfono"
                      className="rounded-3"
                      disabled={loading}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Localidad</Form.Label>
                    <Form.Control
                      type="text"
                      name="localidad"
                      value={formData.localidad}
                      onChange={handleChange}
                      placeholder="Ingresá la localidad"
                      className="rounded-3"
                      disabled={loading}
                    />
                  </Form.Group>
                </div>
              </div>
            </Col>

            {/* Columna 3: Datos del Sistema (ocupa todo el ancho) */}
            <Col md={12}>
              <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold text-warning mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-gear me-2"></i>
                  Datos del Sistema
                </h6>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">Rol</Form.Label>
                      <Form.Select
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                        className="rounded-3"
                        disabled={loading}
                      >
                        <option value="dev">Dev</option>
                        <option value="ger_com">Gerente comercial</option>
                        <option value="ceo">Ceo</option>
                        <option value="cobranza">Cobranza</option>
                        <option value="admin">Admin</option>
                        <option value="ventas">Ventas</option>
                        <option value="mkt">Marketing</option>
                        <option value="serv_tec">Servicio Técnico</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-center h-100 pt-3 pt-md-0">
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        El usuario recibirá un email para configurar su contraseña
                      </small>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {/* Botones de acción */}
          <div className="d-flex gap-2 justify-content-end pt-3 mt-3 border-top">
            <Button
              variant="secondary"
              onClick={onHide}
              className="rounded-3"
              disabled={loading}
            >
              <i className="bi bi-x-circle me-1"></i>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="rounded-3"
              style={{ backgroundColor: '#3483FA', borderColor: '#3483FA' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-1"></i>
                  Crear Usuario
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>

      {/* Estilos del modal */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .create-modal .modal-dialog {
          max-width: 800px;
        }

        .create-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
        }

        .create-modal .modal-body {
          max-height: 80vh;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .create-modal .modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .create-modal .modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .create-modal .modal-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .create-modal .modal-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .create-modal .form-control:focus,
        .create-modal .form-select:focus {
          border-color: #3483FA;
          box-shadow: 0 0 0 3px rgba(52, 131, 250, 0.1);
        }

        @media (max-width: 768px) {
          .create-modal .modal-dialog {
            max-width: 100%;
            margin: 1rem;
          }
          
          .create-modal .modal-body {
            max-height: 85vh;
            padding: 1rem;
          }
        }
      `}</style>
    </Modal>
  );
};