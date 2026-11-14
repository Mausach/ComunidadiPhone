
// Cobranza-v2/CobranzaV2.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Alert, Button, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

// Helpers
import { COLORS } from './Helperss/colors';
// Componentes
import { PanelMes } from './Componentesdos/PanelMes';
import { TarjetasResumen } from './Componentesdos/TarjetasResumen';
import { TabsEstado } from './Componentesdos/TabsEstado';
import { TablaCobranza } from './Componentesdos/TablaCobranza';
import { BuscadorCobranzaV2 } from './Componentesdos/BuscadorCobranzaV2';
import { ProgresoMes } from './Componentesdos/ProgresoMes';
import { PanelPagosDestiempo } from './Componentesdos/PanelArrastre';
import { ModalPagosDestiempo } from './Componentesdos/ModalCobrosRecibidos';
//import { FichaCobranza } from './Componentes/FichaCobranza'; // Lo crearemos después

// Helpers
import { obtenerPanelCobranza } from './Helperss/obtenerPanelCobranza';
import { FichaCobranza } from './Componentesdos/FichaCobranza';

export const CobranzaV2 = () => {
  const location = useLocation();
  const usuario = location.state?.user || location.state || JSON.parse(localStorage.getItem('user') || '{}');

  const [mesActual, setMesActual] = useState(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [tabActivo, setTabActivo] = useState('en_mora');
  
  // 👇 Agregamos tipoVenta al estado inicial de filtros
  const [filtros, setFiltros] = useState({ nombre: '', localidad: '', tipoVenta: '' });
  
  const [data, setData] = useState({
    resumen: { aCobrar: 0, cobrado: 0, vencido: 0, efectividad: 0 },
    ventas: [],
    contadoresTabs: { porVencer: 0, cobradas: 0, enMora: 0, legal: 0 },
    pagosDestiempo: { resumen: { cantidadCuotas: 0, montoTotal: 0 }, detalle: [] },
    paginacion: {}
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [showPagosDestiempo, setShowPagosDestiempo] = useState(false);

  // Carga de datos
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await obtenerPanelCobranza({
          mes: mesActual,
          nombre: filtros.nombre,
          localidad: filtros.localidad,
          tipoVenta: filtros.tipoVenta, // 👈 Pasamos el filtro al helper
          limite: 100
        });
        
        setData({
          resumen: res.resumen,
          ventas: res.ventas,
          contadoresTabs: res.contadoresTabs,
          pagosDestiempo: res.pagosDestiempo,
          paginacion: res.paginacion
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [mesActual, filtros]);

  // Filtrado de ventas por Tab (en el frontend)
  const ventasFiltradas = useMemo(() => {
    return data.ventas.filter(v => {
      const pc = v.proximaCuota;
      
      // Si no hay próxima cuota (ej. ya está todo pago), evaluamos por el resumen
      const todasPagadas = v.cuotas?.pagadas === v.cuotas?.total;

      if (tabActivo === 'legal') return v.conducta_pago === 'cobro judicial';
      if (tabActivo === 'en_mora') return !todasPagadas && pc?.diasAtraso > 0 && v.conducta_pago !== 'cobro judicial';
      if (tabActivo === 'cobradas') return todasPagadas;
      if (tabActivo === 'por_vencer') return !todasPagadas && pc?.diasRestantes >= 0 && v.conducta_pago !== 'cobro judicial';
      
      return true;
    });
  }, [data.ventas, tabActivo]);

  const handleGestionar = (venta) => {
    setVentaSeleccionada(venta);
  };

  // Render Ficha (Placeholder hasta que la construyamos)
  if (ventaSeleccionada) {
    return (
   <FichaCobranza
      ventaId={ventaSeleccionada._id}
      mesActual={mesActual} // 👈 Le pasamos el mes que está viendo el usuario (ej: '2024-12')
      usuario={usuario}
      onVolver={() => setVentaSeleccionada(null)}
    />
  );
  }

  // Render Panel General
  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bgGeneral }}>
      
      
      <Container fluid className="py-4" style={{ maxWidth: '1400px' }}>
        
        {/* Header con Mes y Barra de Progreso */}
        <PanelMes mesActual={mesActual} onChangeMes={setMesActual} />
        <ProgresoMes mesActual={mesActual} />

        {error && <Alert variant="danger">{error}</Alert>}

        {/* 4 Tarjetas de Resumen */}
        <TarjetasResumen resumen={data.resumen} />

        {/* DISEÑO DE 2 COLUMNAS */}
        <Row className="g-4">
          
          {/* Columna Izquierda: Tabla Principal */}
          <Col xl={9} lg={8}>
            
            {/* 👇 TÍTULO ACLARATORIO DE LA TABLA */}
            <div className="mb-3">
              <h5 className="fw-bold mb-0" style={{ color: COLORS.textoPrincipal }}>
                Cobranza: Sistemas 1, 2 y Canje + Cuotas
              </h5>
              <small style={{ color: COLORS.textoSecundario }}>
                Gestión de cuotas del mes
              </small>
            </div>

            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
              <Card.Header className="bg-white border-bottom-0 pt-3 px-4 pb-0">
                <TabsEstado 
                  tabActivo={tabActivo} 
                  onChangeTab={setTabActivo} 
                  contadores={data.contadoresTabs} 
                />
              </Card.Header>
              <Card.Body className="p-4">
                <BuscadorCobranzaV2 
                  filtros={filtros} 
                  onChangeFiltro={(k, v) => setFiltros(prev => ({ ...prev, [k]: v }))} 
                />
                <TablaCobranza 
                  ventas={ventasFiltradas} 
                  loading={loading} 
                  onGestionar={handleGestionar}
                  tabActivo={tabActivo} 
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Columna Derecha: Panel de Pagos a Destiempo */}
          <Col xl={3} lg={4}>
            <PanelPagosDestiempo 
              data={data.pagosDestiempo} 
              loading={loading} 
              onVerDetalle={() => setShowPagosDestiempo(true)} 
            />
          </Col>
        </Row>

      </Container>

      {/* Modal de Pagos a Destiempo */}
      <ModalPagosDestiempo 
        show={showPagosDestiempo} 
        onHide={() => setShowPagosDestiempo(false)} 
        detalle={data.pagosDestiempo?.detalle || []}
        montoTotal={data.pagosDestiempo?.resumen?.montoTotal || 0}
      />
    </div>
  );
};