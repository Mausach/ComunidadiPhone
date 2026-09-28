// src/Helpers/contratos/generarDocumentosPorTipo.js

import { generarContratoVentaDirecta } from './Contratos/ContraroDirecta';
import { generarReciboPago } from './Comprovanteventa/Reciboventa';
import { generarCertificadoGarantia } from './Garantia/Certificadogarantiaventa';
import { generarContratoCredito } from './Contratos/Contratocreditopersonal';
import { generarReciboCredito } from './Comprovanteventa/Recivocredito';
import { generarSolicitudAdhesion } from './Formadecion/certificadoadhecion';
import { generarComprobantePlanCanje } from './Contratos/Comprobantecanjes';

// ============================================================
// GENERADOR DE DOCUMENTOS POR TIPO DE VENTA
// ============================================================
// Genera todos los PDFs correspondientes según el tipo de venta.
// Retorna un objeto con el detalle de qué documentos se generaron.
//
// @param {Object} venta - Datos completos de la venta
// @param {Object} firmas - { cliente: string (base64), garante: string | null }
// @returns {Object} - { tipoVenta, documentos: [string], errores: [string] }
// ============================================================

export const obtenerDocumentosPorTipo = (venta, firmas) => {
  if (!venta || !firmas?.cliente) return [];

  const tipo = venta.tipoVenta;
  const firmaGarante = tipo === 'sistema1' ? firmas.garante : null;

  // 🔵 VENTA CONTADO (DIRECTA)
  if (tipo === 'contado') {
    return [
      {
        key: 'contrato',
        label: 'Contrato de Compraventa',
        icon: 'bi-file-earmark-text',
        variant: 'primary',
        descripcion: 'Contrato de compraventa de teléfono celular',
        handler: () => generarContratoVentaDirecta(venta, firmas.cliente)
      },
      {
        key: 'recibo',
        label: 'Recibo Oficial de Pago',
        icon: 'bi-receipt',
        variant: 'outline-primary',
        descripcion: 'Comprobante de pago de la operación',
        handler: () => generarReciboPago(venta, firmas.cliente)
      },
      {
        key: 'garantia',
        label: 'Certificado de Garantía',
        icon: 'bi-shield-check',
        variant: 'outline-primary',
        descripcion: 'Certificado de garantía del equipo',
        handler: () => generarCertificadoGarantia(venta, firmas.cliente)
      }
    ];
  }

  // 🟡 PLAN CANJE
  if (tipo === 'plan_canje') {
    return [
      {
        key: 'adhesion',
        label: 'Solicitud de Adhesión',
        icon: 'bi-file-text',
        variant: 'primary',
        descripcion: 'Solicitud de adhesión al sistema',
        handler: () => generarSolicitudAdhesion(venta, firmas.cliente, null)
      },
      {
        key: 'garantia',
        label: 'Certificado de Garantía',
        icon: 'bi-shield-check',
        variant: 'outline-primary',
        descripcion: 'Certificado de garantía del equipo',
        handler: () => generarCertificadoGarantia(venta, firmas.cliente)
      },
      {
        key: 'comprobante-canje',
        label: 'Comprobante de Plan Canje',
        icon: 'bi-arrow-repeat',
        variant: 'outline-primary',
        descripcion: 'Comprobante del equipo recibido en canje',
        handler: () => generarComprobantePlanCanje(venta, firmas.cliente)
      }
    ];
  }

  // 🟢 SISTEMA 1 Y SISTEMA 2 (CRÉDITO PERSONAL)
  if (tipo === 'sistema1' || tipo === 'sistema2') {
    return [
      {
        key: 'contrato-credito',
        label: 'Contrato de Crédito Personal',
        icon: 'bi-file-earmark-text',
        variant: 'primary',
        descripcion: 'Contrato de crédito personal',
        handler: () => generarContratoCredito(venta, firmas.cliente, firmaGarante)
      },
      {
        key: 'recibo-credito',
        label: 'Recibo de Crédito Personal',
        icon: 'bi-receipt',
        variant: 'outline-primary',
        descripcion: 'Recibo oficial del crédito otorgado',
        handler: () => generarReciboCredito(venta, firmas.cliente)
      },
      {
        key: 'adhesion',
        label: 'Solicitud de Adhesión',
        icon: 'bi-file-text',
        variant: 'outline-primary',
        descripcion: 'Solicitud de adhesión al sistema',
        handler: () => generarSolicitudAdhesion(venta, firmas.cliente, firmaGarante)
      },
      {
        key: 'garantia',
        label: 'Certificado de Garantía',
        icon: 'bi-shield-check',
        variant: 'outline-primary',
        descripcion: 'Certificado de garantía del equipo',
        handler: () => generarCertificadoGarantia(venta, firmas.cliente)
      }
    ];
  }

  return [];
};