// Ventas/index.jsx
import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import { NavBarVentas } from './Componentes/NavBarVentas';
import { FormularioCliente } from './Componentes/FormularioCliente';
import { crearCliente } from './Helpers/AltaCliente';

import { FormularioVenta } from './Componentes/FormularioVenta';
import { crearVenta } from './Helpers/AltaVenta';

// Ventas/index.jsx

export const Ventas = () => {
  const location = useLocation();
  const usuario = location.state;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [clienteData, setClienteData] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [pasoActual, setPasoActual] = useState(1);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    variant: 'danger'
  });

  const showAlert = (message, variant = 'danger') => {
    if (!message) {
      setAlert({ show: false, message: '', variant: 'danger' });
      return;
    }
    setAlert({
      show: true,
      message,
      variant,
    });

    setTimeout(() => {
      setAlert({ show: false, message: '', variant: 'danger' });
    }, 5000);
  };

  const handleClienteSubmit = async (formData, esExistente = false) => {
    setIsLoading(true);
    
    try {
      const result = await crearCliente(formData, setClienteData, showAlert, esExistente);

      if (result.clienteId) {
        setClienteId(result.clienteId);
      }

      setTimeout(() => {
        setIsLoading(false);
        setPasoActual(2);
        showAlert(
          esExistente 
            ? 'Cliente verificado correctamente' 
            : result.message || 'Cliente creado exitosamente', 
          'success'
        );
      }, 1500);

    } catch (error) {
      showAlert(error.message || 'Error al procesar el cliente', 'danger');
      setIsLoading(false);
    }
  };

  const handleVentaSubmit = async (ventaData) => {
    console.log('📦 Datos de venta recibidos:', ventaData);

    setIsLoading(true);
    try {
      const result = await crearVenta(ventaData);
      console.log('✅ Venta creada:', result);

      showAlert('¡Venta creada exitosamente!', 'success');

      setTimeout(() => {
        setIsLoading(false);
        navigate('/ventas', {
          state: {
            venta: result.data,
            cliente: clienteData
          }
        });
      }, 1500);

    } catch (error) {
      console.error('❌ Error al crear venta:', error);
      showAlert(error.message || 'Error al crear la venta', 'danger');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <NavBarVentas usuario={usuario} />

      <Container fluid className="py-4">
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <div className="mb-4">
              <h2 className="fw-bold mb-1" style={{ color: '#1a1a1a' }}>
                <i className="bi bi-cart-plus me-2" style={{ color: '#3483FA' }}></i>
                Nueva Venta
              </h2>
              <p className="text-muted small">
                {pasoActual === 1 ? 'Paso 1: Registrá los datos del cliente' : 'Paso 2: Completá los datos de la venta'}
              </p>
            </div>

            {pasoActual === 1 && (
              <FormularioCliente
                onSubmit={handleClienteSubmit}
                isLoading={isLoading}
                alert={alert}
                showAlert={showAlert}
              />
            )}

            {pasoActual === 2 && clienteData && (
              <FormularioVenta
                clienteData={clienteData}
                onSubmit={handleVentaSubmit}
                isLoading={isLoading}
                vendedor={usuario?.user.nombre + ' ' + usuario?.user.apellido}
              />
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};