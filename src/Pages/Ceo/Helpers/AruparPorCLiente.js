// Agregar en src/Helpers/procesarReportes.js

/**
 * Agrupa cuotas por venta para seguimiento por cliente
 * @param {Array} cuotas - Array de cuotas del backend
 * @returns {Array} - Ventas con resumen de cuotas
 */
export const agruparPorCliente = (cuotas) => {
  // Agrupar por idVenta
  const ventasMap = cuotas.reduce((acc, cuota) => {
    if (!acc[cuota.idVenta]) {
      acc[cuota.idVenta] = {
        idVenta: cuota.idVenta,
        cliente: cuota.cliente,
        localidad: cuota.localidad,
        producto: cuota.producto,
        tipoVenta: cuota.tipoVenta,
        cuotas: [],
        resumenVenta: {
          totalCuotas: 0,
          pagadas: 0,
          pendientes: 0,
          noPagadas: 0,
          montoTotal: 0,
          montoPagado: 0,
          montoPendiente: 0,
          montoVencido: 0
        }
      };
    }

    // Agregar cuota
    acc[cuota.idVenta].cuotas.push(cuota);
    
    // Actualizar resumen
    const resumen = acc[cuota.idVenta].resumenVenta;
    resumen.totalCuotas += 1;
    resumen.montoTotal += cuota.montoCuota;

    if (cuota.estadoCuota === 'pagada') {
      resumen.pagadas += 1;
      resumen.montoPagado += cuota.montoCuota;
    } else if (cuota.estadoCuota === 'pendiente') {
      resumen.pendientes += 1;
      resumen.montoPendiente += cuota.montoCuota;
    } else if (cuota.estadoCuota === 'no pagada') {
      resumen.noPagadas += 1;
      resumen.montoVencido += cuota.montoCuota;
    }

    return acc;
  }, {});

  // Convertir a array y ordenar por apellido del cliente
  return Object.values(ventasMap).sort((a, b) => 
    a.cliente.apellido.localeCompare(b.cliente.apellido)
  );
};

/**
 * Busca un cliente por nombre o apellido
 * @param {Array} ventas - Array de ventas agrupadas
 * @param {string} busqueda - Texto de búsqueda
 * @returns {Array} - Ventas filtradas
 */
export const buscarCliente = (ventas, busqueda) => {
  if (!busqueda || busqueda.trim() === '') return ventas;
  
  const termino = busqueda.toLowerCase().trim();
  
  return ventas.filter(venta => 
    venta.cliente.nombre.toLowerCase().includes(termino) ||
    venta.cliente.apellido.toLowerCase().includes(termino) ||
    venta.producto.toLowerCase().includes(termino) ||
    venta.localidad.toLowerCase().includes(termino)
  );
};