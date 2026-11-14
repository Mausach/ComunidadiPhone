// Pages/HomeLogin/HomeLogin.jsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { CardLogin } from './Componentes/CardLogin';
import { COLORS } from '../Cobranza/Helperss/colors'; // Ajustá la ruta si es necesario
import logo from '../../assets/logocenter.png';

export const HomeLogin = () => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: COLORS.bgGeneral, display: 'flex', flexDirection: 'column' }}>
            {/* Header con Logo */}
            <div className="d-flex justify-content-center align-items-center pt-5 pb-4">
                <img alt="Logo" src={logo} style={{ height: '150px', objectFit: 'contain' }} />
            </div>

            {/* Contenido Principal */}
            <Container className="flex-grow-1 d-flex align-items-center">
                <Row className="justify-content-center w-100 mb-5">
                    {/* Columna Izquierda: Texto */}
                    <Col md={5} className="d-none d-md-flex align-items-center pe-md-5">
                        <div>
                            <h2 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal, fontSize: '2.2rem' }}>
                                Bienvenido al <br/> Panel de Gestión.
                            </h2>
                            <p style={{ color: COLORS.textoSecundario, fontSize: '1rem', lineHeight: '1.6' }}>
                                Ingresá tu <strong>correo electrónico</strong> y <strong>contraseña</strong> para acceder a la administración de ventas, cobranzas y stock.
                            </p>
                            <div className="mt-4 d-flex gap-3">
                                <div style={{ width: '40px', height: '4px', backgroundColor: COLORS.azul, borderRadius: '4px' }}></div>
                                <div style={{ width: '40px', height: '4px', backgroundColor: COLORS.bordes, borderRadius: '4px' }}></div>
                                <div style={{ width: '40px', height: '4px', backgroundColor: COLORS.bordes, borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </Col>

                    {/* Columna Derecha: Card */}
                    <Col md={5} xs={12}>
                        <CardLogin />
                    </Col>
                </Row>
            </Container>

            {/* Footer */}
            <div className="text-center py-3">
                <small style={{ color: COLORS.textoSecundario }}>
                    © {new Date().getFullYear()} Comunidad iPhone · Panel de Gestión
                </small>
            </div>
        </div>
    );
};
