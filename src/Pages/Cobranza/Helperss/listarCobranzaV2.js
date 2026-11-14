// Cobranza-v2/Helpers/listarCobranzaV2.js
import authApi from "../../../Api/authApi";

export const listarCobranzaV2 = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.dni) params.append('dni', filtros.dni);
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.localidad) params.append('localidad', filtros.localidad);
    
    // Filtramos solo ventas que tengan cuotas (sistema1, sistema2, plan_canje_cuotas)
    // El backend ya filtra por cuotas existentes en el service
    
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    
    if (filtros.pagina) params.append('pagina', filtros.pagina);
    if (filtros.limite) params.append('limite', filtros.limite);

    const url = `/cobranza/ventas${params.toString() ? '?' + params.toString() : ''}`;
    const resp = await authApi.get(url);

    if (resp.data?.ok) {
      return {
        success: true,
        ventas: resp.data.data || [],
        paginacion: resp.data.paginacion || {},
      };
    } else {
      throw new Error(resp.data?.message || 'Error al listar ventas');
    }

  } catch (error) {
    console.error('❌ Error al listar cobranza V2:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Sesión expirada.');
    }
    throw new Error(error.response?.data?.message || error.message || 'Error al cargar datos');
  }
};