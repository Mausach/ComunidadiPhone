// Cobranza/Helpers/cobrarCuotas.js
import authApi from "../../../Api/authApi";

export const cobrarCuotas = async (data) => {
  try {
    // Validaciones básicas
    if (!data.idVenta) {
      throw new Error('El ID de la venta es obligatorio');
    }

    if (!data.cuotas || !Array.isArray(data.cuotas) || data.cuotas.length === 0) {
      throw new Error('Debe especificar al menos una cuota para cobrar');
    }

    if (!data.cobrador || !data.cobrador.nombre) {
      throw new Error('El nombre del cobrador es obligatorio');
    }

    // Validar cada cuota
    for (const cuota of data.cuotas) {
      if (!cuota.numeroCuota) {
        throw new Error('Cada cuota debe tener un número de cuota');
      }
      if (!cuota.montoPagado || cuota.montoPagado <= 0) {
        throw new Error(`La cuota ${cuota.numeroCuota} debe tener un monto mayor a 0`);
      }
      if (!cuota.metodoPago) {
        throw new Error(`La cuota ${cuota.numeroCuota} debe tener un método de pago`);
      }
    }


    const resp = await authApi.post('/cobranza/cobrar-cuotas', data);

    if (resp.data?.ok) {
      return {
        success: true,
        message: resp.data.message || 'Cuotas cobradas exitosamente',
        data: resp.data.data
      };
    } else {
      throw new Error(resp.data?.message || 'Error al cobrar las cuotas');
    }

  } catch (error) {
    console.error('❌ Error al cobrar cuotas:', error);

    if (error.response?.status === 404) {
      throw new Error('Venta no encontrada');
    }

    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Datos inválidos para el cobro');
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    if (error.response?.status >= 500) {
      throw new Error('Error del servidor. Intentá nuevamente más tarde.');
    }

    const errorMessage = error.response?.data?.message || 
                        error.message ||
                        'Error al cobrar las cuotas. Intentá nuevamente.';

    throw new Error(errorMessage);
  }
};