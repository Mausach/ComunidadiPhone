// Cobranza-v2/Helpers/obtenerCobrosRecibidos.js
import authApi from "../../../Api/authApi";

export const obtenerCobrosRecibidos = async ({ mes, pagina = 1, limite = 50 }) => {
  try {
    const params = new URLSearchParams();
    params.append('mes', mes);
    params.append('pagina', pagina);
    params.append('limite', limite);

    const url = `/cobranza/cobros-recibidos?${params.toString()}`;
    const resp = await authApi.get(url);

    if (resp.data?.ok) {
      return {
        success: true,
        totalRecibido: resp.data.data.totalRecibido || 0,
        cantidadCuotas: resp.data.data.cantidadCuotas || 0,
        cuotas: resp.data.data.cuotas || [],
        paginacion: resp.data.data.paginacion || {}
      };
    } else {
      throw new Error(resp.data?.message || 'Error al obtener cobros recibidos');
    }
  } catch (error) {
    console.error('❌ Error en obtenerCobrosRecibidos:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Sesión expirada.');
    }
    throw new Error(error.response?.data?.message || error.message || 'Error al cargar datos');
  }
};