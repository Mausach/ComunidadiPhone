// Cobranza-v2/Helpers/obtenerPanelCobranza.js
import authApi from "../../../Api/authApi";


export const obtenerPanelCobranza = async ({ mes, nombre, localidad, tipoVenta, pagina, limite }) => {
  try {
    const params = new URLSearchParams();
    params.append('mes', mes);
    if (nombre) params.append('nombre', nombre);
    if (localidad) params.append('localidad', localidad);
    if (tipoVenta) params.append('tipoVenta', tipoVenta);
    if (pagina) params.append('pagina', pagina);
    if (limite) params.append('limite', limite);

    const url = `/cobranza/panel?${params.toString()}`;
    const resp = await authApi.get(url);

    if (resp.data?.ok) {
      return {
        success: true,
        resumen: resp.data.data.resumen || { aCobrar: 0, cobrado: 0, vencido: 0, efectividad: 0 },
        ventas: resp.data.data.ventas || [],
        contadoresTabs: resp.data.data.contadoresTabs || { porVencer: 0, cobradas: 0, enMora: 0, legal: 0 },
        pagosDestiempo: resp.data.data.pagosDestiempo || { resumen: { cantidadCuotas: 0, montoTotal: 0 }, detalle: [] },
        paginacion: resp.data.data.paginacion || {}
      };
    } else {
      throw new Error(resp.data?.message || 'Error al obtener panel de cobranza');
    }
  } catch (error) {
    console.error('❌ Error en obtenerPanelCobranza:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Sesión expirada.');
    }
    throw new Error(error.response?.data?.message || error.message || 'Error al cargar datos');
  }
};