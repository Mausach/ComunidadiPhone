// Cobranza-v2/Componentesdos/FichaAcciones.jsx
import React, { useState } from 'react';
import { Card, Button, Stack, Alert, ButtonGroup } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';

// Modales reutilizados de DetalleVenta
import { ModalCobro } from '../../Cobranza/Componentes/ModalCobro';
import { ModalEditarFechaCuota } from '../../Cobranza/Componentes/ModalEditarFechaCuota';
import { ModalEditarMontoCuota } from '../../Cobranza/Componentes/ModalEditarMontoCuota';
import { ModalCambiarEstadoCuota } from '../../Cobranza/Componentes/ModalCambiarEstadoCuota';
import { ModalAgregarNotaCuota } from '../../Cobranza/Componentes/ModalAgregarNotaCuota';
import { ModalAgregarRecargo } from '../../Cobranza/Componentes/ModalAgregarRecargo';
import { generarReciboPago } from '../../Cobranza/Helpers/GenerarComprobanteCuotaPdf';

export const FichaAcciones = ({ venta, cuota, usuario, onRefresh }) => {
  const [showCobro, setShowCobro] = useState(false);
  const [showEditarFecha, setShowEditarFecha] = useState(false);
  const [showEditarMonto, setShowEditarMonto] = useState(false);
  const [showCambiarEstado, setShowCambiarEstado] = useState(false);
  const [showAgregarNota, setShowAgregarNota] = useState(false);
  const [showRecargo, setShowRecargo] = useState(false);

  const isPagada = cuota?.estado_cuota === 'pagada';
  const disabled = !cuota || isPagada;

  const btnStyle = { borderRadius: '10px', fontWeight: 600, padding: '0.6rem', textAlign: 'left' };
  const btnOutlineStyle = { ...btnStyle, backgroundColor: COLORS.cardBg, color: COLORS.textoPrincipal, borderColor: COLORS.bordes };

  const handleSuccess = () => {
    setShowCobro(false);
    setShowEditarFecha(false);
    setShowEditarMonto(false);
    setShowCambiarEstado(false);
    setShowAgregarNota(false);
    setShowRecargo(false);
    if (onRefresh) onRefresh();
  };

  return (
    <>
      <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '12px', backgroundColor: COLORS.cardBg }}>
        <Card.Body className="p-4">
          <h6 className="fw-bold mb-3" style={{ color: COLORS.textoPrincipal }}>
            Acciones {cuota ? `· Cuota #${cuota.numeroCuota}` : ''}
          </h6>

          {isPagada && (
            <Alert variant="success" className="py-2 px-3 small mb-3 rounded-3" style={{ backgroundColor: COLORS.verdeSuave, color: COLORS.verde, border: 'none' }}>
              <i className="bi bi-check-circle-fill me-1"></i> Esta cuota ya está pagada.
            </Alert>
          )}

          <Stack gap={2}>
            {/* Gestión de Pago (solo si no está pagada) */}
            {!isPagada && (
              <Button
                disabled={disabled}
                onClick={() => setShowCobro(true)}
                style={{ ...btnStyle, backgroundColor: COLORS.azulOscuro, borderColor: COLORS.azulOscuro, color: '#fff' }}
              >
                <i className="bi bi-coin me-2"></i> Gestionar Pago
              </Button>
            )}

            {/* Gestión de Interés / Recargo (siempre disponible en el detalle original) */}
            <Button
              disabled={disabled}
              onClick={() => setShowRecargo(true)}
              style={{
                ...btnStyle,
                backgroundColor: COLORS.rojoSuave,
                borderColor: COLORS.rojoSuave,
                color: COLORS.rojo
              }}
            >
              <i className="bi bi-percent me-2"></i> Gestión de Interés
            </Button>

            {/* Acciones solo si NO está pagada (igual que DetalleVenta) */}
            {!isPagada && (
              <>
                <Button 
                  disabled={disabled}
                  onClick={() => setShowEditarFecha(true)}
                  variant="outline-secondary" 
                  style={btnOutlineStyle}
                >
                  <i className="bi bi-calendar me-2" style={{ color: COLORS.azul }}></i> Editar Fecha Cobro
                </Button>

                <Button 
                  disabled={disabled}
                  onClick={() => setShowCambiarEstado(true)}
                  variant="outline-secondary" 
                  style={btnOutlineStyle}
                >
                  <i className="bi bi-sliders me-2" style={{ color: COLORS.azul }}></i>Ajustar Estado de Cuota
                </Button>
              </>
            )}

            {/* Agregar Nota (siempre disponible) */}
            <Button 
              disabled={!cuota}
              onClick={() => setShowAgregarNota(true)}
              variant="outline-secondary" 
              style={btnOutlineStyle}
            >
              <i className="bi bi-sticky me-2" style={{ color: COLORS.azul }}></i> Agregar Nota
            </Button>

            {/* Recibo PDF (solo si está pagada) */}
            <Button
              disabled={!cuota || !isPagada}
              onClick={() => generarReciboPago(venta, cuota, cuota?.metodoPago)}
              variant="outline-secondary"
              style={{
                ...btnOutlineStyle,
                opacity: isPagada ? 1 : 0.5,
                cursor: isPagada ? 'pointer' : 'not-allowed'
              }}
              title={isPagada ? 'Descargar comprobante PDF' : 'Se habilitará cuando la cuota esté pagada'}
            >
              <i className="bi bi-file-pdf me-2" style={{ color: isPagada ? COLORS.rojo : COLORS.textoSecundario }}></i> 
              Descargar Recibo PDF
            </Button>
          </Stack>
        </Card.Body>
      </Card>

      {/* Modales */}
      <ModalCobro show={showCobro} onHide={() => setShowCobro(false)} venta={venta} cuotaSeleccionada={cuota} onSuccess={handleSuccess} usuario={usuario} />
      <ModalAgregarRecargo show={showRecargo} onHide={() => setShowRecargo(false)} venta={venta} cuota={cuota} onSuccess={handleSuccess} usuario={usuario} />
      <ModalEditarFechaCuota show={showEditarFecha} onHide={() => setShowEditarFecha(false)} venta={venta} cuota={cuota} onSuccess={handleSuccess} usuario={usuario} />
      <ModalEditarMontoCuota show={showEditarMonto} onHide={() => setShowEditarMonto(false)} venta={venta} cuota={cuota} onSuccess={handleSuccess} usuario={usuario} />
      <ModalCambiarEstadoCuota show={showCambiarEstado} onHide={() => setShowCambiarEstado(false)} venta={venta} cuota={cuota} onSuccess={handleSuccess} usuario={usuario} />
      <ModalAgregarNotaCuota show={showAgregarNota} onHide={() => setShowAgregarNota(false)} venta={venta} cuota={cuota} onSuccess={handleSuccess} usuario={usuario} />
    </>
  );
};