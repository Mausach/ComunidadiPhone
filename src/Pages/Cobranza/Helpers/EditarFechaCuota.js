// Cobranza/Helpers/editarFechaCuota.js
import authApi from "../../../Api/authApi";

export const editarFechaCuota = async ({ idVenta, numeroCuota, nuevaFecha, usuario, motivo }) => {
  try {
    if (!idVenta) throw new Error('El ID de la venta es obligatorio');
    if (!numeroCuota) throw new Error('El número de cuota es obligatorio');
    if (!nuevaFecha) throw new Error('La nueva fecha es obligatoria');
    if (!usuario?.nombre) throw new Error('El nombre del usuario es obligatorio');

    const payload = {
      nuevaFecha,
      usuario: { nombre: usuario.nombre },
      motivo: motivo || ''
    };

    const resp = await authApi.put(`/cobranza/cuotas/${idVenta}/${numeroCuota}/fecha`, payload);

    if (resp.data?.ok) {
      return {
        success: true,
        message: resp.data.message || 'Fecha actualizada exitosamente',
        data: resp.data.data
      };
    } else {
      throw new Error(resp.data?.message || 'Error al actualizar la fecha');
    }

  } catch (error) {
    console.error('❌ Error en editarFechaCuota:', error);

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
                        'Error al actualizar la fecha de la cuota';

    throw new Error(errorMessage);
  }
};