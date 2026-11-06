import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { ModalFirmaContrato } from '../../Ventas/Componentes/ModalFirma';

//import { obtenerDatosContratoCredito } from '../Helpers/DatosDocumentos';
import { obtenerDatosContratoCredito, obtenerDatosSolicitudFinanciacion } from '../Helpers/DatosDocumentos';

// Importamos las funciones de renderizado de PDF existentes
import { generarContratoCredito } from '../../Ventas/Helpers/Contratos/Contratocreditopersonal';
import { generarReciboCredito } from '../../Ventas/Helpers/Comprovanteventa/Recivocredito';
//import { generarSolicitudAdhesion } from '../../Ventas/Helpers/Formadecion/certificadoadhecion';

import { generarSolicitudFinanciacion } from '../../Ventas/Helpers/Formadecion/certificadoadhecion';
import { generarCertificadoGarantia } from '../../Ventas/Helpers/Garantia/Certificadogarantiaventa';

// 👇 IMPORTS FALTANTES (por si acaso)
import { generarContratoVentaDirecta } from '../../Ventas/Helpers/Contratos/ContraroDirecta';
import { generarReciboPago } from '../../Ventas/Helpers/Comprovanteventa/Reciboventa';
import { generarComprobantePlanCanje } from '../../Ventas/Helpers/Contratos/Comprobantecanjes';

