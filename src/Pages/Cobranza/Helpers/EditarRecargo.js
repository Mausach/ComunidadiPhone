// Cobranza/Helpers/EditarRecargoCuota.js
import authApi from "../../../Api/authApi";

export const editarRecargoCuota = async ({ idVenta, numeroCuota, nuevoMontoRecargo, usuario, motivo }) => {
  try {
    if (!idVenta) throw new Error('El ID de la venta es obligatorio');
    if (!numeroCuota) throw new Error('El número de cuota es obligatorio');
    if (nuevoMontoRecargo === undefined || nuevoMontoRecargo === null) throw new Error('El monto del recargo es obligatorio');
    if (nuevoMontoRecargo < 0) throw new Error('El recargo no puede ser negativo');
    if (!usuario?.nombre) throw new Error('El nombre del usuario es obligatorio');

    const payload = {
      nuevoMontoRecargo,
      usuario: { nombre: usuario.nombre },
      motivo: motivo || ''
    };

    const resp = await authApi.put(`/cobranza/cuotas/${idVenta}/${numeroCuota}/recargo`, payload);

    if (resp.data?.ok) {
      return {
        success: true,
        message: resp.data.message || 'Recargo actualizado exitosamente',
        data: resp.data.data
      };
    } else {
      throw new Error(resp.data?.message || 'Error al actualizar el recargo');
    }

  } catch (error) {
    console.error('❌ Error en editarRecargoCuota:', error);

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
                        'Error al actualizar el recargo de la cuota';

    throw new Error(errorMessage);
  }
};