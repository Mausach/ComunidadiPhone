import authApi from "../../../Api/authApi";



export const starLogin = async (email, password, navigate) => {
  try {
    const resp = await authApi.post('/auth/login', { email, password });

    localStorage.setItem('token', resp.data.token);
    localStorage.setItem('user', JSON.stringify(resp.data.usuario));
    authApi.defaults.headers.common['Authorization'] = `Bearer ${resp.data.token}`;

    const userRole = resp.data.usuario.rol;
    const rolesValidos = ['dev', 'admin', 'ventas', 'cobranza', 'ger_com', 'ceo'];

    if (!rolesValidos.includes(userRole)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Rol no autorizado para acceder al sistema');
    }

    // 👇 REDIRIGIMOS AL LOADING, NO AL PANEL
    navigate('/loading', {
      replace: true,
      state: { user: resp.data.usuario, token: resp.data.token }
    });

    return { success: true, user: resp.data.usuario, token: resp.data.token };

  } catch (error) {
    const errorMessage = error.response?.data?.msg ||
                        error.response?.data?.errors?.[0]?.msg ||
                        error.message ||
                        'Error al iniciar sesión. Intente nuevamente.';

    console.error('Error en login:', error.response?.data || error.message);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error(errorMessage);
  }
};