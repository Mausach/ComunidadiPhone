// src/Pages/Ceo/Componentes/VentaCard.jsx
import React, { useState } from 'react';
import { Row, Col, Card, Button, Spinner, Alert, ProgressBar, Modal, Form } from 'react-bootstrap';
import { actualizarDocumentacionVenta, agregarDocumentacionVenta } from '../Helpers/ReportesMensuales';
import { ModalGenerarDocumentos } from './ModalGenerarDocumentos';
import { ModalDetalleVenta } from './ModalDetalleVenta';
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

// Pills de Estado
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

export const VentaCard = ({ venta, usuario, onRefresh }) => {
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });
  const [showModalDocs, setShowModalDocs] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  const [formDocs, setFormDocs] = useState({ urlCarpeta: '', notas: '' });
  const [savingDocs, setSavingDocs] = useState(false);
  const [showModalGenerar, setShowModalGenerar] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);

  const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  const handleAbrirModalDocs = () => {
    const tieneDocs = !!venta.documentacion?.urlCarpeta;
    setEsEdicion(tieneDocs);
    setFormDocs({
      urlCarpeta: venta.documentacion?.urlCarpeta || '',
      notas: venta.documentacion?.notas || ''
    });
    setShowModalDocs(true);
  };

  const handleCerrarModalDocs = () => {
    setShowModalDocs(false);
    setEsEdicion(false);
    setFormDocs({ urlCarpeta: '', notas: '' });
  };

  const handleGuardarDocs = async (e) => {
    e.preventDefault();
    if (!formDocs.urlCarpeta.trim()) return showAlert('La URL de la carpeta es obligatoria', 'warning');
    try { new URL(formDocs.urlCarpeta.trim()); } catch { return showAlert('La URL ingresada no es válida', 'warning'); }

    setSavingDocs(true);
    try {
      const nombreUsuario = usuario?.nombre && usuario?.apellido
        ? `${usuario.nombre} ${usuario.apellido}`
        : usuario?.nombreCompleto || usuario?.nombre || 'Sistema';

      const payload = { urlCarpeta: formDocs.urlCarpeta.trim(), notas: formDocs.notas.trim(), subidoPor: nombreUsuario };

      if (esEdicion) {
        await actualizarDocumentacionVenta(venta._id, payload);
        showAlert('Documentación actualizada correctamente', 'success');
      } else {
        await agregarDocumentacionVenta(venta._id, payload);
        showAlert('Documentación agregada correctamente', 'success');
      }
      handleCerrarModalDocs();
      onRefresh && onRefresh();
    } catch (err) {
      showAlert(err.message || 'Error al guardar la documentación', 'danger');
    } finally { setSavingDocs(false); }
  };

  const tieneDocs = !!venta.documentacion?.urlCarpeta;
  const porcentaje = venta.cuotasResumen?.porcentajeCobrado || 0;

  return (
    <>
      <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '12px', backgroundColor: COLORS.cardBg, borderLeft: `4px solid ${tieneDocs ? COLORS.ambar : COLORS.bordes}` }}>
        <Card.Body className="p-3">
          {alert.show && (
            <Alert variant={alert.variant} className="rounded-3 border-0 mb-3 shadow-sm"
              style={{
                fontSize: '0.85rem',
                backgroundColor: alert.variant === 'success' ? COLORS.verdeSuave : COLORS.rojoSuave,
                color: alert.variant === 'success' ? COLORS.verde : COLORS.rojo
              }} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'danger' })}>
              <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
              {alert.message}
            </Alert>
          )}

          <Row className="align-items-center g-3">
            {/* Cliente */}
            <Col lg={3} md={12}>
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    backgroundColor: tieneDocs ? COLORS.verdeSuave : COLORS.bgGeneral,
                    color: tieneDocs ? COLORS.verde : COLORS.textoSecundario,
                    fontWeight: '600', fontSize: '1rem', flexShrink: 0
                  }}>
                  {venta.cliente?.nombre?.charAt(0) || '?'}{venta.cliente?.apellido?.charAt(0) || ''}
                </div>
                <div className="overflow-hidden">
                  <div style={{ fontWeight: '600', color: COLORS.textoPrincipal, fontSize: '0.95rem' }}>
                    {venta.cliente?.apellido}, {venta.cliente?.nombre}
                  </div>
                  <small style={{ color: COLORS.textoSecundario, fontSize: '0.8rem' }}>
                    {venta.localidad} {venta.vendedor && ` · Vend: ${venta.vendedor}`}
                  </small>
                  <div className="mt-1 d-flex gap-1 flex-wrap">
                    <PillTipoVenta tipo={venta.tipoVenta} />
                  </div>
                </div>
              </div>
            </Col>

            {/* Producto + Conducta */}
            <Col lg={3} md={12}>
              <div style={{ color: COLORS.textoPrincipal, fontSize: '0.85rem' }}>
                <i className="bi bi-phone me-1" style={{ color: COLORS.azul }}></i>
                {venta.producto?.nombre} {venta.producto?.modelo}
              </div>
              {venta.producto?.imei && (
                <small className="d-block" style={{ color: COLORS.textoSecundario, fontSize: '0.75rem' }}>
                  IMEI: {venta.producto.imei}
                </small>
              )}
              <div className="mt-1"><PillConducta conducta={venta.conducta_pago} /></div>
            </Col>

            {/* Montos */}
            <Col lg={3} md={12}>
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontWeight: '600', color: COLORS.textoPrincipal, fontSize: '0.9rem' }}>
                  {formatoMoneda(venta.montoTotal)}
                </span>
                <small style={{ color: COLORS.verde, fontSize: '0.8rem', fontWeight: '600' }}>
                  Cobrado: {formatoMoneda(venta.montoPagado)}
                </small>
              </div>

              {venta.tieneCuotas && venta.cuotasResumen ? (
                <>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
                    <small style={{ color: COLORS.textoSecundario }}>
                      {venta.cuotasResumen.pagadas}/{venta.cuotasResumen.total} cuotas
                    </small>
                    <small style={{ color: porcentaje === 100 ? COLORS.verde : COLORS.textoSecundario, fontWeight: '600' }}>
                      {porcentaje}%
                    </small>
                  </div>
                  <ProgressBar now={porcentaje} style={{ height: '6px', borderRadius: '3px', backgroundColor: COLORS.bgGeneral }}
                    variant={porcentaje === 100 ? 'success' : porcentaje >= 50 ? 'warning' : 'danger'} />
                </>
              ) : <small style={{ color: COLORS.textoSecundario }}>Sin cuotas</small>}
            </Col>

            {/* Documentación + Acciones */}
            <Col lg={3} md={12}>
              <div className="mb-2 d-flex align-items-center gap-2">
                <i className={`bi bi-${tieneDocs ? 'folder-fill' : 'folder-x'}`} style={{ color: tieneDocs ? COLORS.ambar : COLORS.textoSecundario, fontSize: '1rem' }}></i>
                <small style={{ color: tieneDocs ? COLORS.textoPrincipal : COLORS.textoSecundario, fontWeight: '600', fontSize: '0.8rem' }}>
                  {tieneDocs ? 'Documentación cargada' : 'Sin documentación'}
                </small>
              </div>
              {tieneDocs && (
                <div className="d-flex gap-3 mb-2 flex-wrap">
                  {venta.documentacion.fechaSubida && (
                    <small style={{ color: COLORS.textoSecundario, fontSize: '0.75rem' }}>
                      <i className="bi bi-calendar-check me-1"></i>{formatoFecha(venta.documentacion.fechaSubida)}
                    </small>
                  )}
                  {venta.documentacion.subidoPor && (
                    <small style={{ color: COLORS.textoSecundario, fontSize: '0.75rem' }}>
                      <i className="bi bi-person me-1"></i>{venta.documentacion.subidoPor}
                    </small>
                  )}
                </div>
              )}
              <div className="d-flex gap-2 flex-wrap">
                {tieneDocs && (
                  <Button variant="outline-primary" size="sm" className="rounded-3" href={venta.documentacion.urlCarpeta} target="_blank" rel="noopener noreferrer"
                    style={{ borderColor: COLORS.azul, color: COLORS.azul }}>
                    <i className="bi bi-box-arrow-up-right me-1"></i>Ver Docs
                  </Button>
                )}
                <Button variant={tieneDocs ? 'outline-warning' : 'outline-success'} size="sm" className="rounded-3"
                  onClick={handleAbrirModalDocs} style={{ borderColor: tieneDocs ? COLORS.ambar : COLORS.verde, color: tieneDocs ? COLORS.ambar : COLORS.verde }}>
                  <i className={`bi bi-${tieneDocs ? 'pencil' : 'plus-circle'} me-1`}></i>{tieneDocs ? 'Editar' : 'Agregar'}
                </Button>
                <Button variant="primary" size="sm" className="rounded-3" onClick={() => setShowModalGenerar(true)}
                  style={{ backgroundColor: COLORS.azul, borderColor: COLORS.azul, color: '#fff' }}>
                  <i className="bi bi-file-earmark-arrow-down me-1"></i>Generar
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>

        <Card.Footer className="bg-transparent border-0 pt-0 pb-3 px-3" style={{ borderTop: `1px solid ${COLORS.bordes}` }}>
          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button variant="outline-secondary" size="sm" className="rounded-3" onClick={() => setShowModalDetalle(true)}
              style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
              <i className="bi bi-eye me-1"></i>Ver detalle completo
            </Button>
          </div>
        </Card.Footer>
      </Card>

      {/* MODAL DOCS (Drive) */}
      <Modal show={showModalDocs} onHide={handleCerrarModalDocs} size="md" centered>
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
            <i className={`bi bi-${esEdicion ? 'pencil' : 'plus-circle'} me-2`} style={{ color: esEdicion ? COLORS.ambar : COLORS.verde }}></i>
            {esEdicion ? 'Editar' : 'Agregar'} Documentación
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardarDocs}>
          <Modal.Body className="px-4 pt-3">
            <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: COLORS.bgGeneral, border: `1px solid ${COLORS.bordes}` }}>
              <strong style={{ color: COLORS.textoPrincipal }}>{venta.cliente?.apellido}, {venta.cliente?.nombre}</strong>
              <div><small style={{ color: COLORS.textoSecundario }}>{venta.producto?.nombre} {venta.producto?.modelo}</small></div>
            </div>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>URL de la carpeta <span className="text-danger">*</span></Form.Label>
              <Form.Control type="url" value={formDocs.urlCarpeta} onChange={(e) => setFormDocs(prev => ({ ...prev, urlCarpeta: e.target.value }))}
                placeholder="https://drive.google.com/drive/folders/..." className="rounded-3" disabled={savingDocs} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold" style={{ color: COLORS.textoSecundario }}>Notas (opcional)</Form.Label>
              <Form.Control as="textarea" rows={2} value={formDocs.notas} onChange={(e) => setFormDocs(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Ej: Incluye contrato, recibo y garantía firmados" className="rounded-3" disabled={savingDocs} style={{ resize: 'none' }} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4 pt-0">
            <Button variant="outline-secondary" onClick={handleCerrarModalDocs} className="rounded-3" disabled={savingDocs} style={{ borderColor: COLORS.bordes, color: COLORS.textoSecundario }}>
              Cancelar
            </Button>
            <Button type="submit" className="rounded-3 px-4" disabled={savingDocs}
              style={{ backgroundColor: esEdicion ? COLORS.ambar : COLORS.verde, borderColor: esEdicion ? COLORS.ambar : COLORS.verde, color: '#fff', fontWeight: '600' }}>
              {savingDocs ? <><Spinner size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-check-circle me-2"></i>{esEdicion ? 'Actualizar' : 'Guardar'}</>}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODALES ANIDADOS */}
      <ModalGenerarDocumentos show={showModalGenerar} onHide={() => setShowModalGenerar(false)} venta={venta} usuario={usuario} />
      <ModalDetalleVenta show={showModalDetalle} onHide={() => setShowModalDetalle(false)} venta={venta} />
    </>
  );
};