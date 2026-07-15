// Dev/Helpers/actualizarUsuario.js
import authApi from "../../../Api/authApi";

export const actualizarUsuario = async (userData, setRefreshData, navigate) => {
  try {
    // Extraer el ID del usuario
    const { _id, ...datosActualizar } = userData;

    // Validar que tengamos el ID
    if (!_id) {
      throw new Error('ID de usuario no encontrado',_id);
    }

    // Preparar los datos para enviar (solo los campos que vienen del formulario)
    const payload = {
      _id,
      nombre: datosActualizar.nombre || '',
      apellido: datosActualizar.apellido || '',
      nombre_fam: datosActualizar.nombre_fam || '',
      apellido_fam: datosActualizar.apellido_fam || '',
      dni: datosActualizar.dni || '',
      cuil: datosActualizar.cuil || '',
      localidad: datosActualizar.localidad || '',
      email: datosActualizar.email || '',
      telefono: datosActualizar.telefono || '',
      telefonoSecundario: datosActualizar.telefonoSecundario || '',
      direccion: datosActualizar.direccion || '',
      direccionSecundaria: datosActualizar.direccionSecundaria || '',
      rol: datosActualizar.rol || 'ventas',
      monotributo: datosActualizar.monotributo || false,
      estado: datosActualizar.estado !== undefined ? datosActualizar.estado : true,
      // Si hay password, se incluye (aunque en este modal no se edita)
      // password: datosActualizar.password || undefined
    };

    console.log('Enviando datos al backend:', payload);

    // Realizar la petición al backend
    const resp = await authApi.put('/admin/update-user', payload);

    // Verificar respuesta
    if (resp.data?.ok) {
      // Actualizar el estado de refresh para recargar la lista
      if (setRefreshData) {
        setRefreshData(true);
      }

      return {
        success: true,
        message: resp.data.msg || 'Usuario actualizado correctamente',
        usuario: resp.data.usuario,
        camposActualizados: resp.data.camposActualizados
      };
    } else {
      throw new Error(resp.data?.msg || 'Error al actualizar el usuario');
    }

  } catch (error) {
    console.error('Error en actualizarUsuario:', error);

    // Manejo de errores por código HTTP
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    if (error.response?.status === 403) {
      throw new Error('No tenés permisos para editar este usuario.');
    }

    if (error.response?.status === 404) {
      throw new Error('Usuario no encontrado.');
    }

    if (error.response?.status === 400) {
      // Errores de validación del backend
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
                        'Error al actualizar el usuario. Intentá nuevamente.';

    throw new Error(errorMessage);
  }
};