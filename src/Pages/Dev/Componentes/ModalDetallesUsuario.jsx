// Dev/Componentes/ModalDetallesUsuario.jsx
// Dev/Componentes/ModalDetallesUsuario.jsx
import React, { useState } from 'react';
import { Modal, Row, Col, Badge, Button } from 'react-bootstrap';
import { ModalEditarUsuario } from './ModalEditarUsuario';

export const ModalDetallesUsuario = ({
  show,
  onHide,
  user,
  setRefreshData,
  navigate,
  usuario,
  getRolIcon,
  getRolColor
}) => {
  const [showEditModal, setShowEditModal] = useState(false);

  if (!user) return null;

  const handleOpenEdit = () => {
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
  };

  return (
    <>
      {/* Modal de Detalles */}
      <Modal
        show={show}
        onHide={onHide}
        size="xl"
        centered
        className="details-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            <i className="bi bi-person-circle me-2"></i>
            Detalles del Usuario
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-3">
          {/* Header con foto y nombre */}
          <div className="d-flex align-items-center gap-4 mb-4 p-3 bg-light rounded-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#e6f3ff',
                color: '#3483FA',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                flexShrink: 0
              }}
            >
              {user.nombre?.charAt(0)}{user.apellido?.charAt(0)}
            </div>
            <div className="flex-grow-1">
              <h5 className="fw-bold mb-1">{user.nombre} {user.apellido}</h5>
              <div className="d-flex gap-2 flex-wrap">
                <Badge bg={user.estado ? 'success' : 'secondary'}>
                  <i className={`bi bi-${user.estado ? 'check-circle' : 'x-circle'} me-1`}></i>
                  {user.estado ? 'Activo' : 'Inactivo'}
                </Badge>
                <Badge style={{ backgroundColor: getRolColor(user.rol) }}>
                  <i className={`${getRolIcon(user.rol)} me-1`}></i>
                  {user.rol}
                </Badge>
                {user.password ? (
                  <Badge bg="success">
                    <i className="bi bi-check-circle me-1"></i>
                    Contraseña configurada
                  </Badge>
                ) : (
                  <Badge bg="warning" text="dark">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Contraseña pendiente
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Grid de 3 columnas */}
          <Row className="g-3">
            {/* Datos Primarios */}
            <Col md={4}>
              <div className="border rounded-3 p-3 h-100" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold text-primary mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-star-fill me-2"></i>
                  Datos Primarios
                </h6>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                    <span className="text-muted small">Nombre</span>
                    <span className="fw-semibold small text-end">{user.nombre}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                    <span className="text-muted small">Apellido</span>
                    <span className="fw-semibold small text-end">{user.apellido}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                    <span className="text-muted small">DNI</span>
                    <span className="fw-semibold small text-end">{user.dni || '-'}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                    <span className="text-muted small">Email</span>
                    <span className="fw-semibold small text-end" style={{ wordBreak: 'break-all' }}>{user.email}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                    <span className="text-muted small">Teléfono</span>
                    <span className="fw-semibold small text-end">{user.telefono}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1">
                    <span className="text-muted small">Localidad</span>
                    <span className="fw-semibold small text-end">{user.localidad || '-'}</span>
                  </div>
                </div>
              </div>
            </Col>

            {/* Datos Secundarios */}
            <Col md={4}>
              <div className="border rounded-3 p-3 h-100" style={{ backgroundColor: '#f8f9fa' }}>
                <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-info-circle me-2"></i>
                  Datos Secundarios
                </h6>
                <div className="d-flex flex-column gap-2">
                  {user.nombre_fam && (
                    <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span className="text-muted small">Nombre Familiar</span>
                      <span className="fw-semibold small text-end">{user.nombre_fam}</span>
                    </div>
                  )}
                  {user.apellido_fam && (
                    <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span className="text-muted small">Apellido Familiar</span>
                      <span className="fw-semibold small text-end">{user.apellido_fam}</span>
                    </div>
                  )}
                  {user.cuil && (
                    <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span className="text-muted small">CUIL</span>
                      <span className="fw-semibold small text-end">{user.cuil}</span>
                    </div>
                  )}
                  {user.telefonoSecundario && (
                    <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span className="text-muted small">Teléfono Secundario</span>
                      <span className="fw-semibold small text-end">{user.telefonoSecundario}</span>
                    </div>
                  )}
                  {user.direccion && (
                    <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span className="text-muted small">Dirección</span>
                      <span className="fw-semibold small text-end">{user.direccion}</span>
                    </div>
                  )}
                  {user.direccionSecundaria && (
                    <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span className="text-muted small">Dirección Secundaria</span>
                      <span className="fw-semibold small text-end">{user.direccionSecundaria}</span>
                    </div>
                  )}
                  {user.monotributo !== undefined && (
                    <div className="d-flex justify-content-between align-items-center py-1">
                      <span className="text-muted small">Monotributo</span>
                      <span className="fw-semibold small text-end">{user.monotributo ? 'Sí' : 'No'}</span>
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* Datos Automáticos + Dinámicos */}
            <Col md={4}>
              <div className="d-flex flex-column gap-3 h-100">
                {/* Datos Automáticos */}
                <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold text-success mb-3" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-clock-history me-2"></i>
                    Datos Automáticos
                  </h6>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span className="text-muted small">Fecha Ingreso</span>
                      <span className="fw-semibold small text-end">{user.fechaIngreso || '-'}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span className="text-muted small">Fecha Salida</span>
                      <span className="fw-semibold small text-end">{user.fechaSalida || '-'}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center py-1">
                      <span className="text-muted small">Estado</span>
                      <span className="fw-semibold small text-end">{user.estado ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </div>
                </div>

                {/* Datos Dinámicos */}
                <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold text-warning mb-3" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Datos Dinámicos
                  </h6>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between align-items-center py-1 border-bottom">
                      <span className="text-muted small">Rol</span>
                      <span className="fw-semibold small text-end">
                        <Badge style={{ backgroundColor: getRolColor(user.rol) }}>
                          <i className={`${getRolIcon(user.rol)} me-1`}></i>
                          {user.rol}
                        </Badge>
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center py-1">
                      <span className="text-muted small">Contraseña</span>
                      <span className="fw-semibold small text-end">
                        {user.password ? (
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
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="secondary"
            onClick={onHide}
            className="rounded-3"
          >
            <i className="bi bi-x-circle me-1"></i>
            Cerrar
          </Button>
          <Button
            variant="primary"
            className="rounded-3"
            style={{ backgroundColor: '#3483FA', borderColor: '#3483FA' }}
            onClick={handleOpenEdit}  // 👈 Abre el modal de edición
          >
            <i className="bi bi-pencil me-1"></i>
            Editar Usuario
          </Button>
        </Modal.Footer>

        {/* Estilos del modal */}
        <style>{`
          .details-modal .modal-dialog {
            max-width: 1100px;
          }

          .details-modal .modal-content {
            border-radius: 16px;
            overflow: hidden;
          }

          .details-modal .modal-body {
            max-height: 75vh;
            overflow-y: auto;
            padding: 1.5rem;
          }

          .details-modal .modal-body::-webkit-scrollbar {
            width: 6px;
          }

          .details-modal .modal-body::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }

          .details-modal .modal-body::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
          }

          .details-modal .modal-body::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }

          .details-modal .border.rounded-3 {
            transition: all 0.2s ease;
          }

          .details-modal .border.rounded-3:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          }

          @media (max-width: 768px) {
            .details-modal .modal-dialog {
              max-width: 100%;
              margin: 1rem;
            }
            
            .details-modal .modal-body {
              max-height: 80vh;
              padding: 1rem;
            }
          }
        `}</style>
      </Modal>

      {/* Modal de Editar Usuario - Anidado dentro del mismo componente */}
      <ModalEditarUsuario
        show={showEditModal}
        onHide={handleCloseEdit}
        user={user}
        setRefreshData={setRefreshData}
        navigate={navigate}
        usuario={usuario}
        getRolIcon={getRolIcon}
        getRolColor={getRolColor}
      />
    </>
  );
};