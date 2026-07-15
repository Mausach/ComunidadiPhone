// src/Helpers/procesarReportes.js

/**
 * Extrae las localidades únicas de las cuotas
 * @param {Array} cuotas - Array de cuotas del backend
 * @returns {Array} - Array de localidades ordenadas
 */
export const extraerLocalidades = (cuotas) => {
  const localidades = cuotas
    .map(c => c.localidad)
    .filter((loc, index, arr) => loc && arr.indexOf(loc) === index)
    .sort((a, b) => a.localeCompare(b));
  
  return localidades;
};

/**
 * Filtra cuotas por localidad
 * @param {Array} cuotas - Array de cuotas
 * @param {string} localidad - Localidad a filtrar
 * @returns {Array} - Cuotas filtradas
 */
export const filtrarPorLocalidad = (cuotas, localidad) => {
  if (!localidad || localidad === 'todas') return cuotas;
  return cuotas.filter(c => c.localidad === localidad);
};

/**
 * Calcula el resumen de cuotas (totales por estado)
 * @param {Array} cuotas - Array de cuotas
 * @returns {Object} - Resumen con totales
 */
export const calcularResumen = (cuotas) => {
  return cuotas.reduce((acc, cuota) => {
    acc.totalCuotas += 1;
    acc.montoTotal += cuota.montoCuota;

    if (cuota.estadoCuota === 'pagada') {
      acc.pagadas.cantidad += 1;
      acc.pagadas.monto += cuota.montoCuota;
    } else if (cuota.estadoCuota === 'pendiente') {
      acc.pendientes.cantidad += 1;
      acc.pendientes.monto += cuota.montoCuota;
    } else if (cuota.estadoCuota === 'no pagada') {
      acc.noPagadas.cantidad += 1;
      acc.noPagadas.monto += cuota.montoCuota;
    }

    return acc;
  }, {
    totalCuotas: 0,
    montoTotal: 0,
    pagadas: { cantidad: 0, monto: 0 },
    pendientes: { cantidad: 0, monto: 0 },
    noPagadas: { cantidad: 0, monto: 0 }
  });
};

/**
 * Agrupa cuotas por estado para mostrarlas en secciones
 * @param {Array} cuotas - Array de cuotas
 * @returns {Object} - Cuotas agrupadas por estado
 */
export const agruparPorEstado = (cuotas) => {
  return {
    pagadas: cuotas.filter(c => c.estadoCuota === 'pagada'),
    pendientes: cuotas.filter(c => c.estadoCuota === 'pendiente'),
    noPagadas: cuotas.filter(c => c.estadoCuota === 'no pagada')
  };
};



/**
 * Detecta la frecuencia de pago según el intervalo entre cuotas
 * @param {Array} cuotas - Array de cuotas ordenadas por número
 * @returns {string} - Frecuencia detectada
 */
export const detectarFrecuencia = (cuotas) => {
  if (cuotas.length < 2) return 'mensual'; // Por defecto
  
  const ordenadas = [...cuotas].sort((a, b) => a.numeroCuota - b.numeroCuota);
  
  // Buscar el primer par de cuotas consecutivas con fechas
  for (let i = 0; i < ordenadas.length - 1; i++) {
    const fecha1 = new Date(ordenadas[i].fechaCobro);
    const fecha2 = new Date(ordenadas[i + 1].fechaCobro);
    
    if (fecha1 && fecha2) {
      const diffDias = Math.round((fecha2 - fecha1) / (1000 * 60 * 60 * 24));
      
      if (diffDias <= 2) return 'diario';
      if (diffDias <= 9) return 'semanal';
      if (diffDias <= 18) return 'quincenal';
      return 'mensual';
    }
  }
  
  return 'mensual';
};

/**
 * Agrega la frecuencia detectada a cada venta
 * @param {Array} ventas - Array de ventas del historial
 * @returns {Array} - Ventas con frecuencia agregada
 */
export const agregarFrecuenciaAVentas = (ventas) => {
  return ventas.map(venta => ({
    ...venta,
    frecuencia: detectarFrecuencia(venta.detalleCuotas)
  }));
};