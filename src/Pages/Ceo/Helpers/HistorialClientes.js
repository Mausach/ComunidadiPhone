// Agregar en src/Helpers/procesarReportes.js
//PROCESAR VENTAS HISTORIAL
/**
 * Filtra ventas por búsqueda (cliente, producto, localidad)
 */
export const buscarVentas = (ventas, busqueda) => {
  if (!busqueda || busqueda.trim() === '') return ventas;
  
  const termino = busqueda.toLowerCase().trim();
  
  return ventas.filter(venta => 
    venta.cliente.nombre.toLowerCase().includes(termino) ||
    venta.cliente.apellido.toLowerCase().includes(termino) ||
    venta.producto.toLowerCase().includes(termino) ||
    venta.localidad.toLowerCase().includes(termino)
  );
};

/**
 * Filtra ventas por conducta de pago
 */
export const filtrarPorConducta = (ventas, conducta) => {
  if (!conducta || conducta === 'todas') return ventas;
  return ventas.filter(v => v.conducta_pago === conducta);
};

/**
 * Filtra ventas por localidad
 */
export const filtrarVentasPorLocalidad = (ventas, localidad) => {
  if (!localidad || localidad === 'todas') return ventas;
  return ventas.filter(v => v.localidad === localidad);
};