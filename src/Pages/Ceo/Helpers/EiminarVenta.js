import authApi from "../../../Api/authApi";

// src/Pages/Ceo/Helpers/ReportesMensuales.js (agregar al final)
export const eliminarVenta = async (ventaId) => {
  try {
    const resp = await authApi.delete(`/vtas/del/${ventaId}`);

    if (resp.data?.ok) {
      return {
        success: true,
        message: resp.data.message || 'Venta eliminada',
        data: resp.data.data // Resumen de lo que se liberó/desvinculó
      };
    }
    throw new Error(resp.data?.message || 'Error al eliminar la venta');
  } catch (error) {
    console.error('❌ Error en eliminarVenta:', error);

    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('No tenés permisos para eliminar ventas');
    }
    if (error.response?.status === 404) {
      throw new Error('La venta ya no existe o fue eliminada');
    }
    if (error.response?.status >= 500) {
      throw new Error('Error del servidor. Intentá nuevamente más tarde.');
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Error al eliminar la venta'
    );
  }
};