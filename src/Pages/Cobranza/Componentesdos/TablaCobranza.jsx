// Cobranza-v2/Componentes/TablaCobranza.jsx
import React from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
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

const formatMoneda = (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v || 0);
const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) : '-';

export const TablaCobranza = ({ ventas, loading, onGestionar, tabActivo }) => {
  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" style={{ color: COLORS.azul }} />
    </div>
  );

  if (!ventas || ventas.length === 0) {
    return (
      <div className="text-center py-5" style={{ color: COLORS.textoSecundario }}>
        <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
        <p className="mt-3 mb-0">No hay ventas para este filtro en este mes.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive bg-white rounded-3 shadow-sm" style={{ border: `1px solid ${COLORS.bordes}` }}>
      <Table hover className="mb-0 align-middle" style={{ fontSize: '0.85rem' }}>
        <thead style={{ backgroundColor: COLORS.bgGeneral }}>
          <tr>
            {['Cliente', 'Cuota', 'Días', 'Monto', 'Recargo', 'Pago / Saldo', 'Etapa', 'Últ. Contacto', 'Acción'].map(h => (
              <th key={h} style={{ color: COLORS.textoSecundario, fontWeight: '600', padding: '12px', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => {
            const pc = venta.proximaCuota;
            const esCobrada = tabActivo === 'cobradas' || venta.cuotas?.pagadas === venta.cuotas?.total;

            // 👇 SI NO HAY PRÓXIMA CUOTA (YA ESTÁ TODO PAGADO)
            if (!pc) {
              const uc = venta.cuotaCobrada; 
              
              return (
                <tr key={venta._id} style={{ borderBottom: `1px solid ${COLORS.bordes}`, backgroundColor: '#F8FFFA' }}>
                  <td style={{ padding: '12px' }}>
                    <div className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
                      {venta.cliente?.apellido}, {venta.cliente?.nombre}
                    </div>
                    <small style={{ color: COLORS.textoSecundario }}>
                      {venta.producto?.nombre} · {venta.localidad}
                    </small>
                  </td>
                  <td style={{ color: COLORS.textoPrincipal }}>
                    <Pill bg={COLORS.bgGeneral} color={COLORS.textoSecundario} border={COLORS.bordes}>
                      {uc ? `${uc.numeroCuota} de ${venta.cuotas?.total || 0}` : `${venta.cuotas?.total || 0} de ${venta.cuotas?.total || 0}`}
                    </Pill>
                  </td>
                  <td>
                    <Pill bg={COLORS.verdeSuave} color={COLORS.verde}>Pagada</Pill>
                  </td>
                  <td style={{ color: COLORS.textoPrincipal }}>
                    {uc ? formatMoneda(uc.montoCuota) : '-'}
                  </td>
                  <td>
                    {uc && uc.recargos > 0 ? (
                      <span style={{ color: COLORS.rojo, fontWeight: '600' }}>+{formatMoneda(uc.recargos)}</span>
                    ) : (
                      <span style={{ color: COLORS.textoSecundario }}>-</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 'bold', color: COLORS.verde }}>
                    {uc ? formatMoneda(uc.montoPagado) : 'Al día'}
                  </td>
                  <td>
                    <Pill bg={COLORS.verdeSuave} color={COLORS.verde} icon="check-circle">Cobrada</Pill>
                  </td>
                  <td style={{ color: COLORS.textoSecundario, fontSize: '0.8rem' }}>
                    {venta.ultimoContacto ? (
                      <div title={venta.ultimoContacto.texto}>
                        {formatFecha(venta.ultimoContacto.fecha)} · {venta.ultimoContacto.texto.substring(0, 20)}...
                      </div>
                    ) : '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Button 
                      size="sm" 
                      className="rounded-3 px-3"
                      onClick={() => onGestionar(venta)}
                      style={{ backgroundColor: COLORS.azulOscuro, borderColor: COLORS.azulOscuro, color: '#fff', fontWeight: '500' }}
                    >
                      Gestionar
                    </Button>
                  </td>
                </tr>
              );
            }

            // SI HAY PRÓXIMA CUOTA
            let etapa = { label: 'Pendiente', color: COLORS.azul, bg: COLORS.azulSuave, icon: 'clock' };
            if (venta.conducta_pago === 'cobro judicial') {
              etapa = { label: 'Legal', color: COLORS.textoPrincipal, bg: COLORS.bordes, icon: 'shield-exclamation' };
            } else if (pc.diasAtraso > 0 && !esCobrada) {
              etapa = { label: 'En mora', color: COLORS.ambar, bg: COLORS.ambarSuave, icon: 'exclamation-triangle' };
            } else if (esCobrada) {
              etapa = { label: 'Cobrada', color: COLORS.verde, bg: COLORS.verdeSuave, icon: 'check-circle' };
            }

            return (
              <tr key={venta._id} style={{ borderBottom: `1px solid ${COLORS.bordes}` }}>
                <td style={{ padding: '12px' }}>
                  <div className="fw-bold" style={{ color: COLORS.textoPrincipal }}>
                    {venta.cliente?.apellido}, {venta.cliente?.nombre}
                  </div>
                  <small style={{ color: COLORS.textoSecundario }}>
                    {venta.producto?.nombre} · {venta.localidad}
                  </small>
                </td>
                <td style={{ color: COLORS.textoPrincipal }}>
                  <Pill bg={COLORS.bgGeneral} color={COLORS.textoSecundario} border={COLORS.bordes}>
                    {pc.numeroCuota} de {venta.cuotas?.total || 0}
                  </Pill>
                </td>
                <td>
                  <span style={{ 
                    color: (pc.diasAtraso > 0 && !esCobrada) ? COLORS.rojo : COLORS.textoSecundario, 
                    fontWeight: (pc.diasAtraso > 0 && !esCobrada) ? '600' : '400' 
                  }}>
                    {esCobrada ? '-' : (pc.diasAtraso > 0 ? `${pc.diasAtraso} días` : 'Al día')}
                  </span>
                </td>
                <td style={{ color: COLORS.textoPrincipal }}>
                  {formatMoneda(pc.montoCuota)}
                </td>
                <td>
                  {pc.recargos > 0 ? (
                    <span style={{ color: COLORS.rojo, fontWeight: '600' }}>+{formatMoneda(pc.recargos)}</span>
                  ) : (
                    <span style={{ color: COLORS.textoSecundario }}>-</span>
                  )}
                </td>
                <td style={{ fontWeight: 'bold', color: esCobrada ? COLORS.verde : COLORS.rojo }}>
                  {formatMoneda(esCobrada ? pc.montoPagado : pc.saldoPendiente)}
                </td>
                <td>
                  <Pill bg={etapa.bg} color={etapa.color} icon={etapa.icon}>{etapa.label}</Pill>
                </td>
                <td style={{ color: COLORS.textoSecundario, fontSize: '0.8rem' }}>
                  {venta.ultimoContacto ? (
                    <div title={venta.ultimoContacto.texto}>
                      {formatFecha(venta.ultimoContacto.fecha)} · {venta.ultimoContacto.texto.substring(0, 20)}...
                    </div>
                  ) : '-'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <Button 
                    size="sm" 
                    className="rounded-3 px-3"
                    onClick={() => onGestionar(venta)}
                    style={{ backgroundColor: COLORS.azulOscuro, borderColor: COLORS.azulOscuro, color: '#fff', fontWeight: '500' }}
                  >
                    Gestionar
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};