// Cobranza/Helpers/cambiarEstadoCuota.js
import authApi from "../../../Api/authApi";

export const cambiarEstadoCuota = async ({ 
  idVenta, 
  numeroCuota, 
  nuevoEstado, 
  usuario, 
  motivo, 
  metodoPago,
  montoParcial   
}) => {
  try {
    if (!idVenta) throw new Error('El ID de la venta es obligatorio');
    if (!numeroCuota) throw new Error('El número de cuota es obligatorio');
    if (!nuevoEstado) throw new Error('El nuevo estado es obligatorio');
    if (!usuario?.nombre) throw new Error('El nombre del usuario es obligatorio');

    const estadosValidos = ["pagada", "pendiente", "pago parcial", "no pagada"];
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error(`Estado no válido. Debe ser: ${estadosValidos.join(', ')}`);
    }

    const payload = {
      nuevoEstado,
      usuario: { nombre: usuario.nombre },
      motivo: motivo || ''
    };

    // Agregar método de pago si corresponde
    if (nuevoEstado === 'pagada' || nuevoEstado === 'pago parcial') {
      payload.metodoPago = metodoPago || 'efectivo';
    }

    // Agregar monto parcial si es pago parcial
    if (nuevoEstado === 'pago parcial') {
      payload.montoParcial = parseFloat(montoParcial) || 0;
    }


    const resp = await authApi.put(`/cobranza/cuotas/${idVenta}/${numeroCuota}/estado`, payload);

    if (resp.data?.ok) {
      return {
        success: true,
        message: resp.data.message || 'Estado actualizado exitosamente',
        data: resp.data.data
      };
    } else {
      throw new Error(resp.data?.message || 'Error al actualizar el estado');
    }

  } catch (error) {
    console.error('❌ Error en cambiarEstadoCuota:', error);

    if (error.response?.status === 404) {
      throw new Error('Venta o cuota no encontrada');
    }

    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Datos inválidos');
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    const errorMessage = error.response?.data?.message || 
                        error.message ||
                        'Error al cambiar el estado de la cuota';

    throw new Error(errorMessage);
  }
};