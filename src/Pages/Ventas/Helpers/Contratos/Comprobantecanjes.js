// src/Helpers/Contratos/ComprobantePlanCanje.js

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../assets/logocenter.png";

// ============================================================
// GENERADOR DE COMPROBANTE DE PLAN CANJE
// ============================================================
// Genera el Comprobante de Plan Canje para COMUNIDAD IPHONE.
// Aplica a ventas de tipo: plan_canje.
//
// @param {Object} venta - Datos de la venta
// @param {string} firmaDataURL - Firma del cliente en formato dataURL (PNG)
// ============================================================

export const generarComprobantePlanCanje = (venta, firmaDataURL) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

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

  let yActual = FIRST_PAGE_TOP;

  // ============================================================
  // DIBUJAR TILDE VERDE
  // ============================================================
  const dibujarTildeVerde = (x, yTilde, tamano = 3) => {
    doc.setDrawColor(verdeCheck);
    doc.setLineWidth(0.5);

    doc.line(
      x,
      yTilde - tamano * 0.3,
      x + tamano * 0.35,
      yTilde - tamano * 0.05
    );

    doc.line(
      x + tamano * 0.35,
      yTilde - tamano * 0.05,
      x + tamano * 0.9,
      yTilde - tamano * 0.9
    );
  };

  // ============================================================
  // DATOS DINÁMICOS
  // ============================================================

  const cliente = venta?.cliente || {};
  const equipoCanje = venta?.equipoCanje || {};
  const pagos = venta?.pagos || [];

  const nombreCliente = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "-";
  const dni = cliente.dni || "-";
  const domicilio = cliente.direccion || "-";
  const telefono = cliente.telefono || "-";
  const email = cliente.email || "-";

  const mesesLetras = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const fechaVenta = venta?.fechaRealizada ? new Date(venta.fechaRealizada) : new Date();
  const dia = fechaVenta.getDate();
  const mes = mesesLetras[fechaVenta.getMonth()];
  const anio = fechaVenta.getFullYear();

  // ============================================================
  // CÁLCULOS
  // ============================================================

  const valorEquipoCanje = equipoCanje?.valorTasado || 0;

  let diferenciaARS = 0;
  let diferenciaUSD = 0;

  pagos.forEach(p => {
    if (p.metodo === "dolares" || p.metodo === "dólares" || p.metodo === "usd") {
      diferenciaUSD += p.monto;
    } else {
      diferenciaARS += p.monto;
    }
  });

  const formatoMoneda = (v) => v ? `$${Number(v).toLocaleString("es-AR")}` : "$0";

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

  const valorEnLetras = numeroALetras(Math.floor(valorEquipoCanje));

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
      "COMUNIDAD IPHONE | Comprobante de Plan Canje | Santiago del Estero",
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
    const limiteInferior = 275;
    if (yActual + alturaNecesaria > limiteInferior) {
      nuevaPagina();
      return true;
    }
    return false;
  };

  const agregarTexto = (texto, opciones = {}) => {
    const {
      fontSize = 8.2,
      color = negro,
      fontStyle = "normal",
      lineHeight = 3.5,
      spacingAfter = 3,
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

  const agregarTituloSeccion = (numero, titulo, conLetra = false) => {
    comprobarEspacio(9);
    doc.setFillColor(azulOscuro);
    doc.roundedRect(MARGIN_LEFT, yActual - 3, CONTENT_WIDTH, 6, 1.5, 1.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor("#FFFFFF");
    const prefix = conLetra ? numero : `${numero}.`;
    doc.text(`${prefix} ${titulo}`, MARGIN_LEFT + 3, yActual + 1.5);

    yActual += 7.5;
  };

  // ============================================================
  // ENCABEZADO Y TÍTULO
  // ============================================================

  dibujarEncabezado();
  yActual = FIRST_PAGE_TOP;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(azulOscuro);
  doc.text("COMPROBANTE DE PLAN CANJE", PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 6;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(gris);
  doc.text("Documento oficial — Comunidad iPhone", PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 9;

  // ============================================================
  // INTRODUCCIÓN
  // ============================================================

  agregarTexto(
    `En la ciudad Capital de Santiago del Estero, a los ${dia} días del mes de ${mes} del año ${anio}, COMUNIDAD IPHONE deja constancia de haber recibido de:`,
    {
      fontSize: 8.5,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.5,
      spacingAfter: 4,
    }
  );

  // ============================================================
  // A. DATOS DEL CLIENTE
  // ============================================================

  agregarTituloSeccion("A.", "DATOS DEL CLIENTE");

  autoTable(doc, {
    startY: yActual,
    body: [
      ["Nombre y Apellido completo", nombreCliente, "DNI", dni],
      ["Teléfono / WhatsApp", telefono, "E-mail", email],
      ["Domicilio", domicilio, "", ""],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    styles: {
      font: "helvetica",
      fontSize: 8.2,
      cellPadding: 1.5,
      textColor: negro,
      lineColor: "#DDDDDD",
      lineWidth: 0.2,
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.8 },
      1: { cellWidth: 52 },
      2: { fontStyle: "bold", cellWidth: 36, fillColor: grisFondo, fontSize: 7.8 },
      3: { cellWidth: 50 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 4;

  // ============================================================
  // 1. EQUIPO ENTREGADO COMO PARTE DE PAGO
  // ============================================================

  agregarTituloSeccion("1.", "EQUIPO ENTREGADO COMO PARTE DE PAGO");

  autoTable(doc, {
    startY: yActual,
    body: [
      ["Modelo", equipoCanje?.modelo || "___________", "Capacidad (GB)", equipoCanje?.capacidad || "___________"],
      ["Color", equipoCanje?.color || "___________", "Marca", "Apple – iPhone"],
      ["Condición batería", equipoCanje?.bateria || "___________", "IMEI", equipoCanje?.imei || "___________"],
      ["Condición general", equipoCanje?.estado || "___________", "Contraseña / ID Apple", "___________"],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    styles: {
      font: "helvetica",
      fontSize: 8.2,
      cellPadding: 1.5,
      textColor: negro,
      lineColor: "#DDDDDD",
      lineWidth: 0.2,
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.8 },
      1: { cellWidth: 52 },
      2: { fontStyle: "bold", cellWidth: 36, fillColor: grisFondo, fontSize: 7.8 },
      3: { cellWidth: 50 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 3.5;

  agregarTexto(
    "El cliente declara bajo juramento ser legítimo titular del equipo entregado, manifestando que el mismo:",
    {
      fontSize: 8.2,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.5,
      spacingAfter: 2.5,
    }
  );

  const checkboxes = [
    "No posee denuncia de robo o hurto",
    "No se encuentra bloqueado",
    "No registra deudas, planes impagos, gravámenes ni embargos",
    "Se encuentra en condiciones normales de uso conforme su antigüedad",
  ];

  checkboxes.forEach(cb => {
    dibujarTildeVerde(MARGIN_LEFT + 3, yActual + 3, 2.8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(negro);
    doc.text(cb, MARGIN_LEFT + 8, yActual + 3);
    yActual += 4;
  });

  yActual += 2;

  agregarTexto(
    "El cliente asume plena y exclusiva responsabilidad ante cualquier reclamo futuro de terceros relacionado con la titularidad, procedencia o situación legal del equipo entregado.",
    {
      fontSize: 8,
      color: negro,
      fontStyle: "italic",
      lineHeight: 3.4,
      spacingAfter: 4,
    }
  );

  // ============================================================
  // 2. VALOR ASIGNADO AL EQUIPO Y ENTREGA DE DINERO
  // ============================================================

  comprobarEspacio(45);

  agregarTituloSeccion("2.", "VALOR ASIGNADO AL EQUIPO Y ENTREGA DE DINERO");

  autoTable(doc, {
    startY: yActual,
    body: [
      ["Valor asignado al equipo ($)", formatoMoneda(valorEquipoCanje), "Importe en letras", `${valorEnLetras} PESOS`],
      ["Diferencia abonada en pesos ($)", formatoMoneda(diferenciaARS), "Diferencia abonada en dólares (USD)", diferenciaUSD > 0 ? `USD ${diferenciaUSD.toLocaleString("es-AR")}` : ""],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    styles: {
      font: "helvetica",
      fontSize: 8.2,
      cellPadding: 1.5,
      textColor: negro,
      lineColor: "#DDDDDD",
      lineWidth: 0.2,
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.8 },
      1: { cellWidth: 52 },
      2: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.8 },
      3: { cellWidth: 44 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 3;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  doc.setTextColor(negro);
  doc.text("Forma de pago de la diferencia:", MARGIN_LEFT, yActual + 3);
  yActual += 5.5;

  const metodosCheck = [
    { key: "efectivo", label: "Efectivo" },
    { key: "tarjeta_debito", label: "Tarjeta de débito" },
    { key: "billetera_virtual", label: "Billetera virtual", aliases: ["cripto", "billetera"] },
    { key: "tarjeta_credito", label: "Tarjeta de crédito" },
    { key: "transferencia", label: "Transferencia" },
    { key: "combinada", label: "Modalidad combinada" },
  ];

  doc.setFontSize(8.2);
  metodosCheck.forEach(m => {
    let marcado = false;

    formasPago.forEach(fp => {
      if (fp === m.key || (m.aliases && m.aliases.includes(fp))) marcado = true;
    });

    if (m.key === "combinada" && esCombinado) marcado = true;

    if (marcado) {
      dibujarTildeVerde(MARGIN_LEFT + 3, yActual + 3, 2.8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(verdeCheck);
      doc.text(m.label, MARGIN_LEFT + 8, yActual + 3);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(negro);
      doc.text(m.label, MARGIN_LEFT + 8, yActual + 3);
    }
    yActual += 4;
  });

  yActual += 3;

  agregarTexto(
    "El valor asignado al equipo es aceptado por las partes como definitivo y no sujeto a revisión posterior, salvo lo dispuesto en la cláusula de Vicios Ocultos. El importe entregado integra el precio total de la operación.",
    {
      fontSize: 8,
      color: negro,
      fontStyle: "italic",
      lineHeight: 3.4,
      spacingAfter: 4,
    }
  );

  // ============================================================
  // 3. ALCANCE DEL COMPROBANTE
  // ============================================================

  comprobarEspacio(30);

  agregarTituloSeccion("3.", "ALCANCE DEL COMPROBANTE");

  agregarTexto(
    "El presente comprobante acredita tanto la entrega del equipo detallado como la recepción del dinero consignado, constituyendo constancia suficiente de la modalidad de pago acordada en el marco del Plan Canje.",
    {
      fontSize: 8.2,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.5,
      spacingAfter: 3,
    }
  );

  agregarTexto(
    "Una vez firmado el presente, el cliente no tendrá derecho a exigir restitución, aun cuando la operación principal se encuentre sujeta a plazos, verificación o financiación. La entrega del equipo y del dinero se realiza en carácter irrevocable, sin perjuicio de las facultades de COMUNIDAD IPHONE previstas para los supuestos de vicios ocultos, irregularidades o incumplimientos.",
    {
      fontSize: 8.2,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.5,
      spacingAfter: 4,
    }
  );

  // ============================================================
  // 4. EXCLUSIÓN DE RESPONSABILIDAD
  // ============================================================

  comprobarEspacio(22);

  agregarTituloSeccion("4.", "EXCLUSIÓN DE RESPONSABILIDAD");

  agregarTexto(
    "COMUNIDAD IPHONE no asume responsabilidad alguna por información, datos personales, cuentas, archivos, fotografías o contenido almacenado en el equipo entregado, siendo obligación exclusiva del cliente haber efectuado el respaldo y eliminación de los mismos con anterioridad a la entrega.",
    {
      fontSize: 8.2,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.5,
      spacingAfter: 4,
    }
  );

  // ============================================================
  // 5. VICIOS OCULTOS
  // ============================================================

  comprobarEspacio(45);

  agregarTituloSeccion("5.", "VICIOS OCULTOS — RESPONSABILIDAD DEL CLIENTE");

  agregarTexto(
    "El cliente declara conocer y aceptar que el equipo ha sido recibido por COMUNIDAD IPHONE únicamente en base a una revisión visual y funcional básica, no siendo posible detectar al momento de la entrega vicios ocultos, fallas internas, daños de hardware o software, humedad, componentes no originales, bloqueos futuros u otros desperfectos no evidentes.",
    {
      fontSize: 8.2,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.5,
      spacingAfter: 3,
    }
  );

  agregarTexto(
    "El cliente asume plena responsabilidad, otorgando a COMUNIDAD IPHONE un plazo de SESENTA (60) DÍAS CORRIDOS desde la firma del presente para:",
    {
      fontSize: 8.2,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.5,
      spacingAfter: 3,
    }
  );

  agregarTexto(
    "a) Reclamar la cancelación de la operación, debiendo la empresa reintegrar al cliente la totalidad del dinero recibido y devolver el equipo vendido.",
    {
      fontSize: 8.2,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.5,
      spacingAfter: 2.5,
      x: MARGIN_LEFT + 3,
      width: CONTENT_WIDTH - 3,
    }
  );

  agregarTexto(
    "b) Asumir el costo total de la reparación o puesta en funcionamiento del equipo, cuando COMUNIDAD IPHONE opte por mantener la operación vigente.",
    {
      fontSize: 8.2,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.5,
      spacingAfter: 3,
      x: MARGIN_LEFT + 3,
      width: CONTENT_WIDTH - 3,
    }
  );

  agregarTexto(
    "Vencido el plazo sin observaciones, el equipo se considerará definitivamente aceptado, renunciando el cliente a efectuar reclamos posteriores por cualquier concepto vinculado al equipo entregado.",
    {
      fontSize: 8.2,
      color: negro,
      fontStyle: "italic",
      lineHeight: 3.5,
      spacingAfter: 4,
    }
  );

  // ============================================================
  // 6. DECLARACIÓN Y CONFORMIDAD
  // ============================================================

  comprobarEspacio(22);

  agregarTituloSeccion("6.", "DECLARACIÓN Y CONFORMIDAD");

  agregarTexto(
    "El cliente declara haber leído, comprendido y aceptado la totalidad de las condiciones del presente comprobante, prestando su conformidad sin reservas.",
    {
      fontSize: 8.2,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.5,
      spacingAfter: 3,
    }
  );

  dibujarTildeVerde(MARGIN_LEFT + 3, yActual + 3, 2.8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  doc.setTextColor(verdeCheck);
  doc.text("He leído y acepto la totalidad de las condiciones de este comprobante.", MARGIN_LEFT + 8, yActual + 3);
  yActual += 4;

  dibujarTildeVerde(MARGIN_LEFT + 3, yActual + 3, 2.8);
  doc.text("Acepto la validez de la firma digital conforme Ley N° 25.506.", MARGIN_LEFT + 8, yActual + 3);
  yActual += 8;

  // ============================================================
  // FIRMA DEL CLIENTE (centrada - formato Certificado)
  // ============================================================

  comprobarEspacio(60);

  yActual += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(azulOscuro);
  doc.text("FIRMA DEL CLIENTE", PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 3;

  if (firmaDataURL) {
    try {
      doc.addImage(
        firmaDataURL,
        "PNG",
        55,
        yActual + 2,
        100,
        22
      );
    } catch (error) {
      console.warn("No se pudo insertar la firma del cliente:", error);
    }
  }

  yActual += 27;

  // Línea de firma centrada
  doc.setDrawColor("#999999");
  doc.setLineWidth(0.3);
  doc.line(60, yActual, 150, yActual);

  yActual += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(negro);
  doc.text(`Aclaración: ${nombreCliente}`, PAGE_WIDTH / 2, yActual, { align: "center" });
  yActual += 4;
  doc.text(`DNI N°: ${dni}`, PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 10;

  // ============================================================
  // DATOS DE LA EMPRESA (centrados - formato Certificado)
  // ============================================================

  comprobarEspacio(20);

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

  const nombreArchivo = `comprobante-plan-canje-${apellidoArchivo}-${dniArchivo}.pdf`;

  doc.save(nombreArchivo);
};