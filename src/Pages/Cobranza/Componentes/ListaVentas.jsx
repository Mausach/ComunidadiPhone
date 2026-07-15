// Cobranza/Componentes/ListaVentas.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Alert, Button, Pagination, Card } from 'react-bootstrap';
import { ItemVenta } from './ItemVenta';

export const ListaVentas = ({
  ventas,
  loading,
  error,
  paginacion,
  onCambiarPagina,
  onVerDetalle,
  onReintentar
}) => {
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  // ==========================================
  // RENDERIZADO CONDICIONAL
  // ==========================================

  // Estado de carga
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-muted">Cargando ventas...</p>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Alert variant="danger" className="rounded-3">
        <div className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-3" style={{ fontSize: '1.5rem' }}></i>
          <div>
            <h6 className="fw-bold mb-1">Error al cargar las ventas</h6>
            <p className="mb-0 text-muted small">{error}</p>
          </div>
          <Button
            variant="outline-danger"
            className="ms-auto rounded-3"
            onClick={onReintentar}
            size="sm"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Reintentar
          </Button>
        </div>
      </Alert>
    );
  }

  // Sin resultados
  if (!ventas || ventas.length === 0) {
    return (
      <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <Card.Body className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#dee2e6' }}></i>
          <h5 className="mt-3 fw-semibold" style={{ color: '#1a1a1a' }}>
            No hay ventas registradas
          </h5>
          <p className="text-muted small">
            No se encontraron ventas con los filtros seleccionados.
          </p>
          <Button
            variant="outline-primary"
            className="rounded-3"
            onClick={onReintentar}
            size="sm"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Actualizar
          </Button>
        </Card.Body>
      </Card>
    );
  }

  // ==========================================
  // RENDERIZADO PRINCIPAL
  // ==========================================

  return (
    <div>
      {/* Header con resultados */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="fw-semibold mb-0" style={{ color: '#1a1a1a' }}>
            <i className="bi bi-list-ul me-2" style={{ color: '#3483FA' }}></i>
            Resultados
          </h6>
          <small className="text-muted">
            {paginacion?.total || 0} ventas encontradas
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">Mostrar:</small>
          <select
            className="form-select form-select-sm rounded-3"
            style={{ width: 'auto' }}
            value={itemsPorPagina}
            onChange={(e) => {
              const nuevoLimite = parseInt(e.target.value);
              setItemsPorPagina(nuevoLimite);
              onCambiarPagina(1, nuevoLimite);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="ventas-list">
        {ventas.map((venta) => (
          <ItemVenta
            key={venta._id}
            venta={venta}
            onVerDetalle={onVerDetalle}
            loading={loading}
          />
        ))}
      </div>

      {/* Paginación */}
      {paginacion && paginacion.paginas > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted small">
            Mostrando {((paginacion.pagina - 1) * paginacion.limite) + 1} -{' '}
            {Math.min(paginacion.pagina * paginacion.limite, paginacion.total)} de {paginacion.total} ventas
          </div>

          <Pagination className="mb-0">
            <Pagination.First
              onClick={() => onCambiarPagina(1, paginacion.limite)}
              disabled={paginacion.pagina === 1}
            />
            <Pagination.Prev
              onClick={() => onCambiarPagina(paginacion.pagina - 1, paginacion.limite)}
              disabled={paginacion.pagina === 1}
            />

            {/* Generar páginas dinámicamente */}
            {(() => {
              const pages = [];
              const totalPages = paginacion.paginas;
              const currentPage = paginacion.pagina;
              const maxVisible = 5;

              let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
              let endPage = Math.min(totalPages, startPage + maxVisible - 1);

              if (endPage - startPage + 1 < maxVisible) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => onCambiarPagina(i, paginacion.limite)}
                  >
                    {i}
                  </Pagination.Item>
                );
              }

              return pages;
            })()}

            <Pagination.Next
              onClick={() => onCambiarPagina(paginacion.pagina + 1, paginacion.limite)}
              disabled={paginacion.pagina === paginacion.paginas}
            />
            <Pagination.Last
              onClick={() => onCambiarPagina(paginacion.paginas, paginacion.limite)}
              disabled={paginacion.pagina === paginacion.paginas}
            />
          </Pagination>
        </div>
      )}

      {/* Estilos */}
      <style>{`
        .ventas-list {
          max-height: calc(100vh - 450px);
          overflow-y: auto;
          padding-right: 4px;
        }

        .ventas-list::-webkit-scrollbar {
          width: 6px;
        }

        .ventas-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .ventas-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .ventas-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        @media (max-width: 768px) {
          .ventas-list {
            max-height: calc(100vh - 400px);
          }
        }
      `}</style>
    </div>
  );
};