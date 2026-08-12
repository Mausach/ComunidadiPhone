// Dev/index.jsx
import React, { useEffect, useState } from 'react';
import { Button, ListGroup, Spinner, Alert, Form, Container, Row, Col, Badge, Card, InputGroup } from 'react-bootstrap';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { NavBarDev } from './Componentes/NavBarDev';
import { CargarUsuarios } from './Helpers/CargarUsuarios';
import { changeEstadoUsuario } from './Helpers/CambiarEstadoUsuario';
import { ModalDetallesUsuario } from './Componentes/ModalDetallesUsuario';
import { ModalCrearUsuario } from './Componentes/ModalCrearUsuario';

export const Dev = () => {
  const location = useLocation();
  const usuario = location.state?.user || JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  // ==========================================
  // ESTADOS DE NAVEGACIÓN
  // ==========================================
  const [vistaActiva, setVistaActiva] = useState('dashboard');

  // ==========================================
  // ESTADOS DE USUARIOS
  // ==========================================
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshData, setRefreshData] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'danger'
  });

  // ==========================================
  // VERIFICACIÓN DE USUARIO
  // ==========================================
  if (!usuario || !usuario.rol) {
    return <Navigate to="/" replace />;
  }

  if (usuario.rol !== 'dev') {
    return <Navigate to="/" replace />;
  }

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

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        await CargarUsuarios(setUsers, navigate);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError(error.message || "Error crítico. Contacte soporte.");
          showAlert(error.message || "Error al cargar los usuarios. Intentá nuevamente.", "danger");
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    if (refreshData) {
      cargarDatos();
      setRefreshData(false);
    } else {
      cargarDatos();
    }

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [refreshData]);

  const handleCloseDetailsModal = () => setShowDetailsModal(false);

  const handleShowDetailsModal = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);

  const filteredUsers = users.filter(user =>
    Object.values(user).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleChangeEstado = async (user) => {
    try {
      const result = await changeEstadoUsuario(user, setRefreshData, navigate);
      
      const estadoTexto = result.nuevoEstado ? 'activado' : 'desactivado';
      showAlert(
        `Usuario ${user.nombre} ${user.apellido} ${estadoTexto} correctamente`,
        'success'
      );
    } catch (error) {
      showAlert(
        error.message || 'Error al cambiar el estado del usuario',
        'danger'
      );
    }
  };

  const getRolIcon = (rol) => {
    const icons = {
      dev: 'bi-code-square',
      Admin: 'bi-shield-fill-check',
      ventas: 'bi-graph-up-arrow',
      mkt: 'bi-megaphone',
      serv_tec: 'bi-tools'
    };
    return icons[rol] || 'bi-person';
  };

  const getRolColor = (rol) => {
    const colors = {
      dev: '#6f42c1',
      Admin: '#dc3545',
      ventas: '#0d6efd',
      mkt: '#fd7e14',
      serv_tec: '#198754'
    };
    return colors[rol] || '#6c757d';
  };

  // ==========================================
  // PLACEHOLDERS PARA OTRAS VISTAS
  // ==========================================
  const DashboardDev = () => (
    <div className="p-4">
      <h3>Panel Dev</h3>
      <p>Bienvenido, {usuario?.nombre}</p>
    </div>
  );

  const VentasPlaceholder = () => (
    <div className="p-4"><h3>Ventas</h3><p>Panel de ventas - En desarrollo</p></div>
  );

  const CobranzaPlaceholder = () => (
    <div className="p-4"><h3>Cobranza</h3><p>Panel de cobranza - En desarrollo</p></div>
  );

  const ReportesPlaceholder = () => (
    <div className="p-4"><h3>Reportes</h3><p>Panel de reportes - En desarrollo</p></div>
  );

  // ==========================================
  // VISTA DE USUARIOS
  // ==========================================
  const VistaUsuarios = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <Spinner animation="border" variant="primary" className="mt-5" />
        </div>
      );
    }

    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-bold mb-1" style={{ color: '#1a1a1a' }}>
                  Gestión de Usuarios
                </h2>
                <p className="text-muted small">
                  Administrá los usuarios del sistema
                </p>
              </div>
              <Badge bg="primary" className="p-2">
                <i className="bi bi-people-fill me-1"></i>
                {users.length} usuarios
              </Badge>
            </div>

            {alert.show && (
              <Alert
                variant={alert.variant}
                className="d-flex align-items-center rounded-3 border-0 shadow-sm mb-3"
                style={{
                  padding: '12px 16px',
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
              </Alert>
            )}

            <Row className="mb-4">
              <Col md={6} className="mb-2 mb-md-0">
                <Form.Group>
                  <InputGroup className="border rounded-3 overflow-hidden">
                    <InputGroup.Text className="border-0 bg-transparent ps-3" style={{ color: '#6c757d' }}>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar por nombre, email, DNI, rol..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-0 py-2"
                      style={{ backgroundColor: 'transparent', boxShadow: 'none', fontSize: '0.95rem' }}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex gap-2 justify-content-md-end">
                <Button
                  variant="primary"
                  onClick={handleShowCreateModal}
                  className="rounded-3"
                  style={{ backgroundColor: '#3483FA', borderColor: '#3483FA', fontWeight: '500' }}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Nuevo Usuario
                </Button>
              </Col>
            </Row>

            {error ? (
              <Alert variant="danger" className="rounded-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <Button variant="link" className="ms-2 text-decoration-none" onClick={() => setRefreshData(true)}>
                  Reintentar
                </Button>
              </Alert>
            ) : (
              <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <Card.Body className="p-0">
                  {filteredUsers.length > 0 ? (
                    <ListGroup variant="flush">
                      {filteredUsers
                        .sort((a, b) => a.apellido?.localeCompare(b.apellido) || 0)
                        .map((user, index) => (
                          <ListGroup.Item
                            key={user._id || user.id}
                            className="p-3 border-bottom"
                            style={{
                              backgroundColor: index % 2 === 0 ? 'transparent' : '#f8f9fa',
                              transition: 'background-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f2f5'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = index % 2 === 0 ? 'transparent' : '#f8f9fa'}
                          >
                            <div className="d-flex align-items-center flex-wrap">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle me-3"
                                style={{
                                  width: '48px', height: '48px',
                                  backgroundColor: user.estado ? '#e6f4ea' : '#fde8e8',
                                  color: user.estado ? '#28a745' : '#dc3545',
                                  fontWeight: 'bold', fontSize: '1.1rem'
                                }}
                              >
                                {user.nombre?.charAt(0)}{user.apellido?.charAt(0)}
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  <span className="fw-semibold" style={{ fontSize: '1rem' }}>
                                    {user.nombre} {user.apellido}
                                  </span>
                                  <Badge bg={user.estado ? 'success' : 'secondary'} className="rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>
                                    {user.estado ? 'Activo' : 'Inactivo'}
                                  </Badge>
                                  <Badge
                                    style={{ backgroundColor: getRolColor(user.rol), fontSize: '0.65rem', padding: '4px 8px' }}
                                    className="rounded-pill"
                                  >
                                    <i className={`${getRolIcon(user.rol)} me-1`}></i>
                                    {user.rol}
                                  </Badge>
                                </div>
                                <div className="d-flex gap-3 mt-1 flex-wrap">
                                  <small className="text-muted"><i className="bi bi-envelope me-1"></i>{user.email}</small>
                                  <small className="text-muted"><i className="bi bi-telephone me-1"></i>{user.telefono}</small>
                                  {user.dni && <small className="text-muted"><i className="bi bi-card-text me-1"></i>DNI: {user.dni}</small>}
                                  {user.localidad && <small className="text-muted"><i className="bi bi-geo-alt me-1"></i>{user.localidad}</small>}
                                </div>
                              </div>
                              <div className="d-flex gap-1 ms-2">
                                <Button variant="link" className="p-1 text-secondary" onClick={() => handleShowDetailsModal(user)} title="Ver detalles">
                                  <i className="bi bi-eye" style={{ fontSize: '1.1rem' }}></i>
                                </Button>
                                <Button
                                  variant="link"
                                  className={`p-1 ${user.estado ? 'text-danger' : 'text-success'}`}
                                  onClick={() => handleChangeEstado(user)}
                                  title={user.estado ? 'Desactivar usuario' : 'Activar usuario'}
                                >
                                  <i className={`bi bi-${user.estado ? 'person-slash' : 'person-check'}`} style={{ fontSize: '1.1rem' }}></i>
                                </Button>
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-people" style={{ fontSize: '3rem', color: '#dee2e6' }}></i>
                      <p className="text-muted mt-3">No hay usuarios registrados</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            <ModalCrearUsuario
              show={showCreateModal}
              onHide={handleCloseCreateModal}
              setRefreshData={setRefreshData}
              navigate={navigate}
              usuario={usuario}
            />

            <ModalDetallesUsuario
              show={showDetailsModal}
              onHide={handleCloseDetailsModal}
              user={selectedUser}
              setRefreshData={setRefreshData}
              navigate={navigate}
              usuario={usuario}
              getRolIcon={getRolIcon}
              getRolColor={getRolColor}
            />
          </Col>
        </Row>
      </Container>
    );
  };

  // ==========================================
  // RENDERIZADO POR VISTA
  // ==========================================
  const renderVista = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return <DashboardDev />;
      case 'usuarios':
        return <VistaUsuarios />;
      case 'ventas':
        return <VentasPlaceholder />;
      case 'cobranza':
        return <CobranzaPlaceholder />;
      case 'reportes':
        return <ReportesPlaceholder />;
      default:
        return <DashboardDev />;
    }
  };

  // ==========================================
  // RENDERIZADO PRINCIPAL
  // ==========================================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <NavBarDev 
        usuario={usuario} 
        vistaActiva={vistaActiva} 
        onCambiarVista={setVistaActiva} 
      />
      <div>{renderVista()}</div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .alert-warning { background-color: #fef6e6; color: #856404; border-left: 4px solid #ffa900; }
        .alert-danger { background-color: #fde8e8; color: #721c24; border-left: 4px solid #dc3545; }
        .alert-success { background-color: #e6f4ea; color: #155724; border-left: 4px solid #28a745; }
        .alert-info { background-color: #e6f3ff; color: #004085; border-left: 4px solid #17a2b8; }
        .bi { font-size: 1.1rem; }
        .list-group-item { transition: all 0.2s ease; }
      `}</style>
    </div>
  );
};
