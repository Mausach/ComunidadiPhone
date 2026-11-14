// Cobranza-v2/Componentes/ProgresoMes.jsx
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';

const HITOS = [
  { dia: 1, titulo: 'Día 1', descripcion: 'Proyección enviada' },
  { dia: 10, titulo: 'Día 10', descripcion: 'Vencimiento y corte' },
  { dia: 11, titulo: 'Día 11', descripcion: 'Empieza la mora' },
  { dia: 16, titulo: 'Día 16', descripcion: 'Bloqueo CelluLock' },
  { dia: 20, titulo: 'Día 20', descripcion: 'Reporte de avance' },
  { dia: 30, titulo: 'Día 30', descripcion: 'Cierre del mes' }
];

export const ProgresoMes = ({ mesActual }) => {
  const hoy = new Date();
  const [anio, mes] = mesActual.split('-').map(Number);
  
  // Verificar si el mes actual es el mes de hoy
  const esMesActual = hoy.getFullYear() === anio && hoy.getMonth() + 1 === mes;
  const diaHoy = esMesActual ? hoy.getDate() : (mes < hoy.getMonth() + 1 || anio < hoy.getFullYear() ? 31 : 1);

  // Calcular progreso basado en el día de hoy
  const hitosCompletados = HITOS.filter(h => diaHoy >= h.dia).length;
  const progresoTotal = Math.round((hitosCompletados / HITOS.length) * 100);

  // Próximo hito
  const proximoHito = HITOS.find(h => diaHoy < h.dia);

  return (
    <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
      <Card.Body className="p-4">
        {/* Header con info del día */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal }}>
              {esMesActual 
                ? `Hoy, ${new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })}: día ${diaHoy} de mora para quien no pagó el 10`
                : `Progreso del mes ${mes}/${anio}`
              }
            </h6>
          </div>
          <div className="text-end">
            <small style={{ color: COLORS.textoSecundario }}>
              {proximoHito ? `Próximo hito: ${proximoHito.descripcion} (día ${proximoHito.dia})` : 'Mes finalizado'}
            </small>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-3" style={{ 
          height: '8px', 
          backgroundColor: COLORS.bordes, 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            height: '100%', 
            width: `${progresoTotal}%`, 
            backgroundColor: COLORS.azulOscuro,
            transition: 'width 0.5s ease'
          }}></div>
        </div>

        {/* Hitos */}
        <Row className="g-0">
          {HITOS.map((hito, idx) => {
            const completado = diaHoy >= hito.dia;
            return (
              <Col key={idx} xs={4} md={2} className="text-start">
                <div className="d-flex align-items-center gap-1 mb-1">
                  <span style={{ 
                    color: completado ? COLORS.verde : COLORS.textoSecundario,
                    fontWeight: '600',
                    fontSize: '0.85rem'
                  }}>
                    {hito.titulo}
                  </span>
                  {completado && (
                    <i className="bi bi-check-circle-fill" style={{ color: COLORS.verde, fontSize: '0.8rem' }}></i>
                  )}
                </div>
                <small style={{ 
                  color: completado ? COLORS.textoPrincipal : COLORS.textoSecundario,
                  fontSize: '0.75rem'
                }}>
                  {hito.descripcion}
                </small>
              </Col>
            );
          })}
        </Row>
      </Card.Body>
    </Card>
  );
};