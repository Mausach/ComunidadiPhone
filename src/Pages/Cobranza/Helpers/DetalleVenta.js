// Cobranza/Helpers/obtenerDetalleVenta.js
import authApi from "../../../Api/authApi";

export const obtenerDetalleVenta = async (id) => {
  try {
    if (!id) {
      throw new Error('El ID de la venta es obligatorio');
    }

    //console.log('🔍 Obteniendo detalle de venta:', id);

    const resp = await authApi.get(`/cobranza/ventas/${id}`);

    if (resp.data?.ok) {
      return {
        success: true,
        venta: resp.data.data,
        message: resp.data.message || 'Detalle obtenido correctamente'
      };
    } else {
      throw new Error(resp.data?.message || 'Error al obtener detalle de venta');
    }

  } catch (error) {
    console.error('❌ Error al obtener detalle de venta:', error);

    if (error.response?.status === 404) {
      throw new Error('Venta no encontrada');
    }

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
                        'Error al obtener detalle de venta. Intentá nuevamente.';

    throw new Error(errorMessage);
  }
};