// src/Cobranza/Helpers/GenerarLibreDeuda.js

import logo from '../../../assets/logocenter.png';
import { jsPDF } from "jspdf";

// ============================================================
// GENERADOR DE RECIBO DE PAGO Y CERTIFICADO DE LIBRE DEUDA
// ============================================================
// Se emite cuando el cliente ha cancelado la TOTALIDAD del crédito.
//
// @param {Object} venta - Datos de la venta (con cliente, producto, cuotas)
// @param {Object} ultimaCuota - Datos de la última cuota pagada
// ============================================================

export const generarLibreDeuda = (venta, ultimaCuota) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // ============================================================
  // CONFIGURACIÓN
  // ============================================================
  const PAGE_WIDTH = 210;
  const MARGIN_LEFT = 15;
  const MARGIN_RIGHT = 15;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const FIRST_PAGE_TOP = 58;
  const FOOTER_Y = 286;

  const azulOscuro = "#021C5E";
  const azul = "#3483FA";
  const negro = "#222222";
  const gris = "#777777";
  const grisClaro = "#AAAAAA";
  const verdeCheck = "#00A650";

  let y = FIRST_PAGE_TOP;

  // ============================================================
  // DATOS DINÁMICOS
  // ============================================================
  const cliente = venta?.cliente || {};
  const producto = venta?.producto || {};
  const cuotas = venta?.cuotas || [];

  const nombreCliente = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "-";
  const dni = cliente.dni || "-";
  const domicilio = cliente.direccion || "-";
  const telefono = cliente.telefono || "-";

  const totalCuotas = cuotas.length;
  const numeroCuota = ultimaCuota?.numeroCuota || totalCuotas;
  const montoCuota = ultimaCuota?.montoCuota || 0;
  const metodoPago = ultimaCuota?.metodoPago || "efectivo";

  // Formatear moneda
  const formatoMoneda = (v) => v || v === 0 ? `$${Number(v).toLocaleString("es-AR")}` : "$0";

  // Formato fecha
  const formatoFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Fecha actual en letras
  const mesesLetras = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const hoy = new Date();
  const dia = hoy.getDate();
  const mes = mesesLetras[hoy.getMonth()];
  const anio = hoy.getFullYear();

  // Número de comprobante
  const numeroCertificado = `LIB-${anio}-${venta._id?.slice(-6).toUpperCase() || "000000"}`;

  // ============================================================
  // MARCA DE AGUA
  // ============================================================
  doc.setGState(new doc.GState({ opacity: 0.06 }));
  try {
    doc.addImage(logo, "PNG", -10, 60, 250, 130);
  } catch (e) {
    console.warn("No se pudo cargar la marca de agua:", e);
  }
  doc.setGState(new doc.GState({ opacity: 1 }));

  // ============================================================
  // ENCABEZADO
  // ============================================================
  try {
    doc.addImage(logo, "PNG", 1, 10, 60, 35);
  } catch (e) {
    console.warn("No se pudo cargar el logo:", e);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(azulOscuro);
  doc.text("Comunidad iPhone", 55, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(gris);
  doc.text("Patagonia N° 695 - Santiago del Estero (CP 4200)", 55, 30);
  doc.text("Tel: 385 317-6107 · comunidadahorrosgo@gmail.com", 55, 36);

  // Línea separadora
  doc.setDrawColor(azul);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, 52, PAGE_WIDTH - MARGIN_RIGHT, 52);

  // ============================================================
  // TÍTULO
  // ============================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(azulOscuro);
  doc.text("RECIBO DE PAGO Y CERTIFICADO DE LIBRE DEUDA", PAGE_WIDTH / 2, y, { align: "center" });

  y += 6;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(gris);
  doc.text("Cancelación total de crédito", PAGE_WIDTH / 2, y, { align: "center" });

  y += 8;

  // Fecha de emisión
  const fechaEmision = hoy.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(gris);
  doc.text(`Fecha de emisión: ${fechaEmision}`, PAGE_WIDTH / 2, y, { align: "center" });

  // Número de certificado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(azul);
  doc.text(`N° ${numeroCertificado}`, PAGE_WIDTH - MARGIN_RIGHT, y, { align: "right" });

  y += 11;

  // ============================================================
  // TABLA DE DATOS
  // ============================================================
  const datos = [
    ["Lugar y fecha", `Santiago del Estero, ${dia} de ${mes} de ${anio}`],
    ["Cliente", nombreCliente],
    ["DNI", dni],
    ["Producto financiado", `${producto.nombre || "-"} ${producto.modelo || ""}`.trim()],
    ["Forma de pago", `${totalCuotas} cuotas mensuales de ${formatoMoneda(cuotas[0]?.montoCuota || 0)} (total ${formatoMoneda(venta.montoTotal)})`],
    ["Cuota que se abona", `Cuota ${numeroCuota}/${totalCuotas} y última`],
    ["Importe recibido", `${formatoMoneda(montoCuota)} (pesos ${numeroALetras(montoCuota)} )`],
    ["Medio de pago", metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1)],
  ];

  // Dibujar tabla manual
  const rowHeight = 7;
  const labelWidth = 55;
  const valueWidth = CONTENT_WIDTH - labelWidth;

  datos.forEach((fila, idx) => {
    // Fondo alternado
    if (idx % 2 === 0) {
      doc.setFillColor("#F5F7FB");
      doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, rowHeight, "F");
    }

    // Borde
    doc.setDrawColor("#DDDDDD");
    doc.setLineWidth(0.2);
    doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, rowHeight);

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(azulOscuro);
    doc.text(fila[0], MARGIN_LEFT + 2, y + 4.5);

    // Valor
    doc.setFont("helvetica", "normal");
    doc.setTextColor(negro);
    doc.text(fila[1], MARGIN_LEFT + labelWidth + 2, y + 4.5);

    y += rowHeight;
  });

  y += 8;

  // ============================================================
  // CUERPO DEL CERTIFICADO
  // ============================================================
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(negro);

  const cuerpoTexto = `La empresa COMUNIDAD IPHONE recibe de ${nombreCliente}, DNI Nº ${dni}, la suma de PESOS ${numeroALetras(montoCuota)} (${formatoMoneda(montoCuota)}), abonada mediante ${metodoPago}, en concepto de pago de la cuota ${numeroCuota}/${totalCuotas} y última del crédito personal otorgado para la adquisición de un ${producto.nombre || "-"} ${producto.modelo || ""}, pactado en ${totalCuotas} cuotas mensuales de ${formatoMoneda(cuotas[0]?.montoCuota || 0)}.

Con este pago el cliente ha cancelado la totalidad de las cuotas pactadas, por lo que el crédito queda TOTALMENTE CANCELADO. En consecuencia, COMUNIDAD IPHONE le otorga el más amplio certificado de libre deuda, declarando que no tiene nada más que reclamarle por capital, intereses, cargos ni ningún otro concepto derivado de dicho crédito. Quedan asimismo extinguidas las obligaciones del garante, si lo hubiere.

El pagaré suscripto en garantía del crédito ha quedado sin efecto. Se invita al cliente a retirarlo en la casa central de la empresa, sita en Patagonia 695, Santiago del Estero, en el horario de atención.

La presente constancia no altera la garantía del equipo, que se rige por sus propias condiciones.`;

  const lineasCuerpo = doc.splitTextToSize(cuerpoTexto, CONTENT_WIDTH);
  doc.text(lineasCuerpo, MARGIN_LEFT, y);
  y += lineasCuerpo.length * 4 + 8;

  // ============================================================
  // MENSAJE DE AGRADECIMIENTO
  // ============================================================
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor("#FFF8E1");
  doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, 25, 2, 2, "F");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(azulOscuro);

  const agradecimiento = `Queremos agradecerle especialmente por su cumplimiento y por la constancia con la que abonó cada una de sus cuotas, mes a mes. Clientes como usted son los que hacen grande a esta comunidad. Las puertas de COMUNIDAD IPHONE están abiertas para que renueve su equipo y suba de modelo, con el respaldo de un historial impecable con nosotros.

La invitamos a acercarse a nuestra casa central o a escribirnos al 385 417-8021, y la asesoramos para que dé el próximo paso.`;

  const lineasAgradecimiento = doc.splitTextToSize(agradecimiento, CONTENT_WIDTH - 6);
  doc.text(lineasAgradecimiento, MARGIN_LEFT + 3, y + 6);
  y += 30;

  // ============================================================
  // FELICITACIONES
  // ============================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(verdeCheck);
  doc.text("¡FELICITACIONES Y BIENVENIDO A NUESTRA COMUNIDAD!", PAGE_WIDTH / 2, y, { align: "center" });
  y += 12;

  // ============================================================
  // DATOS DE LA EMPRESA
  // ============================================================
  if (y > 250) {
    doc.addPage();
    y = 30;
  }

  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(azulOscuro);
  doc.text("COMUNIDAD IPHONE", PAGE_WIDTH / 2, y, { align: "center" });

  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(gris);
  doc.text("Patagonia N° 695 · Santiago del Estero (CP 4200)", PAGE_WIDTH / 2, y, { align: "center" });
  y += 5;
  doc.text("Tel: 385 317-6107 · comunidadahorrosgo@gmail.com", PAGE_WIDTH / 2, y, { align: "center" });

  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(azul);
  doc.text("FIRMA AUTORIZADA Ley N° 25.506 — Firma Electrónica", PAGE_WIDTH / 2, y, { align: "center" });

  // ============================================================
  // PIE DE PÁGINA
  // ============================================================
  const totalPaginas = doc.getNumberOfPages();

  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina);

    doc.setDrawColor("#DDDDDD");
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT, 279, PAGE_WIDTH - MARGIN_RIGHT, 279);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(grisClaro);

    doc.text(
      "COMUNIDAD IPHONE | Certificado de Libre Deuda | Santiago del Estero",
      MARGIN_LEFT,
      FOOTER_Y
    );

    doc.text(
      `Página ${pagina} de ${totalPaginas}`,
      PAGE_WIDTH - MARGIN_RIGHT,
      FOOTER_Y,
      { align: "right" }
    );
  }

  // ============================================================
  // GUARDAR PDF
  // ============================================================
  const apellidoArchivo = cliente.apellido || cliente.nombre || "cliente";
  const dniArchivo = cliente.dni || "";

  const nombreArchivo = `certificado-libre-deuda-${apellidoArchivo}-${dniArchivo}.pdf`;

  doc.save(nombreArchivo);
};

