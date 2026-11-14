// src/Pages/Ceo/Componentes/ReportesNuevo.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { ResumenGeneral } from './ResumenGeneral';
import { VentasDirectas } from './VentasDirectas';
import { SistemasReporte } from './SistemasReporte';
import { PanelClientes } from './PanelClientes';
import { ControlGastos } from './ControlGastos';
import { COLORS } from '../../Cobranza/Helperss/colors'; // Ajustá la ruta

export const ReportesNuevo = () => {
  const [tabActivo, setTabActivo] = useState('resumen');

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: 'graph-up', descripcion: 'Vista general del negocio' },
    { id: 'ventas', label: 'Ventas Directas', icon: 'cash-coin', descripcion: 'Contado y Plan Canje' },
    { id: 'sistemas', label: 'Sistemas', icon: 'calendar-check', descripcion: 'Sistema 1 y Sistema 2' },
    { id: 'clientes', label: 'Clientes', icon: 'people', descripcion: 'Panel de información' },
    { id: 'gastos', label: 'Gastos', icon: 'receipt', descripcion: 'Control de gastos' }
  ];

  const tabActual = tabs.find(t => t.id === tabActivo);

  const renderContenido = () => {
    switch (tabActivo) {
      case 'resumen': return <ResumenGeneral />;
      case 'ventas': return <VentasDirectas />;
      case 'sistemas': return <SistemasReporte />;
      case 'clientes': return <PanelClientes />;
      case 'gastos': return <ControlGastos />;
      default: return <ResumenGeneral />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bgGeneral }}>
      <Container fluid className="py-4" style={{ maxWidth: '1400px' }}>
        
        {/* Header */}
        <div className="mb-4">
          <small style={{ color: COLORS.textoSecundario, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.7rem' }}>
            Análisis · Reportes
          </small>
          <h2 className="fw-bold mb-1" style={{ color: COLORS.textoPrincipal, fontSize: '2rem' }}>
            <i className="bi bi-file-earmark-bar-graph me-2" style={{ color: COLORS.azul }}></i>
            Panel de Reportes
          </h2>
          <p style={{ color: COLORS.textoSecundario, fontSize: '0.9rem' }} className="mb-0">
            {tabActual?.descripcion}
          </p>
        </div>

        {/* Navegación tipo Pills */}
        <div 
          className="d-flex flex-wrap gap-2 mb-4 p-2 rounded-4" 
          style={{ backgroundColor: COLORS.cardBg, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          {tabs.map(tab => {
            const isActive = tabActivo === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setTabActivo(tab.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isActive ? COLORS.azulSuave : 'transparent',
                  color: isActive ? COLORS.azul : COLORS.textoSecundario,
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = COLORS.bgGeneral;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <i className={`bi bi-${tab.icon}`} style={{ fontSize: '1rem' }}></i>
                {tab.label}
              </div>
            );
          })}
        </div>

        {/* Contenido */}
        <div className="tab-content">
          {renderContenido()}
        </div>

      </Container>
    </div>
  );
};