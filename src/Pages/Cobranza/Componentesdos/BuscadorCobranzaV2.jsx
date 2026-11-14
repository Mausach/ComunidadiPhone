// Cobranza-v2/Componentes/BuscadorCobranzaV2.jsx
import React from 'react';
import { Row, Col, Form, InputGroup } from 'react-bootstrap';
import { COLORS } from '../Helperss/colors';



export const BuscadorCobranzaV2 = ({ filtros, onChangeFiltro }) => {
  const localidades = [
    { value: '', label: 'Todas las sucursales' },
    { value: 'santiago capital', label: 'Santiago Capital' },
    { value: 'la banda', label: 'La Banda' },
    { value: 'añatuya', label: 'Añatuya' },
    { value: 'monte quemado', label: 'Monte Quemado' }
  ];

  const tiposVenta = [
    { value: '', label: 'Todos los tipos' },
    { value: 'sistema1', label: 'Sistema 1' },
    { value: 'sistema2', label: 'Sistema 2' },
    { value: 'plan_canje_cuotas', label: 'Canje + Cuotas' }
  ];

  return (
    <Row className="g-3 mb-3">
      <Col md={5}>
        <InputGroup>
          <InputGroup.Text style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.bordes }}>
            <i className="bi bi-search" style={{ color: COLORS.textoSecundario }}></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Buscar cliente por nombre o DNI"
            value={filtros.nombre || ''}
            onChange={(e) => onChangeFiltro('nombre', e.target.value)}
            style={{ borderColor: COLORS.bordes, padding: '10px 12px' }}
          />
        </InputGroup>
      </Col>
      <Col md={3}>
        <Form.Select 
          value={filtros.localidad || ''}
          onChange={(e) => onChangeFiltro('localidad', e.target.value)}
          style={{ borderColor: COLORS.bordes, padding: '10px 12px' }}
        >
          {localidades.map(loc => (
            <option key={loc.value} value={loc.value}>{loc.label}</option>
          ))}
        </Form.Select>
      </Col>
      <Col md={4}>
        <Form.Select 
          value={filtros.tipoVenta || ''}
          onChange={(e) => onChangeFiltro('tipoVenta', e.target.value)}
          style={{ borderColor: COLORS.bordes, padding: '10px 12px' }}
        >
          {tiposVenta.map(tipo => (
            <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
          ))}
        </Form.Select>
      </Col>
    </Row>
  );
};