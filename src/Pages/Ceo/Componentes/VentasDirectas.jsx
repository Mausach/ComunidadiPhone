// src/Pages/Ceo/Componentes/reportes/VentasDirectas.jsx

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Spinner, Alert, Modal, Table, Form } from 'react-bootstrap';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { obtenerVentasDirectasCanje } from '../Helpers/ReportesMensuales';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const formatoMoneda = (v) => !v && v !== 0 ? '$0' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
const formatoFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

// Mapa de métodos de pago con iconos y colores
const metodosPagoConfig = {
    efectivo: { icon: 'bi-cash', color: '#00A650', label: 'Efectivo' },
    transferencia: { icon: 'bi-bank', color: '#3483FA', label: 'Transferencia' },
    dolares: { icon: 'bi-currency-dollar', color: '#6F42C1', label: 'Dólares' },
    cripto: { icon: 'bi-currency-bitcoin', color: '#FF7733', label: 'Criptomonedas' },
    tarjeta_credito: { icon: 'bi-credit-card', color: '#DC3545', label: 'Tarjeta de Crédito' },
    otro: { icon: 'bi-wallet2', color: '#6C757D', label: 'Otro' }
};

export const VentasDirectas = () => {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [datos, setDatos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modales
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
    // Filtrar ventas que pertenecen a ese mes (por fechaRealizada)
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

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: '#3483FA' }} />
        <p className="text-muted mt-3">Cargando reporte...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '8px' }}>
        <i className="bi bi-exclamation-triangle me-2"></i>{error}
        <button onClick={cargarDatos} className="btn btn-link btn-sm ms-3" style={{ color: '#dc3545' }}>
          Reintentar
        </button>
      </Alert>
    );
  }

  if (!datos) return null;

  // ==========================================
  // DATOS PARA GRÁFICOS
  // ==========================================
  const datosGraficoBarras = {
    labels: datos.resumenAnual.map(m => m.nombre),
    datasets: [
      {
        label: 'Total Facturado',
        data: datos.resumenAnual.map(m => m.totalVentas),
        backgroundColor: '#3483FA',
        borderRadius: 6,
      },
      {
        label: 'Total Cobrado',
        data: datos.resumenAnual.map(m => m.totalCobrado),
        backgroundColor: '#00A650',
        borderRadius: 6,
      }
    ]
  };

  const datosGraficoLinea = {
    labels: datos.resumenAnual.map(m => m.nombre),
    datasets: [
      {
        label: 'Cantidad de Ventas',
        data: datos.resumenAnual.map(m => m.cantidadVentas),
        borderColor: '#6F42C1',
        backgroundColor: 'rgba(111, 66, 193, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6F42C1',
        pointRadius: 5,
        pointHoverRadius: 8
      }
    ]
  };

  const opcionesBarras = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15, font: { size: 11 } } },
      tooltip: { callbacks: { label: (context) => ` ${context.dataset.label}: ${formatoMoneda(context.raw)}` } }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { callback: (value) => `$${value.toLocaleString()}`, font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  };

  const opcionesLinea = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { stepSize: 1, font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  };

  // Métodos de pago del resumen
  const metodosPagoResumen = datos.resumen.totales.metodosPago || {};

  return (
    <div>
      {/* ==========================================
          SELECTOR DE AÑO Y TOTALES ANUALES
          ========================================== */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
        <Card.Body className="p-3">
          <Row className="align-items-center g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary">Año</Form.Label>
                <Form.Select value={anio} onChange={(e) => setAnio(parseInt(e.target.value))} className="rounded-3">
                  {anios.map(a => <option key={a} value={a}>{a}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={9}>
              <div className="d-flex justify-content-end gap-2 flex-wrap">
                <Badge bg="primary" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
                  Ventas: {datos.totalesAnuales.cantidadVentas}
                </Badge>
                <Badge bg="success" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
                  Facturado: {formatoMoneda(datos.totalesAnuales.totalVentas)}
                </Badge>
                <Badge bg="info" text="dark" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
                  Cobrado: {formatoMoneda(datos.totalesAnuales.totalCobrado)}
                </Badge>
                <Badge bg="warning" text="dark" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
                  Descuentos: {formatoMoneda(datos.totalesAnuales.totalDescuentos)}
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ==========================================
          CARDS DE MÉTRICAS GENERALES
          ========================================== */}
      <Row className="g-3 mb-4">
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #3483FA' }}>
            <Card.Body>
              <small className="text-muted d-block mb-1">TOTAL VENTAS ANUALES</small>
              <h3 className="fw-bold mb-0" style={{ color: '#3483FA' }}>{datos.totalesAnuales.cantidadVentas}</h3>
              <small className="text-muted">Contado: {datos.totalesAnuales.contado.cantidad} | Canje: {datos.totalesAnuales.plan_canje.cantidad}</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #00A650' }}>
            <Card.Body>
              <small className="text-muted d-block mb-1">TOTAL COBRADO</small>
              <h3 className="fw-bold mb-2" style={{ color: '#00A650' }}>{formatoMoneda(datos.totalesAnuales.totalCobrado)}</h3>
              {/* Desglose por método de pago */}
              {Object.keys(metodosPagoResumen).length > 0 && (
                <div className="mt-2">
                  {Object.entries(metodosPagoResumen).slice(0, 3).map(([metodo, monto]) => {
                    const config = metodosPagoConfig[metodo] || metodosPagoConfig.otro;
                    return (
                      <div key={metodo} className="d-flex justify-content-between align-items-center py-1 border-bottom" style={{ borderColor: '#f5f5f5' }}>
                        <small className="text-muted"><i className={`bi ${config.icon} me-1`} style={{ color: config.color }}></i>{config.label}:</small>
                        <small className="fw-semibold" style={{ color: '#333' }}>{formatoMoneda(monto)}</small>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #FF7733' }}>
            <Card.Body>
              <small className="text-muted d-block mb-1">TOTAL DESCUENTOS</small>
              <h3 className="fw-bold mb-0" style={{ color: '#FF7733' }}>{formatoMoneda(datos.totalesAnuales.totalDescuentos)}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #FFC107' }}>
            <Card.Body>
              <small className="text-muted d-block mb-1">VALOR TASADO CANJES</small>
              <h3 className="fw-bold mb-0" style={{ color: '#1a1a1a' }}>{formatoMoneda(datos.resumen.totales.valorTasadoCanjes)}</h3>
              <small className="text-muted">{datos.resumen.totales.cantidadCanjeDisponibles || 0} equipos disponibles</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ==========================================
          GRÁFICOS
          ========================================== */}
      <Row className="g-3 mb-4">
        <Col lg={8} md={12}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
                <i className="bi bi-bar-chart me-2" style={{ color: '#3483FA' }}></i>
                Comparativa Anual (Facturado vs Cobrado)
              </h6>
              <div style={{ height: '300px' }}>
                <Bar data={datosGraficoBarras} options={opcionesBarras} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={12}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
                <i className="bi bi-graph-up me-2" style={{ color: '#6F42C1' }}></i>
                Ventas por Mes
              </h6>
              <div style={{ height: '300px' }}>
                <Line data={datosGraficoLinea} options={opcionesLinea} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ==========================================
          GRILLA DE 12 MESES
          ========================================== */}
      <Row className="g-3 mb-4">
        {datos.resumenAnual.map(mes => {
          const porcentajeCobrado = mes.totalVentas > 0 ? Math.round((mes.totalCobrado / mes.totalVentas) * 100) : 0;
          
          return (
            <Col xl={3} lg={4} md={6} key={mes.mes}>
              <Card 
                className="shadow-sm border-0 h-100" 
                style={{ 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderLeft: `4px solid ${mes.cantidadVentas > 0 ? '#3483FA' : '#E5E5E5'}`
                }}
                onClick={() => handleVerMes(mes)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0" style={{ color: '#333' }}>{mes.nombre}</h6>
                    <Badge bg={mes.cantidadVentas > 0 ? 'primary' : 'secondary'}>{mes.cantidadVentas} ventas</Badge>
                  </div>
                  
                  <div className="mb-2">
                    <small className="text-muted d-block">Facturado</small>
                    <strong style={{ color: '#3483FA', fontSize: '0.9rem' }}>{formatoMoneda(mes.totalVentas)}</strong>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted d-block">Cobrado</small>
                    <strong style={{ color: '#00A650', fontSize: '0.9rem' }}>{formatoMoneda(mes.totalCobrado)}</strong>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">Descuentos</small>
                    <strong style={{ color: '#FF7733', fontSize: '0.9rem' }}>{formatoMoneda(mes.totalDescuentos)}</strong>
                  </div>
                  
                  <div className="d-flex gap-1 flex-wrap">
                    <Badge bg="success" style={{ fontSize: '0.65rem' }}>Contado: {mes.contado.cantidad}</Badge>
                    <Badge bg="warning" text="dark" style={{ fontSize: '0.65rem' }}>Canje: {mes.plan_canje.cantidad}</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* ==========================================
          MODAL DETALLE DEL MES
          ========================================== */}
      <Modal show={showModalMes} onHide={() => setShowModalMes(false)} size="xl" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className="bi bi-calendar-month me-2" style={{ color: '#3483FA' }}></i>
            {mesSeleccionado?.nombre} - Ventas del Mes
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ventasDelMes.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="align-middle" style={{ fontSize: '0.85rem' }}>
                <thead className="bg-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Producto</th>
                    <th>Monto Total</th>
                    <th>Pagado</th>
                    <th>Descuentos</th>
                    <th>Conducta</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasDelMes.map((venta, idx) => (
                    <tr key={idx}>
                      <td>{formatoFecha(venta.fechaRealizada)}</td>
                      <td>
                        <div style={{ fontWeight: '500', color: '#333' }}>
                          {venta.cliente?.nombre} {venta.cliente?.apellido}
                        </div>
                        <small className="text-muted">DNI: {venta.cliente?.dni}</small>
                      </td>
                      <td>
                        <Badge bg={venta.tipoVenta === 'contado' ? 'success' : 'warning'} text={venta.tipoVenta === 'contado' ? 'white' : 'dark'}>
                          {venta.tipoVenta === 'contado' ? 'Contado' : 'Plan Canje'}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ color: '#333' }}>{venta.producto?.nombre}</div>
                        <small className="text-muted">{venta.producto?.modelo}</small>
                      </td>
                      <td><strong>{formatoMoneda(venta.montoTotal)}</strong></td>
                      <td style={{ color: '#00A650' }}>{formatoMoneda(venta.montoPagado)}</td>
                      <td style={{ color: '#FF7733' }}>{venta.totalDescuentos > 0 ? formatoMoneda(venta.totalDescuentos) : '-'}</td>
                      <td>
                        <Badge bg={
                          venta.conducta_pago === 'al dia' || venta.conducta_pago === 'cancelado' ? 'success' :
                          venta.conducta_pago === 'atrasado' ? 'danger' : 'secondary'
                        }>
                          {venta.conducta_pago}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" onClick={() => handleVerVenta(venta)}>
                          <i className="bi bi-eye"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-muted text-center py-4">No hay ventas registradas en este mes</p>
          )}
        </Modal.Body>
      </Modal>

      {/* ==========================================
          MODAL DETALLE DE VENTA (Reutilizado)
          ========================================== */}
      <Modal show={showModalVenta} onHide={() => setShowModalVenta(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className="bi bi-receipt me-2" style={{ color: '#3483FA' }}></i>
            Detalle de Venta
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ventaDetalle && (
            <>
              <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <Row className="g-3">
                  <Col md={6}>
                    <small className="text-muted d-block">Cliente</small>
                    <strong>{ventaDetalle.cliente?.nombre} {ventaDetalle.cliente?.apellido}</strong>
                    <div><small className="text-muted">DNI: {ventaDetalle.cliente?.dni}</small></div>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">Tipo de Venta</small>
                    <Badge bg={ventaDetalle.tipoVenta === 'contado' ? 'success' : 'warning'} text={ventaDetalle.tipoVenta === 'contado' ? 'white' : 'dark'}>
                      {ventaDetalle.tipoVenta === 'contado' ? 'Contado' : 'Plan Canje'}
                    </Badge>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Fecha</small>
                    <span>{formatoFecha(ventaDetalle.fechaRealizada)}</span>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Localidad</small>
                    <span>{ventaDetalle.localidad}</span>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Vendedor</small>
                    <span>{ventaDetalle.vendedor || 'N/A'}</span>
                  </Col>
                </Row>
              </div>

              {/* Equipo Canje Recibido */}
              {ventaDetalle.tipoVenta === 'plan_canje' && ventaDetalle.equiposCanje && ventaDetalle.equiposCanje.length > 0 && (
                <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#fffbe6' }}>
                  <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem', color: '#1a1a1a' }}>
                    <i className="bi bi-arrow-repeat me-2" style={{ color: '#FFC107' }}></i>
                    Equipo Recibido en Canje
                  </h6>
                  {ventaDetalle.equiposCanje.map((equipo, idx) => (
                    <Row key={idx} className="g-3 mb-2">
                      <Col md={6}>
                        <small className="text-muted d-block">Equipo</small>
                        <strong style={{ color: '#333' }}>{equipo.nombre} {equipo.modelo}</strong>
                        {equipo.capacidad && <div><small className="text-muted">Capacidad: {equipo.capacidad}</small></div>}
                        {equipo.imei && <div><small className="text-muted">IMEI: {equipo.imei}</small></div>}   {/* 👈 NUEVO */}
                      </Col>
                      <Col md={3}>
                        <small className="text-muted d-block">Estado</small>
                        <Badge bg="secondary">{equipo.estado || 'N/A'}</Badge>
                      </Col>
                      <Col md={3}>
                        <small className="text-muted d-block">Valor Tasado</small>
                        <strong style={{ color: '#FFC107' }}>{formatoMoneda(equipo.valorTasado)}</strong>
                      </Col>
                    </Row>
                  ))}
                </div>
              )}

              <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <Row className="g-3">
                  <Col md={6}>
                    <small className="text-muted d-block">Producto Entregado</small>
                    <strong>{ventaDetalle.producto?.nombre} {ventaDetalle.producto?.modelo}</strong>
                    <div><small className="text-muted">IMEI: {ventaDetalle.producto?.imei || 'N/A'}</small></div>
                  </Col>
                  <Col md={3}>
                    <small className="text-muted d-block">Monto Total</small>
                    <strong style={{ color: '#3483FA' }}>{formatoMoneda(ventaDetalle.montoTotal)}</strong>
                  </Col>
                  <Col md={3}>
                    <small className="text-muted d-block">Pagado</small>
                    <strong style={{ color: '#00A650' }}>{formatoMoneda(ventaDetalle.montoPagado)}</strong>
                  </Col>
                </Row>
              </div>

              {/* Resumen de montos para plan canje */}
              {ventaDetalle.tipoVenta === 'plan_canje' && (
                <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Resumen de Canje</h6>
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ color: '#666' }}>Monto Total</span>
                    <strong>{formatoMoneda(ventaDetalle.montoTotal)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ color: '#666' }}>Valor Tasado Reconocido</span>
                    <strong style={{ color: '#FFC107' }}>-{formatoMoneda(ventaDetalle.totalValorTasadoVenta || 0)}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ color: '#666' }}>Efectivo Pagado</span>
                    <strong style={{ color: '#00A650' }}>-{formatoMoneda(ventaDetalle.montoPagado)}</strong>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Pendiente Real</span>
                    <strong style={{ color: ventaDetalle.montoPendienteReal > 0 ? '#DC3545' : '#00A650' }}>
                      {ventaDetalle.montoPendienteReal > 0 ? formatoMoneda(ventaDetalle.montoPendienteReal) : 'Saldado'}
                    </strong>
                  </div>
                </div>
              )}

              {ventaDetalle.pagos && ventaDetalle.pagos.length > 0 && (
                <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Pagos Realizados</h6>
                  {ventaDetalle.pagos.map((pago, idx) => {
                    const config = metodosPagoConfig[pago.metodo] || metodosPagoConfig.otro;
                    return (
                      <div key={idx} className="d-flex justify-content-between py-1" style={{ borderBottom: '1px solid #e5e5e5' }}>
                        <span>
                          <i className={`bi ${config.icon} me-2`} style={{ color: config.color }}></i>
                          {config.label}
                          <small className="text-muted ms-2">{formatoFecha(pago.fecha)}</small>
                        </span>
                        <strong style={{ color: '#00A650' }}>{formatoMoneda(pago.monto)}</strong>
                      </div>
                    );
                  })}
                </div>
              )}

              {ventaDetalle.descuentos && ventaDetalle.descuentos.length > 0 && (
                <div className="border rounded-3 p-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Descuentos Aplicados</h6>
                  {ventaDetalle.descuentos.map((desc, idx) => (
                    <div key={idx} className="d-flex justify-content-between py-1">
                      <span>{desc.descripcion}</span>
                      <strong style={{ color: '#FF7733' }}>-{formatoMoneda(desc.monto)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShowModalVenta(false)} className="rounded-3">
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};


