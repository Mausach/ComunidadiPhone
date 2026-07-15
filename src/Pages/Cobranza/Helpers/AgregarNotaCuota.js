// Cobranza/Helpers/agregarNotaCuota.js

import authApi from "../../../Api/authApi";


export const agregarNotaCuota = async ({ idVenta, numeroCuota, texto, usuario }) => {
  try {
    if (!idVenta) throw new Error('El ID de la venta es obligatorio');
    if (!numeroCuota) throw new Error('El número de cuota es obligatorio');
    if (!texto || texto.trim() === '') throw new Error('El texto de la nota es obligatorio');
    if (!usuario?.nombre) throw new Error('El nombre del usuario es obligatorio');

    const payload = {
      texto: texto.trim(),
      usuario: { nombre: usuario.nombre }
    };

    const resp = await authApi.post(`/cobranza/cuotas/${idVenta}/${numeroCuota}/nota`, payload);

    if (resp.data?.ok) {
      return {
        success: true,
        message: resp.data.message || 'Nota agregada exitosamente',
        data: resp.data.data
      };
    } else {
      throw new Error(resp.data?.message || 'Error al agregar la nota');
    }

  } catch (error) {
    console.error('❌ Error en agregarNotaCuota:', error);

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
                        'Error al agregar la nota a la cuota';

    throw new Error(errorMessage);
  }
};