import authApi from "../../../Api/authApi";

// src/Pages/Ceo/Helpers/ReportesMensuales.js (agregar al final)
export const editarVenta = async (ventaId, payload) => {
  try {
    const resp = await authApi.put(`/vtas/edit/${ventaId}`, payload);

    if (resp.data?.ok) {
      return {
        success: true,
        message: resp.data.message || 'Venta actualizada',
        data: resp.data.data
      };
    }
    throw new Error(resp.data?.message || 'Error al actualizar la venta');
  } catch (error) {
    console.error('❌ Error en editarVenta:', error);
    if (error.response?.status === 403) throw new Error('No tenés permisos para editar ventas');
    if (error.response?.status === 404) throw new Error('La venta ya no existe');
    if (error.response?.status === 400) throw new Error(error.response?.data?.message || 'Datos inválidos');
    throw new Error(error.response?.data?.message || error.message || 'Error al editar la venta');
  }
};