// src/Pages/Ceo/Componentes/EquiposUnificados.jsx
import React, { useState, useEffect, useRef } from 'react';
import { listarEquipos, crearEquipoStock, crearEquipoCanje, editarEquipo, eliminarEquipo } from '../../Ceo/Helpers/stockunicoapi';
import { COLORS } from '../../Cobranza/Helperss/colors'; // Ajustá la ruta si es necesario
import { Container, Row, Col, Card, Form, InputGroup, Button, Spinner, Alert, Modal, Table } from 'react-bootstrap';


// ==========================================
// COMPONENTE PILL (Reemplazo de Badge)
// ==========================================
const Pill = ({ children, bg, color, border, icon, style = {} }) => (
    <span
        style={{
            display: 'inline-flex', alignItems: 'center', padding: '0.35em 0.7em',
            fontSize: '0.75rem', fontWeight: '600', borderRadius: '20px',
            backgroundColor: bg, color: color,
            border: border ? `1px solid ${border}` : 'none',
            whiteSpace: 'nowrap', ...style
        }}
    >
        {icon && <i className={`bi bi-${icon} me-1`}></i>}
        {children}
    </span>
);

const localidades = ['santiago capital', 'la banda', 'añatuya', 'monte quemado'];
const estadosEquipo = ['sellado', 'semi nuevo', 'reacondicionado', 'exhibicion', 'bueno', 'regular', 'malo'];
const accesoriosSugeridos = ['Cargador', 'Cable USB-C', 'Cable Lightning', 'Auriculares', 'Caja original', 'Manual', 'Funda', 'Protector de pantalla', 'Adaptador de corriente', 'SIM card'];

const formatoMoneda = (v) => !v && v !== 0 ? '$0' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
const formatoFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

// Config Pills
const PillOrigen = ({ origen }) => origen === 'canje'
    ? <Pill bg={COLORS.ambarSuave} color={COLORS.ambar} icon="arrow-repeat">Canje</Pill>
    : <Pill bg={COLORS.azulSuave} color={COLORS.azul} icon="box-seam">Stock</Pill>;

const PillEstado = ({ estado }) => {
    const config = {
        'sellado': { bg: COLORS.azulSuave, color: COLORS.azul },
        'semi nuevo': { bg: COLORS.azulSuave, color: COLORS.azul },
        'reacondicionado': { bg: COLORS.ambarSuave, color: COLORS.ambar },
        'exhibicion': { bg: COLORS.bgGeneral, color: COLORS.textoSecundario },
        'bueno': { bg: COLORS.verdeSuave, color: COLORS.verde },
        'regular': { bg: COLORS.ambarSuave, color: COLORS.ambar },
        'malo': { bg: COLORS.rojoSuave, color: COLORS.rojo }
    };
    const c = config[estado] || { bg: COLORS.bgGeneral, color: COLORS.textoSecundario };
    return <Pill bg={c.bg} color={c.color}>{estado}</Pill>;
};

const PillConducta = ({ conducta }) => {
    const config = {
        'al dia': { bg: COLORS.verdeSuave, color: COLORS.verde },
        'cancelado': { bg: COLORS.bgGeneral, color: COLORS.textoSecundario },
        'refinanciado': { bg: COLORS.azulSuave, color: COLORS.azul },
        'atrasado': { bg: COLORS.ambarSuave, color: COLORS.ambar },
        'cobro judicial': { bg: COLORS.rojoSuave, color: COLORS.rojo },
        'caducado': { bg: COLORS.azulOscuro, color: '#fff' }
    };
    const c = config[conducta] || { bg: COLORS.bgGeneral, color: COLORS.textoSecundario };
    return <Pill bg={c.bg} color={c.color}>{conducta || 'N/A'}</Pill>;
};

const PillNota = ({ tipo }) => {
    const config = {
        'general': { bg: COLORS.bgGeneral, color: COLORS.textoSecundario },
        'importante': { bg: COLORS.rojoSuave, color: COLORS.rojo },
        'mantenimiento': { bg: COLORS.ambarSuave, color: COLORS.ambar },
        'reparacion': { bg: COLORS.azulSuave, color: COLORS.azul }
    };
    const c = config[tipo] || config.general;
    return <Pill bg={c.bg} color={c.color}>{tipo || 'general'}</Pill>;
};

