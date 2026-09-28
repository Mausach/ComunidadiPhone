// src/Helpers/Comprovanteventa/ReciboCredito.js

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../assets/logocenter.png";

// ============================================================
// GENERADOR DE RECIBO OFICIAL DE CRÉDITO PERSONAL
// ============================================================
// Genera el Recibo Oficial de Crédito Personal para COMUNIDAD IPHONE.
// Aplica a ventas de tipo: sistema1 y sistema2.
//
// @param {Object} venta - Datos de la venta
// @param {string} firmaDataURL - Firma del cliente en formato dataURL (PNG)
// ============================================================


export const generarReciboCredito = (venta) => {
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
  const NORMAL_PAGE_TOP = 20;
  const FOOTER_Y = 286;

  const azulOscuro = "#021C5E";
  const azul = "#3483FA";
  const negro = "#222222";
  const gris = "#777777";
  const grisClaro = "#AAAAAA";
  const grisFondo = "#F5F7FB";
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

  let yActual = FIRST_PAGE_TOP;

  // ============================================================
  // DATOS DINÁMICOS
  // ============================================================

  const cliente = venta?.cliente || {};
  const producto = venta?.producto || {};
  const cuotas = venta?.cuotas || [];
  const pagos = venta?.pagos || [];
  const equipoCanje = venta?.equipoCanje || {};

  const nombreCliente = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "-";
  const dni = cliente.dni || "-";
  const domicilio = cliente.direccion || "-";
  const telefono = cliente.telefono || "-";

  const esSistema1 = venta?.tipoVenta === "sistema1";
  const esSistema2 = venta?.tipoVenta === "sistema2";

  // Fecha en letras
  const mesesLetras = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const fechaVenta = venta?.fechaRealizada ? new Date(venta.fechaRealizada) : new Date();
  const dia = fechaVenta.getDate();
  const mes = mesesLetras[fechaVenta.getMonth()];
  const anio = fechaVenta.getFullYear();

  // ============================================================
  // CÁLCULOS DE LA OPERACIÓN
  // ============================================================

  const montoTotal = venta?.montoTotal || 0;

  // ============================================================
  // ENTREGA INICIAL SEGÚN TIPO DE VENTA
  // ============================================================
  // Sistema 2: primera cuota pagada (seña)
  // Sistema 1: venta.montoPagado (pagos iniciales)
  // ============================================================
  let entregaInicial = 0;

  if (esSistema2 && cuotas.length > 0) {
    const primeraCuota = cuotas[0];
    entregaInicial = primeraCuota.montoPagado || primeraCuota.montoCuota || 0;
  } else {
    entregaInicial = venta?.montoPagado || 0;
  }

  // Separar montos por moneda
  let montoARS = entregaInicial;
  let montoUSD = 0;

  if (esSistema1) {
    montoARS = 0;
    pagos.forEach(p => {
      if (p.metodo === "dolares" || p.metodo === "dólares" || p.metodo === "usd") {
        montoUSD += p.monto;
      } else {
        montoARS += p.monto;
      }
    });
  }

  // Valor del equipo entregado (si aplica)
  const valorEquipoEntregado = equipoCanje?.valorTasado || 0;

  // Total financiado: suma de cuotas pendientes
  const saldoAFinanciar = cuotas
    .filter(c => c.estado_cuota === 'pendiente' || c.estado_cuota === 'pago parcial' || c.estado_cuota === 'no pagada')
    .reduce((sum, c) => sum + (c.montoCuota - (c.montoPagado || 0)), 0);

  const valorCuota = cuotas.length > 0 ? cuotas[0].montoCuota : 0;
  const cantidadCuotas = cuotas.length || 0;

  const frecuenciaMap = {
    mensual: "MENSUAL",
    quincenal: "QUINCENAL",
    semanal: "SEMANAL",
    diario: "DIARIO",
  };
  const frecuenciaTexto = frecuenciaMap[venta?.frecuenciaCuota] || "MENSUAL";

  // Formatear moneda
  const formatoMoneda = (v) => v ? `$${Number(v).toLocaleString("es-AR")}` : "$0";

  // Número a letras
  const numeroALetras = (numero) => {
    const unidades = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
    const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
    const especiales = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
    const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

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
  };

  const montoARSTexto = numeroALetras(Math.floor(montoARS));

  // Formas de pago del sistema
  const formasPago = [...new Set(pagos.map(p => p.metodo))];
  const esCombinado = formasPago.length > 1;

  // ============================================================
  // FUNCIONES AUXILIARES
  // ============================================================

  const dibujarEncabezado = () => {
    try {
      doc.addImage(logo, "PNG", 1, 10, 60, 35);
    } catch (error) {
      console.warn("No se pudo cargar el logo:", error);
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

    doc.setDrawColor(azul);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, 52, PAGE_WIDTH - MARGIN_RIGHT, 52);
  };

  const dibujarPiePagina = (numeroPagina, totalPaginas) => {
    doc.setDrawColor("#DDDDDD");
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT, 279, PAGE_WIDTH - MARGIN_RIGHT, 279);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(grisClaro);

    doc.text(
      "COMUNIDAD IPHONE | Recibo Oficial de Crédito Personal | Santiago del Estero",
      MARGIN_LEFT,
      FOOTER_Y
    );

    doc.text(
      `Página ${numeroPagina} de ${totalPaginas}`,
      PAGE_WIDTH - MARGIN_RIGHT,
      FOOTER_Y,
      { align: "right" }
    );
  };

  const nuevaPagina = () => {
    doc.addPage();
    yActual = NORMAL_PAGE_TOP;
  };

  const comprobarEspacio = (alturaNecesaria = 10) => {
    const limiteInferior = 273;
    if (yActual + alturaNecesaria > limiteInferior) {
      nuevaPagina();
      return true;
    }
    return false;
  };

  const agregarTexto = (texto, opciones = {}) => {
    const {
      fontSize = 8.5,
      color = negro,
      fontStyle = "normal",
      lineHeight = 3.8,
      spacingAfter = 4,
      align = "left",
      x = MARGIN_LEFT,
      width = CONTENT_WIDTH,
    } = opciones;

    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color);

    const lineas = doc.splitTextToSize(texto, width);
    const alturaTexto = lineas.length * lineHeight;

    comprobarEspacio(alturaTexto + spacingAfter);

    doc.text(lineas, x, yActual, { align, maxWidth: width });
    yActual += alturaTexto + spacingAfter;
  };

  const agregarTituloSeccion = (numero, titulo) => {
    comprobarEspacio(12);
    doc.setFillColor(azulOscuro);
    doc.roundedRect(MARGIN_LEFT, yActual - 3, CONTENT_WIDTH, 7, 1.5, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor("#FFFFFF");
    doc.text(`${numero}. ${titulo}`, MARGIN_LEFT + 3, yActual + 2);

    yActual += 9;
  };

  // ============================================================
  // ENCABEZADO Y TÍTULO
  // ============================================================

  dibujarEncabezado();
  yActual = FIRST_PAGE_TOP;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(azulOscuro);
  doc.text("RECIBO OFICIAL DE CRÉDITO PERSONAL", PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 6;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(gris);
  doc.text("Documento oficial — Comunidad iPhone", PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 10;

  // ============================================================
  // INTRODUCCIÓN
  // ============================================================

  agregarTexto(
    `En la ciudad Capital de Santiago del Estero, a los ${dia} días del mes de ${mes} del año ${anio}, COMUNIDAD IPHONE deja constancia de haber recibido de:`,
    {
      fontSize: 9,
      color: negro,
      fontStyle: "normal",
      lineHeight: 4,
      spacingAfter: 6,
    }
  );

  // ============================================================
  // DATOS DEL CLIENTE
  // ============================================================

  autoTable(doc, {
    startY: yActual,
    body: [
      ["Nombre y Apellido:", nombreCliente, "DNI:", dni],
      ["Domicilio:", domicilio, "Teléfono / WhatsApp:", telefono],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: negro,
      lineColor: "#DDDDDD",
      lineWidth: 0.2,
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 38, fillColor: grisFondo, fontSize: 8 },
      1: { cellWidth: 52 },
      2: { fontStyle: "bold", cellWidth: 38, fillColor: grisFondo, fontSize: 8 },
      3: { cellWidth: 52 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 6;

  // ============================================================
  // 1. ENTREGA INICIAL — DINERO
  // ============================================================

  agregarTituloSeccion("1", "ENTREGA INICIAL — DINERO");

  // Texto contextual según tipo de venta
  const textoEntrega = esSistema2
    ? "El cliente abona en este acto, en concepto de entrega inicial / anticipo (correspondiente a la primera cuota del plan), la suma de:"
    : "El cliente abona en este acto, en concepto de entrega inicial / anticipo, la suma de:";

  agregarTexto(textoEntrega, {
    fontSize: 8.5,
    color: negro,
    fontStyle: "normal",
    lineHeight: 3.8,
    spacingAfter: 4,
  });

  // Tabla con ARS y USD
  autoTable(doc, {
    startY: yActual,
    body: [
      [
        `$ ARS ${formatoMoneda(montoARS)}`,
        `(${montoARSTexto} PESOS)`
      ],
      [
        montoUSD > 0 ? `USD ${formatoMoneda(montoUSD)}` : "",
        montoUSD > 0 ? "(DÓLARES ESTADOUNIDENSES)" : ""
      ],
    ],
    margin: { left: MARGIN_LEFT + 10, right: MARGIN_RIGHT - 10 },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      textColor: negro,
      lineColor: "#DDDDDD",
      lineWidth: 0.2,
      halign: "center",
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 70 },
      1: { cellWidth: 70 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 4;

  // Forma de pago con checkboxes
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(negro);
  doc.text("mediante la siguiente forma de pago:", MARGIN_LEFT, yActual + 3);
  yActual += 7;

  const metodosCheck = [
    { key: "efectivo", label: "Efectivo" },
    { key: "transferencia", label: "Transferencia" },
    { key: "billetera_virtual", label: "Billetera virtual", aliases: ["cripto", "billetera"] },
    { key: "tarjeta_credito", label: "Tarjeta de crédito" },
    { key: "tarjeta_debito", label: "Tarjeta de débito" },
    { key: "financiera", label: "Financiera" },
    { key: "combinada", label: "Modalidad combinada" },
  ];

  doc.setFontSize(8.5);
  metodosCheck.forEach(m => {
    let marcado = false;

    // En sistema 2 la primera cuota siempre se paga en efectivo
    if (esSistema2 && m.key === "efectivo") {
      marcado = true;
    } else {
      formasPago.forEach(fp => {
        if (fp === m.key || (m.aliases && m.aliases.includes(fp))) marcado = true;
      });

      if (m.key === "combinada" && esCombinado) marcado = true;
    }

    if (marcado) {
      dibujarTildeVerde(MARGIN_LEFT + 3, yActual + 3, 3);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(verdeCheck);
      doc.text(m.label, MARGIN_LEFT + 8, yActual + 3);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(negro);
      doc.text(m.label, MARGIN_LEFT + 8, yActual + 3);
    }
    yActual += 5;
  });

  yActual += 3;

  // Observaciones
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(azulOscuro);
  doc.text("OBSERVACIONES:", MARGIN_LEFT, yActual + 3);
  yActual += 5;

  doc.setDrawColor("#CCCCCC");
  doc.setLineWidth(0.2);
  doc.line(MARGIN_LEFT, yActual, MARGIN_LEFT + CONTENT_WIDTH, yActual);
  yActual += 5;
  doc.line(MARGIN_LEFT, yActual, MARGIN_LEFT + CONTENT_WIDTH, yActual);
  yActual += 8;

  // ============================================================
  // 2. EQUIPO ENTREGADO COMO PARTE DE PAGO
  // ============================================================

  comprobarEspacio(50);

  agregarTituloSeccion("2", "EQUIPO ENTREGADO COMO PARTE DE PAGO");

  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(8);
  doc.setTextColor("#856404");
  doc.text("IMPORTANTE: (SOLAMENTE SI CORRESPONDE)", MARGIN_LEFT, yActual + 3);
  yActual += 6;

  agregarTexto(
    "Asimismo, el cliente entrega en este acto, como parte de pago, el siguiente equipo telefónico:",
    {
      fontSize: 8.5,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.8,
      spacingAfter: 4,
    }
  );

  autoTable(doc, {
    startY: yActual,
    body: [
      ["Marca", "Apple – iPhone", "Modelo", equipoCanje?.modelo || "___________"],
      ["Capacidad", equipoCanje?.capacidad || "___________", "Color", equipoCanje?.color || "___________"],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: negro,
      lineColor: "#DDDDDD",
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 30, fillColor: grisFondo, fontSize: 8 },
      1: { cellWidth: 60 },
      2: { fontStyle: "bold", cellWidth: 30, fillColor: grisFondo, fontSize: 8 },
      3: { cellWidth: 60 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 5;

  agregarTexto(
    "Las partes acuerdan asignar al equipo entregado como parte de pago el valor de:",
    {
      fontSize: 8.5,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.8,
      spacingAfter: 3,
    }
  );

  // Valor del equipo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(azulOscuro);
  doc.text(`Valor del equipo entregado: ${valorEquipoEntregado > 0 ? formatoMoneda(valorEquipoEntregado) : "$ ___________"}`, MARGIN_LEFT, yActual + 3);
  yActual += 6;

  agregarTexto(
    "Valor que se establece en función del estado y condiciones del dispositivo al momento de la entrega, y que se acepta como definitivo, salvo lo dispuesto para los supuestos de vicios ocultos.",
    {
      fontSize: 8,
      color: negro,
      fontStyle: "italic",
      lineHeight: 3.6,
      spacingAfter: 4,
    }
  );

  agregarTexto(
    "El cliente declara ser legítimo titular del equipo entregado, libre de gravámenes, bloqueos, denuncias o deudas, asumiendo plena responsabilidad por cualquier reclamo futuro.",
    {
      fontSize: 8,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.6,
      spacingAfter: 4,
    }
  );

  // Observaciones del equipo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(azulOscuro);
  doc.text("OBSERVACIONES:", MARGIN_LEFT, yActual + 3);
  yActual += 5;

  doc.setDrawColor("#CCCCCC");
  doc.setLineWidth(0.2);
  doc.line(MARGIN_LEFT, yActual, MARGIN_LEFT + CONTENT_WIDTH, yActual);
  yActual += 8;

  // ============================================================
  // 3. IMPORTE FINANCIADO — CRÉDITO PERSONAL
  // ============================================================

  comprobarEspacio(50);

  agregarTituloSeccion("3", "IMPORTE FINANCIADO — CRÉDITO PERSONAL");

  agregarTexto(
    "El saldo restante de la operación, luego de imputar la entrega inicial en dinero y/o el valor del equipo entregado como parte de pago, asciende a la suma de:",
    {
      fontSize: 8.5,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.8,
      spacingAfter: 4,
    }
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(azulOscuro);
  doc.text(`Total financiado: ${formatoMoneda(saldoAFinanciar)}`, MARGIN_LEFT, yActual + 3);
  yActual += 6;

  agregarTexto(
    "Importe que será financiado mediante crédito personal, conforme las condiciones pactadas en el contrato de crédito / solicitud de adhesión correspondiente, el cual el cliente declara haber firmado y aceptado.",
    {
      fontSize: 8,
      color: negro,
      fontStyle: "italic",
      lineHeight: 3.6,
      spacingAfter: 4,
    }
  );

  // Tabla resumen de cuotas
  autoTable(doc, {
    startY: yActual,
    head: [["CUOTAS", "IMPORTE POR CUOTA", "MODALIDAD"]],
    body: [[
      cantidadCuotas.toString(),
      formatoMoneda(valorCuota),
      frecuenciaTexto,
    ]],
    margin: { left: MARGIN_LEFT + 10, right: MARGIN_RIGHT - 10 },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 3,
      textColor: negro,
      lineColor: "#DDDDDD",
      lineWidth: 0.2,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: azulOscuro,
      textColor: "#FFFFFF",
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 5;

  // Forma de pago de cuotas
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(negro);
  doc.text("FORMA DE PAGO:", MARGIN_LEFT, yActual + 3);
  yActual += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(negro);
  doc.text("En Casa Central", MARGIN_LEFT + 8, yActual + 3);
  yActual += 5;
  doc.text("Mediante transferencia", MARGIN_LEFT + 8, yActual + 3);
  yActual += 5;
  doc.text("Débito Automático: _____________________________ (CBU o CVU)", MARGIN_LEFT + 8, yActual + 3);
  yActual += 8;

  // ============================================================
  // 4. ALCANCE DEL RECIBO
  // ============================================================

  comprobarEspacio(40);

  agregarTituloSeccion("4", "ALCANCE DEL RECIBO");

  agregarTexto("El presente recibo acredita:", {
    fontSize: 8.5,
    color: negro,
    fontStyle: "normal",
    lineHeight: 3.8,
    spacingAfter: 3,
  });

  agregarTexto("– La recepción del dinero indicado en el punto 1;", {
    fontSize: 8.5,
    color: negro,
    fontStyle: "normal",
    lineHeight: 3.8,
    spacingAfter: 2,
    x: MARGIN_LEFT + 3,
    width: CONTENT_WIDTH - 3,
  });

  agregarTexto("– La entrega del equipo detallado en el punto 2, en caso de corresponder;", {
    fontSize: 8.5,
    color: negro,
    fontStyle: "normal",
    lineHeight: 3.8,
    spacingAfter: 3,
    x: MARGIN_LEFT + 3,
    width: CONTENT_WIDTH - 3,
  });

  agregarTexto(
    "y no implica por sí solo la cancelación total de la obligación, quedando el cliente obligado al pago del saldo financiado en las cuotas convenidas.",
    {
      fontSize: 8.5,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.8,
      spacingAfter: 5,
    }
  );

  // ============================================================
  // 5. DECLARACIÓN Y CONFORMIDAD
  // ============================================================

  comprobarEspacio(30);

  agregarTituloSeccion("5", "DECLARACIÓN Y CONFORMIDAD");

  agregarTexto(
    "El cliente declara haber leído, comprendido y aceptado el presente recibo, prestando su conformidad con los importes, bienes entregados y condiciones aquí consignadas, sin reservas.",
    {
      fontSize: 8.5,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.8,
      spacingAfter: 5,
    }
  );

  // ============================================================
  // 6. FIRMA DIGITAL
  // ============================================================

  comprobarEspacio(30);

  agregarTituloSeccion("6", "FIRMA DIGITAL");

  agregarTexto(
    "Las partes acuerdan que el presente recibo podrá ser suscripto mediante firma digital y/o electrónica, conforme a la Ley N° 25.506, reconociendo plena validez jurídica a dicha modalidad. El cliente acepta que dicha firma producirá los mismos efectos que la firma ológrafa, obligando plenamente desde su aceptación, renunciando a desconocer su validez por el solo hecho de haberse instrumentado en formato digital. El documento digital tendrá carácter de original y plena eficacia probatoria.",
    {
      fontSize: 8,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.7,
      spacingAfter: 5,
    }
  );

  // ============================================================
  // (Sin firma del cliente - la empresa emite el recibo)
  // ============================================================

  comprobarEspacio(25);

  yActual += 15;

  // ============================================================
  // DATOS DE LA EMPRESA
  // ============================================================

  comprobarEspacio(25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(azulOscuro);
  doc.text("COMUNIDAD IPHONE", PAGE_WIDTH / 2, yActual, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(gris);
  doc.text("Patagonia N° 695 · Santiago del Estero (CP 4200)", PAGE_WIDTH / 2, yActual + 5, { align: "center" });
  doc.text("Tel: 385 317-6107 · comunidadahorrosgo@gmail.com", PAGE_WIDTH / 2, yActual + 10, { align: "center" });

  yActual += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(azul);
  doc.text("FIRMA AUTORIZADA Ley N° 25.506 — Firma Digital", PAGE_WIDTH / 2, yActual, { align: "center" });

  // ============================================================
  // PIE DE TODAS LAS PÁGINAS
  // ============================================================

  const totalPaginas = doc.getNumberOfPages();

  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina);
    dibujarPiePagina(pagina, totalPaginas);
  }

  // ============================================================
  // GUARDAR PDF
  // ============================================================

  const apellidoArchivo = cliente.apellido || cliente.nombre || "cliente";
  const dniArchivo = cliente.dni || "";

  const nombreArchivo = `recibo-credito-${apellidoArchivo}-${dniArchivo}.pdf`;

  doc.save(nombreArchivo);
};