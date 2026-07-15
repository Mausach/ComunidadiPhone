// Dev/Helpers/changeEstadoUsuario.js
import authApi from "../../../Api/authApi";

export const changeEstadoUsuario = async (user, setRefreshData, navigate) => {
  try {
    // Validar que tengamos el ID del usuario
    const userId = user._id || user.id;
    if (!userId) {
      throw new Error('ID de usuario no encontrado');
    }

    // El backend solo necesita el _id, él mismo alterna el estado
    const payload = {
      _id: userId
    };

    console.log('Cambiando estado del usuario:', {
      nombre: user.nombre,
      apellido: user.apellido,
      estadoActual: user.estado,
      nuevoEstado: !user.estado
    });

    // Realizar la petición al backend
    const resp = await authApi.put('/admin/change-state', payload);

    // Verificar respuesta
    if (resp.data?.ok) {
      // Actualizar el estado de refresh para recargar la lista
      if (setRefreshData) {
        setRefreshData(true);
      }

      return {
        success: true,
        message: resp.data?.msg || 'Estado del usuario actualizado correctamente',
        usuario: resp.data?.usuario,
        nuevoEstado: resp.data?.usuario?.estado
      };
    } else {
      throw new Error(resp.data?.msg || 'Error al cambiar el estado del usuario');
    }

  } catch (error) {
    console.error('Error en changeEstadoUsuario:', error);

    // Manejo de errores por código HTTP
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    if (error.response?.status === 403) {
      throw new Error('No tenés permisos para cambiar el estado de este usuario.');
    }

    if (error.response?.status === 404) {
      throw new Error('Usuario no encontrado.');
    }

    if (error.response?.status === 400) {
      const errorMsg = error.response?.data?.msg || 
                       error.response?.data?.errors?.[0]?.msg ||
                       'Datos inválidos para cambiar el estado.';
      throw new Error(errorMsg);
    }

    if (error.response?.status >= 500) {
      throw new Error('Error del servidor. Intentá nuevamente más tarde.');
    }

    // Mensaje genérico
    const errorMessage = error.response?.data?.msg || 
                        error.response?.data?.errors?.[0]?.msg || 
                        error.message ||
                        'Error al cambiar el estado del usuario. Intentá nuevamente.';

    throw new Error(errorMessage);
  }
};