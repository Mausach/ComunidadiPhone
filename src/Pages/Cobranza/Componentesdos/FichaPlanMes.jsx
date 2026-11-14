// Cobranza-v2/Componentesdos/FichaPlanMes.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';

const formatFechaCorta = (f) => {
  if (!f) return '-';
  const d = new Date(f);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const mesLabel = (f) => !f ? '' : new Date(f).toLocaleDateString('es-AR', { month: 'long' });

export const FichaPlanMes = ({ venta, cuotaSeleccionadaId, onSelectCuota }) => {
  const cuotas = venta.cuotas || [];
  const pagadas = cuotas.filter(c => c.estado_cuota === 'pagada').length;

  return (
    <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '12px', backgroundColor: COLORS.cardBg }}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h6 className="fw-bold mb-0" style={{ color: COLORS.textoPrincipal }}>Plan mes a mes</h6>
          <small style={{ color: COLORS.textoSecundario }}>
            {venta.producto?.nombre} · {cuotas.length} cuotas · {pagadas} pagada{pagadas !== 1 && 's'}
          </small>
        </div>

        <div className="d-flex gap-2 overflow-auto pb-2">
          {cuotas.map((c) => {
            const pagada = c.estado_cuota === 'pagada';
            const enMora = !pagada && c.diasAtraso > 0;
            const pagoParcial = c.estado_cuota === 'pago parcial';
            const isSelected = cuotaSeleccionadaId === c._id;

            let bg = COLORS.cardBg;
            let border = COLORS.bordes;
            let colorTexto = COLORS.textoPrincipal;

            // Lógica de colores semánticos
            if (pagada) {
              bg = COLORS.verdeSuave;
              border = COLORS.verde;
              colorTexto = COLORS.verde;
            } else if (pagoParcial) {
              // 👈 NUEVO: Color Ámbar para pago parcial
              bg = COLORS.ambarSuave;
              border = COLORS.ambar;
              colorTexto = COLORS.ambar;
            } else if (enMora) {
              bg = COLORS.rojoSuave;
              border = COLORS.rojo;
              colorTexto = COLORS.rojo;
            }
            
            // Si está seleccionada, resaltamos el borde con el color de la acción
            if (isSelected) {
              border = COLORS.azul; 
            }

            return (
              <div
                key={c.numeroCuota}
                onClick={() => onSelectCuota && onSelectCuota(c)}
                className="flex-shrink-0 p-3 rounded-3"
                style={{
                  minWidth: 140,
                  backgroundColor: bg,
                  border: isSelected ? `2px solid ${border}` : `1px solid ${border}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 4px 8px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <small style={{ color: COLORS.textoSecundario }}>Cuota {c.numeroCuota}</small>
                <div className="fw-bold text-capitalize" style={{ color: colorTexto }}>
                  {mesLabel(c.fechaCobro)}
                </div>
                <small style={{ color: colorTexto }}>
                  {pagada
                    ? `Pagada ${formatFechaCorta(c.fechaCobrada)}`
                    : pagoParcial
                      ? `Parcial · ${formatFechaCorta(c.fechaCobro)}`
                      : enMora
                        ? `En mora · ${c.diasAtraso}d`
                        : `Vence ${formatFechaCorta(c.fechaCobro)}`}
                </small>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
};