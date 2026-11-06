
import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Row, Col, Button, Alert, Spinner, Badge, InputGroup, Collapse 
} from 'react-bootstrap';
import { agregarRecargoCuota } from '../Helpers/AgregarRecargoCuota';
import { editarRecargoCuota, eliminarRecargoCuota } from '../Helpers/GestionRecargoCuota';
//import { editarRecargoCuota, eliminarRecargoCuota } from '../Helpers/Recargos'; // 👈 NUEVO HELPER

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
      accion: 'sumar', // Por defecto sumamos
      monto: '',
      motivo: recargo.motivo // Precargamos el motivo actual
    });
  };

  const handleSubmitEdicion = async (recargoOriginal) => {
    const montoAjuste = parseFloat(editForm.monto);
    if (!montoAjuste || montoAjuste <= 0) { showAlert('Ingresá un monto válido para ajustar', 'warning'); return; }
    
    // 🧠 Lógica de cálculo automático en el front
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

  const formatMonto = (m) => !m && m !== 0 ? '$0' : `$${m.toLocaleString('es-AR')}`;
  const formatFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Cálculos para el NUEVO recargo
  const totalRecargosActual = cuota?.recargos?.reduce((s, r) => s + r.monto, 0) || 0;
  const nuevoRecargo = parseFloat(formData.montoRecargo) || 0;
  const totalRecargosNuevo = totalRecargosActual + nuevoRecargo;
  const montoBase = cuota?.montoCuota || 0;
  const porcentajeNuevoRecargo = montoBase > 0 ? ((nuevoRecargo / montoBase) * 100).toFixed(1) : 0;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="recargo-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          <i className="bi bi-percent me-2" style={{ color: '#dc3545' }}></i>
          Gestión de Interés / Recargos
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* Alertas */}
        {alert.show && (
          <Alert variant={alert.variant} className="d-flex align-items-center rounded-3 border-0 shadow-sm mb-3"
            style={{ padding: '10px 14px', fontSize: '0.9rem', animation: 'fadeIn 0.3s ease' }}>
            <i className={`bi ${alert.variant === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
            <span className="flex-grow-1">{alert.message}</span>
            <Button variant="link" className="p-0 ms-2 text-decoration-none" style={{ color: 'inherit', opacity: 0.7 }}
              onClick={() => setAlert({ show: false, message: '', variant: 'danger' })}><i className="bi bi-x-circle"></i></Button>
          </Alert>
        )}

        {/* ==========================================
            SECCIÓN 1: HISTORIAL Y EDICIÓN DE RECARGOS
            ========================================== */}
        {cuota?.recargos && cuota.recargos.length > 0 && (
          <div className="mb-4">
            <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.9rem' }}>
              <i className="bi bi-clock-history me-2"></i>Recargos Registrados
            </h6>
            {cuota.recargos.map((r) => {
              const isEditing = editandoId === r._id;
              const isDeleting = eliminandoId === r._id;

              return (
                <div key={r._id} className="border rounded-3 mb-2 overflow-hidden">
                  {/* Fila del recargo */}
                  <div className="d-flex justify-content-between align-items-center p-2 bg-light">
                    <div>
                      <Badge bg="danger" className="me-2">+{formatMonto(r.monto)}</Badge>
                      <span className="text-dark fw-semibold" style={{ fontSize: '0.85rem' }}>{r.motivo}</span>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{formatFecha(r.fecha)}</div>
                    </div>
                    <div className="d-flex gap-1">
                      <Button variant="outline-primary" size="sm" className="rounded-2" onClick={() => handleAbrirEdicion(r)} title="Ajustar monto o motivo">
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button variant="outline-danger" size="sm" className="rounded-2" onClick={() => { setEliminandoId(r._id); setEditandoId(null); setMotivoEliminacion(''); }} title="Eliminar recargo">
                        <i className="bi bi-trash3"></i>
                      </Button>
                    </div>
                  </div>

                  {/* Panel de EDICIÓN (desplegable) */}
                  <Collapse in={isEditing}>
                    <div className="p-3 bg-white border-top">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="fw-bold text-primary">Ajustar Recargo</small>
                        <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => setEditandoId(null)}><i className="bi bi-x-circle"></i></Button>
                      </div>
                      <div className="bg-warning bg-opacity-10 p-2 rounded mb-2 border border-warning">
                        <small className="text-dark" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-info-circle me-1"></i>
                          Usá <strong>Sumar</strong> para agregar interés, o <strong>Restar</strong> para hacer un descuento sobre el recargo.
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
                            <InputGroup.Text>$</InputGroup.Text>
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
                            placeholder="Motivo (ej: Descuento)" 
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
                        >
                          {loading ? <Spinner size="sm" /> : 'Aplicar Ajuste'}
                        </Button>
                      </div>
                    </div>
                  </Collapse>

                  {/* Panel de ELIMINACIÓN (desplegable) */}
                  <Collapse in={isDeleting}>
                    <div className="p-3 bg-white border-top border-danger">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="fw-bold text-danger">Eliminar Recargo</small>
                        <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => setEliminandoId(null)}><i className="bi bi-x-circle"></i></Button>
                      </div>
                      <div className="bg-danger bg-opacity-10 p-2 rounded mb-2 border border-danger">
                        <small className="text-dark" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Esta acción es irreversible. Por normativa, debés indicar por qué se elimina.
                        </small>
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
                          >
                            {loading ? <Spinner size="sm" /> : 'Eliminar Definitivamente'}
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </Collapse>
                </div>
              );
            })}
          </div>
        )}

        {/* ==========================================
            SECCIÓN 2: AGREGAR NUEVO RECARGO
            ========================================== */}
        <div className="border-top pt-3">
          <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.9rem' }}>
            <i className="bi bi-plus-circle me-2"></i>Agregar Nuevo Recargo
          </h6>

          <Form onSubmit={handleSubmitNuevo}>
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary">Monto del recargo ($) <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="number" name="montoRecargo" value={formData.montoRecargo} onChange={handleChange}
                    placeholder="0" className="rounded-3" disabled={loading} min={1} step="any" />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold small text-secondary"><i className="bi bi-sticky me-1"></i>Motivo <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="motivo" value={formData.motivo} onChange={handleChange}
                    placeholder="Ej: Recargo por 15 días de atraso..." className="rounded-3" disabled={loading} />
                </Form.Group>
              </Col>
            </Row>

            {/* Previsualización */}
            {nuevoRecargo > 0 && (
              <div className="bg-light rounded-3 p-2 mb-3 border">
                <Row className="text-center small align-items-center">
                  <Col xs={4}><div className="text-muted">Actual: <strong>{formatMonto(totalRecargosActual)}</strong></div></Col>
                  <Col xs={4}><div className="text-danger fw-bold">Nuevo: +{formatMonto(nuevoRecargo)}</div></Col>
                  <Col xs={4}><div className="text-primary">Total: <strong>{formatMonto(totalRecargosNuevo)}</strong> <Badge bg="info">{porcentajeNuevoRecargo}%</Badge></div></Col>
                </Row>
              </div>
            )}

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={onHide} className="rounded-3" disabled={loading}>
                Cerrar
              </Button>
              <Button variant="danger" type="submit" className="rounded-3 px-4"
                style={{ fontWeight: '500' }}
                disabled={loading || !formData.montoRecargo || !formData.motivo.trim()}>
                {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-plus-circle me-2"></i>Agregar Recargo</>}
              </Button>
            </div>
          </Form>
        </div>

      </Modal.Body>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .recargo-modal .modal-dialog { max-width: 700px; }
        .recargo-modal .modal-content { border-radius: 16px; overflow: hidden; }
        .recargo-modal .modal-body { padding: 1.5rem; }
        @media (max-width: 768px) { .recargo-modal .modal-dialog { max-width: 100%; margin: 1rem; } }
      `}</style>
    </Modal>
  );
};