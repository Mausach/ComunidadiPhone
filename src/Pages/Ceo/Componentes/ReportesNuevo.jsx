// src/Pages/Ceo/Componentes/ReportesNuevo.jsx

import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Badge } from 'react-bootstrap';
import { ResumenGeneral } from './ResumenGeneral';
import { VentasDirectas } from './VentasDirectas';
import { SistemasReporte } from './SistemasReporte';
import { PanelClientes } from './PanelClientes';
import { ControlGastos } from './ControlGastos';

// Sub-componentes (los crearemos después)


export const ReportesNuevo = () => {
  const [tabActivo, setTabActivo] = useState('resumen');

  const tabs = [
    { 
      id: 'resumen', 
      label: 'Resumen', 
      icon: 'bi-graph-up',
      descripcion: 'Vista general del negocio'
    },
    { 
      id: 'ventas', 
      label: 'Ventas Directas', 
      icon: 'bi-cash-coin',
      descripcion: 'Contado y Plan Canje'
    },
    { 
      id: 'sistemas', 
      label: 'Sistemas', 
      icon: 'bi-calendar-check',
      descripcion: 'Sistema 1 y Sistema 2'
    },
    { 
      id: 'clientes', 
      label: 'Clientes', 
      icon: 'bi-people',
      descripcion: 'Panel de información'
    },
    { 
      id: 'gastos', 
      label: 'Gastos', 
      icon: 'bi-receipt',
      descripcion: 'Control de gastos'
    }
  ];

  const renderContenido = () => {
    switch (tabActivo) {
      case 'resumen':
        return <ResumenGeneral />;
      case 'ventas':
        return <VentasDirectas />;
      case 'sistemas':
        return <SistemasReporte />;
      case 'clientes':
        return <PanelClientes />;
      case 'gastos':
        return <ControlGastos />;
      default:
        return <ResumenGeneral />;
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: '#1a1a1a' }}>
          <i className="bi bi-file-earmark-bar-graph me-2" style={{ color: '#3483FA' }}></i>
          Reportes
        </h3>
        <p className="text-muted">
          Análisis completo del negocio · {tabs.find(t => t.id === tabActivo)?.descripcion}
        </p>
      </div>

      {/* Navegación de Tabs */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
        <Card.Body className="p-2">
          <Nav variant="tabs" className="d-flex flex-wrap" style={{ borderBottom: 'none', gap: '4px' }}>
            {tabs.map(tab => (
              <Nav.Item key={tab.id}>
                <Nav.Link
                  onClick={() => setTabActivo(tab.id)}
                  className="rounded-3"
                  style={{
                    padding: '12px 20px',
                    border: tabActivo === tab.id ? '2px solid #3483FA' : '2px solid transparent',
                    backgroundColor: tabActivo === tab.id ? '#e8f0fe' : 'transparent',
                    color: tabActivo === tab.id ? '#3483FA' : '#666',
                    fontWeight: tabActivo === tab.id ? '600' : '400',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderRadius: '8px'
                  }}
                >
                  <i className={`bi ${tab.icon} me-2`}></i>
                  {tab.label}
                  {tabActivo === tab.id && (
                    <Badge bg="primary" className="ms-2" style={{ fontSize: '0.65rem' }}>
                      Activo
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Body>
      </Card>

      {/* Contenido del Tab */}
      <div className="tab-content">
        {renderContenido()}
      </div>
    </Container>
  );
};