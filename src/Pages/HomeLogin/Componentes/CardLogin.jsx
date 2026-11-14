// Pages/HomeLogin/Componentes/CardLogin.jsx
import React, { useState } from 'react';
import { Button, Form, Card, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { starLogin } from '../Helpers/StartLogin';
import { firstLogin } from '../Helpers/FistrLogin';
import { COLORS } from '../../Cobranza/Helperss/colors';

export const CardLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [user, setUser] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });
    const navigate = useNavigate();

    const togglePassword = () => setShowPassword(!showPassword);

    const onInputChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
        if (alert.show) setAlert({ ...alert, show: false });
    };

    const showAlert = (message, variant = 'danger') => {
        setAlert({ show: true, message, variant });
        setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = user;
        const emailTrimmed = email.trim();
        const passwordTrimmed = password.trim();

        if (emailTrimmed === '' && passwordTrimmed === '') return showAlert('Completá tu correo electrónico para continuar', 'warning');
        if (emailTrimmed === '' && passwordTrimmed !== '') return showAlert('Ingresá tu correo electrónico', 'warning');

        if (emailTrimmed !== '' && passwordTrimmed === '') {
            setIsLoading(true);
            try {
                await firstLogin(emailTrimmed, navigate);
                showAlert('¡Te damos la bienvenida a tu primer acceso!', 'success');
            } catch (error) {
                showAlert(error.response?.data?.message || 'Error al verificar tu usuario.', 'danger');
            } finally { setIsLoading(false); }
            return;
        }

        if (emailTrimmed !== '' && passwordTrimmed !== '') {
            setIsLoading(true);
            try {
                await starLogin(emailTrimmed, passwordTrimmed, navigate);
                showAlert('¡Bienvenido! Redirigiendo al panel...', 'success');
            } catch (error) {
                showAlert(error.response?.data?.message || 'Usuario o contraseña incorrectos.', 'danger');
            } finally { setIsLoading(false); }
            return;
        }
    };

    return (
        <Card className="border-0 shadow-sm" style={{ borderRadius: '20px', backgroundColor: COLORS.cardBg }}>
            <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                    <h4 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal }}>
                        Ingresá a tu cuenta
                    </h4>
                    <p style={{ color: COLORS.textoSecundario }} className="small mb-0">
                        Acceso exclusivo para el equipo de Comunidad iPhone
                    </p>
                </div>

                {alert.show && (
                    <div className="rounded-3 p-3 mb-4 d-flex align-items-center small"
                        style={{
                            backgroundColor: alert.variant === 'success' ? COLORS.verdeSuave : COLORS.rojoSuave,
                            color: alert.variant === 'success' ? COLORS.verde : COLORS.rojo
                        }}>
                        <i className={`bi bi-${alert.variant === 'success' ? 'check-circle-fill' : 'exclamation-circle-fill'} me-2 fs-5`}></i>
                        <span className="flex-grow-1 fw-semibold">{alert.message}</span>
                    </div>
                )}

                <Form onSubmit={onSubmit}>
                    {/* Email */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Correo electrónico</Form.Label>
                        <InputGroup className="rounded-3 border" style={{ borderColor: COLORS.bordes }}>
                            <InputGroup.Text className="border-0 bg-transparent ps-3">
                                <i className="bi bi-envelope" style={{ color: COLORS.textoSecundario }}></i>
                            </InputGroup.Text>
                            <Form.Control
                                type="email"
                                placeholder="ejemplo@correo.com"
                                name="email"
                                value={user.email}
                                onChange={onInputChange}
                                className="border-0 py-2 shadow-none"
                                style={{ fontSize: '0.95rem' }}
                                disabled={isLoading}
                            />
                        </InputGroup>
                    </Form.Group>

                    {/* Contraseña */}
                    <Form.Group className="mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <Form.Label className="small fw-semibold mb-0" style={{ color: COLORS.textoSecundario }}>Contraseña</Form.Label>
                            <Button variant="link" className="p-0 text-decoration-none small" style={{ fontSize: '0.8rem', color: COLORS.azul }}
                                onClick={() => showAlert('Contactá a administración para recuperar tu clave', 'warning')}>
                                ¿Olvidaste tu clave?
                            </Button>
                        </div>
                        <InputGroup className="rounded-3 border mt-1" style={{ borderColor: COLORS.bordes }}>
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                name="password"
                                value={user.password}
                                onChange={onInputChange}
                                className="border-0 py-2 shadow-none"
                                style={{ fontSize: '0.95rem' }}
                                disabled={isLoading}
                            />
                            <InputGroup.Text onClick={togglePassword} className="border-0 bg-transparent pe-3" style={{ cursor: 'pointer' }}>
                                <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`} style={{ color: COLORS.textoSecundario }}></i>
                            </InputGroup.Text>
                        </InputGroup>
                    </Form.Group>

                    {/* Botón */}
                    <Button type="submit" disabled={isLoading} className="w-100 py-2 fw-bold rounded-3"
                        style={{ backgroundColor: COLORS.azulOscuro, borderColor: COLORS.azulOscuro, color: '#fff', fontSize: '1rem' }}>
                        {isLoading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Procesando...</> : <>Ingresar <i className="bi bi-arrow-right ms-1"></i></>}
                    </Button>
                </Form>

                <div className="text-center mt-4">
                    <span style={{ color: COLORS.textoSecundario }} className="small">¿No tenés cuenta? </span>
                    <Button variant="link" className="p-0 text-decoration-none fw-bold" style={{ color: COLORS.azul, fontSize: '0.9rem' }}
                        onClick={() => showAlert('Contactá a administración para solicitar acceso', 'warning')}>
                        Contactá a administración
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};
