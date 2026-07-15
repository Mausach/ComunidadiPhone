// Cobranza/Helpers/editarMontoCuota.js
import authApi from "../../../api/authApi";

export const editarMontoCuota = async ({ idVenta, numeroCuota, nuevoMonto, usuario, motivo }) => {
  try {
    if (!idVenta) throw new Error('El ID de la venta es obligatorio');
    if (!numeroCuota) throw new Error('El número de cuota es obligatorio');
    if (!nuevoMonto || nuevoMonto <= 0) throw new Error('El nuevo monto debe ser mayor a 0');
    if (!usuario?.nombre) throw new Error('El nombre del usuario es obligatorio');

    const payload = {
      nuevoMonto,
      usuario: { nombre: usuario.nombre },
      motivo: motivo || ''
    };

    const resp = await authApi.put(`/cobranza/cuotas/${idVenta}/${numeroCuota}/monto`, payload);

    if (resp.data?.ok) {
      return {
        success: true,
        message: resp.data.message || 'Monto actualizado exitosamente',
        data: resp.data.data
      };
    } else {
      throw new Error(resp.data?.message || 'Error al actualizar el monto');
    }

  } catch (error) {
    console.error('❌ Error en editarMontoCuota:', error);

    if (error.response?.status === 404) {
      throw new Error('Venta o cuota no encontrada');
    }

    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Datos inválidos');
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    const errorMessage = error.response?.data?.message || 
                        error.message ||
                        'Error al actualizar el monto de la cuota';

    throw new Error(errorMessage);
  }
};