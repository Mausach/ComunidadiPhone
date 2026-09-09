// src/Pages/Ceo/Componentes/reportes/SistemasReporte.jsx

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Alert, Badge, Table, Modal } from 'react-bootstrap';
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
import { obtenerVentasFinanciadas } from '../Helpers/ReportesMensuales';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
);

const formatoMoneda = (v) => !v && v !== 0 ? '$0' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
const formatoFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const SistemasReporte = () => {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [datos, setDatos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal de detalle de mes
  const [showModalMes, setShowModalMes] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState(null);
  const [ventasDelMes, setVentasDelMes] = useState([]);
  
  // Modal de detalle de venta
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
    // Filtrar ventas que tienen cuotas en ese mes
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

  // Datos para el gráfico de barras
  const datosGraficoBarras = {
    labels: datos.resumenAnual.map(m => m.nombre),
    datasets: [
      {
        label: 'A Cobrar',
        data: datos.resumenAnual.map(m => m.totalACobrar),
        backgroundColor: '#3483FA',
        borderRadius: 6,
      },
      {
        label: 'Cobrado',
        data: datos.resumenAnual.map(m => m.totalCobrado),
        backgroundColor: '#00A650',
        borderRadius: 6,
      },
      {
        label: 'Pendiente',
        data: datos.resumenAnual.map(m => m.totalPendiente),
        backgroundColor: '#FF7733',
        borderRadius: 6,
      }
    ]
  };

  // Datos para el gráfico de línea (porcentaje de cobranza)
  const datosGraficoLinea = {
    labels: datos.resumenAnual.map(m => m.nombre),
    datasets: [
      {
        label: 'Eficiencia de Cobranza',
        data: datos.resumenAnual.map(m => m.porcentajeCobranza),
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
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11 }
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

  const opcionesLinea = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.raw}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: '#f0f0f0' },
        ticks: {
          callback: (value) => `${value}%`,
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
      {/* Selector de Año */}
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
              <div className="d-flex justify-content-end gap-2">
                <Badge bg="primary" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
                  Total A Cobrar: {formatoMoneda(datos.totalesAnuales.totalACobrar)}
                </Badge>
                <Badge bg="success" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
                  Total Cobrado: {formatoMoneda(datos.totalesAnuales.totalCobrado)}
                </Badge>
                <Badge bg="warning" text="dark" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
                  Pendiente: {formatoMoneda(datos.totalesAnuales.totalPendiente)}
                </Badge>
                <Badge bg="danger" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
                  Recargos: {formatoMoneda(datos.totalesAnuales.totalRecargos)}
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Cards de Total Anual */}
      <Row className="g-3 mb-4">
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #3483FA' }}>
            <Card.Body>
              <small className="text-muted d-block mb-1">EFICIENCIA DE COBRANZA</small>
              <h3 className="fw-bold mb-0" style={{ color: datos.totalesAnuales.porcentajeCobranza >= 70 ? '#00A650' : datos.totalesAnuales.porcentajeCobranza >= 50 ? '#FF7733' : '#DC3545' }}>
                {datos.totalesAnuales.porcentajeCobranza}%
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #6F42C1' }}>
            <Card.Body>
              <small className="text-muted d-block mb-1">ENTREGAS FUTURAS</small>
              <h3 className="fw-bold mb-0" style={{ color: '#6F42C1' }}>
                {datos.cantidadEntregasFuturas}
              </h3>
              <small className="text-muted">Sistema 2</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row className="g-3 mb-4">
        <Col lg={8} md={12}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
                <i className="bi bi-bar-chart me-2" style={{ color: '#3483FA' }}></i>
                Comparativa Anual
              </h6>
              <div style={{ height: '300px' }}>
                <Bar data={datosGraficoBarras} options={opcionesBarras} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={12}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
                <i className="bi bi-graph-up me-2" style={{ color: '#6F42C1' }}></i>
                Eficiencia por Mes
              </h6>
              <div style={{ height: '300px' }}>
                <Line data={datosGraficoLinea} options={opcionesLinea} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Grilla de 12 meses */}
      <Row className="g-3 mb-4">
        {datos.resumenAnual.map(mes => (
          <Col xl={3} lg={4} md={6} key={mes.mes}>
            <Card 
              className="shadow-sm border-0 h-100" 
              style={{ 
                borderRadius: '12px', 
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: `4px solid ${mes.porcentajeCobranza >= 70 ? '#00A650' : mes.porcentajeCobranza >= 50 ? '#FF7733' : '#DC3545'}`
              }}
              onClick={() => handleVerMes(mes)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0" style={{ color: '#333' }}>{mes.nombre}</h6>
                  <Badge bg={mes.porcentajeCobranza >= 70 ? 'success' : mes.porcentajeCobranza >= 50 ? 'warning' : 'danger'}>
                    {mes.porcentajeCobranza}%
                  </Badge>
                </div>
                <div className="mb-2">
                  <small className="text-muted d-block">A Cobrar</small>
                  <strong style={{ color: '#3483FA', fontSize: '0.9rem' }}>{formatoMoneda(mes.totalACobrar)}</strong>
                </div>
                <div className="mb-2">
                  <small className="text-muted d-block">Cobrado</small>
                  <strong style={{ color: '#00A650', fontSize: '0.9rem' }}>{formatoMoneda(mes.totalCobrado)}</strong>
                </div>
                <div className="mb-2">
                  <small className="text-muted d-block">Pendiente</small>
                  <strong style={{ color: '#FF7733', fontSize: '0.9rem' }}>{formatoMoneda(mes.totalPendiente)}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">{mes.cantidadCuotas} cuotas</small>
                  {mes.totalRecargos > 0 && (
                    <small style={{ color: '#DC3545' }}>
                      <i className="bi bi-percent me-1"></i>
                      {formatoMoneda(mes.totalRecargos)}
                    </small>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Entregas Futuras */}
      {datos.entregasFuturas.length > 0 && (
        <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
          <Card.Body>
            <h6 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
              <i className="bi bi-truck me-2" style={{ color: '#6F42C1' }}></i>
              Entregas Futuras (Sistema 2)
            </h6>
            <div className="table-responsive">
              <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead className="bg-light">
                  <tr>
                    <th>Cliente</th>
                    <th>Producto</th>
                    <th>Fecha Entrega</th>
                    <th>Cuota Entrega</th>
                    <th>Estado</th>
                    <th>Monto Total</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.entregasFuturas.map((entrega, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: '500', color: '#333' }}>
                          {entrega.cliente.nombre} {entrega.cliente.apellido}
                        </div>
                        <small className="text-muted">DNI: {entrega.cliente.dni}</small>
                      </td>
                      <td>
                        <div style={{ color: '#333' }}>{entrega.producto.nombre}</div>
                        <small className="text-muted">{entrega.producto.modelo} · {entrega.producto.capacidad}</small>
                      </td>
                      <td>
                        <Badge bg="info">{formatoFecha(entrega.fechaEntrega)}</Badge>
                      </td>
                      <td>
                        {entrega.cuotaEntrega ? (
                          <>
                            <Badge bg="warning" text="dark">Cuota {entrega.cuotaEntrega.numeroCuota}</Badge>
                            <small className="text-muted d-block">{formatoFecha(entrega.cuotaEntrega.fechaCobro)}</small>
                          </>
                        ) : '-'}
                      </td>
                      <td>
                        <Badge bg={
                          entrega.conducta_pago === 'al dia' ? 'success' :
                          entrega.conducta_pago === 'atrasado' ? 'danger' :
                          'secondary'
                        }>
                          {entrega.conducta_pago}
                        </Badge>
                      </td>
                      <td>
                        <strong style={{ color: '#3483FA' }}>{formatoMoneda(entrega.montoTotal)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modal Detalle de Mes */}
      <Modal show={showModalMes} onHide={() => setShowModalMes(false)} size="xl" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className="bi bi-calendar-month me-2" style={{ color: '#3483FA' }}></i>
            {mesSeleccionado?.nombre} - Detalle
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ventasDelMes.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="align-middle" style={{ fontSize: '0.85rem' }}>
                <thead className="bg-light">
                  <tr>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Producto</th>
                    <th>Cuotas</th>
                    <th>Monto Total</th>
                    <th>Pagado</th>
                    <th>Pendiente</th>
                    <th>Conducta</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasDelMes.map((venta, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: '500', color: '#333' }}>
                          {venta.cliente?.nombre} {venta.cliente?.apellido}
                        </div>
                        <small className="text-muted">DNI: {venta.cliente?.dni}</small>
                      </td>
                      <td>
                        <Badge bg={venta.tipoVenta === 'sistema1' ? 'primary' : 'warning'} text={venta.tipoVenta === 'sistema1' ? 'white' : 'dark'}>
                          {venta.tipoVenta === 'sistema1' ? 'Sistema 1' : 'Sistema 2'}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ color: '#333' }}>{venta.producto?.nombre}</div>
                        <small className="text-muted">{venta.producto?.modelo}</small>
                      </td>
                      <td>{venta.cuotas?.length || 0}</td>
                      <td><strong>{formatoMoneda(venta.montoTotal)}</strong></td>
                      <td style={{ color: '#00A650' }}>{formatoMoneda(venta.montoPagado)}</td>
                      <td style={{ color: '#FF7733' }}>{formatoMoneda(venta.montoPendiente)}</td>
                      <td>
                        <Badge bg={
                          venta.conducta_pago === 'al dia' ? 'success' :
                          venta.conducta_pago === 'atrasado' ? 'danger' :
                          'secondary'
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
            <p className="text-muted text-center py-4">No hay ventas con cuotas en este mes</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal Detalle de Venta */}
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
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">Tipo</small>
                    <Badge bg={ventaDetalle.tipoVenta === 'sistema1' ? 'primary' : 'warning'}>
                      {ventaDetalle.tipoVenta === 'sistema1' ? 'Sistema 1' : 'Sistema 2'}
                    </Badge>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">Producto</small>
                    <span>{ventaDetalle.producto?.nombre} {ventaDetalle.producto?.modelo}</span>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted d-block">Fecha</small>
                    <span>{formatoFecha(ventaDetalle.fechaRealizada)}</span>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}>Cuotas</h6>
              <div className="table-responsive">
                <Table size="sm" className="mb-0" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Monto</th>
                      <th>Pagado</th>
                      <th>Pendiente</th>
                      <th>Estado</th>
                      <th>Recargos</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventaDetalle.cuotas?.map((cuota, idx) => (
                      <tr key={idx}>
                        <td>{cuota.numeroCuota}</td>
                        <td>{formatoMoneda(cuota.montoCuota)}</td>
                        <td style={{ color: '#00A650' }}>{formatoMoneda(cuota.montoPagado)}</td>
                        <td style={{ color: '#FF7733' }}>{formatoMoneda(cuota.saldoPendiente)}</td>
                        <td>
                          <Badge bg={
                            cuota.estadoCuota === 'pagada' ? 'success' :
                            cuota.estadoCuota === 'pago parcial' ? 'warning' :
                            cuota.estadoCuota === 'no pagada' ? 'danger' : 'secondary'
                          }>
                            {cuota.estadoCuota}
                          </Badge>
                        </td>
                        <td style={{ color: '#DC3545' }}>{cuota.totalRecargos > 0 ? formatoMoneda(cuota.totalRecargos) : '-'}</td>
                        <td>{formatoFecha(cuota.fechaCobro)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
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
