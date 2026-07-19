// src/Pages/Ceo/Componentes/SeguimientoClientes.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Badge, ProgressBar, Collapse } from 'react-bootstrap';
import { agruparPorCliente, buscarCliente } from '../Helpers/AruparPorCLiente';
//import { agruparPorCliente, buscarCliente } from '../../../Helpers/procesarReportes';

export const SeguimientoClientes = ({ cuotas }) => {
  const [busqueda, setBusqueda] = useState('');
  const [ventasExpandidas, setVentasExpandidas] = useState({});
  const [filtroEstado, setFiltroEstado] = useState('todas');

  // Procesar datos
  const ventasAgrupadas = useMemo(() => {
    return agruparPorCliente(cuotas);
  }, [cuotas]);

  // Filtrar por búsqueda y estado
  const ventasFiltradas = useMemo(() => {
    let filtradas = buscarCliente(ventasAgrupadas, busqueda);

    if (filtroEstado !== 'todas') {
      filtradas = filtradas.filter(venta => {
        if (filtroEstado === 'al-dia') return venta.resumenVenta.noPagadas === 0 && venta.resumenVenta.pendientes === 0;
        if (filtroEstado === 'pendiente') return venta.resumenVenta.pendientes > 0;
        if (filtroEstado === 'atrasado') return venta.resumenVenta.noPagadas > 0;
        return true;
      });
    }

    return filtradas;
  }, [ventasAgrupadas, busqueda, filtroEstado]);

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

  const getPorcentaje = (pagadas, total) => {
    if (total === 0) return 0;
    return Math.round((pagadas / total) * 100);
  };

  const badgeEstado = (estado) => {
    const config = {
      'pagada': { color: '#00a650', bg: '#e6f7ee', label: 'Pagada', icono: 'bi-check-circle' },
      'pendiente': { color: '#ff7733', bg: '#fff3ed', label: 'Pendiente', icono: 'bi-clock' },
      'no pagada': { color: '#dc3545', bg: '#ffeaea', label: 'Vencida', icono: 'bi-x-circle' }
    };
    const c = config[estado] || { color: '#666', bg: '#f5f5f5', label: estado, icono: 'bi-question-circle' };

    return (
      <Badge bg='light'
        style={{
          backgroundColor: c.bg,
          color: c.color,
          fontWeight: '500',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem'
        }}
      >
        <i className={`${c.icono} me-1`}></i>
        {c.label}
      </Badge>
    );
  };

  // Totales generales
  const totales = useMemo(() => {
    return ventasFiltradas.reduce((acc, venta) => ({
      clientes: acc.clientes + 1,
      cuotasTotal: acc.cuotasTotal + venta.resumenVenta.totalCuotas,
      pagadas: acc.pagadas + venta.resumenVenta.pagadas,
      pendientes: acc.pendientes + venta.resumenVenta.pendientes,
      vencidas: acc.vencidas + venta.resumenVenta.noPagadas,
      montoTotal: acc.montoTotal + venta.resumenVenta.montoTotal,
      montoPagado: acc.montoPagado + venta.resumenVenta.montoPagado,
      montoPendiente: acc.montoPendiente + venta.resumenVenta.montoPendiente + venta.resumenVenta.montoVencido
    }), {
      clientes: 0,
      cuotasTotal: 0,
      pagadas: 0,
      pendientes: 0,
      vencidas: 0,
      montoTotal: 0,
      montoPagado: 0,
      montoPendiente: 0
    });
  }, [ventasFiltradas]);

  if (cuotas.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-people" style={{ fontSize: '3rem', color: '#ccc' }}></i>
        <p className="text-muted mt-3">No hay datos para mostrar. Realizá una búsqueda primero.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Totales Generales */}
      <Row className="mb-4 g-3">
        <Col lg={2} md={4}>
          <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
            <Card.Body className="p-3 text-center">
              <h3 className="fw-bold mb-0" style={{ color: '#3483FA' }}>{totales.clientes}</h3>
              <small style={{ color: '#999' }}>Clientes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4}>
          <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
            <Card.Body className="p-3 text-center">
              <h3 className="fw-bold mb-0" style={{ color: '#333' }}>{totales.cuotasTotal}</h3>
              <small style={{ color: '#999' }}>Total Cuotas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4}>
          <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #00a650' }}>
            <Card.Body className="p-3 text-center">
              <h3 className="fw-bold mb-0" style={{ color: '#00a650' }}>{totales.pagadas}</h3>
              <small style={{ color: '#999' }}>Pagadas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4}>
          <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #ff7733' }}>
            <Card.Body className="p-3 text-center">
              <h3 className="fw-bold mb-0" style={{ color: '#ff7733' }}>{totales.pendientes}</h3>
              <small style={{ color: '#999' }}>Pendientes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4}>
          <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
            <Card.Body className="p-3 text-center">
              <h3 className="fw-bold mb-0" style={{ color: '#dc3545' }}>{totales.vencidas}</h3>
              <small style={{ color: '#999' }}>Vencidas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4}>
          <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '8px' }}>
            <Card.Body className="p-3 text-center">
              <h4 className="fw-bold mb-0" style={{ color: '#333' }}>{formatoMoneda(totales.montoTotal)}</h4>
              <small style={{ color: '#999' }}>Monto Total</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-3 g-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e5e5' }}>
              <i className="bi bi-search" style={{ color: '#999' }}></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar por cliente, producto o localidad..."
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
            <option value="al-dia">✅ Al día</option>
            <option value="pendiente">⏳ Con pendientes</option>
            <option value="atrasado">🔴 Con atrasos</option>
          </Form.Select>
        </Col>
        <Col md={3} className="d-flex align-items-center">
          <small style={{ color: '#999' }}>
            {ventasFiltradas.length} de {ventasAgrupadas.length} clientes
          </small>
        </Col>
      </Row>

      {/* Lista de Clientes */}
      {ventasFiltradas.map((venta) => {
        const porcentaje = getPorcentaje(venta.resumenVenta.pagadas, venta.resumenVenta.totalCuotas);
        const expandido = ventasExpandidas[venta.idVenta] || false;

        return (
          <Card 
            key={venta.idVenta}
            className="shadow-sm border-0 mb-3"
            style={{ borderRadius: '8px' }}
          >
            <Card.Body className="p-0">
              {/* Header del Cliente */}
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
                  {/* Avatar + Nombre */}
                  <Col md={3}>
                    <div className="d-flex align-items-center">
                      <div 
                        className="d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: porcentaje === 100 ? '#e6f7ee' : porcentaje >= 50 ? '#fff3ed' : '#ffeaea',
                          color: porcentaje === 100 ? '#00a650' : porcentaje >= 50 ? '#ff7733' : '#dc3545',
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
                          {venta.localidad}
                        </small>
                      </div>
                    </div>
                  </Col>

                  {/* Producto */}
                  <Col md={3}>
                    <div style={{ color: '#666', fontSize: '0.85rem' }}>
                      <i className="bi bi-box me-1"></i>
                      {venta.producto}
                    </div>
                    <Badge bg='dark'>
                      {venta.tipoVenta}
                    </Badge>
                  </Col>

                  {/* Barra de Progreso */}
                  <Col md={3}>
                    <div className="d-flex justify-content-between mb-1">
                      <small style={{ color: '#666', fontWeight: '500' }}>
                        {venta.resumenVenta.pagadas}/{venta.resumenVenta.totalCuotas} cuotas
                      </small>
                      <small style={{ color: porcentaje === 100 ? '#00a650' : '#666', fontWeight: '600' }}>
                        {porcentaje}%
                      </small>
                    </div>
                    <ProgressBar 
                      now={porcentaje} 
                      style={{ 
                        height: '6px', 
                        borderRadius: '3px',
                        backgroundColor: '#f0f0f0'
                      }}
                      variant={
                        porcentaje === 100 ? 'success' : 
                        porcentaje >= 50 ? 'warning' : 'danger'
                      }
                    />
                  </Col>

                  {/* Montos */}
                  <Col md={2}>
                    <div style={{ color: '#00a650', fontWeight: '600', fontSize: '0.9rem' }}>
                      {formatoMoneda(venta.resumenVenta.montoPagado)}
                    </div>
                    <small style={{ color: '#999', fontSize: '0.75rem' }}>
                      pagado de {formatoMoneda(venta.resumenVenta.montoTotal)}
                    </small>
                  </Col>

                  {/* Icono expandir */}
                  <Col md={1} className="text-end">
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
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                            <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Cuota</th>
                            <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Monto</th>
                            <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Vencimiento</th>
                            <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Estado</th>
                            <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Cobrado el</th>
                            <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Método</th>
                            <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Cobrador</th>
                          </tr>
                        </thead>
                        <tbody>
                          {venta.cuotas
                            .sort((a, b) => a.numeroCuota - b.numeroCuota)
                            .map((cuota, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                <td style={{ fontWeight: '500', color: '#333' }}>
                                  #{cuota.numeroCuota}
                                </td>
                                <td style={{ fontWeight: '500' }}>
                                  {formatoMoneda(cuota.montoCuota)}
                                </td>
                                <td style={{ color: '#666' }}>
                                  {formatoFecha(cuota.fechaCobro)}
                                </td>
                                <td>
                                  {badgeEstado(cuota.estadoCuota)}
                                </td>
                                <td style={{ color: '#00a650' }}>
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
      })}
    </div>
  );
};