// src/Helpers/stockApi.js
import authApi from "../../../Api/authApi";

const BASE = '/inv';

/**
 * 📋 Listar stock (con filtros y paginación)
 * @param {Object} filtros - { disponible, estado, nombre, modelo, imei, pagina, limite }
 */
export const listarStock = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.modelo) params.append('modelo', filtros.modelo);
    if (filtros.imei) params.append('imei', filtros.imei);
    if (filtros.estado && filtros.estado !== 'todas') params.append('estado', filtros.estado);
    if (filtros.disponible !== undefined && filtros.disponible !== '' && filtros.disponible !== 'todas') {
      params.append('disponible', filtros.disponible);
    }
    if (filtros.pagina) params.append('pagina', filtros.pagina);
    if (filtros.limite) params.append('limite', filtros.limite);
    // Si no se especifica límite, pedimos 50 (para "Cargar más")
    params.append('limite', filtros.limite || 50);

    const url = `${BASE}/stock${params.toString() ? '?' + params.toString() : ''}`;
    const resp = await authApi.get(url);
    return resp.data;
  } catch (error) {
    console.error('Error al listar stock:', error);
    throw new Error(error.response?.data?.message || error.response?.data?.msg || 'Error al cargar el stock');
  }
};

export const obtenerStockPorId = async (id) => {
  try {
    const resp = await authApi.get(`${BASE}/stock/${id}`);
    return resp.data;
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener el equipo');
  }
};

export const crearEquipo = async (data) => {
  try {
    const resp = await authApi.post(`${BASE}/new-equipo`, data);
    return resp.data;
  } catch (error) {
    console.error('Error al crear equipo:', error);
    throw new Error(error.response?.data?.message || 'Error al crear el equipo');
  }
};

export const editarEquipo = async (id, data) => {
  try {
    const resp = await authApi.put(`${BASE}/edit-equipo/${id}`, data);
    return resp.data;
  } catch (error) {
    console.error('Error al editar equipo:', error);
    throw new Error(error.response?.data?.message || 'Error al editar el equipo');
  }
};

export const eliminarEquipo = async (id) => {
  try {
    const resp = await authApi.delete(`${BASE}/del-equipo/${id}`);
    return resp.data;
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar el equipo');
  }
};