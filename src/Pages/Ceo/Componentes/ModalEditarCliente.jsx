// src/Dev/Componentes/ModalEditarCliente.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button, Badge } from 'react-bootstrap';
import { actualizarCliente } from '../Helpers/ActualizarDatosClientes';

export const ModalEditarCliente = ({
  show,
  onHide,
  cliente,
  setRefreshData,
  navigate
}) => {
  const [formData, setFormData] = useState({
    _id: '',
    nombre: '',
    apellido: '',
    dni: '',
    cuil: '',
    telefono: '',
    telefono2: '',
    email: '',
    direccion: '',
    situacionCrediticia: 1,
    activo: true
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'danger'
  });

  // ==========================================
  // CARGAR DATOS DEL CLIENTE
  // ==========================================
  useEffect(() => {
    if (cliente) {
      setFormData({
        _id: cliente._id || cliente.id || '',
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        dni: cliente.dni || '',
        cuil: cliente.cuil || '',
        telefono: cliente.telefono || '',
        telefono2: cliente.telefono2 || cliente.telefonoSecundario || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        situacionCrediticia: cliente.situacionCrediticia || 1,
        activo: cliente.activo !== undefined ? cliente.activo : true
      });
    }
  }, [cliente]);

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

    if (alert.show) {
      setAlert({ show: false, message: '', variant: 'danger' });
    }
  };

  // ==========================================
  // ENVÍO DEL FORMULARIO
  // ==========================================
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

    // Validar DNI: 8 dígitos
    if (formData.dni.length !== 8) {
      showAlert('El DNI debe tener 8 dígitos numéricos', 'warning');
      return;
    }

    if (!formData.direccion.trim()) {
      showAlert('La dirección es obligatoria', 'warning');
      return;
    }

    // Validar email si viene
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showAlert('El formato del email no es válido', 'warning');
        return;
      }
    }

    // Validar CUIL si viene (formato XX-XXXXXXXX-X)
    if (formData.cuil.trim()) {
      const cuilRegex = /^\d{2}-\d{8}-\d$/;
      if (!cuilRegex.test(formData.cuil)) {
        showAlert('El CUIL debe tener el formato XX-XXXXXXXX-X', 'warning');
        return;
      }
    }

    // Validar situación crediticia (1-5)
    const scoring = parseInt(formData.situacionCrediticia, 10);
    if (isNaN(scoring) || scoring < 1 || scoring > 5) {
      showAlert('La situación crediticia debe estar entre 1 y 5', 'warning');
      return;
    }

    setLoading(true);
    try {
      await actualizarCliente(formData, setRefreshData, navigate);

      showAlert('Cliente actualizado exitosamente', 'success');

      // Recargar datos y cerrar modal
      setTimeout(() => {
        setRefreshData(true);
        onHide();
      }, 1500);

    } catch (error) {
      showAlert(error.message || 'Error al actualizar el cliente', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FUNCIONES AUXILIARES
  // ==========================================
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

  const getSituacionLabel = (value) => {
    const labels = {
      1: 'Normal',
      2: 'Monitoreo',
      3: 'Riesgo medio',
      4: 'Riesgo alto',
      5: 'Irrecuperable'
    };
    return labels[value] || 'Normal';
  };

  if (!cliente) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="edit-cliente-modal"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-pencil-square me-2"></i>
          Editar Cliente
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* Header resumido del cliente */}
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
              <i className="bi bi-person-badge me-1"></i>
              DNI: {formData.dni}
            </small>
          </div>
          <Badge
            bg={formData.activo ? 'success' : 'secondary'}
            className="ms-auto"
          >
            {formData.activo ? 'Activo' : 'Inactivo'}
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
          <Row className="g-3">
            {/* ==========================================
                COLUMNA 1: DATOS PERSONALES
                ========================================== */}
            <Col md={4}>
              <div className="border rounded-3 p-3 h-100" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold text-primary mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-person me-2"></i>
                  Datos Personales
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
                      disabled={loading}
                      required
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
                      disabled={loading}
                      required
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
                      placeholder="8 dígitos"
                      className="rounded-3"
                      disabled={loading}
                      maxLength={8}
                      required
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
                      placeholder="XX-XXXXXXXX-X"
                      className="rounded-3"
                      disabled={loading}
                    />
                    <Form.Text className="text-muted small">
                      <i className="bi bi-info-circle me-1"></i>
                      Ej: 20-12345678-9 (opcional)
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>
            </Col>

            {/* ==========================================
                COLUMNA 2: CONTACTO Y UBICACIÓN
                ========================================== */}
            <Col md={4}>
              <div className="border rounded-3 p-3 h-100" style={{ backgroundColor: '#f8f9fa' }}>
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
                      placeholder="ejemplo@correo.com"
                      className="rounded-3"
                      disabled={loading}
                    />
                    <Form.Text className="text-muted small">
                      <i className="bi bi-info-circle me-1"></i>
                      Opcional - Se valida formato
                    </Form.Text>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Teléfono</Form.Label>
                    <Form.Control
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Teléfono principal"
                      className="rounded-3"
                      disabled={loading}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Teléfono Secundario</Form.Label>
                    <Form.Control
                      type="text"
                      name="telefono2"
                      value={formData.telefono2}
                      onChange={handleChange}
                      placeholder="Teléfono alternativo"
                      className="rounded-3"
                      disabled={loading}
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
                      disabled={loading}
                      required
                    />
                  </Form.Group>
                </div>
              </div>
            </Col>

            {/* ==========================================
                COLUMNA 3: DATOS CREDITICIOS Y ESTADO
                ========================================== */}
            <Col md={4}>
              <div className="d-flex flex-column gap-3 h-100">
                {/* Situación Crediticia */}
                <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold text-warning mb-3" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-credit-card me-2"></i>
                    Situación Crediticia
                  </h6>
                  <div className="d-flex flex-column gap-2">
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-secondary">
                        Scoring (1-5)
                      </Form.Label>
                      <Form.Select
                        name="situacionCrediticia"
                        value={formData.situacionCrediticia}
                        onChange={handleChange}
                        className="rounded-3"
                        disabled={loading}
                      >
                        <option value={1}>1 - Normal - Sin problemas</option>
                        <option value={2}>2 - Monitoreo - Atraso leve</option>
                        <option value={3}>3 - Riesgo medio - Atraso de 1 mes</option>
                        <option value={4}>4 - Riesgo alto - Atraso de 3 meses</option>
                        <option value={5}>5 - Irrecuperable - Deudas judiciales</option>
                      </Form.Select>
                    </Form.Group>
                    <div className={`p-2 bg-${getSituacionColor(formData.situacionCrediticia)} bg-opacity-10 rounded-3 border border-${getSituacionColor(formData.situacionCrediticia)}`}>
                      <small className="text-muted d-block">
                        <i className="bi bi-info-circle me-1"></i>
                        Estado actual:
                      </small>
                      <span className={`fw-semibold small text-${getSituacionColor(formData.situacionCrediticia)}`}>
                        {getSituacionLabel(formData.situacionCrediticia)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estado del Cliente */}
                <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold text-info mb-3" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-toggle-on me-2"></i>
                    Estado del Cliente
                  </h6>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-secondary">Estado</Form.Label>
                    <Form.Select
                      name="activo"
                      value={formData.activo}
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
            </Col>
          </Row>

          {/* ==========================================
              BOTONES DE ACCIÓN
              ========================================== */}
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

      {/* ==========================================
          ESTILOS
          ========================================== */}
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

        .edit-cliente-modal .modal-dialog {
          max-width: 1100px;
        }

        .edit-cliente-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
        }

        .edit-cliente-modal .modal-body {
          max-height: 80vh;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .edit-cliente-modal .modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .edit-cliente-modal .modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .edit-cliente-modal .modal-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .edit-cliente-modal .modal-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .edit-cliente-modal .form-control:focus,
        .edit-cliente-modal .form-select:focus {
          border-color: #3483FA;
          box-shadow: 0 0 0 3px rgba(52, 131, 250, 0.1);
        }

        .edit-cliente-modal .border.rounded-3 {
          transition: all 0.2s ease;
        }

        .edit-cliente-modal .border.rounded-3:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        @media (max-width: 992px) {
          .edit-cliente-modal .modal-dialog {
            max-width: 100%;
            margin: 1rem;
          }
          
          .edit-cliente-modal .modal-body {
            max-height: 85vh;
            padding: 1rem;
          }
        }
      `}</style>
    </Modal>
  );
};