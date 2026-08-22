// src/Pages/Ventas/Componentes/ModalFirmaContrato.jsx

import React, { useRef, useState, useEffect } from 'react';
import { Modal, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import SignatureCanvas from 'react-signature-canvas';

export const ModalFirmaContrato = ({ show, onHide, venta, onConfirmar }) => {
  // Firma del cliente
  const firmaClienteRef = useRef(null);
  const [firmaClienteDataURL, setFirmaClienteDataURL] = useState(null);

  // Firma del garante
  const firmaGaranteRef = useRef(null);
  const [firmaGaranteDataURL, setFirmaGaranteDataURL] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Determinar si la venta tiene garante
  const tieneGarante = venta?.requiereGarante || venta?.garante?.nombre;

  // Resetear al abrir el modal
  useEffect(() => {
    if (show) {
      firmaClienteRef.current?.clear();
      firmaGaranteRef.current?.clear();
      setFirmaClienteDataURL(null);
      setFirmaGaranteDataURL(null);
      setError('');
    }
  }, [show]);

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
    // Validar firma del cliente
    if (!firmaClienteDataURL) {
      setError('Guardá la firma del cliente primero');
      return;
    }

    // Validar firma del garante si corresponde
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

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="firma-modal">
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
              <Col md={6}>
                <small className="text-muted d-block">Cliente</small>
                <span className="fw-semibold">{venta.cliente?.apellido}, {venta.cliente?.nombre}</span>
              </Col>
              <Col md={6}>
                <small className="text-muted d-block">Producto</small>
                <span className="fw-semibold">{venta.producto?.nombre}</span>
              </Col>
              {tieneGarante && (
                <Col md={12}>
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
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
          </Alert>
        )}

        {/* Firma del Cliente */}
        <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
          <h6 className="fw-bold text-primary mb-3" style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-person me-2"></i>Firma del Cliente <span className="text-danger">*</span>
          </h6>
          <div className="border rounded-3 p-2 mb-2" style={{ backgroundColor: '#fff' }}>
            <SignatureCanvas
              ref={firmaClienteRef}
              penColor="black"
              canvasProps={{
                width: 600,
                height: 150,
                className: 'signature-canvas w-100',
                style: { border: '1px dashed #ccc', borderRadius: '8px' }
              }}
            />
          </div>
          <div className="d-flex gap-2 align-items-center">
            <Button variant="outline-secondary" size="sm" onClick={handleLimpiarCliente}>
              <i className="bi bi-eraser me-1"></i>Limpiar
            </Button>
            <Button variant="outline-primary" size="sm" onClick={handleGuardarCliente}>
              <i className="bi bi-check-circle me-1"></i>Guardar Firma
            </Button>
            {firmaClienteDataURL && (
              <Badge bg="success" className="d-flex align-items-center">
                <i className="bi bi-check-circle me-1"></i>Firma guardada
              </Badge>
            )}
          </div>
        </div>

        {/* Firma del Garante (condicional) */}
        {tieneGarante && (
          <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#fff8f0' }}>
            <h6 className="fw-bold text-danger mb-3" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-person-check me-2"></i>Firma del Garante <span className="text-danger">*</span>
            </h6>
            <div className="border rounded-3 p-2 mb-2" style={{ backgroundColor: '#fff' }}>
              <SignatureCanvas
                ref={firmaGaranteRef}
                penColor="black"
                canvasProps={{
                  width: 600,
                  height: 150,
                  className: 'signature-canvas w-100',
                  style: { border: '1px dashed #ccc', borderRadius: '8px' }
                }}
              />
            </div>
            <div className="d-flex gap-2 align-items-center">
              <Button variant="outline-secondary" size="sm" onClick={handleLimpiarGarante}>
                <i className="bi bi-eraser me-1"></i>Limpiar
              </Button>
              <Button variant="outline-danger" size="sm" onClick={handleGuardarGarante}>
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
      <Modal.Footer className="border-0 pt-0">
        <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
        <Button variant="primary" onClick={handleConfirmar} disabled={loading}
          style={{ backgroundColor: '#3483FA', borderColor: '#3483FA', fontWeight: '500' }}>
          {loading ? <><Spinner size="sm" className="me-2" />Generando...</> : <><i className="bi bi-file-pdf me-2"></i>Generar Documentos</>}
        </Button>
      </Modal.Footer>

      <style>{`
        .firma-modal .modal-dialog { max-width: 700px; }
        .firma-modal .modal-content { border-radius: 16px; overflow: hidden; }
        .signature-canvas { width: 100%; }
      `}</style>
    </Modal>
  );
};