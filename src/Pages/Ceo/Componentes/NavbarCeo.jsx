// src/Pages/Ceo/Componentes/NavBarCeo.jsx

import React from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';

export const NavBarCeo = ({ usuario, vistaActiva, onCambiarVista }) => {
  const navigate = useNavigate();

  const opciones = [
    { label: 'Dashboard', icon: 'bi-speedometer2', vista: 'dashboard' },
    { label: 'Reportes', icon: 'bi-graph-up-arrow', vista: 'reportes' },
    { label: 'Historial', icon: 'bi-clock-history', vista: 'historial-cuotas' },
    { label: 'Eq. Canje', icon: 'bi-arrow-left-right', vista: 'equipos-canjeados' },
    { label: 'Stock', icon: 'bi-box-seam', vista: 'stock' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <Navbar
      bg="white"
      expand="lg"
      className="shadow-sm border-bottom"
      sticky="top"
      style={{ backgroundColor: '#fff' }}
    >
      <Container fluid>
        <Navbar.Brand
          className="d-flex align-items-center"
          onClick={() => onCambiarVista('dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <img
            alt="Logo"
            src={logo}
            width="50"
            className="d-inline-block align-top"
          />
          <span className="fw-bold" style={{ color: '#0F488B', fontSize: '1.1rem' }}>
            Comunidad iPhone
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-ceo" />

        <Navbar.Collapse id="navbar-ceo">
          <Nav className="me-auto ms-3">
            {opciones.map((opcion, index) => (
              <Nav.Link
                key={index}
                onClick={() => onCambiarVista(opcion.vista)}
                className="d-flex align-items-center mx-1 px-3 py-2"
                style={{
                  color: vistaActiva === opcion.vista ? '#1a1a1a' : '#666',
                  fontWeight: vistaActiva === opcion.vista ? '600' : '400',
                  borderBottom: vistaActiva === opcion.vista
                    ? '3px solid #1a1a1a'
                    : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  borderRadius: '4px 4px 0 0',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (vistaActiva !== opcion.vista) {
                    e.target.style.color = '#1a1a1a';
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (vistaActiva !== opcion.vista) {
                    e.target.style.color = '#666';
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <i className={`${opcion.icon} me-2`}></i>
                {opcion.label}
              </Nav.Link>
            ))}
          </Nav>

          <Nav className="align-items-center">
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="dropdown-usuario"
                className="d-flex align-items-center px-3 py-2"
                style={{
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  backgroundColor: '#fff'
                }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{
                      width: '34px',
                      height: '34px',
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}
                  >
                    {usuario?.nombre?.charAt(0)?.toUpperCase()}
                    {usuario?.apellido?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="d-none d-md-block text-start">
                    <div style={{ color: '#333', fontSize: '0.9rem', fontWeight: '500', lineHeight: '1.2' }}>
                      {usuario?.nombre} {usuario?.apellido}
                    </div>
                    <div style={{ color: '#999', fontSize: '0.75rem', lineHeight: '1.2' }}>
                      CEO
                    </div>
                  </div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="shadow-sm border-0 mt-2"
                style={{ borderRadius: '8px', minWidth: '220px' }}
              >
                <div className="px-3 py-2">
                  <div style={{ color: '#666', fontSize: '0.75rem', fontWeight: '500' }}>
                    DATOS DEL USUARIO
                  </div>
                  <div style={{ color: '#333', fontSize: '0.85rem' }}>
                    {usuario?.email}
                  </div>
                  <div style={{ color: '#999', fontSize: '0.8rem' }}>
                    DNI: {usuario?.dni}
                  </div>
                </div>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={() => navigate('/pass-config')}
                  className="d-flex align-items-center py-2"
                >
                  <i className="bi bi-key me-2" style={{ color: '#666' }}></i>
                  Cambiar Contraseña
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleLogout}
                  className="d-flex align-items-center py-2"
                  style={{ color: '#dc3545' }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};