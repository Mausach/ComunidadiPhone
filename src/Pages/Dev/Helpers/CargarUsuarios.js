import authApi from "../../../Api/authApi";

export const CargarUsuarios = async (setUsers, navigate) => {
    try {
        const resp = await authApi.get('/admin/usuarios');

        // Validar la respuesta del backend
        if (resp.data?.ok && Array.isArray(resp.data.usuarios)) {
            setUsers(resp.data.usuarios);
            return {
                success: true,
                usuarios: resp.data.usuarios,
                total: resp.data.usuarios.length
            };
        } else {
            console.error('Los datos de los usuarios no son un array:', resp.data);
            throw new Error(resp.data?.msg || 'Formato de datos inválido');
        }

    } catch (error) {
        console.error('Error al cargar usuarios:', error.response?.data?.msg || error.message);

        // Manejo de error 401 (no autenticado)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
        }

        // Lanzar el error para que el componente lo maneje
        throw new Error(error.response?.data?.msg || 'Error al cargar los usuarios. Intentá nuevamente.');
    }
};