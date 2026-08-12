// Pages/CreatePass/CreatePass.jsx

import React from 'react'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { CardCreatePass } from './Componentes/CardCreatePass';
import logo from '../../assets/logologin.jpeg';

export const CreatePass = () => {
  return (
    <>
      <Navbar 
        className="shadow-sm"
        style={{ backgroundColor: '#0F488B', minHeight: '64px' }}
      >
        <Container>
          <Navbar.Brand href="#home" className="d-flex align-items-center">
            <img
              alt="Logo"
              src={logo}
              width="200"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container>
        <Row 
          className="justify-content-center align-items-center" 
          style={{ minHeight: '80vh' }}
        >
          <Col md={5} className="d-flex align-items-center pe-md-4">
            <div>
              <h3 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
                Primer Acceso
              </h3>
              <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                Configurá tu <strong>contraseña</strong> para acceder al sistema de <strong>Comunidad iPhone</strong>
              </p>
            </div>
          </Col>
          <Col md={5}>
            <CardCreatePass />
          </Col>
        </Row>
      </Container>
    </>
  )
}
