// src/Pages/Ceo/Componentes/ModalDetalleVenta.jsx
import React, { useState } from 'react';
import { Modal, Row, Col, Button, Card, Table, ProgressBar, Nav, Tab } from 'react-bootstrap';
import { COLORS } from '../../Cobranza/Helperss/colors';

// Componente Pill
const Pill = ({ children, bg, color, border, icon, style = {} }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '0.35em 0.7em',
    fontSize: '0.75rem', fontWeight: '600', borderRadius: '20px',
    backgroundColor: bg, color: color,
    border: border ? `1px solid ${border}` : 'none',
    whiteSpace: 'nowrap', ...style
  }}>
    {icon && <i className={`bi bi-${icon} me-1`}></i>}
    {children}
  </span>
);

const formatoMoneda = (v) => !v && v !== 0 ? '$0' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
const formatoFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatoFechaHora = (f) => !f ? '-' : new Date(f).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const PillTipoVenta = ({ tipo }) => {
  const config = {
    contado: { bg: COLORS.verdeSuave, color: COLORS.verde, icon: 'cash-coin', label: 'Contado' },
    plan_canje: { bg: COLORS.ambarSuave, color: COLORS.ambar, icon: 'arrow-repeat', label: 'Plan Canje' },
    sistema1: { bg: COLORS.azulSuave, color: COLORS.azul, icon: 'calendar-check', label: 'Sistema 1' },
    sistema2: { bg: COLORS.azulOscuro, color: '#fff', icon: 'calendar-event', label: 'Sistema 2' },
    plan_canje_cuotas: { bg: COLORS.ambarSuave, color: COLORS.ambar, icon: 'arrow-repeat', label: 'Canje + Cuotas' }
  };
  const c = config[tipo] || { bg: COLORS.bgGeneral, color: COLORS.textoSecundario, icon: 'question', label: tipo };
  return <Pill bg={c.bg} color={c.color} icon={c.icon}>{c.label}</Pill>;
};

const PillConducta = ({ conducta }) => {
  const config = {
    'al dia': { bg: COLORS.verdeSuave, color: COLORS.verde, label: 'Al día' },
    'atrasado': { bg: COLORS.rojoSuave, color: COLORS.rojo, label: 'Atrasado' },
    'cancelado': { bg: COLORS.azulSuave, color: COLORS.azul, label: 'Cancelado' },
    'refinanciado': { bg: COLORS.ambarSuave, color: COLORS.ambar, label: 'Refinanciado' },
    'cobro judicial': { bg: COLORS.azulOscuro, color: '#fff', label: 'Cobro Judicial' },
    'caducado': { bg: COLORS.bgGeneral, color: COLORS.textoSecundario, label: 'Caducado' }
  };
  const c = config[conducta] || { bg: COLORS.bgGeneral, color: COLORS.textoSecundario, label: conducta };
  return <Pill bg={c.bg} color={c.color}>{c.label}</Pill>;
};

const PillEstadoCuota = ({ estado }) => {
  const config = {
    'pagada': { bg: COLORS.verdeSuave, color: COLORS.verde, label: 'Pagada' },
    'pendiente': { bg: COLORS.ambarSuave, color: COLORS.ambar, label: 'Pendiente' },
    'pago parcial': { bg: COLORS.azulSuave, color: COLORS.azul, label: 'Pago parcial' },
    'no pagada': { bg: COLORS.rojoSuave, color: COLORS.rojo, label: 'No pagada' }
  };
  const c = config[estado] || { bg: COLORS.bgGeneral, color: COLORS.textoSecundario, label: estado || '-' };
  return <Pill bg={c.bg} color={c.color}>{c.label}</Pill>;
};

