// Cobranza-v2/Componentesdos/FichaCobranza.jsx
import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';
//import { obtenerDetalleVenta } from '../../Cobranza/Helpers/DetalleVenta';
import { obtenerDetalleVenta } from '../Helpers/DetalleVenta';

import { FichaHeaderCliente } from './FichaHeaderCliente';
import { FichaPlanMes } from './FichaPlanMes';
import { FichaAcciones } from './FichaAcciones';
import { FichaHistorialGestiones } from './FichaHistorialGestiones';

import { FichaContactoGarantias } from './FichaContactoGarantias';

// Cobranza-v2/Componentesdos/FichaCobranza.jsx

export const FichaCobranza = ({ ventaId, mesActual, usuario, onVolver }) => {
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado local para saber qué cuota estamos gestionando en este momento
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await obtenerDetalleVenta(ventaId);
      
      if (res.success) {
        setVenta(res.venta);
        
        const cuotas = res.venta.cuotas || [];
        let cuotaPorDefecto = null;

        // 🧠 Lógica: Buscar la cuota que coincida con el mes que estamos viendo en el Panel V2
        if (mesActual) {
          const [anioStr, mesStr] = mesActual.split('-');
          const anio = parseInt(anioStr);
          const mes = parseInt(mesStr) - 1; // JS cuenta los meses de 0 a 11

          cuotaPorDefecto = cuotas.find(c => {
            // Validamos que la fecha exista antes de crear el Date
            if (!c.fechaCobro) return false; 
            const f = new Date(c.fechaCobro);
            return f.getMonth() === mes && f.getFullYear() === anio;
          });
        }

        // Fallback: Si no encuentra la del mes, agarra la primera no pagada, o la primera de todas
        if (!cuotaPorDefecto) {
          cuotaPorDefecto = cuotas.find(c => c.estado_cuota !== 'pagada') || cuotas[0] || null;
        }
        
        setCuotaSeleccionada(cuotaPorDefecto);

      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar la ficha');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (ventaId) cargar(); 
  }, [ventaId, mesActual]); // Recargamos si cambia la venta o el mes

  // --- Renders de estado ---

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bgGeneral }} className="d-flex align-items-center justify-content-center">
      <Spinner animation="border" style={{ color: COLORS.azul }} />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bgGeneral }} className="py-5">
      <Container>
        <Alert variant="danger" className="rounded-3 shadow-sm border-0">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
        <Button variant="secondary" onClick={onVolver} className="rounded-3">
          <i className="bi bi-arrow-left me-1"></i> Volver
        </Button>
      </Container>
    </div>
  );

  if (!venta) return null;

  // --- Render Principal ---

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bgGeneral }}>
      <Container fluid className="py-4" style={{ maxWidth: '1400px' }}>
        
        {/* Botón Volver */}
        <Button 
          variant="link" 
          className="mb-3 px-0 text-decoration-none fw-semibold" 
          style={{ color: COLORS.azulOscuro }} 
          onClick={onVolver}
        >
          <i className="bi bi-chevron-left me-1"></i> Volver a cobranza
        </Button>

        {/* Header con datos del cliente y monto a regularizar */}
        <FichaHeaderCliente venta={venta} cuotaEnMora={cuotaSeleccionada} />

        <div className="row g-3 mt-2">
          
          {/* Columna Izquierda: Plan y Historial */}
          <div className="col-lg-8">
            <FichaPlanMes 
              venta={venta} 
              cuotaSeleccionadaId={cuotaSeleccionada?._id} 
              onSelectCuota={setCuotaSeleccionada} 
            />
            
            <FichaHistorialGestiones 
              venta={venta} 
              cuotaSeleccionadaId={cuotaSeleccionada?._id} 
              onRefresh={cargar} 
              usuario={usuario} 
            />
          </div>

          {/* Columna Derecha: Acciones y Garantías */}
          <div className="col-lg-4">
            <FichaAcciones 
              venta={venta} 
              cuota={cuotaSeleccionada} 
              usuario={usuario} 
              onRefresh={cargar} 
            />
            
            <FichaContactoGarantias venta={venta} />
          </div>

        </div>
      </Container>
    </div>
  );
};