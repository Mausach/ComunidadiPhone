// Cobranza-v2/Componentes/TabsEstado.jsx
import React from 'react';
import { Nav, Badge } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';



export const TabsEstado = ({ tabActivo, onChangeTab, contadores }) => {
  const tabs = [
    { key: 'por_vencer', label: 'Por vencer', count: contadores?.porVencer || 0 },
    { key: 'cobradas', label: 'Cobradas', count: contadores?.cobradas || 0 },
    { key: 'en_mora', label: 'En mora', count: contadores?.enMora || 0 },
    { key: 'legal', label: 'Legal', count: contadores?.legal || 0 },
  ];

  return (
    <Nav variant="tabs" className="mb-0 border-bottom-0" style={{ gap: '5px' }}>
      {tabs.map(tab => (
        <Nav.Item key={tab.key}>
          <Nav.Link 
            active={tabActivo === tab.key} 
            onClick={() => onChangeTab(tab.key)}
            style={{ 
              color: tabActivo === tab.key ? COLORS.azul : COLORS.textoSecundario,
              borderBottom: tabActivo === tab.key ? `3px solid ${COLORS.azul}` : '3px solid transparent',
              fontWeight: tabActivo === tab.key ? '600' : '500',
              padding: '10px 15px'
            }}
          >
            {tab.label} 
            <Badge bg="light" text="dark" className="ms-2 border">{tab.count}</Badge>
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
};