import { CardLogin } from './Componentes/CardLogin';
// Pages/HomeLogin/HomeLogin.jsx

import React from 'react'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import logo from '../../assets/logologin.jpeg'; // Ajustá la ruta según tu estructura

export const HomeLogin = () => {
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
                                Bienvenido
                            </h3>
                            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                                Ingresá tu <strong>e‑mail</strong> y <strong>contraseña</strong> para iniciar sesión
                            </p>
                        </div>
                    </Col>
                    <Col md={5}>
                        <CardLogin />
                    </Col>
                </Row>
            </Container>
        </>
    )
}
