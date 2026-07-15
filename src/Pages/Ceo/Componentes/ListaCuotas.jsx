// src/Pages/Ceo/Componentes/ListaCuotas.jsx

import React, { useState } from 'react';
import { Card, Table, Badge, Collapse, Modal } from 'react-bootstrap';

export const ListaCuotas = ({ cuotasAgrupadas, resumen }) => {
  const [seccionExpandida, setSeccionExpandida] = useState(null);
  const [notaSeleccionada, setNotaSeleccionada] = useState(null);

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

  const formatoFechaHora = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSeccion = (seccion) => {
    setSeccionExpandida(seccionExpandida === seccion ? null : seccion);
  };

  const secciones = [
    {
      key: 'pagadas',
      titulo: 'Cuotas Cobradas',
      icono: 'bi-check-circle',
      color: '#00a650',
      bgColor: '#e6f7ee',
      cuotas: cuotasAgrupadas.pagadas || [],
      resumen: resumen?.pagadas
    },
    {
      key: 'pendientes',
      titulo: 'Cuotas Pendientes',
      icono: 'bi-clock',
      color: '#ff7733',
      bgColor: '#fff3ed',
      cuotas: cuotasAgrupadas.pendientes || [],
      resumen: resumen?.pendientes
    },
    {
      key: 'noPagadas',
      titulo: 'Cuotas Vencidas',
      icono: 'bi-x-circle',
      color: '#dc3545',
      bgColor: '#ffeaea',
      cuotas: cuotasAgrupadas.noPagadas || [],
      resumen: resumen?.noPagadas
    }
  ];

  return (
    <>
      {secciones.map((seccion) => {
        if (seccion.cuotas.length === 0) return null;

        return (
          <Card 
            key={seccion.key}
            className="shadow-sm border-0 mb-3"
            style={{ borderRadius: '8px' }}
          >
            <Card.Body className="p-0">
              {/* Header de la sección */}
              <div 
                className="d-flex align-items-center justify-content-between p-3"
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: seccionExpandida === seccion.key ? seccion.bgColor : '#fff',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s ease'
                }}
                onClick={() => toggleSeccion(seccion.key)}
              >
                <div className="d-flex align-items-center">
                  <i 
                    className={`bi ${seccion.icono} me-3`}
                    style={{ color: seccion.color, fontSize: '1.3rem' }}
                  ></i>
                  <div>
                    <h5 className="mb-0 fw-bold" style={{ color: '#333', fontSize: '1rem' }}>
                      {seccion.titulo}
                    </h5>
                    <small style={{ color: '#999' }}>
                      {seccion.cuotas.length} cuotas · {formatoMoneda(seccion.resumen?.monto || 0)}
                    </small>
                  </div>
                </div>
                <i 
                  className={`bi bi-chevron-${seccionExpandida === seccion.key ? 'up' : 'down'}`}
                  style={{ color: '#666' }}
                ></i>
              </div>

              {/* Tabla de cuotas */}
              <Collapse in={seccionExpandida === seccion.key}>
                <div>
                  <div className="table-responsive px-3 pb-3">
                    <Table hover className="align-middle mb-0">
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                          <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Cliente</th>
                          <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Producto</th>
                          <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Cuota</th>
                          <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Monto</th>
                          <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Vencimiento</th>
                          {seccion.key === 'pagadas' && (
                            <>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Cobrado el</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Método</th>
                              <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Cobrador</th>
                            </>
                          )}
                          <th style={{ color: '#666', fontSize: '0.8rem', fontWeight: '600' }}>Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seccion.cuotas.map((cuota, idx) => (
                          <tr 
                            key={idx}
                            style={{ borderBottom: '1px solid #f5f5f5' }}
                          >
                            <td>
                              <div style={{ fontWeight: '500', color: '#333', fontSize: '0.9rem' }}>
                                {cuota.cliente.apellido}, {cuota.cliente.nombre}
                              </div>
                              <small style={{ color: '#999', fontSize: '0.8rem' }}>
                                {cuota.localidad}
                              </small>
                            </td>
                            <td>
                              <div style={{ color: '#333', fontSize: '0.85rem' }}>
                                {cuota.producto}
                              </div>
                              <small style={{ color: '#999', fontSize: '0.8rem' }}>
                                {cuota.tipoVenta}
                              </small>
                            </td>
                            <td style={{ color: '#666', fontSize: '0.9rem' }}>
                              #{cuota.numeroCuota}
                            </td>
                            <td style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                              {formatoMoneda(cuota.montoCuota)}
                            </td>
                            <td style={{ color: '#666', fontSize: '0.85rem' }}>
                              {formatoFecha(cuota.fechaCobro)}
                            </td>
                            {seccion.key === 'pagadas' && (
                              <>
                                <td style={{ color: '#00a650', fontSize: '0.85rem' }}>
                                  {formatoFecha(cuota.fechaCobrada)}
                                </td>
                                <td>
                                  <Badge
                                    style={{
                                      backgroundColor: '#f5f5f5',
                                      color: '#666',
                                      fontWeight: '500',
                                      fontSize: '0.8rem',
                                      padding: '4px 8px',
                                      borderRadius: '4px'
                                    }}
                                  >
                                    {cuota.metodoPago || '-'}
                                  </Badge>
                                </td>
                                <td style={{ color: '#666', fontSize: '0.85rem' }}>
                                  {cuota.cobrador || '-'}
                                </td>
                              </>
                            )}
                            
                            {/* COLUMNA DE NOTAS */}
                            <td>
                              {cuota.notas && cuota.notas.length > 0 ? (
                                <Badge
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNotaSeleccionada(cuota);
                                  }}
                                  style={{
                                    backgroundColor: '#fff3cd',
                                    color: '#856404',
                                    cursor: 'pointer',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    fontWeight: '500',
                                    fontSize: '0.8rem',
                                    border: '1px solid #ffc107',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#ffc107';
                                    e.target.style.color = '#000';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#fff3cd';
                                    e.target.style.color = '#856404';
                                  }}
                                >
                                  <i className="bi bi-chat-dots me-1"></i>
                                  {cuota.notas.length} {cuota.notas.length === 1 ? 'nota' : 'notas'}
                                </Badge>
                              ) : (
                                <span style={{ color: '#ccc', fontSize: '0.85rem' }}>
                                  Sin notas
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </Collapse>
            </Card.Body>
          </Card>
        );
      })}

      {/* MODAL DE NOTAS */}
      <Modal
        show={notaSeleccionada !== null}
        onHide={() => setNotaSeleccionada(null)}
        centered
        size="lg"
      >
        {notaSeleccionada && (
          <>
            <Modal.Header 
              closeButton
              style={{ 
                borderBottom: '1px solid #e5e5e5',
                backgroundColor: '#fff'
              }}
            >
              <div>
                <Modal.Title style={{ color: '#333', fontSize: '1.1rem' }}>
                  <i className="bi bi-chat-dots me-2" style={{ color: '#3483FA' }}></i>
                  Historial de Notas
                </Modal.Title>
                <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>
                  <strong>{notaSeleccionada.cliente.apellido}, {notaSeleccionada.cliente.nombre}</strong>
                  {' · '}
                  {notaSeleccionada.producto}
                  {' · '}
                  Cuota #{notaSeleccionada.numeroCuota}
                  {' · '}
                  {formatoMoneda(notaSeleccionada.montoCuota)}
                </div>
              </div>
            </Modal.Header>

            <Modal.Body style={{ padding: '0' }}>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {notaSeleccionada.notas.map((nota, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '16px 20px',
                      borderBottom: index < notaSeleccionada.notas.length - 1 ? '1px solid #f0f0f0' : 'none',
                      backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge
                        style={{
                          backgroundColor: '#e8f0fe',
                          color: '#3483FA',
                          fontWeight: '500',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}
                      >
                        <i className="bi bi-person me-1"></i>
                        {nota.usuario?.nombre || 'Sistema'}
                      </Badge>
                      <small style={{ color: '#999', fontSize: '0.8rem' }}>
                        <i className="bi bi-clock me-1"></i>
                        {formatoFechaHora(nota.fecha)}
                      </small>
                    </div>
                    <p className="mb-0" style={{ color: '#333', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {nota.texto}
                    </p>
                  </div>
                ))}
              </div>
            </Modal.Body>

            <Modal.Footer style={{ borderTop: '1px solid #e5e5e5' }}>
              <small style={{ color: '#999' }}>
                Total de notas: {notaSeleccionada.notas.length}
              </small>
              <button
                onClick={() => setNotaSeleccionada(null)}
                style={{
                  backgroundColor: '#3483FA',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  );
};