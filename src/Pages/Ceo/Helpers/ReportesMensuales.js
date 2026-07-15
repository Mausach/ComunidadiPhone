import authApi from "../../../Api/authApi";

// src/Helpers/reportesApi.js

/**
 * Obtiene reporte de cobranza mensual
 * @param {number} mes - Mes (1-12)
 * @param {number} anio - Año (YYYY)
 */
export const obtenerCobranzaMensual = async (mes, anio) => {
  try {
    const resp = await authApi.get('/rep_ceo/cobranza-mensual', {
      params: { mes, anio }
    });
    return resp.data;
  } catch (error) {
    console.error('Error al obtener cobranza mensual:', error);
    throw new Error(
      error.response?.data?.msg || 'Error al cargar el reporte de cobranza mensual'
    );
  }
};

/**
 * Obtiene historial completo de cuotas por venta
 */
export const obtenerHistorialCuotas = async () => {
  try {
    const resp = await authApi.get('/rep_ceo/historial-cuotas');
    return resp.data;
  } catch (error) {
    console.error('Error al obtener historial de cuotas:', error);
    throw new Error(
      error.response?.data?.msg || 'Error al cargar el historial de cuotas'
    );
  }
};

// Agregar en src/Helpers/reportesApi.js

/**
 * Obtiene reporte de equipos canjeados
 */
export const obtenerEquiposCanjeados = async () => {
  try {
    const resp = await authApi.get('/rep_ceo/equipos-canjeados');
    return resp.data;
  } catch (error) {
    console.error('Error al obtener equipos canjeados:', error);
    throw new Error(
      error.response?.data?.msg || 'Error al cargar el reporte de equipos canjeados'
    );
  }
};