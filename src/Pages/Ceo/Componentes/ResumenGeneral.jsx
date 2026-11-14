// src/Pages/Ceo/Componentes/reportes/ResumenGeneral.jsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner, Alert, Table } from 'react-bootstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { obtenerResumenGeneral } from '../Helpers/ReportesMensuales';
import { COLORS } from '../../Cobranza/Helperss/colors';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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

const formatoMoneda = (v) => !v && v !== 0 ? '$0' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);

export const ResumenGeneral = () => {
  const [datos, setDatos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    setIsLoading(true);
    setError('');
    try {
      const resp = await obtenerResumenGeneral();
      setDatos(resp.data);
    } catch (err) {
      setError(err.message || 'Error al cargar el resumen');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: COLORS.azul }} />
        <p className="mt-3" style={{ color: COLORS.textoSecundario }}>Cargando resumen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
        <i className="bi bi-exclamation-triangle me-2"></i>{error}
        <button onClick={cargarResumen} className="btn btn-link btn-sm ms-3" style={{ color: COLORS.rojo }}>Reintentar</button>
      </Alert>
    );
  }

  if (!datos) return null;

  // ==========================================
  // GRÁFICO: VENTAS POR TIPO (DINÁMICO)
  // ==========================================
  const tiposDeVenta = datos.ventas.porTipo || {};
  
  // Configuración de labels y colores por tipo de venta
  const configTipos = {
    contado: { label: 'Contado', color: COLORS.verde },
    plan_canje: { label: 'Plan Canje', color: COLORS.ambar },
    sistema1: { label: 'Sistema 1', color: COLORS.azul },
    sistema2: { label: 'Sistema 2', color: COLORS.rojo },
    plan_canje_cuotas: { label: 'Canje + Cuotas', color: COLORS.azulOscuro } // 👈 NUEVO
  };

  const labelsVentas = [];
  const dataVentas = [];
  const coloresVentas = [];

  // Iteramos sobre los tipos que manda el backend
  Object.keys(tiposDeVenta).forEach(key => {
    if (tiposDeVenta[key] > 0 && configTipos[key]) {
      labelsVentas.push(configTipos[key].label);
      dataVentas.push(tiposDeVenta[key]);
      coloresVentas.push(configTipos[key].color);
    }
  });

  const datosVentasTipo = {
    labels: labelsVentas,
    datasets: [{
      data: dataVentas,
      backgroundColor: coloresVentas,
      borderWidth: 2,
      borderColor: COLORS.cardBg,
      hoverOffset: 8
    }]
  };

  const opcionesDona = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 11 }, color: COLORS.textoSecundario } }
    },
    cutout: '65%'
  };

  // ==========================================
  // GRÁFICO: MÉTODOS DE PAGO
  // ==========================================
  const metodosPago = datos.montos.porMetodoPago || {};
  const labelsMetodos = Object.keys(metodosPago).map(m => {
    const mapa = { efectivo: 'Efectivo', transferencia: 'Transf.', dolares: 'Dólares', cripto: 'Cripto', tarjeta_credito: 'Tarjeta' };
    return mapa[m] || m;
  });
  const valoresMetodos = Object.values(metodosPago);

  const datosMetodosPago = {
    labels: labelsMetodos,
    datasets: [{
      label: 'Monto',
      data: valoresMetodos,
      backgroundColor: COLORS.azul,
      borderRadius: 6,
      hoverBackgroundColor: COLORS.azulOscuro
    }]
  };

  const opcionesBarras = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context) => ` ${formatoMoneda(context.raw)}` } }
    },
    scales: {
      y: { beginAtZero: true, display: false, grid: { display: false } },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: COLORS.textoSecundario } }
    }
  };

  // ==========================================
  // GRÁFICO: EQUIPOS VENDIDOS
  // ==========================================
  const datosEquipos = {
    labels: ['Stock', 'Canje'],
    datasets: [{
      data: [datos.equipos.vendidos.stockCantidad, datos.equipos.vendidos.canjeCantidad],
      backgroundColor: [COLORS.azul, COLORS.ambar],
      borderWidth: 2,
      borderColor: COLORS.cardBg,
      hoverOffset: 8
    }]
  };

  return (
    <div style={{ backgroundColor: COLORS.bgGeneral, minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div className="mb-4">
          <small style={{ color: COLORS.textoSecundario, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.7rem' }}>
            Comercial · Resumen General
          </small>
          <h2 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal, fontSize: '2rem' }}>Vista Global del Negocio</h2>
          <p style={{ color: COLORS.textoSecundario, fontSize: '0.9rem', maxWidth: '600px' }} className="mb-0">
            Estado consolidado de ventas, cobranzas, inventario y gastos. Todos los montos están expresados en pesos argentinos.
          </p>
        </div>

        {/* KPIs PRINCIPALES */}
        <Row className="g-3 mb-4">
          <Col xl={3} lg={6} md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', borderLeft: `4px solid ${COLORS.verde}` }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <small style={{ color: COLORS.textoSecundario, fontWeight: '600' }}>Total Pagado</small>
                    <h3 className="fw-bold mb-1 mt-1" style={{ color: COLORS.verde }}>{formatoMoneda(datos.montos.totalPagadoGeneral)}</h3>
                    <small style={{ color: COLORS.textoSecundario, fontSize: '0.75rem' }}>
                      Ventas: {formatoMoneda(datos.montos.totalMontoPagadoVentas)}<br/>
                      Cuotas: {formatoMoneda(datos.montos.totalMontoCuotasPagadas)}
                    </small>
                  </div>
                  <div className="rounded-circle p-2" style={{ backgroundColor: COLORS.verdeSuave }}>
                    <i className="bi bi-cash-coin" style={{ color: COLORS.verde, fontSize: '1.2rem' }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', borderLeft: `4px solid ${COLORS.ambar}` }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <small style={{ color: COLORS.textoSecundario, fontWeight: '600' }}>Por Cobrar</small>
                    <h3 className="fw-bold mb-1 mt-1" style={{ color: COLORS.ambar }}>{formatoMoneda(datos.cuotas.porCobrarMonto)}</h3>
                    <small style={{ color: COLORS.textoSecundario, fontSize: '0.75rem' }}>{datos.cuotas.porCobrarCantidad} cuotas pendientes</small>
                  </div>
                  <div className="rounded-circle p-2" style={{ backgroundColor: COLORS.ambarSuave }}>
                    <i className="bi bi-clock-history" style={{ color: COLORS.ambar, fontSize: '1.2rem' }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', borderLeft: `4px solid ${COLORS.azul}` }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <small style={{ color: COLORS.textoSecundario, fontWeight: '600' }}>Equipos Vendidos</small>
                    <h3 className="fw-bold mb-1 mt-1" style={{ color: COLORS.azul }}>{datos.equipos.vendidos.totalVendidos}</h3>
                    <small style={{ color: COLORS.textoSecundario, fontSize: '0.75rem' }}>{datos.equipos.totalEquiposStock} en stock actual</small>
                  </div>
                  <div className="rounded-circle p-2" style={{ backgroundColor: COLORS.azulSuave }}>
                    <i className="bi bi-phone" style={{ color: COLORS.azul, fontSize: '1.2rem' }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', borderLeft: `4px solid ${COLORS.rojo}` }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <small style={{ color: COLORS.textoSecundario, fontWeight: '600' }}>Gastos Generales</small>
                    <h3 className="fw-bold mb-1 mt-1" style={{ color: COLORS.rojo }}>{formatoMoneda(datos.gastos.totalGastosGenerales)}</h3>
                    <small style={{ color: COLORS.textoSecundario, fontSize: '0.75rem' }}>Total acumulado histórico</small>
                  </div>
                  <div className="rounded-circle p-2" style={{ backgroundColor: COLORS.rojoSuave }}>
                    <i className="bi bi-receipt" style={{ color: COLORS.rojo, fontSize: '1.2rem' }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* GRÁFICOS */}
        <Row className="g-3 mb-4">
          <Col lg={4} md={12}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0" style={{ color: COLORS.textoPrincipal }}>Ventas por Tipo</h6>
                  <Pill bg={COLORS.bgGeneral} color={COLORS.textoSecundario} border={COLORS.bordes}>{datos.ventas.totalVentas} totales</Pill>
                </div>
                <div style={{ height: '220px' }}>
                  <Doughnut data={datosVentasTipo} options={opcionesDona} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={12}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal }}>Métodos de Pago</h6>
                <div style={{ height: '220px' }}>
                  <Bar data={datosMetodosPago} options={opcionesBarras} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={12}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0" style={{ color: COLORS.textoPrincipal }}>Equipos Vendidos</h6>
                  <Pill bg={COLORS.bgGeneral} color={COLORS.textoSecundario} border={COLORS.bordes}>{datos.equipos.vendidos.totalVendidos} totales</Pill>
                </div>
                <div style={{ height: '220px' }}>
                  <Doughnut data={datosEquipos} options={opcionesDona} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* DESGLOSES DETALLADOS */}
        <Row className="g-3">
          <Col lg={6} md={12}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal }}>
                  <i className="bi bi-calendar-check me-2" style={{ color: COLORS.azul }}></i>
                  Estado de Cuotas
                </h6>
                <div className="table-responsive">
                  <Table borderless className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: COLORS.textoSecundario }}>Cuotas Pagadas</td>
                        <td className="text-end fw-semibold" style={{ color: COLORS.verde }}>
                          {datos.cuotas.pagadasCantidad} · {formatoMoneda(datos.cuotas.pagadasMonto)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ color: COLORS.textoSecundario }}>Cuotas Pendientes</td>
                        <td className="text-end fw-semibold" style={{ color: COLORS.ambar }}>
                          {datos.cuotas.porCobrarCantidad} · {formatoMoneda(datos.cuotas.porCobrarMonto)}
                        </td>
                      </tr>
                      <tr style={{ borderTop: `1px solid ${COLORS.bordes}` }}>
                        <td className="fw-bold pt-3" style={{ color: COLORS.textoPrincipal }}>Valor Total de Ventas</td>
                        <td className="text-end fw-bold pt-3" style={{ color: COLORS.azul }}>
                          {formatoMoneda(datos.montos.totalMontoTotalVentas)}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} md={12}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal }}>
                  <i className="bi bi-box-seam me-2" style={{ color: COLORS.ambar }}></i>
                  Resumen de Equipos
                </h6>
                <div className="table-responsive">
                  <Table borderless className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: COLORS.textoSecundario }}>Total en Stock</td>
                        <td className="text-end fw-semibold" style={{ color: COLORS.textoPrincipal }}>{datos.equipos.totalEquiposStock}</td>
                      </tr>
                      <tr>
                        <td style={{ color: COLORS.textoSecundario }}>Vendidos Stock</td>
                        <td className="text-end fw-semibold" style={{ color: COLORS.azul }}>{datos.equipos.vendidos.stockCantidad}</td>
                      </tr>
                      <tr>
                        <td style={{ color: COLORS.textoSecundario }}>Vendidos Canje</td>
                        <td className="text-end fw-semibold" style={{ color: COLORS.ambar }}>{datos.equipos.vendidos.canjeCantidad}</td>
                      </tr>
                      <tr style={{ borderTop: `1px solid ${COLORS.bordes}` }}>
                        <td className="fw-bold pt-3" style={{ color: COLORS.textoPrincipal }}>Costo Total Vendidos</td>
                        <td className="text-end fw-bold pt-3" style={{ color: COLORS.rojo }}>
                          {formatoMoneda(datos.equipos.vendidos.costoTotalVendidos)}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};