// src/Pages/Ceo/Componentes/HistorialCuotas.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Badge, ProgressBar, Collapse, Spinner, Alert } from 'react-bootstrap';
import { obtenerHistorialCuotas } from '../Helpers/ReportesMensuales';
import { buscarVentas, filtrarPorConducta, filtrarVentasPorLocalidad } from '../Helpers/HistorialClientes';
import { extraerLocalidades } from '../Helpers/Procesar_Reportes';


// src/Pages/Ceo/Componentes/HistorialCuotas.jsx


export const HistorialCuotas = () => {
  const [ventas, setVentas] = useState([]);
  const [totalesGenerales, setTotalesGenerales] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroConducta, setFiltroConducta] = useState('todas');
  const [filtroLocalidad, setFiltroLocalidad] = useState('todas');
  const [filtroFrecuencia, setFiltroFrecuencia] = useState('todas');
  
  const [ventasExpandidas, setVentasExpandidas] = useState({});

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setIsLoading(true); setError('');
    try {
      const data = await obtenerHistorialCuotas();
      setVentas(data.ventas);
      setTotalesGenerales(data.totalesGenerales);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const localidades = useMemo(() => extraerLocalidades(ventas.map(v => ({ localidad: v.localidad }))), [ventas]);

  const ventasFiltradas = useMemo(() => {
    let resultado = ventas;
    resultado = buscarVentas(resultado, busqueda);
    if (filtroLocalidad !== 'todas') resultado = filtrarVentasPorLocalidad(resultado, filtroLocalidad);
    if (filtroConducta !== 'todas') resultado = resultado.filter(v => v.conducta_pago === filtroConducta);
    if (filtroFrecuencia !== 'todas') resultado = resultado.filter(v => v.frecuenciaCuota === filtroFrecuencia);
    return resultado;
  }, [ventas, busqueda, filtroConducta, filtroLocalidad, filtroFrecuencia]);

  const toggleVenta = (idVenta) => setVentasExpandidas(prev => ({ ...prev, [idVenta]: !prev[idVenta] }));

  const formatoMoneda = (v) => !v && v !== 0 ? '$0' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
  const formatoFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // ==========================================
  // BADGES
  // ==========================================
  const badgeFrecuencia = (f) => {
    const v = { 'diario': 'danger', 'semanal': 'purple', 'quincenal': 'primary', 'mensual': 'success' };
    const l = { 'diario': 'Diario', 'semanal': 'Semanal', 'quincenal': 'Quincenal', 'mensual': 'Mensual' };
    if (!f) return <Badge bg="secondary" className="me-1">S/F</Badge>;
    return <Badge bg={v[f] || 'secondary'} className="me-1">{l[f] || f}</Badge>;
  };

  const badgeConducta = (c) => {
    const v = { 'al dia': 'success', 'cancelado': 'primary', 'refinanciado': 'warning', 'atrasado': 'danger', 'cobro judicial': 'dark', 'caducado': 'secondary' };
    const l = { 'al dia': 'Al día', 'cancelado': 'Cancelado', 'refinanciado': 'Refinanciado', 'atrasado': 'Atrasado', 'cobro judicial': 'Cobro Judicial', 'caducado': 'Caducado' };
    return <Badge bg={v[c] || 'secondary'} className="me-1">{l[c] || c}</Badge>;
  };

  const badgeEstadoCuota = (e) => {
    const v = { 'pagada': 'success', 'pendiente': 'warning', 'pago parcial': 'info', 'no pagada': 'danger' };
    const l = { 'pagada': 'Pagada', 'pendiente': 'Pendiente', 'pago parcial': 'P. Parcial', 'no pagada': 'Vencida' };
    return <Badge bg={v[e] || 'secondary'}>{l[e] || e}</Badge>;
  };

  // Loading
  if (isLoading) return <div className="text-center py-5"><Spinner animation="border" style={{ color: '#3483FA' }} /><p className="text-muted mt-3">Cargando historial de cuotas...</p></div>;

  // Error
  if (error) return <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '8px' }}><i className="bi bi-exclamation-triangle me-2"></i>{error}<button onClick={cargarDatos} className="btn btn-link btn-sm ms-3" style={{ color: '#dc3545', textDecoration: 'underline' }}>Reintentar</button></Alert>;

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: '#1a1a1a' }}><i className="bi bi-clock-history me-2" style={{ color: '#1a1a1a' }}></i>Historial de Cuotas</h3>
        <p className="text-muted">Seguimiento completo de todas las ventas y sus cuotas</p>
      </div>

      {/* ==========================================
          TARJETAS DE TOTALES GENERALES (ACTUALIZADO)
          ========================================== */}
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
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #198754' }}>
              <Card.Body className="p-3 text-center">
                <h3 className="fw-bold mb-0" style={{ color: '#198754' }}>{totalesGenerales.totalCuotasPagadas}</h3>
                <small style={{ color: '#999' }}>Pagadas</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #0dcaf0' }}>
              <Card.Body className="p-3 text-center">
                <h3 className="fw-bold mb-0" style={{ color: '#0dcaf0' }}>{totalesGenerales.totalCuotasPagoParcial || 0}</h3>
                <small style={{ color: '#999' }}>Pago Parcial</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #fd7e14' }}>
              <Card.Body className="p-3 text-center">
                <h3 className="fw-bold mb-0" style={{ color: '#fd7e14' }}>{totalesGenerales.totalCuotasPendientes}</h3>
                <small style={{ color: '#999' }}>Pendientes</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={2} md={4}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
              <Card.Body className="p-3 text-center">
                <h3 className="fw-bold mb-0" style={{ color: '#dc3545' }}>{totalesGenerales.totalCuotasNoPagadas}</h3>
                <small style={{ color: '#999' }}>Vencidas</small>
              </Card.Body>
            </Card>
          </Col>
          {/* Fila de métricas */}
          <Col lg={12}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
              <Card.Body className="p-3">
                <Row className="text-center g-3">
                  <Col xs={6} md={2}>
                    <small style={{ color: '#999' }}>Capital Total</small>
                    <h6 className="fw-bold mb-0" style={{ color: '#333' }}>{formatoMoneda(totalesGenerales.totalCapital)}</h6>
                  </Col>
                  <Col xs={6} md={2}>
                    <small style={{ color: '#999' }}>Total Real (+Recargos)</small>
                    <h6 className="fw-bold mb-0" style={{ color: '#3483FA' }}>{formatoMoneda(totalesGenerales.totalReal)}</h6>
                  </Col>
                  <Col xs={6} md={2}>
                    <small style={{ color: '#999' }}>Total Pagado</small>
                    <h6 className="fw-bold mb-0" style={{ color: '#198754' }}>{formatoMoneda(totalesGenerales.totalPagado)}</h6>
                  </Col>
                  <Col xs={6} md={2}>
                    <small style={{ color: '#999' }}>Pendiente Real</small>
                    <h6 className="fw-bold mb-0" style={{ color: '#dc3545' }}>{formatoMoneda(totalesGenerales.totalPendienteReal)}</h6>
                  </Col>
                  <Col xs={6} md={2}>
                    <small style={{ color: '#999' }}>Recargos Generados</small>
                    <h6 className="fw-bold mb-0" style={{ color: '#dc3545' }}>{formatoMoneda(totalesGenerales.totalRecargosGenerados)}</h6>
                  </Col>
                  <Col xs={6} md={2}>
                    <small style={{ color: '#999' }}>Recargos Cobrados</small>
                    <h6 className="fw-bold mb-0" style={{ color: '#198754' }}>{formatoMoneda(totalesGenerales.totalRecargosCobrados)}</h6>
                  </Col>
                  <Col xs={6} md={3} className="mt-2">
                    <small style={{ color: '#999' }}>% Cobrado General</small>
                    <h6 className="fw-bold mb-0" style={{ color: '#3483FA' }}>{totalesGenerales.porcentajeCobradoGeneral}%</h6>
                  </Col>
                  <Col xs={6} md={3} className="mt-2">
                    <small style={{ color: '#999' }}>Eficiencia General</small>
                    <h6 className="fw-bold mb-0" style={{ color: '#198754' }}>{totalesGenerales.eficienciaGeneral}%</h6>
                  </Col>
                  <Col xs={6} md={3} className="mt-2">
                    <small style={{ color: '#999' }}>Promedio Recargos/Venta</small>
                    <h6 className="fw-bold mb-0" style={{ color: '#dc3545' }}>{formatoMoneda(totalesGenerales.promedioRecargosPorVenta)}</h6>
                  </Col>
                  <Col xs={6} md={3} className="mt-2">
                    <small style={{ color: '#999' }}>Cuotas con Recargos</small>
                    <h6 className="fw-bold mb-0" style={{ color: '#333' }}>{totalesGenerales.totalCuotasConRecargos || 0}</h6>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
        <Card.Body className="p-3">
          <Row className="g-3 align-items-end">
            <Col lg={3} md={6}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e5e5' }}><i className="bi bi-search" style={{ color: '#999' }}></i></InputGroup.Text>
                <Form.Control placeholder="Buscar cliente, producto o localidad..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                  style={{ border: '1px solid #e5e5e5', fontSize: '0.9rem', padding: '10px 12px' }} />
              </InputGroup>
            </Col>
            <Col lg={2} md={6}>
              <Form.Select value={filtroLocalidad} onChange={(e) => setFiltroLocalidad(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                <option value="todas">Todas las localidades</option>
                {localidades.map(loc => <option key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>)}
              </Form.Select>
            </Col>
            <Col lg={2} md={6}>
              <Form.Select value={filtroConducta} onChange={(e) => setFiltroConducta(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                <option value="todas">Todas las conductas</option>
                <option value="al dia">✅ Al día</option>
                <option value="cancelado">🔵 Cancelado</option>
                <option value="refinanciado">🟣 Refinanciado</option>
                <option value="atrasado">🟠 Atrasado</option>
                <option value="cobro judicial">🔴 Cobro Judicial</option>
                <option value="caducado">⚫ Caducado</option>
              </Form.Select>
            </Col>
            <Col lg={2} md={6}>
              <Form.Select value={filtroFrecuencia} onChange={(e) => setFiltroFrecuencia(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                <option value="todas">Todas las frecuencias</option>
                <option value="diario">📅 Diario</option>
                <option value="semanal">📅 Semanal</option>
                <option value="quincenal">📅 Quincenal</option>
                <option value="mensual">📅 Mensual</option>
              </Form.Select>
            </Col>
            <Col lg={3} md={6} className="d-flex align-items-end">
              <small style={{ color: '#999' }}>{ventasFiltradas.length} de {ventas.length} ventas</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Ventas */}
      {ventasFiltradas.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i><p className="text-muted mt-3">No se encontraron ventas con los filtros aplicados</p></div>
      ) : (
        ventasFiltradas.map((venta) => {
          const expandido = ventasExpandidas[venta.idVenta] || false;
          const porcentaje = venta.porcentajeCobrado || 0;

          return (
            <Card key={venta.idVenta} className="shadow-sm border-0 mb-3" style={{ borderRadius: '8px' }}>
              <Card.Body className="p-0">
                <div className="p-3" style={{ cursor: 'pointer', backgroundColor: expandido ? '#f8f9fa' : '#fff', borderRadius: '8px', transition: 'background-color 0.2s ease' }}
                  onClick={() => toggleVenta(venta.idVenta)}>
                  <Row className="align-items-center">
                    <Col lg={3} md={4}>
                      <div className="d-flex align-items-center">
                        <div className="d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: porcentaje === 100 ? '#d1e7dd' : porcentaje >= 50 ? '#fff3cd' : '#f8d7da', color: porcentaje === 100 ? '#0f5132' : porcentaje >= 50 ? '#664d03' : '#842029', fontWeight: '600', fontSize: '1rem' }}>
                          {venta.cliente.nombre.charAt(0)}{venta.cliente.apellido.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>{venta.cliente.apellido}, {venta.cliente.nombre}</div>
                          <small style={{ color: '#999', fontSize: '0.8rem' }}>{venta.localidad} · {venta.vendedor ? `Vend: ${venta.vendedor}` : ''}</small>
                        </div>
                      </div>
                    </Col>
                    <Col lg={3} md={4}>
                      <div style={{ color: '#666', fontSize: '0.85rem' }}><i className="bi bi-box me-1"></i>{venta.producto}</div>
                      <div className="d-flex align-items-center mt-1" style={{ gap: '6px' }}>
                        {badgeConducta(venta.conducta_pago)}{badgeFrecuencia(venta.frecuenciaCuota)}
                      </div>
                    </Col>
                    <Col lg={3} md={4}>
                      <div className="d-flex justify-content-between mb-1">
                        <small style={{ color: '#666', fontWeight: '500' }}>{venta.cuotasPagadas}/{venta.totalCuotas} cuotas</small>
                        <small style={{ color: porcentaje === 100 ? '#198754' : '#666', fontWeight: '600' }}>{porcentaje}%</small>
                      </div>
                      <ProgressBar now={porcentaje} style={{ height: '6px', borderRadius: '3px', backgroundColor: '#f0f0f0' }}
                        variant={porcentaje === 100 ? 'success' : porcentaje >= 50 ? 'warning' : 'danger'} />
                      <div className="d-flex justify-content-between mt-1">
                        <small style={{ color: '#198754', fontSize: '0.7rem' }}>{formatoMoneda(venta.montoPagado)}</small>
                        <small style={{ color: '#dc3545', fontSize: '0.7rem' }}>{venta.saldoPendienteReal > 0 ? formatoMoneda(venta.saldoPendienteReal) : ''}</small>
                      </div>
                    </Col>
                    <Col lg={2} md={4}>
                      <div style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>{formatoMoneda(venta.totalReal || venta.montoTotal)}</div>
                      {venta.totalRecargosGenerados > 0 && <small style={{ color: '#dc3545', fontSize: '0.7rem' }}>+{formatoMoneda(venta.totalRecargosGenerados)} rec.</small>}
                      <br /><small style={{ color: '#999', fontSize: '0.75rem' }}>{venta.tipoVenta}</small>
                    </Col>
                    <Col lg={1} md={4} className="text-end">
                      <i className={`bi bi-chevron-${expandido ? 'up' : 'down'}`} style={{ color: '#666' }}></i>
                    </Col>
                  </Row>
                </div>
                <Collapse in={expandido}>
                  <div>
                    <div style={{ borderTop: '1px solid #e5e5e5' }} className="p-3">
                      <Row className="mb-3 g-2">
                        <Col xs={6} md={3}><small style={{ color: '#999' }}>Pagadas:</small><span style={{ color: '#198754', fontWeight: '600', marginLeft: '6px' }}>{venta.cuotasPagadas} ({formatoMoneda(venta.montoPagado)})</span></Col>
                        <Col xs={6} md={3}><small style={{ color: '#999' }}>P. Parcial:</small><span style={{ color: '#0dcaf0', fontWeight: '600', marginLeft: '6px' }}>{venta.cuotasPagoParcial || 0}</span></Col>
                        <Col xs={6} md={3}><small style={{ color: '#999' }}>Pendientes:</small><span style={{ color: '#fd7e14', fontWeight: '600', marginLeft: '6px' }}>{venta.cuotasPendientes}</span></Col>
                        <Col xs={6} md={3}><small style={{ color: '#999' }}>Vencidas:</small><span style={{ color: '#dc3545', fontWeight: '600', marginLeft: '6px' }}>{venta.cuotasNoPagadas}</span></Col>
                        <Col xs={6} md={3} className="mt-2"><small style={{ color: '#999' }}>Capital:</small><span style={{ color: '#333', fontWeight: '600', marginLeft: '6px' }}>{formatoMoneda(venta.totalCapital)}</span></Col>
                        <Col xs={6} md={3} className="mt-2"><small style={{ color: '#999' }}>Recargos:</small><span style={{ color: '#dc3545', fontWeight: '600', marginLeft: '6px' }}>{formatoMoneda(venta.totalRecargosGenerados)}</span></Col>
                        <Col xs={6} md={3} className="mt-2"><small style={{ color: '#999' }}>Total Real:</small><span style={{ color: '#3483FA', fontWeight: '600', marginLeft: '6px' }}>{formatoMoneda(venta.totalReal)}</span></Col>
                        <Col xs={6} md={3} className="mt-2"><small style={{ color: '#999' }}>Pendiente:</small><span style={{ color: '#dc3545', fontWeight: '600', marginLeft: '6px' }}>{formatoMoneda(venta.saldoPendienteReal)}</span></Col>
                      </Row>

                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>#</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Monto</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Recargos</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Total</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Pagado</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Saldo</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Vencimiento</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Estado</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Cobrado el</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Método</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Cobrador</th>
                            </tr>
                          </thead>
                          <tbody>
                            {venta.detalleCuotas.map((cuota, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f5f5f5', backgroundColor: cuota.estadoCuota === 'no pagada' ? '#fff5f5' : cuota.estadoCuota === 'pendiente' ? '#fffaf5' : cuota.estadoCuota === 'pago parcial' ? '#f0f9ff' : 'transparent' }}>
                                <td style={{ fontWeight: '500', color: '#333' }}>{cuota.numeroCuota}</td>
                                <td style={{ fontWeight: '500' }}>{formatoMoneda(cuota.montoCuota)}</td>
                                <td style={{ color: cuota.totalRecargos > 0 ? '#dc3545' : '#999', fontWeight: cuota.totalRecargos > 0 ? '500' : '400' }}>
                                  {cuota.totalRecargos > 0 ? '+' + formatoMoneda(cuota.totalRecargos) : '-'}
                                </td>
                                <td style={{ fontWeight: '500' }}>{formatoMoneda(cuota.totalCuota || cuota.montoCuota)}</td>
                                <td className="text-success">{cuota.montoPagado > 0 ? formatoMoneda(cuota.montoPagado) : '-'}</td>
                                <td className={cuota.saldoPendiente > 0 ? 'text-danger fw-semibold' : 'text-success'}>
                                  {cuota.estadoCuota === 'pagada' ? '$0' : formatoMoneda(cuota.saldoPendiente || 0)}
                                </td>
                                <td style={{ color: '#666' }}>{formatoFecha(cuota.fechaCobro)}</td>
                                <td>{badgeEstadoCuota(cuota.estadoCuota)}</td>
                                <td style={{ color: cuota.fechaCobrada ? '#198754' : '#999' }}>{formatoFecha(cuota.fechaCobrada)}</td>
                                <td style={{ color: '#666' }}>{cuota.metodoPago || '-'}</td>
                                <td style={{ color: '#666' }}>{cuota.cobrador || '-'}</td>
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