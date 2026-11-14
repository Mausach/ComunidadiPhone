// Cobranza-v2/Helpers/calcularEstadisticas.js

// Cobranza-v2/Helpers/calcularEstadisticas.js

export const calcularEstadisticasMes = (ventas, mesString) => {
  let totalACobrar = 0;
  let totalCobrado = 0;
  let totalVencido = 0;
  let cuotasACobrar = 0;
  let cuotasCobradas = 0;
  let cuotasVencidas = 0;

  ventas.forEach(venta => {
    const c = venta.cuotas;
    if (!c || typeof c !== 'object') return;

    // El backend devuelve un OBJETO con contadores, no un array
    // { total, pagadas, pendientes, atrasadas }

    // COBRADO: cuotas pagadas y monto pagado
    const pagadas = c.pagadas || 0;
    if (pagadas > 0) {
      cuotasCobradas += pagadas;
      // Aproximación: monto pagado promedio por cuota pagada
      const montoPromedio = (venta.montoPagado || 0) / (pagadas || 1);
      totalCobrado += montoPromedio * pagadas;
    }

    // A COBRAR: pendientes + atrasadas (todas las que faltan pagar)
    const pendientes = c.pendientes || 0;
    const atrasadas = c.atrasadas || 0;
    cuotasACobrar += pendientes + atrasadas;
    totalACobrar += venta.montoPendiente || 0;

    // VENCIDO: solo las atrasadas
    if (atrasadas > 0) {
      cuotasVencidas += atrasadas;
      // Aproximación: monto pendiente proporcional a las atrasadas
      const montoPendientePorCuota = (venta.montoPendiente || 0) / (pendientes + atrasadas || 1);
      totalVencido += montoPendientePorCuota * atrasadas;
    }
  });

  const totalEsperado = totalCobrado + totalVencido;
  const efectividad = totalEsperado > 0 ? Math.round((totalCobrado / totalEsperado) * 100) : 0;

  return {
    aCobrar: { monto: totalACobrar, cuotas: cuotasACobrar },
    cobrado: { monto: totalCobrado, cuotas: cuotasCobradas },
    vencido: { monto: totalVencido, cuotas: cuotasVencidas },
    efectividad
  };
};