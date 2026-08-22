// Ventas/index.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useLocation, Navigate } from 'react-router-dom';

import { NavBarVentas } from './Componentes/NavBarVentas';
import { FormularioCliente } from './Componentes/FormularioCliente';
import { crearCliente } from './Helpers/AltaCliente';
import { FormularioVenta } from './Componentes/FormularioVenta';
import { crearVenta } from './Helpers/AltaVenta';
import { generarContratoPDF } from './Helpers/GenerarContrato';
import { ModalFirmaContrato } from './Componentes/ModalFirma';


export const Ventas = ({ mostrarNavbar = true }) => {
  const location = useLocation();
  const usuario = location.state?.user || JSON.parse(localStorage.getItem('user') || '{}');

  const [vistaActiva, setVistaActiva] = useState('nueva-venta');

  const [isLoading, setIsLoading] = useState(false);
  const [clienteData, setClienteData] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [pasoActual, setPasoActual] = useState(1);
  const [ventaCreada, setVentaCreada] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });

  const [showFirma, setShowFirma] = useState(false);
  // 🆕 Firmas guardadas una sola vez
  const [firmasGuardadas, setFirmasGuardadas] = useState(null);

  if (!usuario || !usuario.rol) {
    return <Navigate to="/" replace />;
  }

  if (usuario.rol !== 'ventas' && usuario.rol !== 'ger_com') {
    return <Navigate to="/" replace />;
  }

  const showAlert = (message, variant = 'danger') => {
    if (!message) { setAlert({ show: false, message: '', variant: 'danger' }); return; }
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 7000);
  };

  const handleClienteSubmit = async (formData, esExistente = false) => {
    setIsLoading(true);
    try {
      const result = await crearCliente(formData, setClienteData, showAlert, esExistente);
      if (result.clienteId) setClienteId(result.clienteId);
      setTimeout(() => {
        setIsLoading(false);
        setPasoActual(2);
        showAlert(
          esExistente ? 'Cliente verificado correctamente' : result.message || 'Cliente creado exitosamente',
          'success'
        );
      }, 1500);
    } catch (error) {
      showAlert(error.message || 'Error al procesar el cliente', 'danger');
      setIsLoading(false);
    }
  };

  const handleVentaSubmit = async (ventaData) => {
    console.log('📦 Datos de venta recibidos:', ventaData);
    setIsLoading(true);
    try {
      const result = await crearVenta(ventaData);
      setVentaCreada(result.data);
      setTimeout(() => {
        setIsLoading(false);
        setPasoActual(3);
        showAlert('¡Venta creada exitosamente!', 'success');
      }, 1500);
    } catch (error) {
      console.error('❌ Error al crear venta:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const handleNuevaVenta = () => {
    setPasoActual(1);
    setClienteData(null);
    setClienteId(null);
    setVentaCreada(null);
    setFirmasGuardadas(null); // 🆕 Limpiar firmas
    setAlert({ show: false, message: '', variant: 'danger' });
  };

  // 🆕 Guardar firmas al confirmar
  const handleFirmarDocumentos = (firmas) => {
    setFirmasGuardadas(firmas);
    setShowFirma(false);
    showAlert('Firmas guardadas correctamente. Ya podés generar los documentos.', 'success');
  };

  // 🆕 Volver a firmar
  const handleVolverAFirmar = () => {
    setFirmasGuardadas(null);
    setShowFirma(true);
  };

  // 🆕 Generadores de documentos
  const handleGenerarContrato = () => {
    if (ventaCreada && firmasGuardadas) {
      generarContratoPDF(ventaCreada, firmasGuardadas.cliente, firmasGuardadas.garante);
    }
  };

  const handleGenerarAdhesion = () => {
    // Futuro: generarFormularioAdhesionPDF(ventaCreada, firmasGuardadas)
    showAlert('Formulario de Adhesión - Próximamente', 'info');
  };

  const handleGenerarRecibo = () => {
    // Futuro: generarReciboEntregaPDF(ventaCreada, firmasGuardadas)
    showAlert('Recibo de Entrega - Próximamente', 'info');
  };

  const handleGenerarGarantia = () => {
    // Futuro: generarGarantiaPDF(ventaCreada, firmasGuardadas)
    showAlert('Garantía - Próximamente', 'info');
  };

  const formatMonto = (monto) => !monto ? '$0' : `$${monto.toLocaleString('es-AR')}`;
  const formatFecha = (fecha) => !fecha ? '-' : new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const DashboardVentas = () => (
    <div className="p-4"><h3>Panel de Ventas</h3><p>Bienvenido, {usuario?.nombre}</p></div>
  );

  const MisVentas = () => (
    <div className="p-4"><h3>Mis Ventas</h3><p>Historial de ventas - En desarrollo</p></div>
  );

  const tieneGarante = ventaCreada?.requiereGarante || ventaCreada?.garante?.nombre;

  const renderVista = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return <DashboardVentas />;
      case 'nueva-venta':
        return (
          <Container fluid className="py-4">
            <Row className="justify-content-center">
              <Col lg={10} xl={8}>
                <div className="mb-4">
                  <h2 className="fw-bold mb-1" style={{ color: '#1a1a1a' }}>
                    <i className="bi bi-cart-plus me-2" style={{ color: '#3483FA' }}></i>
                    Nueva Venta
                  </h2>
                  <p className="text-muted small">
                    {pasoActual === 1 && 'Paso 1: Registrá los datos del cliente'}
                    {pasoActual === 2 && 'Paso 2: Completá los datos de la venta'}
                    {pasoActual === 3 && '✅ Venta completada'}
                  </p>
                </div>

                {pasoActual === 1 && (
                  <FormularioCliente onSubmit={handleClienteSubmit} isLoading={isLoading} alert={alert} showAlert={showAlert} />
                )}

                {pasoActual === 2 && clienteData && (
                  <FormularioVenta
                    clienteData={clienteData}
                    onSubmit={handleVentaSubmit}
                    isLoading={isLoading}
                    vendedor={usuario?.nombre + ' ' + usuario?.apellido}
                    onVolver={handleNuevaVenta}
                  />
                )}

                {pasoActual === 3 && ventaCreada && (
                  <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                    <Card.Body className="p-4 p-md-5 text-center">
                      <div className="mb-4">
                        <div className="d-inline-flex align-items-center justify-content-center mb-3"
                          style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#e6f7ee', color: '#00a650', fontSize: '2rem' }}>
                          <i className="bi bi-check-circle-fill"></i>
                        </div>
                        <h4 className="fw-bold" style={{ color: '#1a1a1a' }}>¡Venta Creada Exitosamente!</h4>
                        <p className="text-muted">Los datos de la venta se guardaron correctamente.</p>
                      </div>
                      <div className="bg-light rounded-3 p-3 mb-4">
                        <Row className="g-3 text-start">
                          <Col md={6}><small className="text-muted d-block">Cliente</small><span className="fw-semibold">{ventaCreada.cliente?.apellido}, {ventaCreada.cliente?.nombre}</span></Col>
                          <Col md={6}><small className="text-muted d-block">DNI</small><span className="fw-semibold">{ventaCreada.cliente?.dni}</span></Col>
                          <Col md={6}><small className="text-muted d-block">Producto</small><span className="fw-semibold">{ventaCreada.producto?.nombre}</span></Col>
                          <Col md={6}><small className="text-muted d-block">Tipo de Venta</small><Badge bg="primary">{ventaCreada.tipoVenta}</Badge></Col>
                          <Col md={6}><small className="text-muted d-block">Monto Total</small><span className="fw-bold text-success">{formatMonto(ventaCreada.montoTotal)}</span></Col>
                          <Col md={6}><small className="text-muted d-block">Fecha</small><span className="fw-semibold">{formatFecha(ventaCreada.fechaRealizada)}</span></Col>
                          {ventaCreada.cuotas && ventaCreada.cuotas.length > 0 && (
                            <Col md={6}><small className="text-muted d-block">Cuotas</small><span className="fw-semibold">{ventaCreada.cuotas.length} x {formatMonto(ventaCreada.cuotas[0]?.montoCuota)}</span></Col>
                          )}
                          {tieneGarante && (
                            <Col md={6}><small className="text-muted d-block">Garante</small><span className="fw-semibold">{ventaCreada.garante?.apellido}, {ventaCreada.garante?.nombre}</span></Col>
                          )}
                        </Row>
                      </div>

                      {/* 🆕 Sección de documentos */}
                      {!firmasGuardadas ? (
                        <Button onClick={() => setShowFirma(true)} className="rounded-3 px-4"
                          variant="success" style={{ fontWeight: '500', minWidth: '250px' }}>
                          <i className="bi bi-pen me-2"></i>Firmar Documentos
                        </Button>
                      ) : (
                        <div className="mb-4">
                          <Badge bg="success" className="mb-3 p-2">
                            <i className="bi bi-check-circle me-1"></i>Firmas guardadas correctamente
                          </Badge>
                          <div className="d-flex flex-column gap-2 align-items-center">
                            <Button onClick={handleGenerarContrato} className="rounded-3 px-4"
                              variant="primary" style={{ fontWeight: '500', minWidth: '250px' }}>
                              <i className="bi bi-file-earmark-text me-2"></i>Descargar Contrato
                            </Button>
                            <Button onClick={handleGenerarAdhesion} className="rounded-3 px-4"
                              variant="outline-primary" style={{ fontWeight: '500', minWidth: '250px' }}>
                              <i className="bi bi-file-text me-2"></i>Formulario de Adhesión
                            </Button>
                            <Button onClick={handleGenerarRecibo} className="rounded-3 px-4"
                              variant="outline-primary" style={{ fontWeight: '500', minWidth: '250px' }}>
                              <i className="bi bi-receipt me-2"></i>Recibo de Entrega
                            </Button>
                            <Button onClick={handleGenerarGarantia} className="rounded-3 px-4"
                              variant="outline-primary" style={{ fontWeight: '500', minWidth: '250px' }}>
                              <i className="bi bi-shield-check me-2"></i>Garantía
                            </Button>
                            <Button onClick={handleVolverAFirmar} className="rounded-3 px-4"
                              variant="outline-secondary" style={{ fontWeight: '500', minWidth: '250px' }}>
                              <i className="bi bi-arrow-repeat me-2"></i>Volver a Firmar
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="mt-3">
                        <Button onClick={handleNuevaVenta} className="rounded-3 px-4"
                          style={{ backgroundColor: '#3483FA', borderColor: '#3483FA', fontWeight: '500', minWidth: '250px' }}>
                          <i className="bi bi-plus-circle me-2"></i>Nueva Venta
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
          </Container>
        );
      case 'mis-ventas':
        return <MisVentas />;
      default:
        return <DashboardVentas />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {mostrarNavbar && <NavBarVentas usuario={usuario} vistaActiva={vistaActiva} onCambiarVista={setVistaActiva} />}
      <div>{renderVista()}</div>

      <ModalFirmaContrato
        show={showFirma}
        onHide={() => setShowFirma(false)}
        venta={ventaCreada}
        onConfirmar={handleFirmarDocumentos}
      />
    </div>
  );
};