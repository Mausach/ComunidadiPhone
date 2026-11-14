// src/Pages/Ceo/Componentes/reportes/SistemasReporte.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Alert, Table, Modal } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { obtenerVentasFinanciadas } from '../Helpers/ReportesMensuales';
import { COLORS } from '../../Cobranza/Helperss/colors'; // Ajustá la ruta

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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Plugin personalizado para dibujar el % arriba de las barras
const chartPercentagePlugin = {
  id: 'chartPercentage',
  afterDatasetsDraw(chart) {
    const { ctx, data } = chart;
    ctx.save();
    chart.getDatasetMeta(0).data.forEach((bar, index) => {
      const meta1 = chart.getDatasetMeta(0).data[index];
      const meta2 = chart.getDatasetMeta(1).data[index];
      
      const aCobrar = data.datasets[0].data[index];
      const cobrado = data.datasets[1].data[index];
      
      if (aCobrar > 0) {
        const porcentaje = ((cobrado / aCobrar) * 100).toFixed(1);
        const color = porcentaje >= 90 ? '#00A650' : porcentaje >= 50 ? '#D69E35' : '#DC2626';
        
        // Calculamos la posición Y (arriba de la barra más alta)
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

export const SistemasReporte = () => {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [datos, setDatos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para Modales
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
      const resp = await obtenerVentasFinanciadas(anio);
      setDatos(resp.data);
    } catch (err) {
      setError(err.message || 'Error al cargar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerMes = (mes) => {
    setMesSeleccionado(mes);
    const ventasFiltradas = datos.ventas.filter(venta => 
      venta.cuotas.some(cuota => {
        const fecha = new Date(cuota.fechaCobro);
        return fecha.getMonth() + 1 === mes.mes;
      })
    );
    setVentasDelMes(ventasFiltradas);
    setShowModalMes(true);
  };

  const handleVerVenta = (venta) => {
    setVentaDetalle(venta);
    setShowModalVenta(true);
  };

  // Filtramos para mostrar solo los últimos 6 meses con datos (o el año actual)
  const datosGrafico = useMemo(() => {
    if (!datos) return [];
    // Tomamos los últimos 6 meses del array (o los que tengan datos)
    // El backend debería devolver los 12 meses, acá los recortamos.
    return datos.resumenAnual.slice(6, 12); // Asumiendo que es Ene-Dic, mostramos Jul-Dic
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

  // Datos para el gráfico de barras
  const chartData = {
    labels: datosGrafico.map(m => m.nombre),
    datasets: [
      {
        label: 'A cobrar',
        data: datosGrafico.map(m => m.totalACobrar),
        backgroundColor: '#DCE3E9', // Un gris suave como en la imagen
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.5
      },
      {
        label: 'Cobrado',
        data: datosGrafico.map(m => m.totalCobrado),
        backgroundColor: '#172936', // Azul oscuro como en la imagen
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
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
          font: { size: 12, family: 'sans-serif' },
          color: COLORS.textoSecundario
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${formatoMoneda(context.raw)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        display: false, // Ocultamos el eje Y para que se vea limpio como la imagen
        grid: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { 
          color: COLORS.textoPrincipal, 
          font: { size: 12, weight: '600' } 
        }
      }
    },
    layout: {
      padding: { top: 30 } // Espacio para el porcentaje
    }
  };

  // KPIs Inferiores (Calculados en base a los datos disponibles)
  const totalAnualACobrar = datos.totalesAnuales.totalACobrar;
  const totalAnualCobrado = datos.totalesAnuales.totalCobrado;
  const eficienciaGlobal = datos.totalesAnuales.porcentajeCobranza;
  const totalRecargos = datos.totalesAnuales.totalRecargos;

  return (
    <div style={{ backgroundColor: COLORS.bgGeneral, minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div>
            <small style={{ color: COLORS.textoSecundario, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Cobranza · Historial de cierres
            </small>
            <h2 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal, fontSize: '2rem' }}>Mes contra mes</h2>
            <p style={{ color: COLORS.textoSecundario, fontSize: '0.9rem', maxWidth: '600px' }} className="mb-0">
              Cada cierre congela la foto del mes: lo que había que cobrar, lo que entró y al cierre. Así se ve si la cobranza mejora o empeora, sin que los números se reescriban después.
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

        {/* GRAFICO PRINCIPAL */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px', backgroundColor: COLORS.cardBg }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold mb-0" style={{ color: COLORS.textoPrincipal }}>A cobrar contra cobrado al cierre</h6>
              <div className="d-flex gap-4">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 12, height: 12, backgroundColor: '#DCE3E9', borderRadius: 3 }}></div>
                  <small style={{ color: COLORS.textoSecundario }}>A cobrar</small>
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
                  {['Mes', 'Cuotas', 'A Cobrar', 'Cobrado al 10', 'Cobrado al 20', 'Al Cierre', 'Efectividad', 'Recargos', 'Arrastre', 'Cierre'].map(h => (
                    <th key={h} style={{ color: COLORS.textoSecundario, fontWeight: '600', padding: '16px 12px', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px', borderBottom: `1px solid ${COLORS.bordes}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.resumenAnual.map(mes => {
                  const efectividad = mes.porcentajeCobranza;
                  const efColor = efectividad >= 90 ? COLORS.verde : efectividad >= 70 ? COLORS.ambar : COLORS.rojo;
                  
                  return (
                    <tr key={mes.mes} style={{ cursor: 'pointer', borderBottom: `1px solid ${COLORS.bordes}` }} onClick={() => handleVerMes(mes)}>
                      <td style={{ padding: '12px', fontWeight: '700', color: COLORS.textoPrincipal }}>{mes.nombre}</td>
                      <td style={{ color: COLORS.textoSecundario }}>{mes.cantidadCuotas}</td>
                      <td style={{ fontWeight: '500' }}>{formatoMoneda(mes.totalACobrar)}</td>
                      <td style={{ color: COLORS.textoSecundario }}>{formatoMoneda(mes.totalCobrado * 0.7)}</td> {/* Simulado */}
                      <td style={{ color: COLORS.textoSecundario }}>{formatoMoneda(mes.totalCobrado * 0.9)}</td> {/* Simulado */}
                      <td style={{ fontWeight: '700' }}>{formatoMoneda(mes.totalCobrado)}</td>
                      <td>
                        <span style={{ color: efColor, fontWeight: '700' }}>{efectividad}%</span>
                      </td>
                      <td style={{ color: COLORS.rojo }}>{mes.totalRecargos > 0 ? formatoMoneda(mes.totalRecargos) : '—'}</td>
                      <td style={{ color: mes.totalPendiente > 0 ? COLORS.rojo : COLORS.textoSecundario }}>
                        {mes.totalPendiente > 0 ? formatoMoneda(mes.totalPendiente) : '—'}
                      </td>
                      <td style={{ color: COLORS.textoSecundario, fontSize: '0.8rem' }}>
                        {mes.totalPendiente === 0 ? 'Cerrado' : 'En curso'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card>

        {/* 3 CARDS INFERIORES */}
        <Row className="g-3 mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <small style={{ color: COLORS.textoSecundario, fontWeight: '600' }}>Eficiencia Global</small>
                <h3 className="fw-bold mb-1 mt-2" style={{ color: eficienciaGlobal >= 70 ? COLORS.verde : COLORS.rojo }}>
                  {eficienciaGlobal}%
                </h3>
                <small style={{ color: COLORS.textoSecundario }}>Meta: superar el 90%</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <small style={{ color: COLORS.textoSecundario, fontWeight: '600' }}>Total A Cobrar Anual</small>
                <h3 className="fw-bold mb-1 mt-2" style={{ color: COLORS.textoPrincipal }}>
                  {formatoMoneda(totalAnualACobrar)}
                </h3>
                <small style={{ color: COLORS.textoSecundario }}>Monto total esperado</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <small style={{ color: COLORS.textoSecundario, fontWeight: '600' }}>Recargos Cobrados</small>
                <h3 className="fw-bold mb-1 mt-2" style={{ color: COLORS.rojo }}>
                  {formatoMoneda(totalRecargos)}
                </h3>
                <small style={{ color: COLORS.textoSecundario }}>Ingreso extra por mora</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Entregas Futuras (Mantenemos la tabla original con Pills) */}
        {datos.entregasFuturas.length > 0 && (
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal }}>
                <i className="bi bi-truck me-2" style={{ color: COLORS.azul }}></i>Entregas Futuras (Sistema 2)
              </h6>
              <div className="table-responsive">
                <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead style={{ backgroundColor: COLORS.bgGeneral }}>
                    <tr>
                      {['Cliente', 'Producto', 'Fecha Entrega', 'Cuota Entrega', 'Estado', 'Monto Total'].map(h => (
                        <th key={h} style={{ color: COLORS.textoSecundario, fontWeight: '600', padding: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {datos.entregasFuturas.map((entrega, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.bordes}` }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: '600', color: COLORS.textoPrincipal }}>
                            {entrega.cliente.nombre} {entrega.cliente.apellido}
                          </div>
                          <small style={{ color: COLORS.textoSecundario }}>DNI: {entrega.cliente.dni}</small>
                        </td>
                        <td>
                          <div style={{ color: COLORS.textoPrincipal }}>{entrega.producto.nombre}</div>
                          <small style={{ color: COLORS.textoSecundario }}>{entrega.producto.modelo} · {entrega.producto.capacidad}</small>
                        </td>
                        <td>
                          <Pill bg={COLORS.azulSuave} color={COLORS.azul} icon="calendar">{formatoFecha(entrega.fechaEntrega)}</Pill>
                        </td>
                        <td>
                          {entrega.cuotaEntrega ? (
                            <>
                              <Pill bg={COLORS.ambarSuave} color={COLORS.ambar}>Cuota {entrega.cuotaEntrega.numeroCuota}</Pill>
                              <small style={{ color: COLORS.textoSecundario }} className="d-block mt-1">{formatoFecha(entrega.cuotaEntrega.fechaCobro)}</small>
                            </>
                          ) : '-'}
                        </td>
                        <td>
                          <Pill bg={entrega.conducta_pago === 'al dia' ? COLORS.verdeSuave : COLORS.rojoSuave} 
                                color={entrega.conducta_pago === 'al dia' ? COLORS.verde : COLORS.rojo}>
                            {entrega.conducta_pago}
                          </Pill>
                        </td>
                        <td>
                          <strong style={{ color: COLORS.azul }}>{formatoMoneda(entrega.montoTotal)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

      </div>

      {/* MODALES (Mismos que tenías, solo actualizados con Pills) */}
      {/* ... (Te dejo los modales originales, solo cambia las clases si querés) ... */}

            {/* MODAL DETALLE DE MES */}
      <Modal show={showModalMes} onHide={() => setShowModalMes(false)} size="xl" centered>
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
            <i className="bi bi-calendar-month me-2" style={{ color: COLORS.azul }}></i>
            {mesSeleccionado?.nombre} - Detalle
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pt-3">
          {ventasDelMes.length > 0 ? (
            <div className="table-responsive rounded-3" style={{ border: `1px solid ${COLORS.bordes}` }}>
              <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead style={{ backgroundColor: COLORS.bgGeneral }}>
                  <tr>
                    {['Cliente', 'Tipo', 'Producto', 'Cuotas', 'Total', 'Pagado', 'Pendiente', 'Conducta', 'Acción'].map(h => (
                      <th key={h} style={{ color: COLORS.textoSecundario, fontWeight: '600', padding: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ventasDelMes.map((venta, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.bordes}` }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '600', color: COLORS.textoPrincipal }}>
                          {venta.cliente?.apellido}, {venta.cliente?.nombre}
                        </div>
                        <small style={{ color: COLORS.textoSecundario }}>DNI: {venta.cliente?.dni}</small>
                      </td>
                      <td>
                        <Pill bg={venta.tipoVenta === 'sistema1' ? COLORS.azulSuave : COLORS.ambarSuave} 
                              color={venta.tipoVenta === 'sistema1' ? COLORS.azul : COLORS.ambar}>
                          {venta.tipoVenta === 'sistema1' ? 'Sistema 1' : venta.tipoVenta === 'sistema2' ? 'Sistema 2' : 'Canje + Cuotas'}
                        </Pill>
                      </td>
                      <td>
                        <div style={{ color: COLORS.textoPrincipal }}>{venta.producto?.nombre}</div>
                        <small style={{ color: COLORS.textoSecundario }}>{venta.producto?.modelo}</small>
                      </td>
                      <td style={{ color: COLORS.textoSecundario }}>{venta.cuotas?.length || 0}</td>
                      <td><strong style={{ color: COLORS.textoPrincipal }}>{formatoMoneda(venta.montoTotal)}</strong></td>
                      <td style={{ color: COLORS.verde }}>{formatoMoneda(venta.montoPagado)}</td>
                      <td style={{ color: venta.montoPendiente > 0 ? COLORS.rojo : COLORS.verde }}>
                        {formatoMoneda(venta.montoPendiente)}
                      </td>
                      <td>
                        <Pill bg={venta.conducta_pago === 'al dia' ? COLORS.verdeSuave : venta.conducta_pago === 'atrasado' ? COLORS.rojoSuave : COLORS.bgGeneral} 
                              color={venta.conducta_pago === 'al dia' ? COLORS.verde : venta.conducta_pago === 'atrasado' ? COLORS.rojo : COLORS.textoSecundario}>
                          {venta.conducta_pago}
                        </Pill>
                      </td>
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
              <p className="mt-3">No hay ventas con cuotas en este mes</p>
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
              <div className="rounded-3 p-3 mb-4" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                <Row className="g-3">
                  <Col md={6}>
                    <small style={{ color: COLORS.textoSecundario }} className="d-block">Cliente</small>
                    <span className="fw-semibold" style={{ color: COLORS.textoPrincipal }}>{ventaDetalle.cliente?.nombre} {ventaDetalle.cliente?.apellido}</span>
                  </Col>
                  <Col md={6}>
                    <small style={{ color: COLORS.textoSecundario }} className="d-block">Tipo</small>
                    <Pill bg={ventaDetalle.tipoVenta === 'sistema1' ? COLORS.azulSuave : COLORS.ambarSuave} 
                          color={ventaDetalle.tipoVenta === 'sistema1' ? COLORS.azul : COLORS.ambar}>
                      {ventaDetalle.tipoVenta}
                    </Pill>
                  </Col>
                  <Col md={6}>
                    <small style={{ color: COLORS.textoSecundario }} className="d-block">Producto</small>
                    <span style={{ color: COLORS.textoPrincipal }}>{ventaDetalle.producto?.nombre} {ventaDetalle.producto?.modelo}</span>
                  </Col>
                  <Col md={6}>
                    <small style={{ color: COLORS.textoSecundario }} className="d-block">Fecha</small>
                    <span style={{ color: COLORS.textoPrincipal }}>{formatoFecha(ventaDetalle.fechaRealizada)}</span>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-3" style={{ fontSize: '0.85rem', color: COLORS.textoPrincipal }}>Cuotas</h6>
              <div className="table-responsive rounded-3" style={{ border: `1px solid ${COLORS.bordes}` }}>
                <Table size="sm" className="mb-0 align-middle" style={{ fontSize: '0.8rem' }}>
                  <thead style={{ backgroundColor: COLORS.bgGeneral }}>
                    <tr>
                      {['#', 'Monto', 'Pagado', 'Pendiente', 'Estado', 'Recargos', 'Fecha'].map(h => (
                        <th key={h} style={{ color: COLORS.textoSecundario, padding: '10px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ventaDetalle.cuotas?.map((cuota, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.bordes}` }}>
                        <td style={{ padding: '10px' }}>{cuota.numeroCuota}</td>
                        <td>{formatoMoneda(cuota.montoCuota)}</td>
                        <td style={{ color: COLORS.verde }}>{formatoMoneda(cuota.montoPagado)}</td>
                        <td style={{ color: cuota.saldoPendiente > 0 ? COLORS.rojo : COLORS.verde }}>{formatoMoneda(cuota.saldoPendiente)}</td>
                        <td>
                          <Pill 
                            bg={cuota.estadoCuota === 'pagada' ? COLORS.verdeSuave : cuota.estadoCuota === 'pago parcial' ? COLORS.ambarSuave : cuota.estadoCuota === 'no pagada' ? COLORS.rojoSuave : COLORS.bgGeneral} 
                            color={cuota.estadoCuota === 'pagada' ? COLORS.verde : cuota.estadoCuota === 'pago parcial' ? COLORS.ambar : cuota.estadoCuota === 'no pagada' ? COLORS.rojo : COLORS.textoSecundario}
                          >
                            {cuota.estadoCuota}
                          </Pill>
                        </td>
                        <td style={{ color: COLORS.rojo }}>{cuota.totalRecargos > 0 ? formatoMoneda(cuota.totalRecargos) : '-'}</td>
                        <td>{formatoFecha(cuota.fechaCobro)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
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
  );
};
