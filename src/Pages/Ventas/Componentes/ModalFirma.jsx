// src/Pages/Ventas/Componentes/ModalFirmaContrato.jsx

import React, { useRef, useState, useEffect } from 'react';
import { Modal, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import SignatureCanvas from 'react-signature-canvas';

export const ModalFirmaContrato = ({ show, onHide, venta, onConfirmar }) => {
  // Firma del cliente
  const firmaClienteRef = useRef(null);
  const [firmaClienteDataURL, setFirmaClienteDataURL] = useState(null);
  const contenedorClienteRef = useRef(null);

  // Firma del garante
  const firmaGaranteRef = useRef(null);
  const [firmaGaranteDataURL, setFirmaGaranteDataURL] = useState(null);
  const contenedorGaranteRef = useRef(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Determinar si la venta tiene garante
  const tieneGarante = venta?.requiereGarante || venta?.garante?.nombre;

  // ============================================================
  // RESET AL ABRIR EL MODAL
  // ============================================================
  useEffect(() => {
    if (show) {
      firmaClienteRef.current?.clear();
      firmaGaranteRef.current?.clear();
      setFirmaClienteDataURL(null);
      setFirmaGaranteDataURL(null);
      setError('');
    }
  }, [show]);

  // ============================================================
  // REDIMENSIONAR CANVAS (SIN devicePixelRatio)
  // ============================================================
  // El buffer del canvas coincide con el tamaño CSS → coordenadas
  // del mouse/dedo perfectamente alineadas con el trazo.
  // ============================================================
  useEffect(() => {
    if (!show) return;

    const redimensionar = () => {
      // Cliente
      if (firmaClienteRef.current && contenedorClienteRef.current) {
        const canvas = firmaClienteRef.current.getCanvas();
        const ancho = contenedorClienteRef.current.offsetWidth;
        const alto = 180;

        canvas.width = ancho;
        canvas.height = alto;
        canvas.style.width = `${ancho}px`;
        canvas.style.height = `${alto}px`;

        firmaClienteRef.current.clear();
      }

      // Garante
      if (firmaGaranteRef.current && contenedorGaranteRef.current) {
        const canvas = firmaGaranteRef.current.getCanvas();
        const ancho = contenedorGaranteRef.current.offsetWidth;
        const alto = 180;

        canvas.width = ancho;
        canvas.height = alto;
        canvas.style.width = `${ancho}px`;
        canvas.style.height = `${alto}px`;

        firmaGaranteRef.current.clear();
      }
    };

    // Pequeño delay para que el modal termine de renderizar
    const timeoutId = setTimeout(redimensionar, 150);

    // Redimensionar también si cambia la orientación o el tamaño
    window.addEventListener('resize', redimensionar);
    window.addEventListener('orientationchange', redimensionar);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', redimensionar);
      window.removeEventListener('orientationchange', redimensionar);
    };
  }, [show, tieneGarante]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleLimpiarCliente = () => {
    firmaClienteRef.current?.clear();
    setFirmaClienteDataURL(null);
    setError('');
  };

  const handleLimpiarGarante = () => {
    firmaGaranteRef.current?.clear();
    setFirmaGaranteDataURL(null);
    setError('');
  };

  const handleGuardarCliente = () => {
    if (firmaClienteRef.current?.isEmpty()) {
      setError('Por favor, dibujá la firma del cliente');
      return;
    }
    const dataURL = firmaClienteRef.current.toDataURL('image/png');
    setFirmaClienteDataURL(dataURL);
    setError('');
  };

  const handleGuardarGarante = () => {
    if (firmaGaranteRef.current?.isEmpty()) {
      setError('Por favor, dibujá la firma del garante');
      return;
    }
    const dataURL = firmaGaranteRef.current.toDataURL('image/png');
    setFirmaGaranteDataURL(dataURL);
    setError('');
  };

  const handleConfirmar = () => {
    if (!firmaClienteDataURL) {
      setError('Guardá la firma del cliente primero');
      return;
    }

    if (tieneGarante && !firmaGaranteDataURL) {
      setError('Guardá la firma del garante primero');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const firmas = {
        cliente: firmaClienteDataURL,
        garante: tieneGarante ? firmaGaranteDataURL : null
      };
      onConfirmar(firmas);
      setLoading(false);
    }, 500);
  };

  // ============================================================
  // PROPS DEL CANVAS (reutilizables)
  // ============================================================
  const canvasProps = {
    className: 'signature-canvas',
    style: {
      border: '1px dashed #ccc',
      borderRadius: '8px',
      width: '100%',
      height: '180px',
      touchAction: 'none',      // evita scroll al firmar en mobile
      display: 'block',
      backgroundColor: '#fff',
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="firma-modal"
      backdrop="static"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
          <i className="bi bi-pen me-2" style={{ color: '#3483FA' }}></i>
          Firmas del Contrato
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        {/* Info del cliente y garante */}
        {venta && (
          <div className="bg-light rounded-3 p-3 mb-3">
            <Row className="g-2">
              <Col xs={12} md={6}>
                <small className="text-muted d-block">Cliente</small>
                <span className="fw-semibold">
                  {venta.cliente?.apellido}, {venta.cliente?.nombre}
                </span>
              </Col>
              <Col xs={12} md={6}>
                <small className="text-muted d-block">Producto</small>
                <span className="fw-semibold">{venta.producto?.nombre}</span>
              </Col>
              {tieneGarante && (
                <Col xs={12}>
                  <hr className="my-2" />
                  <small className="text-muted d-block">Garante</small>
                  <span className="fw-semibold">
                    {venta.garante?.apellido}, {venta.garante?.nombre}
                    <Badge bg="danger" className="ms-2">Debe firmar</Badge>
                  </span>
                </Col>
              )}
            </Row>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="rounded-3 border-0 shadow-sm mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* ============================================
            FIRMA DEL CLIENTE
            ============================================ */}
        <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
          <h6 className="fw-bold text-primary mb-3" style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-person me-2"></i>
            Firma del Cliente <span className="text-danger">*</span>
          </h6>

          <div
            ref={contenedorClienteRef}
            className="border rounded-3 p-2 mb-2"
            style={{ backgroundColor: '#fff', overflow: 'hidden' }}
          >
            <SignatureCanvas
              ref={firmaClienteRef}
              penColor="black"
              canvasProps={canvasProps}
            />
          </div>

          <div className="d-flex gap-2 align-items-center flex-wrap">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleLimpiarCliente}
              className="rounded-3"
            >
              <i className="bi bi-eraser me-1"></i>Limpiar
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleGuardarCliente}
              className="rounded-3"
            >
              <i className="bi bi-check-circle me-1"></i>Guardar Firma
            </Button>
            {firmaClienteDataURL && (
              <Badge bg="success" className="d-flex align-items-center">
                <i className="bi bi-check-circle me-1"></i>Firma guardada
              </Badge>
            )}
          </div>
        </div>

        {/* ============================================
            FIRMA DEL GARANTE (CONDICIONAL)
            ============================================ */}
        {tieneGarante && (
          <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#fff8f0' }}>
            <h6 className="fw-bold text-danger mb-3" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-person-check me-2"></i>
              Firma del Garante <span className="text-danger">*</span>
            </h6>

            <div
              ref={contenedorGaranteRef}
              className="border rounded-3 p-2 mb-2"
              style={{ backgroundColor: '#fff', overflow: 'hidden' }}
            >
              <SignatureCanvas
                ref={firmaGaranteRef}
                penColor="black"
                canvasProps={canvasProps}
              />
            </div>

            <div className="d-flex gap-2 align-items-center flex-wrap">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleLimpiarGarante}
                className="rounded-3"
              >
                <i className="bi bi-eraser me-1"></i>Limpiar
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleGuardarGarante}
                className="rounded-3"
              >
                <i className="bi bi-check-circle me-1"></i>Guardar Firma
              </Button>
              {firmaGaranteDataURL && (
                <Badge bg="success" className="d-flex align-items-center">
                  <i className="bi bi-check-circle me-1"></i>Firma guardada
                </Badge>
              )}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={onHide}
          disabled={loading}
          className="rounded-3"
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirmar}
          disabled={loading}
          className="rounded-3"
          style={{
            backgroundColor: '#3483FA',
            borderColor: '#3483FA',
            fontWeight: '500',
          }}
        >
          {loading ? (
            <><Spinner size="sm" className="me-2" />Generando...</>
          ) : (
            <><i className="bi bi-file-pdf me-2"></i>Generar Documentos</>
          )}
        </Button>
      </Modal.Footer>

      <style>{`
        /* ---- Modal ---- */
        .firma-modal .modal-dialog {
          max-width: 900px;
        }
        .firma-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
        }

        /* ---- Canvas de firma ---- */
        .signature-canvas {
          display: block;
          width: 100% !important;
          touch-action: none;      /* impide scroll al dibujar en mobile */
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }

        /* ---- Responsive ---- */
        @media (max-width: 768px) {
          .firma-modal .modal-dialog {
            max-width: 100%;
            margin: 0.5rem;
          }
          .firma-modal .modal-body {
            padding: 1rem;
          }
        }

        @media (max-width: 576px) {
          .signature-canvas {
            height: 140px !important;
          }
        }
      `}</style>
    </Modal>
  );
};