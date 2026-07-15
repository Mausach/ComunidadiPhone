// Cobranza/Componentes/BuscadorCobranza.jsx
import React, { useState } from 'react';
import { Form, Row, Col, Button, InputGroup, Badge } from 'react-bootstrap';

export const BuscadorCobranza = ({ onBuscar, loading, filtrosIniciales }) => {
  const [filtros, setFiltros] = useState({
    dni: filtrosIniciales?.dni || '',
    nombre: filtrosIniciales?.nombre || '',
    estado: filtrosIniciales?.estado || '',
    localidad: filtrosIniciales?.localidad || '',
    tipoVenta: filtrosIniciales?.tipoVenta || '',
    fechaDesde: filtrosIniciales?.fechaDesde || '',
    fechaHasta: filtrosIniciales?.fechaHasta || '',
    fechaVentaDesde: filtrosIniciales?.fechaVentaDesde || '',
    fechaVentaHasta: filtrosIniciales?.fechaVentaHasta || ''
  });

  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  // Opciones para selectores
  const opcionesEstado = [
    { value: '', label: 'Todos los estados' },
    { value: 'al dia', label: 'Al día' },
    { value: 'atrasado', label: 'Atrasado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'refinanciado', label: 'Refinanciado' },
    { value: 'cobro judicial', label: 'Cobro judicial' },
    { value: 'caducado', label: 'Caducado' }
  ];

  const opcionesTipoVenta = [
    { value: '', label: 'Todos los tipos' },
    { value: 'contado', label: 'Contado' },
    { value: 'sistema1', label: 'Sistema 1' },
    { value: 'sistema2', label: 'Sistema 2' },
    { value: 'plan_canje', label: 'Plan Canje' }
  ];

  const opcionesLocalidad = [
    { value: '', label: 'Todas las localidades' },
    { value: 'santiago capital', label: 'Santiago Capital' },
    { value: 'la banda', label: 'La Banda' },
    { value: 'añatuya', label: 'Añatuya' },
    { value: 'monte quemado', label: 'Monte Quemado' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Limpiar campos vacíos antes de enviar
    const filtrosLimpios = {};
    Object.keys(filtros).forEach(key => {
      if (filtros[key] && filtros[key].trim() !== '') {
        filtrosLimpios[key] = filtros[key];
      }
    });
    onBuscar(filtrosLimpios);
  };

  const handleReset = () => {
    const filtrosVacios = {
      dni: '',
      nombre: '',
      estado: '',
      localidad: '',
      tipoVenta: '',
      fechaDesde: '',
      fechaHasta: '',
      fechaVentaDesde: '',
      fechaVentaHasta: ''
    };
    setFiltros(filtrosVacios);
    onBuscar({});
  };

  // Contar filtros activos
  const filtrosActivos = Object.keys(filtros).filter(key => 
    filtros[key] && filtros[key].trim() !== ''
  ).length;

  return (
    <div className="border rounded-3 p-3 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
      <Form onSubmit={handleSubmit}>
        <Row className="g-2 align-items-end">
          {/* Búsqueda principal - DNI */}
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-secondary">
                <i className="bi bi-person-badge me-1"></i>
                DNI
              </Form.Label>
              <InputGroup className="rounded-3">
                <Form.Control
                  type="text"
                  name="dni"
                  value={filtros.dni}
                  onChange={handleChange}
                  placeholder="8 dígitos sin puntos"
                  className="rounded-3"
                  disabled={loading}
                  maxLength={8}
                />
              </InputGroup>
            </Form.Group>
          </Col>

          {/* Búsqueda por nombre */}
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-semibold text-secondary">
                <i className="bi bi-person me-1"></i>
                Nombre / Apellido
              </Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={filtros.nombre}
                onChange={handleChange}
                placeholder="Buscar por nombre"
                className="rounded-3"
                disabled={loading}
              />
            </Form.Group>
          </Col>

          {/* Botones de acción */}
          <Col md={6} className="d-flex gap-2 justify-content-end">
            <Button
              variant="primary"
              type="submit"
              className="rounded-3 px-4"
              style={{
                backgroundColor: '#3483FA',
                borderColor: '#3483FA',
                fontWeight: '500'
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Buscando...
                </>
              ) : (
                <>
                  <i className="bi bi-search me-2"></i>
                  Buscar
                </>
              )}
            </Button>

            <Button
              variant="outline-secondary"
              onClick={handleReset}
              className="rounded-3"
              disabled={loading}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i>
              Limpiar
            </Button>

            <Button
              variant="link"
              onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
              className="text-decoration-none"
              style={{ color: '#3483FA' }}
              disabled={loading}
            >
              <i className={`bi bi-chevron-${mostrarFiltrosAvanzados ? 'up' : 'down'} me-1`}></i>
              {mostrarFiltrosAvanzados ? 'Menos filtros' : 'Más filtros'}
              {filtrosActivos > 0 && (
                <Badge bg="primary" className="ms-1 rounded-pill">
                  {filtrosActivos}
                </Badge>
              )}
            </Button>
          </Col>
        </Row>

        {/* Filtros avanzados */}
        {mostrarFiltrosAvanzados && (
          <>
            <Row className="g-2 mt-2 pt-2 border-top">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="bi bi-credit-card me-1"></i>
                    Estado de pago
                  </Form.Label>
                  <Form.Select
                    name="estado"
                    value={filtros.estado}
                    onChange={handleChange}
                    className="rounded-3"
                    disabled={loading}
                  >
                    {opcionesEstado.map(op => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="bi bi-geo-alt me-1"></i>
                    Localidad
                  </Form.Label>
                  <Form.Select
                    name="localidad"
                    value={filtros.localidad}
                    onChange={handleChange}
                    className="rounded-3"
                    disabled={loading}
                  >
                    {opcionesLocalidad.map(op => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="bi bi-tag me-1"></i>
                    Tipo de venta
                  </Form.Label>
                  <Form.Select
                    name="tipoVenta"
                    value={filtros.tipoVenta}
                    onChange={handleChange}
                    className="rounded-3"
                    disabled={loading}
                  >
                    {opcionesTipoVenta.map(op => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Fechas */}
            <Row className="g-2 mt-2 pt-2 border-top">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="bi bi-calendar-check me-1"></i>
                    Fecha de vencimiento (cuotas)
                  </Form.Label>
                  <Row className="g-2">
                    <Col xs={6}>
                      <Form.Control
                        type="date"
                        name="fechaDesde"
                        value={filtros.fechaDesde}
                        onChange={handleChange}
                        className="rounded-3"
                        disabled={loading}
                        size="sm"
                      />
                      <small className="text-muted">Desde</small>
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="date"
                        name="fechaHasta"
                        value={filtros.fechaHasta}
                        onChange={handleChange}
                        className="rounded-3"
                        disabled={loading}
                        size="sm"
                      />
                      <small className="text-muted">Hasta</small>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">
                    <i className="bi bi-calendar me-1"></i>
                    Fecha de venta
                  </Form.Label>
                  <Row className="g-2">
                    <Col xs={6}>
                      <Form.Control
                        type="date"
                        name="fechaVentaDesde"
                        value={filtros.fechaVentaDesde}
                        onChange={handleChange}
                        className="rounded-3"
                        disabled={loading}
                        size="sm"
                      />
                      <small className="text-muted">Desde</small>
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="date"
                        name="fechaVentaHasta"
                        value={filtros.fechaVentaHasta}
                        onChange={handleChange}
                        className="rounded-3"
                        disabled={loading}
                        size="sm"
                      />
                      <small className="text-muted">Hasta</small>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        {/* Indicador de filtros activos */}
        {filtrosActivos > 0 && (
          <div className="mt-2 d-flex gap-2 flex-wrap">
            <small className="text-muted me-2">
              <i className="bi bi-funnel me-1"></i>
              Filtros activos:
            </small>
            {Object.keys(filtros).map(key => {
              if (filtros[key] && filtros[key].trim() !== '') {
                const labels = {
                  dni: 'DNI',
                  nombre: 'Nombre',
                  estado: 'Estado',
                  localidad: 'Localidad',
                  tipoVenta: 'Tipo venta',
                  fechaDesde: 'Vencimiento desde',
                  fechaHasta: 'Vencimiento hasta',
                  fechaVentaDesde: 'Venta desde',
                  fechaVentaHasta: 'Venta hasta'
                };
                return (
                  <Badge key={key} bg="light" text="dark" className="rounded-pill px-2 py-1">
                    {labels[key] || key}: {filtros[key]}
                    <Button
                      variant="link"
                      className="p-0 ms-1 text-danger"
                      style={{ fontSize: '0.7rem', textDecoration: 'none' }}
                      onClick={() => {
                        setFiltros({ ...filtros, [key]: '' });
                      }}
                    >
                      <i className="bi bi-x-circle"></i>
                    </Button>
                  </Badge>
                );
              }
              return null;
            })}
          </div>
        )}
      </Form>
    </div>
  );
};