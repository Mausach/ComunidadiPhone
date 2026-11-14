// Ventas/Componentes/Pasos/Paso2Producto.jsx
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, InputGroup, Badge, ListGroup, Spinner } from 'react-bootstrap';
import { COLORS } from '../../../Cobranza/Helperss/colors';
import { listarEquiposDisponibles } from '../../../Ceo/Helpers/ReportesMensuales';

const ESTADOS = [
    { value: 'sellado', label: 'Sellado' },
    { value: 'semi nuevo', label: 'Semi Nuevo' },
    { value: 'reacondicionado', label: 'Reacondicionado' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'regular', label: 'Regular' },
    { value: 'malo', label: 'Malo' }
];

export const Paso2Producto = ({ formData, setFormData, isLoading }) => {
    const [equipos, setEquipos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [equipoSel, setEquipoSel] = useState(null);
    const [mostrar, setMostrar] = useState(false);

    const mostrarEquipos = formData.localidad && formData.tipoVenta !== 'sistema2';
    const mostrarCanje = ['plan_canje', 'plan_canje_cuotas'].includes(formData.tipoVenta);

    useEffect(() => {
        if (!mostrarEquipos) return;
        setCargando(true);
        listarEquiposDisponibles({ localidad: formData.localidad, limite: 50 })
            .then(res => setEquipos(res?.data?.equipos || []))
            .catch(() => setEquipos([]))
            .finally(() => setCargando(false));
    }, [formData.localidad, formData.tipoVenta]);

    const handleProductoChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, producto: { ...prev.producto, [name]: value } }));
        if (equipoSel) setEquipoSel(null);
    };

    const handleCanjeChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, equipoCanje: { ...prev.equipoCanje, [name]: value } }));
    };

    const seleccionarEquipo = (eq) => {
        setEquipoSel(eq);
        setMostrar(false);
        setFormData(prev => ({
            ...prev,
            // 👇 Guardamos el equipo seleccionado con su _id y origen
            equipoSeleccionado: { _id: eq._id, origen: eq.origen },
            producto: {
                nombre: eq.nombre || '', modelo: eq.modelo || '',
                bateria: eq.bateria || '', color: eq.color || '',
                imei: eq.imei || '', estado: eq.estado || 'sellado',
                valor: eq.origen === 'stock' ? (eq.precioVenta || 0) : (eq.valorTasado || 0)
            }
        }));
    };

    const quitarEquipo = () => {
        setEquipoSel(null);
        setFormData(prev => ({
            ...prev,
            equipoSeleccionado: null, // 👈 Limpiamos el equipo seleccionado
            producto: { nombre: '', modelo: '', bateria: '', color: '', imei: '', estado: 'sellado', valor: 0 }
        }));
    };

    return (
        <div>
            <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal, fontSize: '0.95rem' }}>
                <i className="bi bi-phone me-2" style={{ color: COLORS.azul }}></i>Producto
            </h6>

            {/* Equipos disponibles */}
            {mostrarEquipos && (
                <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.azulSuave, border: `1px solid ${COLORS.azul}` }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="fw-bold" style={{ color: COLORS.azul }}>
                            <i className="bi bi-box-seam me-1"></i>Equipos disponibles en {formData.localidad}
                        </small>
                        <Button size="sm" variant="link" className="p-0 text-decoration-none" style={{ color: COLORS.azul }} onClick={() => setMostrar(!mostrar)}>
                            {mostrar ? 'Ocultar' : `Ver (${equipos.length})`}
                        </Button>
                    </div>
                    {cargando ? (
                        <div className="text-center py-2"><Spinner size="sm" /> <small>Cargando...</small></div>
                    ) : equipoSel ? (
                        <div className="bg-white rounded-3 p-2 d-flex justify-content-between align-items-center">
                            <div>
                                <div className="fw-semibold small">{equipoSel.nombre} {equipoSel.modelo}</div>
                                <small style={{ color: COLORS.textoSecundario }}>IMEI: {equipoSel.imei || '-'}</small>
                                <Badge className="ms-2" style={{ backgroundColor: COLORS.azul, color: '#fff', fontSize: '0.65rem' }}>
                                    {equipoSel.origen}
                                </Badge>
                            </div>
                            <Button size="sm" variant="outline-secondary" className="rounded-3" onClick={quitarEquipo}>
                                <i className="bi bi-x-lg"></i>
                            </Button>
                        </div>
                    ) : mostrar && (
                        equipos.length === 0 ? (
                            <small style={{ color: COLORS.textoSecundario }}>No hay equipos disponibles</small>
                        ) : (
                            <ListGroup style={{ maxHeight: 200, overflowY: 'auto' }}>
                                {equipos.map(eq => (
                                    <ListGroup.Item key={eq._id} action onClick={() => seleccionarEquipo(eq)} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="fw-semibold small">{eq.nombre} {eq.modelo}</span>
                                            <small style={{ color: COLORS.textoSecundario }} className="ms-2">{eq.imei || 'Sin IMEI'}</small>
                                        </div>
                                        <Badge style={{ backgroundColor: eq.origen === 'stock' ? COLORS.azul : COLORS.ambar, color: '#fff' }}>
                                            ${(eq.origen === 'stock' ? eq.precioVenta : eq.valorTasado)?.toLocaleString() || 0}
                                        </Badge>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )
                    )}
                </div>
            )}

            {/* Datos producto */}
            <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                <Row className="g-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Nombre <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" name="nombre" value={formData.producto.nombre} onChange={handleProductoChange}
                                placeholder="Ej: iPhone" className="rounded-3" disabled={isLoading || !!equipoSel} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Modelo</Form.Label>
                            <Form.Control type="text" name="modelo" value={formData.producto.modelo} onChange={handleProductoChange}
                                placeholder="Ej: 13 pro max" className="rounded-3" disabled={isLoading || !!equipoSel} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Color</Form.Label>
                            <Form.Control type="text" name="color" value={formData.producto.color} onChange={handleProductoChange}
                                placeholder="Ej: Negro" className="rounded-3" disabled={isLoading || !!equipoSel} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Batería</Form.Label>
                            <Form.Control type="text" name="bateria" value={formData.producto.bateria} onChange={handleProductoChange}
                                placeholder="Ej: 80%" className="rounded-3" disabled={isLoading || !!equipoSel} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Estado</Form.Label>
                            <Form.Select name="estado" value={formData.producto.estado} onChange={handleProductoChange} className="rounded-3" disabled={isLoading || !!equipoSel}>
                                {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>IMEI</Form.Label>
                            <Form.Control type="text" name="imei" value={formData.producto.imei} onChange={handleProductoChange}
                                placeholder="15 dígitos (opcional)" className="rounded-3" disabled={isLoading || !!equipoSel} maxLength={15} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Valor ($) <span className="text-danger">*</span></Form.Label>
                            <InputGroup className="rounded-3">
                                <InputGroup.Text>$</InputGroup.Text>
                                <Form.Control type="number" name="valor" value={formData.producto.valor} onChange={handleProductoChange}
                                    placeholder="0" className="rounded-end-3" disabled={isLoading} min={0} step={100} />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                </Row>
            </div>

            {/* Equipo canje */}
            {mostrarCanje && (
                <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.ambarSuave, border: `1px solid ${COLORS.ambar}` }}>
                    <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.ambar }}>
                        <i className="bi bi-arrow-left-right me-2"></i>Equipo a Canjear
                    </h6>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Nombre <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" name="nombre" value={formData.equipoCanje.nombre} onChange={handleCanjeChange}
                                    placeholder="Ej: iPhone 12 Pro" className="rounded-3" disabled={isLoading} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Modelo</Form.Label>
                                <Form.Control type="text" name="modelo" value={formData.equipoCanje.modelo} onChange={handleCanjeChange}
                                    placeholder="Ej: A2408" className="rounded-3" disabled={isLoading} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>IMEI</Form.Label>
                                <Form.Control type="text" name="imei" value={formData.equipoCanje.imei} onChange={handleCanjeChange}
                                    placeholder="15 dígitos" className="rounded-3" disabled={isLoading} maxLength={15} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Color</Form.Label>
                                <Form.Control type="text" name="color" value={formData.equipoCanje.color} onChange={handleCanjeChange}
                                    placeholder="Ej: Grafito" className="rounded-3" disabled={isLoading} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Batería</Form.Label>
                                <Form.Control type="text" name="bateria" value={formData.equipoCanje.bateria} onChange={handleCanjeChange}
                                    placeholder="Ej: 80%" className="rounded-3" disabled={isLoading} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Estado <span className="text-danger">*</span></Form.Label>
                                <Form.Select name="estado" value={formData.equipoCanje.estado} onChange={handleCanjeChange} className="rounded-3" disabled={isLoading}>
                                    {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Valor Tasado ($) <span className="text-danger">*</span></Form.Label>
                                <InputGroup className="rounded-3">
                                    <InputGroup.Text>$</InputGroup.Text>
                                    <Form.Control type="number" name="valorTasado" value={formData.equipoCanje.valorTasado} onChange={handleCanjeChange}
                                        placeholder="0" className="rounded-end-3" disabled={isLoading} min={0} step={100} />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            )}
        </div>
    );
};