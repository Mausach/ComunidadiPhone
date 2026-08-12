import { NavBarCobranza } from './Componentes/NavBrCobranza'
// Cobranza/index.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import { BuscadorCobranza } from './Componentes/BuscadorCobranza';
import { ListaVentas } from './Componentes/ListaVentas';
import { DetalleVenta } from './Componentes/DetalleVenta';
import { ModalCobro } from './Componentes/ModalCobro';
import { listarVentas } from './Helpers/ListarVentas';

// Cobranza/index.jsx


export const Cobranza = ({ mostrarNavbar = true }) => {
  const location = useLocation();
  const usuario = location.state; // ← Se mantiene como estaba

  // ==========================================
  // ESTADOS DE NAVEGACIÓN
  // ==========================================
  const [vistaActiva, setVistaActiva] = useState('panel');

  // ==========================================
  // ESTADOS DE VENTAS
  // ==========================================
  const [loading, setLoading] = useState(false);
  const [ventas, setVentas] = useState([]);
  const [paginacion, setPaginacion] = useState({ total: 0, pagina: 1, limite: 10, paginas: 0 });
  const [filtros, setFiltros] = useState({});
  const [error, setError] = useState(null);

  const [showDetalle, setShowDetalle] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [showCobro, setShowCobro] = useState(false);

  const cargarVentas = async (filtrosAplicados = {}, pagina = 1, limite = 10) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listarVentas({ ...filtrosAplicados, pagina, limite });
      if (result.success) {
        setVentas(result.ventas || []);
        setPaginacion(result.paginacion || {});
        setFiltros(filtrosAplicados);
      }
    } catch (error) {
      setError(error.message || 'Error al cargar las ventas');
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarVentas(); }, []);

  const handleBuscar = (filtrosAplicados) => cargarVentas(filtrosAplicados, 1, paginacion.limite);
  const handleCambiarPagina = (pagina, limite) => cargarVentas(filtros, pagina, limite || paginacion.limite);
  const handleVerDetalle = (ventaId) => {
    const venta = ventas.find(v => v._id === ventaId);
    if (venta) { setVentaSeleccionada(venta); setShowDetalle(true); }
  };
  const handleCobrar = (venta, cuota = null) => { setVentaSeleccionada(venta); setCuotaSeleccionada(cuota); setShowCobro(true); };
  const handleCobroExitoso = () => { cargarVentas(filtros, paginacion.pagina, paginacion.limite); setShowDetalle(false); };
  const handleReintentar = () => cargarVentas(filtros, paginacion.pagina, paginacion.limite);

  // Datos del usuario para el NavBar (extrae del state o localStorage)
  const userData = usuario?.user || JSON.parse(localStorage.getItem('user') || '{}');

  // Placeholder
  const CobranzasHoy = () => (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col lg={12} xl={10}>
          <div className="mb-4">
            <h2 className="fw-bold mb-1" style={{ color: '#1a1a1a' }}>
              <i className="bi bi-calendar-check me-2" style={{ color: '#dc3545' }}></i>Cobranzas de Hoy
            </h2>
            <p className="text-muted small">Cuotas que vencen hoy y están pendientes de cobro</p>
          </div>
          <div className="text-center py-5">
            <i className="bi bi-calendar-check" style={{ fontSize: '3rem', color: '#ccc' }}></i>
            <p className="text-muted mt-3">Componente de cobranzas del día en desarrollo</p>
          </div>
        </Col>
      </Row>
    </Container>
  );

  const renderVista = () => {
    switch (vistaActiva) {
      case 'panel':
        return (
          <Container fluid className="py-4">
            <Row className="justify-content-center">
              <Col lg={12} xl={10}>
                <div className="mb-4">
                  <h2 className="fw-bold mb-1" style={{ color: '#1a1a1a' }}>
                    <i className="bi bi-coin me-2" style={{ color: '#3483FA' }}></i>Gestión de Cobranza
                  </h2>
                  <p className="text-muted small">Administrá los cobros de cuotas y seguimiento de ventas</p>
                </div>
                <BuscadorCobranza onBuscar={handleBuscar} loading={loading} filtrosIniciales={filtros} />
                <ListaVentas ventas={ventas} loading={loading} error={error} paginacion={paginacion}
                  onCambiarPagina={handleCambiarPagina} onVerDetalle={handleVerDetalle} onReintentar={handleReintentar} />
              </Col>
            </Row>
          </Container>
        );
      case 'cobranzas-hoy':
        return <CobranzasHoy />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {mostrarNavbar && <NavBarCobranza usuario={userData} vistaActiva={vistaActiva} onCambiarVista={setVistaActiva} />}
      {renderVista()}

      <DetalleVenta show={showDetalle} onHide={() => { setShowDetalle(false); setVentaSeleccionada(null); }}
        ventaId={ventaSeleccionada?._id} onCobrar={handleCobrar}
        onRefresh={() => cargarVentas(filtros, paginacion.pagina, paginacion.limite)} usuario={usuario} />

      <ModalCobro show={showCobro} onHide={() => { setShowCobro(false); setVentaSeleccionada(null); setCuotaSeleccionada(null); }}
        venta={ventaSeleccionada} cuotaSeleccionada={cuotaSeleccionada} onSuccess={handleCobroExitoso} usuario={usuario} />

      <style>{`.bi { font-size: 1.1rem; }`}</style>
    </div>
  );
};
