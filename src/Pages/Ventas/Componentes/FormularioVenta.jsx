// Ventas/Componentes/FormularioVenta.jsx
import React, { useState } from 'react';
import {
    Form, Row, Col, Button, Card, InputGroup, Badge,
    Alert, Spinner
} from 'react-bootstrap';

export const FormularioVenta = ({
    clienteData,
    onSubmit,
    isLoading,
    vendedor
}) => {
    // ==========================================
    // ESTADO INICIAL
    // ==========================================
    const [formData, setFormData] = useState({
        tipoVenta: 'contado',
        localidad: '',
        fechaRealizada: new Date().toISOString().split('T')[0],
        producto: {
            nombre: '',
            modelo: '',
            bateria: '',
            color: '',
            imei: '',
            estado: 'sellado',
            valor: 0
        },
        pagos: [
            { monto: 0, metodo: 'efectivo', notas: [] }
        ],
        requiereGarante: false,
        garante: {
            nombre: '',
            apellido: '',
            dni: '',
            cuil: '',
            telefono: '',
            email: '',
            direccion: ''
        },
        montoCuota: 0,
        cantidadCuotas: 0,
        frecuencia: 'mensual',
        equipoCanje: {
            nombre: '',
            marca: '',
            modelo: '',
            imei: '',
            color: '',
            bateria: '',
            estado: 'bueno',
            valorTasado: 0
        },
        notas: [],
        vendedor: vendedor || ''
    });

    const [alert, setAlert] = useState({
        show: false,
        message: '',
        variant: 'danger'
    });

    const [nuevaNota, setNuevaNota] = useState('');

    // Tipos de venta disponibles
    const tiposVenta = [
        { value: 'contado', label: 'Contado' },
        { value: 'sistema1', label: 'Sistema 1 (Cuotas con entrega)' },
        { value: 'sistema2', label: 'Sistema 2 (Cuotas sin entrega)' },
        { value: 'plan_canje', label: 'Plan Canje' }
    ];

    // Estados del producto
    const estadosProducto = [
        { value: 'sellado', label: 'Sellado' },
        { value: 'semi nuevo', label: 'Semi Nuevo' },
        { value: 'reacondicionado', label: 'Reacondicionado' }
    ];

    // Métodos de pago
    const metodosPago = [
        { value: 'efectivo', label: 'Efectivo' },
        { value: 'transferencia', label: 'Transferencia' },
        { value: 'dolares', label: 'Dólares' },
        { value: 'cripto', label: 'Criptomonedas' },
        { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' }
    ];

    // Localidades disponibles
    const localidades = [
        'Santiago Capital',
        'La Banda',
        'Añatuya',
        'Monte Quemado'
    ];

    // Frecuencias disponibles
    const frecuencias = [
        { value: 'mensual', label: 'Mensual', descripcion: '1 cuota por mes, día 10' },
        { value: 'quincenal', label: 'Quincenal', descripcion: '1 cuota cada 15 días' },
        { value: 'semanal', label: 'Semanal', descripcion: '1 cuota por semana' },
        { value: 'diario', label: 'Diario', descripcion: '1 cuota por día' }
    ];

    const showAlert = (message, variant = 'danger') => {
        if (!message) {
            setAlert({ show: false, message: '', variant: 'danger' });
            return;
        }
        setAlert({
            show: true,
            message,
            variant,
        });

        setTimeout(() => {
            setAlert({ show: false, message: '', variant: 'danger' });
        }, 5000);
    };

    // ==========================================
    // MANEJADORES DE CAMBIOS
    // ==========================================
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value
            });
        }

        if (alert.show) {
            setAlert({ show: false, message: '', variant: 'danger' });
        }
    };

    const handleProductoChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            producto: {
                ...formData.producto,
                [name]: value
            }
        });
    };

    const handlePagoChange = (index, field, value) => {
        const nuevosPagos = [...formData.pagos];
        nuevosPagos[index] = { ...nuevosPagos[index], [field]: value };
        setFormData({
            ...formData,
            pagos: nuevosPagos
        });
    };

    const handleGaranteChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            garante: {
                ...formData.garante,
                [name]: value
            }
        });
    };

    const handleEquipoCanjeChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            equipoCanje: {
                ...formData.equipoCanje,
                [name]: value
            }
        });
    };

    const handleAgregarNota = () => {
        if (nuevaNota.trim()) {
            setFormData({
                ...formData,
                notas: [
                    ...formData.notas,
                    {
                        texto: nuevaNota.trim(),
                        fecha: new Date().toISOString(),
                        tipo: 'general',
                        usuario: { nombre: vendedor || 'Vendedor' }
                    }
                ]
            });
            setNuevaNota('');
        }
    };

    const handleEliminarNota = (index) => {
        const nuevasNotas = formData.notas.filter((_, i) => i !== index);
        setFormData({ ...formData, notas: nuevasNotas });
    };

    // ==========================================
    // AGREGAR/ELIMINAR PAGOS
    // ==========================================
    const agregarPago = () => {
        setFormData({
            ...formData,
            pagos: [
                ...formData.pagos,
                { monto: 0, metodo: 'efectivo', notas: [] }
            ]
        });
    };

    const eliminarPago = (index) => {
        if (formData.pagos.length > 1) {
            const nuevosPagos = formData.pagos.filter((_, i) => i !== index);
            setFormData({
                ...formData,
                pagos: nuevosPagos
            });
        }
    };

    // ==========================================
    // CÁLCULOS
    // ==========================================
    const calcularTotalPagos = () => {
        return formData.pagos.reduce((total, pago) => total + (parseFloat(pago.monto) || 0), 0);
    };

    const calcularMontoTotal = () => {
        const valorProducto = parseFloat(formData.producto.valor) || 0;

        if (formData.tipoVenta === 'sistema2') {
            const montoCuota = parseFloat(formData.montoCuota) || 0;
            const cantidadCuotas = parseInt(formData.cantidadCuotas) || 0;
            return montoCuota * cantidadCuotas;
        }

        if (formData.tipoVenta === 'plan_canje') {
            const valorCanje = parseFloat(formData.equipoCanje.valorTasado) || 0;
            const montoCuota = parseFloat(formData.montoCuota) || 0;
            const cantidadCuotas = parseInt(formData.cantidadCuotas) || 0;

            if (montoCuota > 0 && cantidadCuotas > 0) {
                return (montoCuota * cantidadCuotas) + valorCanje;
            }
            return valorCanje || valorProducto;
        }

        return valorProducto;
    };

    const getSaldoPendiente = () => {
        const total = calcularMontoTotal();
        const pagado = calcularTotalPagos();
        return total - pagado;
    };

    // ==========================================
    // ENVÍO DEL FORMULARIO
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('🔍 Iniciando validación del formulario...');

        // 1. Validar localidad
        if (!formData.localidad) {
            showAlert('Seleccioná una localidad', 'warning');
            return;
        }

        // 2. Validar fecha
        if (!formData.fechaRealizada) {
            showAlert('La fecha de la venta es obligatoria', 'warning');
            return;
        }

        // 3. Validar producto
        if (!formData.producto.nombre.trim()) {
            showAlert('El nombre del producto es obligatorio', 'warning');
            return;
        }

        if (!formData.producto.valor || parseFloat(formData.producto.valor) <= 0) {
            showAlert('El valor del producto debe ser mayor a 0', 'warning');
            return;
        }

        // 4. Validar cliente
        if (!clienteData || !clienteData.dni) {
            showAlert('Datos del cliente incompletos. Por favor, verificá.', 'danger');
            return;
        }

        // 5. Validaciones por tipo de venta
        if (formData.tipoVenta === 'contado') {
            const pagosValidos = formData.pagos.filter(pago => pago.monto > 0 && pago.metodo);
            if (pagosValidos.length === 0) {
                showAlert('Venta al contado requiere al menos un pago con monto > 0', 'warning');
                return;
            }
        }

        if (['sistema1', 'sistema2'].includes(formData.tipoVenta)) {
            if (!formData.montoCuota || parseFloat(formData.montoCuota) <= 0) {
                showAlert('El monto por cuota debe ser mayor a 0', 'warning');
                return;
            }
            if (!formData.cantidadCuotas || parseInt(formData.cantidadCuotas) <= 0) {
                showAlert('La cantidad de cuotas debe ser mayor a 0', 'warning');
                return;
            }
        }

        if (formData.tipoVenta === 'plan_canje') {
            if (!formData.equipoCanje.nombre.trim()) {
                showAlert('El nombre del equipo a canjear es obligatorio', 'warning');
                return;
            }
            if (!formData.equipoCanje.valorTasado || parseFloat(formData.equipoCanje.valorTasado) <= 0) {
                showAlert('El valor tasado del equipo debe ser mayor a 0', 'warning');
                return;
            }
        }

        // 6. Validar garante
        if (formData.requiereGarante) {
            const { nombre, apellido, dni, telefono, direccion } = formData.garante;
            if (!nombre.trim() || !apellido.trim() || !dni.trim() || !telefono.trim() || !direccion.trim()) {
                showAlert('Todos los campos del garante son obligatorios', 'warning');
                return;
            }
        }

        // ==========================================
        // PREPARAR PAYLOAD
        // ==========================================
        console.log('✅ Validaciones pasadas. Preparando payload...');

        const payload = {
            tipoVenta: formData.tipoVenta,
            localidad: formData.localidad,
            fechaRealizada: formData.fechaRealizada || new Date().toISOString().split('T')[0],
            vendedor: vendedor || '',
            cliente: {
                nombre: clienteData.nombre,
                apellido: clienteData.apellido,
                dni: clienteData.dni,
                telefono: clienteData.telefono || '',
                email: clienteData.email || '',
                direccion: clienteData.direccion || ''
            },
            producto: {
                nombre: formData.producto.nombre.trim(),
                modelo: formData.producto.modelo.trim() || '',
                bateria: formData.producto.bateria.trim() || '',
                color: formData.producto.color.trim() || '',
                imei: formData.producto.imei.trim() || '',
                estado: formData.producto.estado,
                valor: parseFloat(formData.producto.valor)
            },
            pagos: formData.pagos
                .filter(pago => pago.monto > 0 && pago.metodo)
                .map(pago => ({
                    monto: parseFloat(pago.monto),
                    metodo: pago.metodo,
                    notas: []
                })),
            requiereGarante: formData.requiereGarante,
            garante: formData.requiereGarante ? {
                nombre: formData.garante.nombre.trim(),
                apellido: formData.garante.apellido.trim(),
                dni: formData.garante.dni.trim(),
                cuil: formData.garante.cuil.trim() || '',
                telefono: formData.garante.telefono.trim(),
                email: formData.garante.email.trim() || '',
                direccion: formData.garante.direccion.trim()
            } : {},
            montoCuota: parseFloat(formData.montoCuota) || 0,
            cantidadCuotas: parseInt(formData.cantidadCuotas) || 0,
            frecuencia: formData.frecuencia || 'mensual',
            equipoCanje: formData.tipoVenta === 'plan_canje' ? {
                nombre: formData.equipoCanje.nombre.trim(),
                modelo: formData.equipoCanje.modelo.trim() || '',
                imei: formData.equipoCanje.imei.trim() || '',
                color: formData.equipoCanje.color.trim() || '',
                bateria: formData.equipoCanje.bateria.trim() || '',
                estado: formData.equipoCanje.estado || 'bueno',
                valorTasado: parseFloat(formData.equipoCanje.valorTasado)
            } : {},
            notas: formData.notas.map(nota => ({
                texto: nota.texto,
                fecha: nota.fecha,
                tipo: nota.tipo || 'general',
                usuario: {
                    nombre: nota.usuario?.nombre || vendedor || 'Vendedor'
                }
            }))
        };

        console.log('📤 Enviando payload:', payload);

        // Enviar al padre
        onSubmit(payload);
    };

    // ==========================================
    // RENDERIZADO CONDICIONAL
    // ==========================================
    const mostrarCuotas = ['sistema1', 'sistema2', 'plan_canje'].includes(formData.tipoVenta);
    const mostrarGarante = ['sistema1', 'sistema2', 'plan_canje'].includes(formData.tipoVenta);
    const mostrarEquipoCanje = formData.tipoVenta === 'plan_canje';
    const mostrarPagos = ['contado', 'sistema1'].includes(formData.tipoVenta);

    const frecuenciaSeleccionada = frecuencias.find(f => f.value === formData.frecuencia);

    return (
        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4 p-md-5">
                {/* Header */}
                <div className="text-center mb-4">
                    <h4 className="fw-bold mb-1" style={{ color: '#1a1a1a' }}>
                        <i className="bi bi-cart-plus me-2" style={{ color: '#3483FA' }}></i>
                        Nueva Venta
                    </h4>
                    <p className="text-muted small mb-0">
                        Completá los datos de la venta
                    </p>
                    {clienteData && (
                        <div className="mt-2">
                            <Badge bg="success" className="me-1">
                                <i className="bi bi-person-check me-1"></i>
                                Cliente verificado
                            </Badge>
                            <span className="text-muted small">
                                {clienteData.nombreCompleto || clienteData.nombre + ' ' + clienteData.apellido} - DNI: {clienteData.dni}
                            </span>
                        </div>
                    )}
                </div>

                {/* Alertas */}
                {alert.show && (
                    <Alert
                        variant={alert.variant}
                        className="d-flex align-items-center rounded-3 border-0 shadow-sm mb-3"
                        style={{
                            padding: '10px 14px',
                            fontSize: '0.9rem',
                            animation: 'fadeIn 0.3s ease'
                        }}
                    >
                        <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'x-circle'} me-2`}></i>
                        <span className="flex-grow-1">{alert.message}</span>
                        <Button
                            variant="link"
                            className="p-0 ms-2 text-decoration-none"
                            style={{ color: 'inherit', opacity: 0.7 }}
                            onClick={() => setAlert({ show: false, message: '', variant: 'danger' })}
                        >
                            <i className="bi bi-x-circle"></i>
                        </Button>
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    {/* ==========================================
                        SECCIÓN 1: TIPO DE VENTA, LOCALIDAD Y FECHA
                        ========================================== */}
                    <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                        <h6 className="fw-bold text-primary mb-3" style={{ fontSize: '0.85rem' }}>
                            <i className="bi bi-info-circle me-2"></i>
                            Datos Generales
                        </h6>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary">
                                        Tipo de Venta <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="tipoVenta"
                                        value={formData.tipoVenta}
                                        onChange={handleChange}
                                        className="rounded-3"
                                        disabled={isLoading}
                                    >
                                        {tiposVenta.map(tipo => (
                                            <option key={tipo.value} value={tipo.value}>
                                                {tipo.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary">
                                        Localidad <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="localidad"
                                        value={formData.localidad}
                                        onChange={handleChange}
                                        className="rounded-3"
                                        disabled={isLoading}
                                    >
                                        <option value="">Seleccioná una localidad</option>
                                        {localidades.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary">
                                        <i className="bi bi-calendar me-1"></i>
                                        Fecha de la Venta
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="fechaRealizada"
                                        value={formData.fechaRealizada}
                                        onChange={handleChange}
                                        className="rounded-3"
                                        disabled={isLoading}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    <Form.Text className="text-muted small">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Por defecto es la fecha actual.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* ==========================================
                        SECCIÓN 2: PRODUCTO
                        ========================================== */}
                    <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                        <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                            <i className="bi bi-phone me-2"></i>
                            Datos del Producto
                        </h6>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary">
                                        Nombre del Producto <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre"
                                        value={formData.producto.nombre}
                                        onChange={handleProductoChange}
                                        placeholder="Ej: Samsung Galaxy S24 Ultra"
                                        className="rounded-3"
                                        disabled={isLoading}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary">Modelo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="modelo"
                                        value={formData.producto.modelo}
                                        onChange={handleProductoChange}
                                        placeholder="Ej: SM-S928B"
                                        className="rounded-3"
                                        disabled={isLoading}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary">Color</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="color"
                                        value={formData.producto.color}
                                        onChange={handleProductoChange}
                                        placeholder="Ej: Negro"
                                        className="rounded-3"
                                        disabled={isLoading}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary">Batería</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="bateria"
                                        value={formData.producto.bateria}
                                        onChange={handleProductoChange}
                                        placeholder="Ej: 5000mAh"
                                        className="rounded-3"
                                        disabled={isLoading}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary">Estado</Form.Label>
                                    <Form.Select
                                        name="estado"
                                        value={formData.producto.estado}
                                        onChange={handleProductoChange}
                                        className="rounded-3"
                                        disabled={isLoading}
                                    >
                                        {estadosProducto.map(estado => (
                                            <option key={estado.value} value={estado.value}>
                                                {estado.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary">IMEI</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="imei"
                                        value={formData.producto.imei}
                                        onChange={handleProductoChange}
                                        placeholder="15 dígitos (opcional)"
                                        className="rounded-3"
                                        disabled={isLoading}
                                        maxLength={15}
                                    />
                                    <Form.Text className="text-muted small">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Opcional - Se validará que no esté duplicado
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary">
                                        Valor del Producto ($) <span className="text-danger">*</span>
                                    </Form.Label>
                                    <InputGroup className="rounded-3">
                                        <InputGroup.Text>$</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            name="valor"
                                            value={formData.producto.valor}
                                            onChange={handleProductoChange}
                                            placeholder="0"
                                            className="rounded-end-3"
                                            disabled={isLoading}
                                            min={0}
                                            step={100}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* ==========================================
                        SECCIÓN 3: CUOTAS
                        ========================================== */}
                    {mostrarCuotas && (
                        <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                            <h6 className="fw-bold text-warning mb-3" style={{ fontSize: '0.85rem' }}>
                                <i className="bi bi-calendar-event me-2"></i>
                                Configuración de Cuotas
                            </h6>
                            <Row className="g-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-secondary">
                                            Monto por Cuota ($) <span className="text-danger">*</span>
                                        </Form.Label>
                                        <InputGroup className="rounded-3">
                                            <InputGroup.Text>$</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                name="montoCuota"
                                                value={formData.montoCuota}
                                                onChange={handleChange}
                                                placeholder="0"
                                                className="rounded-end-3"
                                                disabled={isLoading}
                                                min={0}
                                                step={100}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-secondary">
                                            Cantidad de Cuotas <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="cantidadCuotas"
                                            value={formData.cantidadCuotas}
                                            onChange={handleChange}
                                            placeholder="Ej: 12"
                                            className="rounded-3"
                                            disabled={isLoading}
                                            min={1}
                                            max={60}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-secondary">
                                            <i className="bi bi-arrow-repeat me-1"></i>
                                            Frecuencia de Pago
                                        </Form.Label>
                                        <Form.Select
                                            name="frecuencia"
                                            value={formData.frecuencia}
                                            onChange={handleChange}
                                            className="rounded-3"
                                            disabled={isLoading}
                                        >
                                            {frecuencias.map(frec => (
                                                <option key={frec.value} value={frec.value}>
                                                    {frec.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Text className="text-muted small">
                                            <i className="bi bi-info-circle me-1"></i>
                                            {frecuenciaSeleccionada?.descripcion}
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                            {formData.montoCuota > 0 && formData.cantidadCuotas > 0 && (
                                <div className="mt-3 p-3 bg-white rounded-3 border">
                                    <Row className="text-center">
                                        <Col xs={6} md={4}>
                                            <small className="text-muted d-block">Total a Financiar</small>
                                            <strong className="text-primary">
                                                ${(formData.montoCuota * formData.cantidadCuotas).toLocaleString()}
                                            </strong>
                                        </Col>
                                        <Col xs={6} md={4}>
                                            <small className="text-muted d-block">Cantidad de Cuotas</small>
                                            <strong>{formData.cantidadCuotas}</strong>
                                        </Col>
                                        <Col xs={12} md={4} className="mt-2 mt-md-0">
                                            <small className="text-muted d-block">Frecuencia</small>
                                            <Badge
                                                style={{
                                                    backgroundColor: '#e8f0fe',
                                                    color: '#3483FA',
                                                    fontWeight: '500',
                                                    padding: '4px 10px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                <i className="bi bi-arrow-repeat me-1"></i>
                                                {frecuenciaSeleccionada?.label}
                                            </Badge>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ==========================================
                        SECCIÓN 4: EQUIPO CANJE
                        ========================================== */}
                    {mostrarEquipoCanje && (
                        <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                            <h6 className="fw-bold text-info mb-3" style={{ fontSize: '0.85rem' }}>
                                <i className="bi bi-arrow-left-right me-2"></i>
                                Equipo a Canjear
                            </h6>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-secondary">
                                            Nombre del Equipo <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nombre"
                                            value={formData.equipoCanje.nombre}
                                            onChange={handleEquipoCanjeChange}
                                            placeholder="Ej: iPhone 12 Pro"
                                            className="rounded-3"
                                            disabled={isLoading}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-secondary">Modelo</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="modelo"
                                            value={formData.equipoCanje.modelo}
                                            onChange={handleEquipoCanjeChange}
                                            placeholder="Ej: A2408"
                                            className="rounded-3"
                                            disabled={isLoading}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-secondary">IMEI</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="imei"
                                            value={formData.equipoCanje.imei}
                                            onChange={handleEquipoCanjeChange}
                                            placeholder="15 dígitos"
                                            className="rounded-3"
                                            disabled={isLoading}
                                            maxLength={15}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-secondary">Color</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="color"
                                            value={formData.equipoCanje.color}
                                            onChange={handleEquipoCanjeChange}
                                            placeholder="Ej: Grafito"
                                            className="rounded-3"
                                            disabled={isLoading}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-secondary">Batería</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="bateria"
                                            value={formData.equipoCanje.bateria}
                                            onChange={handleEquipoCanjeChange}
                                            placeholder="Ej: 80%"
                                            className="rounded-3"
                                            disabled={isLoading}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-secondary">
                                            Estado del Equipo <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Select
                                            name="estado"
                                            value={formData.equipoCanje.estado}
                                            onChange={handleEquipoCanjeChange}
                                            className="rounded-3"
                                            disabled={isLoading}
                                        >
                                            <option value="excelente">Excelente</option>
                                            <option value="bueno">Bueno</option>
                                            <option value="regular">Regular</option>
                                            <option value="malo">Malo</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-secondary">
                                            Valor Tasado ($) <span className="text-danger">*</span>
                                        </Form.Label>
                                        <InputGroup className="rounded-3">
                                            <InputGroup.Text>$</InputGroup.Text>
                                            <Form.Control
                                                type="number"
                                                name="valorTasado"
                                                value={formData.equipoCanje.valorTasado}
                                                onChange={handleEquipoCanjeChange}
                                                placeholder="0"
                                                className="rounded-end-3"
                                                disabled={isLoading}
                                                min={0}
                                                step={100}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* ==========================================
                        SECCIÓN 5: PAGOS
                        ========================================== */}
                    {mostrarPagos && (
                        <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                            <h6 className="fw-bold text-success mb-3" style={{ fontSize: '0.85rem' }}>
                                <i className="bi bi-wallet2 me-2"></i>
                                Pagos
                            </h6>

                            {formData.pagos.map((pago, index) => (
                                <Row key={index} className="g-2 mb-2 align-items-end">
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-secondary">
                                                Monto ($)
                                            </Form.Label>
                                            <InputGroup className="rounded-3">
                                                <InputGroup.Text>$</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    value={pago.monto}
                                                    onChange={(e) => handlePagoChange(index, 'monto', parseFloat(e.target.value) || 0)}
                                                    placeholder="0"
                                                    className="rounded-end-3"
                                                    disabled={isLoading}
                                                    min={0}
                                                    step={100}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={5}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-secondary">
                                                Método de Pago
                                            </Form.Label>
                                            <Form.Select
                                                value={pago.metodo}
                                                onChange={(e) => handlePagoChange(index, 'metodo', e.target.value)}
                                                className="rounded-3"
                                                disabled={isLoading}
                                            >
                                                {metodosPago.map(metodo => (
                                                    <option key={metodo.value} value={metodo.value}>
                                                        {metodo.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3} className="d-flex gap-2">
                                        {index === 0 && (
                                            <Button
                                                variant="outline-primary"
                                                onClick={agregarPago}
                                                className="rounded-3 flex-grow-1"
                                                disabled={isLoading}
                                                style={{ height: '38px' }}
                                            >
                                                <i className="bi bi-plus-lg"></i>
                                            </Button>
                                        )}
                                        {index > 0 && (
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => eliminarPago(index)}
                                                className="rounded-3 flex-grow-1"
                                                disabled={isLoading}
                                                style={{ height: '38px' }}
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </Button>
                                        )}
                                    </Col>
                                </Row>
                            ))}

                            <div className="mt-3 p-2 bg-light rounded-3">
                                <Row className="text-center">
                                    <Col>
                                        <small className="text-muted d-block">Total Pagado</small>
                                        <strong className="text-success">${calcularTotalPagos().toLocaleString()}</strong>
                                    </Col>
                                    <Col>
                                        <small className="text-muted d-block">Saldo Pendiente</small>
                                        <strong className={getSaldoPendiente() > 0 ? 'text-danger' : 'text-success'}>
                                            ${getSaldoPendiente().toLocaleString()}
                                        </strong>
                                    </Col>
                                    <Col>
                                        <small className="text-muted d-block">Total Venta</small>
                                        <strong>${calcularMontoTotal().toLocaleString()}</strong>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    )}

                    {/* ==========================================
                        SECCIÓN 6: GARANTE
                        ========================================== */}
                    {mostrarGarante && (
                        <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold text-warning mb-0" style={{ fontSize: '0.85rem' }}>
                                    <i className="bi bi-person-check me-2"></i>
                                    Garante
                                </h6>
                                <Form.Check
                                    type="switch"
                                    id="requiereGarante"
                                    label="Requiere garante"
                                    name="requiereGarante"
                                    checked={formData.requiereGarante}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>

                            {formData.requiereGarante && (
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-secondary">
                                                Nombre <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nombre"
                                                value={formData.garante.nombre}
                                                onChange={handleGaranteChange}
                                                placeholder="Nombre del garante"
                                                className="rounded-3"
                                                disabled={isLoading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-secondary">
                                                Apellido <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="apellido"
                                                value={formData.garante.apellido}
                                                onChange={handleGaranteChange}
                                                placeholder="Apellido del garante"
                                                className="rounded-3"
                                                disabled={isLoading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-secondary">
                                                DNI <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="dni"
                                                value={formData.garante.dni}
                                                onChange={handleGaranteChange}
                                                placeholder="8 dígitos"
                                                className="rounded-3"
                                                disabled={isLoading}
                                                maxLength={8}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-secondary">CUIL</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="cuil"
                                                value={formData.garante.cuil}
                                                onChange={handleGaranteChange}
                                                placeholder="XX-XXXXXXXX-X"
                                                className="rounded-3"
                                                disabled={isLoading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-secondary">
                                                Teléfono <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="telefono"
                                                value={formData.garante.telefono}
                                                onChange={handleGaranteChange}
                                                placeholder="Teléfono del garante"
                                                className="rounded-3"
                                                disabled={isLoading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-secondary">Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.garante.email}
                                                onChange={handleGaranteChange}
                                                placeholder="ejemplo@correo.com"
                                                className="rounded-3"
                                                disabled={isLoading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-secondary">
                                                Dirección <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="direccion"
                                                value={formData.garante.direccion}
                                                onChange={handleGaranteChange}
                                                placeholder="Dirección del garante"
                                                className="rounded-3"
                                                disabled={isLoading}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            )}
                        </div>
                    )}

                    {/* ==========================================
                        SECCIÓN: NOTAS Y OBSERVACIONES (NUEVO)
                        ========================================== */}
                    <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                        <h6 className="fw-bold text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
                            <i className="bi bi-chat-left-text me-2"></i>
                            Notas y Observaciones de la Venta
                        </h6>

                        <Form.Group className="mb-2">
                            <Form.Label className="small fw-semibold text-secondary">
                                Agregar nota o aclaración
                            </Form.Label>
                            <InputGroup>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={nuevaNota}
                                    onChange={(e) => setNuevaNota(e.target.value)}
                                    placeholder="Ej: El cliente quedó en traer el comprobante mañana..."
                                    className="rounded-3"
                                    disabled={isLoading}
                                    style={{ resize: 'none' }}
                                />
                                <Button
                                    variant="outline-primary"
                                    className="rounded-3 ms-2 d-flex align-items-center"
                                    onClick={handleAgregarNota}
                                    disabled={isLoading || !nuevaNota.trim()}
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    <i className="bi bi-plus-lg me-1"></i>
                                    Agregar
                                </Button>
                            </InputGroup>
                            <Form.Text className="text-muted small">
                                <i className="bi bi-info-circle me-1"></i>
                                Podés agregar observaciones, aclaraciones o recordatorios de la venta.
                            </Form.Text>
                        </Form.Group>

                        {/* Lista de notas agregadas */}
                        {formData.notas.length > 0 && (
                            <div className="mt-3">
                                {formData.notas.map((nota, index) => (
                                    <div
                                        key={index}
                                        className="d-flex align-items-start p-2 mb-2 bg-white rounded-3 border"
                                    >
                                        <i className="bi bi-chat-left-text me-2 mt-1" style={{ color: '#3483FA' }}></i>
                                        <div className="flex-grow-1">
                                            <small style={{ color: '#333', fontSize: '0.85rem' }}>
                                                {nota.texto}
                                            </small>
                                            <div className="d-flex justify-content-between mt-1">
                                                <small style={{ color: '#999', fontSize: '0.7rem' }}>
                                                    {nota.usuario?.nombre || 'Vendedor'}
                                                </small>
                                                <small style={{ color: '#999', fontSize: '0.7rem' }}>
                                                    {new Date(nota.fecha).toLocaleString('es-AR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </small>
                                            </div>
                                        </div>
                                        <Button
                                            variant="link"
                                            className="p-0 ms-2 text-decoration-none"
                                            style={{ color: '#dc3545', fontSize: '0.8rem' }}
                                            onClick={() => handleEliminarNota(index)}
                                            disabled={isLoading}
                                        >
                                            <i className="bi bi-trash3"></i>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ==========================================
                        SECCIÓN 7: RESUMEN Y CONFIRMACIÓN
                        ========================================== */}
                    <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                        <h6 className="fw-bold text-primary mb-3" style={{ fontSize: '0.85rem' }}>
                            <i className="bi bi-clipboard-data me-2"></i>
                            Resumen de la Venta
                        </h6>
                        <Row className="g-3">
                            <Col md={6}>
                                <div className="p-2 bg-white rounded-3">
                                    <small className="text-muted d-block">Cliente</small>
                                    <span className="fw-semibold">
                                        {clienteData?.nombreCompleto || clienteData?.nombre + ' ' + clienteData?.apellido}
                                    </span>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="p-2 bg-white rounded-3">
                                    <small className="text-muted d-block">DNI</small>
                                    <span className="fw-semibold">{clienteData?.dni}</span>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="p-2 bg-white rounded-3">
                                    <small className="text-muted d-block">Tipo de Venta</small>
                                    <span className="fw-semibold">
                                        {tiposVenta.find(t => t.value === formData.tipoVenta)?.label || formData.tipoVenta}
                                    </span>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="p-2 bg-white rounded-3">
                                    <small className="text-muted d-block">Localidad</small>
                                    <span className="fw-semibold">{formData.localidad || 'No seleccionada'}</span>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="p-2 bg-white rounded-3">
                                    <small className="text-muted d-block">Fecha</small>
                                    <span className="fw-semibold">
                                        {formData.fechaRealizada ? new Date(formData.fechaRealizada).toLocaleDateString('es-AR') : 'No seleccionada'}
                                    </span>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="p-2 bg-white rounded-3">
                                    <small className="text-muted d-block">Producto</small>
                                    <span className="fw-semibold">{formData.producto.nombre || 'Sin producto'}</span>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="p-2 bg-white rounded-3">
                                    <small className="text-muted d-block">Valor Producto</small>
                                    <span className="fw-semibold">${formData.producto.valor.toLocaleString()}</span>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className="p-2 bg-white rounded-3">
                                    <small className="text-muted d-block">Monto Total</small>
                                    <span className="fw-bold text-success">${calcularMontoTotal().toLocaleString()}</span>
                                </div>
                            </Col>
                            {mostrarCuotas && (
                                <>
                                    <Col md={4}>
                                        <div className="p-2 bg-white rounded-3">
                                            <small className="text-muted d-block">Cuotas</small>
                                            <span className="fw-semibold">
                                                {formData.cantidadCuotas} x ${formData.montoCuota.toLocaleString()}
                                            </span>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="p-2 bg-white rounded-3">
                                            <small className="text-muted d-block">Frecuencia</small>
                                            <Badge
                                                style={{
                                                    backgroundColor: '#e8f0fe',
                                                    color: '#3483FA',
                                                    fontWeight: '500',
                                                    padding: '4px 10px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                <i className="bi bi-arrow-repeat me-1"></i>
                                                {frecuenciaSeleccionada?.label}
                                            </Badge>
                                        </div>
                                    </Col>
                                </>
                            )}
                            {formData.notas.length > 0 && (
                                <Col md={4}>
                                    <div className="p-2 bg-white rounded-3">
                                        <small className="text-muted d-block">Notas</small>
                                        <span className="fw-semibold">
                                            <i className="bi bi-chat-left-text me-1" style={{ color: '#3483FA' }}></i>
                                            {formData.notas.length} {formData.notas.length === 1 ? 'nota' : 'notas'}
                                        </span>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </div>

                    {/* Botones de acción */}
                    <div className="d-flex gap-2 justify-content-end pt-3 mt-3 border-top">
                        <Button
                            variant="secondary"
                            onClick={() => window.history.back()}
                            className="rounded-3"
                            disabled={isLoading}
                        >
                            <i className="bi bi-arrow-left me-1"></i>
                            Volver
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            className="rounded-3 px-4"
                            style={{
                                backgroundColor: '#3483FA',
                                borderColor: '#3483FA',
                                fontWeight: '500',
                                minWidth: '180px'
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle me-2"></i>
                                    Confirmar Venta
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .alert-warning {
                    background-color: #fef6e6;
                    color: #856404;
                    border-left: 4px solid #ffa900;
                }

                .alert-danger {
                    background-color: #fde8e8;
                    color: #721c24;
                    border-left: 4px solid #dc3545;
                }

                .alert-success {
                    background-color: #e6f4ea;
                    color: #155724;
                    border-left: 4px solid #28a745;
                }

                .alert-info {
                    background-color: #e6f3ff;
                    color: #004085;
                    border-left: 4px solid #17a2b8;
                }
            `}</style>
        </Card>
    );
};