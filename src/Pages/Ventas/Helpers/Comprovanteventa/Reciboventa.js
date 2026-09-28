// src/Helpers/contratos/generarReciboPago.js

import { jsPDF } from "jspdf";
import logo from "../../../../assets/logocenter.png";

// ============================================================
// GENERADOR DE RECIBO OFICIAL DE PAGO
// ============================================================
// Genera el Recibo Oficial de Pago para ventas de contado.
//
// @param {Object} venta - Datos de la venta
// @param {string} firmaDataURL - Firma del cliente en formato dataURL (PNG)
// ============================================================


export const generarReciboPago = (venta) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // ============================================================
  // COLORES Y CONFIGURACIÓN
  // ============================================================

  const PAGE_WIDTH = 210;
  const MARGIN_LEFT = 15;
  const MARGIN_RIGHT = 15;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const FOOTER_Y = 286;

  const azulOscuro = "#021C5E";
  const azul = "#3483FA";
  const negro = "#222222";
  const gris = "#777777";
  const grisClaro = "#AAAAAA";
  const verdeCheck = "#00A650";

  // ============================================================
  // DIBUJAR TILDE VERDE
  // ============================================================
  // Dibuja una "V" (tilde) verde. Se usa en checkboxes marcados.
  // ============================================================
  const dibujarTildeVerde = (x, y, tamano = 3) => {
    doc.setDrawColor(verdeCheck);
    doc.setLineWidth(0.5);

    // Primera línea (bajada)
    doc.line(
      x,
      y - tamano * 0.3,
      x + tamano * 0.35,
      y - tamano * 0.05
    );

    // Segunda línea (subida)
    doc.line(
      x + tamano * 0.35,
      y - tamano * 0.05,
      x + tamano * 0.9,
      y - tamano * 0.9
    );
  };

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
  doc.line(MARGIN_LEFT, 48, PAGE_WIDTH - MARGIN_RIGHT, 48);

  // ============================================================
  // TÍTULO
  // ============================================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(azulOscuro);
  doc.text("RECIBO OFICIAL DE PAGO", PAGE_WIDTH / 2, 58, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(gris);
  doc.text("FORMATO DIGITAL", PAGE_WIDTH / 2, 64, { align: "center" });

  // Fecha emisión
  const fechaEmision = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(gris);
  doc.text(`Fecha de emisión: ${fechaEmision}`, PAGE_WIDTH / 2, 71, { align: "center" });

  // Número de recibo
  const numeroRecibo = `REC-${new Date().getFullYear()}-${venta._id?.slice(-6).toUpperCase() || "000000"}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(azul);
  doc.text(`N° ${numeroRecibo}`, PAGE_WIDTH - MARGIN_RIGHT, 71, { align: "right" });

  // ============================================================
  // INTRODUCCIÓN
  // ============================================================

  let y = 82;

  const mesesLetras = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const fechaVenta = venta?.fechaRealizada ? new Date(venta.fechaRealizada) : new Date();
  const dia = fechaVenta.getDate();
  const mes = mesesLetras[fechaVenta.getMonth()];
  const anio = fechaVenta.getFullYear();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(negro);

  const intro = `En la ciudad de Santiago del Estero a los ${dia} días del mes de ${mes} del año ${anio}, COMUNIDAD IPHONE deja constancia de haber recibido de:`;
  const introLineas = doc.splitTextToSize(intro, CONTENT_WIDTH);
  doc.text(introLineas, MARGIN_LEFT, y);
  y += introLineas.length * 4 + 4;

  // ============================================================
  // DATOS DEL CLIENTE
  // ============================================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(azulOscuro);
  doc.text("DATOS DEL CLIENTE", MARGIN_LEFT, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(negro);

  const cliente = venta.cliente || {};
  const nombreCliente = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "-";

  doc.text(`Nombre y Apellido: ${nombreCliente}`, MARGIN_LEFT, y);
  y += 5;
  doc.text(`DNI: ${cliente.dni || "-"}`, MARGIN_LEFT, y);
  y += 5;
  doc.text(`Domicilio: ${cliente.direccion || "-"}`, MARGIN_LEFT, y);
  y += 10;

  // ============================================================
  // 1. DINERO RECIBIDO
  // ============================================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(azulOscuro);
  doc.text("1. DINERO RECIBIDO", MARGIN_LEFT, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(negro);

  const pagos = venta.pagos || [];

  // Determinar montos en ARS y USD
  let montoARS = 0;
  let montoUSD = 0;

  pagos.forEach(p => {
    if (p.metodo === "dolares" || p.metodo === "dólares" || p.metodo === "usd") {
      montoUSD += p.monto;
    } else {
      montoARS += p.monto;
    }
  });

  const formatoMoneda = (v) => v ? `$${Number(v).toLocaleString("es-AR")}` : "$0";

  doc.text(`La suma de:`, MARGIN_LEFT, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text(`ARS ${formatoMoneda(montoARS)} (${montoARS > 0 ? "pesos argentinos" : "---"})`, MARGIN_LEFT, y);
  y += 5;
  doc.text(`USD ${montoUSD > 0 ? formatoMoneda(montoUSD) : "$________"} (${montoUSD > 0 ? "dólares estadounidenses" : "---"})`, MARGIN_LEFT, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.text("abonada mediante la siguiente forma de pago:", MARGIN_LEFT, y);
  y += 6;

  // ============================================================
  // CHECKBOXES DE MÉTODOS DE PAGO
  // ============================================================

  const metodosDelSistema = [...new Set(pagos.map(p => p.metodo))];
  const esCombinado = metodosDelSistema.length > 1;

  const metodosRecibo = [
    { key: "transferencia", label: "Transferencia" },
    { key: "billetera_virtual", label: "Billetera virtual", aliases: ["cripto", "billetera"] },
    { key: "tarjeta_credito", label: "Tarjeta de crédito" },
    { key: "tarjeta_debito", label: "Tarjeta de débito" },
    { key: "efectivo", label: "Efectivo", aliases: ["dolares", "dólares"] },
    { key: "combinada", label: "Modalidad combinada" },
  ];

  doc.setFontSize(9);
  metodosRecibo.forEach(m => {
    let marcado = false;

    metodosDelSistema.forEach(mp => {
      if (mp === m.key || (m.aliases && m.aliases.includes(mp))) {
        marcado = true;
      }
    });

    if (m.key === "combinada" && esCombinado) {
      marcado = true;
    }

    if (marcado) {
      // Dibujar tilde verde
      dibujarTildeVerde(MARGIN_LEFT + 3, y, 3);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(verdeCheck);
      doc.text(m.label, MARGIN_LEFT + 8, y);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(negro);
      doc.text(m.label, MARGIN_LEFT + 8, y);
    }
    y += 5;
  });

  y += 4;

  // Desglose por método si es combinado
  if (esCombinado) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(azulOscuro);
    doc.text("Detalle por método:", MARGIN_LEFT, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(negro);

    pagos.forEach(p => {
      const metodoLabel = p.metodo.charAt(0).toUpperCase() + p.metodo.slice(1);
      doc.text(`• ${metodoLabel}: ${formatoMoneda(p.monto)}`, MARGIN_LEFT + 3, y);
      y += 4;
    });
    y += 2;
  }

  // ============================================================
  // 2. CONCEPTO DE LA OPERACIÓN
  // ============================================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(azulOscuro);
  doc.text("2. CONCEPTO DE LA OPERACIÓN", MARGIN_LEFT, y);
  y += 5;

  doc.setFontSize(9);

  const conceptosRecibo = [
    { key: "venta_directa", label: "Venta directa" },
    { key: "credito_personal", label: "Crédito personal" },
    { key: "adelanto", label: "Adelanto / seña" },
    { key: "pago_cuota", label: "Pago de cuota" },
    { key: "cancelacion_total", label: "Cancelación total" },
    { key: "refinanciacion", label: "Refinanciación" },
  ];

  const esVentaDirecta = venta.tipoVenta === "contado" || venta.tipoVenta === "plan_canje";
  const esCredito = venta.tipoVenta === "sistema1" || venta.tipoVenta === "sistema2";

  conceptosRecibo.forEach(c => {
    let marcado = false;
    if (c.key === "venta_directa" && esVentaDirecta) marcado = true;
    if (c.key === "credito_personal" && esCredito) marcado = true;

    if (marcado) {
      dibujarTildeVerde(MARGIN_LEFT + 3, y, 3);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(verdeCheck);
      doc.text(c.label, MARGIN_LEFT + 8, y);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(negro);
      doc.text(c.label, MARGIN_LEFT + 8, y);
    }
    y += 5;
  });

  y += 4;

  // Detalle de la operación
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(azulOscuro);
  doc.text("Detalle de la operación:", MARGIN_LEFT, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(negro);

  const producto = venta.producto || {};
  const detalle = `${producto.nombre || "-"} ${producto.modelo || ""} ${producto.capacidad || ""} ${producto.color || ""} - IMEI: ${producto.imei || "-"} - Venta directa`;
  const detalleLineas = doc.splitTextToSize(detalle, CONTENT_WIDTH - 3);
  doc.text(detalleLineas, MARGIN_LEFT + 3, y);
  y += detalleLineas.length * 4 + 4;

  // ============================================================
  // 3. ACLARACIONES IMPORTANTES
  // ============================================================

  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(azulOscuro);
  doc.text("3. ACLARACIONES IMPORTANTES", MARGIN_LEFT, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(negro);

  const aclaraciones = [
    "El presente recibo digital acredita exclusivamente la recepción del dinero por parte de COMUNIDAD IPHONE en la fecha indicada y no implica por sí solo la cancelación total de obligaciones, salvo constancia expresa en contrario.",
    "En caso de pagos parciales o pagos efectuados bajo modalidad mixta, el saldo pendiente continuará siendo exigible conforme las condiciones pactadas entre las partes.",
    "El presente comprobante es válido como recibo, aun sin firma manuscrita, conforme lo dispuesto por el Código Civil y Comercial de la Nación, al tratarse de una constancia oficial emitida por el acreedor y enviada por medios electrónicos.",
  ];

  aclaraciones.forEach(a => {
    const lineas = doc.splitTextToSize(a, CONTENT_WIDTH);
    doc.text(lineas, MARGIN_LEFT, y);
    y += lineas.length * 3.8 + 3;
  });

  y += 4;

  // ============================================================
  // 4. VALIDEZ, CONFORMIDAD Y FIRMA DIGITAL
  // ============================================================

  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(azulOscuro);
  doc.text("4. VALIDEZ, CONFORMIDAD Y FIRMA DIGITAL", MARGIN_LEFT, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(negro);

  const textosFirma = [
    "El cliente declara haber recibido el presente recibo por medios electrónicos (WhatsApp, correo electrónico u otros medios digitales), prestando su conformidad con los importes, conceptos y condiciones aquí consignadas, sin necesidad de firma ológrafa.",
    "Las partes acuerdan que el presente documento podrá ser suscripto mediante firma digital y/o electrónica, conforme a la Ley N° 25.506, reconociendo plena validez jurídica a dicha modalidad. En consecuencia, las partes aceptan que la firma digital o electrónica producirá los mismos efectos que la firma manuscrita, obligándose plenamente desde su aceptación, renunciando expresamente a desconocer su validez por el solo hecho de haberse instrumentado en formato digital. El presente documento digital tendrá carácter de original y plena eficacia probatoria.",
  ];

  textosFirma.forEach(t => {
    const lineas = doc.splitTextToSize(t, CONTENT_WIDTH);
    doc.text(lineas, MARGIN_LEFT, y);
    y += lineas.length * 3.8 + 3;
  });

  y += 10;

  // ============================================================
  // DATOS DE LA EMPRESA
  // ============================================================
  // (Sin firma del cliente - la empresa emite el recibo)

  if (y > 240) {
    doc.addPage();
    y = 30;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(azulOscuro);
  doc.text("COMUNIDAD IPHONE", PAGE_WIDTH / 2, y, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(gris);
  doc.text("Patagonia N° 695 · Santiago del Estero (CP 4200)", PAGE_WIDTH / 2, y + 5, { align: "center" });
  doc.text("Tel: 385 317-6107 · comunidadahorrosgo@gmail.com", PAGE_WIDTH / 2, y + 10, { align: "center" });

  y += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(azul);
  doc.text("FIRMA AUTORIZADA Ley N° 25.506 — Firma Digital", PAGE_WIDTH / 2, y, { align: "center" });

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
      "COMUNIDAD IPHONE | Recibo Oficial de Pago | Santiago del Estero",
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

  const nombreArchivo = `recibo-pago-${apellidoArchivo}-${dniArchivo}.pdf`;

  doc.save(nombreArchivo);
};