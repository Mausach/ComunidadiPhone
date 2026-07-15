// Cobranza/Componentes/NavBarCobranza.jsx

import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { obtenerCobranzasDelDia } from '../Helpers/Cobranza_Dia';


export const NavBarCobranza = ({ usuario }) => {
  const navigate = useNavigate();
  
  // Estado para la notificación
  const [pendientesHoy, setPendientesHoy] = useState(0);
  const [cargando, setCargando] = useState(true);

  // Cargar al montar y cada 5 minutos
  useEffect(() => {
    cargarPendientes();
    const intervalo = setInterval(cargarPendientes, 5 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarPendientes = async () => {
    try {
      const data = await obtenerCobranzasDelDia();
      setPendientesHoy(data.totalesDia?.cuotasPendientesHoy || 0);
    } catch (error) {
      console.error('Error al cargar cobranzas del día:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <Navbar bg="white" className="shadow-sm" expand="lg">
      <Container fluid>
        <Navbar.Brand 
          className="fw-bold d-flex align-items-center"
          style={{ color: '#00a650', cursor: 'pointer' }}
          onClick={() => navigate('/cobranza')}
        >
          <i className="bi bi-cash-coin me-2"></i>
          Gestión de Cobranza
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-cobranza" />
        
        <Navbar.Collapse id="navbar-cobranza">
          <Nav className="ms-auto d-flex align-items-center">
            {/* Botón Campana con contador */}
            <Nav.Link 
              className="position-relative me-3"
              onClick={() => cargarPendientes()}
              style={{ cursor: 'pointer' }}
              title={`${pendientesHoy} cuotas pendientes para hoy`}
            >
              {cargando ? (
                <Spinner size="sm" style={{ color: '#999' }} />
              ) : (
                <>
                  <i 
                    className="bi bi-bell" 
                    style={{ 
                      color: pendientesHoy > 0 ? '#dc3545' : '#999',
                      fontSize: '1.2rem'
                    }}
                  ></i>
                  {pendientesHoy > 0 && (
                    <Badge
                      className="position-absolute"
                      style={{
                        top: '0px',
                        right: '-2px',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {pendientesHoy}
                    </Badge>
                  )}
                </>
              )}
            </Nav.Link>

            {/* Usuario */}
            {usuario && (
              <Nav.Link className="text-muted" disabled>
                <i className="bi bi-person-circle me-1"></i>
                {usuario.nombre} {usuario.apellido}
              </Nav.Link>
            )}

            {/* Cerrar sesión */}
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