export const ModalGenerarDocumentos = ({ show, onHide, venta, usuario }) => {
  const [firmas, setFirmas] = useState(null);
  const [showFirma, setShowFirma] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });

  useEffect(() => {
    if (show) {
      setFirmas(null);
      setLoadingDoc(null);
    }
  }, [show]);

  const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  const handleConfirmarFirmas = (firmasCapturadas) => {
    setFirmas(firmasCapturadas);
    setShowFirma(false);
    showAlert('Firmas capturadas correctamente.', 'success');
  };

  // ==========================================
  // DEFINICIÓN DE DOCUMENTOS SEGÚN TIPO DE VENTA
  // ==========================================
  const obtenerDocumentosDisponibles = () => {
    if (!venta) return [];
    const tipo = venta.tipoVenta;

    if (tipo === 'contado') {
      return [
        // 👉 Ahora los handlers reciben los argumentos dinámicamente
        { key: 'contrato_directo', label: 'Contrato de Compraventa', icon: 'bi-file-earmark-text', handler: (datos, fCliente) => generarContratoVentaDirecta(datos, fCliente) },
        { key: 'recibo_contado', label: 'Recibo Oficial de Pago', icon: 'bi-receipt', handler: (datos, fCliente) => generarReciboPago(datos, fCliente) },
        { key: 'garantia', label: 'Certificado de Garantía', icon: 'bi-shield-check', handler: (datos, fCliente) => generarCertificadoGarantia(datos, fCliente) }
      ];
    }

    if (tipo === 'plan_canje') {
      return [
        { key: 'comprobante_canje', label: 'Comprobante de Plan Canje', icon: 'bi-arrow-repeat', handler: (datos, fCliente) => generarComprobantePlanCanje(datos, fCliente) },
        { key: 'garantia', label: 'Certificado de Garantía', icon: 'bi-shield-check', handler: (datos, fCliente) => generarCertificadoGarantia(datos, fCliente) }
      ];
    }

    if (tipo === 'sistema1' || tipo === 'sistema2') {
      return [
        // 👉 El contrato de crédito recibe (datos, fCliente, fGarante)
        { key: 'contrato_credito', label: 'Contrato de Crédito Personal', icon: 'bi-file-earmark-text', handler: (datos, fCliente, fGarante) => generarContratoCredito(datos, fCliente, fGarante) },
        { key: 'recibo_credito', label: 'Recibo de Crédito', icon: 'bi-receipt', handler: (datos, fCliente) => generarReciboCredito(datos, fCliente) },
        { key: 'adhesion_credito', label: 'Solicitud de Financiación', icon: 'bi-file-text', handler: (datos, fCliente, fGarante) => generarSolicitudFinanciacion(datos, fCliente, fGarante) },
        { key: 'garantia', label: 'Certificado de Garantía', icon: 'bi-shield-check', handler: (datos, fCliente) => generarCertificadoGarantia(datos, fCliente) }
      ];
    }

    return [];
  };

  // ==========================================
  // ACCIÓN DE GENERAR Y DESCARGAR
  // ==========================================
  const handleGenerarDocumento = async (doc) => {
    if (!firmas) {
      showAlert('Primero debés capturar las firmas.', 'warning');
      return;
    }

    setLoadingDoc(doc.key);
    try {
      let datosBackend = null;

      // 1. Pedimos los datos al backend (si corresponde)
      switch (doc.key) {
        case 'contrato_credito':
          datosBackend = await obtenerDatosContratoCredito(venta._id);
          break;
        case 'adhesion_credito': // 👈 NUEVO
        case 'adhesion_canje':   // 👈 Si querés usarlo también en canje
          datosBackend = await obtenerDatosSolicitudFinanciacion(venta._id);
          break;
        default:
          // Para los demás, usamos la venta directa
          datosBackend = venta;
          break;
      }

      // 2. Ejecutamos el handler pasándole los datos y las firmas
      if (doc.key === 'contrato_credito' || doc.key === 'adhesion_credito') {
        // Pasamos (datosBackend, firmaCliente, firmaGarante)
        doc.handler(datosBackend, firmas.cliente, firmas.garante);
      } else {
        // Pasamos (venta, firmaCliente)
        doc.handler(datosBackend, firmas.cliente);
      }

      showAlert(`Documento generado correctamente.`, 'success');
    } catch (error) {
      console.error('Error al generar documento:', error);
      showAlert(error.message || 'Error al generar el documento.', 'danger');
    } finally {
      setLoadingDoc(null);
    }
  };

  if (!venta) return null;

  const documentos = obtenerDocumentosDisponibles();

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className="bi bi-file-earmark-arrow-down me-2" style={{ color: '#3483FA' }}></i>
            Generar Documentación
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-4">
          {alert.show && (
            <Alert variant={alert.variant} className="rounded-3" dismissible onClose={() => setAlert({ show: false })}>
              {alert.message}
            </Alert>
          )}

          {!firmas ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-pen" style={{ fontSize: '3rem', color: '#3483FA' }}></i>
                <h5 className="mt-3 fw-bold">Capturar Firmas</h5>
                <p className="text-muted small">
                  Para generar los documentos legales, primero es necesario capturar las firmas del cliente
                  {venta.tipoVenta === 'sistema1' && ' y del garante'}.
                </p>
              </div>
              <Button variant="primary" onClick={() => setShowFirma(true)} className="rounded-3 px-4">
                <i className="bi bi-pen me-2"></i>Firmar Documentos
              </Button>
            </div>
          ) : (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h6 className="fw-bold mb-1">Documentos Disponibles</h6>
                  <small className="text-muted">Seleccioná el documento que deseas generar para esta venta.</small>
                </div>
                <Badge bg="success" className="p-2"><i className="bi bi-check-circle me-1"></i>Firmas OK</Badge>
              </div>

              <Row className="g-3">
                {documentos.map((doc) => (
                  <Col md={6} key={doc.key}>
                    <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                      <Card.Body className="d-flex flex-column p-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className={`bi ${doc.icon} fs-4 me-3`} style={{ color: '#3483FA' }}></i>
                          <h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem' }}>{doc.label}</h6>
                        </div>
                        <div className="mt-auto pt-3">
                          <Button
                            variant="outline-primary"
                            className="w-100 rounded-3"
                            onClick={() => handleGenerarDocumento(doc)}
                            disabled={loadingDoc === doc.key}
                          >
                            {loadingDoc === doc.key ? (
                              <><Spinner size="sm" className="me-2" />Generando...</>
                            ) : (
                              <><i className="bi bi-download me-2"></i>Descargar PDF</>
                            )}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <ModalFirmaContrato
        show={showFirma}
        onHide={() => setShowFirma(false)}
        venta={venta}
        onConfirmar={handleConfirmarFirmas}
      />
    </>
  );
};