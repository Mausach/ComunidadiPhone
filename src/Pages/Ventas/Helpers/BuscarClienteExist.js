// Ventas/Helpers/buscarCliente.js
import authApi from "../../../Api/authApi";

export const buscarCliente = async (dni) => {
  try {
    if (!dni || dni.length !== 8) {
      throw new Error('El DNI debe tener 8 dígitos');
    }

    console.log('🔍 Buscando cliente con DNI:', dni);

    const resp = await authApi.get(`/vtas/buscar-cliente/${dni}`);

    console.log('📥 Respuesta del backend:', resp.data);

    if (resp.data?.ok && resp.data?.data) {
      return {
        success: true,
        cliente: resp.data.data,
        message: resp.data?.message || 'Cliente encontrado'
      };
    } else {
      throw new Error(resp.data?.message || 'Cliente no encontrado');
    }

  } catch (error) {
    console.error('❌ Error al buscar cliente:', error);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    if (error.response?.status === 404) {
      throw new Error('Cliente no encontrado. Verificá el DNI o creá un nuevo cliente.');
    }

    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'DNI inválido. Debe tener 8 dígitos.');
    }

    if (error.response?.status >= 500) {
      throw new Error('Error del servidor. Intentá nuevamente más tarde.');
    }

    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.msg || 
                        error.message ||
                        'Error al buscar el cliente. Intentá nuevamente.';

    throw new Error(errorMessage);
  }
};