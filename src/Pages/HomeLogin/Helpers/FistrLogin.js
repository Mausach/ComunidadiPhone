import authApi from "../../../Api/authApi";

export const firstLogin = async (email, navigate) => {
  try {
    // 1. Realizar petición al backend
    const resp = await authApi.post('/auth/first-login', { email });

    // 2. Guardar token de setup en localStorage (igual que starLogin)
    localStorage.setItem('token', resp.data.token);
    localStorage.setItem('user', JSON.stringify(resp.data.usuario));
    
    // 3. Configurar token en axios para futuras peticiones
    authApi.defaults.headers.common['x-token'] = resp.data.token;

    // 4. Redirigir a configuración de contraseña
    navigate('/pass-config', { 
      state: { 
        user: resp.data.usuario,
        token: resp.data.token 
      } 
    });

    return {
      success: true,
      user: resp.data.usuario,
      token: resp.data.token
    };

  } catch (error) {
    // 5. Manejo de errores (mismo estilo que starLogin)
    const errorMessage = error.response?.data?.msg || 
                        error.response?.data?.errors?.[0]?.msg || 
                        error.message ||
                        'Error al verificar el usuario. Intente nuevamente.';

    console.error('Error en firstLogin:', error.response?.data || error.message);

    // Limpiar si hay error
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    throw new Error(errorMessage);
  }
};