// ============================================================
// FUNCIÓN AUXILIAR: NÚMERO A LETRAS
// ============================================================
function numeroALetras(numero) {
  const unidades = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const especiales = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
  const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

  numero = Math.floor(numero);

  if (numero === 0) return "CERO";
  if (numero === 100) return "CIEN";
  if (numero < 10) return unidades[numero];
  if (numero < 20) return especiales[numero - 10];
  if (numero < 100) {
    const d = Math.floor(numero / 10);
    const u = numero % 10;
    return decenas[d] + (u > 0 ? " Y " + unidades[u] : "");
  }
  if (numero < 1000) {
    const c = Math.floor(numero / 100);
    const resto = numero % 100;
    return centenas[c] + (resto > 0 ? " " + numeroALetras(resto) : "");
  }
  if (numero < 1000000) {
    const miles = Math.floor(numero / 1000);
    const resto = numero % 1000;
    let result = miles === 1 ? "MIL" : numeroALetras(miles) + " MIL";
    if (resto > 0) result += " " + numeroALetras(resto);
    return result;
  }
  const millones = Math.floor(numero / 1000000);
  const resto = numero % 1000000;
  let result = millones === 1 ? "UN MILLON" : numeroALetras(millones) + " MILLONES";
  if (resto > 0) result += " " + numeroALetras(resto);
  return result;
}