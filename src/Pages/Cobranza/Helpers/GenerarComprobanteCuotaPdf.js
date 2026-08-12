// src/Helpers/generarReciboPago.js
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import logo from '../../../assets/logocenter.png'; // Ajustá la ruta a tu logo

export const generarReciboPago = (venta, cuota, metodoPago) => {
  const doc = new jsPDF();
  
  // ==========================================
  // COLORES CORPORATIVOS
  // ==========================================
  const azulOscuro = '#021C5E';
  const azul = '#3483FA';
  const gris = '#666';
  const verde = '#00a650';

  // ==========================================
  // MARCA DE AGUA (logo al centro con opacidad)
  // ==========================================
  doc.setGState(new doc.GState({ opacity: 0.07 }));
  //Los parámetros son: addImage(imagen, formato, x, y, ancho, alto)
  doc.addImage(logo, 'PNG', -10, 60, 250, 130);
  doc.setGState(new doc.GState({ opacity: 1 }));

  // ==========================================
  // ENCABEZADO
  // ==========================================
  // Logo
  doc.addImage(logo, 'PNG', 1, 10, 60, 35);
  
  // Nombre empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(azulOscuro);
  doc.text('Comunidad iPhone', 55, 22);
  
  // Dirección y horario
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(gris);
  doc.text('Av. Principal 123 - Santiago del Estero', 55, 30);
  doc.text('Horario: Lunes a Viernes de 9:00 a 18:00', 55, 36);

  // Línea separadora
  doc.setDrawColor(azul);
  doc.setLineWidth(0.5);
  doc.line(15, 48, 195, 48);

  // ==========================================
  // TÍTULO DEL COMPROBANTE
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(azulOscuro);
  doc.text('COMPROBANTE DE PAGO', 105, 58, { align: 'center' });

  // Fecha de emisión
  const fechaEmision = new Date().toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(gris);
  doc.text(`Fecha de emisión: ${fechaEmision}`, 105, 65, { align: 'center' });

  // ==========================================
  // DATOS DEL CLIENTE
  // ==========================================
  doc.setFontSize(10);
  doc.setTextColor('#333');
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE', 15, 78);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${venta.cliente?.nombre} ${venta.cliente?.apellido}`, 15, 86);
  doc.text(`DNI: ${venta.cliente?.dni || '-'}`, 15, 93);
  doc.text(`Producto: ${venta.producto?.nombre || 'Sin producto'}`, 15, 100);

  // ==========================================
  // DATOS DEL PAGO
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL PAGO', 15, 113);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Cuota N°: ${cuota.numeroCuota}`, 15, 121);
  
  // Formatear monto
  const formatoMonto = (m) => `$${m.toLocaleString('es-AR')}`;
  
  doc.text(`Monto abonado: ${formatoMonto(cuota.montoCuota)}`, 15, 128);
  
  // Recargos si tiene
  const totalRecargos = cuota.recargos?.reduce((s, r) => s + r.monto, 0) || 0;
  if (totalRecargos > 0) {
    doc.setTextColor('#dc3545');
    doc.text(`Recargos: ${formatoMonto(totalRecargos)}`, 15, 135);
    doc.setTextColor('#333');
    doc.text(`Total pagado: ${formatoMonto(cuota.montoCuota + totalRecargos)}`, 15, 142);
  }
  
  doc.text(`Método de pago: ${metodoPago || cuota.metodoPago || '-'}`, 15, totalRecargos > 0 ? 149 : 135);
  doc.text(`Fecha de vencimiento: ${new Date(cuota.fechaCobro).toLocaleDateString('es-AR')}`, 15, totalRecargos > 0 ? 156 : 142);
  
  // Fecha de cobro si fue cobrada
  if (cuota.fechaCobrada) {
    doc.text(`Fecha de cobro: ${new Date(cuota.fechaCobrada).toLocaleDateString('es-AR')}`, 15, totalRecargos > 0 ? 163 : 149);
  }
  
  // Cobrador
  if (cuota.cobrador?.nombre) {
    doc.text(`Cobrador: ${cuota.cobrador.nombre}`, 15, totalRecargos > 0 ? 170 : 156);
  }

  // ==========================================
  // LÍNEA DE FIRMA
  // ==========================================
  const yFirma = totalRecargos > 0 ? 190 : 175;
  doc.setDrawColor('#ccc');
  doc.line(60, yFirma, 150, yFirma);
  doc.setFontSize(9);
  doc.setTextColor(gris);
  doc.text('Firma del Cliente', 105, yFirma + 7, { align: 'center' });

  // ==========================================
  // PIE DE PÁGINA
  // ==========================================
  doc.setFontSize(8);
  doc.setTextColor('#999');
  doc.text('Comunidad iPhone - Comprobante generado electrónicamente', 105, 285, { align: 'center' });
  doc.text('Este documento no es válido como factura oficial', 105, 290, { align: 'center' });

  // ==========================================
  // GUARDAR
  // ==========================================
  const nombreArchivo = `comprobante-cuota-${cuota.numeroCuota}-${venta.cliente?.apellido || 'cliente'}.pdf`;
  doc.save(nombreArchivo);
};