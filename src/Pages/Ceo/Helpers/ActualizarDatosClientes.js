// src/Dev/Helpers/actualizarCliente.js
import authApi from '../../../Api/authApi';

export const actualizarCliente = async (clienteData, setRefreshData, navigate) => {
  try {
    // Extraer el ID del cliente
    const { _id, ...datosActualizar } = clienteData;

    if (!_id) {
      throw new Error('ID de cliente no encontrado');
    }

    console.log('📤 Actualizando cliente:', datosActualizar);

    // Realizar la petición al backend
    const resp = await authApi.put(`/admin/update-clent/${_id}`, datosActualizar);

    if (resp.data?.ok) {
      // Recargar la lista
      if (setRefreshData) {
        setRefreshData(true);
      }

      return {
        success: true,
        message: resp.data.message || 'Cliente actualizado correctamente',
        cliente: resp.data.cliente,
        camposActualizados: resp.data.camposActualizados
      };
    } else {
      throw new Error(resp.data?.message || 'Error al actualizar el cliente');
    }

  } catch (error) {
    console.error('❌ Error en actualizarCliente:', error);

    // Manejo de errores por código HTTP
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    if (error.response?.status === 403) {
      throw new Error('No tenés permisos para editar este cliente.');
    }

    if (error.response?.status === 404) {
      throw new Error('Cliente no encontrado.');
    }

    if (error.response?.status === 400) {
      // Errores de validación del backend (DNI, CUIL o email duplicado)
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.errors?.[0]?.msg ||
                       'Datos inválidos. Verificá los campos.';
      throw new Error(errorMsg);
    }

    if (error.response?.status >= 500) {
      throw new Error('Error del servidor. Intentá nuevamente más tarde.');
    }

    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.msg || 
                        error.message ||
                        'Error al actualizar el cliente. Intentá nuevamente.';

    throw new Error(errorMessage);
  }
};