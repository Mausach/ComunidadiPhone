import React, { useState } from 'react';
import { Button, Form, Card, InputGroup, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { starLogin } from '../Helpers/StartLogin';
import { firstLogin } from '../Helpers/FistrLogin';
//import { starLogin, firstLogin } from '../Helpers/StarLogin';

export const CardLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({
        show: false,
        message: '',
        variant: 'danger',
        icon: null
    });
    const navigate = useNavigate();

    const togglePassword = () => setShowPassword(!showPassword);

    const onInputChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
        if (alert.show) {
            setAlert({ ...alert, show: false });
        }
    };

    const showAlert = (message, variant = 'danger') => {
        setAlert({
            show: true,
            message,
            variant,
        });

        setTimeout(() => {
            setAlert({ show: false, message: '', variant: 'danger' });
        }, 5000);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        
        const { email, password } = user;
        const emailTrimmed = email.trim();
        const passwordTrimmed = password.trim();

        if (emailTrimmed === "" && passwordTrimmed === "") {
            showAlert('Completá tu correo electrónico para continuar', 'warning');
            return;
        }

        if (emailTrimmed === "" && passwordTrimmed !== "") {
            showAlert('Ingresá tu correo electrónico', 'warning');
            return;
        }

        if (emailTrimmed !== "" && passwordTrimmed === "") {
            setIsLoading(true);
            try {
                //console.log(emailTrimmed)
                await firstLogin(emailTrimmed, navigate);
                showAlert('¡Te damosla bienvenida a tu primer acceso!', 'success');
            } catch (error) {
                showAlert(
                    error.response?.data?.message || 'Error al verificar tu usuario. Intentá de nuevo.',
                    'danger'
                );
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (emailTrimmed !== "" && passwordTrimmed !== "") {
            setIsLoading(true);
            try {
                
                await starLogin(emailTrimmed, passwordTrimmed, navigate);
                showAlert('¡Bienvenido! Redirigiendo al panel...', 'success');
            } catch (error) {
                showAlert(
                    error.response?.data?.message || 'Usuario o contraseña incorrectos. Verificá tus datos.',
                    'danger'
                );
            } finally {
                setIsLoading(false);
            }
            return;
        }
    };

    return (
        <Container fluid >
            <Row className="w-100 justify-content-center">
                <Col >
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                        <Card.Body className="p-4 p-md-5">
                            {/* Título y subtítulo */}
                            <div className="text-center mb-4">
                                <h4 className="fw-bold mb-1" style={{ color: '#1a1a1a' }}>
                                    Ingresá a tu cuenta
                                </h4>
                                <p className="text-muted small mb-0">
                                    Ingreso solo para el equipo de comunidad iPhone
                                </p>
                            </div>

                            {/* Alertas estilo Mercado Pago */}
                            {alert.show && (
                                <Alert 
                                    variant={alert.variant}
                                    className="d-flex align-items-center rounded-3 border-0 shadow-sm mb-3"
                                    style={{
                                        padding: '12px 16px',
                                        fontSize: '0.9rem',
                                        animation: 'fadeIn 0.3s ease'
                                    }}
                                >
                                    <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'x-circle'} me-2`}></i>
                                    <span className="flex-grow-1">
                                        {alert.message}
                                    </span>
                                    <Button 
                                        variant="link" 
                                        className="p-0 ms-2 text-decoration-none"
                                        style={{ color: 'inherit', opacity: 0.7 }}
                                        onClick={() => setAlert({ show: false, message: '', variant: 'danger' })}
                                    >
                                        <i className="bi bi-x-circle"></i>
                                    </Button>
                                </Alert>
                            )}

                            <Form onSubmit={onSubmit}>
                                {/* Campo de email */}
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold text-secondary">
                                        Correo electrónico
                                    </Form.Label>
                                    <InputGroup className="border rounded-3 overflow-hidden">
                                        <InputGroup.Text 
                                            className="border-0 bg-transparent ps-3"
                                            style={{ color: '#6c757d' }}
                                        >
                                            <i className="bi bi-envelope"></i>
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="email"
                                            placeholder="ejemplo@correo.com"
                                            minLength={3}
                                            maxLength={50}
                                            name="email"
                                            value={user.email}
                                            onChange={onInputChange}
                                            className="border-0 py-2"
                                            style={{ 
                                                backgroundColor: 'transparent',
                                                boxShadow: 'none',
                                                fontSize: '0.95rem'
                                            }}
                                            disabled={isLoading}
                                        />
                                    </InputGroup>
                                </Form.Group>

                                {/* Campo de contraseña */}
                                <Form.Group className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Form.Label className="small fw-semibold text-secondary mb-0">
                                            Contraseña
                                        </Form.Label>
                                        <Button 
                                            variant="link" 
                                            className="p-0 text-decoration-none small"
                                            style={{ fontSize: '0.8rem', color: '#3483FA' }}
                                            onClick={() => {/* Lógica para recuperar contraseña mensaje que contacte con administracion */}}
                                        >
                                            ¿Olvidaste tu clave?
                                        </Button>
                                    </div>
                                    <InputGroup className="border rounded-3 overflow-hidden">
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            minLength={6}
                                            maxLength={25}
                                            name="password"
                                            value={user.password}
                                            onChange={onInputChange}
                                            className="border-0 py-2"
                                            style={{ 
                                                backgroundColor: 'transparent',
                                                boxShadow: 'none',
                                                fontSize: '0.95rem'
                                            }}
                                            disabled={isLoading}
                                        />
                                        <InputGroup.Text 
                                            onClick={togglePassword} 
                                            className="border-0 bg-transparent pe-3"
                                            style={{ 
                                                cursor: 'pointer',
                                                color: '#6c757d'
                                            }}
                                        >
                                            <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                                        </InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>

                                {/* Botón de ingreso */}
                                <Button 
                                    variant="primary" 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-100 py-2 fw-semibold rounded-3 mt-3"
                                    style={{ 
                                        backgroundColor: '#3483FA',
                                        borderColor: '#3483FA',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            Ingresar
                                            <i className="bi bi-arrow-right ms-2"></i>
                                        </>
                                    )}
                                </Button>

                                {/* Enlace para crear cuenta */}
                                <div className="text-center mt-4">
                                    <span className="text-muted small">¿No tenés cuenta? </span>
                                    <Button 
                                        variant="link" 
                                        className="p-0 text-decoration-none fw-semibold"
                                        style={{ color: '#3483FA', fontSize: '0.9rem' }}
                                        onClick={() => navigate('/register')}
                                    >
                                        Contacta a administracion
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Estilos para las animaciones y alertas */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .alert-warning {
                    background-color: #fef6e6;
                    color: #856404;
                    border-left: 4px solid #ffa900;
                }

                .alert-danger {
                    background-color: #fde8e8;
                    color: #721c24;
                    border-left: 4px solid #dc3545;
                }

                .alert-success {
                    background-color: #e6f4ea;
                    color: #155724;
                    border-left: 4px solid #28a745;
                }

                .alert-info {
                    background-color: #e6f3ff;
                    color: #004085;
                    border-left: 4px solid #17a2b8;
                }

                /* Estilos para los íconos de Bootstrap Icons */
                .bi {
                    font-size: 1.1rem;
                }
            `}</style>
        </Container>
    );
};
