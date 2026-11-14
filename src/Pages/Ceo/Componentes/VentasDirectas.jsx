// src/Pages/Ceo/Componentes/reportes/VentasDirectas.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Button, Spinner, Alert, Modal, Table, Form } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
} from 'chart.js';
import { obtenerVentasDirectasCanje } from '../Helpers/ReportesMensuales';
import { COLORS } from '../../Cobranza/Helperss/colors'; // Ajustá la ruta si es necesario

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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

// Plugin para mostrar el porcentaje arriba de las barras
const chartPercentagePlugin = {
  id: 'chartPercentage',
  afterDatasetsDraw(chart) {
    const { ctx, data } = chart;
    ctx.save();
    chart.getDatasetMeta(0).data.forEach((bar, index) => {
      const meta1 = chart.getDatasetMeta(0).data[index];
      const meta2 = chart.getDatasetMeta(1).data[index];
      
      const facturado = data.datasets[0].data[index];
      const cobrado = data.datasets[1].data[index];
      
      if (facturado > 0) {
        const porcentaje = ((cobrado / facturado) * 100).toFixed(1);
        const color = porcentaje >= 90 ? COLORS.verde : porcentaje >= 50 ? COLORS.ambar : COLORS.rojo;
        const maxY = Math.min(meta1.y, meta2.y) - 10; 
        
        ctx.fillStyle = color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${porcentaje}%`, meta1.x, maxY);
      }
    });
    ctx.restore();
  }
};

const formatoMoneda = (v) => !v && v !== 0 ? '$0' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
const formatoFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const metodosPagoConfig = {
    efectivo: { icon: 'cash', color: COLORS.verde, label: 'Efectivo' },
    transferencia: { icon: 'bank', color: COLORS.azul, label: 'Transferencia' },
    dolares: { icon: 'currency-dollar', color: COLORS.azulOscuro, label: 'Dólares' },
    cripto: { icon: 'currency-bitcoin', color: COLORS.ambar, label: 'Criptomonedas' },
    tarjeta_credito: { icon: 'credit-card', color: COLORS.rojo, label: 'Tarjeta' },
    otro: { icon: 'wallet2', color: COLORS.textoSecundario, label: 'Otro' }
};

export const VentasDirectas = () => {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [datos, setDatos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showModalMes, setShowModalMes] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState(null);
  const [ventasDelMes, setVentasDelMes] = useState([]);
  const [showModalVenta, setShowModalVenta] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);

  const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    cargarDatos();
  }, [anio]);

  const cargarDatos = async () => {
    setIsLoading(true);
    setError('');
    try {
      const resp = await obtenerVentasDirectasCanje(anio);
      setDatos(resp.data);
    } catch (err) {
      setError(err.message || 'Error al cargar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerMes = (mes) => {
    setMesSeleccionado(mes);
    const ventasFiltradas = datos.ventas.filter(venta => {
      const fecha = new Date(venta.fechaRealizada);
      return fecha.getMonth() + 1 === mes.mes;
    });
    setVentasDelMes(ventasFiltradas);
    setShowModalMes(true);
  };

  const handleVerVenta = (venta) => {
    setVentaDetalle(venta);
    setShowModalVenta(true);
  };

  // Filtramos para mostrar los últimos 6 meses en el gráfico
  const datosGrafico = useMemo(() => {
    if (!datos) return [];
    return datos.resumenAnual.slice(6, 12); 
  }, [datos]);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: COLORS.azul }} />
        <p className="mt-3" style={{ color: COLORS.textoSecundario }}>Cargando reporte...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
        <i className="bi bi-exclamation-triangle me-2"></i>{error}
        <button onClick={cargarDatos} className="btn btn-link btn-sm ms-3" style={{ color: COLORS.rojo }}>Reintentar</button>
      </Alert>
    );
  }

  if (!datos) return null;

  const chartData = {
    labels: datosGrafico.map(m => m.nombre),
    datasets: [
      {
        label: 'Facturado',
        data: datosGrafico.map(m => m.totalVentas),
        backgroundColor: '#DCE3E9',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.5
      },
      {
        label: 'Cobrado',
        data: datosGrafico.map(m => m.totalCobrado),
        backgroundColor: '#172936',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { size: 12 }, color: COLORS.textoSecundario }
      },
      tooltip: { callbacks: { label: (context) => ` ${context.dataset.label}: ${formatoMoneda(context.raw)}` } }
    },
    scales: {
      y: { beginAtZero: true, display: false, grid: { display: false } },
      x: { grid: { display: false }, ticks: { color: COLORS.textoPrincipal, font: { size: 12, weight: '600' } } }
    },
    layout: { padding: { top: 30 } }
  };

  const metodosPagoResumen = datos.resumen.totales.metodosPago || {};

  return (
    <div style={{ backgroundColor: COLORS.bgGeneral, minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div>
            <small style={{ color: COLORS.textoSecundario, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Comercial · Ventas Directas y Canjes
            </small>
            <h2 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal, fontSize: '2rem' }}>Flujo de Caja</h2>
            <p style={{ color: COLORS.textoSecundario, fontSize: '0.9rem', maxWidth: '600px' }} className="mb-0">
              Resumen de facturación y cobros inmediatos. Incluye ventas al contado y planes de canje (sin financiación a plazos).
            </p>
          </div>
          <div className="text-end">
            <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Período</Form.Label>
            <Form.Select 
              value={anio} 
              onChange={(e) => setAnio(parseInt(e.target.value))} 
              className="rounded-3 border-0 shadow-sm"
              style={{ width: '200px', fontWeight: '600' }}
            >
              {anios.map(a => <option key={a} value={a}>Año {a}</option>)}
            </Form.Select>
          </div>
        </div>

        {/* KPIs SUPERIORES */}
        <Row className="g-3 mb-4">
          <Col xl={3} lg={6} md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <small style={{ color: COLORS.textoSecundario, fontWeight: '600' }}>Total Ventas Anuales</small>
                <h3 className="fw-bold mb-1 mt-2" style={{ color: COLORS.azul }}>{datos.totalesAnuales.cantidadVentas}</h3>
                <small style={{ color: COLORS.textoSecundario }}>Contado: {datos.totalesAnuales.contado.cantidad} | Canje: {datos.totalesAnuales.plan_canje.cantidad}</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6} md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <small style={{ color: COLORS.textoSecundario, fontWeight: '600' }}>Total Facturado</small>
                <h3 className="fw-bold mb-1 mt-2" style={{ color: COLORS.textoPrincipal }}>{formatoMoneda(datos.totalesAnuales.totalVentas)}</h3>
                <small style={{ color: COLORS.textoSecundario }}>Monto total de operaciones</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6} md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <small style={{ color: COLORS.textoSecundario, fontWeight: '600' }}>Total Cobrado</small>
                <h3 className="fw-bold mb-1 mt-2" style={{ color: COLORS.verde }}>{formatoMoneda(datos.totalesAnuales.totalCobrado)}</h3>
                {Object.keys(metodosPagoResumen).length > 0 && (
                  <div className="mt-2">
                    {Object.entries(metodosPagoResumen).slice(0, 3).map(([metodo, monto]) => {
                      const config = metodosPagoConfig[metodo] || metodosPagoConfig.otro;
                      return (
                        <div key={metodo} className="d-flex justify-content-between align-items-center py-1">
                          <small style={{ color: COLORS.textoSecundario }}><i className={`bi bi-${config.icon} me-1`} style={{ color: config.color }}></i>{config.label}:</small>
                          <small style={{ color: COLORS.textoPrincipal, fontWeight: '600' }}>{formatoMoneda(monto)}</small>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6} md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <small style={{ color: COLORS.textoSecundario, fontWeight: '600' }}>Descuentos Aplicados</small>
                <h3 className="fw-bold mb-1 mt-2" style={{ color: COLORS.rojo }}>{formatoMoneda(datos.totalesAnuales.totalDescuentos)}</h3>
                <small style={{ color: COLORS.textoSecundario }}>Valor cedido en ventas</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* GRÁFICO PRINCIPAL */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px', backgroundColor: COLORS.cardBg }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold mb-0" style={{ color: COLORS.textoPrincipal }}>Facturación vs Cobro Efectivo</h6>
              <div className="d-flex gap-4">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 12, height: 12, backgroundColor: '#DCE3E9', borderRadius: 3 }}></div>
                  <small style={{ color: COLORS.textoSecundario }}>Facturado</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 12, height: 12, backgroundColor: '#172936', borderRadius: 3 }}></div>
                  <small style={{ color: COLORS.textoSecundario }}>Cobrado</small>
                </div>
              </div>
            </div>
            <div style={{ height: '350px' }}>
              <Bar data={chartData} options={chartOptions} plugins={[chartPercentagePlugin]} />
            </div>
          </Card.Body>
        </Card>

        {/* TABLA DE MESES */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px', backgroundColor: COLORS.cardBg, overflow: 'hidden' }}>
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
              <thead style={{ backgroundColor: COLORS.bgGeneral }}>
                <tr>
                  {['Mes', 'Ventas', 'Facturado', 'Cobrado', 'Descuentos', 'Contado', 'Canje', 'Efectividad'].map(h => (
                    <th key={h} style={{ color: COLORS.textoSecundario, fontWeight: '600', padding: '16px 12px', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px', borderBottom: `1px solid ${COLORS.bordes}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.resumenAnual.map(mes => {
                  const efectividad = mes.totalVentas > 0 ? Math.round((mes.totalCobrado / mes.totalVentas) * 100) : 0;
                  const efColor = efectividad >= 90 ? COLORS.verde : efectividad >= 50 ? COLORS.ambar : COLORS.rojo;
                  
                  return (
                    <tr key={mes.mes} style={{ cursor: 'pointer', borderBottom: `1px solid ${COLORS.bordes}` }} onClick={() => handleVerMes(mes)}>
                      <td style={{ padding: '12px', fontWeight: '700', color: COLORS.textoPrincipal }}>{mes.nombre}</td>
                      <td style={{ color: COLORS.textoSecundario }}>{mes.cantidadVentas}</td>
                      <td style={{ fontWeight: '500' }}>{formatoMoneda(mes.totalVentas)}</td>
                      <td style={{ fontWeight: '500', color: COLORS.verde }}>{formatoMoneda(mes.totalCobrado)}</td>
                      <td style={{ color: COLORS.rojo }}>{mes.totalDescuentos > 0 ? formatoMoneda(mes.totalDescuentos) : '—'}</td>
                      <td><Pill bg={COLORS.verdeSuave} color={COLORS.verde}>{mes.contado.cantidad}</Pill></td>
                      <td><Pill bg={COLORS.ambarSuave} color={COLORS.ambar}>{mes.plan_canje.cantidad}</Pill></td>
                      <td>
                        <span style={{ color: efColor, fontWeight: '700' }}>{efectividad}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card>

        {/* VALOR TASADO CANJES */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <Card.Body className="p-4 d-flex justify-content-between align-items-center">
            <div>
              <h6 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal }}>Inventario de Canjes</h6>
              <small style={{ color: COLORS.textoSecundario }}>Equipos recibidos y disponibles para la venta</small>
            </div>
            <div className="text-end">
              <h4 className="fw-bold mb-0" style={{ color: COLORS.ambar }}>{formatoMoneda(datos.resumen.totales.valorTasadoCanjes)}</h4>
              <small style={{ color: COLORS.textoSecundario }}>{datos.resumen.totales.cantidadCanjeDisponibles || 0} equipos en stock</small>
            </div>
          </Card.Body>
        </Card>

        {/* MODAL DETALLE DEL MES */}
        <Modal show={showModalMes} onHide={() => setShowModalMes(false)} size="xl" centered>
          <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
            <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
              <i className="bi bi-calendar-month me-2" style={{ color: COLORS.azul }}></i>
              {mesSeleccionado?.nombre} - Ventas Directas y Canje
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pt-3">
            {ventasDelMes.length > 0 ? (
              <div className="table-responsive rounded-3" style={{ border: `1px solid ${COLORS.bordes}` }}>
                <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead style={{ backgroundColor: COLORS.bgGeneral }}>
                    <tr>
                      {['Fecha', 'Cliente', 'Tipo', 'Producto', 'Facturado', 'Cobrado', 'Descuentos', 'Acción'].map(h => (
                        <th key={h} style={{ color: COLORS.textoSecundario, fontWeight: '600', padding: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ventasDelMes.map((venta, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.bordes}` }}>
                        <td style={{ padding: '12px', color: COLORS.textoSecundario }}>{formatoFecha(venta.fechaRealizada)}</td>
                        <td>
                          <div style={{ fontWeight: '600', color: COLORS.textoPrincipal }}>
                            {venta.cliente?.apellido}, {venta.cliente?.nombre}
                          </div>
                          <small style={{ color: COLORS.textoSecundario }}>DNI: {venta.cliente?.dni}</small>
                        </td>
                        <td>
                          <Pill bg={venta.tipoVenta === 'contado' ? COLORS.verdeSuave : COLORS.ambarSuave} 
                                color={venta.tipoVenta === 'contado' ? COLORS.verde : COLORS.ambar}>
                            {venta.tipoVenta === 'contado' ? 'Contado' : 'Plan Canje'}
                          </Pill>
                        </td>
                        <td>
                          <div style={{ color: COLORS.textoPrincipal }}>{venta.producto?.nombre}</div>
                          <small style={{ color: COLORS.textoSecundario }}>{venta.producto?.modelo}</small>
                        </td>
                        <td style={{ fontWeight: '600', color: COLORS.textoPrincipal }}>{formatoMoneda(venta.montoTotal)}</td>
                        <td style={{ color: COLORS.verde }}>{formatoMoneda(venta.montoPagado)}</td>
                        <td style={{ color: COLORS.rojo }}>{venta.totalDescuentos > 0 ? formatoMoneda(venta.totalDescuentos) : '—'}</td>
                        <td>
                          <Button variant="outline-primary" size="sm" onClick={() => handleVerVenta(venta)}
                            style={{ borderColor: COLORS.azul, color: COLORS.azul, borderRadius: '8px' }}>
                            <i className="bi bi-eye"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-5" style={{ color: COLORS.textoSecundario }}>
                <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                <p className="mt-3">No hay ventas registradas en este mes</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 px-4 pb-4">
            <Button variant="outline-secondary" onClick={() => setShowModalMes(false)} className="rounded-3" style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* MODAL DETALLE DE VENTA */}
        <Modal show={showModalVenta} onHide={() => setShowModalVenta(false)} size="lg" centered>
          <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
            <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
              <i className="bi bi-receipt me-2" style={{ color: COLORS.azul }}></i>
              Detalle de Venta
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pt-3">
            {ventaDetalle && (
              <>
                <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <Row className="g-3">
                    <Col md={6}>
                      <small style={{ color: COLORS.textoSecundario }} className="d-block">Cliente</small>
                      <span className="fw-semibold" style={{ color: COLORS.textoPrincipal }}>{ventaDetalle.cliente?.nombre} {ventaDetalle.cliente?.apellido}</span>
                      <div className="small" style={{ color: COLORS.textoSecundario }}>DNI: {ventaDetalle.cliente?.dni}</div>
                    </Col>
                    <Col md={6}>
                      <small style={{ color: COLORS.textoSecundario }} className="d-block">Tipo</small>
                      <Pill bg={ventaDetalle.tipoVenta === 'contado' ? COLORS.verdeSuave : COLORS.ambarSuave} 
                            color={ventaDetalle.tipoVenta === 'contado' ? COLORS.verde : COLORS.ambar}>
                        {ventaDetalle.tipoVenta === 'contado' ? 'Contado' : 'Plan Canje'}
                      </Pill>
                    </Col>
                    <Col md={4}>
                      <small style={{ color: COLORS.textoSecundario }} className="d-block">Fecha</small>
                      <span style={{ color: COLORS.textoPrincipal }}>{formatoFecha(ventaDetalle.fechaRealizada)}</span>
                    </Col>
                    <Col md={4}>
                      <small style={{ color: COLORS.textoSecundario }} className="d-block">Localidad</small>
                      <span style={{ color: COLORS.textoPrincipal }}>{ventaDetalle.localidad}</span>
                    </Col>
                    <Col md={4}>
                      <small style={{ color: COLORS.textoSecundario }} className="d-block">Vendedor</small>
                      <span style={{ color: COLORS.textoPrincipal }}>{ventaDetalle.vendedor || 'N/A'}</span>
                    </Col>
                  </Row>
                </div>

                {/* Equipo Canje */}
                {ventaDetalle.tipoVenta === 'plan_canje' && ventaDetalle.equiposCanje && ventaDetalle.equiposCanje.length > 0 && (
                  <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.ambarSuave, border: `1px solid ${COLORS.ambar}` }}>
                    <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem', color: COLORS.ambar }}>
                      <i className="bi bi-arrow-repeat me-2"></i>Equipo Recibido en Canje
                    </h6>
                    {ventaDetalle.equiposCanje.map((equipo, idx) => (
                      <Row key={idx} className="g-3 mb-2">
                        <Col md={6}>
                          <small style={{ color: COLORS.textoSecundario }} className="d-block">Equipo</small>
                          <strong style={{ color: COLORS.textoPrincipal }}>{equipo.nombre} {equipo.modelo}</strong>
                          {equipo.imei && <div className="small" style={{ color: COLORS.textoSecundario }}>IMEI: {equipo.imei}</div>}
                        </Col>
                        <Col md={3}>
                          <small style={{ color: COLORS.textoSecundario }} className="d-block">Estado</small>
                          <Pill bg={COLORS.cardBg} color={COLORS.textoSecundario} border={COLORS.bordes}>{equipo.estado}</Pill>
                        </Col>
                        <Col md={3}>
                          <small style={{ color: COLORS.textoSecundario }} className="d-block">Valor Tasado</small>
                          <strong style={{ color: COLORS.ambar }}>{formatoMoneda(equipo.valorTasado)}</strong>
                        </Col>
                      </Row>
                    ))}
                  </div>
                )}

                <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                    <i className="bi bi-phone me-1"></i>Producto Entregado
                  </h6>
                  <Row className="g-3">
                    <Col md={6}>
                      <strong style={{ color: COLORS.textoPrincipal }}>{ventaDetalle.producto?.nombre} {ventaDetalle.producto?.modelo}</strong>
                      <div className="small" style={{ color: COLORS.textoSecundario }}>IMEI: {ventaDetalle.producto?.imei || 'N/A'}</div>
                    </Col>
                    <Col md={3}>
                      <small style={{ color: COLORS.textoSecundario }} className="d-block">Monto Total</small>
                      <strong style={{ color: COLORS.azul }}>{formatoMoneda(ventaDetalle.montoTotal)}</strong>
                    </Col>
                    <Col md={3}>
                      <small style={{ color: COLORS.textoSecundario }} className="d-block">Pagado</small>
                      <strong style={{ color: COLORS.verde }}>{formatoMoneda(ventaDetalle.montoPagado)}</strong>
                    </Col>
                  </Row>
                </div>

                {ventaDetalle.pagos && ventaDetalle.pagos.length > 0 && (
                  <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                    <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.azul }}>
                      <i className="bi bi-credit-card me-1"></i>Pagos Recibidos
                    </h6>
                    <div className="d-flex flex-column gap-2">
                      {ventaDetalle.pagos.map((pago, idx) => {
                        const config = metodosPagoConfig[pago.metodo] || metodosPagoConfig.otro;
                        return (
                          <div key={idx} className="d-flex justify-content-between p-2 rounded-2" style={{ backgroundColor: COLORS.cardBg }}>
                            <div className="d-flex align-items-center gap-2">
                              <i className={`bi bi-${config.icon}`} style={{ color: config.color }}></i>
                              <span className="small" style={{ color: COLORS.textoPrincipal }}>{config.label}</span>
                              <small style={{ color: COLORS.textoSecundario }}>{formatoFecha(pago.fecha)}</small>
                            </div>
                            <strong style={{ color: COLORS.verde }}>{formatoMoneda(pago.monto)}</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {ventaDetalle.descuentos && ventaDetalle.descuentos.length > 0 && (
                  <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.rojoSuave, border: `1px solid ${COLORS.rojo}` }}>
                    <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.rojo }}>
                      <i className="bi bi-tag me-1"></i>Descuentos Aplicados
                    </h6>
                    {ventaDetalle.descuentos.map((desc, idx) => (
                      <div key={idx} className="d-flex justify-content-between py-1">
                        <span className="small" style={{ color: COLORS.textoPrincipal }}>{desc.descripcion}</span>
                        <strong style={{ color: COLORS.rojo }}>-{formatoMoneda(desc.monto)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 px-4 pb-4">
            <Button variant="outline-secondary" onClick={() => setShowModalVenta(false)} className="rounded-3" style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

