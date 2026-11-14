// Cobranza-v2/Componentesdos/FichaHistorialGestiones.jsx
import React, { useState, useMemo } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';

// Componente Pill
const Pill = ({ children, bg, color, border, icon, style = {} }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '0.35em 0.7em',
    fontSize: '0.7rem', fontWeight: '600', borderRadius: '20px',
    backgroundColor: bg, color: color,
    border: border ? `1px solid ${border}` : 'none',
    whiteSpace: 'nowrap', ...style
  }}>
    {icon && <i className={`bi bi-${icon} me-1`}></i>}
    {children}
  </span>
);

const formatFechaHora = (f) => {
  if (!f) return '-';
  const d = new Date(f);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) + 
         ' · ' + 
         d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

export const FichaHistorialGestiones = ({ venta, onRefresh }) => {
  const [nota, setNota] = useState('');

  const historialUnificado = useMemo(() => {
    if (!venta) return [];
    
    const notasVenta = (venta.notas || []).map(n => ({
      ...n,
      origen: 'Venta',
      colorPunto: COLORS.azul
    }));

    const notasCuotas = (venta.cuotas || []).flatMap(c => 
      (c.notas || []).map(n => ({
        ...n,
        origen: `Cuota #${c.numeroCuota}`,
        colorPunto: COLORS.ambar
      }))
    );

    const todas = [...notasVenta, ...notasCuotas];

    return todas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [venta]);

  const handleGuardar = () => {
    console.log('Nueva nota:', nota);
    setNota('');
    if (onRefresh) onRefresh();
  };

  return (
    <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', backgroundColor: COLORS.cardBg }}>
      <Card.Body className="p-4">
        <h6 className="fw-bold mb-4" style={{ color: COLORS.textoPrincipal }}>
          Historial de gestiones
        </h6>

        <div className="mb-4 position-relative">
          {historialUnificado.length === 0 ? (
            <small style={{ color: COLORS.textoSecundario }}>Sin gestiones registradas</small>
          ) : (
            historialUnificado.map((item, index) => (
              <div key={index} className="d-flex gap-3 mb-3 position-relative">
                
                <div className="d-flex flex-column align-items-center" style={{ width: '12px' }}>
                  <div 
                    style={{ 
                      width: 10, height: 10, 
                      borderRadius: '50%', 
                      backgroundColor: item.colorPunto, 
                      marginTop: 5,
                      zIndex: 1 
                    }} 
                  />
                  {index !== historialUnificado.length - 1 && (
                    <div 
                      style={{ 
                        width: '2px', 
                        flexGrow: 1, 
                        backgroundColor: COLORS.bordes,
                        marginTop: '2px',
                        marginBottom: '-10px'
                      }} 
                    />
                  )}
                </div>

                <div style={{ flexGrow: 1 }}>
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <small className="fw-semibold" style={{ color: COLORS.textoPrincipal }}>
                      {formatFechaHora(item.fecha)}
                    </small>
                    <Pill 
                      bg={item.origen === 'Venta' ? COLORS.azulSuave : COLORS.ambarSuave} 
                      color={item.origen === 'Venta' ? COLORS.azul : COLORS.ambar}
                    >
                      {item.origen}
                    </Pill>
                    <small style={{ color: COLORS.textoSecundario }}>
                      por {item.usuario?.nombre || 'Sistema'}
                    </small>
                  </div>
                  <div className="small" style={{ color: COLORS.textoSecundario, lineHeight: 1.4, wordBreak: 'break-word' }}>
                    {item.texto}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        <Form.Control
          as="textarea"
          rows={2}
          placeholder="Qué se habló, qué prometió, próximo paso"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          style={{ borderRadius: '10px', borderColor: COLORS.bordes }}
        />
        <div className="d-flex justify-content-end mt-2">
          <Button
            size="sm"
            disabled={!nota.trim()}
            onClick={handleGuardar}
            style={{ 
              backgroundColor: COLORS.azulOscuro, 
              borderColor: COLORS.azulOscuro, 
              borderRadius: '8px',
              color: '#fff'
            }}
          >
            Guardar nota
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};