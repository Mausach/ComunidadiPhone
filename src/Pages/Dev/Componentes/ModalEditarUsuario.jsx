// Dev/Componentes/ModalEditarUsuario.jsx
// Dev/Componentes/ModalEditarUsuario.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button, Badge } from 'react-bootstrap';
import { actualizarUsuario } from '../Helpers/EditUsuario';

export const ModalEditarUsuario = ({
  show,
  onHide,
  user,
  setRefreshData,
  navigate,
  usuario,
  getRolIcon,
  getRolColor
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    nombre_fam: '',
    apellido_fam: '',
    dni: '',
    cuil: '',
    localidad: '',
    email: '',
    telefono: '',
    telefonoSecundario: '',
    direccion: '',
    direccionSecundaria: '',
    rol: 'ventas',
    monotributo: false,
    estado: true
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'danger'
  });

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (user) {
      setFormData({
        _id:user._id,
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        nombre_fam: user.nombre_fam || '',
        apellido_fam: user.apellido_fam || '',
        dni: user.dni || '',
        cuil: user.cuil || '',
        localidad: user.localidad || '',
        email: user.email || '',
        telefono: user.telefono || '',
        telefonoSecundario: user.telefonoSecundario || '',
        direccion: user.direccion || '',
        direccionSecundaria: user.direccionSecundaria || '',
        rol: user.rol || 'ventas',
        monotributo: user.monotributo || false,
        estado: user.estado !== undefined ? user.estado : true
      });
    }
  }, [user]);

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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      showAlert('Nombre y apellido son obligatorios', 'warning');
      return;
    }

    if (!formData.email.trim()) {
      showAlert('El email es obligatorio', 'warning');
      return;
    }

    if (!formData.dni.trim()) {
      showAlert('El DNI es obligatorio', 'warning');
      return;
    }

    if (!formData.telefono.trim()) {
      showAlert('El teléfono es obligatorio', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Aquí iría la llamada a la API para actualizar el usuario
      await actualizarUsuario (formData,setRefreshData,navigate)
       
      //console.log('Datos a actualizar:', formData);
      
      showAlert('Usuario actualizado exitosamente', 'success');
      
      // Recargar datos y cerrar modal
      setTimeout(() => {
        setRefreshData(true);
        onHide();
      }, 1500);
      
    } catch (error) {
      showAlert(error.message || 'Error al actualizar el usuario', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="edit-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-pencil-square me-2"></i>
          Editar Usuario
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* Header resumido del usuario */}
        <div className="d-flex align-items-center gap-3 mb-4 p-2 bg-light rounded-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#e6f3ff',
              color: '#3483FA',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              flexShrink: 0
            }}
          >
            {formData.nombre?.charAt(0)}{formData.apellido?.charAt(0)}
          </div>
          <div>
            <h6 className="fw-bold mb-0">{formData.nombre} {formData.apellido}</h6>
            <small className="text-muted">
              <i className="bi bi-envelope me-1"></i>
              {formData.email}
            </small>
          </div>
          <Badge 
            bg={formData.estado ? 'success' : 'secondary'}
            className="ms-auto"
          >
            {formData.estado ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

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
          {/* Grid de 3 columnas */}
          <Row className="g-3">
            {/* Columna 1: Datos Primarios */}
            <Col md={4}>
              <div className="border rounded-3 p-3 h-100" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold text-primary mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-star-fill me-2"></i>
                  Datos Primarios
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
                      placeholder="Ingresá el DNI"
                      className="rounded-3"
                      disabled={loading}
                      required
                    />
                  </Form.Group>
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

            {/* Columna 2: Datos Secundarios */}
            <Col md={4}>
              <div className="border rounded-3 p-3 h-100" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-info-circle me-2"></i>
                  Datos Secundarios
                </h6>
                <div className="d-flex flex-column gap-2">
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Nombre Familiar</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre_fam"
                      value={formData.nombre_fam}
                      onChange={handleChange}
                      placeholder="Nombre de familiar"
                      className="rounded-3"
                      disabled={loading}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Apellido Familiar</Form.Label>
                    <Form.Control
                      type="text"
                      name="apellido_fam"
                      value={formData.apellido_fam}
                      onChange={handleChange}
                      placeholder="Apellido de familiar"
                      className="rounded-3"
                      disabled={loading}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">CUIL</Form.Label>
                    <Form.Control
                      type="text"
                      name="cuil"
                      value={formData.cuil}
                      onChange={handleChange}
                      placeholder="Ingresá el CUIL"
                      className="rounded-3"
                      disabled={loading}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Teléfono Secundario</Form.Label>
                    <Form.Control
                      type="text"
                      name="telefonoSecundario"
                      value={formData.telefonoSecundario}
                      onChange={handleChange}
                      placeholder="Teléfono alternativo"
                      className="rounded-3"
                      disabled={loading}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Dirección</Form.Label>
                    <Form.Control
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Calle y número"
                      className="rounded-3"
                      disabled={loading}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Dirección Secundaria</Form.Label>
                    <Form.Control
                      type="text"
                      name="direccionSecundaria"
                      value={formData.direccionSecundaria}
                      onChange={handleChange}
                      placeholder="Dirección alternativa"
                      className="rounded-3"
                      disabled={loading}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Monotributo</Form.Label>
                    <Form.Check
                      type="switch"
                      id="monotributo-switch"
                      label={formData.monotributo ? 'Sí' : 'No'}
                      name="monotributo"
                      checked={formData.monotributo}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Form.Group>
                </div>
              </div>
            </Col>

            {/* Columna 3: Datos Dinámicos */}
            <Col md={4}>
              <div className="d-flex flex-column gap-3 h-100">
                {/* Datos Dinámicos */}
                <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold text-warning mb-3" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Datos Dinámicos
                  </h6>
                  <div className="d-flex flex-column gap-2">
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
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">Estado</Form.Label>
                      <Form.Select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="rounded-3"
                        disabled={loading}
                      >
                        <option value={true}>Activo</option>
                        <option value={false}>Inactivo</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold text-info mb-3" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-info-circle me-2"></i>
                    Información Adicional
                  </h6>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span className="text-muted small">Fecha Ingreso</span>
                      <span className="fw-semibold small">{user?.fechaIngreso || '-'}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center py-1">
                      <span className="text-muted small">Contraseña</span>
                      <span className="fw-semibold small">
                        {user?.password ? (
                          <span className="text-success">
                            <i className="bi bi-check-circle-fill me-1"></i>Configurada
                          </span>
                        ) : (
                          <span className="text-warning">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>Pendiente
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
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
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-1"></i>
                  Guardar Cambios
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

        .edit-modal .modal-dialog {
          max-width: 1100px;
        }

        .edit-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
        }

        .edit-modal .modal-body {
          max-height: 80vh;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .edit-modal .modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .edit-modal .modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .edit-modal .modal-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .edit-modal .modal-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .edit-modal .form-control:focus,
        .edit-modal .form-select:focus {
          border-color: #3483FA;
          box-shadow: 0 0 0 3px rgba(52, 131, 250, 0.1);
        }

        .edit-modal .form-switch .form-check-input:checked {
          background-color: #3483FA;
          border-color: #3483FA;
        }

        .edit-modal .border.rounded-3 {
          transition: all 0.2s ease;
        }

        .edit-modal .border.rounded-3:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        @media (max-width: 992px) {
          .edit-modal .modal-dialog {
            max-width: 100%;
            margin: 1rem;
          }
          
          .edit-modal .modal-body {
            max-height: 85vh;
            padding: 1rem;
          }
        }
      `}</style>
    </Modal>
  );
};