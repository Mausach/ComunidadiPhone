// src/Helpers/DatosDocumentos.js
import authApi from '../../../Api/authApi';

// ==========================================
// 📄 CONTRATO DE CRÉDITO PERSONAL (Sistema 1 y 2)
// ==========================================
export const obtenerDatosContratoCredito = async (idVenta) => {
  try {
    console.log(`📄 Solicitando datos para Contrato de Crédito de la venta: ${idVenta}`);
    
    // 👉 URL EXACTA que espera tu backend
    const resp = await authApi.get(`/documentos/contrato/${idVenta}`);
    
    if (resp.data?.ok) {
      return resp.data.data; 
    }
    throw new Error(resp.data?.message || 'Error al obtener datos del contrato');
  } catch (error) {
    console.error('❌ Error en obtenerDatosContratoCredito:', error);
    const msg = error.response?.data?.message || error.message;
    throw new Error(msg);
  }
};

export const obtenerDatosSolicitudFinanciacion = async (idVenta) => {
  try {
    console.log(`📄 Solicitando datos para Solicitud de Financiación: ${idVenta}`);
    const resp = await authApi.get(`/documentos/soli-fin/${idVenta}`);
    
    if (resp.data?.ok) {
      return resp.data.data; 
    }
    throw new Error(resp.data?.message || 'Error al obtener datos de la solicitud');
  } catch (error) {
    console.error('❌ Error en obtenerDatosSolicitudFinanciacion:', error);
    const msg = error.response?.data?.message || error.message;
    throw new Error(msg);
  }
};

// ==========================================
// (Futuros documentos)
// ==========================================
// export const obtenerDatosLibreDeuda = async (idVenta) => { ... }
// export const obtenerDatosSolicitudAdhesion = async (idVenta) => { ... }