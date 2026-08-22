// src/Pages/Ceo/Componentes/ModalEditarEquipoCanje.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { editarEquipoCanje } from '../Helpers/ConjesObtenerEditar';


const localidades = ['santiago capital', 'la banda', 'añatuya', 'monte quemado'];

export const ModalEditarEquipoCanje = ({ show, onHide, equipo, onSuccess, usuario }) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });
  const [formData, setFormData] = useState({
    nombre: '', modelo: '', imei: '', color: '', bateria: '',
    estado: 'bueno', localidad: '', valorTasado: 0,
    nota: ''
  });

  useEffect(() => {
    if (show && equipo) {
      setFormData({
        nombre: equipo.nombre || '',
        modelo: equipo.modelo || '',
        imei: equipo.imei || '',
        color: equipo.color || '',
        bateria: equipo.bateria || '',
        estado: equipo.estado || 'bueno',
        localidad: equipo.localidad || '',
        valorTasado: equipo.valorTasado || 0,
        nota: ''
      });
    }
  }, [show, equipo]);

  const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (alert.show) setAlert({ show: false, message: '', variant: 'danger' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) { showAlert('El nombre del equipo es obligatorio', 'warning'); return; }
    if (!formData.valorTasado || formData.valorTasado <= 0) { showAlert('El valor tasado debe ser mayor a 0', 'warning'); return; }

    setLoading(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        modelo: formData.modelo.trim(),
        imei: formData.imei.trim(),
        color: formData.color.trim(),
        bateria: formData.bateria.trim(),
        estado: formData.estado,
        localidad: formData.localidad ? formData.localidad.toLowerCase() : '',
        valorTasado: parseFloat(formData.valorTasado)
      };

      if (formData.nota.trim()) {
        payload.agregarNota = {
          texto: formData.nota.trim(),
          usuario: { nombre: usuario?.nombre || 'Sistema' }
        };
      }

      await editarEquipoCanje(equipo.idEquipo, payload);
      showAlert('Equipo canje actualizado correctamente', 'success');
      setTimeout(() => { onHide(); if (onSuccess) onSuccess(); }, 1500);
    } catch (err) {
      showAlert(err.message || 'Error al actualizar el equipo', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const formatoMoneda = (v) => !v && v !== 0 ? '$0' : `$${v.toLocaleString('es-AR')}`;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
          <i className="bi bi-pencil me-2" style={{ color: '#3483FA' }}></i>
          Editar Equipo Canje
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="pt-3">
          {alert.show && (
            <Alert variant={alert.variant} className="d-flex align-items-center rounded-3 border-0 shadow-sm mb-3"
              style={{ padding: '10px 14px', fontSize: '0.9rem' }}>
              <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
              <span className="flex-grow-1">{alert.message}</span>
              <Button variant="link" className="p-0 ms-2" style={{ color: 'inherit' }}
                onClick={() => setAlert({ show: false, message: '', variant: 'danger' })}><i className="bi bi-x-circle"></i></Button>
            </Alert>
          )}

          <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
            <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-phone me-2"></i>Datos del Equipo
            </h6>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="small fw-semibold text-secondary">Nombre <span className="text-danger">*</span></Form.Label>
                <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} className="rounded-3" disabled={loading} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-secondary">Modelo</Form.Label>
                <Form.Control name="modelo" value={formData.modelo} onChange={handleChange} className="rounded-3" disabled={loading} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-semibold text-secondary">IMEI</Form.Label>
                <Form.Control name="imei" value={formData.imei} onChange={handleChange} className="rounded-3" maxLength={15} disabled={loading} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-semibold text-secondary">Color</Form.Label>
                <Form.Control name="color" value={formData.color} onChange={handleChange} className="rounded-3" disabled={loading} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-semibold text-secondary">Batería</Form.Label>
                <Form.Control name="bateria" value={formData.bateria} onChange={handleChange} className="rounded-3" disabled={loading} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-secondary">Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="rounded-3"
                  disabled={loading}
                >
                  <option value="sellado">🔒 Sellado</option>
                  <option value="semi nuevo">✨ Semi Nuevo</option>
                  <option value="reacondicionado">🔧 Reacondicionado</option>
                  <option value="bueno">👍 Bueno</option>
                  <option value="regular">⚠️ Regular</option>
                  <option value="malo">👎 Malo</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-secondary">
                  <i className="bi bi-geo-alt me-1"></i>Localidad
                </Form.Label>
                <Form.Select name="localidad" value={formData.localidad} onChange={handleChange} className="rounded-3" disabled={loading}>
                  <option value="">Seleccionar localidad</option>
                  {localidades.map(loc => (
                    <option key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-semibold text-secondary">Valor Tasado ($) <span className="text-danger">*</span></Form.Label>
                <Form.Control type="number" name="valorTasado" value={formData.valorTasado} onChange={handleChange} className="rounded-3" min={0} disabled={loading} />
              </Col>
            </Row>
          </div>

          <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
            <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-sticky me-2"></i>Nota <Badge bg="secondary" className="ms-1" style={{ fontSize: '0.65rem' }}>Opcional</Badge>
            </h6>
            <Form.Control as="textarea" name="nota" value={formData.nota} onChange={handleChange}
              rows={2} className="rounded-3" placeholder="Agregar una nota al historial..." disabled={loading} />
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={onHide} className="rounded-3" disabled={loading}>Cancelar</Button>
          <Button variant="primary" type="submit" className="rounded-3 px-4"
            style={{ backgroundColor: '#3483FA', borderColor: '#3483FA', fontWeight: '500' }} disabled={loading}>
            {loading ? <><Spinner size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-check-circle me-2"></i>Guardar Cambios</>}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};