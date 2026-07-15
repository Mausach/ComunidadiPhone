// Ventas/Componentes/NavBarVentas.jsx
import React from 'react';
import { Navbar, Container, Nav, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const NavBarVentas = ({ usuario }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Navbar bg="white" className="shadow-sm" expand="lg">
      <Container fluid>
        <Navbar.Brand className="fw-bold" style={{ color: '#3483FA' }}>
          <i className="bi bi-cart me-2"></i>
          Sistema Ventas
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link onClick={() => navigate('/ventas')}>
              <i className="bi bi-plus-circle me-1"></i>
              Nueva Venta
            </Nav.Link>
           
            {usuario && (
              <Nav.Link className="text-muted">
                <i className="bi bi-person-circle me-1"></i>
                {usuario.nombre} {usuario.apellido}
              </Nav.Link>
            )}
            <Nav.Link onClick={handleLogout} className="text-danger">
              <i className="bi bi-box-arrow-right me-1"></i>
              Salir
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};