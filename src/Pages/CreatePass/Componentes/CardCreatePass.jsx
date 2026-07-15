import React, { useState } from 'react';
import { Button, Form, Card, InputGroup, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { setupPassword } from '../Helpers/CreatePassword';


export const CardCreatePass = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [user, setUser] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({
        show: false,
        message: '',
        variant: 'danger',
    });
    const navigate = useNavigate();

    const togglePassword = () => setShowPassword(!showPassword);
    const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

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
        
        const { newPassword, confirmPassword } = user;
        const newPasswordTrimmed = newPassword.trim();
        const confirmPasswordTrimmed = confirmPassword.trim();

        // Validar que ambos campos estén completos
        if (newPasswordTrimmed === "" || confirmPasswordTrimmed === "") {
            showAlert('Completá ambos campos de contraseña', 'warning');
            return;
        }

        // Validar que las contraseñas coincidan
        if (newPasswordTrimmed !== confirmPasswordTrimmed) {
            showAlert('Las contraseñas no coinciden. Verificá que sean iguales.', 'warning');
            return;
        }

        // Validar longitud mínima
        if (newPasswordTrimmed.length < 6) {
            showAlert('La contraseña debe tener al menos 6 caracteres', 'warning');
            return;
        }

        // Si todo está bien, proceder
        setIsLoading(true);
        try {
            // Mostrar en consola ambos datos como pediste
            console.log('Nueva contraseña:', newPasswordTrimmed);
            console.log('Confirmación de contraseña:', confirmPasswordTrimmed);
            console.log('Ambas contraseñas coinciden ✅');

            // Llamar al helper para configurar la contraseña
             await setupPassword(newPasswordTrimmed, navigate);
            
            showAlert('¡Contraseña configurada exitosamente! Redirigiendo...', 'success');
            
            // Opcional: redirigir después de un breve delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            showAlert(
                error.message || 'Ocurrió un error al configurar tu contraseña',
                'danger'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container fluid >
            <Row className="w-100 justify-content-center">
                <Col>
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                        <Card.Body className="p-4 p-md-5">
                            {/* Título y subtítulo */}
                            <div className="text-center mb-4">
                                <h4 className="fw-bold mb-1" style={{ color: '#1a1a1a' }}>
                                    Validando tus credenciales
                                </h4>
                                <p className="text-muted small mb-0">
                                    Casi terminamos de crear tu acceso...
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
                                {/* Campo de nueva contraseña */}
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold text-secondary">
                                        Por favor Ingresa la que de ahora en mas será tu contraseña
                                    </Form.Label>
                                    <InputGroup className="border rounded-3 overflow-hidden">
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            
                                            minLength={6}
                                            maxLength={25}
                                            name="newPassword"
                                            value={user.newPassword}
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
                                    <Form.Text className="text-muted">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Usá al menos 6 caracteres, incluyendo letras y números
                                    </Form.Text>
                                </Form.Group>

                                {/* Campo de confirmación de contraseña */}
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold text-secondary">
                                        Confirmá tu contraseña
                                    </Form.Label>
                                    <InputGroup className="border rounded-3 overflow-hidden">
                                        <Form.Control
                                            type={showConfirmPassword ? "text" : "password"}
                                            
                                            minLength={6}
                                            maxLength={25}
                                            name="confirmPassword"
                                            value={user.confirmPassword}
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
                                            onClick={toggleConfirmPassword} 
                                            className="border-0 bg-transparent pe-3"
                                            style={{ 
                                                cursor: 'pointer',
                                                color: '#6c757d'
                                            }}
                                        >
                                            <i className={`bi bi-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
                                        </InputGroup.Text>
                                    </InputGroup>
                                    {/* Indicador visual de coincidencia */}
                                    {user.confirmPassword && user.newPassword && (
                                        <div className="mt-1">
                                            {user.newPassword === user.confirmPassword ? (
                                                <span className="text-success small">
                                                    <i className="bi bi-check-circle-fill me-1"></i>
                                                    Las contraseñas coinciden
                                                </span>
                                            ) : (
                                                <span className="text-danger small">
                                                    <i className="bi bi-x-circle-fill me-1"></i>
                                                    Las contraseñas no coinciden
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Form.Group>

                                {/* Botón de confirmación */}
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
                                            Configurando...
                                        </>
                                    ) : (
                                        <>
                                            Confirmar contraseña
                                            <i className="bi bi-arrow-right ms-2"></i>
                                        </>
                                    )}
                                </Button>

                                {/* Enlace de ayuda */}
                                <div className="text-center mt-4">
                                    <span className="text-muted small">¿Tenés algún problema? </span>
                                    <Button 
                                        variant="link" 
                                        className="p-0 text-decoration-none fw-semibold"
                                        style={{ color: '#3483FA', fontSize: '0.9rem' }}
                                        onClick={() => {
                                            showAlert('Contactá a administración para asistencia', 'info');
                                        }}
                                    >
                                        Contactá a administración
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

                .bi {
                    font-size: 1.1rem;
                }
            `}</style>
        </Container>
    );
};
