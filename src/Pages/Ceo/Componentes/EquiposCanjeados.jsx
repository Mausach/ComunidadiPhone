// src/Pages/Ceo/Componentes/EquiposCanjeados.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Badge, Collapse, Spinner, Alert } from 'react-bootstrap';
import { obtenerEquiposCanjeados } from '../Helpers/ReportesMensuales';

export const EquiposCanjeados = () => {
  // Estados
  const [equipos, setEquipos] = useState([]);
  const [totalesGenerales, setTotalesGenerales] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  
  // UI
  const [equiposExpandidos, setEquiposExpandidos] = useState({});

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await obtenerEquiposCanjeados();
      setEquipos(data.equipos);
      setTotalesGenerales(data.totalesGenerales);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar equipos
  const equiposFiltrados = useMemo(() => {
    let resultado = equipos;
    
    // Búsqueda por texto
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase().trim();
      resultado = resultado.filter(eq => 
        eq.nombre?.toLowerCase().includes(termino) ||
        eq.modelo?.toLowerCase().includes(termino) ||
        eq.imei?.includes(termino) ||
        eq.venta?.cliente?.nombre?.toLowerCase().includes(termino) ||
        eq.venta?.cliente?.apellido?.toLowerCase().includes(termino) ||
        eq.venta?.localidad?.toLowerCase().includes(termino) ||
        eq.venta?.vendedor?.toLowerCase().includes(termino)
      );
    }
    
    // Filtro por estado
    if (filtroEstado !== 'todas') {
      resultado = resultado.filter(eq => eq.estado === filtroEstado);
    }
    
    return resultado;
  }, [equipos, busqueda, filtroEstado]);

  const toggleEquipo = (idEquipo) => {
    setEquiposExpandidos(prev => ({
      ...prev,
      [idEquipo]: !prev[idEquipo]
    }));
  };

  const formatoMoneda = (valor) => {
    if (!valor) return '$0';
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

  const badgeEstado = (estado) => {
    const config = {
      'excelente': { color: '#00a650', bg: '#e6f7ee', label: 'Excelente', icono: 'bi-star-fill' },
      'bueno': { color: '#3483FA', bg: '#e8f0fe', label: 'Bueno', icono: 'bi-hand-thumbs-up-fill' },
      'regular': { color: '#ff7733', bg: '#fff3ed', label: 'Regular', icono: 'bi-exclamation-circle-fill' },
      'malo': { color: '#dc3545', bg: '#ffeaea', label: 'Malo', icono: 'bi-hand-thumbs-down-fill' }
    };
    const c = config[estado] || { color: '#666', bg: '#f5f5f5', label: estado, icono: 'bi-circle' };

    return (
      <Badge
        style={{
          
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

  // Loading
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: '#3483FA' }} />
        <p className="text-muted mt-3">Cargando equipos canjeados...</p>
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
          <i className="bi bi-arrow-left-right me-2" style={{ color: '#1a1a1a' }}></i>
          Equipos Canjeados
        </h3>
        <p className="text-muted">
          Registro de todos los equipos recibidos en plan canje
        </p>
      </div>

      {/* Cards de Totales Generales */}
      {totalesGenerales && (
        <Row className="mb-4 g-3">
          <Col lg={3} md={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
              <Card.Body className="p-3 text-center">
                <h3 className="fw-bold mb-0" style={{ color: '#3483FA' }}>{totalesGenerales.totalEquipos}</h3>
                <small style={{ color: '#999' }}>Total Equipos</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
              <Card.Body className="p-3 text-center">
                <h3 className="fw-bold mb-0" style={{ color: '#00a650' }}>
                  {formatoMoneda(totalesGenerales.valorTotalTasado)}
                </h3>
                <small style={{ color: '#999' }}>Valor Total Tasado</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
              <Card.Body className="p-3 text-center">
                <h3 className="fw-bold mb-0" style={{ color: '#6c5ce7' }}>
                  {formatoMoneda(totalesGenerales.valorPromedio)}
                </h3>
                <small style={{ color: '#999' }}>Valor Promedio</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
              <Card.Body className="p-3 text-center">
                <div className="d-flex justify-content-center gap-2 mb-1">
                  <Badge bg='light' style={{ color: '#00a650', fontSize: '0.7rem' }}>
                    {totalesGenerales.porEstado.excelente} E
                  </Badge>
                  <Badge bg='light' style={{ color: '#3483FA', fontSize: '0.7rem' }}>
                    {totalesGenerales.porEstado.bueno} B
                  </Badge>
                  <Badge bg='light' style={{ color: '#ff7733', fontSize: '0.7rem' }}>
                    {totalesGenerales.porEstado.regular} R
                  </Badge>
                  <Badge bg='light' style={{ color: '#dc3545', fontSize: '0.7rem' }}>
                    {totalesGenerales.porEstado.malo} M
                  </Badge>
                </div>
                <small style={{ color: '#999' }}>Por Estado</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
        <Card.Body className="p-3">
          <Row className="g-3 align-items-end">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e5e5' }}>
                  <i className="bi bi-search" style={{ color: '#999' }}></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por equipo, cliente, localidad, vendedor..."
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
            <Col md={3}>
              <Form.Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={{
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  padding: '10px 12px'
                }}
              >
                <option value="todas">Todos los estados</option>
                <option value="excelente">⭐ Excelente</option>
                <option value="bueno">👍 Bueno</option>
                <option value="regular">⚠️ Regular</option>
                <option value="malo">👎 Malo</option>
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <small style={{ color: '#999' }}>
                {equiposFiltrados.length} de {equipos.length} equipos
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Equipos */}
      {equiposFiltrados.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-phone" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <p className="text-muted mt-3">No se encontraron equipos con los filtros aplicados</p>
        </div>
      ) : (
        equiposFiltrados.map((equipo) => {
          const expandido = equiposExpandidos[equipo.idEquipo] || false;

          return (
            <Card 
              key={equipo.idEquipo}
              className="shadow-sm border-0 mb-3"
              style={{ borderRadius: '8px' }}
            >
              <Card.Body className="p-0">
                {/* Header del Equipo */}
                <div 
                  className="p-3"
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: expandido ? '#f8f9fa' : '#fff',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onClick={() => toggleEquipo(equipo.idEquipo)}
                >
                  <Row className="align-items-center">
                    {/* Equipo */}
                    <Col lg={3} md={4}>
                      <div className="d-flex align-items-center">
                        <div 
                          className="d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#e8f0fe',
                            color: '#3483FA',
                            fontSize: '1.1rem'
                          }}
                        >
                          <i className="bi bi-phone"></i>
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>
                            {equipo.nombre}
                          </div>
                          <small style={{ color: '#999', fontSize: '0.8rem' }}>
                            {equipo.modelo} {equipo.imei ? `· IMEI: ${equipo.imei.slice(-4)}` : ''}
                          </small>
                        </div>
                      </div>
                    </Col>

                    {/* Estado + Valor */}
                    <Col lg={2} md={4}>
                      <div className="d-flex flex-column">
                        {badgeEstado(equipo.estado)}
                        <small style={{ color: '#999', fontSize: '0.75rem', marginTop: '4px' }}>
                          Color: {equipo.color || '-'} · Bat: {equipo.bateria || '-'}
                        </small>
                      </div>
                    </Col>

                    {/* Cliente */}
                    <Col lg={3} md={4}>
                      <div style={{ color: '#333', fontSize: '0.9rem', fontWeight: '500' }}>
                        <i className="bi bi-person me-1" style={{ color: '#999' }}></i>
                        {equipo.venta?.cliente?.apellido}, {equipo.venta?.cliente?.nombre}
                      </div>
                      <small style={{ color: '#999', fontSize: '0.8rem' }}>
                        {equipo.venta?.localidad} · {equipo.venta?.vendedor ? `Vend: ${equipo.venta.vendedor}` : ''}
                      </small>
                    </Col>

                    {/* Valor Tasado */}
                    <Col lg={2} md={4}>
                      <div style={{ fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>
                        {formatoMoneda(equipo.valorTasado)}
                      </div>
                      <small style={{ color: '#999', fontSize: '0.75rem' }}>
                        Valor tasado
                      </small>
                    </Col>

                    {/* Fecha + Expandir */}
                    <Col lg={2} md={4} className="d-flex justify-content-between align-items-center">
                      <small style={{ color: '#999', fontSize: '0.8rem' }}>
                        <i className="bi bi-calendar me-1"></i>
                        {formatoFecha(equipo.fechaRecepcion)}
                      </small>
                      <i 
                        className={`bi bi-chevron-${expandido ? 'up' : 'down'}`}
                        style={{ color: '#666' }}
                      ></i>
                    </Col>
                  </Row>
                </div>

                {/* Detalle Expandido */}
                <Collapse in={expandido}>
                  <div>
                    <div style={{ borderTop: '1px solid #e5e5e5' }} className="p-3">
                      <Row className="g-3">
                        {/* Datos del Equipo */}
                        <Col md={6}>
                          <h6 className="fw-bold mb-3" style={{ color: '#333', fontSize: '0.9rem' }}>
                            <i className="bi bi-phone me-2" style={{ color: '#3483FA' }}></i>
                            Datos del Equipo Canjeado
                          </h6>
                          <div className="bg-light rounded-3 p-3">
                            <Row className="g-2">
                              <Col xs={6}>
                                <small className="text-muted d-block">Nombre</small>
                                <span className="fw-semibold">{equipo.nombre}</span>
                              </Col>
                              <Col xs={6}>
                                <small className="text-muted d-block">Modelo</small>
                                <span className="fw-semibold">{equipo.modelo || '-'}</span>
                              </Col>
                              <Col xs={6}>
                                <small className="text-muted d-block">IMEI</small>
                                <span className="fw-semibold">{equipo.imei || '-'}</span>
                              </Col>
                              <Col xs={6}>
                                <small className="text-muted d-block">Color</small>
                                <span className="fw-semibold">{equipo.color || '-'}</span>
                              </Col>
                              <Col xs={6}>
                                <small className="text-muted d-block">Batería</small>
                                <span className="fw-semibold">{equipo.bateria || '-'}</span>
                              </Col>
                              <Col xs={6}>
                                <small className="text-muted d-block">Estado</small>
                                <div>{badgeEstado(equipo.estado)}</div>
                              </Col>
                            </Row>
                          </div>
                        </Col>

                        {/* Datos de la Venta */}
                        <Col md={6}>
                          <h6 className="fw-bold mb-3" style={{ color: '#333', fontSize: '0.9rem' }}>
                            <i className="bi bi-cart me-2" style={{ color: '#00a650' }}></i>
                            Venta Relacionada
                          </h6>
                          <div className="bg-light rounded-3 p-3">
                            <Row className="g-2">
                              <Col xs={6}>
                                <small className="text-muted d-block">Cliente</small>
                                <span className="fw-semibold">
                                  {equipo.venta?.cliente?.apellido}, {equipo.venta?.cliente?.nombre}
                                </span>
                              </Col>
                              <Col xs={6}>
                                <small className="text-muted d-block">DNI</small>
                                <span className="fw-semibold">{equipo.venta?.cliente?.dni || '-'}</span>
                              </Col>
                              <Col xs={6}>
                                <small className="text-muted d-block">Localidad</small>
                                <span className="fw-semibold">{equipo.venta?.localidad || '-'}</span>
                              </Col>
                              <Col xs={6}>
                                <small className="text-muted d-block">Vendedor</small>
                                <span className="fw-semibold">{equipo.venta?.vendedor || '-'}</span>
                              </Col>
                              <Col xs={6}>
                                <small className="text-muted d-block">Producto Entregado</small>
                                <span className="fw-semibold">{equipo.venta?.productoEntregado?.nombre || '-'}</span>
                              </Col>
                              <Col xs={6}>
                                <small className="text-muted d-block">Valor Producto</small>
                                <span className="fw-semibold text-success">
                                  {formatoMoneda(equipo.venta?.productoEntregado?.valor)}
                                </span>
                              </Col>
                            </Row>
                          </div>
                        </Col>

                        {/* Notas */}
                        {equipo.notas && equipo.notas.length > 0 && (
                          <Col md={12}>
                            <h6 className="fw-bold mb-2" style={{ color: '#333', fontSize: '0.9rem' }}>
                              <i className="bi bi-chat-left-text me-2" style={{ color: '#ff7733' }}></i>
                              Notas
                            </h6>
                            {equipo.notas.map((nota, idx) => (
                              <div 
                                key={idx}
                                className="d-flex align-items-start p-2 mb-2 bg-light rounded-3"
                              >
                                <i className="bi bi-chat-left-text me-2 mt-1" style={{ color: '#3483FA' }}></i>
                                <div className="flex-grow-1">
                                  <small style={{ color: '#333', fontSize: '0.85rem' }}>
                                    {nota.texto}
                                  </small>
                                  <div className="d-flex justify-content-between mt-1">
                                    <small style={{ color: '#999', fontSize: '0.7rem' }}>
                                      {nota.usuario?.nombre || 'Sistema'}
                                    </small>
                                    <small style={{ color: '#999', fontSize: '0.7rem' }}>
                                      {formatoFecha(nota.fecha)}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </Col>
                        )}
                      </Row>
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