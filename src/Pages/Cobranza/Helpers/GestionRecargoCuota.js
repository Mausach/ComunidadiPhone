// src/Pages/Cobranza/Helpers/Recargos.js
import authApi from "../../../Api/authApi";

const BASE = '/cobranza'; // Ajusta al prefijo que uses para las rutas de cobranza

/**
 * ✏️ Editar un recargo existente
 */
export const editarRecargoCuota = async (idVenta, numeroCuota, idRecargo, data) => {
  try {
    const resp = await authApi.put(`${BASE}/${idVenta}/${numeroCuota}/recargo/${idRecargo}`, data);
    return resp.data;
  } catch (error) {
    console.error('Error al editar recargo:', error);
    throw new Error(error.response?.data?.message || 'Error al editar el recargo');
  }
};

/**
 * 🗑️ Eliminar un recargo existente
 */
export const eliminarRecargoCuota = async (idVenta, numeroCuota, idRecargo, motivoEliminacion, usuario) => {
  try {
    const resp = await authApi.delete(`${BASE}/${idVenta}/${numeroCuota}/recargo/${idRecargo}`, {
      data: { 
        motivo: motivoEliminacion,
        usuario: { nombre: usuario } 
      }
    });
    return resp.data;
  } catch (error) {
    console.error('Error al eliminar recargo:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar el recargo');
  }
};