import { CardLogin } from './Componentes/CardLogin';

// Pages/HomeLogin/HomeLogin.jsx

import React from 'react'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


export const HomeLogin = () => {
    return (
        <>
            <Navbar className="bg-body-tertiary shadow-sm">
                <Container>
                    <Navbar.Brand href="#home">
                        <img
                            alt=""
                            src="/img/logo.svg"
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                        />{' '}
                        <span className="fw-bold" style={{ color: '#333' }}>
                            Comunidad iPhone
                        </span>
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
