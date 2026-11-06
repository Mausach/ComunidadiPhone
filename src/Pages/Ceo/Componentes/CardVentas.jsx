// src/Pages/Ceo/Componentes/VentaCard.jsx

import React, { useState } from 'react';
import { Row, Col, Card, Badge, Button, Spinner, Alert, ProgressBar, Modal, Form } from 'react-bootstrap';
import { actualizarDocumentacionVenta, agregarDocumentacionVenta } from '../Helpers/ReportesMensuales';
import { ModalGenerarDocumentos } from './ModalGenerarDocumentos'; // 👈 NUEVO IMPORT
import { ModalDetalleVenta } from './ModalDetalleVenta'; // 👈 NUEVO IMPORT

// ==========================================
// HELPERS DE FORMATO
// ==========================================
const formatoMoneda = (v) => {
  if (!v && v !== 0) return '$0';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
};

const formatoFecha = (f) => {
  if (!f) return '-';
  return new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ==========================================
// BADGES
// ==========================================
const badgeTipoVenta = (tipo) => {
  const config = {
    contado: { bg: 'success', icon: 'bi-cash-coin', label: 'Contado' },
    plan_canje: { bg: 'warning', text: 'dark', icon: 'bi-arrow-repeat', label: 'Plan Canje' },
    sistema1: { bg: 'primary', icon: 'bi-calendar-check', label: 'Sistema 1' },
    sistema2: { bg: 'info', icon: 'bi-calendar-event', label: 'Sistema 2' }
  };
  const c = config[tipo] || { bg: 'secondary', icon: 'bi-question', label: tipo };
  return (
    <Badge bg={c.bg} text={c.text || 'white'}>
      <i className={`bi ${c.icon} me-1`}></i>
      {c.label}
    </Badge>
  );
};

const badgeConducta = (conducta) => {
  const config = {
    'al dia': { bg: 'success', label: 'Al día' },
    'atrasado': { bg: 'danger', label: 'Atrasado' },
    'cancelado': { bg: 'primary', label: 'Cancelado' },
    'refinanciado': { bg: 'warning', text: 'dark', label: 'Refinanciado' },
    'cobro judicial': { bg: 'dark', label: 'Cobro Judicial' },
    'caducado': { bg: 'secondary', label: 'Caducado' }
  };
  const c = config[conducta] || { bg: 'secondary', label: conducta };
  return <Badge bg={c.bg} text={c.text || 'white'}>{c.label}</Badge>;
};

// ==========================================
// COMPONENTE
// ==========================================
export const VentaCard = ({ venta, usuario, onRefresh }) => {
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });

  // Estado para el modal de documentación (Drive)
  const [showModalDocs, setShowModalDocs] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  const [formDocs, setFormDocs] = useState({ urlCarpeta: '', notas: '' });
  const [savingDocs, setSavingDocs] = useState(false);

  // Estado para el modal de generar documentos
  const [showModalGenerar, setShowModalGenerar] = useState(false);

  // Estado para el modal de detalle completo
  const [showModalDetalle, setShowModalDetalle] = useState(false);

  const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  // ==========================================
  // DOCUMENTACIÓN (Drive)
  // ==========================================
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

    if (!formDocs.urlCarpeta.trim()) {
      showAlert('La URL de la carpeta es obligatoria', 'warning');
      return;
    }
    try {
      new URL(formDocs.urlCarpeta.trim());
    } catch {
      showAlert('La URL ingresada no es válida', 'warning');
      return;
    }

    setSavingDocs(true);
    try {
      const nombreUsuario = usuario?.nombre && usuario?.apellido
        ? `${usuario.nombre} ${usuario.apellido}`
        : usuario?.nombreCompleto || usuario?.nombre || 'Sistema';

      const payload = {
        urlCarpeta: formDocs.urlCarpeta.trim(),
        notas: formDocs.notas.trim(),
        subidoPor: nombreUsuario
      };

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
    } finally {
      setSavingDocs(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  const tieneDocs = !!venta.documentacion?.urlCarpeta;
  const porcentaje = venta.cuotasResumen?.porcentajeCobrado || 0;

  return (
    <>
      <Card
        className="shadow-sm border-0 mb-3"
        style={{
          borderRadius: '8px',
          borderLeft: tieneDocs ? '4px solid #FFC107' : '4px solid #E5E5E5'
        }}
      >
        <Card.Body className="p-3">
          {alert.show && (
            <Alert
              variant={alert.variant}
              className="border-0 mb-3"
              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
              dismissible
              onClose={() => setAlert({ show: false, message: '', variant: 'danger' })}
            >
              <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
              {alert.message}
            </Alert>
          )}

          <Row className="align-items-center g-3">
            {/* Cliente + localidad + vendedor */}
            <Col lg={3} md={12}>
              <div className="d-flex align-items-center">
                <div
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: tieneDocs ? '#e6f4ea' : '#f8f9fa',
                    color: tieneDocs ? '#00A650' : '#6c757d',
                    fontWeight: '600',
                    fontSize: '1rem',
                    flexShrink: 0
                  }}
                >
                  {venta.cliente?.nombre?.charAt(0) || '?'}
                  {venta.cliente?.apellido?.charAt(0) || ''}
                </div>
                <div className="overflow-hidden">
                  <div style={{ fontWeight: '600', color: '#333', fontSize: '0.95rem' }}>
                    {venta.cliente?.apellido}, {venta.cliente?.nombre}
                  </div>
                  <small style={{ color: '#999', fontSize: '0.8rem' }}>
                    {venta.localidad}
                    {venta.vendedor && ` · Vend: ${venta.vendedor}`}
                  </small>
                  <div className="mt-1 d-flex gap-1 flex-wrap">
                    {badgeTipoVenta(venta.tipoVenta)}
                  </div>
                </div>
              </div>
            </Col>

            {/* Producto + Conducta */}
            <Col lg={3} md={12}>
              <div style={{ color: '#666', fontSize: '0.85rem' }}>
                <i className="bi bi-phone me-1"></i>
                {venta.producto?.nombre} {venta.producto?.modelo}
              </div>
              {venta.producto?.imei && (
                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                  IMEI: {venta.producto.imei}
                </small>
              )}
              <div className="mt-1">
                {badgeConducta(venta.conducta_pago)}
              </div>
            </Col>

            {/* Montos + Barra */}
            <Col lg={3} md={12}>
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>
                  {formatoMoneda(venta.montoTotal)}
                </span>
                <small style={{ color: '#00A650', fontSize: '0.8rem' }}>
                  Cobrado: {formatoMoneda(venta.montoPagado)}
                </small>
              </div>

              {venta.tieneCuotas && venta.cuotasResumen ? (
                <>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
                    <small style={{ color: '#666' }}>
                      {venta.cuotasResumen.pagadas}/{venta.cuotasResumen.total} cuotas
                    </small>
                    <small style={{ color: porcentaje === 100 ? '#00A650' : '#666', fontWeight: '600' }}>
                      {porcentaje}%
                    </small>
                  </div>
                  <ProgressBar
                    now={porcentaje}
                    style={{ height: '6px', borderRadius: '3px', backgroundColor: '#f0f0f0' }}
                    variant={porcentaje === 100 ? 'success' : porcentaje >= 50 ? 'warning' : 'danger'}
                  />
                </>
              ) : (
                <small className="text-muted">Sin cuotas</small>
              )}
            </Col>

            {/* Docs + Acciones */}
            <Col lg={3} md={12}>
              {tieneDocs ? (
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-folder-fill" style={{ color: '#FFC107', fontSize: '1rem' }}></i>
                    <small style={{ color: '#333', fontWeight: '600', fontSize: '0.8rem' }}>
                      Documentación cargada
                    </small>
                  </div>
                  <div className="d-flex gap-3 mb-2 flex-wrap">
                    {venta.documentacion.fechaSubida && (
                      <small style={{ color: '#999', fontSize: '0.75rem' }}>
                        <i className="bi bi-calendar-check me-1"></i>
                        {formatoFecha(venta.documentacion.fechaSubida)}
                      </small>
                    )}
                    {venta.documentacion.subidoPor && (
                      <small style={{ color: '#999', fontSize: '0.75rem' }}>
                        <i className="bi bi-person me-1"></i>
                        {venta.documentacion.subidoPor}
                      </small>
                    )}
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-folder-x" style={{ color: '#ccc', fontSize: '1rem' }}></i>
                  <small style={{ color: '#999', fontSize: '0.8rem' }}>
                    Sin documentación
                  </small>
                </div>
              )}

              {/* ==========================================
                  BOTONES DE ACCIÓN (sin "Ver todo")
                  ========================================== */}
              <div className="d-flex gap-2 flex-wrap">
                {tieneDocs && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="rounded-3"
                    href={venta.documentacion.urlCarpeta}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver documentación en Drive"
                  >
                    <i className="bi bi-box-arrow-up-right me-1"></i>Documentacion
                  </Button>
                )}
                <Button
                  variant={tieneDocs ? 'outline-warning' : 'outline-success'}
                  size="sm"
                  className="rounded-3"
                  onClick={handleAbrirModalDocs}
                  title={tieneDocs ? 'Editar documentación' : 'Agregar documentación'}
                >
                  <i className={`bi bi-${tieneDocs ? 'pencil' : 'plus-circle'} me-1`}></i>
                  {tieneDocs ? 'Editar' : 'Agregar'}
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-3"
                  onClick={() => setShowModalGenerar(true)}
                  title="Generar y descargar documentos"
                >
                  <i className="bi bi-file-earmark-arrow-down me-1"></i>
                  Generar Docs
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>

        {/* ==========================================
            FOOTER CON BOTÓN "VER DETALLE COMPLETO"
            ========================================== */}
        <Card.Footer
          className="bg-transparent border-0 pt-0 pb-3 px-3"
          style={{ borderTop: '1px solid #f0f0f0' }}
        >
          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button
              variant="outline-primary"
              size="sm"
              className="rounded-3"
              onClick={() => setShowModalDetalle(true)}
              title="Ver detalle completo de la venta"
            >
              <i className="bi bi-eye me-1"></i>
              Ver detalle completo
            </Button>
          </div>
        </Card.Footer>
      </Card>

      {/* ==========================================
          MODAL DOCS (Drive)
          ========================================== */}
      <Modal show={showModalDocs} onHide={handleCerrarModalDocs} size="md" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className={`bi bi-${esEdicion ? 'pencil' : 'plus-circle'} me-2`}
               style={{ color: esEdicion ? '#FFC107' : '#00A650' }}></i>
            {esEdicion ? 'Editar' : 'Agregar'} Documentación
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardarDocs}>
          <Modal.Body className="pt-3">
            <Alert variant="light" className="border mb-3" style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong>Venta:</strong> {venta.cliente?.apellido}, {venta.cliente?.nombre}
              <br />
              <small className="text-muted">{venta.producto?.nombre} {venta.producto?.modelo}</small>
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">
                URL de la carpeta <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="url"
                value={formDocs.urlCarpeta}
                onChange={(e) => setFormDocs(prev => ({ ...prev, urlCarpeta: e.target.value }))}
                placeholder="https://drive.google.com/drive/folders/..."
                className="rounded-3"
                disabled={savingDocs}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Notas (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formDocs.notas}
                onChange={(e) => setFormDocs(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Ej: Incluye contrato, recibo y garantía firmados"
                className="rounded-3"
                disabled={savingDocs}
                style={{ resize: 'none' }}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="secondary" onClick={handleCerrarModalDocs} className="rounded-3" disabled={savingDocs}>
              Cancelar
            </Button>
            <Button
              variant={esEdicion ? 'warning' : 'success'}
              type="submit"
              className="rounded-3 px-4"
              style={{
                backgroundColor: esEdicion ? '#FFC107' : '#00A650',
                borderColor: esEdicion ? '#FFC107' : '#00A650',
                color: esEdicion ? '#1a1a1a' : '#fff',
                fontWeight: '500'
              }}
              disabled={savingDocs}
            >
              {savingDocs ? (
                <><Spinner size="sm" className="me-2" />Guardando...</>
              ) : (
                <><i className="bi bi-check-circle me-2"></i>{esEdicion ? 'Actualizar' : 'Guardar'}</>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ==========================================
          MODAL DE GENERACIÓN DE DOCUMENTOS
          ========================================== */}
      <ModalGenerarDocumentos
        show={showModalGenerar}
        onHide={() => setShowModalGenerar(false)}
        venta={venta}
        usuario={usuario}
      />

      {/* ==========================================
          MODAL DE DETALLE COMPLETO
          ========================================== */}
      <ModalDetalleVenta
        show={showModalDetalle}
        onHide={() => setShowModalDetalle(false)}
        venta={venta}
      />
    </>
  );
};