// Ventas/Componentes/FormularioVentaV2.jsx
import React, { useState } from 'react';
import { Card, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { COLORS } from '../../Cobranza/Helperss/colors';
import { WizardStepper } from './WizardStepper';
import { Paso1Configuracion } from './Pasos/Paso1Configuracion';
import { Paso2Producto } from './Pasos/Paso2Producto';
import { Paso3Financiacion } from './Pasos/Paso3Financiacion';
import { Paso4GaranteNotas } from './Pasos/Paso4GaranteNotas';
import { ResumenVenta } from './ResumenVenta';

const calcularMontoTotal = (f) => {
    const totalDesc = f.descuentos.reduce((s, d) => s + (parseFloat(d.monto) || 0), 0);
    const valorProd = parseFloat(f.producto.valor) || 0;
    const valorCanje = parseFloat(f.equipoCanje.valorTasado) || 0;
    const totalCuotas = (parseFloat(f.montoCuota) || 0) * (parseInt(f.cantidadCuotas) || 0);

    if (f.tipoVenta === 'sistema2') return totalCuotas - totalDesc;
    if (f.tipoVenta === 'plan_canje_cuotas') return totalCuotas + valorCanje - totalDesc;
    return valorProd - totalDesc;
};

export const FormularioVentaV2 = ({ clienteData, onSubmit, isLoading, vendedor, onVolver }) => {
    const [paso, setPaso] = useState(0);
    const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });
    const [formData, setFormData] = useState({
        tipoVenta: 'contado',
        localidad: '',
        fechaRealizada: new Date().toISOString().split('T')[0],
        fechaEntrega: '',
        producto: { nombre: '', modelo: '', bateria: '', color: '', imei: '', estado: 'sellado', valor: 0 },
        pagos: [{ monto: 0, metodo: 'efectivo', notas: [] }],
        requiereGarante: false,
        garante: { nombre: '', apellido: '', dni: '', cuil: '', telefono: '', telefono2: '', email: '', direccion: '', relacion: '', ocupacion: '', localidad: '' },
        montoCuota: 0, cantidadCuotas: 0, cuotaEntrega: 0, frecuencia: 'mensual',
        equipoCanje: { nombre: '', modelo: '', imei: '', color: '', bateria: '', estado: 'bueno', valorTasado: 0 },
        descuentos: [], notas: [], vendedor: vendedor || ''
    });

    const pasos = [
        { label: 'Configuración' },
        { label: 'Producto' },
        { label: 'Financiación' },
        { label: 'Garante y Notas' }
    ];

    const showAlert = (message, variant = 'danger') => {
        if (!message) return setAlert({ show: false, message: '', variant: 'danger' });
        setAlert({ show: true, message, variant });
        setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
    };

    // Validar antes de avanzar
    const validarPaso = () => {
        if (paso === 0) {
            if (!formData.tipoVenta) return 'Seleccioná un tipo de venta';
            if (!formData.localidad) return 'Seleccioná una localidad';
            if (!formData.fechaRealizada) return 'La fecha de la venta es obligatoria';
        }
        if (paso === 1) {
            if (!formData.producto.nombre.trim()) return 'Ingresá el nombre del producto';
            if (!formData.producto.valor || parseFloat(formData.producto.valor) <= 0) return 'El valor del producto debe ser mayor a 0';
            if (['plan_canje', 'plan_canje_cuotas'].includes(formData.tipoVenta)) {
                if (!formData.equipoCanje.nombre.trim()) return 'El nombre del equipo a canjear es obligatorio';
                if (!formData.equipoCanje.valorTasado || parseFloat(formData.equipoCanje.valorTasado) <= 0) return 'El valor tasado del canje debe ser mayor a 0';
            }
        }
        if (paso === 2) {
            if (['contado'].includes(formData.tipoVenta)) {
                const pagosValidos = formData.pagos.filter(p => p.monto > 0 && p.metodo);
                if (pagosValidos.length === 0) return 'Venta al contado requiere al menos un pago';
            }
            if (['sistema1', 'sistema2', 'plan_canje_cuotas'].includes(formData.tipoVenta)) {
                if (!formData.montoCuota || parseFloat(formData.montoCuota) <= 0) return 'El monto por cuota debe ser mayor a 0';
                if (!formData.cantidadCuotas || parseInt(formData.cantidadCuotas) <= 0) return 'La cantidad de cuotas debe ser mayor a 0';
            }
            if (formData.tipoVenta === 'sistema2') {
                if (!formData.cuotaEntrega || parseInt(formData.cuotaEntrega) <= 0) return 'Seleccioná la cuota de entrega';
            }
        }
        if (paso === 3) {
            const garanteObligatorio = formData.tipoVenta === 'sistema1';
            if (garanteObligatorio || formData.requiereGarante) {
                const g = formData.garante;
                if (!g.nombre.trim() || !g.apellido.trim() || !g.dni.trim() || !g.telefono.trim() || !g.direccion.trim()) {
                    return 'Completá los datos básicos del garante';
                }
                if (!g.relacion.trim() || !g.ocupacion.trim()) return 'Completá relación y ocupación del garante';
            }
        }
        return null;
    };

    const handleNext = () => {
        const error = validarPaso();
        if (error) return showAlert(error, 'warning');
        setPaso(p => Math.min(p + 1, pasos.length - 1));
    };

    const handlePrev = () => setPaso(p => Math.max(p - 1, 0));

    // En FormularioVentaV2.jsx, reemplazá el handleSubmit actual por este:

    const handleSubmit = async () => {
        const error = validarPaso();
        if (error) return showAlert(error, 'warning');

        try {
            // ==========================================
            // 🛠️ ARMAMOS EL PAYLOAD EXACTO QUE ESPERA EL BACKEND
            // ==========================================

            // 1. Pagos válidos (solo los que tienen monto > 0)
            const pagosValidos = formData.pagos
                .filter(p => p.monto > 0 && p.metodo)
                .map(p => ({ monto: parseFloat(p.monto), metodo: p.metodo, notas: [] }));

            // 2. Datos del garante (si aplica)
            const incluirGarante = formData.tipoVenta === 'sistema1' || formData.requiereGarante;
            const datosGarante = incluirGarante ? {
                nombre: formData.garante.nombre.trim(),
                apellido: formData.garante.apellido.trim(),
                dni: formData.garante.dni.trim(),
                cuil: formData.garante.cuil.trim() || '',
                telefono: formData.garante.telefono.trim(),
                telefono2: formData.garante.telefono2.trim() || '',
                email: formData.garante.email.trim() || '',
                direccion: formData.garante.direccion.trim(),
                relacion: formData.garante.relacion.trim(),
                ocupacion: formData.garante.ocupacion.trim(),
                localidad: formData.garante.localidad || ''
            } : {};

            // 3. Equipo de canje (si aplica)
            const esPlanCanje = ['plan_canje', 'plan_canje_cuotas'].includes(formData.tipoVenta);
            const datosEquipoCanje = esPlanCanje ? {
                nombre: formData.equipoCanje.nombre.trim(),
                modelo: formData.equipoCanje.modelo.trim() || '',
                imei: formData.equipoCanje.imei.trim() || '',
                color: formData.equipoCanje.color.trim() || '',
                bateria: formData.equipoCanje.bateria.trim() || '',
                estado: formData.equipoCanje.estado || 'bueno',
                valorTasado: parseFloat(formData.equipoCanje.valorTasado)
            } : {};

            // 4. Equipo seleccionado (si viene del stock)
            // Nota: Si el usuario seleccionó un equipo del stock, necesitamos su ID.
            // Como en el V2 no guardamos el equipoSeleccionado en el formData, 
            // tendríamos que agregarlo. Asumo que lo agregaste, si no, avisame.
            const equipoSeleccionadoPayload = formData.equipoSeleccionado ? {
                _id: formData.equipoSeleccionado._id,
                origen: formData.equipoSeleccionado.origen
            } : null;

            // 5. Construimos el payload final
            const payload = {
                tipoVenta: formData.tipoVenta,
                localidad: formData.localidad,
                fechaRealizada: formData.fechaRealizada || new Date().toISOString().split('T')[0],
                fechaEntrega: formData.fechaEntrega || null,
                vendedor: formData.vendedor || '',

                // 👇 ACÁ ESTÁ LA CLAVE: El objeto cliente que el backend no encontraba
                cliente: {
                    nombre: clienteData.nombre,
                    apellido: clienteData.apellido,
                    dni: clienteData.dni,
                    telefono: clienteData.telefono || '',
                    telefono2: clienteData.telefono2 || '',
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

                pagos: pagosValidos,
                requiereGarante: incluirGarante,
                garante: datosGarante,
                montoCuota: parseFloat(formData.montoCuota) || 0,
                cantidadCuotas: parseInt(formData.cantidadCuotas) || 0,
                cuotaEntrega: parseInt(formData.cuotaEntrega) || 0,
                frecuencia: formData.frecuencia || 'mensual',
                equipoCanje: datosEquipoCanje,
                equipoSeleccionado: equipoSeleccionadoPayload, // Para que el backend marque el equipo como vendido
                descuentos: formData.descuentos,
                notas: formData.notas
            };

            await onSubmit(payload);
        } catch (e) {
            showAlert(e.message || 'Error al crear la venta', 'danger');
        }
    };

    return (
        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', backgroundColor: COLORS.cardBg }}>
            <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                    <h4 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal }}>
                        <i className="bi bi-cart-plus me-2" style={{ color: COLORS.azul }}></i>Nueva Venta
                    </h4>
                    <p className="small mb-0" style={{ color: COLORS.textoSecundario }}>
                        Cliente: {clienteData?.nombre} {clienteData?.apellido} · DNI: {clienteData?.dni}
                    </p>
                </div>

                <WizardStepper pasos={pasos} pasoActual={paso} />

                {alert.show && (
                    <Alert variant={alert.variant} className="rounded-3 border-0" dismissible onClose={() => showAlert('')}
                        style={{
                            backgroundColor: alert.variant === 'warning' ? COLORS.ambarSuave : COLORS.rojoSuave,
                            color: alert.variant === 'warning' ? COLORS.ambar : COLORS.rojo
                        }}>
                        {alert.message}
                    </Alert>
                )}

                <Row className="g-4">
                    <Col lg={8}>
                        {paso === 0 && <Paso1Configuracion formData={formData} setFormData={setFormData} isLoading={isLoading} />}
                        {paso === 1 && <Paso2Producto formData={formData} setFormData={setFormData} isLoading={isLoading} />}
                        {paso === 2 && <Paso3Financiacion formData={formData} setFormData={setFormData} isLoading={isLoading} />}
                        {paso === 3 && <Paso4GaranteNotas formData={formData} setFormData={setFormData} isLoading={isLoading} vendedor={vendedor} />}
                    </Col>
                    <Col lg={4}>
                        <ResumenVenta formData={formData} clienteData={clienteData} calcularMontoTotal={calcularMontoTotal} />
                    </Col>
                </Row>

                <div className="d-flex justify-content-between mt-4 pt-4" style={{ borderTop: `1px solid ${COLORS.bordes}` }}>
                    <Button variant="outline-secondary" className="rounded-3" onClick={paso === 0 ? onVolver : handlePrev} disabled={isLoading}>
                        <i className="bi bi-arrow-left me-1"></i> {paso === 0 ? 'Volver' : 'Atrás'}
                    </Button>
                    {paso < pasos.length - 1 ? (
                        <Button onClick={handleNext} className="rounded-3 px-4" style={{ backgroundColor: COLORS.azulOscuro, borderColor: COLORS.azulOscuro }} disabled={isLoading}>
                            Siguiente <i className="bi bi-arrow-right ms-1"></i>
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} className="rounded-3 px-4" style={{ backgroundColor: COLORS.verde, borderColor: COLORS.verde }} disabled={isLoading}>
                            {isLoading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Procesando...</> : <><i className="bi bi-check-circle me-1"></i> Confirmar Venta</>}
                        </Button>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};