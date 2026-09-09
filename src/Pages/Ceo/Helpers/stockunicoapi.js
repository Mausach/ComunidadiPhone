// src/Helpers/equiposApi.js
import authApi from "../../../Api/authApi";

const BASE = '/inve'; // Ajusta según tu configuración

/**
 * 📋 Listar equipos unificados (stock + canje)
 * @param {Object} filtros - { origen, disponible, estado, nombre, modelo, capacidad, imei, localidad, desde, hasta, pagina, limite }
 */
export const listarEquipos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Filtros principales
    if (filtros.origen && filtros.origen !== 'todos') params.append('origen', filtros.origen);
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.modelo) params.append('modelo', filtros.modelo);
    if (filtros.capacidad) params.append('capacidad', filtros.capacidad);
    if (filtros.imei) params.append('imei', filtros.imei);
    if (filtros.localidad && filtros.localidad !== 'todas') params.append('localidad', filtros.localidad);
    
    // Estado y disponibilidad
    if (filtros.estado && filtros.estado !== 'todos') params.append('estado', filtros.estado);
    if (filtros.disponible !== undefined && filtros.disponible !== '' && filtros.disponible !== 'todas') {
      params.append('disponible', filtros.disponible);
    }
    
    // Fechas
    if (filtros.desde) params.append('desde', filtros.desde);
    if (filtros.hasta) params.append('hasta', filtros.hasta);
    
    // Paginación
    if (filtros.pagina) params.append('pagina', filtros.pagina);
    params.append('limite', filtros.limite || 20);

    const url = `${BASE}/equipos${params.toString() ? '?' + params.toString() : ''}`;
    const resp = await authApi.get(url);
    return resp.data;
  } catch (error) {
    console.error('Error al listar equipos:', error);
    throw new Error(error.response?.data?.message || error.response?.data?.msg || 'Error al cargar los equipos');
  }
};

/**
 * 🔍 Obtener un equipo por ID
 */
export const obtenerEquipoPorId = async (id) => {
  try {
    const resp = await authApi.get(`${BASE}/equipos/${id}`);
    return resp.data;
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener el equipo');
  }
};

/**
 * 📥 Crear equipo de stock (origen: 'stock')
 */
export const crearEquipoStock = async (data) => {
  try {
    const resp = await authApi.post(`${BASE}/new-equipo`, data);
    return resp.data;
  } catch (error) {
    console.error('Error al crear equipo de stock:', error);
    throw new Error(error.response?.data?.message || 'Error al crear el equipo');
  }
};

/**
 * 🔄 Crear equipo de canje (origen: 'canje')
 */
export const crearEquipoCanje = async (data) => {
  try {
    const resp = await authApi.post(`${BASE}/new-canje`, data);
    return resp.data;
  } catch (error) {
    console.error('Error al crear equipo de canje:', error);
    throw new Error(error.response?.data?.message || 'Error al crear el equipo de canje');
  }
};

/**
 * ✏️ Editar equipo (stock o canje)
 */
export const editarEquipo = async (id, data) => {
  try {
    const resp = await authApi.put(`${BASE}/edit-equipo/${id}`, data);
    return resp.data;
  } catch (error) {
    console.error('Error al editar equipo:', error);
    throw new Error(error.response?.data?.message || 'Error al editar el equipo');
  }
};

/**
 * 🗑️ Eliminar equipo
 */
export const eliminarEquipo = async (id) => {
  try {
    const resp = await authApi.delete(`${BASE}/del-equipo/${id}`);
    return resp.data;
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar el equipo');
  }
};