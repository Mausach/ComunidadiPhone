// Ventas/Helpers/verificarCliente.js
import authApi from "../../../api/authApi";

export const crearCliente = async (clienteData, setClienteData, showAlert, esExistente = false) => {
  try {
    // Si es un cliente existente, no validamos duplicados en el backend
    if (esExistente) {
      console.log('✅ Cliente existente, saltando validación de duplicados');
      
      if (setClienteData) {
        setClienteData(clienteData);
      }

      return {
        success: true,
        message: 'Cliente verificado correctamente',
        cliente: clienteData,
        clienteId: clienteData._id || clienteData.dni,
        esExistente: true
      };
    }

    // ==========================================
    // CREAR CLIENTE NUEVO
    // ==========================================
    console.log('🆕 Creando nuevo cliente:', clienteData);

    const payload = {
      nombre: clienteData.nombre.trim(),
      apellido: clienteData.apellido.trim(),
      dni: clienteData.dni.trim(),
      direccion: clienteData.direccion.trim(),
      ...(clienteData.cuil?.trim() && { cuil: clienteData.cuil.trim() }),
      ...(clienteData.telefono?.trim() && { telefono: clienteData.telefono.trim() }),
      ...(clienteData.email?.trim() && { email: clienteData.email.trim().toLowerCase() }),
      situacionCrediticia: parseInt(clienteData.situacionCrediticia, 10) || 1
    };

    const resp = await authApi.post('/vtas/new-clientes', payload);

    if (resp.data?.ok) {
      if (setClienteData) {
        setClienteData(resp.data.data);
      }

      return {
        success: true,
        message: resp.data?.message || 'Cliente creado exitosamente',
        cliente: resp.data?.data,
        clienteId: resp.data?.data?._id,
        esExistente: false
      };
    } else {
      throw new Error(resp.data?.message || 'Error al crear el cliente');
    }

  } catch (error) {
    console.error('❌ Error en crearCliente:', error);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
    }

    if (error.response?.status === 409) {
      const mensaje = error.response?.data?.message || 'El DNI, CUIL o email ya está registrado.';
      throw new Error(mensaje);
    }

    if (error.response?.status === 400) {
      const mensaje = error.response?.data?.message || 
                     error.response?.data?.errors?.[0]?.msg ||
                     'Datos inválidos. Verificá los campos.';
      throw new Error(mensaje);
    }

    if (error.response?.status >= 500) {
      throw new Error('Error del servidor. Intentá nuevamente más tarde.');
    }

    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.msg || 
                        error.message ||
                        'Error al crear el cliente. Intentá nuevamente.';

    throw new Error(errorMessage);
  }
};