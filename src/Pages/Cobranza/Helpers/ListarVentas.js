// Cobranza/Helpers/listarVentas.js
import authApi from "../../../Api/authApi";

// Cobranza/Helpers/listarVentas.js

export const listarVentas = async (filtros = {}) => {
  try {
    // Construir query params
    const params = new URLSearchParams();
    
    if (filtros.dni) params.append('dni', filtros.dni);
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.localidad) params.append('localidad', filtros.localidad);
    if (filtros.tipoVenta) params.append('tipoVenta', filtros.tipoVenta);
    
    // Filtros de fecha de cuota
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    
    // Filtros de fecha de venta
    if (filtros.fechaVentaDesde) params.append('fechaVentaDesde', filtros.fechaVentaDesde);
    if (filtros.fechaVentaHasta) params.append('fechaVentaHasta', filtros.fechaVentaHasta);
    
    if (filtros.pagina) params.append('pagina', filtros.pagina);
    if (filtros.limite) params.append('limite', filtros.limite);

    const url = `/cobranza/ventas${params.toString() ? '?' + params.toString() : ''}`;
    
    //console.log('🔍 Buscando ventas:', url);

    const resp = await authApi.get(url);

    if (resp.data?.ok) {
      return {
        success: true,
        ventas: resp.data.data || [],
        paginacion: resp.data.paginacion || {},
        message: resp.data.message || 'Ventas encontradas'
      };
    } else {
      throw new Error(resp.data?.message || 'Error al listar ventas');
    }

  } catch (error) {
    console.error('❌ Error al listar ventas:', error);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    if (error.response?.status >= 500) {
      throw new Error('Error del servidor. Intentá nuevamente más tarde.');
    }

    const errorMessage = error.response?.data?.message || 
                        error.message ||
                        'Error al listar ventas. Intentá nuevamente.';

    throw new Error(errorMessage);
  }
};