// src/Pages/Ceo/Componentes/ReportesCeo.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { agruparPorEstado, extraerLocalidades, filtrarPorLocalidad } from '../Helpers/Procesar_Reportes';
import { obtenerCobranzaMensual } from '../Helpers/ReportesMensuales';
import { ListaCuotas } from './ListaCuotas';
import { SeguimientoClientes } from './SeguimientoPorCliente';

// src/Pages/Ceo/Componentes/ReportesCeo.jsx


export const ReportesCeo = () => {
  const [cuotas, setCuotas] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [filtroLocalidad, setFiltroLocalidad] = useState('todas');
  const [resumenBackend, setResumenBackend] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabActivo, setTabActivo] = useState('general');
  const [filtros, setFiltros] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear()
  });

  const cuotasFiltradas = useMemo(() => {
    if (cuotas.length === 0) return [];
    return filtrarPorLocalidad(cuotas, filtroLocalidad);
  }, [cuotas, filtroLocalidad]);

  const cuotasAgrupadas = useMemo(() => {
    if (cuotasFiltradas.length === 0) return {};
    return agruparPorEstado(cuotasFiltradas);
  }, [cuotasFiltradas]);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => { cargarReporte(); }, []);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const cargarReporte = async () => {
    setIsLoading(true);
    setError('');
    setFiltroLocalidad('todas');
    setTabActivo('general');
    try {
      const data = await obtenerCobranzaMensual(filtros.mes, filtros.anio);
      if (data.cuotas.length === 0) {
        setCuotas([]); setLocalidades([]); setResumenBackend(null);
        setError('No se encontraron cuotas para este período');
      } else {
        setCuotas(data.cuotas);
        setResumenBackend(data.resumen);
        setLocalidades(extraerLocalidades(data.cuotas));
      }
    } catch (err) {
      setError(err.message || 'Error al cargar el reporte');
      setCuotas([]); setResumenBackend(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatoMoneda = (valor) => {
    if (!valor && valor !== 0) return '$0';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(valor);
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: '#1a1a1a' }}>
          <i className="bi bi-graph-up-arrow me-2" style={{ color: '#1a1a1a' }}></i>Reporte de Cobranza
        </h3>
        <p className="text-muted">Visualizá el estado de cobranzas por mes, localidad y cliente</p>
      </div>

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
        <Card.Body className="p-4">
          <Row className="align-items-end g-3">
            <Col lg={3} md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2" style={{ color: '#333', fontSize: '0.85rem' }}>Mes</Form.Label>
                <Form.Select name="mes" value={filtros.mes} onChange={handleFiltroChange}
                  style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                  {meses.map((mes, index) => <option key={index + 1} value={index + 1}>{mes}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={2} md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2" style={{ color: '#333', fontSize: '0.85rem' }}>Año</Form.Label>
                <Form.Select name="anio" value={filtros.anio} onChange={handleFiltroChange}
                  style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                  {anios.map(anio => <option key={anio} value={anio}>{anio}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={3} md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold mb-2" style={{ color: '#333', fontSize: '0.85rem' }}><i className="bi bi-geo-alt me-1"></i>Localidad</Form.Label>
                <Form.Select value={filtroLocalidad} onChange={(e) => setFiltroLocalidad(e.target.value)} disabled={localidades.length === 0}
                  style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}>
                  <option value="todas">Todas las localidades</option>
                  {localidades.map(loc => <option key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={2} md={4}>
              <Button onClick={cargarReporte} disabled={isLoading}
                className="w-100 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#3483FA', border: 'none', borderRadius: '6px', padding: '10px 20px', fontWeight: '500', fontSize: '0.9rem', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2968c8'} onMouseLeave={(e) => e.target.style.backgroundColor = '#3483FA'}>
                {isLoading ? <><Spinner size="sm" className="me-2" />Cargando...</> : <><i className="bi bi-search me-2"></i>Buscar</>}
              </Button>
            </Col>
            {cuotas.length > 0 && (
              <Col lg={2} md={4} className="d-flex align-items-end">
                <Badge bg="dark" style={{ fontSize: '0.85rem', padding: '8px 12px', borderRadius: '6px', fontWeight: '500' }}>
                  {cuotasFiltradas.length} de {cuotas.length} cuotas
                </Badge>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '8px' }} onClose={() => setError('')} dismissible>
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
        </Alert>
      )}

      {cuotas.length > 0 && (
        <>
          <div className="d-flex mb-4" style={{ gap: '8px' }}>
            <button onClick={() => setTabActivo('general')}
              style={{ padding: '10px 20px', borderRadius: '8px', border: tabActivo === 'general' ? '2px solid #3483FA' : '2px solid #e5e5e5', backgroundColor: tabActivo === 'general' ? '#e8f0fe' : '#fff', color: tabActivo === 'general' ? '#3483FA' : '#666', fontWeight: tabActivo === 'general' ? '600' : '400', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              <i className="bi bi-graph-up me-2"></i>Vista General
            </button>
            <button onClick={() => setTabActivo('seguimiento')}
              style={{ padding: '10px 20px', borderRadius: '8px', border: tabActivo === 'seguimiento' ? '2px solid #3483FA' : '2px solid #e5e5e5', backgroundColor: tabActivo === 'seguimiento' ? '#e8f0fe' : '#fff', color: tabActivo === 'seguimiento' ? '#3483FA' : '#666', fontWeight: tabActivo === 'seguimiento' ? '600' : '400', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              <i className="bi bi-people me-2"></i>Por Cliente
            </button>
          </div>

          {tabActivo === 'general' ? (
            <>
              {resumenBackend && (
                <Row className="mb-4 g-3">
                  <Col lg={3} md={6}>
                    <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #3483FA' }}>
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="mb-1" style={{ color: '#999', fontSize: '0.8rem' }}>TOTAL CAPITAL</p>
                            <h4 className="mb-0 fw-bold" style={{ color: '#333' }}>{formatoMoneda(resumenBackend.totalCapital)}</h4>
                            <small style={{ color: '#999' }}>{resumenBackend.totalCuotas} cuotas</small>
                          </div>
                          <div className="d-flex align-items-center justify-content-center"
                            style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#e8f0fe', color: '#3483FA', fontSize: '1.2rem' }}>
                            <i className="bi bi-cash-stack"></i>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={3} md={6}>
                    <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #00a650' }}>
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="mb-1" style={{ color: '#999', fontSize: '0.8rem' }}>COBRADO</p>
                            <h4 className="mb-0 fw-bold" style={{ color: '#00a650' }}>{formatoMoneda(resumenBackend.totalCobrado)}</h4>
                            <small style={{ color: '#999' }}>{resumenBackend.cuotasPagadas} pagadas{resumenBackend.cuotasPagoParcial > 0 && ` · ${resumenBackend.cuotasPagoParcial} p. parcial`}</small>
                          </div>
                          <div className="d-flex align-items-center justify-content-center"
                            style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#e6f7ee', color: '#00a650', fontSize: '1.2rem' }}>
                            <i className="bi bi-check-circle"></i>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={3} md={6}>
                    <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #ff7733' }}>
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="mb-1" style={{ color: '#999', fontSize: '0.8rem' }}>PENDIENTE</p>
                            <h4 className="mb-0 fw-bold" style={{ color: '#ff7733' }}>{formatoMoneda(resumenBackend.totalPendiente)}</h4>
                            <small style={{ color: '#999' }}>{resumenBackend.cuotasPendientes} pendientes{resumenBackend.cuotasNoPagadas > 0 && ` · ${resumenBackend.cuotasNoPagadas} vencidas`}</small>
                          </div>
                          <div className="d-flex align-items-center justify-content-center"
                            style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#fff3ed', color: '#ff7733', fontSize: '1.2rem' }}>
                            <i className="bi bi-clock"></i>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={3} md={6}>
                    <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="mb-1" style={{ color: '#999', fontSize: '0.8rem' }}>RECARGOS</p>
                            <h4 className="mb-0 fw-bold" style={{ color: '#dc3545' }}>{formatoMoneda(resumenBackend.totalRecargos)}</h4>
                            <small style={{ color: '#999' }}>{resumenBackend.cuotasConRecargos} cuotas con recargo{resumenBackend.totalRecargosPendientes > 0 && ` · ${formatoMoneda(resumenBackend.totalRecargosPendientes)} pendientes`}</small>
                          </div>
                          <div className="d-flex align-items-center justify-content-center"
                            style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#ffeaea', color: '#dc3545', fontSize: '1.2rem' }}>
                            <i className="bi bi-percent"></i>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col lg={6} md={6}>
                    <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
                      <Card.Body className="p-3">
                        <Row className="text-center">
                          <Col xs={6}>
                            <small className="text-muted d-block">Eficiencia de Cobranza</small>
                            <h5 className="fw-bold mb-0" style={{ color: resumenBackend.eficienciaCobranza >= 50 ? '#00a650' : '#dc3545' }}>{resumenBackend.eficienciaCobranza}%</h5>
                          </Col>
                          <Col xs={6}>
                            <small className="text-muted d-block">Promedio por Cuota</small>
                            <h5 className="fw-bold mb-0" style={{ color: '#3483FA' }}>{formatoMoneda(resumenBackend.promedioCuota)}</h5>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
              {cuotasFiltradas.length > 0 && <ListaCuotas cuotasAgrupadas={cuotasAgrupadas} />}
            </>
          ) : (
            <SeguimientoClientes cuotas={cuotasFiltradas} />
          )}
        </>
      )}

      {!isLoading && !error && cuotas.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <p className="text-muted mt-3">Seleccioná un mes y año, luego presioná Buscar</p>
        </div>
      )}
    </Container>
  );
};