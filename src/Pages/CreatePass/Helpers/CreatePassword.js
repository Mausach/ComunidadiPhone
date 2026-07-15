import authApi from "../../../Api/AuthApi";

export const setupPassword = async (newPassword, navigate) => {
  try {
    // 1. Obtener el token guardado en localStorage (igual que starLogin)
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No se encontró el token de configuración. Reiniciá el proceso.');
    }

    // 2. Asegurar que el token esté configurado en axios
    authApi.defaults.headers.common['x-token'] = token;

    // 3. Realizar petición al backend para establecer la contraseña
    const resp = await authApi.post('/auth/setup-password', 
      { password: newPassword }
    );

    // 4. Limpiar datos temporales después del éxito
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete authApi.defaults.headers.common['x-token'];

    // 5. Retornar éxito
    return {
      success: true,
      message: resp.data?.msg || 'Contraseña configurada exitosamente. Ya podés iniciar sesión.'
    };

  } catch (error) {
    // 6. Manejo de errores (mismo estilo que starLogin)
    const errorMessage = error.response?.data?.msg || 
                        error.response?.data?.errors?.[0]?.msg || 
                        error.message ||
                        'Error al configurar la contraseña. Intente nuevamente.';

    console.error('Error en setupPassword:', error.response?.data || error.message);

    // Limpiar si hay error
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    throw new Error(errorMessage);
  }
};