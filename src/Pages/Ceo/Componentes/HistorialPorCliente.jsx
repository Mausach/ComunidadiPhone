// src/Pages/Ceo/Componentes/HistorialCuotas.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Badge, ProgressBar, Collapse, Spinner, Alert } from 'react-bootstrap';
import { obtenerHistorialCuotas } from '../Helpers/ReportesMensuales';
import { buscarVentas, filtrarPorConducta, filtrarVentasPorLocalidad } from '../Helpers/HistorialClientes';
import { extraerLocalidades } from '../Helpers/Procesar_Reportes';


export const HistorialCuotas = () => {
  // Estados
  const [ventas, setVentas] = useState([]);
  const [totalesGenerales, setTotalesGenerales] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroConducta, setFiltroConducta] = useState('todas');
  const [filtroLocalidad, setFiltroLocalidad] = useState('todas');
  const [filtroFrecuencia, setFiltroFrecuencia] = useState('todas');
  
  // UI
  const [ventasExpandidas, setVentasExpandidas] = useState({});

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await obtenerHistorialCuotas();
      setVentas(data.ventas); // frecuenciaCuota ya viene del backend
      setTotalesGenerales(data.totalesGenerales);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Extraer localidades únicas
  const localidades = useMemo(() => {
    return extraerLocalidades(ventas.map(v => ({ localidad: v.localidad })));
  }, [ventas]);

  // Filtrar ventas
  const ventasFiltradas = useMemo(() => {
    let resultado = ventas;
    
    // Búsqueda por texto
    resultado = buscarVentas(resultado, busqueda);
    
    // Filtro por localidad
    if (filtroLocalidad !== 'todas') {
      resultado = filtrarVentasPorLocalidad(resultado, filtroLocalidad);
    }
    
    // Filtro por conducta de pago
    if (filtroConducta !== 'todas') {
      resultado = resultado.filter(v => v.conducta_pago === filtroConducta);
    }
    
    // Filtro por frecuencia (viene del backend como frecuenciaCuota)
    if (filtroFrecuencia !== 'todas') {
      resultado = resultado.filter(v => v.frecuenciaCuota === filtroFrecuencia);
    }
    
    return resultado;
  }, [ventas, busqueda, filtroConducta, filtroLocalidad, filtroFrecuencia]);

  const toggleVenta = (idVenta) => {
    setVentasExpandidas(prev => ({
      ...prev,
      [idVenta]: !prev[idVenta]
    }));
  };

  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const formatoFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Badge de frecuencia
  const badgeFrecuencia = (frecuencia) => {
    const config = {
      'diario': { color: '#e83e8c', bg: '#fde8f1', label: 'Diario', icono: 'bi-calendar-day' },
      'semanal': { color: '#6c5ce7', bg: '#f0edff', label: 'Semanal', icono: 'bi-calendar-week' },
      'quincenal': { color: '#3483FA', bg: '#e8f0fe', label: 'Quincenal', icono: 'bi-calendar2-week' },
      'mensual': { color: '#00a650', bg: '#e6f7ee', label: 'Mensual', icono: 'bi-calendar-month' }
    };
    const c = config[frecuencia] || { color: '#666', bg: '#f5f5f5', label: frecuencia, icono: 'bi-calendar' };

    return (
      <Badge
        style={{
          backgroundColor: c.bg,
          color: c.color,
          fontWeight: '500',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.7rem'
        }}
      >
        <i className={`${c.icono} me-1`}></i>
        {c.label}
      </Badge>
    );
  };

  // Badge de conducta
  const badgeConducta = (conducta) => {
    const config = {
      'al dia': { color: '#00a650', bg: '#e6f7ee', label: 'Al día', icono: 'bi-check-circle-fill' },
      'cancelado': { color: '#3483FA', bg: '#e8f0fe', label: 'Cancelado', icono: 'bi-check-all' },
      'refinanciado': { color: '#6c5ce7', bg: '#f0edff', label: 'Refinanciado', icono: 'bi-arrow-repeat' },
      'atrasado': { color: '#ff7733', bg: '#fff3ed', label: 'Atrasado', icono: 'bi-exclamation-triangle-fill' },
      'cobro judicial': { color: '#dc3545', bg: '#ffeaea', label: 'Cobro Judicial', icono: 'bi-file-earmark-x-fill' },
      'caducado': { color: '#999', bg: '#f5f5f5', label: 'Caducado', icono: 'bi-x-circle-fill' }
    };
    const c = config[conducta] || { color: '#666', bg: '#f5f5f5', label: conducta, icono: 'bi-question-circle' };

    return (
      <Badge
        style={{
          backgroundColor: c.bg,
          color: c.color,
          fontWeight: '500',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '0.75rem'
        }}
      >
        <i className={`${c.icono} me-1`}></i>
        {c.label}
      </Badge>
    );
  };

  const badgeEstadoCuota = (estado) => {
    const config = {
      'pagada': { color: '#00a650', bg: '#e6f7ee', label: 'Pagada', icono: 'bi-check-circle-fill' },
      'pendiente': { color: '#ff7733', bg: '#fff3ed', label: 'Pendiente', icono: 'bi-clock-fill' },
      'no pagada': { color: '#dc3545', bg: '#ffeaea', label: 'Vencida', icono: 'bi-x-circle-fill' }
    };
    const c = config[estado] || { color: '#666', bg: '#f5f5f5', label: estado, icono: 'bi-question-circle-fill' };

    return (
      <Badge
        style={{
          backgroundColor: c.bg,
          color: c.color,
          fontWeight: '500',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.7rem'
        }}
      >
        <i className={`${c.icono} me-1`}></i>
        {c.label}
      </Badge>
    );
  };

  // Loading
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: '#3483FA' }} />
        <p className="text-muted mt-3">Cargando historial de cuotas...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <Alert 
        variant="danger" 
        className="shadow-sm border-0"
        style={{ borderRadius: '8px' }}
      >
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
        <button
          onClick={cargarDatos}
          className="btn btn-link btn-sm ms-3"
          style={{ color: '#dc3545', textDecoration: 'underline' }}
        >
          Reintentar
        </button>
      </Alert>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: '#1a1a1a' }}>
          <i className="bi bi-clock-history me-2" style={{ color: '#1a1a1a' }}></i>
          Historial de Cuotas
        </h3>
        <p className="text-muted">
          Seguimiento completo de todas las ventas y sus cuotas
        </p>
      </div>

      {/* Cards de Totales Generales */}
      {totalesGenerales && (
        <Row className="mb-4 g-3">
          <Col lg={2} md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
              <Card.Body className="p-3 text-center">
                <h3 className="fw-bold mb-0" style={{ color: '#3483FA' }}>{totalesGenerales.totalVentas}</h3>
                <small style={{ color: '#999' }}>Total Ventas</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
              <Card.Body className="p-3 text-center">
                <h3 className="fw-bold mb-0" style={{ color: '#333' }}>{totalesGenerales.totalCuotas}</h3>
                <small style={{ color: '#999' }}>Total Cuotas</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #00a650' }}>
              <Card.Body className="p-3 text-center">
                <h3 className="fw-bold mb-0" style={{ color: '#00a650' }}>{totalesGenerales.totalCuotasPagadas}</h3>
                <small style={{ color: '#999' }}>Pagadas</small>
                <div style={{ fontSize: '0.8rem', color: '#00a650', fontWeight: '500' }}>
                  {formatoMoneda(totalesGenerales.montoPagadoGeneral)}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #ff7733' }}>
              <Card.Body className="p-3 text-center">
                <h3 className="fw-bold mb-0" style={{ color: '#ff7733' }}>{totalesGenerales.totalCuotasPendientes}</h3>
                <small style={{ color: '#999' }}>Pendientes</small>
                <div style={{ fontSize: '0.8rem', color: '#ff7733', fontWeight: '500' }}>
                  {formatoMoneda(totalesGenerales.montoPendienteGeneral)}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
              <Card.Body className="p-3 text-center">
                <h3 className="fw-bold mb-0" style={{ color: '#dc3545' }}>{totalesGenerales.totalCuotasNoPagadas}</h3>
                <small style={{ color: '#999' }}>Vencidas</small>
                <div style={{ fontSize: '0.8rem', color: '#dc3545', fontWeight: '500' }}>
                  {formatoMoneda(totalesGenerales.montoNoPagadoGeneral)}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
              <Card.Body className="p-3 text-center">
                <h4 className="fw-bold mb-0" style={{ color: '#333' }}>
                  {formatoMoneda(totalesGenerales.montoTotalGeneral)}
                </h4>
                <small style={{ color: '#999' }}>Monto Total</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
        <Card.Body className="p-3">
          <Row className="g-3 align-items-end">
            {/* Búsqueda */}
            <Col lg={3} md={6}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e5e5' }}>
                  <i className="bi bi-search" style={{ color: '#999' }}></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar cliente, producto o localidad..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{
                    border: '1px solid #e5e5e5',
                    fontSize: '0.9rem',
                    padding: '10px 12px'
                  }}
                />
              </InputGroup>
            </Col>

            {/* Localidad */}
            <Col lg={2} md={6}>
              <Form.Select
                value={filtroLocalidad}
                onChange={(e) => setFiltroLocalidad(e.target.value)}
                style={{
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  padding: '10px 12px'
                }}
              >
                <option value="todas">Todas las localidades</option>
                {localidades.map(loc => (
                  <option key={loc} value={loc}>
                    {loc.charAt(0).toUpperCase() + loc.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Col>

            {/* Conducta */}
            <Col lg={2} md={6}>
              <Form.Select
                value={filtroConducta}
                onChange={(e) => setFiltroConducta(e.target.value)}
                style={{
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  padding: '10px 12px'
                }}
              >
                <option value="todas">Todas las conductas</option>
                <option value="al dia">✅ Al día</option>
                <option value="cancelado">🔵 Cancelado</option>
                <option value="refinanciado">🟣 Refinanciado</option>
                <option value="atrasado">🟠 Atrasado</option>
                <option value="cobro judicial">🔴 Cobro Judicial</option>
                <option value="caducado">⚫ Caducado</option>
              </Form.Select>
            </Col>

            {/* Frecuencia */}
            <Col lg={2} md={6}>
              <Form.Select
                value={filtroFrecuencia}
                onChange={(e) => setFiltroFrecuencia(e.target.value)}
                style={{
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  padding: '10px 12px'
                }}
              >
                <option value="todas">Todas las frecuencias</option>
                <option value="diario">📅 Diario</option>
                <option value="semanal">📅 Semanal</option>
                <option value="quincenal">📅 Quincenal</option>
                <option value="mensual">📅 Mensual</option>
              </Form.Select>
            </Col>

            {/* Contador */}
            <Col lg={3} md={6} className="d-flex align-items-end">
              <small style={{ color: '#999' }}>
                {ventasFiltradas.length} de {ventas.length} ventas
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Ventas */}
      {ventasFiltradas.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <p className="text-muted mt-3">No se encontraron ventas con los filtros aplicados</p>
        </div>
      ) : (
        ventasFiltradas.map((venta) => {
          const expandido = ventasExpandidas[venta.idVenta] || false;

          return (
            <Card 
              key={venta.idVenta}
              className="shadow-sm border-0 mb-3"
              style={{ borderRadius: '8px' }}
            >
              <Card.Body className="p-0">
                {/* Header de Venta */}
                <div 
                  className="p-3"
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: expandido ? '#f8f9fa' : '#fff',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => toggleVenta(venta.idVenta)}
                >
                  <Row className="align-items-center">
                    {/* Avatar + Cliente */}
                    <Col lg={3} md={4}>
                      <div className="d-flex align-items-center">
                        <div 
                          className="d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: venta.porcentajeCobrado === 100 ? '#e6f7ee' : 
                                            venta.porcentajeCobrado >= 50 ? '#fff3ed' : '#ffeaea',
                            color: venta.porcentajeCobrado === 100 ? '#00a650' : 
                                   venta.porcentajeCobrado >= 50 ? '#ff7733' : '#dc3545',
                            fontWeight: '600',
                            fontSize: '1rem'
                          }}
                        >
                          {venta.cliente.nombre.charAt(0)}{venta.cliente.apellido.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>
                            {venta.cliente.apellido}, {venta.cliente.nombre}
                          </div>
                          <small style={{ color: '#999', fontSize: '0.8rem' }}>
                            {venta.localidad} · {venta.vendedor ? `Vend: ${venta.vendedor}` : ''}
                          </small>
                        </div>
                      </div>
                    </Col>

                    {/* Producto + Badges */}
                    <Col lg={3} md={4}>
                      <div style={{ color: '#666', fontSize: '0.85rem' }}>
                        <i className="bi bi-box me-1"></i>
                        {venta.producto}
                      </div>
                      <div className="d-flex align-items-center mt-1" style={{ gap: '6px' }}>
                        {badgeConducta(venta.conducta_pago)}
                        {badgeFrecuencia(venta.frecuenciaCuota)}
                      </div>
                    </Col>

                    {/* Progreso */}
                    <Col lg={3} md={4}>
                      <div className="d-flex justify-content-between mb-1">
                        <small style={{ color: '#666', fontWeight: '500' }}>
                          {venta.cuotasPagadas}/{venta.totalCuotas} cuotas
                        </small>
                        <small style={{ 
                          color: venta.porcentajeCobrado === 100 ? '#00a650' : '#666', 
                          fontWeight: '600' 
                        }}>
                          {venta.porcentajeCobrado}%
                        </small>
                      </div>
                      <ProgressBar 
                        now={venta.porcentajeCobrado} 
                        style={{ 
                          height: '6px', 
                          borderRadius: '3px',
                          backgroundColor: '#f0f0f0'
                        }}
                        variant={
                          venta.porcentajeCobrado === 100 ? 'success' : 
                          venta.porcentajeCobrado >= 50 ? 'warning' : 'danger'
                        }
                      />
                      <div className="d-flex justify-content-between mt-1">
                        <small style={{ color: '#00a650', fontSize: '0.7rem' }}>
                          {formatoMoneda(venta.montoPagado)}
                        </small>
                        <small style={{ color: '#dc3545', fontSize: '0.7rem' }}>
                          {venta.montoNoPagado > 0 ? formatoMoneda(venta.montoNoPagado) : ''}
                        </small>
                      </div>
                    </Col>

                    {/* Monto Total */}
                    <Col lg={2} md={4}>
                      <div style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>
                        {formatoMoneda(venta.montoTotal)}
                      </div>
                      <small style={{ color: '#999', fontSize: '0.75rem' }}>
                        {venta.tipoVenta}
                      </small>
                    </Col>

                    {/* Expandir */}
                    <Col lg={1} md={4} className="text-end">
                      <i 
                        className={`bi bi-chevron-${expandido ? 'up' : 'down'}`}
                        style={{ color: '#666' }}
                      ></i>
                    </Col>
                  </Row>
                </div>

                {/* Detalle de Cuotas */}
                <Collapse in={expandido}>
                  <div>
                    <div style={{ borderTop: '1px solid #e5e5e5' }} className="p-3">
                      {/* Mini resumen */}
                      <Row className="mb-3 g-2">
                        <Col xs={6} md={3}>
                          <small style={{ color: '#999' }}>Pagadas:</small>
                          <span style={{ color: '#00a650', fontWeight: '600', marginLeft: '6px' }}>
                            {venta.cuotasPagadas} ({formatoMoneda(venta.montoPagado)})
                          </span>
                        </Col>
                        <Col xs={6} md={3}>
                          <small style={{ color: '#999' }}>Pendientes:</small>
                          <span style={{ color: '#ff7733', fontWeight: '600', marginLeft: '6px' }}>
                            {venta.cuotasPendientes} ({formatoMoneda(venta.montoPendiente)})
                          </span>
                        </Col>
                        <Col xs={6} md={3}>
                          <small style={{ color: '#999' }}>Vencidas:</small>
                          <span style={{ color: '#dc3545', fontWeight: '600', marginLeft: '6px' }}>
                            {venta.cuotasNoPagadas} ({formatoMoneda(venta.montoNoPagado)})
                          </span>
                        </Col>
                        <Col xs={6} md={3}>
                          <small style={{ color: '#999' }}>Total:</small>
                          <span style={{ color: '#333', fontWeight: '600', marginLeft: '6px' }}>
                            {formatoMoneda(venta.montoTotal)}
                          </span>
                        </Col>
                      </Row>

                      {/* Tabla de cuotas */}
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>#</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Monto</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Vencimiento</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Estado</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Cobrado el</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Método</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Cobrador</th>
                            </tr>
                          </thead>
                          <tbody>
                            {venta.detalleCuotas.map((cuota, idx) => (
                              <tr 
                                key={idx}
                                style={{ 
                                  borderBottom: '1px solid #f5f5f5',
                                  backgroundColor: cuota.estadoCuota === 'no pagada' ? '#fff5f5' : 
                                                  cuota.estadoCuota === 'pendiente' ? '#fffaf5' : 'transparent'
                                }}
                              >
                                <td style={{ fontWeight: '500', color: '#333' }}>
                                  {cuota.numeroCuota}
                                </td>
                                <td style={{ fontWeight: '500' }}>
                                  {formatoMoneda(cuota.montoCuota)}
                                </td>
                                <td style={{ color: '#666' }}>
                                  {formatoFecha(cuota.fechaCobro)}
                                </td>
                                <td>
                                  {badgeEstadoCuota(cuota.estadoCuota)}
                                </td>
                                <td style={{ color: cuota.fechaCobrada ? '#00a650' : '#999' }}>
                                  {formatoFecha(cuota.fechaCobrada)}
                                </td>
                                <td style={{ color: '#666' }}>
                                  {cuota.metodoPago || '-'}
                                </td>
                                <td style={{ color: '#666' }}>
                                  {cuota.cobrador || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </Collapse>
              </Card.Body>
            </Card>
          );
        })
      )}
    </Container>
  );
};