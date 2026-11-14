// Cobranza/Componentes/ModalAgregarNotaCuota.jsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Row, Col, Button, Alert, Spinner 
} from 'react-bootstrap';
import { agregarNotaCuota } from '../Helpers/AgregarNotaCuota';
import { COLORS } from '../Helperss/colors'; // Ajustá la ruta

// Componente Pill
const Pill = ({ children, bg, color, border, icon, style = {} }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '0.35em 0.7em',
    fontSize: '0.75rem', fontWeight: '600', borderRadius: '20px',
    backgroundColor: bg, color: color,
    border: border ? `1px solid ${border}` : 'none',
    whiteSpace: 'nowrap', ...style
  }}>
    {icon && <i className={`bi bi-${icon} me-1`}></i>}
    {children}
  </span>
);

export const ModalAgregarNotaCuota = ({ 
  show, onHide, venta, cuota, onSuccess, usuario 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ texto: '' });
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });

  useEffect(() => {
    if (show && cuota) {
      setFormData({ texto: '' });
    }
  }, [show, cuota]);

  const showAlert = (message, variant = 'danger') => {
    if (!message) {
      setAlert({ show: false, message: '', variant: 'danger' });
      return;
    }
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (alert.show) setAlert({ show: false, message: '', variant: 'danger' });
  };

  // 👈 Ahora en lugar de reemplazar, AGREGA al texto existente
  const insertarSugerencia = (texto) => {
    const nuevoTexto = formData.texto 
      ? `${formData.texto.trim()} ${texto}` 
      : texto;
    setFormData({ texto: nuevoTexto });
    if (alert.show) setAlert({ show: false, message: '', variant: 'danger' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.texto || formData.texto.trim() === '') {
      showAlert('El texto de la nota es obligatorio', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await agregarNotaCuota({
        idVenta: venta._id,
        numeroCuota: cuota.numeroCuota,
        texto: formData.texto.trim(),
        usuario: {
          nombre: usuario?.nombre + ' ' + usuario?.apellido || 'Sistema'
        }
      });

      showAlert(result.message || 'Nota agregada exitosamente', 'success');
      setTimeout(() => { onHide(); if (onSuccess) onSuccess(); }, 1500);
    } catch (error) {
      showAlert(error.message || 'Error al agregar la nota', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const formatMonto = (m) => !m && m !== 0 ? '$0' : `$${Number(m).toLocaleString('es-AR')}`;
  const formatFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  const getEstadoConfig = (estado) => {
    const config = {
      'pagada': { bg: COLORS.verdeSuave, color: COLORS.verde, label: 'Pagada' },
      'pendiente': { bg: COLORS.ambarSuave, color: COLORS.ambar, label: 'Pendiente' },
      'pago parcial': { bg: COLORS.azulSuave, color: COLORS.azul, label: 'Pago Parcial' },
      'no pagada': { bg: COLORS.rojoSuave, color: COLORS.rojo, label: 'No pagada' }
    };
    return config[estado] || { bg: COLORS.bgGeneral, color: COLORS.textoSecundario, label: estado };
  };

  const estadoConfig = getEstadoConfig(cuota?.estado_cuota);

  const sugerencias = [
    'Cliente se comunicó para coordinar pago',
    'Se realizó recordatorio de pago',
    'Cliente solicita extensión de plazo',
    'Se acordó nuevo plan de pago',
    'Cliente no pudo ser contactado',
    'Pago recibido en efectivo',
    'Pago recibido por transferencia',
    'Se emitió comprobante de pago'
  ];

  const nombreUsuario = usuario?.user?.nombre 
    ? `${usuario.user.nombre} ${usuario.user.apellido || ''}`.trim()
    : 'Sistema';

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="agregar-nota-modal">
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
          <i className="bi bi-sticky me-2" style={{ color: COLORS.azul }}></i>
          Agregar Nota a Cuota
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pt-3">
        {alert.show && (
          <Alert variant={alert.variant} className="rounded-3 border-0 shadow-sm mb-3 d-flex align-items-center"
            style={{
              backgroundColor: alert.variant === 'success' ? COLORS.verdeSuave : alert.variant === 'warning' ? COLORS.ambarSuave : COLORS.rojoSuave,
              color: alert.variant === 'success' ? COLORS.verde : alert.variant === 'warning' ? COLORS.ambar : COLORS.rojo
            }}>
            <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : alert.variant === 'warning' ? 'exclamation-triangle' : 'x-circle'} me-2`}></i>
            <span className="flex-grow-1">{alert.message}</span>
            <Button variant="link" className="p-0 ms-2" style={{ color: 'inherit', opacity: 0.7 }} onClick={() => showAlert('')}><i className="bi bi-x-circle"></i></Button>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            
            {/* COLUMNA IZQUIERDA: Formulario */}
            <Col lg={8}>
              
              {/* Sugerencias Rápidas */}
              <div className="mb-3">
                <Form.Label className="fw-semibold small" style={{ color: COLORS.textoSecundario }}>
                  <i className="bi bi-lightning-charge me-1"></i>Sugerencias rápidas (click para agregar):
                </Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {sugerencias.map((sugerencia, index) => (
                    <span
                      key={index}
                      onClick={() => !loading && insertarSugerencia(sugerencia)}
                      style={{
                        cursor: loading ? 'not-allowed' : 'pointer',
                        backgroundColor: COLORS.cardBg,
                        color: COLORS.textoSecundario,
                        border: `1px solid ${COLORS.bordes}`,
                        fontSize: '0.75rem',
                        padding: '0.4em 0.8em',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.azul}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.bordes}
                    >
                      <i className="bi bi-plus-circle me-1"></i>{sugerencia}
                    </span>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small" style={{ color: COLORS.textoSecundario }}>
                  Nota <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  name="texto"
                  rows={6}
                  value={formData.texto}
                  onChange={handleChange}
                  placeholder="Escribí la nota aquí..."
                  className="rounded-3"
                  disabled={loading}
                  style={{ resize: 'none' }}
                />
                <div className="d-flex justify-content-between mt-1">
                  <Form.Text className="small" style={{ color: COLORS.textoSecundario }}>
                    <i className="bi bi-info-circle me-1"></i>
                    La nota quedará registrada en el historial de la cuota.
                  </Form.Text>
                  <small style={{ color: COLORS.textoSecundario }}>{formData.texto.length} caracteres</small>
                </div>
              </Form.Group>
            </Col>

            {/* COLUMNA DERECHA: Resumen y Vista Previa Sticky */}
            <Col lg={4}>
              <div className="sticky-top" style={{ top: '1rem' }}>
                
                {/* Resumen de la Cuota */}
                <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                    <i className="bi bi-receipt me-1"></i>Cuota #{cuota?.numeroCuota}
                  </h6>
                  <Row className="g-2 small">
                    <Col xs={6}>
                      <span style={{ color: COLORS.textoSecundario }}>Monto</span>
                      <div className="fw-semibold">{formatMonto(cuota?.montoCuota)}</div>
                    </Col>
                    <Col xs={6}>
                      <span style={{ color: COLORS.textoSecundario }}>Vence</span>
                      <div className="fw-semibold">{formatFecha(cuota?.fechaCobro)}</div>
                    </Col>
                    <Col xs={12} className="mt-2">
                      <span style={{ color: COLORS.textoSecundario }}>Estado</span>
                      <div>
                        <Pill bg={estadoConfig.bg} color={estadoConfig.color}>{estadoConfig.label}</Pill>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Vista Previa */}
                <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.azulOscuro, color: '#fff' }}>
                  <small className="text-uppercase fw-bold d-block mb-2" style={{ color: COLORS.azulSuave, letterSpacing: '1px', fontSize: '0.65rem' }}>
                    Vista Previa
                  </small>
                  
                  {formData.texto.trim() ? (
                    <div className="p-2 rounded-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <div className="d-flex align-items-center justify-content-center rounded-circle" 
                          style={{ width: 24, height: 24, backgroundColor: COLORS.azulSuave, color: COLORS.azul, fontSize: '0.7rem', fontWeight: 'bold' }}>
                          {nombreUsuario.charAt(0)}
                        </div>
                        <small className="fw-semibold">{nombreUsuario}</small>
                      </div>
                      <p className="mb-0 small" style={{ color: '#fff', wordBreak: 'break-word', lineHeight: 1.4 }}>
                        {formData.texto}
                      </p>
                      <small style={{ color: COLORS.azulSuave, fontSize: '0.65rem' }}>
                        {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  ) : (
                    <small style={{ color: COLORS.azulSuave }}>
                      <i className="bi bi-eye-slash me-1"></i>Escribí algo para ver la previsualización.
                    </small>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          {/* Botones */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${COLORS.bordes}` }}>
            <Button variant="outline-secondary" onClick={onHide} className="rounded-3" disabled={loading} style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-3 px-4"
              style={{ backgroundColor: COLORS.azul, borderColor: COLORS.azul, color: '#fff', fontWeight: '600' }}
              disabled={loading || !formData.texto.trim()}>
              {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-check-circle me-2"></i>Guardar Nota</>}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};