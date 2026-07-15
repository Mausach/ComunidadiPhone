import authApi from "../../../Api/AuthApi";


export const starLogin = async (email, password, navigate) => {
  try {
    // 1. Realizar petición al backend
    const resp = await authApi.post('/auth/login', {
      email, 
      password
    });

    // 2. Guardar token y datos en localStorage
    localStorage.setItem('token', resp.data.token);
    localStorage.setItem('user', JSON.stringify(resp.data.usuario));
    
    // Configurar token en axios para futuras peticiones
    authApi.defaults.headers.common['Authorization'] = `Bearer ${resp.data.token}`;

    // 3. Mapeo de roles a rutas
    const roleRoutes = {
      dev: '/dev',
      Admin: '/Admin',
      ventas: '/ventas',
      cobranza: '/cobranza',
      ger_com:  '/ger_com',
      ceo:'/ceo'
    };

    const userRole = resp.data.usuario.rol;

    // 4. Redirección según rol
    if (roleRoutes[userRole]) {
      navigate(roleRoutes[userRole], { 
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
    } else {
      // Rol no reconocido - limpiamos y lanzamos error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Rol no autorizado para acceder al sistema');
    }

  } catch (error) {
    // 5. Manejo de errores mejorado
    const errorMessage = error.response?.data?.msg || 
                        error.response?.data?.errors?.[0]?.msg || 
                        error.message ||
                        'Error al iniciar sesión. Intente nuevamente.';

    console.error('Error en login:', error.response?.data || error.message);

    // Limpiar token si hay error
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Lanzar el error para que el componente lo maneje
    throw new Error(errorMessage);
  }
};