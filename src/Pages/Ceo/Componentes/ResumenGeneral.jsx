// src/Pages/Ceo/Componentes/reportes/ResumenGeneral.jsx

import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
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


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
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
        <Spinner animation="border" style={{ color: '#3483FA' }} />
        <p className="text-muted mt-3">Cargando resumen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '8px' }}>
        <i className="bi bi-exclamation-triangle me-2"></i>{error}
        <button onClick={cargarResumen} className="btn btn-link btn-sm ms-3" style={{ color: '#dc3545' }}>
          Reintentar
        </button>
      </Alert>
    );
  }

  if (!datos) return null;

  // Configuración de gráficos
  const colores = {
    azul: '#3483FA',
    verde: '#00A650',
    naranja: '#FF7733',
    rojo: '#DC3545',
    amarillo: '#FFE600',
    celeste: '#009EE3',
    violeta: '#6F42C1'
  };

  // Gráfico de ventas por tipo
  const datosVentasTipo = {
    labels: ['Contado', 'Plan Canje', 'Sistema 1', 'Sistema 2'],
    datasets: [
      {
        data: [
          datos.ventas.porTipo.contado,
          datos.ventas.porTipo.plan_canje,
          datos.ventas.porTipo.sistema1,
          datos.ventas.porTipo.sistema2
        ],
        backgroundColor: [
          colores.verde,
          colores.amarillo,
          colores.azul,
          colores.naranja
        ],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 10
      }
    ]
  };

  // Gráfico de métodos de pago
  const metodosPago = datos.montos.porMetodoPago || {};
  const labelsMetodos = Object.keys(metodosPago);
  const valoresMetodos = Object.values(metodosPago);

  const datosMetodosPago = {
    labels: labelsMetodos.map(m => m.replace('_', ' ').toUpperCase()),
    datasets: [
      {
        label: 'Monto',
        data: valoresMetodos,
        backgroundColor: colores.azul,
        borderRadius: 8,
        hoverBackgroundColor: colores.verde
      }
    ]
  };

  // Gráfico de equipos vendidos
  const datosEquipos = {
    labels: ['Stock', 'Canje'],
    datasets: [
      {
        data: [
          datos.equipos.vendidos.stockCantidad,
          datos.equipos.vendidos.canjeCantidad
        ],
        backgroundColor: [colores.azul, colores.amarillo],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 10
      }
    ]
  };

  const opcionesDona = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11 }
        }
      }
    },
    cutout: '60%'
  };

  const opcionesBarras = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${formatoMoneda(context.raw)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f0f0f0' },
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
          font: { size: 10 }
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      }
    }
  };

  return (
    <div>
      {/* Cards Principales */}
      <Row className="g-3 mb-4">
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #00A650' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">TOTAL PAGADO</small>
                  <h4 className="fw-bold mb-0" style={{ color: '#00A650' }}>{formatoMoneda(datos.montos.totalPagadoGeneral)}</h4>
                  <small className="text-muted">{formatoMoneda(datos.montos.totalMontoPagadoVentas)} en ventas + {formatoMoneda(datos.montos.totalMontoCuotasPagadas)} en cuotas</small>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#e6f4ea' }}>
                  <i className="bi bi-cash-coin" style={{ color: '#00A650', fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #FF7733' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">POR COBRAR</small>
                  <h4 className="fw-bold mb-0" style={{ color: '#FF7733' }}>{formatoMoneda(datos.cuotas.porCobrarMonto)}</h4>
                  <small className="text-muted">{datos.cuotas.porCobrarCantidad} cuotas pendientes</small>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#fff3ed' }}>
                  <i className="bi bi-clock" style={{ color: '#FF7733', fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #3483FA' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">EQUIPOS VENDIDOS</small>
                  <h4 className="fw-bold mb-0" style={{ color: '#3483FA' }}>{datos.equipos.vendidos.totalVendidos}</h4>
                  <small className="text-muted">{datos.equipos.totalEquiposStock} en stock total</small>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#e8f0fe' }}>
                  <i className="bi bi-phone" style={{ color: '#3483FA', fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #DC3545' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">GASTOS GENERALES</small>
                  <h4 className="fw-bold mb-0" style={{ color: '#DC3545' }}>{formatoMoneda(datos.gastos.totalGastosGenerales)}</h4>
                  <small className="text-muted">Total acumulado</small>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#fde8e8' }}>
                  <i className="bi bi-receipt" style={{ color: '#DC3545', fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row className="g-3 mb-4">
        <Col lg={4} md={12}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
                <i className="bi bi-pie-chart me-2" style={{ color: '#3483FA' }}></i>
                Ventas por Tipo
              </h6>
              <div style={{ height: '250px' }}>
                <Doughnut data={datosVentasTipo} options={opcionesDona} />
              </div>
              <div className="text-center mt-2">
                <small className="text-muted">Total: {datos.ventas.totalVentas} ventas</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={12}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
                <i className="bi bi-credit-card me-2" style={{ color: '#00A650' }}></i>
                Métodos de Pago
              </h6>
              <div style={{ height: '250px' }}>
                <Bar data={datosMetodosPago} options={opcionesBarras} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={12}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
                <i className="bi bi-phone me-2" style={{ color: '#FF7733' }}></i>
                Equipos Vendidos
              </h6>
              <div style={{ height: '250px' }}>
                <Doughnut data={datosEquipos} options={opcionesDona} />
              </div>
              <div className="text-center mt-2">
                <small className="text-muted">
                  Stock: {datos.equipos.vendidos.stockCantidad} · Canje: {datos.equipos.vendidos.canjeCantidad}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detalle de Cuotas */}
      <Row className="g-3">
        <Col lg={6} md={12}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
                <i className="bi bi-calendar-check me-2" style={{ color: '#3483FA' }}></i>
                Estado de Cuotas
              </h6>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#666' }}>Pagadas</span>
                <strong style={{ color: '#00A650' }}>{datos.cuotas.pagadasCantidad} · {formatoMoneda(datos.cuotas.pagadasMonto)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#666' }}>Pendientes</span>
                <strong style={{ color: '#FF7733' }}>{datos.cuotas.porCobrarCantidad} · {formatoMoneda(datos.cuotas.porCobrarMonto)}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-bold" style={{ color: '#333' }}>Valor Total de Ventas</span>
                <strong style={{ color: '#3483FA' }}>{formatoMoneda(datos.montos.totalMontoTotalVentas)}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} md={12}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
                <i className="bi bi-box-seam me-2" style={{ color: '#6F42C1' }}></i>
                Resumen de Equipos
              </h6>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#666' }}>Total en Stock</span>
                <strong>{datos.equipos.totalEquiposStock}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#666' }}>Vendidos Stock</span>
                <strong style={{ color: '#3483FA' }}>{datos.equipos.vendidos.stockCantidad}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#666' }}>Vendidos Canje</span>
                <strong style={{ color: '#FFC107' }}>{datos.equipos.vendidos.canjeCantidad}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-bold" style={{ color: '#333' }}>Costo Total Vendidos</span>
                <strong style={{ color: '#DC3545' }}>{formatoMoneda(datos.equipos.vendidos.costoTotalVendidos)}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
