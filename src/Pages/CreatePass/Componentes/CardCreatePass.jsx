// Pages/HomeLogin/Componentes/CardCreatePass.jsx
import React, { useState } from 'react';
import { Button, Form, Card, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { setupPassword } from '../Helpers/CreatePassword';
import { COLORS } from '../../Cobranza/Helperss/colors';

export const CardCreatePass = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [user, setUser] = useState({ newPassword: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });
    const navigate = useNavigate();

    const togglePassword = () => setShowPassword(!showPassword);
    const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

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
        const { newPassword, confirmPassword } = user;
        const newPassTrimmed = newPassword.trim();
        const confirmTrimmed = confirmPassword.trim();

        if (newPassTrimmed === '' || confirmTrimmed === '') return showAlert('Completá ambos campos', 'warning');
        if (newPassTrimmed !== confirmTrimmed) return showAlert('Las contraseñas no coinciden', 'warning');
        if (newPassTrimmed.length < 6) return showAlert('Mínimo 6 caracteres', 'warning');

        setIsLoading(true);
        try {
            await setupPassword(newPassTrimmed, navigate);
            showAlert('¡Contraseña configurada exitosamente! Redirigiendo...', 'success');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            showAlert(error.message || 'Error al configurar la contraseña', 'danger');
        } finally { setIsLoading(false); }
    };

    return (
        <Card className="border-0 shadow-sm" style={{ borderRadius: '20px', backgroundColor: COLORS.cardBg }}>
            <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                    <h4 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal }}>
                        Validando tus credenciales
                    </h4>
                    <p style={{ color: COLORS.textoSecundario }} className="small mb-0">
                        Casi terminamos de crear tu acceso...
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
                    {/* Nueva Pass */}
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>
                            Ingresá tu nueva contraseña
                        </Form.Label>
                        <InputGroup className="rounded-3 border" style={{ borderColor: COLORS.bordes }}>
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                name="newPassword"
                                value={user.newPassword}
                                onChange={onInputChange}
                                className="border-0 py-2 shadow-none"
                                style={{ fontSize: '0.95rem' }}
                                disabled={isLoading}
                            />
                            <InputGroup.Text onClick={togglePassword} className="border-0 bg-transparent pe-3" style={{ cursor: 'pointer' }}>
                                <i className={`bi bi-${showPassword ? 'eye-slash' : 'eye'}`} style={{ color: COLORS.textoSecundario }}></i>
                            </InputGroup.Text>
                        </InputGroup>
                        <Form.Text style={{ color: COLORS.textoSecundario }} className="small">
                            Mínimo 6 caracteres.
                        </Form.Text>
                    </Form.Group>

                    {/* Confirmar Pass */}
                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>
                            Confirmá tu contraseña
                        </Form.Label>
                        <InputGroup className="rounded-3 border" style={{ borderColor: COLORS.bordes }}>
                            <Form.Control
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={user.confirmPassword}
                                onChange={onInputChange}
                                className="border-0 py-2 shadow-none"
                                style={{ fontSize: '0.95rem' }}
                                disabled={isLoading}
                            />
                            <InputGroup.Text onClick={toggleConfirmPassword} className="border-0 bg-transparent pe-3" style={{ cursor: 'pointer' }}>
                                <i className={`bi bi-${showConfirmPassword ? 'eye-slash' : 'eye'}`} style={{ color: COLORS.textoSecundario }}></i>
                            </InputGroup.Text>
                        </InputGroup>
                        {user.confirmPassword && user.newPassword && (
                            <div className="mt-2">
                                {user.newPassword === user.confirmPassword ? (
                                    <span className="small fw-semibold" style={{ color: COLORS.verde }}>
                                        <i className="bi bi-check-circle-fill me-1"></i> Las contraseñas coinciden
                                    </span>
                                ) : (
                                    <span className="small fw-semibold" style={{ color: COLORS.rojo }}>
                                        <i className="bi bi-x-circle-fill me-1"></i> Las contraseñas no coinciden
                                    </span>
                                )}
                            </div>
                        )}
                    </Form.Group>

                    {/* Botón */}
                    <Button type="submit" disabled={isLoading} className="w-100 py-2 fw-bold rounded-3"
                        style={{ backgroundColor: COLORS.azulOscuro, borderColor: COLORS.azulOscuro, color: '#fff', fontSize: '1rem' }}>
                        {isLoading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Configurando...</> : <>Confirmar contraseña <i className="bi bi-arrow-right ms-1"></i></>}
                    </Button>
                </Form>

                <div className="text-center mt-4">
                    <Button variant="link" className="p-0 text-decoration-none fw-bold" style={{ color: COLORS.azul, fontSize: '0.9rem' }}
                        onClick={() => showAlert('Contactá a administración para asistencia', 'warning')}>
                        Contactá a administración
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};
