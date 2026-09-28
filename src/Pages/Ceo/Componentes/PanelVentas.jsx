// src/Pages/Ceo/Componentes/PanelVentas.jsx

import { actualizarDocumentacionVenta, agregarDocumentacionVenta, obtenerRepVentas } from '../Helpers/ReportesMensuales';

import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Row, Col, Card, Form, InputGroup, Badge,
  Button, Spinner, Alert, ProgressBar, Modal
} from 'react-bootstrap';


// 👇 AJUSTÁ LAS RUTAS DE ESTOS IMPORTS SEGÚN TU PROYECTO
import { ModalFirmaContrato } from '../../Ventas/Componentes/ModalFirma';
import { obtenerEquipoPorVenta } from '../Helpers/stockunicoapi';
import { obtenerDocumentosPorTipo } from '../../Ventas/Helpers/Generardocumentosgeneral';



// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const PanelVentas = ({ usuario }) => {
  const [ventas, setVentas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });
  const alertRef = useRef(null);

  // Paginación
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [hayMas, setHayMas] = useState(false);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroLocalidad, setFiltroLocalidad] = useState('todas');
  const [filtroConducta, setFiltroConducta] = useState('todas');

  // Modal agregar/editar documentación
  const [showModalDocs, setShowModalDocs] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [esEdicion, setEsEdicion] = useState(false);
  const [formDocs, setFormDocs] = useState({ urlCarpeta: '', notas: '' });
  const [savingDocs, setSavingDocs] = useState(false);

  // Modal de firma para regeneración
  const [showModalFirma, setShowModalFirma] = useState(false);
  const [ventaParaRegenerar, setVentaParaRegenerar] = useState(null);
  const [cargandoEquipo, setCargandoEquipo] = useState(false);

  // Firmas + documentos activos por venta
  const [ventaConDocs, setVentaConDocs] = useState(null);
  const [firmasRegenerar, setFirmasRegenerar] = useState(null);

  // Localidades disponibles
  const localidades = ['santiago capital', 'la banda', 'añatuya', 'monte quemado'];

  // Tipos de venta
  const tiposVenta = [
    { value: 'todos', label: 'Todos los tipos' },
    { value: 'contado', label: 'Contado' },
    { value: 'plan_canje', label: 'Plan Canje' },
    { value: 'sistema1', label: 'Sistema 1' },
    { value: 'sistema2', label: 'Sistema 2' }
  ];

  // Conductas
  const conductas = [
    { value: 'todas', label: 'Todas las conductas' },
    { value: 'al dia', label: 'Al día' },
    { value: 'atrasado', label: 'Atrasado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'refinanciado', label: 'Refinanciado' },
    { value: 'cobro judicial', label: 'Cobro Judicial' },
    { value: 'caducado', label: 'Caducado' }
  ];

  // ==========================================
  // CARGA DE DATOS
  // ==========================================

  useEffect(() => {
    cargarDatos(1);
  }, []);

  const cargarDatos = async (paginaSolicitada = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await obtenerRepVentas({
        pagina: paginaSolicitada,
        limite: 15,
        ...(filtroTipo !== 'todos' && { tipoVenta: filtroTipo }),
        ...(filtroLocalidad !== 'todas' && { localidad: filtroLocalidad }),
        ...(filtroConducta !== 'todas' && { conducta: filtroConducta }),
        ...(busqueda.trim() && { busqueda: busqueda.trim() })
      });

      setVentas(data?.data?.ventas || []);
      const pag = data?.data?.paginacion || {};
      setPagina(pag.pagina || 1);
      setTotalPaginas(pag.totalPaginas || 1);
      setTotal(pag.total || 0);
      setHayMas(pag.hayMas || false);
    } catch (err) {
      setError(err.message || 'Error al cargar las ventas');
      setVentas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuscar = () => cargarDatos(1);

  const handleLimpiar = () => {
    setBusqueda('');
    setFiltroTipo('todos');
    setFiltroLocalidad('todas');
    setFiltroConducta('todas');
    setTimeout(() => cargarDatos(1), 0);
  };

  const handlePaginaAnterior = () => {
    if (pagina > 1) cargarDatos(pagina - 1);
  };

  const handlePaginaSiguiente = () => {
    if (hayMas) cargarDatos(pagina + 1);
  };

  // ==========================================
  // ALERT
  // ==========================================

  const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => {
      if (alertRef.current) {
        alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  // ==========================================
  // MODAL DOCUMENTACIÓN
  // ==========================================

  const handleAbrirModalDocs = (venta) => {
    const tieneDocs = !!venta.documentacion?.urlCarpeta;

    setVentaSeleccionada(venta);
    setEsEdicion(tieneDocs);
    setFormDocs({
      urlCarpeta: venta.documentacion?.urlCarpeta || '',
      notas: venta.documentacion?.notas || ''
    });
    setShowModalDocs(true);
  };

  const handleCerrarModalDocs = () => {
    setShowModalDocs(false);
    setVentaSeleccionada(null);
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
        await actualizarDocumentacionVenta(ventaSeleccionada._id, payload);
        showAlert('Documentación actualizada correctamente', 'success');
      } else {
        await agregarDocumentacionVenta(ventaSeleccionada._id, payload);
        showAlert('Documentación agregada correctamente', 'success');
      }

      handleCerrarModalDocs();
      cargarDatos(pagina);
    } catch (err) {
      showAlert(err.message || 'Error al guardar la documentación', 'danger');
    } finally {
      setSavingDocs(false);
    }
  };

  // ==========================================
  // REGENERAR DOCUMENTOS
  // ==========================================

  const handleAbrirModalFirma = async (venta) => {
    // Cerrar cualquier card de docs abierta antes de abrir el modal
    setVentaConDocs(null);
    setFirmasRegenerar(null);

    // Si es plan_canje, buscar el equipo canje primero
    if (venta.tipoVenta === 'plan_canje') {
      setCargandoEquipo(true);
      try {
        const resp = await obtenerEquipoPorVenta(venta._id);
        const equipoCanje = resp?.data?.equipoCanje;

        if (!equipoCanje) {
          showAlert(
            'No se encontró el equipo canje de esta venta. Los documentos se generarán sin esos datos.',
            'warning'
          );
        }

        setVentaParaRegenerar({
          ...venta,
          equipoCanje: equipoCanje || {}
        });
      } catch (error) {
        console.error('Error al obtener equipo canje:', error);
        showAlert('Error al buscar el equipo canje. Continuamos sin esos datos.', 'warning');
        setVentaParaRegenerar({
          ...venta,
          equipoCanje: {}
        });
      } finally {
        setCargandoEquipo(false);
      }
    } else {
      setVentaParaRegenerar(venta);
    }

    setShowModalFirma(true);
  };

  const handleCerrarModalFirma = () => {
    setShowModalFirma(false);
    setVentaParaRegenerar(null);
  };

  const handleConfirmarFirmas = (firmas) => {
    if (!ventaParaRegenerar) return;

    // Guardar firmas y venta para mostrar los botones inline
    setFirmasRegenerar(firmas);
    setVentaConDocs(ventaParaRegenerar);

    // Cerrar modal de firma
    setShowModalFirma(false);
    setVentaParaRegenerar(null);

    showAlert('Firmas capturadas. Elegí qué documentos descargar.', 'success');
  };

  const handleCerrarDocsInline = () => {
    setVentaConDocs(null);
    setFirmasRegenerar(null);
  };

  const handleDescargarDocumento = (doc) => {
    try {
      doc.handler();
      showAlert(`Documento "${doc.label}" descargado`, 'success');
    } catch (error) {
      console.error(`Error generando ${doc.label}:`, error);
      showAlert(`Error al generar "${doc.label}": ${error.message}`, 'danger');
    }
  };

  // ==========================================
  // HELPERS DE FORMATO
  // ==========================================

  const formatoMoneda = (v) => {
    if (!v && v !== 0) return '$0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(v);
  };

  const formatoFecha = (f) => {
    if (!f) return '-';
    return new Date(f).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
  // RENDER
  // ==========================================

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: '#1a1a1a' }}>
          <i className="bi bi-list-check me-2" style={{ color: '#3483FA' }}></i>
          Panel de Ventas
        </h3>
        <p className="text-muted">
          Consultá todas las ventas registradas · {total} ventas en total
        </p>
      </div>

      {/* Alert */}
      {alert.show && (
        <Alert
          ref={alertRef}
          variant={alert.variant}
          className="shadow-sm border-0 mb-3"
          style={{ borderRadius: '8px' }}
          onClose={() => setAlert({ show: false, message: '', variant: 'danger' })}
          dismissible
        >
          <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {alert.message}
        </Alert>
      )}

      {/* Filtros */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '8px' }}>
        <Card.Body className="p-3">
          <Row className="g-3 align-items-end">
            <Col lg={3} md={6}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e5e5' }}>
                  <i className="bi bi-search" style={{ color: '#999' }}></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar cliente, DNI o producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                  style={{ border: '1px solid #e5e5e5', fontSize: '0.9rem', padding: '10px 12px' }}
                />
              </InputGroup>
            </Col>

            <Col lg={2} md={6}>
              <Form.Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}
              >
                {tiposVenta.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Form.Select>
            </Col>

            <Col lg={2} md={6}>
              <Form.Select
                value={filtroLocalidad}
                onChange={(e) => setFiltroLocalidad(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}
              >
                <option value="todas">Todas las localidades</option>
                {localidades.map(loc => (
                  <option key={loc} value={loc}>
                    {loc.charAt(0).toUpperCase() + loc.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col lg={2} md={6}>
              <Form.Select
                value={filtroConducta}
                onChange={(e) => setFiltroConducta(e.target.value)}
                style={{ border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', padding: '10px 12px' }}
              >
                {conductas.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Form.Select>
            </Col>

            <Col lg={3} md={12} className="d-flex justify-content-end gap-2 flex-wrap">
              <Button onClick={handleBuscar} variant="outline-primary" size="sm" className="rounded-3">
                <i className="bi bi-search me-1"></i>Buscar
              </Button>
              <Button onClick={handleLimpiar} variant="outline-secondary" size="sm" className="rounded-3">
                <i className="bi bi-eraser me-1"></i>Limpiar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: '#3483FA' }} />
          <p className="text-muted mt-3">Cargando ventas...</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '8px' }}>
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button
            onClick={() => cargarDatos(pagina)}
            className="btn btn-link btn-sm ms-3"
            style={{ color: '#dc3545', textDecoration: 'underline' }}
          >
            Reintentar
          </button>
        </Alert>
      )}

      {/* Sin ventas */}
      {!isLoading && !error && ventas.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <p className="text-muted mt-3">No hay ventas con los filtros aplicados</p>
        </div>
      )}

      {/* Lista de ventas */}
      {!isLoading && !error && ventas.length > 0 && (
        <>
          {ventas.map((venta) => {
            const tieneDocs = !!venta.documentacion?.urlCarpeta;
            const porcentaje = venta.cuotasResumen?.porcentajeCobrado || 0;
            const mostrandoDocs = ventaConDocs?._id === venta._id;

            return (
              <Card
                key={venta._id}
                className="shadow-sm border-0 mb-3"
                style={{
                  borderRadius: '8px',
                  borderLeft: tieneDocs ? '4px solid #FFC107' : '4px solid #E5E5E5'
                }}
              >
                <Card.Body className="p-3">
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

                    {/* Montos + Barra de progreso */}
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

                    {/* Documentación + Acciones */}
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

                      <div className="d-flex gap-2 flex-wrap">
                        {tieneDocs && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-3"
                            href={venta.documentacion.urlCarpeta}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver documentación"
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i>Ver
                          </Button>
                        )}

                        <Button
                          variant={tieneDocs ? 'outline-warning' : 'outline-success'}
                          size="sm"
                          className="rounded-3"
                          onClick={() => handleAbrirModalDocs(venta)}
                          title={tieneDocs ? 'Editar documentación' : 'Agregar documentación'}
                        >
                          <i className={`bi bi-${tieneDocs ? 'pencil' : 'plus-circle'} me-1`}></i>
                          {tieneDocs ? 'Editar' : 'Agregar'}
                        </Button>

                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="rounded-3"
                          onClick={() => handleAbrirModalFirma(venta)}
                          disabled={cargandoEquipo}
                          title="Regenerar documentación"
                        >
                          {cargandoEquipo ? (
                            <><Spinner size="sm" className="me-1" />Cargando...</>
                          ) : (
                            <><i className="bi bi-arrow-clockwise me-1"></i>Regenerar</>
                          )}
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  {/* SECCIÓN INLINE DE DOCUMENTOS A DESCARGAR */}
                  {mostrandoDocs && firmasRegenerar && (
                    <div
                      className="mt-3 pt-3"
                      style={{ borderTop: '2px dashed #dee2e6' }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <h6 className="fw-bold mb-0" style={{ color: '#1a1a1a', fontSize: '0.9rem' }}>
                            <i className="bi bi-download me-2" style={{ color: '#00A650' }}></i>
                            Documentos disponibles para descargar
                          </h6>
                          <small className="text-muted">
                            Firmas capturadas · Podés descargar uno o varios
                          </small>
                        </div>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="rounded-3"
                          onClick={handleCerrarDocsInline}
                        >
                          <i className="bi bi-x-lg me-1"></i>Cerrar
                        </Button>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        {obtenerDocumentosPorTipo(ventaConDocs, firmasRegenerar).map(doc => (
                          <Button
                            key={doc.key}
                            variant={doc.variant}
                            size="sm"
                            className="rounded-3"
                            onClick={() => handleDescargarDocumento(doc)}
                            title={doc.descripcion}
                            style={{ fontWeight: '500' }}
                          >
                            <i className={`bi ${doc.icon} me-2`}></i>
                            {doc.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            );
          })}

          {/* Paginación */}
          <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
            <small className="text-muted">
              Mostrando {ventas.length} de {total} ventas
            </small>
            <div className="d-flex gap-2 align-items-center">
              <Button
                variant="outline-primary"
                size="sm"
                className="rounded-3"
                onClick={handlePaginaAnterior}
                disabled={pagina <= 1}
              >
                <i className="bi bi-chevron-left me-1"></i>Anterior
              </Button>
              <small className="text-muted">
                Página {pagina} de {totalPaginas}
              </small>
              <Button
                variant="outline-primary"
                size="sm"
                className="rounded-3"
                onClick={handlePaginaSiguiente}
                disabled={!hayMas}
              >
                Siguiente<i className="bi bi-chevron-right ms-1"></i>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ============================================
          MODAL AGREGAR/EDITAR DOCUMENTACIÓN
          ============================================ */}
      <Modal
        show={showModalDocs}
        onHide={handleCerrarModalDocs}
        size="md"
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i
              className={`bi bi-${esEdicion ? 'pencil' : 'plus-circle'} me-2`}
              style={{ color: esEdicion ? '#FFC107' : '#00A650' }}
            ></i>
            {esEdicion ? 'Editar' : 'Agregar'} Documentación
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardarDocs}>
          <Modal.Body className="pt-3">
            {ventaSeleccionada && (
              <Alert variant="light" className="border mb-3" style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
                <strong>Venta:</strong> {ventaSeleccionada.cliente?.apellido}, {ventaSeleccionada.cliente?.nombre}
                <br />
                <small className="text-muted">
                  {ventaSeleccionada.producto?.nombre} {ventaSeleccionada.producto?.modelo}
                </small>
              </Alert>
            )}

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
              <Form.Text className="text-muted">
                Link a la carpeta en la nube con los documentos
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">
                Notas (opcional)
              </Form.Label>
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

            <Alert variant="info" className="border-0 mb-0" style={{ borderRadius: '8px', fontSize: '0.8rem' }}>
              <i className="bi bi-info-circle me-1"></i>
              Se guardará tu nombre como responsable de la carga
            </Alert>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="secondary"
              onClick={handleCerrarModalDocs}
              className="rounded-3"
              disabled={savingDocs}
            >
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

      {/* ============================================
          MODAL DE FIRMA (reutilizado de Ventas)
          ============================================ */}
      <ModalFirmaContrato
        show={showModalFirma}
        onHide={handleCerrarModalFirma}
        venta={ventaParaRegenerar}
        onConfirmar={handleConfirmarFirmas}
      />
    </Container>
  );
};