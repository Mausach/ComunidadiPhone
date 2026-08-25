// src/Pages/Ger_Comercial/Componentes/NavBarGerCom.jsx

import React from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import logo from '../../../assets/logo.png';

export const NavBarGC = ({ usuario, vistaActiva, onCambiarVista }) => {
  const navigate = useNavigate();

  const opciones = [
    { label: 'Dashboard', icon: 'bi-speedometer2', vista: 'dashboard' },
    { label: 'Ventas', icon: 'bi-cart-plus', vista: 'ventas' },
    { label: 'Ventas Directas', icon: 'bi-cash', vista: 'ventas-contado' }, // 🆕
    { label: 'Cobranza', icon: 'bi-cash-stack', vista: 'cobranza' },
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
            width="75"
            className="d-inline-block align-top"
          />
          <span className="fw-bold" style={{ color: '#021C5E' }}>
            Comunidad iPhone
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-gercom" />

        <Navbar.Collapse id="navbar-gercom">
          <Nav className="me-auto">
            {opciones.map((opcion, index) => (
              <Nav.Link
                key={index}
                onClick={() => onCambiarVista(opcion.vista)}
                className="d-flex align-items-center mx-1"
                style={{
                  color: vistaActiva === opcion.vista ? '#3483FA' : '#666',
                  fontWeight: vistaActiva === opcion.vista ? '600' : '400',
                  borderBottom: vistaActiva === opcion.vista
                    ? '2px solid #3483FA'
                    : '2px solid transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <i className={`${opcion.icon} me-2`}></i>
                {opcion.label}
              </Nav.Link>
            ))}
          </Nav>

          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="dropdown-usuario"
                className="d-flex align-items-center"
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px' }}
              >
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#3483FA',
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}
                  >
                    {usuario?.nombre?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="d-none d-md-inline" style={{ color: '#333' }}>
                    {usuario?.nombre} {usuario?.apellido}
                  </span>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-sm border-0">
                <Dropdown.Header style={{ color: '#666', fontSize: '0.8rem' }}>
                  {usuario?.email}
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleLogout}
                  className="d-flex align-items-center"
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