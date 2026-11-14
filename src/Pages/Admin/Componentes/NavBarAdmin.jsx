// src/Pages/Ger_Comercial/Componentes/NavBarGerCom.jsx
import React from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../Cobranza/Helperss/colors'; // Ajustá la ruta
import logo from '../../../assets/logo.png';

export const NavBarAdmin = ({ usuario, vistaActiva, onCambiarVista }) => {
  const navigate = useNavigate();

  const opciones = [
    { label: 'Ventas', icon: 'cart-plus', vista: 'ventas' },
    { label: 'Cobranza', icon: 'cash-stack', vista: 'cobranza' },
    { label: 'Stock', icon: 'box-seam', vista: 'stock' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <Navbar 
      expand="lg" 
      className="shadow-sm" 
      sticky="top" 
      style={{ 
        backgroundColor: COLORS.cardBg, 
        borderBottom: `1px solid ${COLORS.bordes}`,
        padding: '10px 0'
      }}
    >
      <Container fluid className="px-4">
        
        {/* Logo */}
        <Navbar.Brand
          className="d-flex align-items-center gap-2"
          onClick={() => onCambiarVista('dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <img alt="Logo" src={logo} width="40" className="d-inline-block align-top" />
          <span className="fw-bold d-none d-sm-inline" style={{ color: COLORS.azulOscuro, fontSize: '1.1rem' }}>
            Comunidad iPhone
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-gercom" style={{ border: 'none' }} />

        <Navbar.Collapse id="navbar-gercom">
          
          {/* Links Principales */}
          <Nav className="me-auto ms-lg-4 gap-1">
            {opciones.map((opcion, index) => {
              const isActive = vistaActiva === opcion.vista;
              return (
                <Nav.Link
                  key={index}
                  onClick={() => onCambiarVista(opcion.vista)}
                  className="d-flex align-items-center rounded-3 px-3 py-2"
                  style={{
                    color: isActive ? COLORS.azul : COLORS.textoSecundario,
                    backgroundColor: isActive ? COLORS.azulSuave : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = COLORS.bgGeneral;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <i className={`bi bi-${opcion.icon} me-2`}></i>
                  {opcion.label}
                </Nav.Link>
              );
            })}
          </Nav>

          {/* Usuario */}
          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="dropdown-usuario"
                className="d-flex align-items-center border-0 bg-transparent p-1"
                style={{ boxShadow: 'none' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '36px', height: '36px',
                      backgroundColor: COLORS.azul,
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: '700'
                    }}
                  >
                    {usuario?.nombre?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="d-none d-md-flex flex-column text-start">
                    <span className="fw-semibold" style={{ color: COLORS.textoPrincipal, fontSize: '0.85rem', lineHeight: 1.2 }}>
                      {usuario?.nombre} {usuario?.apellido}
                    </span>
                    <small style={{ color: COLORS.textoSecundario, fontSize: '0.7rem' }}>
                      Ger. Comercial
                    </small>
                  </div>
                  <i className="bi bi-chevron-down d-none d-md-block" style={{ color: COLORS.textoSecundario, fontSize: '0.7rem' }}></i>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-sm border-0 mt-2" style={{ borderRadius: '12px', minWidth: '200px' }}>
                <Dropdown.Header style={{ color: COLORS.textoSecundario, fontSize: '0.75rem' }}>
                  {usuario?.email}
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleLogout}
                  className="d-flex align-items-center py-2"
                  style={{ color: COLORS.rojo, fontWeight: '500', fontSize: '0.85rem' }}
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