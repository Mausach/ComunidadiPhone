// Cobranza-v2/Componentesdos/FichaHeaderCliente.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';

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

const formatMonto = (m) => `$${Number(m || 0).toLocaleString('es-AR')}`;

export const FichaHeaderCliente = ({ venta, cuotaEnMora }) => {
  const cliente = venta.cliente || {};
  const iniciales = `${cliente.nombre?.[0] || ''}${cliente.apellido?.[0] || ''}`.toUpperCase();

  const totalRecargos = cuotaEnMora?.recargos?.reduce((s, r) => s + r.monto, 0) || 0;
  const saldoCuota = (cuotaEnMora?.montoCuota || 0) + totalRecargos - (cuotaEnMora?.montoPagado || 0);

  const diasAtraso = cuotaEnMora?.diasAtraso || 0;

  return (
    <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', backgroundColor: COLORS.cardBg }}>
      <Card.Body className="p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
            style={{
              width: 56, height: 56,
              backgroundColor: COLORS.azulSuave,
              color: COLORS.azul,
              fontSize: '1.1rem'
            }}
          >
            {iniciales}
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <h5 className="fw-bold mb-0" style={{ color: COLORS.textoPrincipal }}>
                {cliente.nombre} {cliente.apellido}
              </h5>
              {diasAtraso > 0 && (
                <Pill bg={COLORS.rojoSuave} color={COLORS.rojo} icon="exclamation-triangle">
                  En mora · {diasAtraso} {diasAtraso === 1 ? 'día' : 'días'}
                </Pill>
              )}
              <Pill bg={COLORS.ambarSuave} color={COLORS.ambar} icon="shield-exclamation">
                Riesgo medio
              </Pill>
            </div>
            <small style={{ color: COLORS.textoSecundario }}>
              DNI {cliente.dni || '-'} · Contrato {venta._id?.slice(-8).toUpperCase() || '-'} · {cliente.localidad || '-'} · Vendió: {venta.vendedor || '-'}
            </small>
          </div>
        </div>

        {cuotaEnMora && (
          <div className="text-end">
            <small style={{ color: COLORS.textoSecundario }}>Para regularizar hoy</small>
            <h3 className="fw-bold mb-0" style={{ color: COLORS.rojo }}>{formatMonto(saldoCuota)}</h3>
            <small style={{ color: COLORS.textoSecundario }}>
              Cuota {formatMonto(cuotaEnMora.montoCuota)}
              {totalRecargos > 0 && ` + recargo ${formatMonto(totalRecargos)}`}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};