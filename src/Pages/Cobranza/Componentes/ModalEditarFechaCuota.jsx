// Cobranza/Componentes/ModalEditarFechaCuota.jsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Row, Col, Button, Alert, Spinner 
} from 'react-bootstrap';
import { editarFechaCuota } from '../Helpers/EditarFechaCuota';
import { COLORS } from '../Helperss/colors'; // Ajustá la ruta si es necesario

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

export const ModalEditarFechaCuota = ({ 
  show, onHide, venta, cuota, onSuccess, usuario 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nuevaFecha: '', motivo: '' });
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });

  useEffect(() => {
    if (show && cuota) {
      const fechaActual = cuota.fechaCobro ? new Date(cuota.fechaCobro) : new Date();
      // Ajustamos para que no haya problemas de zona horaria al mostrar en el input date
      const fechaFormateada = new Date(fechaActual.getTime() - fechaActual.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      setFormData({ nuevaFecha: fechaFormateada, motivo: '' });
    }
  }, [show, cuota]);

  const showAlert = (message, variant = 'danger') => {
    if (!message) { setAlert({ show: false, message: '', variant: 'danger' }); return; }
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (alert.show) setAlert({ show: false, message: '', variant: 'danger' });
  };

  const sumarDias = (dias) => {
    const fecha = new Date(formData.nuevaFecha || new Date());
    fecha.setDate(fecha.getDate() + dias);
    setFormData({ ...formData, nuevaFecha: fecha.toISOString().split('T')[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nuevaFecha) { showAlert('La nueva fecha es obligatoria', 'warning'); return; }

    setLoading(true);
    try {
      const result = await editarFechaCuota({
        idVenta: venta._id,
        numeroCuota: cuota.numeroCuota,
        nuevaFecha: formData.nuevaFecha,
        usuario: {
          nombre: usuario?.user?.nombre + ' ' + usuario?.user?.apellido || 'Sistema'
        },
        motivo: formData.motivo || 'Sin especificar'
      });

      showAlert(result.message || 'Fecha actualizada exitosamente', 'success');

      setTimeout(() => { onHide(); if (onSuccess) onSuccess(); }, 1500);
    } catch (error) {
      showAlert(error.message || 'Error al actualizar la fecha', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Cálculos para mostrar la diferencia de días
  const fechaVieja = cuota?.fechaCobro ? new Date(cuota.fechaCobro) : new Date();
  const fechaNueva = formData.nuevaFecha ? new Date(formData.nuevaFecha + 'T00:00:00') : new Date();
  const diferenciaDias = Math.ceil((fechaNueva - fechaVieja) / (1000 * 60 * 60 * 24));

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="editar-fecha-modal">
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
          <i className="bi bi-calendar-event me-2" style={{ color: COLORS.azul }}></i>Editar Fecha de Cuota
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pt-3">
        {alert.show && (
          <Alert variant={alert.variant} className="rounded-3 border-0 shadow-sm mb-3 d-flex align-items-center"
            style={{
              backgroundColor: alert.variant === 'success' ? COLORS.verdeSuave : alert.variant === 'warning' ? COLORS.ambarSuave : COLORS.rojoSuave,
              color: alert.variant === 'success' ? COLORS.verde : alert.variant === 'warning' ? COLORS.ambar : COLORS.rojo
            }}>
            <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
            <span className="flex-grow-1">{alert.message}</span>
            <Button variant="link" className="p-0 ms-2" style={{ color: 'inherit', opacity: 0.7 }} onClick={() => showAlert('')}><i className="bi bi-x-circle"></i></Button>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            
            {/* COLUMNA IZQUIERDA: Formulario */}
            <Col md={7}>
              
              {/* Info actual */}
              <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                <Row className="g-2 small">
                  <Col xs={6}>
                    <span style={{ color: COLORS.textoSecundario }}>Cuota</span>
                    <div className="fw-semibold">#{cuota?.numeroCuota}</div>
                  </Col>
                  <Col xs={6}>
                    <span style={{ color: COLORS.textoSecundario }}>Monto</span>
                    <div className="fw-semibold">{formatMonto(cuota?.montoCuota)}</div>
                  </Col>
                  <Col xs={12} className="mt-2">
                    <span style={{ color: COLORS.textoSecundario }}>Fecha actual</span>
                    <div className="fw-semibold">{formatFecha(cuota?.fechaCobro)}</div>
                  </Col>
                </Row>
              </div>

              {/* Selector rápido de días */}
              <div className="mb-3">
                <small className="fw-semibold d-block mb-2" style={{ color: COLORS.textoSecundario }}>
                  <i className="bi bi-lightning-charge me-1"></i>Ajustes rápidos:
                </small>
                <div className="d-flex gap-2 flex-wrap">
                  {[
                    { label: '+7 días', dias: 7 },
                    { label: '+15 días', dias: 15 },
                    { label: '+30 días', dias: 30 },
                    { label: 'Fin de mes', dias: null }
                  ].map((ajuste) => (
                    <button
                      key={ajuste.label}
                      type="button"
                      onClick={() => {
                        if (ajuste.dias) {
                          sumarDias(ajuste.dias);
                        } else {
                          // Ir al último día del mes actual de la nueva fecha
                          const d = new Date(formData.nuevaFecha || new Date());
                          d.setMonth(d.getMonth() + 1, 0); // Último día del mes
                          setFormData({ ...formData, nuevaFecha: d.toISOString().split('T')[0] });
                        }
                      }}
                      disabled={loading}
                      style={{
                        border: `1px solid ${COLORS.bordes}`, backgroundColor: COLORS.cardBg,
                        borderRadius: '8px', padding: '6px 14px', fontSize: '0.85rem', fontWeight: '600',
                        color: COLORS.textoPrincipal, cursor: 'pointer'
                      }}
                    >
                      {ajuste.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input de Nueva Fecha */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small" style={{ color: COLORS.textoSecundario }}>
                  Nueva fecha de cobro <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control type="date" name="nuevaFecha" value={formData.nuevaFecha} onChange={handleChange}
                  className="rounded-3 form-control-lg" disabled={loading} style={{ fontWeight: '600' }} />
                <Form.Text className="small" style={{ color: COLORS.textoSecundario }}>
                  <i className="bi bi-info-circle me-1"></i>
                  Podés elegir cualquier fecha (anterior o futura)
                </Form.Text>
              </Form.Group>

              {/* Motivo */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small" style={{ color: COLORS.textoSecundario }}>
                  <i className="bi bi-sticky me-1"></i>Motivo del cambio (opcional)
                </Form.Label>
                <Form.Control as="textarea" name="motivo" rows={2} value={formData.motivo} onChange={handleChange}
                  placeholder="Ej: Cliente solicitó extensión de plazo..." className="rounded-3" disabled={loading} style={{ resize: 'none' }} />
              </Form.Group>
            </Col>

            {/* COLUMNA DERECHA: Preview Sticky */}
            <Col md={5}>
              <div className="rounded-3 p-3 sticky-top" style={{ backgroundColor: COLORS.azulOscuro, top: '1rem', color: '#fff' }}>
                <small className="text-uppercase fw-bold d-block mb-2" style={{ color: COLORS.azulSuave, letterSpacing: '1px', fontSize: '0.65rem' }}>
                  Vista Previa
                </small>
                
                <div className="mb-3">
                  <small style={{ color: COLORS.azulSuave }}>Cliente</small>
                  <div className="fw-semibold">{venta?.cliente?.nombre} {venta?.cliente?.apellido}</div>
                </div>

                <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                <div className="mb-2">
                  <small style={{ color: COLORS.azulSuave }}>Fecha original</small>
                  <div className="fw-semibold" style={{ color: COLORS.azulSuave }}>{formatFecha(cuota?.fechaCobro)}</div>
                </div>
                
                <div className="mb-3">
                  <small style={{ color: COLORS.azulSuave }}>Nueva fecha</small>
                  <h4 className="fw-bold mb-0" style={{ color: '#fff' }}>{formatFecha(formData.nuevaFecha)}</h4>
                </div>

                {formData.nuevaFecha && (
                  <div className="text-center mb-3">
                    <Pill bg={diferenciaDias > 0 ? COLORS.ambarSuave : diferenciaDias < 0 ? COLORS.verdeSuave : COLORS.bgGeneral} 
                          color={diferenciaDias > 0 ? COLORS.ambar : diferenciaDias < 0 ? COLORS.verde : COLORS.textoSecundario}>
                      {diferenciaDias === 0 ? 'Misma fecha' : 
                       diferenciaDias > 0 ? `+${diferenciaDias} días de prórroga` : 
                       `${diferenciaDias} días (adelanto)`}
                    </Pill>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-100 rounded-3 py-2 mt-3" 
                  disabled={loading}
                  style={{ backgroundColor: COLORS.azul, borderColor: COLORS.azul, color: '#fff', fontWeight: '600' }}
                >
                  {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-check-circle me-2"></i>Guardar Cambios</>}
                </Button>
                <Button variant="link" className="w-100 rounded-3 mt-1 text-decoration-none" onClick={onHide} disabled={loading}
                  style={{ color: COLORS.azulSuave }}>
                  Cancelar
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// Helper interno para formatear montos (lo puse acá por si no lo tenías importado)
const formatMonto = (monto) => !monto && monto !== 0 ? '$0' : `$${Number(monto).toLocaleString('es-AR')}`;