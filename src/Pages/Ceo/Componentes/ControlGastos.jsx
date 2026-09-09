// src/Pages/Ceo/Componentes/reportes/ControlGastos.jsx

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner, Alert, Badge, Modal, Table, InputGroup } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { obtenerReporteGastos, registrarGasto } from '../Helpers/ReportesMensuales';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const formatoMoneda = (v) => !v && v !== 0 ? '$0' : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);
const formatoFecha = (f) => !f ? '-' : new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const ControlGastos = () => {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [datos, setDatos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'danger' });

  // Modal registrar gasto
  const [showModalGasto, setShowModalGasto] = useState(false);
  const [formGasto, setFormGasto] = useState({
    descripcion: '',
    monto: 0,
    responsable: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);

  // Modal detalle de mes
  const [showModalMes, setShowModalMes] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState(null);
  const [gastosDelMes, setGastosDelMes] = useState([]);

  const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    cargarDatos();
  }, [anio]);

  const cargarDatos = async () => {
    setIsLoading(true);
    setError('');
    try {
      const resp = await obtenerReporteGastos(anio);
      setDatos(resp.data);
    } catch (err) {
      setError(err.message || 'Error al cargar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (message, variant = 'danger') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'danger' }), 5000);
  };

  const handleChangeGasto = (e) => {
    const { name, value } = e.target;
    setFormGasto(prev => ({ ...prev, [name]: value }));
  };

  const handleRegistrarGasto = async (e) => {
    e.preventDefault();

    if (!formGasto.descripcion.trim()) {
      showAlert('La descripción es obligatoria', 'warning');
      return;
    }
    if (!formGasto.monto || parseFloat(formGasto.monto) <= 0) {
      showAlert('El monto debe ser mayor a 0', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        descripcion_gasto: formGasto.descripcion.trim(),
        Monto_gasto: parseFloat(formGasto.monto),
        responsable: formGasto.responsable.trim() || 'No especificado',
        fecha: formGasto.fecha
      };

      await registrarGasto(payload);
      setShowModalGasto(false);
      setFormGasto({
        descripcion: '',
        monto: 0,
        responsable: '',
        fecha: new Date().toISOString().split('T')[0]
      });
      showAlert('Gasto registrado correctamente', 'success');
      cargarDatos();
    } catch (err) {
      showAlert(err.message || 'Error al registrar el gasto', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleVerMes = (mes) => {
    setMesSeleccionado(mes);
    const gastosFiltrados = datos.gastos.filter(g => g.mes === mes.mes);
    setGastosDelMes(gastosFiltrados);
    setShowModalMes(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" style={{ color: '#3483FA' }} />
        <p className="text-muted mt-3">Cargando reporte de gastos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="shadow-sm border-0" style={{ borderRadius: '8px' }}>
        <i className="bi bi-exclamation-triangle me-2"></i>{error}
        <button onClick={cargarDatos} className="btn btn-link btn-sm ms-3" style={{ color: '#dc3545' }}>
          Reintentar
        </button>
      </Alert>
    );
  }

  if (!datos) return null;

  // Datos para el gráfico
  const datosGrafico = {
    labels: datos.resumenAnual.map(m => m.nombre),
    datasets: [
      {
        label: 'Gastos',
        data: datos.resumenAnual.map(m => m.totalGastos),
        backgroundColor: '#DC3545',
        borderRadius: 6,
        hoverBackgroundColor: '#FF7733'
      }
    ]
  };

  const opcionesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${formatoMoneda(context.raw)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f0f0f0' },
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
          font: { size: 10 }
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      }
    }
  };

  return (
    <div>
      {/* Selector de Año y Botón Registrar */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
        <Card.Body className="p-3">
          <Row className="align-items-end g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold text-secondary">Año</Form.Label>
                <Form.Select value={anio} onChange={(e) => setAnio(parseInt(e.target.value))} className="rounded-3">
                  {anios.map(a => <option key={a} value={a}>{a}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={5}>
              <div className="d-flex gap-2 flex-wrap">
                <Badge bg="danger" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
                  Total Anual: {formatoMoneda(datos.totalesAnuales.totalGastosAnuales)}
                </Badge>
                <Badge bg="secondary" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
                  {datos.totalesAnuales.totalCantidadGastos} gastos
                </Badge>
                <Badge bg="warning" text="dark" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
                  Mayor gasto: {datos.mesMayorGasto.nombre} ({formatoMoneda(datos.mesMayorGasto.total)})
                </Badge>
              </div>
            </Col>
            <Col md={4} className="text-end">
              <Button 
                variant="danger" 
                onClick={() => setShowModalGasto(true)}
                className="rounded-3"
                style={{ backgroundColor: '#DC3545', borderColor: '#DC3545', fontWeight: '500' }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Registrar Gasto
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Alert */}
      {alert.show && (
        <Alert variant={alert.variant} className="shadow-sm border-0 mb-3" style={{ borderRadius: '8px' }}
          onClose={() => setAlert({ show: false, message: '', variant: 'danger' })} dismissible>
          <i className={`bi bi-${alert.variant === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {alert.message}
        </Alert>
      )}

      {/* Cards de Totales Generales */}
      <Row className="g-3 mb-4">
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #DC3545' }}>
            <Card.Body>
              <small className="text-muted d-block mb-1">TOTAL HISTÓRICO</small>
              <h3 className="fw-bold mb-0" style={{ color: '#DC3545' }}>{formatoMoneda(datos.totalesGenerales.totalGastos)}</h3>
              <small className="text-muted">Todos los años</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #3483FA' }}>
            <Card.Body>
              <small className="text-muted d-block mb-1">PROMEDIO POR GASTO</small>
              <h3 className="fw-bold mb-0" style={{ color: '#3483FA' }}>{formatoMoneda(datos.totalesGenerales.gastoPromedio)}</h3>
              <small className="text-muted">{datos.totalesGenerales.cantidadGastos} gastos registrados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #00A650' }}>
            <Card.Body>
              <small className="text-muted d-block mb-1">GASTO MÍNIMO</small>
              <h3 className="fw-bold mb-0" style={{ color: '#00A650' }}>{formatoMoneda(datos.totalesGenerales.gastoMinimo)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', borderLeft: '4px solid #FF7733' }}>
            <Card.Body>
              <small className="text-muted d-block mb-1">GASTO MÁXIMO</small>
              <h3 className="fw-bold mb-0" style={{ color: '#FF7733' }}>{formatoMoneda(datos.totalesGenerales.gastoMaximo)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráfico */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
        <Card.Body>
          <h6 className="fw-bold mb-3" style={{ color: '#1a1a1a' }}>
            <i className="bi bi-bar-chart me-2" style={{ color: '#DC3545' }}></i>
            Gastos por Mes
          </h6>
          <div style={{ height: '300px' }}>
            <Bar data={datosGrafico} options={opcionesGrafico} />
          </div>
        </Card.Body>
      </Card>

      {/* Grilla de 12 meses */}
      <Row className="g-3">
        {datos.resumenAnual.map(mes => (
          <Col xl={3} lg={4} md={6} key={mes.mes}>
            <Card 
              className="shadow-sm border-0 h-100" 
              style={{ 
                borderRadius: '12px', 
                cursor: mes.cantidadGastos > 0 ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                borderLeft: `4px solid ${mes.totalGastos > 0 ? '#DC3545' : '#E5E5E5'}`
              }}
              onClick={() => mes.cantidadGastos > 0 && handleVerMes(mes)}
              onMouseEnter={(e) => { if (mes.cantidadGastos > 0) e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { if (mes.cantidadGastos > 0) e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0" style={{ color: '#333' }}>{mes.nombre}</h6>
                  {mes.cantidadGastos > 0 ? (
                    <Badge bg="danger">{mes.cantidadGastos}</Badge>
                  ) : (
                    <Badge bg="light" text="muted">Sin gastos</Badge>
                  )}
                </div>
                {mes.totalGastos > 0 ? (
                  <strong style={{ color: '#DC3545', fontSize: '1.1rem' }}>
                    {formatoMoneda(mes.totalGastos)}
                  </strong>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal Registrar Gasto */}
      <Modal show={showModalGasto} onHide={() => setShowModalGasto(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className="bi bi-plus-circle me-2" style={{ color: '#DC3545' }}></i>
            Registrar Gasto
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRegistrarGasto}>
          <Modal.Body className="pt-3">
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Descripción <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="descripcion"
                    value={formGasto.descripcion}
                    onChange={handleChangeGasto}
                    placeholder="Ej: Compra de insumos"
                    className="rounded-3"
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Monto ($) <span className="text-danger">*</span></Form.Label>
                  <InputGroup className="rounded-3">
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="monto"
                      value={formGasto.monto}
                      onChange={handleChangeGasto}
                      placeholder="0"
                      className="rounded-end-3"
                      disabled={saving}
                      min={0}
                      step={100}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Responsable</Form.Label>
                  <Form.Control
                    type="text"
                    name="responsable"
                    value={formGasto.responsable}
                    onChange={handleChangeGasto}
                    placeholder="Ej: Juan Pérez"
                    className="rounded-3"
                    disabled={saving}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    value={formGasto.fecha}
                    onChange={handleChangeGasto}
                    className="rounded-3"
                    disabled={saving}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="secondary" onClick={() => setShowModalGasto(false)} className="rounded-3" disabled={saving}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              type="submit" 
              className="rounded-3 px-4"
              style={{ backgroundColor: '#DC3545', borderColor: '#DC3545', fontWeight: '500' }} 
              disabled={saving}
            >
              {saving ? <><Spinner size="sm" className="me-2" />Guardando...</> : <><i className="bi bi-check-circle me-2"></i>Registrar Gasto</>}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Detalle de Mes */}
      <Modal show={showModalMes} onHide={() => setShowModalMes(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a1a' }}>
            <i className="bi bi-calendar-month me-2" style={{ color: '#DC3545' }}></i>
            {mesSeleccionado?.nombre} - Gastos
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {gastosDelMes.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="align-middle" style={{ fontSize: '0.85rem' }}>
                <thead className="bg-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Responsable</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {gastosDelMes.map((gasto, idx) => (
                    <tr key={idx}>
                      <td>{gasto.fechaFormateada}</td>
                      <td style={{ color: '#333' }}>{gasto.descripcion}</td>
                      <td style={{ color: '#666' }}>{gasto.responsable || 'N/A'}</td>
                      <td><strong style={{ color: '#DC3545' }}>{formatoMoneda(gasto.monto)}</strong></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-light">
                  <tr>
                    <td colSpan={3} className="text-end fw-bold">Total</td>
                    <td>
                      <strong style={{ color: '#DC3545' }}>
                        {formatoMoneda(gastosDelMes.reduce((sum, g) => sum + g.monto, 0))}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          ) : (
            <p className="text-muted text-center py-4">No hay gastos registrados en este mes</p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShowModalMes(false)} className="rounded-3">
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
