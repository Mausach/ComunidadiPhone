// Cobranza-v2/Componentes/ModalCobrosRecibidos.jsx
import { COLORS } from '../Helperss/colors';
import React from 'react';
import { Modal, Table, Badge, Alert, Button } from 'react-bootstrap';


const formatMoneda = (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v || 0);
const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

export const ModalPagosDestiempo = ({ show, onHide, detalle = [], montoTotal = 0 }) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton className="border-0 pb-0">
        <div>
          <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
            <i className="bi bi-clock-history me-2" style={{ color: COLORS.azul }}></i>
            Detalle de Pagos a Destiempo
          </Modal.Title>
          <small style={{ color: COLORS.textoSecundario }}>
            Cuotas que correspondían a este mes y se pagaron en otra fecha
          </small>
        </div>
      </Modal.Header>

      <Modal.Body className="pt-3">
        <div className="bg-light rounded-3 p-3 mb-4 d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted d-block">Total Recuperado</small>
            <h3 className="fw-bold mb-0" style={{ color: COLORS.verde }}>
              {formatMoneda(montoTotal)}
            </h3>
          </div>
          <div className="text-end">
            <small className="text-muted d-block">Cuotas Cobradas</small>
            <h4 className="fw-bold mb-0" style={{ color: COLORS.textoPrincipal }}>
              {detalle.length}
            </h4>
          </div>
        </div>

        {detalle.length === 0 ? (
          <Alert variant="light" className="text-center py-4">
            No hay cuotas pagadas fuera de término en este mes.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
              <thead style={{ backgroundColor: '#F8FAFC' }}>
                <tr>
                  <th style={{ color: COLORS.textoSecundario }}>Cliente</th>
                  <th style={{ color: COLORS.textoSecundario }}>Producto</th>
                  <th style={{ color: COLORS.textoSecundario }}>Cuota</th>
                  <th style={{ color: COLORS.textoSecundario }}>Vencía</th>
                  <th style={{ color: COLORS.textoSecundario }}>Se pagó</th>
                  <th style={{ color: COLORS.textoSecundario }}>Atraso</th>
                  <th style={{ color: COLORS.textoSecundario }}>Monto</th>
                  <th style={{ color: COLORS.textoSecundario }}>Método</th>
                </tr>
              </thead>
              <tbody>
                {detalle.map((cuota, idx) => {
                  // Si el backend a futuro manda otros tipos, podemos cambiar el badge
                  const esPagadaAntes = cuota.tipo === 'futura_pagada_antes';

                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.bordes}` }}>
                      <td>
                        <div className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
                          {cuota.cliente?.apellido}, {cuota.cliente?.nombre}
                        </div>
                        <small style={{ color: COLORS.textoSecundario }}>
                          DNI: {cuota.cliente?.dni} · Contrato N° {cuota.numeroContratoFormateado}
                        </small>
                      </td>
                      <td style={{ color: COLORS.textoSecundario }}>{cuota.producto}</td>
                      <td style={{ color: COLORS.textoPrincipal, fontWeight: '600' }}>#{cuota.numeroCuota}</td>
                      <td style={{ color: COLORS.textoSecundario }}>{formatFecha(cuota.fechaCobroOriginal)}</td>
                      <td style={{ color: COLORS.textoPrincipal }}>{formatFecha(cuota.fechaCobrada)}</td>
                      <td>
                        {esPagadaAntes ? (
                          <Badge bg="info">{Math.abs(cuota.diasAtraso)} días antes</Badge>
                        ) : (
                          <Badge bg="warning" text="dark">+{cuota.diasAtraso} días</Badge>
                        )}
                      </td>
                      <td style={{ color: COLORS.verde, fontWeight: '600' }}>{formatMoneda(cuota.montoPagado)}</td>
                      <td style={{ color: COLORS.textoSecundario, textTransform: 'capitalize' }}>{cuota.metodoPago || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="secondary" onClick={onHide} className="rounded-3">Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};