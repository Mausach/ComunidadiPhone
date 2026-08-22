// Cobranza/Helpers/AgregarRecargoCuota.js
import authApi from "../../../Api/authApi";

export const agregarRecargoCuota = async ({ idVenta, numeroCuota, montoRecargo, motivo, porcentajeAplicado, usuario }) => {
  try {
    if (!idVenta) throw new Error('El ID de la venta es obligatorio');
    if (!numeroCuota) throw new Error('El número de cuota es obligatorio');
    if (!montoRecargo || montoRecargo <= 0) throw new Error('El monto del recargo debe ser mayor a 0');
    if (!motivo || motivo.trim() === '') throw new Error('El motivo del recargo es obligatorio');
    if (!usuario?.nombre) throw new Error('El nombre del usuario es obligatorio');

    const payload = {
      montoRecargo,
      motivo,
      porcentajeAplicado: porcentajeAplicado || 0,
      usuario: { nombre: usuario.nombre }
    };

    const resp = await authApi.post(`/cobranza/cuotas/${idVenta}/${numeroCuota}/recargo`, payload);

    if (resp.data?.ok) {
      return {
        success: true,
        message: resp.data.message || 'Recargo agregado exitosamente',
        data: resp.data.data
      };
    } else {
      throw new Error(resp.data?.message || 'Error al agregar el recargo');
    }

  } catch (error) {
    console.error('❌ Error en agregarRecargoCuota:', error);

    if (error.response?.status === 404) throw new Error('Venta o cuota no encontrada');
    if (error.response?.status === 400) throw new Error(error.response?.data?.message || 'Datos inválidos');

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    throw new Error(error.response?.data?.message || error.message || 'Error al agregar el recargo');
  }
};