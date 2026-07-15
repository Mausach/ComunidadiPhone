// Ventas/Helpers/crearVenta.js
import authApi from "../../../api/authApi";

export const crearVenta = async (ventaData) => {
  try {
    console.log('📦 Creando venta:', ventaData);

    const resp = await authApi.post('/vtas/ventas-procesar', ventaData);

    if (resp.data?.ok) {
      return {
        success: true,
        message: resp.data?.message || 'Venta creada exitosamente',
        data: resp.data?.data
      };
    } else {
      throw new Error(resp.data?.message || 'Error al crear la venta');
    }

  } catch (error) {
    console.error('❌ Error en crearVenta:', error);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    if (error.response?.status === 400) {
      const mensaje = error.response?.data?.message || 
                     error.response?.data?.errors?.[0]?.msg ||
                     'Datos inválidos. Verificá los campos.';
      throw new Error(mensaje);
    }

    if (error.response?.status === 409) {
      const mensaje = error.response?.data?.message || 'El IMEI ya está registrado en otra venta.';
      throw new Error(mensaje);
    }

    if (error.response?.status >= 500) {
      throw new Error('Error del servidor. Intentá nuevamente más tarde.');
    }

    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.msg || 
                        error.message ||
                        'Error al crear la venta. Intentá nuevamente.';

    throw new Error(errorMessage);
  }
};