// Ventas/Componentes/Pasos/Paso3Financiacion.jsx
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, InputGroup } from 'react-bootstrap';
import { COLORS } from '../../../Cobranza/Helperss/colors';

const METODOS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'dolares', label: 'Dólares' },
  { value: 'cripto', label: 'Criptomonedas' },
  { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' }
];

const FRECUENCIAS = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'diario', label: 'Diario' }
];

const formatMonto = (m) => `$${Number(m || 0).toLocaleString('es-AR')}`;

export const Paso3Financiacion = ({ formData, setFormData, isLoading }) => {
  const [nuevoDesc, setNuevoDesc] = useState({ monto: 0, descripcion: '' });

  const mostrarCuotas = ['sistema1', 'sistema2', 'plan_canje_cuotas'].includes(formData.tipoVenta);
  const mostrarPagos = ['contado', 'sistema1', 'plan_canje', 'plan_canje_cuotas'].includes(formData.tipoVenta);
  const mostrarCuotaEntrega = formData.tipoVenta === 'sistema2';
  const esCanjeCuotas = formData.tipoVenta === 'plan_canje_cuotas';

  // Auto-calcular fecha entrega para sistema2
  useEffect(() => {
    if (formData.tipoVenta === 'sistema2' && formData.cuotaEntrega > 0 && formData.cantidadCuotas > 0) {
      const fecha = calcularFechaEntrega(formData.cuotaEntrega, formData.frecuencia, formData.fechaRealizada);
      setFormData(prev => ({ ...prev, fechaEntrega: fecha }));
    }
    // eslint-disable-next-line
  }, [formData.cuotaEntrega, formData.frecuencia, formData.fechaRealizada, formData.tipoVenta]);

  const calcularFechaEntrega = (num, frec, inicio) => {
    if (!num || !inicio) return '';
    const f = new Date(inicio + 'T00:00:00-03:00');
    switch (frec) {
      case 'diario': f.setDate(f.getDate() + (num - 1)); break;
      case 'semanal': f.setDate(f.getDate() + (num - 1) * 7); break;
      case 'quincenal': f.setDate(f.getDate() + (num - 1) * 15); break;
      default: f.setMonth(f.getMonth() + (num - 1));
    }
    return f.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePagoChange = (i, field, value) => {
    const nuevos = [...formData.pagos];
    nuevos[i] = { ...nuevos[i], [field]: value };
    setFormData(prev => ({ ...prev, pagos: nuevos }));
  };

  const agregarPago = () => setFormData(prev => ({ ...prev, pagos: [...prev.pagos, { monto: 0, metodo: 'efectivo', notas: [] }] }));
  const eliminarPago = (i) => setFormData(prev => ({ ...prev, pagos: prev.pagos.filter((_, idx) => idx !== i) }));

  const agregarDescuento = () => {
    if (nuevoDesc.monto > 0 && nuevoDesc.descripcion.trim()) {
      setFormData(prev => ({
        ...prev,
        descuentos: [...prev.descuentos, {
          monto: parseFloat(nuevoDesc.monto),
          descripcion: nuevoDesc.descripcion.trim(),
          fecha: new Date().toISOString(),
          usuario: { nombre: prev.vendedor || 'Sistema' }
        }]
      }));
      setNuevoDesc({ monto: 0, descripcion: '' });
    }
  };

  const eliminarDescuento = (i) => setFormData(prev => ({ ...prev, descuentos: prev.descuentos.filter((_, idx) => idx !== i) }));

  const totalPagos = formData.pagos.reduce((s, p) => s + (parseFloat(p.monto) || 0), 0);
  const totalDesc = formData.descuentos.reduce((s, d) => s + (parseFloat(d.monto) || 0), 0);
  const totalCuotas = (parseFloat(formData.montoCuota) || 0) * (parseInt(formData.cantidadCuotas) || 0);
  const valorCanje = parseFloat(formData.equipoCanje.valorTasado) || 0;
  const valorProducto = parseFloat(formData.producto.valor) || 0;

  let montoTotal = 0;
  if (formData.tipoVenta === 'sistema2') montoTotal = totalCuotas - totalDesc;
  else if (formData.tipoVenta === 'plan_canje_cuotas') montoTotal = totalCuotas + valorCanje - totalDesc;
  else montoTotal = valorProducto - totalDesc;

  const saldo = montoTotal - totalPagos;

  return (
    <div>
      <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal, fontSize: '0.95rem' }}>
        <i className="bi bi-wallet2 me-2" style={{ color: COLORS.azul }}></i>Financiación
      </h6>

      {/* Cuotas */}
      {mostrarCuotas && (
        <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
          <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.rojo }}>
            <i className="bi bi-calendar-event me-1"></i>Cuotas
            {esCanjeCuotas && <span className="badge ms-2" style={{ backgroundColor: COLORS.ambar, color: '#fff' }}>Canje + Cuotas</span>}
          </h6>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Monto por Cuota <span className="text-danger">*</span></Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control type="number" name="montoCuota" value={formData.montoCuota} onChange={handleChange}
                    placeholder="0" disabled={isLoading} min={0} step={100} />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Cantidad <span className="text-danger">*</span></Form.Label>
                <Form.Control type="number" name="cantidadCuotas" value={formData.cantidadCuotas} onChange={handleChange}
                  placeholder="Ej: 12" className="rounded-3" disabled={isLoading} min={1} max={60} />
              </Form.Group>
            </Col>
            {mostrarCuotaEntrega && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Cuota Entrega <span className="text-danger">*</span></Form.Label>
                  <Form.Select name="cuotaEntrega" value={formData.cuotaEntrega || ''} onChange={handleChange}
                    className="rounded-3" disabled={isLoading || !formData.cantidadCuotas}>
                    <option value="">Seleccionar...</option>
                    {Array.from({ length: parseInt(formData.cantidadCuotas) || 0 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>Cuota {n}{n === 1 ? ' (Inicial)' : ''}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
            <Col md={mostrarCuotaEntrega ? 3 : 6}>
              <Form.Group>
                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Frecuencia</Form.Label>
                <Form.Select name="frecuencia" value={formData.frecuencia} onChange={handleChange} className="rounded-3" disabled={isLoading}>
                  {FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          {totalCuotas > 0 && (
            <div className="mt-2 small" style={{ color: COLORS.textoSecundario }}>
              <i className="bi bi-calculator me-1"></i>Total cuotas: <strong>{formatMonto(totalCuotas)}</strong>
              {esCanjeCuotas && valorCanje > 0 && <> + Canje: <strong>{formatMonto(valorCanje)}</strong></>}
            </div>
          )}
        </div>
      )}

      {/* Pagos */}
      {mostrarPagos && (
        <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
          <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.verde }}>
            <i className="bi bi-cash-coin me-1"></i>
            {['plan_canje', 'plan_canje_cuotas'].includes(formData.tipoVenta) ? 'Entrega en Efectivo (Opcional)' : 'Entrega / Pagos'}
          </h6>
          {formData.pagos.map((pago, i) => (
            <Row key={i} className="g-2 mb-2 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Monto</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control type="number" value={pago.monto}
                      onChange={(e) => handlePagoChange(i, 'monto', parseFloat(e.target.value) || 0)}
                      placeholder="0" disabled={isLoading} min={0} step={100} />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Método</Form.Label>
                  <Form.Select value={pago.metodo} onChange={(e) => handlePagoChange(i, 'metodo', e.target.value)} className="rounded-3" disabled={isLoading}>
                    {METODOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                {i === 0 ? (
                  <Button variant="outline-primary" onClick={agregarPago} className="rounded-3 w-100" disabled={isLoading}>
                    <i className="bi bi-plus-lg"></i>
                  </Button>
                ) : (
                  <Button variant="outline-danger" onClick={() => eliminarPago(i)} className="rounded-3 w-100" disabled={isLoading}>
                    <i className="bi bi-trash3"></i>
                  </Button>
                )}
              </Col>
            </Row>
          ))}
          <div className="mt-2 p-2 rounded-3 d-flex justify-content-between small" style={{ backgroundColor: COLORS.cardBg }}>
            <span>Pagado: <strong style={{ color: COLORS.verde }}>{formatMonto(totalPagos)}</strong></span>
            <span>Saldo: <strong style={{ color: saldo > 0 ? COLORS.rojo : COLORS.verde }}>{formatMonto(saldo)}</strong></span>
            <span>Total: <strong>{formatMonto(montoTotal)}</strong></span>
          </div>
        </div>
      )}

      {/* Descuentos */}
      <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
        <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.ambar }}>
          <i className="bi bi-tag me-1"></i>Descuentos
        </h6>
        <Row className="g-2 mb-2">
          <Col md={4}>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control type="number" value={nuevoDesc.monto}
                onChange={(e) => setNuevoDesc({ ...nuevoDesc, monto: parseFloat(e.target.value) || 0 })}
                placeholder="0" disabled={isLoading} min={0} />
            </InputGroup>
          </Col>
          <Col md={6}>
            <Form.Control type="text" value={nuevoDesc.descripcion}
              onChange={(e) => setNuevoDesc({ ...nuevoDesc, descripcion: e.target.value })}
              placeholder="Descripción" className="rounded-3" disabled={isLoading} />
          </Col>
          <Col md={2}>
            <Button variant="outline-warning" onClick={agregarDescuento} className="rounded-3 w-100"
              disabled={isLoading || !nuevoDesc.monto || !nuevoDesc.descripcion.trim()}>
              <i className="bi bi-plus-lg"></i>
            </Button>
          </Col>
        </Row>
        {formData.descuentos.length > 0 && (
          <>
            {formData.descuentos.map((d, i) => (
              <div key={i} className="d-flex align-items-center p-2 mb-2 rounded-3" style={{ backgroundColor: COLORS.cardBg }}>
                <i className="bi bi-tag me-2" style={{ color: COLORS.ambar }}></i>
                <div className="flex-grow-1">
                  <small>{d.descripcion}</small>
                  <small className="ms-2" style={{ color: COLORS.rojo }}>-{formatMonto(d.monto)}</small>
                </div>
                <Button variant="link" className="p-0" style={{ color: COLORS.rojo }} onClick={() => eliminarDescuento(i)}>
                  <i className="bi bi-trash3"></i>
                </Button>
              </div>
            ))}
            <div className="text-end small">Total descuentos: <strong style={{ color: COLORS.rojo }}>-{formatMonto(totalDesc)}</strong></div>
          </>
        )}
      </div>
    </div>
  );
};