export const ModalDetalleVenta = ({ show, onHide, venta }) => {
  const [activeTab, setActiveTab] = useState('general');
  if (!venta) return null;

  const porcentaje = venta.cuotasResumen?.porcentajeCobrado || 0;
  const saldoPendiente = (venta.montoTotal || 0) - (venta.montoPagado || 0);

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
          <i className="bi bi-file-earmark-text me-2" style={{ color: COLORS.azul }}></i>
          Detalle Completo de la Venta
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pt-3">
        {/* HEADER RESUMEN */}
        <div className="rounded-3 p-3 mb-4" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
          <Row className="align-items-center g-3">
            <Col md={6}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: '56px', height: '56px', backgroundColor: COLORS.azulSuave, color: COLORS.azul, fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {venta.cliente?.nombre?.charAt(0)}{venta.cliente?.apellido?.charAt(0)}
                </div>
                <div>
                  <h5 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal }}>
                    {venta.cliente?.apellido}, {venta.cliente?.nombre}
                  </h5>
                  <div className="d-flex gap-2 flex-wrap">
                    <PillTipoVenta tipo={venta.tipoVenta} />
                    <PillConducta conducta={venta.conducta_pago} />
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <Row className="text-md-end g-2">
                <Col xs={6} md={4}>
                  <small style={{ color: COLORS.textoSecundario }} className="d-block">Total</small>
                  <strong style={{ color: COLORS.textoPrincipal }}>{formatoMoneda(venta.montoTotal)}</strong>
                </Col>
                <Col xs={6} md={4}>
                  <small style={{ color: COLORS.textoSecundario }} className="d-block">Pagado</small>
                  <strong style={{ color: COLORS.verde }}>{formatoMoneda(venta.montoPagado)}</strong>
                </Col>
                <Col xs={12} md={4}>
                  <small style={{ color: COLORS.textoSecundario }} className="d-block">Pendiente</small>
                  <strong style={{ color: saldoPendiente > 0 ? COLORS.rojo : COLORS.verde }}>
                    {formatoMoneda(saldoPendiente)}
                  </strong>
                </Col>
              </Row>
            </Col>
          </Row>

          {venta.tieneCuotas && (
            <div className="mt-3">
              <div className="d-flex justify-content-between mb-1">
                <small style={{ color: COLORS.textoSecundario }}>
                  Progreso: {venta.cuotasResumen?.pagadas || 0}/{venta.cuotasResumen?.total || 0} cuotas
                </small>
                <small className="fw-bold" style={{ color: porcentaje === 100 ? COLORS.verde : COLORS.azul }}>
                  {porcentaje}%
                </small>
              </div>
              <ProgressBar now={porcentaje} style={{ height: '8px', borderRadius: '4px', backgroundColor: COLORS.cardBg }}
                variant={porcentaje === 100 ? 'success' : porcentaje >= 50 ? 'warning' : 'danger'} />
            </div>
          )}
        </div>

        {/* TABS */}
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav variant="pills" className="mb-3 flex-wrap gap-2">
            {[
              { key: 'general', label: 'General', icon: 'info-circle' },
              { key: 'producto', label: 'Producto', icon: 'phone' },
              ...(venta.tieneCuotas ? [{ key: 'cuotas', label: `Cuotas (${venta.cuotas?.length || 0})`, icon: 'grid' }] : []),
              ...(venta.pagos && venta.pagos.length > 0 ? [{ key: 'pagos', label: `Pagos (${venta.pagos.length})`, icon: 'wallet2' }] : []),
              ...(venta.descuentos && venta.descuentos.length > 0 ? [{ key: 'descuentos', label: `Descuentos (${venta.descuentos.length})`, icon: 'tag' }] : []),
              ...(venta.requiereGarante && venta.garante ? [{ key: 'garante', label: 'Garante', icon: 'person-check' }] : []),
              ...(venta.notas && venta.notas.length > 0 ? [{ key: 'notas', label: `Notas (${venta.notas.length})`, icon: 'sticky' }] : []),
              ...(venta.documentacion?.urlCarpeta ? [{ key: 'docs', label: 'Docs', icon: 'folder-fill' }] : []),
            ].map(tab => (
              <Nav.Item key={tab.key}>
                <Nav.Link eventKey={tab.key} className="rounded-3 small"
                  style={{
                    padding: '8px 16px',
                    color: activeTab === tab.key ? COLORS.azul : COLORS.textoSecundario,
                    backgroundColor: activeTab === tab.key ? COLORS.azulSuave : 'transparent',
                    fontWeight: activeTab === tab.key ? '600' : '500'
                  }}>
                  <i className={`bi bi-${tab.icon} me-1`}></i>{tab.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          <Tab.Content>
            {/* TAB GENERAL */}
            <Tab.Pane eventKey="general">
              <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: COLORS.azul }}>
                  <i className="bi bi-info-circle me-2"></i>Datos Generales
                </h6>
                <Row className="g-3">
                  {[
                    { label: 'N° Contrato', value: venta.numeroContrato || '-' },
                    { label: 'Tipo de Venta', value: <PillTipoVenta tipo={venta.tipoVenta} /> },
                    { label: 'Fecha Realizada', value: formatoFecha(venta.fechaRealizada) },
                    { label: 'Fecha Entrega', value: formatoFecha(venta.fechaEntrega) },
                    { label: 'Localidad', value: <span className="text-capitalize">{venta.localidad || '-'}</span> },
                    { label: 'Vendedor', value: venta.vendedor || '-' },
                    { label: 'Conducta de Pago', value: <PillConducta conducta={venta.conducta_pago} /> },
                    { label: 'Estado', value: <Pill bg={venta.estado !== false ? COLORS.verdeSuave : COLORS.bgGeneral} color={venta.estado !== false ? COLORS.verde : COLORS.textoSecundario}>{venta.estado !== false ? 'Activa' : 'Inactiva'}</Pill> },
                  ].map((item, i) => (
                    <Col md={6} key={i}>
                      <div className="d-flex justify-content-between border-bottom py-1" style={{ borderColor: COLORS.bordes }}>
                        <span style={{ color: COLORS.textoSecundario }} className="small">{item.label}</span>
                        <span className="fw-semibold small" style={{ color: COLORS.textoPrincipal }}>{item.value}</span>
                      </div>
                    </Col>
                  ))}
                </Row>

                <h6 className="fw-bold mt-4 mb-3" style={{ fontSize: '0.9rem', color: COLORS.azul }}>
                  <i className="bi bi-person me-2"></i>Datos del Cliente
                </h6>
                <Row className="g-3">
                  {[
                    { label: 'Nombre completo', value: `${venta.cliente?.apellido}, ${venta.cliente?.nombre}` },
                    { label: 'DNI', value: venta.cliente?.dni || '-' },
                    { label: 'Teléfono', value: venta.cliente?.telefono || '-' },
                    { label: 'Email', value: venta.cliente?.email || '-' },
                    { label: 'Dirección', value: venta.cliente?.direccion || '-', full: true },
                  ].map((item, i) => (
                    <Col md={item.full ? 12 : 6} key={i}>
                      <div className="d-flex justify-content-between border-bottom py-1" style={{ borderColor: COLORS.bordes }}>
                        <span style={{ color: COLORS.textoSecundario }} className="small">{item.label}</span>
                        <span className="fw-semibold small" style={{ color: COLORS.textoPrincipal }}>{item.value}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Tab.Pane>

            {/* TAB PRODUCTO */}
            <Tab.Pane eventKey="producto">
              <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: COLORS.azul }}>
                  <i className="bi bi-phone me-2"></i>Datos del Producto
                </h6>
                <Row className="g-3">
                  {[
                    { label: 'Nombre', value: venta.producto?.nombre || '-' },
                    { label: 'Modelo', value: venta.producto?.modelo || '-' },
                    { label: 'Color', value: venta.producto?.color || '-' },
                    { label: 'Batería', value: venta.producto?.bateria || '-' },
                    { label: 'IMEI', value: <span style={{ fontFamily: 'monospace' }}>{venta.producto?.imei || '-'}</span> },
                    { label: 'Estado', value: <span className="text-capitalize">{venta.producto?.estado || '-'}</span> },
                    { label: 'Valor', value: <span className="fw-bold" style={{ color: COLORS.azul }}>{formatoMoneda(venta.producto?.valor)}</span> },
                  ].map((item, i) => (
                    <Col md={6} key={i}>
                      <div className="d-flex justify-content-between border-bottom py-1" style={{ borderColor: COLORS.bordes }}>
                        <span style={{ color: COLORS.textoSecundario }} className="small">{item.label}</span>
                        <span className="fw-semibold small" style={{ color: COLORS.textoPrincipal }}>{item.value}</span>
                      </div>
                    </Col>
                  ))}
                </Row>

                {venta.tipoVenta === 'plan_canje' && venta.equipoCanje && (
                  <>
                    <h6 className="fw-bold mt-4 mb-3" style={{ fontSize: '0.9rem', color: COLORS.ambar }}>
                      <i className="bi bi-arrow-left-right me-2"></i>Equipo Canje Entregado
                    </h6>
                    <Row className="g-3">
                      {[
                        { label: 'Nombre', value: venta.equipoCanje.nombre || '-' },
                        { label: 'Modelo', value: venta.equipoCanje.modelo || '-' },
                        { label: 'IMEI', value: <span style={{ fontFamily: 'monospace' }}>{venta.equipoCanje.imei || '-'}</span> },
                        { label: 'Estado', value: <span className="text-capitalize">{venta.equipoCanje.estado || '-'}</span> },
                        { label: 'Valor Tasado', value: <span className="fw-bold" style={{ color: COLORS.ambar }}>{formatoMoneda(venta.equipoCanje.valorTasado)}</span> },
                      ].map((item, i) => (
                        <Col md={6} key={i}>
                          <div className="d-flex justify-content-between border-bottom py-1" style={{ borderColor: COLORS.bordes }}>
                            <span style={{ color: COLORS.textoSecundario }} className="small">{item.label}</span>
                            <span className="fw-semibold small" style={{ color: COLORS.textoPrincipal }}>{item.value}</span>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}
              </div>
            </Tab.Pane>

            {/* TAB CUOTAS */}
            {venta.tieneCuotas && (
              <Tab.Pane eventKey="cuotas">
                <div className="rounded-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <div className="table-responsive">
                    <Table hover className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
                      <thead style={{ backgroundColor: COLORS.cardBg }}>
                        <tr>
                          {['#', 'Monto', 'Pagado', 'Vence', 'Estado', 'Cobrada', 'Método', 'Notas'].map(h => (
                            <th key={h} style={{ color: COLORS.textoSecundario, fontWeight: '600', padding: '12px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {venta.cuotas?.map((cuota, idx) => (
                          <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.bordes}` }}>
                            <td className="fw-semibold">{cuota.numeroCuota}</td>
                            <td>{formatoMoneda(cuota.montoCuota)}</td>
                            <td style={{ color: cuota.montoPagado > 0 ? COLORS.verde : COLORS.textoSecundario, fontWeight: cuota.montoPagado > 0 ? '600' : 'normal' }}>
                              {formatoMoneda(cuota.montoPagado)}
                            </td>
                            <td style={{ color: COLORS.textoSecundario }}>{formatoFecha(cuota.fechaCobro)}</td>
                            <td><PillEstadoCuota estado={cuota.estado_cuota} /></td>
                            <td style={{ color: COLORS.textoSecundario }}>{formatoFecha(cuota.fechaCobrada)}</td>
                            <td className="text-capitalize" style={{ color: COLORS.textoSecundario }}>{cuota.metodoPago || '-'}</td>
                            <td>
                              {cuota.notas && cuota.notas.length > 0 ? (
                                <Pill bg={COLORS.azulSuave} color={COLORS.azul} icon="sticky">{cuota.notas.length}</Pill>
                              ) : <span style={{ color: COLORS.textoSecundario }}>-</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  {venta.cuotas?.some(c => c.notas && c.notas.length > 0) && (
                    <div className="p-3" style={{ borderTop: `1px solid ${COLORS.bordes}` }}>
                      <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem', color: COLORS.textoPrincipal }}>
                        <i className="bi bi-sticky me-2"></i>Notas de Cuotas
                      </h6>
                      {venta.cuotas.map((cuota, idx) => (
                        cuota.notas && cuota.notas.length > 0 && (
                          <div key={idx} className="mb-2 p-2 rounded-2" style={{ backgroundColor: COLORS.cardBg }}>
                            <small className="fw-bold" style={{ color: COLORS.azul }}>Cuota #{cuota.numeroCuota}</small>
                            {cuota.notas.map((n, i) => (
                              <div key={i} className="mt-1 small">
                                <span style={{ color: COLORS.textoSecundario }}>{formatoFechaHora(n.fecha)} - {n.usuario?.nombre || 'Sistema'}: </span>
                                <span style={{ color: COLORS.textoPrincipal }}>{n.texto}</span>
                              </div>
                            ))}
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </Tab.Pane>
            )}

            {/* TAB PAGOS */}
            {venta.pagos && venta.pagos.length > 0 && (
              <Tab.Pane eventKey="pagos">
                <div className="rounded-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}`, overflow: 'hidden' }}>
                  <Table hover className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
                    <thead style={{ backgroundColor: COLORS.cardBg }}>
                      <tr>
                        {['Fecha', 'Monto', 'Método', 'Notas'].map(h => (
                          <th key={h} style={{ color: COLORS.textoSecundario, fontWeight: '600', padding: '12px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {venta.pagos.map((pago, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.bordes}` }}>
                          <td style={{ color: COLORS.textoSecundario }}>{formatoFecha(pago.fecha)}</td>
                          <td className="fw-semibold" style={{ color: COLORS.verde }}>{formatoMoneda(pago.monto)}</td>
                          <td className="text-capitalize" style={{ color: COLORS.textoPrincipal }}>{pago.metodo}</td>
                          <td>
                            {pago.notas && pago.notas.length > 0 ? (
                              <div>
                                {pago.notas.map((n, i) => (
                                  <div key={i} className="small">
                                    <span style={{ color: COLORS.textoSecundario }}>{formatoFecha(n.fecha)}:</span> <span style={{ color: COLORS.textoPrincipal }}>{n.texto}</span>
                                  </div>
                                ))}
                              </div>
                            ) : <span style={{ color: COLORS.textoSecundario }}>-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Tab.Pane>
            )}

            {/* TAB DESCUENTOS */}
            {venta.descuentos && venta.descuentos.length > 0 && (
              <Tab.Pane eventKey="descuentos">
                <div className="rounded-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}`, overflow: 'hidden' }}>
                  <Table hover className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
                    <thead style={{ backgroundColor: COLORS.cardBg }}>
                      <tr>
                        {['Fecha', 'Monto', 'Descripción', 'Usuario'].map(h => (
                          <th key={h} style={{ color: COLORS.textoSecundario, fontWeight: '600', padding: '12px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {venta.descuentos.map((desc, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.bordes}` }}>
                          <td style={{ color: COLORS.textoSecundario }}>{formatoFecha(desc.fecha)}</td>
                          <td className="fw-semibold" style={{ color: COLORS.rojo }}>-{formatoMoneda(desc.monto)}</td>
                          <td style={{ color: COLORS.textoPrincipal }}>{desc.descripcion}</td>
                          <td style={{ color: COLORS.textoSecundario }}>{desc.usuario?.nombre || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Tab.Pane>
            )}

            {/* TAB GARANTE */}
            {venta.requiereGarante && venta.garante && (
              <Tab.Pane eventKey="garante">
                <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <h6 className="fw-bold mb-3" style={{ fontSize: '0.9rem', color: COLORS.ambar }}>
                    <i className="bi bi-person-check me-2"></i>Datos del Garante
                  </h6>
                  <Row className="g-3">
                    {[
                      { label: 'Nombre completo', value: `${venta.garante.apellido}, ${venta.garante.nombre}` },
                      { label: 'DNI', value: venta.garante.dni || '-' },
                      { label: 'CUIL', value: venta.garante.cuil || '-' },
                      { label: 'Teléfono', value: venta.garante.telefono || '-' },
                      { label: 'Teléfono 2', value: venta.garante.telefono2 || '-' },
                      { label: 'Email', value: venta.garante.email || '-' },
                      { label: 'Relación', value: venta.garante.relacion || '-' },
                      { label: 'Ocupación', value: venta.garante.ocupacion || '-' },
                      { label: 'Dirección', value: venta.garante.direccion || '-', full: true },
                    ].map((item, i) => (
                      <Col md={item.full ? 12 : 6} key={i}>
                        <div className="d-flex justify-content-between border-bottom py-1" style={{ borderColor: COLORS.bordes }}>
                          <span style={{ color: COLORS.textoSecundario }} className="small">{item.label}</span>
                          <span className="fw-semibold small" style={{ color: COLORS.textoPrincipal }}>{item.value}</span>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Tab.Pane>
            )}

            {/* TAB NOTAS */}
            {venta.notas && venta.notas.length > 0 && (
              <Tab.Pane eventKey="notas">
                <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  {venta.notas.map((nota, idx) => (
                    <div key={idx} className="border-bottom py-2" style={{ borderColor: COLORS.bordes }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <Pill bg={COLORS.cardBg} color={COLORS.textoSecundario} border={COLORS.bordes} style={{ marginBottom: '4px', fontSize: '0.65rem' }}>
                            {nota.tipo || 'general'}
                          </Pill>
                          <p className="mb-1 small" style={{ color: COLORS.textoPrincipal }}>{nota.texto}</p>
                          <small style={{ color: COLORS.textoSecundario }}>
                            <i className="bi bi-person me-1"></i>{nota.usuario?.nombre || 'Sistema'}
                            <span className="ms-2"><i className="bi bi-clock me-1"></i>{formatoFechaHora(nota.fecha)}</span>
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Tab.Pane>
            )}

            {/* TAB DOCUMENTACIÓN */}
            {venta.documentacion?.urlCarpeta && (
              <Tab.Pane eventKey="docs">
                <div className="rounded-3 p-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h6 className="fw-bold mb-1" style={{ fontSize: '0.9rem', color: COLORS.ambar }}>
                        <i className="bi bi-folder-fill me-2"></i>Documentación Cargada
                      </h6>
                      <small style={{ color: COLORS.textoSecundario }}>
                        Subido el {formatoFecha(venta.documentacion.fechaSubida)}
                        {venta.documentacion.subidoPor && ` por ${venta.documentacion.subidoPor}`}
                      </small>
                    </div>
                    <Button href={venta.documentacion.urlCarpeta} target="_blank" rel="noopener noreferrer" className="rounded-3"
                      style={{ backgroundColor: COLORS.azul, borderColor: COLORS.azul, color: '#fff' }}>
                      <i className="bi bi-box-arrow-up-right me-1"></i>Abrir carpeta
                    </Button>
                  </div>
                  {venta.documentacion.notas && (
                    <div className="rounded-2 p-2 mt-3" style={{ backgroundColor: COLORS.cardBg }}>
                      <small style={{ color: COLORS.textoSecundario }} className="d-block mb-1">Notas:</small>
                      <span className="small" style={{ color: COLORS.textoPrincipal }}>{venta.documentacion.notas}</span>
                    </div>
                  )}
                </div>
              </Tab.Pane>
            )}
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>

      <Modal.Footer className="border-0 px-4 pb-4 pt-0">
        <Button variant="outline-secondary" onClick={onHide} className="rounded-3" style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
          <i className="bi bi-x-circle me-1"></i>Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};