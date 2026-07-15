// src/Pages/Ger_Comercial/Componentes/DashboardGerCom.jsx

import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const DashboardGerCom = ({ usuario }) => {
  const navigate = useNavigate();

  const accesosRapidos = [
    {
      titulo: 'Nueva Venta',
      descripcion: 'Registrar una nueva venta en el sistema',
      icono: 'bi-cart-plus',
      color: '#3483FA',
      ruta: '/ger-com/ventas'
    },
    {
      titulo: 'Reportes',
      descripcion: 'Ver reportes y estadísticas comerciales',
      icono: 'bi-graph-up',
      color: '#00a650',
      ruta: '/ger-com/reportes'
    },
    {
      titulo: 'Stock Canje',
      descripcion: 'Gestionar stock para canjes',
      icono: 'bi-box-seam',
      color: '#ff7733',
      ruta: '/ger-com/stock-canje'
    },
    {
      titulo: 'Cobranza',
      descripcion: 'Panel de gestión de cobranzas',
      icono: 'bi-cash-stack',
      color: '#6c5ce7',
      ruta: '/ger-com/cobranza'
    }
  ];

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: '#1a1a1a' }}>
          ¡Bienvenido, {usuario?.nombre}!
        </h3>
        <p className="text-muted">
          Panel de Gerencia Comercial - {new Date().toLocaleDateString('es-AR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <Row>
        {accesosRapidos.map((acceso, index) => (
          <Col key={index} md={6} lg={3} className="mb-4">
            <Card 
              className="h-100 shadow-sm border-0"
              style={{ 
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onClick={() => navigate(acceso.ruta)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              <Card.Body className="d-flex flex-column p-4">
                <div 
                  className="d-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: `${acceso.color}15`,
                    color: acceso.color,
                    fontSize: '1.5rem'
                  }}
                >
                  <i className={acceso.icono}></i>
                </div>
                <Card.Title style={{ color: '#333', fontSize: '1.1rem', fontWeight: '600' }}>
                  {acceso.titulo}
                </Card.Title>
                <Card.Text style={{ color: '#999', fontSize: '0.85rem' }}>
                  {acceso.descripcion}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Sección de resumen rápido */}
      <Row className="mt-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '8px' }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3" style={{ color: '#333' }}>
                <i className="bi bi-activity me-2" style={{ color: '#3483FA' }}></i>
                Actividad Reciente
              </h5>
              <div className="text-center py-4">
                <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                <p className="text-muted mt-2">No hay actividad reciente para mostrar</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '8px' }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3" style={{ color: '#333' }}>
                <i className="bi bi-info-circle me-2" style={{ color: '#3483FA' }}></i>
                Información
              </h5>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                <p className="mb-2">
                  <strong>Rol:</strong> Gerente Comercial
                </p>
                <p className="mb-2">
                  <strong>Email:</strong> {usuario?.email}
                </p>
                <p className="mb-0">
                  <strong>Localidad:</strong> {usuario?.localidad}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};