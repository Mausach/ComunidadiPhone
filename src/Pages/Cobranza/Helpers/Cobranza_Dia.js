import authApi from "../../../api/authApi";


/**
 * Obtiene las cobranzas del día
 */
export const obtenerCobranzasDelDia = async () => {
  try {
    const resp = await authApi.get('/cobranza/cobranzas-hoy');
    return resp.data;
  } catch (error) {
    console.error('Error al obtener cobranzas del día:', error);
    throw new Error(
      error.response?.data?.message || 'Error al cargar las cobranzas del día'
    );
  }
};