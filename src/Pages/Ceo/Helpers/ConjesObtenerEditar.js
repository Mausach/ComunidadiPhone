// src/Helpers/equipoCanjeApi.js

import authApi from "../../../Api/authApi";


export const obtenerEquipoCanjePorId = async (id) => {
  try {
    const resp = await authApi.get(`/canje/equipcanje/${id}`);
    return resp.data;
  } catch (error) {
    console.error('Error al obtener equipo canje:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener el equipo canje');
  }
};

export const editarEquipoCanje = async (id, data) => {
  try {
    const resp = await authApi.put(`/canje/edit-equipcanje/${id}`, data);
    return resp.data;
  } catch (error) {
    console.error('Error al editar equipo canje:', error);
    throw new Error(error.response?.data?.message || 'Error al editar el equipo canje');
  }
};