export const EquiposUnificados = () => {
    const [equipos, setEquipos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cargandoMas, setCargandoMas] = useState(false);
    const [error, setError] = useState('');
    const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });
    const alertRef = useRef(null);

    const [totales, setTotales] = useState({ totalCostoStock: 0, totalVentaStock: 0, totalTasadoCanje: 0, totalVentaGeneral: 0, totalStockCantidad: 0, totalCanjeCantidad: 0 });

    const [pagina, setPagina] = useState(1);
    const [hayMas, setHayMas] = useState(false);
    const [restantes, setRestantes] = useState(0);
    const [totalEquipos, setTotalEquipos] = useState(0);

    const [busqueda, setBusqueda] = useState('');
    const [filtroOrigen, setFiltroOrigen] = useState('todos');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroDisponible, setFiltroDisponible] = useState('todas');
    const [filtroLocalidad, setFiltroLocalidad] = useState('todas');

    const [showModal, setShowModal] = useState(false);
    const [equipoEditar, setEquipoEditar] = useState(null);
    const [tipoEquipo, setTipoEquipo] = useState('stock');

    const [formData, setFormData] = useState({
        nombre: '', modelo: '', capacidad: '', imei: '', color: '', bateria: '',
        serie: '', ios: '', accesorios: [], localidad: '', estado: 'sellado',
        precioCompra: 0, precioVenta: 0, valorTasado: 0,
        proveedor: { nombre: '', telefono: '', email: '', factura: '' },
        ventaOrigen: '', disponible: true
    });
    const [saving, setSaving] = useState(false);
    const [nuevoAccesorio, setNuevoAccesorio] = useState('');

    const [showDelete, setShowDelete] = useState(false);
    const [equipoEliminar, setEquipoEliminar] = useState(null);

    const [showDetalleModal, setShowDetalleModal] = useState(false);
    const [detalleData, setDetalleData] = useState(null);
    const [tipoDetalle, setTipoDetalle] = useState('');
    const [equipoContexto, setEquipoContexto] = useState(null);

    const [showNotasModal, setShowNotasModal] = useState(false);
    const [equipoNotas, setEquipoNotas] = useState(null);

    useEffect(() => { cargarDatos(1); }, []);

    const cargarDatos = async (paginaSolicitada = 1) => {
        setIsLoading(true);
        setError('');
        try {
            const data = await listarEquipos({
                pagina: paginaSolicitada, limite: 50,
                ...(busqueda.trim() && { nombre: busqueda.trim() }),
                ...(filtroOrigen !== 'todos' && { origen: filtroOrigen }),
                ...(filtroEstado !== 'todos' && { estado: filtroEstado }),
                ...(filtroDisponible !== 'todas' && { disponible: filtroDisponible }),
                ...(filtroLocalidad !== 'todas' && { localidad: filtroLocalidad })
            });
            const equiposData = data?.data?.equipos || [];
            setEquipos(Array.isArray(equiposData) ? equiposData : []);
            const pag = data?.data?.paginacion || {};
            setHayMas(pag.hayMas || false);
            setRestantes(pag.restantes || 0);
            setTotalEquipos(pag.total || 0);
            setPagina(paginaSolicitada);
            setTotales(data?.data?.totales || {});
        } catch (err) {
            setError(err.message || 'Error al cargar los equipos');
            setEquipos([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCargarMas = async () => {
        setCargandoMas(true);
        try {
            const data = await listarEquipos({
                pagina: pagina + 1, limite: 50,
                ...(busqueda.trim() && { nombre: busqueda.trim() }),
                ...(filtroOrigen !== 'todos' && { origen: filtroOrigen }),
                ...(filtroEstado !== 'todos' && { estado: filtroEstado }),
                ...(filtroDisponible !== 'todas' && { disponible: filtroDisponible }),
                ...(filtroLocalidad !== 'todas' && { localidad: filtroLocalidad })
            });
            const nuevos = data?.data?.equipos || [];
            setEquipos(prev => [...prev, ...(Array.isArray(nuevos) ? nuevos : [])]);
            const pag = data?.data?.paginacion || {};
            setHayMas(pag.hayMas || false); setRestantes(pag.restantes || 0); setPagina(pagina + 1);
            setTotales(data?.data?.totales || {});
        } catch (err) {
            setError(err.message || 'Error al cargar más equipos');
        } finally {
            setCargandoMas(false);
        }
    };

    const handleBuscar = () => cargarDatos(1);
    const handleLimpiar = () => {
        setBusqueda(''); setFiltroOrigen('todos'); setFiltroEstado('todos');
        setFiltroDisponible('todas'); setFiltroLocalidad('todas');
        cargarDatos(1);
    };

    const showAlert = (message, variant = 'danger') => {
        setAlert({ show: true, message, variant });
        setTimeout(() => { if (alertRef.current) alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
        setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
    };

    const handleCrear = (tipo = 'stock') => {
        setEquipoEditar(null); setTipoEquipo(tipo);
        setFormData({
            nombre: '', modelo: '', capacidad: '', imei: '', color: '', bateria: '', serie: '', ios: '', accesorios: [],
            localidad: '', estado: tipo === 'stock' ? 'sellado' : 'bueno',
            precioCompra: 0, precioVenta: 0, valorTasado: 0,
            proveedor: { nombre: '', telefono: '', email: '', factura: '' }, ventaOrigen: '', disponible: true
        });
        setNuevoAccesorio(''); setShowModal(true);
    };

    const handleEditar = (equipo) => {
        setEquipoEditar(equipo); setTipoEquipo(equipo.origen);
        setFormData({
            nombre: equipo.nombre || '', modelo: equipo.modelo || '', capacidad: equipo.capacidad || '',
            imei: equipo.imei || '', color: equipo.color || '', bateria: equipo.bateria || '',
            serie: equipo.serie || '', ios: equipo.ios || '', accesorios: equipo.accesorios || [],
            localidad: equipo.localidad || '', estado: equipo.estado || (equipo.origen === 'stock' ? 'sellado' : 'bueno'),
            precioCompra: equipo.precioCompra || 0, precioVenta: equipo.precioVenta || 0, valorTasado: equipo.valorTasado || 0,
            proveedor: { nombre: equipo.proveedor?.nombre || '', telefono: equipo.proveedor?.telefono || '', email: equipo.proveedor?.email || '', factura: equipo.proveedor?.factura || '' },
            ventaOrigen: equipo.ventaOrigen?._id || '', disponible: equipo.disponible !== undefined ? equipo.disponible : true
        });
        setNuevoAccesorio(''); setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('proveedor.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, proveedor: { ...prev.proveedor, [field]: value } }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAgregarAccesorio = () => {
        const acc = nuevoAccesorio.trim();
        if (!acc) return;
        if (formData.accesorios.includes(acc)) return showAlert('Ese accesorio ya está en la lista', 'warning');
        setFormData(prev => ({ ...prev, accesorios: [...prev.accesorios, acc] })); setNuevoAccesorio('');
    };
    const handleAgregarAccesorioSugerido = (acc) => {
        if (formData.accesorios.includes(acc)) return;
        setFormData(prev => ({ ...prev, accesorios: [...prev.accesorios, acc] }));
    };
    const handleEliminarAccesorio = (index) => setFormData(prev => ({ ...prev, accesorios: prev.accesorios.filter((_, i) => i !== index) }));

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim()) return showAlert('El nombre es obligatorio', 'warning');
        if (tipoEquipo === 'stock' && (!formData.precioVenta || formData.precioVenta <= 0)) return showAlert('El precio de venta es obligatorio', 'warning');
        if (tipoEquipo === 'canje' && (!formData.valorTasado || formData.valorTasado <= 0)) return showAlert('El valor tasado es obligatorio', 'warning');

        setSaving(true);
        try {
            const payload = {
                nombre: formData.nombre.trim(), modelo: formData.modelo.trim(), capacidad: formData.capacidad.trim(),
                imei: formData.imei.trim(), color: formData.color.trim(), bateria: formData.bateria.trim(),
                serie: formData.serie.trim(), ios: formData.ios.trim(), accesorios: formData.accesorios || [],
                localidad: formData.localidad, estado: formData.estado
            };
            if (tipoEquipo === 'stock') {
                payload.precioCompra = parseFloat(formData.precioCompra) || 0; payload.precioVenta = parseFloat(formData.precioVenta);
                payload.proveedor = { nombre: formData.proveedor.nombre.trim(), telefono: formData.proveedor.telefono.trim(), email: formData.proveedor.email.trim(), factura: formData.proveedor.factura.trim() };
            } else {
                payload.valorTasado = parseFloat(formData.valorTasado);
                if (formData.ventaOrigen) payload.ventaOrigen = formData.ventaOrigen;
            }
            if (equipoEditar) {
                payload.disponible = formData.disponible;
                await editarEquipo(equipoEditar._id, payload); setShowModal(false); showAlert('Equipo actualizado', 'success'); cargarDatos(1);
            } else {
                if (tipoEquipo === 'stock') await crearEquipoStock(payload);
                else await crearEquipoCanje(payload);
                setShowModal(false); showAlert('Equipo agregado', 'success'); cargarDatos(1);
            }
        } catch (err) {
            showAlert(err.message || 'Error al guardar', 'danger');
        } finally { setSaving(false); }
    };

    const handleEliminar = async () => {
        if (!equipoEliminar) return;
        setSaving(true);
        try {
            await eliminarEquipo(equipoEliminar._id); setShowDelete(false); setEquipoEliminar(null); showAlert('Equipo eliminado', 'success'); cargarDatos(1);
        } catch (err) { showAlert(err.message || 'Error al eliminar', 'danger'); setShowDelete(false); } finally { setSaving(false); }
    };

    const handleVerDetalle = (equipo, tipo) => {
        setEquipoContexto(equipo);
        if (tipo === 'ventaAsociada' && equipo.ventaAsociada) { setDetalleData(equipo.ventaAsociada); setTipoDetalle('ventaAsociada'); setShowDetalleModal(true); }
        else if (tipo === 'ventaOrigen' && equipo.ventaOrigen) { setDetalleData(equipo.ventaOrigen); setTipoDetalle('ventaOrigen'); setShowDetalleModal(true); }
    };
    const handleVerNotas = (equipo) => { setEquipoNotas(equipo); setShowNotasModal(true); };

    if (isLoading && equipos.length === 0) return (
        <div className="text-center py-5"><Spinner animation="border" style={{ color: COLORS.azul }} /><p style={{ color: COLORS.textoSecundario }} className="mt-3">Cargando...</p></div>
    );

    if (error && equipos.length === 0) return (
        <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
            <Button onClick={() => cargarDatos(1)} variant="link" className="ms-3" style={{ color: COLORS.rojo, textDecoration: 'underline' }}>Reintentar</Button>
        </Alert>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: COLORS.bgGeneral }}>
            <Container fluid className="py-4" style={{ maxWidth: '1400px' }}>

                {/* Header */}
                <div className="mb-4">
                    <small style={{ color: COLORS.textoSecundario, fontWeight: 600, letterSpacing: '1px' }}>INVENTARIO · EQUIPOS UNIFICADOS</small>
                    <h3 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal }}>
                        <i className="bi bi-phone me-2" style={{ color: COLORS.azul }}></i>Stock y Canjes
                    </h3>
                    <p className="small mb-0" style={{ color: COLORS.textoSecundario }}>
                        Administrá el inventario completo · {totalEquipos} equipos en total
                    </p>
                </div>

                {alert.show && (
                    <Alert ref={alertRef} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'danger' })}
                        className="shadow-sm border-0 mb-3"
                        style={{ borderRadius: '12px', backgroundColor: alert.variant === 'success' ? COLORS.verdeSuave : alert.variant === 'warning' ? COLORS.ambarSuave : COLORS.rojoSuave, color: alert.variant === 'success' ? COLORS.verde : alert.variant === 'warning' ? COLORS.ambar : COLORS.rojo }}>
                        <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : alert.variant === 'warning' ? 'exclamation-triangle' : 'x-circle'} me-2`}></i>{alert.message}
                    </Alert>
                )}

                {/* KPIs (Arriba, como en la imagen) */}
                <Row className="g-3 mb-4">
                    {[
                        { label: 'Costo Total Stock', value: totales.totalCostoStock, sub: `${totales.totalStockCantidad || 0} equipos`, color: COLORS.azul, icon: 'bi-cash-stack' },
                        { label: 'Venta Total Stock', value: totales.totalVentaStock, sub: 'Precio de venta', color: COLORS.verde, icon: 'bi-graph-up-arrow' },
                        { label: 'Total Tasado Canje', value: totales.totalTasadoCanje, sub: `${totales.totalCanjeCantidad || 0} equipos`, color: COLORS.ambar, icon: 'bi-arrow-repeat' },
                        { label: 'Venta General', value: totales.totalVentaGeneral, sub: 'Stock + Canje', color: COLORS.azulOscuro, icon: 'bi-wallet2' }
                    ].map((k, i) => (
                        <Col xl={3} lg={6} md={6} key={i}>
                            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '12px', borderTop: `3px solid ${k.color}`, backgroundColor: COLORS.cardBg }}>
                                <Card.Body className="p-3">
                                    <small style={{ color: COLORS.textoSecundario }} className="d-block mb-1">{k.label}</small>
                                    <h4 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal }}>{formatoMoneda(k.value)}</h4>
                                    <small style={{ color: k.color }}>{k.sub}</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Layout 2 Columnas */}
                <Row className="g-4">

                    {/* Columna Izquierda: Tabla (Trazabilidad) */}
                    <Col xl={9} lg={8}>
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', backgroundColor: COLORS.cardBg }}>
                            <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0" style={{ color: COLORS.textoPrincipal }}>Inventario Actual</h6>
                                <small style={{ color: COLORS.textoSecundario }}>Mostrando {equipos.length} resultados</small>
                            </Card.Header>
                            <Card.Body className="p-0 mt-3">
                                {equipos.length === 0 ? (
                                    <div className="text-center py-5" style={{ color: COLORS.textoSecundario }}>
                                        <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                                        <p className="mt-3">No hay equipos con los filtros aplicados</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                            <thead style={{ backgroundColor: COLORS.bgGeneral }}>
                                                <tr>
                                                    {['Origen', 'Equipo', 'IMEI / Serie', 'Estado', 'Valor', 'Referencias', 'Disp.', 'Ingreso', ''].map(h => (
                                                        <th key={h} style={{ color: COLORS.textoSecundario, fontSize: '0.7rem', fontWeight: '600', padding: '12px', textTransform: 'uppercase' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {equipos.map(eq => (
                                                    <tr key={eq._id} style={{ borderBottom: `1px solid ${COLORS.bordes}`, opacity: eq.disponible ? 1 : 0.6 }}>
                                                        <td>{PillOrigen({ origen: eq.origen })}</td>
                                                        <td>
                                                            <div className="fw-semibold" style={{ color: COLORS.textoPrincipal }}>{eq.nombre}</div>
                                                            <small style={{ color: COLORS.textoSecundario }}>{eq.modelo || '-'} · {eq.color || '-'} · {eq.capacidad || '-'}</small>
                                                        </td>
                                                        <td style={{ color: COLORS.textoSecundario }}>
                                                            <div><small>IMEI:</small> {eq.imei || '-'}</div>
                                                            {eq.serie && <div><small>Serie:</small> {eq.serie}</div>}
                                                        </td>
                                                        <td>{PillEstado({ estado: eq.estado })}</td>
                                                        <td style={{ color: COLORS.textoSecundario }}>
                                                            {eq.origen === 'stock' ? (
                                                                <div><small>Venta:</small> <strong style={{ color: COLORS.verde }}>{formatoMoneda(eq.precioVenta)}</strong></div>
                                                            ) : (
                                                                <div><small>Tasado:</small> <strong>{formatoMoneda(eq.valorTasado)}</strong></div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-column gap-1">
                                                                {eq.ventaOrigen && (
                                                                    <Button variant="link" size="sm" className="p-0 text-start text-decoration-none" onClick={() => handleVerDetalle(eq, 'ventaOrigen')} style={{ color: COLORS.azul, fontSize: '0.75rem' }}>
                                                                        <i className="bi bi-arrow-left-circle me-1"></i>Vino de: {eq.ventaOrigen?.cliente?.nombre}
                                                                    </Button>
                                                                )}
                                                                {eq.ventaAsociada && (
                                                                    <Button variant="link" size="sm" className="p-0 text-start text-decoration-none" onClick={() => handleVerDetalle(eq, 'ventaAsociada')} style={{ color: COLORS.verde, fontSize: '0.75rem' }}>
                                                                        <i className="bi bi-receipt me-1"></i>Vendido a: {eq.ventaAsociada?.cliente?.nombre}
                                                                    </Button>
                                                                )}
                                                                {!eq.ventaOrigen && !eq.ventaAsociada && <span style={{ color: COLORS.textoSecundario }}>-</span>}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Pill bg={eq.disponible ? COLORS.verdeSuave : COLORS.bgGeneral} color={eq.disponible ? COLORS.verde : COLORS.textoSecundario}>
                                                                {eq.disponible ? 'Sí' : 'No'}
                                                            </Pill>
                                                        </td>
                                                        <td style={{ color: COLORS.textoSecundario, fontSize: '0.8rem' }}>{formatoFecha(eq.fechaIngreso)}</td>
                                                        <td>
                                                            <div className="d-flex gap-1 justify-content-end">
                                                                <Button variant="link" className="p-1" onClick={() => handleEditar(eq)} style={{ color: COLORS.azul }} title="Editar"><i className="bi bi-pencil"></i></Button>
                                                                {eq.notas && eq.notas.length > 0 && (
                                                                    <Button variant="link" className="p-1" onClick={() => handleVerNotas(eq)} style={{ color: COLORS.azul }} title="Notas"><i className="bi bi-chat-left-text"></i></Button>
                                                                )}
                                                                <Button variant="link" className="p-1" onClick={() => { setEquipoEliminar(eq); setShowDelete(true); }} style={{ color: COLORS.rojo }} title="Eliminar"><i className="bi bi-trash3"></i></Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Card.Body>
                            {hayMas && (
                                <Card.Footer className="bg-transparent border-0 text-center py-3">
                                    <Button onClick={handleCargarMas} variant="outline-primary" className="rounded-3 px-4" disabled={cargandoMas} style={{ borderColor: COLORS.azul, color: COLORS.azul }}>
                                        {cargandoMas ? <><Spinner size="sm" className="me-2" />Cargando...</> : <><i className="bi bi-arrow-down me-2"></i>Cargar más ({restantes})</>}
                                    </Button>
                                </Card.Footer>
                            )}
                        </Card>
                    </Col>

                    {/* Columna Derecha: Filtros y Acciones */}
                    <Col xl={3} lg={4}>

                        {/* Buscador y Filtros */}
                        <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '12px', backgroundColor: COLORS.cardBg }}>
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal }}>Buscador y Filtros</h6>

                                <Form.Group className="mb-3">
                                    <InputGroup>
                                        <InputGroup.Text style={{ backgroundColor: COLORS.bgGeneral, borderColor: COLORS.bordes }}>
                                            <i className="bi bi-search" style={{ color: COLORS.textoSecundario }}></i>
                                        </InputGroup.Text>
                                        <Form.Control placeholder="Buscar nombre, IMEI..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ borderColor: COLORS.bordes }} />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Select value={filtroOrigen} onChange={(e) => setFiltroOrigen(e.target.value)} className="rounded-3" style={{ borderColor: COLORS.bordes }}>
                                        <option value="todos">Origen: Todos</option>
                                        <option value="stock">Stock</option>
                                        <option value="canje">Canje</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="rounded-3" style={{ borderColor: COLORS.bordes }}>
                                        <option value="todos">Estado: Todos</option>
                                        {estadosEquipo.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-2">
                                    <Form.Select value={filtroDisponible} onChange={(e) => setFiltroDisponible(e.target.value)} className="rounded-3" style={{ borderColor: COLORS.bordes }}>
                                        <option value="todas">Disponibilidad: Todas</option>
                                        <option value="true">Disponibles</option>
                                        <option value="false">Vendidos</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Select value={filtroLocalidad} onChange={(e) => setFiltroLocalidad(e.target.value)} className="rounded-3" style={{ borderColor: COLORS.bordes }}>
                                        <option value="todas">Localidad: Todas</option>
                                        {localidades.map(loc => <option key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>)}
                                    </Form.Select>
                                </Form.Group>

                                <div className="d-flex gap-2">
                                    <Button onClick={handleBuscar} className="flex-grow-1 rounded-3" style={{ backgroundColor: COLORS.azulOscuro, borderColor: COLORS.azulOscuro, color: '#fff' }}>
                                        Filtrar
                                    </Button>
                                    <Button onClick={handleLimpiar} variant="outline-secondary" className="rounded-3" style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
                                        <i className="bi bi-eraser"></i>
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Acciones */}
                        <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '12px', backgroundColor: COLORS.cardBg }}>
                            <Card.Body className="p-4">
                                <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal }}>Acciones</h6>
                                <div className="d-flex flex-column gap-2">
                                    <Button onClick={() => handleCrear('stock')} className="rounded-3 w-100 text-start" style={{ backgroundColor: COLORS.azul, borderColor: COLORS.azul, color: '#fff', fontWeight: '500' }}>
                                        <i className="bi bi-plus-circle me-2"></i>Agregar Stock
                                    </Button>
                                    <Button onClick={() => handleCrear('canje')} className="rounded-3 w-100 text-start" style={{ backgroundColor: COLORS.ambar, borderColor: COLORS.ambar, color: '#fff', fontWeight: '500' }}>
                                        <i className="bi bi-arrow-repeat me-2"></i>Agregar Canje
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Tarjeta Oscura (Resumen rápido) */}
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', backgroundColor: COLORS.azulOscuro }}>
                            <Card.Body className="p-4">
                                <small className="text-uppercase fw-bold d-block mb-2" style={{ color: COLORS.azulSuave, letterSpacing: '1px', fontSize: '0.65rem' }}>
                                    Resumen del inventario
                                </small>
                                <div className="d-flex justify-content-between align-items-end mb-2">
                                    <h2 className="fw-bold mb-0 text-white">{totalEquipos}</h2>
                                    <small style={{ color: COLORS.azulSuave }}>equipos totales</small>
                                </div>
                                <div className="d-flex justify-content-between text-white small mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span><i className="bi bi-box-seam me-1"></i>{totales.totalStockCantidad || 0} Stock</span>
                                    <span><i className="bi bi-arrow-repeat me-1"></i>{totales.totalCanjeCantidad || 0} Canje</span>
                                </div>
                            </Card.Body>
                        </Card>

                    </Col>
                </Row>

                {/* --- MODALES (SIN CAMBIOS DE LÓGICA, SOLO PILLS) --- */}
                {/* Modal Crear/Editar (Continuación del código...) */}
                {/* MODAL CREAR/EDITAR (Stock y Canje) */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                    <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
                        <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
                            <i className={`bi ${equipoEditar ? 'bi-pencil' : tipoEquipo === 'canje' ? 'bi-arrow-repeat' : 'bi-plus-circle'} me-2`}
                                style={{ color: tipoEquipo === 'canje' ? COLORS.ambar : COLORS.azul }}></i>
                            {equipoEditar ? 'Editar Equipo' : tipoEquipo === 'canje' ? 'Nuevo Equipo de Canje' : 'Nuevo Equipo de Stock'}
                        </Modal.Title>
                    </Modal.Header>

                    <Form onSubmit={handleGuardar}>
                        <Modal.Body className="px-4 pt-3 pb-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                            {/* ==========================================
          SECCIÓN 1: DATOS DEL EQUIPO
          ========================================== */}
                            <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                                <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                                    <i className="bi bi-phone me-2"></i>Datos del Equipo
                                </h6>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Nombre <span className="text-danger">*</span></Form.Label>
                                        <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} className="rounded-3" placeholder="Ej: iPhone 13" disabled={saving} />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Modelo</Form.Label>
                                        <Form.Control name="modelo" value={formData.modelo} onChange={handleChange} className="rounded-3" placeholder="Ej: 13 pro max" disabled={saving} />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Capacidad</Form.Label>
                                        <Form.Control name="capacidad" value={formData.capacidad} onChange={handleChange} className="rounded-3" placeholder="Ej: 128GB" disabled={saving} />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>IMEI</Form.Label>
                                        <Form.Control name="imei" value={formData.imei} onChange={handleChange} className="rounded-3" placeholder="15 dígitos" disabled={saving} maxLength={15} />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Color</Form.Label>
                                        <Form.Control name="color" value={formData.color} onChange={handleChange} className="rounded-3" placeholder="Ej: Negro" disabled={saving} />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Batería</Form.Label>
                                        <Form.Control name="bateria" value={formData.bateria} onChange={handleChange} className="rounded-3" placeholder="Ej: 85%" disabled={saving} />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}><i className="bi bi-upc me-1"></i>Serie</Form.Label>
                                        <Form.Control name="serie" value={formData.serie} onChange={handleChange} className="rounded-3" placeholder="Ej: F2LXXXXX" disabled={saving} />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}><i className="bi bi-apple me-1"></i>iOS</Form.Label>
                                        <Form.Control name="ios" value={formData.ios} onChange={handleChange} className="rounded-3" placeholder="Ej: 17.5" disabled={saving} />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}><i className="bi bi-geo-alt me-1"></i>Localidad</Form.Label>
                                        <Form.Select name="localidad" value={formData.localidad} onChange={handleChange} className="rounded-3" disabled={saving}>
                                            <option value="">Seleccionar</option>
                                            {localidades.map(loc => <option key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>)}
                                        </Form.Select>
                                    </Col>
                                </Row>
                            </div>

                            {/* ==========================================
          SECCIÓN 2: ACCESORIOS
          ========================================== */}
                            <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                                <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                                    <i className="bi bi-bag me-2"></i>Accesorios
                                    <Pill bg={COLORS.azul} color="#fff" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>{formData.accesorios.length}</Pill>
                                </h6>

                                <Row className="g-2 mb-3">
                                    <Col md={8}>
                                        <InputGroup>
                                            <Form.Control type="text" value={nuevoAccesorio} onChange={(e) => setNuevoAccesorio(e.target.value)}
                                                onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAgregarAccesorio(); } }}
                                                placeholder="Ej: Cargador original..." disabled={saving} />
                                            <Button variant="outline-primary" onClick={handleAgregarAccesorio} disabled={saving || !nuevoAccesorio.trim()}
                                                style={{ borderColor: COLORS.azul, color: COLORS.azul }}>
                                                <i className="bi bi-plus-lg"></i>
                                            </Button>
                                        </InputGroup>
                                    </Col>
                                </Row>

                                <div className="mb-3">
                                    <small style={{ color: COLORS.textoSecundario, fontSize: '0.75rem' }} className="d-block mb-2">
                                        <i className="bi bi-lightning me-1"></i>Sugerencias rápidas:
                                    </small>
                                    <div className="d-flex flex-wrap gap-1">
                                        {accesoriosSugeridos.filter(acc => !formData.accesorios.includes(acc)).map(acc => (
                                            <span key={acc} onClick={() => !saving && handleAgregarAccesorioSugerido(acc)}
                                                style={{ cursor: 'pointer', backgroundColor: COLORS.cardBg, color: COLORS.textoSecundario, border: `1px solid ${COLORS.bordes}`, fontSize: '0.7rem', padding: '0.3em 0.7em', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', transition: 'all 0.2s' }}>
                                                <i className="bi bi-plus-circle me-1"></i>{acc}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {formData.accesorios.length > 0 && (
                                    <div className="mt-2">
                                        {formData.accesorios.map((acc, idx) => (
                                            <div key={idx} className="d-flex justify-content-between align-items-center p-2 mb-1 rounded-3" style={{ backgroundColor: COLORS.cardBg }}>
                                                <span style={{ fontSize: '0.85rem', color: COLORS.textoPrincipal }}>
                                                    <i className="bi bi-check-circle me-2" style={{ color: COLORS.verde }}></i>{acc}
                                                </span>
                                                <Button variant="link" className="p-0" style={{ color: COLORS.rojo }} onClick={() => handleEliminarAccesorio(idx)} disabled={saving}>
                                                    <i className="bi bi-trash3"></i>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ==========================================
          SECCIÓN 3: ESTADO Y PRECIOS
          ========================================== */}
                            <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                                <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.ambar }}>
                                    <i className="bi bi-tag me-2"></i>Estado y {tipoEquipo === 'canje' ? 'Valor Tasado' : 'Precios'}
                                </h6>
                                <Row className="g-3">
                                    <Col md={4}>
                                        <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Estado</Form.Label>
                                        <Form.Select name="estado" value={formData.estado} onChange={handleChange} className="rounded-3" disabled={saving}>
                                            {estadosEquipo.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                                        </Form.Select>
                                    </Col>

                                    {tipoEquipo === 'stock' ? (
                                        <>
                                            <Col md={4}>
                                                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Precio Compra</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.bordes }}>$</InputGroup.Text>
                                                    <Form.Control type="number" name="precioCompra" value={formData.precioCompra} onChange={handleChange} className="rounded-end-3" disabled={saving} min={0} step={100} />
                                                </InputGroup>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Precio Venta <span className="text-danger">*</span></Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.bordes }}>$</InputGroup.Text>
                                                    <Form.Control type="number" name="precioVenta" value={formData.precioVenta} onChange={handleChange} className="rounded-end-3" disabled={saving} min={0} step={100} />
                                                </InputGroup>
                                            </Col>
                                        </>
                                    ) : (
                                        <Col md={4}>
                                            <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Valor Tasado <span className="text-danger">*</span></Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.bordes }}>$</InputGroup.Text>
                                                <Form.Control type="number" name="valorTasado" value={formData.valorTasado} onChange={handleChange} className="rounded-end-3" disabled={saving} min={0} step={100} />
                                            </InputGroup>
                                        </Col>
                                    )}

                                    {equipoEditar && (
                                        <Col md={4}>
                                            <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Disponibilidad</Form.Label>
                                            <Form.Select name="disponible" value={formData.disponible}
                                                onChange={(e) => setFormData(prev => ({ ...prev, disponible: e.target.value === 'true' }))}
                                                className="rounded-3" disabled={saving}>
                                                <option value="true">Disponible</option>
                                                <option value="false">Vendido</option>
                                            </Form.Select>
                                        </Col>
                                    )}
                                </Row>
                            </div>

                            {/* ==========================================
          SECCIÓN 4: PROVEEDOR (Solo Stock)
          ========================================== */}
                            {tipoEquipo === 'stock' && (
                                <div className="rounded-3 p-3 mb-2" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                                    <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.textoSecundario }}>
                                        <i className="bi bi-truck me-2"></i>Proveedor
                                        <Pill bg={COLORS.bgGeneral} color={COLORS.textoSecundario} border={COLORS.bordes} style={{ marginLeft: '6px', fontSize: '0.65rem' }}>Opcional</Pill>
                                    </h6>
                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Nombre</Form.Label>
                                            <Form.Control name="proveedor.nombre" value={formData.proveedor.nombre} onChange={handleChange} className="rounded-3" placeholder="Nombre del proveedor" disabled={saving} />
                                        </Col>
                                        <Col md={6}>
                                            <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Teléfono</Form.Label>
                                            <Form.Control name="proveedor.telefono" value={formData.proveedor.telefono} onChange={handleChange} className="rounded-3" placeholder="Teléfono del proveedor" disabled={saving} />
                                        </Col>

                                    </Row>
                                </div>
                            )}

                        </Modal.Body>

                        <Modal.Footer className="border-0 px-4 pb-4 pt-2">
                            <Button variant="outline-secondary" onClick={() => setShowModal(false)} className="rounded-3" disabled={saving} style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="rounded-3 px-4"
                                style={{ backgroundColor: tipoEquipo === 'canje' ? COLORS.ambar : COLORS.azul, borderColor: tipoEquipo === 'canje' ? COLORS.ambar : COLORS.azul, color: '#fff', fontWeight: '600' }} disabled={saving}>
                                {saving ? <><Spinner size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-check-circle me-2"></i>Guardar Equipo</>}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                {/* ... (Los modales de eliminar, detalle y notas van igual, reutilizando Pills) ... */}

                {/* MODAL DETALLE VENTA (Rediseñado) */}
                <Modal show={showDetalleModal} onHide={() => setShowDetalleModal(false)} size="lg" centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
                            <i className={`bi ${tipoDetalle === 'ventaAsociada' ? 'bi-receipt' : 'bi-arrow-left-circle'} me-2`}
                                style={{ color: tipoDetalle === 'ventaAsociada' ? COLORS.verde : COLORS.azul }}></i>
                            {tipoDetalle === 'ventaAsociada' ? 'Venta Asociada' : 'Venta de Origen'}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="pt-3">
                        {equipoContexto && (
                            <div className="rounded-3 p-3 mb-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                                <div>
                                    <span className="fw-semibold" style={{ color: COLORS.textoPrincipal }}>{equipoContexto.nombre} {equipoContexto.modelo}</span>
                                    <div className="small mt-1" style={{ color: COLORS.textoSecundario }}>IMEI: {equipoContexto.imei || '-'} · Serie: {equipoContexto.serie || '-'}</div>
                                </div>
                                <div>
                                    <Pill bg={equipoContexto.origen === 'canje' ? COLORS.ambarSuave : COLORS.azulSuave}
                                        color={equipoContexto.origen === 'canje' ? COLORS.ambar : COLORS.azul}>
                                        {equipoContexto.origen}
                                    </Pill>
                                </div>
                            </div>
                        )}

                        {detalleData ? (
                            <Row className="g-3">
                                {/* Bloque Cliente */}
                                <Col md={12}>
                                    <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                                        <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                                            <i className="bi bi-person me-2"></i>Cliente y Venta
                                        </h6>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Cliente</small>
                                                <span className="fw-semibold" style={{ color: COLORS.textoPrincipal }}>{detalleData.cliente?.nombre} {detalleData.cliente?.apellido}</span>
                                                <div className="small" style={{ color: COLORS.textoSecundario }}>DNI: {detalleData.cliente?.dni || 'N/A'}</div>
                                            </Col>
                                            <Col md={3}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Tipo de Venta</small>
                                                <Pill bg={COLORS.azulSuave} color={COLORS.azul}>{detalleData.tipoVenta || 'N/A'}</Pill>
                                            </Col>
                                            <Col md={3}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Fecha</small>
                                                <span style={{ color: COLORS.textoPrincipal }}>{formatoFecha(detalleData.fechaRealizada)}</span>
                                            </Col>
                                            <Col md={4}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Localidad</small>
                                                <span style={{ color: COLORS.textoPrincipal }}>{detalleData.localidad || 'N/A'}</span>
                                            </Col>
                                            <Col md={4}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Vendedor</small>
                                                <span style={{ color: COLORS.textoPrincipal }}>{detalleData.vendedor || 'N/A'}</span>
                                            </Col>
                                            <Col md={4}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Conducta</small>
                                                <PillConducta conducta={detalleData.conducta_pago} />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>

                                {/* Bloque Producto */}
                                <Col md={12}>
                                    <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                                        <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                                            <i className="bi bi-phone me-2"></i>Producto Entregado
                                        </h6>
                                        <Row className="g-3">
                                            <Col md={4}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Nombre</small>
                                                <span className="fw-semibold" style={{ color: COLORS.textoPrincipal }}>{detalleData.producto?.nombre || 'N/A'}</span>
                                            </Col>
                                            <Col md={4}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Modelo</small>
                                                <span style={{ color: COLORS.textoPrincipal }}>{detalleData.producto?.modelo || 'N/A'}</span>
                                            </Col>
                                            <Col md={4}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">IMEI</small>
                                                <span style={{ color: COLORS.textoPrincipal }}>{detalleData.producto?.imei || 'N/A'}</span>
                                            </Col>
                                            <Col md={4}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Estado</small>
                                                <Pill bg={COLORS.bgGeneral} color={COLORS.textoPrincipal} border={COLORS.bordes}>{detalleData.producto?.estado || 'N/A'}</Pill>
                                            </Col>
                                            <Col md={4}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Valor</small>
                                                <span className="fw-bold" style={{ color: COLORS.verde }}>{formatoMoneda(detalleData.producto?.valor)}</span>
                                            </Col>
                                            <Col md={4}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Batería</small>
                                                <span style={{ color: COLORS.textoPrincipal }}>{detalleData.producto?.bateria || 'N/A'}</span>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>

                                {/* Bloque Montos y Resumen de Cuotas */}
                                <Col md={12}>
                                    <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                                        <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                                            <i className="bi bi-wallet2 me-2"></i>Resumen Financiero
                                        </h6>
                                        <Row className="g-3 align-items-center">
                                            <Col md={3}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Monto Total</small>
                                                <span className="fw-bold" style={{ color: COLORS.verde }}>{formatoMoneda(detalleData.montoTotal)}</span>
                                            </Col>
                                            <Col md={3}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Pagado</small>
                                                <span style={{ color: COLORS.textoPrincipal }}>{formatoMoneda(detalleData.montoPagado)}</span>
                                            </Col>
                                            <Col md={3}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Saldo Pendiente</small>
                                                <span style={{ color: COLORS.rojo }}>{formatoMoneda((detalleData.montoTotal || 0) - (detalleData.montoPagado || 0))}</span>
                                            </Col>
                                            <Col md={3}>
                                                <small style={{ color: COLORS.textoSecundario }} className="d-block">Pagos Registrados</small>
                                                <span className="fw-semibold" style={{ color: COLORS.textoPrincipal }}>{detalleData.pagos?.length || 0} pagos</span>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>

                                {/* Bloque Lista de Pagos */}
                                {detalleData.pagos && detalleData.pagos.length > 0 && (
                                    <Col md={12}>
                                        <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                                            <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                                                <i className="bi bi-credit-card me-2"></i>Pagos Realizados
                                            </h6>
                                            <div className="d-flex flex-column gap-2">
                                                {detalleData.pagos.map((pago, idx) => (
                                                    <div key={idx} className="d-flex justify-content-between align-items-center p-2 rounded-2" style={{ backgroundColor: COLORS.cardBg }}>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Pill bg={COLORS.bgGeneral} color={COLORS.textoSecundario} border={COLORS.bordes} icon="calendar">{formatoFecha(pago.fecha)}</Pill>
                                                            <span className="small fw-semibold" style={{ color: COLORS.textoPrincipal }}>{pago.metodo}</span>
                                                        </div>
                                                        <strong style={{ color: COLORS.verde }}>{formatoMoneda(pago.monto)}</strong>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Col>
                                )}

                                {/* Bloque Tabla de Cuotas */}
                                {detalleData.cuotas && detalleData.cuotas.length > 0 && (
                                    <Col md={12}>
                                        <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                                            <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                                                <i className="bi bi-calendar3 me-2"></i>Cuotas ({detalleData.cuotas.length})
                                            </h6>
                                            <div className="table-responsive">
                                                <Table size="sm" className="mb-0 align-middle" style={{ fontSize: '0.8rem' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ color: COLORS.textoSecundario }}>#</th>
                                                            <th style={{ color: COLORS.textoSecundario }}>Monto</th>
                                                            <th style={{ color: COLORS.textoSecundario }}>Pagado</th>
                                                            <th style={{ color: COLORS.textoSecundario }}>Estado</th>
                                                            <th style={{ color: COLORS.textoSecundario }}>Fecha</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {detalleData.cuotas.map((c, idx) => {
                                                            const estadoConfig = {
                                                                'pagada': { bg: COLORS.verdeSuave, color: COLORS.verde },
                                                                'pago parcial': { bg: COLORS.ambarSuave, color: COLORS.ambar },
                                                                'no pagada': { bg: COLORS.rojoSuave, color: COLORS.rojo },
                                                                'pendiente': { bg: COLORS.bgGeneral, color: COLORS.textoSecundario }
                                                            }[c.estado_cuota] || { bg: COLORS.bgGeneral, color: COLORS.textoSecundario };

                                                            return (
                                                                <tr key={idx}>
                                                                    <td className="fw-semibold">{c.numeroCuota || idx + 1}</td>
                                                                    <td>{formatoMoneda(c.montoCuota)}</td>
                                                                    <td>{formatoMoneda(c.montoPagado)}</td>
                                                                    <td>
                                                                        <Pill bg={estadoConfig.bg} color={estadoConfig.color}>
                                                                            {c.estado_cuota || 'pendiente'}
                                                                        </Pill>
                                                                    </td>
                                                                    <td>{formatoFecha(c.fechaCobro || c.fechaCobrada)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        ) : (
                            <div className="text-center py-4" style={{ color: COLORS.textoSecundario }}>
                                <i className="bi bi-info-circle" style={{ fontSize: '2rem' }}></i>
                                <p className="mt-2">No hay información disponible</p>
                            </div>
                        )}
                    </Modal.Body>

                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="outline-secondary" onClick={() => setShowDetalleModal(false)} className="rounded-3" style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* MODAL ELIMINAR */}
                <Modal show={showDelete} onHide={() => setShowDelete(false)} size="sm" centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold" style={{ color: COLORS.rojo }}>
                            <i className="bi bi-exclamation-triangle me-2"></i>Eliminar Equipo
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p style={{ color: COLORS.textoPrincipal }}>¿Estás seguro de eliminar <strong>{equipoEliminar?.nombre}</strong>?</p>
                        <p className="small" style={{ color: COLORS.textoSecundario }}>Esta acción no se puede deshacer.</p>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="secondary" onClick={() => setShowDelete(false)} className="rounded-3" disabled={saving}>Cancelar</Button>
                        <Button onClick={handleEliminar} className="rounded-3" disabled={saving} style={{ backgroundColor: COLORS.rojo, borderColor: COLORS.rojo }}>
                            {saving ? <Spinner size="sm" /> : 'Eliminar'}
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* MODAL NOTAS */}
                <Modal show={showNotasModal} onHide={() => setShowNotasModal(false)} size="lg" centered>
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
                            <i className="bi bi-chat-left-text me-2" style={{ color: COLORS.azul }}></i>Notas del Equipo
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {equipoNotas && (
                            <>
                                <div className="mb-4">
                                    <div className="fw-bold" style={{ fontSize: '1.1rem', color: COLORS.textoPrincipal }}>{equipoNotas.nombre} {equipoNotas.modelo}</div>
                                    <div className="d-flex gap-2 mt-1">
                                        <PillOrigen origen={equipoNotas.origen} />
                                        <Pill bg={COLORS.bgGeneral} color={COLORS.textoSecundario} border={COLORS.bordes} icon="chat-left-text">
                                            {equipoNotas.notas?.length || 0} notas
                                        </Pill>
                                    </div>
                                </div>
                                {equipoNotas.notas && equipoNotas.notas.length > 0 ? (
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {equipoNotas.notas.map((nota, idx) => (
                                            <div key={idx} className="rounded-3 p-3 mb-2" style={{
                                                backgroundColor: nota.tipo === 'importante' ? COLORS.rojoSuave : nota.tipo === 'mantenimiento' ? COLORS.ambarSuave : nota.tipo === 'reparacion' ? COLORS.azulSuave : COLORS.bgGeneral,
                                                border: `1px solid ${COLORS.bordes}`
                                            }}>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <PillNota tipo={nota.tipo} />
                                                    <small style={{ color: COLORS.textoSecundario }}><i className="bi bi-calendar me-1"></i>{nota.fechaFormateada || formatoFecha(nota.fecha)}</small>
                                                </div>
                                                <p className="mb-1" style={{ color: COLORS.textoPrincipal, fontSize: '0.9rem' }}>{nota.texto}</p>
                                                <small style={{ color: COLORS.textoSecundario }}><i className="bi bi-person me-1"></i>{nota.usuario?.nombre || 'Sistema'}</small>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="bi bi-chat-square-text" style={{ fontSize: '3rem', color: COLORS.textoSecundario }}></i>
                                        <p className="mt-2" style={{ color: COLORS.textoSecundario }}>No hay notas para este equipo</p>
                                    </div>
                                )}
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="secondary" onClick={() => setShowNotasModal(false)} className="rounded-3">Cerrar</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};