
import { obtenerVentasDirectasCanje } from '../Helpers/ReportesMensuales';

// src/Pages/Ceo/Componentes/reportes/VentasDirectas.jsx

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Spinner, Alert, Modal, Table } from 'react-bootstrap';
import { Doughnut, Bar } from 'react-chartjs-2';
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
  const [datos, setDatos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  
  // Modal detalle
  const [showModalVenta, setShowModalVenta] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsLoading(true);
    setError('');
    try {
      const resp = await obtenerVentasDirectasCanje();
      setDatos(resp.data);
    } catch (err) {
      setError(err.message || 'Error al cargar el reporte');
    } finally {
      setIsLoading(false);
    }
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

  // Filtrar ventas
  const ventasFiltradas = datos.ventas.filter(venta => {
    if (filtroTipo !== 'todas' && venta.tipoVenta !== filtroTipo) return false;
    if (busqueda.trim()) {
      const t = busqueda.toLowerCase();
      const nombreCompleto = `${venta.cliente?.nombre} ${venta.cliente?.apellido}`.toLowerCase();
      if (!nombreCompleto.includes(t) && !venta.cliente?.dni?.includes(t) && !venta.producto?.nombre?.toLowerCase().includes(t)) {
        return false;
      }
    }
    return true;
  });

  // Datos para gráfico de torta
  const datosTorta = {
    labels: ['Contado', 'Plan Canje'],
    datasets: [
      {
        data: [
          datos.resumen.contado.cantidad,
          datos.resumen.plan_canje.cantidad
        ],
        backgroundColor: ['#00A650', '#FFE600'],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 10
      }
    ]
  };

  // Datos para gráfico de barras (montos)
  const datosBarras = {
    labels: ['Contado', 'Plan Canje'],
    datasets: [
      {
        label: 'Monto Pagado',
        data: [
          datos.resumen.contado.montoPagado,
          datos.resumen.plan_canje.montoPagado
        ],
        backgroundColor: '#00A650',
        borderRadius: 8,
      },
      {
        label: 'Descuentos',
        data: [
          datos.resumen.contado.descuentos,
          datos.resumen.plan_canje.descuentos
        ],
        backgroundColor: '#FF7733',
        borderRadius: 8,
      }
    ]
  };

  const opcionesTorta = {
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

  // Métodos de pago del resumen
  const metodosPagoResumen = datos.resumen.totales.metodosPago || {};

  return (
    <div>
      {/* Cards de Resumen */}
      <Row className="g-3 mb-4">
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #3483FA' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">TOTAL VENTAS</small>
                  <h3 className="fw-bold mb-0" style={{ color: '#3483FA' }}>{datos.resumen.totalVentas}</h3>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#e8f0fe' }}>
                  <i className="bi bi-cart-check" style={{ color: '#3483FA', fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #00A650' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">TOTAL PAGADO</small>
                  <h3 className="fw-bold mb-2" style={{ color: '#00A650' }}>{formatoMoneda(datos.resumen.totales.montoPagado)}</h3>
                  
                  {/* Desglose por método de pago */}
                  {Object.keys(metodosPagoResumen).length > 0 && (
                    <div className="mt-2">
                      {Object.entries(metodosPagoResumen).map(([metodo, monto]) => {
                        const config = metodosPagoConfig[metodo] || metodosPagoConfig.otro;
                        return (
                          <div key={metodo} className="d-flex justify-content-between align-items-center py-1" style={{ borderBottom: '1px solid #f5f5f5' }}>
                            <small className="text-muted">
                              <i className={`bi ${config.icon} me-1`} style={{ color: config.color }}></i>
                              {config.label}:
                            </small>
                            <small className="fw-semibold" style={{ color: '#333' }}>
                              {formatoMoneda(monto)}
                            </small>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                  <small className="text-muted d-block mb-1">TOTAL DESCUENTOS</small>
                  <h3 className="fw-bold mb-0" style={{ color: '#FF7733' }}>{formatoMoneda(datos.resumen.totales.descuentos)}</h3>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#fff3ed' }}>
                  <i className="bi bi-tag" style={{ color: '#FF7733', fontSize: '1.2rem' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #FFC107' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-muted d-block mb-1">VALOR TASADO CANJES</small>
                  <h3 className="fw-bold mb-0" style={{ color: '#1a1a1a' }}>{formatoMoneda(datos.resumen.totales.valorTasadoCanjes)}</h3>
                  <small className="text-muted">{datos.resumen.totales.cantidadCanjeDisponibles || 0} equipos disponibles</small>
                </div>
                <div className="rounded-circle p-2" style={{ backgroundColor: '#fffbe6' }}>
                  <i className="bi bi-arrow-repeat" style={{ color: '#FFC107', fontSize: '1.2rem' }}></i>
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
                Distribución de Ventas
              </h6>
              <div style={{ height: '250px' }}>
                <Doughnut data={datosTorta} options={opcionesTorta} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8} md={12}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
                <i className="bi bi-bar-chart me-2" style={{ color: '#00A650' }}></i>
                Montos Pagados vs Descuentos
              </h6>
              <div style={{ height: '250px' }}>
                <Bar data={datosBarras} options={opcionesBarras} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-3" style={{ borderRadius: '12px' }}>
        <Card.Body className="p-3">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <small className="text-muted d-block mb-1">Filtrar por tipo</small>
              <div className="d-flex gap-2">
                <Button 
                  variant={filtroTipo === 'todas' ? 'primary' : 'outline-primary'} 
                  size="sm" 
                  onClick={() => setFiltroTipo('todas')}
                  className="rounded-3"
                >
                  Todas
                </Button>
                <Button 
                  variant={filtroTipo === 'contado' ? 'success' : 'outline-success'} 
                  size="sm" 
                  onClick={() => setFiltroTipo('contado')}
                  className="rounded-3"
                >
                  Contado
                </Button>
                <Button 
                  variant={filtroTipo === 'plan_canje' ? 'warning' : 'outline-warning'} 
                  size="sm" 
                  onClick={() => setFiltroTipo('plan_canje')}
                  className="rounded-3"
                >
                  Plan Canje
                </Button>
              </div>
            </Col>
            <Col md={4}>
              <small className="text-muted d-block mb-1">Buscar</small>
              <input 
                type="text" 
                className="form-control rounded-3" 
                placeholder="Cliente, DNI, producto..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ fontSize: '0.9rem' }}
              />
            </Col>
            <Col md={4} className="text-end">
              <small className="text-muted">{ventasFiltradas.length} ventas</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de Ventas */}
      <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
              <thead className="bg-light">
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Producto</th>
                  <th>Canje Recibido</th>
                  <th>Monto Total</th>
                  <th>Pagado</th>
                  <th>Descuentos</th>
                  <th>Pendiente</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map((venta, idx) => (
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
                    <td>
                      {venta.tipoVenta === 'plan_canje' && venta.equiposCanje && venta.equiposCanje.length > 0 ? (
                        venta.equiposCanje.map((equipo, eqIdx) => (
                          <div key={eqIdx} className="mb-1">
                            <div style={{ color: '#333', fontSize: '0.8rem' }}>
                              {equipo.nombre} {equipo.modelo}
                            </div>
                            <Badge bg="warning" text="dark" style={{ fontSize: '0.7rem' }}>
                              Tasado: {formatoMoneda(equipo.valorTasado)}
                            </Badge>
                          </div>
                        ))
                      ) : '-'}
                    </td>
                    <td><strong>{formatoMoneda(venta.montoTotal)}</strong></td>
                    <td style={{ color: '#00A650' }}>{formatoMoneda(venta.montoPagado)}</td>
                    <td style={{ color: '#FF7733' }}>{venta.totalDescuentos > 0 ? formatoMoneda(venta.totalDescuentos) : '-'}</td>
                    <td>
                      {venta.tipoVenta === 'plan_canje' && venta.montoPendienteReal !== undefined ? (
                        venta.montoPendienteReal > 0 ? (
                          <span style={{ color: '#DC3545', fontWeight: '500' }}>
                            {formatoMoneda(venta.montoPendienteReal)}
                          </span>
                        ) : (
                          <Badge bg="success">Saldado</Badge>
                        )
                      ) : (
                        venta.montoPendiente > 0 ? (
                          <span style={{ color: '#DC3545' }}>{formatoMoneda(venta.montoPendiente)}</span>
                        ) : '-'
                      )}
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
        </Card.Body>
      </Card>

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


