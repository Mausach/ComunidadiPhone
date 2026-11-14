// Ventas/Componentes/Pasos/Paso4GaranteNotas.jsx
import React, { useState } from 'react';
import { Form, Row, Col, Button, Badge, InputGroup } from 'react-bootstrap';
import { COLORS } from '../../../Cobranza/Helperss/colors';

export const Paso4GaranteNotas = ({ formData, setFormData, isLoading, vendedor }) => {
  const [nuevaNota, setNuevaNota] = useState('');
  const mostrarGarante = ['sistema1', 'sistema2', 'plan_canje', 'plan_canje_cuotas'].includes(formData.tipoVenta);
  const garanteObligatorio = formData.tipoVenta === 'sistema1';

  const handleGaranteChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, garante: { ...prev.garante, [name]: value } }));
  };

  const handleAgregarNota = () => {
    if (nuevaNota.trim()) {
      setFormData(prev => ({
        ...prev,
        notas: [...prev.notas, {
          texto: nuevaNota.trim(),
          fecha: new Date().toISOString(),
          tipo: 'general',
          usuario: { nombre: vendedor || 'Vendedor' }
        }]
      }));
      setNuevaNota('');
    }
  };

  const eliminarNota = (i) => setFormData(prev => ({ ...prev, notas: prev.notas.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal, fontSize: '0.95rem' }}>
        <i className="bi bi-person-check me-2" style={{ color: COLORS.azul }}></i>
        {garanteObligatorio ? 'Garante (Obligatorio)' : 'Garante y Notas'}
      </h6>

      {mostrarGarante && (
        <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <small className="fw-bold" style={{ color: COLORS.azul }}><i className="bi bi-person-check me-1"></i>Datos del Garante</small>
            {!garanteObligatorio && (
              <Form.Check type="switch" id="requiereGarante" label="Requiere garante"
                checked={formData.requiereGarante}
                onChange={(e) => setFormData(prev => ({ ...prev, requiereGarante: e.target.checked }))}
                disabled={isLoading} />
            )}
            {garanteObligatorio && <Badge style={{ backgroundColor: COLORS.rojo, color: '#fff' }}>Obligatorio</Badge>}
          </div>

          {(formData.requiereGarante || garanteObligatorio) && (
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Nombre <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="nombre" value={formData.garante.nombre} onChange={handleGaranteChange}
                    placeholder="Nombre" className="rounded-3" disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Apellido <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="apellido" value={formData.garante.apellido} onChange={handleGaranteChange}
                    placeholder="Apellido" className="rounded-3" disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>DNI <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="dni" value={formData.garante.dni} onChange={handleGaranteChange}
                    placeholder="8 dígitos" className="rounded-3" disabled={isLoading} maxLength={8} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>CUIL</Form.Label>
                  <Form.Control type="text" name="cuil" value={formData.garante.cuil} onChange={handleGaranteChange}
                    placeholder="XX-XXXXXXXX-X" className="rounded-3" disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Teléfono <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="telefono" value={formData.garante.telefono} onChange={handleGaranteChange}
                    placeholder="Teléfono" className="rounded-3" disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Relación <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="relacion" value={formData.garante.relacion} onChange={handleGaranteChange}
                    placeholder="Ej: Familiar, Amigo..." className="rounded-3" disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Ocupación <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="ocupacion" value={formData.garante.ocupacion} onChange={handleGaranteChange}
                    placeholder="Ej: Empleado, Comerciante..." className="rounded-3" disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Teléfono 2</Form.Label>
                  <Form.Control type="text" name="telefono2" value={formData.garante.telefono2} onChange={handleGaranteChange}
                    placeholder="Alternativo (opcional)" className="rounded-3" disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.garante.email} onChange={handleGaranteChange}
                    placeholder="ejemplo@correo.com" className="rounded-3" disabled={isLoading} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Dirección <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" name="direccion" value={formData.garante.direccion} onChange={handleGaranteChange}
                    placeholder="Dirección del garante" className="rounded-3" disabled={isLoading} />
                </Form.Group>
              </Col>
            </Row>
          )}
        </div>
      )}

      {/* Notas */}
      <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
        <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.textoSecundario }}>
          <i className="bi bi-chat-left-text me-1"></i>Notas y Observaciones
        </h6>
        <InputGroup className="mb-2">
          <Form.Control as="textarea" rows={2} value={nuevaNota} onChange={(e) => setNuevaNota(e.target.value)}
            placeholder="Ej: El cliente quedó en traer el comprobante mañana..." className="rounded-3" disabled={isLoading} style={{ resize: 'none' }} />
          <Button variant="outline-primary" className="rounded-3 ms-2" onClick={handleAgregarNota}
            disabled={isLoading || !nuevaNota.trim()}>
            <i className="bi bi-plus-lg me-1"></i>Agregar
          </Button>
        </InputGroup>
        {formData.notas.length > 0 && formData.notas.map((nota, i) => (
          <div key={i} className="d-flex align-items-start p-2 mb-2 rounded-3" style={{ backgroundColor: COLORS.cardBg }}>
            <i className="bi bi-chat-left-text me-2 mt-1" style={{ color: COLORS.azul }}></i>
            <div className="flex-grow-1">
              <small>{nota.texto}</small>
              <div className="d-flex justify-content-between mt-1" style={{ color: COLORS.textoSecundario, fontSize: '0.7rem' }}>
                <span>{nota.usuario?.nombre}</span>
                <span>{new Date(nota.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            <Button variant="link" className="p-0 ms-2" style={{ color: COLORS.rojo }} onClick={() => eliminarNota(i)}>
              <i className="bi bi-trash3"></i>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};