// Dev/Helpers/crearUsuario.js
import authApi from "../../../Api/authApi";

export const crearUsuario = async (userData, setRefreshData, navigate) => {
  try {
    // Validar datos obligatorios
    if (!userData.nombre || !userData.apellido || !userData.dni || 
        !userData.email || !userData.telefono) {
      throw new Error('Todos los campos marcados con * son obligatorios');
    }

    console.log('Creando usuario:', userData);

    // Realizar la petición al backend
    const resp = await authApi.post('/admin/new-user', userData);

    // Verificar respuesta
    if (resp.data?.ok) {
      // Actualizar el estado de refresh para recargar la lista
      if (setRefreshData) {
        setRefreshData(true);
      }

      return {
        success: true,
        message: resp.data?.msg || 'Usuario creado exitosamente',
        usuario: resp.data?.usuario
      };
    } else {
      throw new Error(resp.data?.msg || 'Error al crear el usuario');
    }

  } catch (error) {
    console.error('Error en crearUsuario:', error);

    // Manejo de errores por código HTTP
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    if (error.response?.status === 403) {
      throw new Error('No tenés permisos para crear usuarios.');
    }

    if (error.response?.status === 400) {
      const errorMsg = error.response?.data?.msg || 
                       error.response?.data?.errors?.[0]?.msg ||
                       'Datos inválidos. Verificá los campos.';
      throw new Error(errorMsg);
    }

    if (error.response?.status >= 500) {
      throw new Error('Error del servidor. Intentá nuevamente más tarde.');
    }

    // Mensaje genérico
    const errorMessage = error.response?.data?.msg || 
                        error.response?.data?.errors?.[0]?.msg || 
                        error.message ||
                        'Error al crear el usuario. Intentá nuevamente.';

    throw new Error(errorMessage);
  }
};