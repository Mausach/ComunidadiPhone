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

/**
 * 🆕 Listar equipos disponibles (stock + canje)
 * @param {Object} filtros - { localidad, nombre, modelo, imei, estado, origen, pagina, limite }
 */
export const listarEquiposDisponibles = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.localidad) params.append('localidad', filtros.localidad);
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.modelo) params.append('modelo', filtros.modelo);
    if (filtros.imei) params.append('imei', filtros.imei);
    if (filtros.estado && filtros.estado !== 'todas') params.append('estado', filtros.estado);
    if (filtros.origen && filtros.origen !== 'todas') params.append('origen', filtros.origen);
    if (filtros.pagina) params.append('pagina', filtros.pagina);
    if (filtros.limite) params.append('limite', filtros.limite);

    const url = `/rep_ceo/equipos-disp${params.toString() ? '?' + params.toString() : ''}`;
    const resp = await authApi.get(url);
    return resp.data;
  } catch (error) {
    console.error('Error al listar equipos disponibles:', error);
    throw new Error(
      error.response?.data?.message || error.response?.data?.msg || 'Error al cargar los equipos disponibles'
    );
  }
  };

  /**
 * 🆕 Listar ventas de contado (sin cuotas)
 * @param {Object} filtros - { dni, nombre, fechaDesde, fechaHasta, localidad, tipoVenta, vendedor, pagina, limite }
 */
export const listarVentasContado = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.dni) params.append('dni', filtros.dni);
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.localidad) params.append('localidad', filtros.localidad);
    if (filtros.tipoVenta) params.append('tipoVenta', filtros.tipoVenta);
    if (filtros.vendedor) params.append('vendedor', filtros.vendedor);
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros.pagina) params.append('pagina', filtros.pagina);
    if (filtros.limite) params.append('limite', filtros.limite);

    const url = `/rep_ceo/ventas-contado${params.toString() ? '?' + params.toString() : ''}`;
    const resp = await authApi.get(url);
    return resp.data;
  } catch (error) {
    console.error('Error al listar ventas de contado:', error);
    throw new Error(
      error.response?.data?.message || error.response?.data?.msg || 'Error al cargar las ventas de contado'
    );
  }
};

//para los reportes

// src/Helpers/reportesApi.js
export const obtenerResumenGeneral = async () => {
  try {
    const resp = await authApi.get('/rep_ceo/resumen-general');
    return resp.data;
  } catch (error) {
    console.error('Error al obtener resumen general:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar el resumen general');
  }
};

// En reportesApi.js
export const obtenerVentasFinanciadas = async (anio) => {
  try {
    const resp = await authApi.get('/rep_ceo/ventas-financiadas', {
      params: { anio }
    });
    return resp.data;
  } catch (error) {
    console.error('Error al obtener ventas financiadas:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar el reporte');
  }
};

// En reportesApi.js
export const obtenerVentasDirectasCanje = async () => {
  try {
    const resp = await authApi.get('/rep_ceo/ventas-directas-canje');
    return resp.data;
  } catch (error) {
    console.error('Error al obtener ventas directas:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar el reporte');
  }
};

// En reportesApi.js
export const listarClientesReporte = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.activo) params.append('activo', filtros.activo);
    if (filtros.situacionCrediticia) params.append('situacionCrediticia', filtros.situacionCrediticia);
    if (filtros.pagina) params.append('pagina', filtros.pagina);
    if (filtros.limite) params.append('limite', filtros.limite);

    const url = `/rep_ceo/clientes${params.toString() ? '?' + params.toString() : ''}`;
    const resp = await authApi.get(url);
    return resp.data;
  } catch (error) {
    console.error('Error al listar clientes:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar los clientes');
  }
};

// En reportesApi.js
export const obtenerReporteGastos = async (anio) => {
  try {
    const resp = await authApi.get('/rep_ceo/gastos', {
      params: { anio }
    });
    return resp.data;
  } catch (error) {
    console.error('Error al obtener reporte de gastos:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar el reporte');
  }
};

export const registrarGasto = async (data) => {
  try {
    const resp = await authApi.post('/rep_ceo/new-gastos', data);
    return resp.data;
  } catch (error) {
    console.error('Error al registrar gasto:', error);
    throw new Error(error.response?.data?.message || 'Error al registrar el gasto');
  }
};