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

export const Cobranza = () => {
  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

  // ==========================================
  // ESTADOS
  // ==========================================
  const [loading, setLoading] = useState(false);
  const [ventas, setVentas] = useState([]);
  const [paginacion, setPaginacion] = useState({
    total: 0,
    pagina: 1,
    limite: 10,
    paginas: 0
  });
  const [filtros, setFiltros] = useState({});
  const [error, setError] = useState(null);

  // Estados para modales
  const [showDetalle, setShowDetalle] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [showCobro, setShowCobro] = useState(false);

  // ==========================================
  // CARGAR VENTAS
  // ==========================================
  const cargarVentas = async (filtrosAplicados = {}, pagina = 1, limite = 10) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...filtrosAplicados,
        pagina,
        limite
      };

      const result = await listarVentas(params);

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

  // ==========================================
  // EFECTO INICIAL
  // ==========================================
  useEffect(() => {
    cargarVentas();
  }, []);

  // ==========================================
  // MANEJADORES
  // ==========================================

  const handleBuscar = (filtrosAplicados) => {
    cargarVentas(filtrosAplicados, 1, paginacion.limite);
  };

  const handleCambiarPagina = (pagina, limite) => {
    cargarVentas(filtros, pagina, limite || paginacion.limite);
  };

  const handleVerDetalle = (ventaId) => {
    const venta = ventas.find(v => v._id === ventaId);
    if (venta) {
      setVentaSeleccionada(venta);
      setShowDetalle(true);
    }
  };

  const handleCobrar = (venta, cuota = null) => {
    setVentaSeleccionada(venta);
    setCuotaSeleccionada(cuota);
    setShowCobro(true);
  };

  const handleCobroExitoso = () => {
    // Recargar la lista de ventas después de un cobro exitoso
    cargarVentas(filtros, paginacion.pagina, paginacion.limite);
    // También cerrar el detalle si estaba abierto
    setShowDetalle(false);
  };

  const handleReintentar = () => {
    cargarVentas(filtros, paginacion.pagina, paginacion.limite);
  };

  // ==========================================
  // RENDERIZADO
  // ==========================================

  return (
    <div>
      <NavBarCobranza usuario={usuario} />

      <Container fluid className="py-4">
        <Row className="justify-content-center">
          <Col lg={12} xl={10}>
            {/* Título */}
            <div className="mb-4">
              <h2 className="fw-bold mb-1" style={{ color: '#1a1a1a' }}>
                <i className="bi bi-coin me-2" style={{ color: '#3483FA' }}></i>
                Gestión de Cobranza
              </h2>
              <p className="text-muted small">
                Administrá los cobros de cuotas y seguimiento de ventas
              </p>
            </div>

            {/* Buscador */}
            <BuscadorCobranza
              onBuscar={handleBuscar}
              loading={loading}
              filtrosIniciales={filtros}
            />

            {/* Lista de Ventas */}
            <ListaVentas
              ventas={ventas}
              loading={loading}
              error={error}
              paginacion={paginacion}
              onCambiarPagina={handleCambiarPagina}
              onVerDetalle={handleVerDetalle}
              onReintentar={handleReintentar}
            />
          </Col>
        </Row>
      </Container>

      {/* ==========================================
          MODALES
          ========================================== */}

      {/* Modal de Detalle de Venta */}
      <DetalleVenta
        show={showDetalle}
        onHide={() => {
          setShowDetalle(false);
          setVentaSeleccionada(null);
        }}
        ventaId={ventaSeleccionada?._id}
        onCobrar={handleCobrar}
        onRefresh={() => cargarVentas(filtros, paginacion.pagina, paginacion.limite)}
        usuario={usuario}
      />

      {/* Modal de Cobro */}
      <ModalCobro
        show={showCobro}
        onHide={() => {
          setShowCobro(false);
          setVentaSeleccionada(null);
          setCuotaSeleccionada(null);
        }}
        venta={ventaSeleccionada}
        cuotaSeleccionada={cuotaSeleccionada}
        onSuccess={handleCobroExitoso}
        usuario={usuario}
      />

      {/* Estilos globales */}
      <style>{`
        .bi {
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};
