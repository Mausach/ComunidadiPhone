import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Row, Col, Button, Alert, Spinner, InputGroup, Collapse 
} from 'react-bootstrap';
import { agregarRecargoCuota } from '../Helpers/AgregarRecargoCuota';
import { editarRecargoCuota, eliminarRecargoCuota } from '../Helpers/GestionRecargoCuota';
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

export const ModalAgregarRecargo = ({ 
  show, onHide, venta, cuota, onSuccess, usuario 
}) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });

  // Estado para el formulario de NUEVO recargo
  const [formData, setFormData] = useState({ montoRecargo: '', motivo: '' });

  // Estados para el panel de EDICIÓN
  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState({ accion: 'sumar', monto: '', motivo: '' });

  // Estados para el panel de ELIMINACIÓN
  const [eliminandoId, setEliminandoId] = useState(null);
  const [motivoEliminacion, setMotivoEliminacion] = useState('');

  useEffect(() => {
    if (show && cuota) {
      setFormData({ montoRecargo: '', motivo: '' });
      setEditandoId(null);
      setEliminandoId(null);
    }
  }, [show, cuota]);

  const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  // ==========================================
  // CREAR NUEVO RECARGO
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (alert.show) setAlert({ show: false, message: '', variant: 'danger' });
  };

  const handleSubmitNuevo = async (e) => {
    e.preventDefault();
    const monto = parseFloat(formData.montoRecargo);
    if (!monto || monto <= 0) { showAlert('El monto del recargo debe ser mayor a 0', 'warning'); return; }
    if (!formData.motivo.trim()) { showAlert('El motivo del recargo es obligatorio', 'warning'); return; }

    setLoading(true);
    try {
      const result = await agregarRecargoCuota({
        idVenta: venta._id,
        numeroCuota: cuota.numeroCuota,
        montoRecargo: monto,
        motivo: formData.motivo,
        porcentajeAplicado: porcentajeNuevoRecargo,
        usuario: { nombre: usuario?.user?.nombre + ' ' + usuario?.user?.apellido || 'Sistema' }
      });

      showAlert(result.message || 'Recargo agregado exitosamente', 'success');
      setTimeout(() => { onHide(); if (onSuccess) onSuccess(); }, 1500);
    } catch (error) {
      showAlert(error.message || 'Error al agregar el recargo', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // EDITAR / AJUSTAR RECARGO EXISTENTE
  // ==========================================
  const handleAbrirEdicion = (recargo) => {
    setEditandoId(recargo._id);
    setEliminandoId(null);
    setEditForm({
      accion: 'sumar',
      monto: '',
      motivo: recargo.motivo
    });
  };

  const handleSubmitEdicion = async (recargoOriginal) => {
    const montoAjuste = parseFloat(editForm.monto);
    if (!montoAjuste || montoAjuste <= 0) { showAlert('Ingresá un monto válido para ajustar', 'warning'); return; }
    
    let montoFinal = recargoOriginal.monto;
    if (editForm.accion === 'sumar') {
      montoFinal += montoAjuste;
    } else {
      montoFinal -= montoAjuste;
      if (montoFinal <= 0) {
        showAlert('El ajuste no puede dejar el recargo en 0 o negativo. Si querés quitarlo, usá la opción Eliminar.', 'warning');
        return;
      }
    }

    if (!editForm.motivo.trim()) { showAlert('El motivo es obligatorio', 'warning'); return; }

    setLoading(true);
    try {
      await editarRecargoCuota(venta._id, cuota.numeroCuota, recargoOriginal._id, {
        monto: montoFinal,
        motivo: editForm.motivo,
        usuario: { nombre: usuario?.user?.nombre + ' ' + usuario?.user?.apellido || 'Sistema' }
      });

      showAlert(`Recargo ${editForm.accion === 'sumar' ? 'aumentado' : 'reducido'} correctamente`, 'success');
      setTimeout(() => { onHide(); if (onSuccess) onSuccess(); }, 1500);
    } catch (error) {
      showAlert(error.message || 'Error al editar el recargo', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ELIMINAR RECARGO EXISTENTE
  // ==========================================
  const handleSubmitEliminacion = async (recargoOriginal) => {
    if (!motivoEliminacion.trim()) {
      showAlert('El motivo de la eliminación es obligatorio por normativa', 'warning');
      return;
    }

    setLoading(true);
    try {
      await eliminarRecargoCuota(
        venta._id, 
        cuota.numeroCuota, 
        recargoOriginal._id, 
        motivoEliminacion,
        usuario?.user?.nombre + ' ' + usuario?.user?.apellido || 'Sistema'
      );

      showAlert('Recargo eliminado correctamente', 'success');
      setTimeout(() => { onHide(); if (onSuccess) onSuccess(); }, 1500);
    } catch (error) {
      showAlert(error.message || 'Error al eliminar el recargo', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const formatMonto = (m) => !m && m !== 0 ? '$0' : `$${Number(m).toLocaleString('es-AR')}`;
  const formatFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Cálculos
  const totalRecargosActual = cuota?.recargos?.reduce((s, r) => s + r.monto, 0) || 0;
  const nuevoRecargo = parseFloat(formData.montoRecargo) || 0;
  const totalRecargosNuevo = totalRecargosActual + nuevoRecargo;
  const montoBase = cuota?.montoCuota || 0;
  const porcentajeNuevoRecargo = montoBase > 0 ? ((nuevoRecargo / montoBase) * 100).toFixed(1) : 0;
  
  const totalCuotaConRecargos = montoBase + totalRecargosActual;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="recargo-modal">
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
          <i className="bi bi-percent me-2" style={{ color: COLORS.rojo }}></i>
          Gestión de Interés / Recargos
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

        <Row className="g-4">
          
          {/* COLUMNA IZQUIERDA: Formularios y Lista */}
          <Col lg={8}>
            
            {/* SECCIÓN 1: HISTORIAL Y EDICIÓN */}
            {cuota?.recargos && cuota.recargos.length > 0 && (
              <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                  <i className="bi bi-clock-history me-2"></i>Recargos Registrados
                </h6>
                
                <div className="d-flex flex-column gap-2">
                  {cuota.recargos.map((r) => {
                    const isEditing = editandoId === r._id;
                    const isDeleting = eliminandoId === r._id;

                    return (
                      <div key={r._id} className="rounded-3 overflow-hidden" style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.bordes}` }}>
                        
                        {/* Fila del recargo */}
                        <div className="d-flex justify-content-between align-items-center p-3">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <Pill bg={COLORS.rojoSuave} color={COLORS.rojo}>+{formatMonto(r.monto)}</Pill>
                              <span className="fw-semibold" style={{ color: COLORS.textoPrincipal, fontSize: '0.9rem' }}>{r.motivo}</span>
                            </div>
                            <small style={{ color: COLORS.textoSecundario, fontSize: '0.75rem' }}>{formatFecha(r.fecha)}</small>
                          </div>
                          <div className="d-flex gap-1">
                            <Button variant="outline-primary" size="sm" className="rounded-2" onClick={() => handleAbrirEdicion(r)} title="Ajustar monto o motivo" style={{ borderColor: COLORS.azul, color: COLORS.azul }}>
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button variant="outline-danger" size="sm" className="rounded-2" onClick={() => { setEliminandoId(r._id); setEditandoId(null); setMotivoEliminacion(''); }} title="Eliminar recargo" style={{ borderColor: COLORS.rojo, color: COLORS.rojo }}>
                              <i className="bi bi-trash3"></i>
                            </Button>
                          </div>
                        </div>

                        {/* Panel de EDICIÓN */}
                        <Collapse in={isEditing}>
                          <div className="p-3" style={{ backgroundColor: COLORS.bgGeneral, borderTop: `1px solid ${COLORS.bordes}` }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="fw-bold" style={{ color: COLORS.azul }}>Ajustar Recargo</small>
                              <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => setEditandoId(null)}><i className="bi bi-x-circle"></i></Button>
                            </div>
                            <div className="rounded-2 p-2 mb-2" style={{ backgroundColor: COLORS.ambarSuave, border: `1px solid ${COLORS.ambar}` }}>
                              <small style={{ color: COLORS.ambar, fontSize: '0.75rem' }}>
                                <i className="bi bi-info-circle me-1"></i>
                                Usá <strong>Sumar</strong> para agregar interés, o <strong>Restar</strong> para hacer un descuento.
                              </small>
                            </div>
                            <Row className="g-2">
                              <Col md={4}>
                                <Form.Select 
                                  value={editForm.accion} 
                                  onChange={(e) => setEditForm({ ...editForm, accion: e.target.value })}
                                  size="sm" className="rounded-2"
                                >
                                  <option value="sumar">➕ Sumar</option>
                                  <option value="restar">➖ Restar</option>
                                </Form.Select>
                              </Col>
                              <Col md={4}>
                                <InputGroup size="sm">
                                  <InputGroup.Text style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.bordes }}>$</InputGroup.Text>
                                  <Form.Control 
                                    type="number" 
                                    placeholder="Monto" 
                                    value={editForm.monto}
                                    onChange={(e) => setEditForm({ ...editForm, monto: e.target.value })}
                                    min={1} 
                                  />
                                </InputGroup>
                              </Col>
                              <Col md={4}>
                                <Form.Control 
                                  size="sm" 
                                  placeholder="Motivo" 
                                  value={editForm.motivo}
                                  onChange={(e) => setEditForm({ ...editForm, motivo: e.target.value })}
                                />
                              </Col>
                            </Row>
                            <div className="text-end mt-2">
                              <Button 
                                variant="primary" 
                                size="sm" 
                                className="rounded-2 px-3" 
                                onClick={() => handleSubmitEdicion(r)}
                                disabled={loading || !editForm.monto || !editForm.motivo.trim()}
                                style={{ backgroundColor: COLORS.azul, borderColor: COLORS.azul }}
                              >
                                {loading ? <Spinner size="sm" /> : 'Aplicar Ajuste'}
                              </Button>
                            </div>
                          </div>
                        </Collapse>

                        {/* Panel de ELIMINACIÓN */}
                        <Collapse in={isDeleting}>
                          <div className="p-3" style={{ backgroundColor: COLORS.rojoSuave, borderTop: `1px solid ${COLORS.rojo}` }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="fw-bold" style={{ color: COLORS.rojo }}>Eliminar Recargo</small>
                              <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => setEliminandoId(null)}><i className="bi bi-x-circle"></i></Button>
                            </div>
                            <Row className="g-2">
                              <Col md={8}>
                                <Form.Control 
                                  size="sm" 
                                  placeholder="Motivo de la eliminación (obligatorio)" 
                                  value={motivoEliminacion}
                                  onChange={(e) => setMotivoEliminacion(e.target.value)}
                                />
                              </Col>
                              <Col md={4} className="text-end">
                                <Button 
                                  variant="danger" 
                                  size="sm" 
                                  className="rounded-2 w-100" 
                                  onClick={() => handleSubmitEliminacion(r)}
                                  disabled={loading || !motivoEliminacion.trim()}
                                  style={{ backgroundColor: COLORS.rojo, borderColor: COLORS.rojo }}
                                >
                                  {loading ? <Spinner size="sm" /> : 'Eliminar'}
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        </Collapse>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECCIÓN 2: AGREGAR NUEVO RECARGO */}
            <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
              <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                <i className="bi bi-plus-circle me-2"></i>Agregar Nuevo Recargo
              </h6>

              <Form onSubmit={handleSubmitNuevo}>
                <Row className="g-3 mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small" style={{ color: COLORS.textoSecundario }}>Monto ($) <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="number" name="montoRecargo" value={formData.montoRecargo} onChange={handleChange}
                        placeholder="0" className="rounded-3" disabled={loading} min={1} step="any" />
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small" style={{ color: COLORS.textoSecundario }}><i className="bi bi-sticky me-1"></i>Motivo <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="text" name="motivo" value={formData.motivo} onChange={handleChange}
                        placeholder="Ej: Recargo por 15 días de atraso..." className="rounded-3" disabled={loading} />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2 justify-content-end mt-4 pt-3" style={{ borderTop: `1px solid ${COLORS.bordes}` }}>
                  <Button variant="outline-secondary" onClick={onHide} className="rounded-3" disabled={loading} style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
                    Cerrar
                  </Button>
                  <Button type="submit" className="rounded-3 px-4"
                    style={{ backgroundColor: COLORS.rojo, borderColor: COLORS.rojo, color: '#fff', fontWeight: '600' }}
                    disabled={loading || !formData.montoRecargo || !formData.motivo.trim()}>
                    {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-plus-circle me-2"></i>Agregar Recargo</>}
                  </Button>
                </div>
              </Form>
            </div>
          </Col>

          {/* COLUMNA DERECHA: Resumen Sticky */}
          <Col lg={4}>
            <div className="rounded-3 p-3 sticky-top" style={{ backgroundColor: COLORS.azulOscuro, top: '1rem', color: '#fff' }}>
              <small className="text-uppercase fw-bold d-block mb-2" style={{ color: COLORS.azulSuave, letterSpacing: '1px', fontSize: '0.65rem' }}>
                Resumen de la Cuota
              </small>
              
              <div className="mb-3">
                <small style={{ color: COLORS.azulSuave }}>Cliente</small>
                <div className="fw-semibold">{venta?.cliente?.nombre} {venta?.cliente?.apellido}</div>
                <small style={{ color: COLORS.azulSuave }}>Cuota #{cuota?.numeroCuota}</small>
              </div>

              <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

              <div className="d-flex flex-column gap-2 mb-3">
                <div className="d-flex justify-content-between">
                  <small style={{ color: COLORS.azulSuave }}>Monto base</small>
                  <small className="fw-semibold">{formatMonto(montoBase)}</small>
                </div>
                <div className="d-flex justify-content-between">
                  <small style={{ color: COLORS.azulSuave }}>Recargos actuales</small>
                  <small className="fw-semibold">{formatMonto(totalRecargosActual)}</small>
                </div>
                {nuevoRecargo > 0 && (
                  <div className="d-flex justify-content-between animate__animated animate__fadeIn">
                    <small style={{ color: COLORS.ambar }}>Nuevo recargo</small>
                    <small className="fw-semibold" style={{ color: COLORS.ambar }}>+{formatMonto(nuevoRecargo)}</small>
                  </div>
                )}
              </div>

              <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

              <div className="d-flex justify-content-between align-items-end">
                <small style={{ color: COLORS.azulSuave }}>Total a pagar</small>
                <h3 className="fw-bold mb-0" style={{ color: '#fff' }}>{formatMonto(totalCuotaConRecargos + nuevoRecargo)}</h3>
              </div>

              {porcentajeNuevoRecargo > 0 && (
                <div className="mt-2 text-end">
                  <Pill bg={COLORS.rojoSuave} color={COLORS.rojo}>
                    +{porcentajeNuevoRecargo}% sobre base
                  </Pill>
                </div>
              )}

            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};