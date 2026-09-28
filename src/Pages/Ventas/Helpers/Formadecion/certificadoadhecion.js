import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../assets/logocenter.png";


// ============================================================
// GENERADOR DE SOLICITUD DE ADHESIÓN
// ============================================================


export const generarSolicitudAdhesion = (venta, firmaClienteDataURL, firmaGaranteDataURL = null) => {
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
  const producto = venta?.producto || {};
  const garante = venta?.garante || {};
  const cuotas = venta?.cuotas || [];
  const pagos = venta?.pagos || [];
  const equipoCanje = venta?.equipoCanje || {};

  const nombreCliente = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "-";
  const nombreGarante = `${garante.nombre || ""} ${garante.apellido || ""}`.trim() || "-";
  const dni = cliente.dni || "-";
  const esSistema1 = venta?.tipoVenta === "sistema1";
  const esSistema2 = venta?.tipoVenta === "sistema2";
  const esPlanCanje = venta?.tipoVenta === "plan_canje";

  // Cálculos
  const montoTotal = venta?.montoTotal || 0;
  const sena = venta?.montoPagado || 0;

  const saldoAFinanciar = cuotas
    .filter(c => c.estado_cuota === 'pendiente' || c.estado_cuota === 'pago parcial' || c.estado_cuota === 'no pagada')
    .reduce((sum, c) => sum + (c.montoCuota - (c.montoPagado || 0)), 0);

  const valorCuota = cuotas.length > 0 ? cuotas[0].montoCuota : 0;

  const frecuenciaMap = {
    mensual: "Mensual",
    quincenal: "Quincenal",
    semanal: "Semanal",
    diario: "Diario",
  };
  const frecuenciaTexto = frecuenciaMap[venta?.frecuenciaCuota] || "-";

  const formasPago = [...new Set(pagos.map(p => p.metodo))];

  // Separar montos por moneda (para plan canje)
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

  const formatoFecha = (fecha) => {
    if (!fecha) return "-";
    const fechaObj = new Date(fecha);
    if (Number.isNaN(fechaObj.getTime())) return "-";
    return fechaObj.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
      "COMUNIDAD IPHONE | Solicitud de Adhesión | Santiago del Estero",
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
  doc.text("SOLICITUD DE ADHESIÓN", PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(gris);
  doc.text("Crédito Personal", PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 8;

  // ============================================================
  // DECLARACIÓN INICIAL
  // ============================================================

  agregarTexto(
    "El/la solicitante declara haber sido debidamente informado/a sobre las condiciones de la presente solicitud, las cuales conoce, comprende y acepta en su totalidad.",
    {
      fontSize: 8.5,
      color: negro,
      fontStyle: "italic",
      lineHeight: 3.8,
      spacingAfter: 6,
      align: "left",
      x: MARGIN_LEFT,
      width: CONTENT_WIDTH,
    }
  );

  yActual += 2;

  // ============================================================
  // 1. DATOS DEL SOLICITANTE
  // ============================================================

  agregarTituloSeccion("1", "DATOS DEL SOLICITANTE");

  autoTable(doc, {
    startY: yActual,
    body: [
      ["Apellido y Nombre completo", nombreCliente, "DNI", dni],
      ["CUIT / CUIL", cliente.cuil || "-", "Fecha de nacimiento", cliente.fechaNacimiento || "-"],
      ["E-mail", cliente.email || "-", "Celular principal", cliente.telefono || "-"],
      ["Celular alternativo", cliente.telefono2 || "-", "Código Postal", cliente.codigoPostal || "-"],
      ["Calle", cliente.direccion || "-", "Localidad", venta?.localidad || "-"],
      ["Provincia", "Santiago del Estero", "Estado civil", cliente.estadoCivil || "-"],
      ["Ocupación / Profesión", cliente.ocupacion || "-", "", ""],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      textColor: negro,
      lineColor: "#DDDDDD",
      lineWidth: 0.2,
      valign: "middle",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.5 },
      1: { cellWidth: 50 },
      2: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.5 },
      3: { cellWidth: 46 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 6;

  // ============================================================
  // 2. DATOS DEL EQUIPO ADQUIRIDO
  // ============================================================

  agregarTituloSeccion("2", "DATOS DEL EQUIPO ADQUIRIDO");

  autoTable(doc, {
    startY: yActual,
    body: [
      ["Modelo", producto.modelo || "-", "Capacidad (GB)", producto.capacidad || "-"],
      ["Color", producto.color || "-", "Condición batería", producto.bateria || "-"],
      ["IMEI", producto.imei || "-", "Condición del equipo", producto.estado || "-"],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      textColor: negro,
      lineColor: "#DDDDDD",
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.5 },
      1: { cellWidth: 50 },
      2: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.5 },
      3: { cellWidth: 46 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 4;

  // ============================================================
  // MODALIDAD (con tildes verdes)
  // ============================================================

  const esSellado = producto.estado === "sellado";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(negro);
  doc.text("Modalidad:", MARGIN_LEFT, yActual + 3);

  let modalidadX = MARGIN_LEFT + 25;
  const modalidadY = yActual + 3;

  // Sellado
  if (esSellado) {
    dibujarTildeVerde(modalidadX, modalidadY, 2.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(verdeCheck);
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(negro);
  }
  doc.text("Sellado", modalidadX + 4, modalidadY);
  modalidadX += 22;

  // Usado
  if (!esSellado) {
    dibujarTildeVerde(modalidadX, modalidadY, 2.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(verdeCheck);
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(negro);
  }
  doc.text("Usado", modalidadX + 4, modalidadY);
  modalidadX += 22;

  // Crédito
  if (esSistema1 || esSistema2) {
    dibujarTildeVerde(modalidadX, modalidadY, 2.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(verdeCheck);
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(negro);
  }
  doc.text("Crédito", modalidadX + 4, modalidadY);
  modalidadX += 22;

  // Canje
  if (esPlanCanje) {
    dibujarTildeVerde(modalidadX, modalidadY, 2.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(verdeCheck);
  } else {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(negro);
  }
  doc.text("Canje", modalidadX + 4, modalidadY);

  yActual += 10;

  // ============================================================
  // 3. DETALLE DE LA OPERACIÓN (SEGÚN TIPO DE VENTA)
  // ============================================================

  agregarTituloSeccion("3", "DETALLE DE LA OPERACIÓN");

  if (esSistema1 || esSistema2) {
    // ---------- CRÉDITO PERSONAL ----------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(azulOscuro);
    doc.text("Crédito Personal", MARGIN_LEFT, yActual + 3);
    yActual += 6;

    autoTable(doc, {
      startY: yActual,
      body: [
        ["Monto total ($)", formatoMoneda(montoTotal), "Seña / Anticipo ($)", formatoMoneda(sena)],
        ["Saldo a financiar ($)", formatoMoneda(saldoAFinanciar), "Valor de cada cuota ($)", formatoMoneda(valorCuota)],
      ],
      margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2,
        textColor: negro,
        lineColor: "#DDDDDD",
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.5 },
        1: { cellWidth: 50 },
        2: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.5 },
        3: { cellWidth: 46 },
      },
    });

    yActual = doc.lastAutoTable.finalY + 3;

    // ---- FRECUENCIA DE PAGO ----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(negro);
    doc.text("Frecuencia de pago:", MARGIN_LEFT, yActual + 3);

    let freqX = MARGIN_LEFT + 35;
    const freqY = yActual + 3;

    const frecuencias = [
      { key: "mensual", label: "Mensual" },
      { key: "quincenal", label: "Quincenal" },
      { key: "semanal", label: "Semanal" },
    ];

    frecuencias.forEach(fr => {
      const marcado = venta?.frecuenciaCuota === fr.key;
      if (marcado) {
        dibujarTildeVerde(freqX, freqY, 2.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(verdeCheck);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(negro);
      }
      doc.text(fr.label, freqX + 4, freqY);
      freqX += 25;
    });

    yActual += 7;

    // ---- FORMA DE PAGO ----
    doc.setFont("helvetica", "bold");
    doc.setTextColor(negro);
    doc.text("Forma de pago:", MARGIN_LEFT, yActual + 3);

    let formaX = MARGIN_LEFT + 28;
    const formaY = yActual + 3;

    const formas = [
      { keys: ["efectivo"], label: "Efectivo" },
      { keys: ["transferencia"], label: "Transferencia" },
      { keys: ["tarjeta_credito", "tarjeta_debito"], label: "Tarjeta" },
    ];

    const tieneOtro = !formasPago.some(fp =>
      ["efectivo", "transferencia", "tarjeta_credito", "tarjeta_debito"].includes(fp)
    );

    formas.forEach(fm => {
      const marcado = fm.keys.some(k => formasPago.includes(k));
      if (marcado) {
        dibujarTildeVerde(formaX, formaY, 2.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(verdeCheck);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(negro);
      }
      doc.text(fm.label, formaX + 4, formaY);
      formaX += 30;
    });

    if (tieneOtro) {
      dibujarTildeVerde(formaX, formaY, 2.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(verdeCheck);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(negro);
    }
    doc.text("Otro", formaX + 4, formaY);

    yActual += 10;

  } else if (esPlanCanje) {
    // ---------- PLAN CANJE ----------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(azulOscuro);
    doc.text("Plan Canje", MARGIN_LEFT, yActual + 3);
    yActual += 6;

    autoTable(doc, {
      startY: yActual,
      body: [
        ["Monto total del equipo nuevo ($)", formatoMoneda(montoTotal), "", ""],
        ["Diferencia abonada en pesos ($)", formatoMoneda(diferenciaARS), "Diferencia abonada en dólares (USD)", diferenciaUSD > 0 ? `USD ${diferenciaUSD.toLocaleString("es-AR")}` : ""],
      ],
      margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2,
        textColor: negro,
        lineColor: "#DDDDDD",
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.5 },
        1: { cellWidth: 50 },
        2: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.5 },
        3: { cellWidth: 46 },
      },
    });

    yActual = doc.lastAutoTable.finalY + 3;

    // ---- FORMA DE PAGO DE LA DIFERENCIA ----
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(negro);
    doc.text("Forma de pago de la diferencia:", MARGIN_LEFT, yActual + 3);

    let formaX = MARGIN_LEFT + 55;
    const formaY = yActual + 3;

    const formas = [
      { keys: ["efectivo"], label: "Efectivo" },
      { keys: ["transferencia"], label: "Transferencia" },
      { keys: ["tarjeta_credito", "tarjeta_debito"], label: "Tarjeta" },
    ];

    const tieneOtro = !formasPago.some(fp =>
      ["efectivo", "transferencia", "tarjeta_credito", "tarjeta_debito"].includes(fp)
    );

    formas.forEach(fm => {
      const marcado = fm.keys.some(k => formasPago.includes(k));
      if (marcado) {
        dibujarTildeVerde(formaX, formaY, 2.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(verdeCheck);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(negro);
      }
      doc.text(fm.label, formaX + 4, formaY);
      formaX += 30;
    });

    if (tieneOtro) {
      dibujarTildeVerde(formaX, formaY, 2.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(verdeCheck);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(negro);
    }
    doc.text("Otro", formaX + 4, formaY);

    yActual += 10;
  }

  // ============================================================
  // TABLA DE FECHAS DE VENCIMIENTO (solo crédito personal)
  // ============================================================

  if (cuotas.length > 0 && (esSistema1 || esSistema2)) {
    comprobarEspacio(35);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(azulOscuro);
    doc.text(`Fechas de Vencimiento — Plan ${cuotas.length} Cuotas`, MARGIN_LEFT, yActual + 3);
    yActual += 7;

    const headerCuotas = cuotas.map((_, i) => `Cuota ${i + 1}`);
    const bodyCuotas = cuotas.map(c => formatoFecha(c.fechaCobro));

    autoTable(doc, {
      startY: yActual,
      head: [headerCuotas],
      body: [bodyCuotas],
      margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
      styles: {
        font: "helvetica",
        fontSize: 7,
        cellPadding: 2,
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
        fontSize: 7,
        halign: "center",
      },
    });

    yActual = doc.lastAutoTable.finalY + 5;

    // ============================================================
    // BONIFICACIÓN (solo sistema1, NO sistema2)
    // ============================================================

    if (esSistema1) {
      comprobarEspacio(12);

      doc.setFillColor("#FFF8E1");
      doc.roundedRect(MARGIN_LEFT, yActual, CONTENT_WIDTH, 9, 1.5, 1.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor("#856404");
      doc.text(
        "BONIFICACIÓN: PAGÁ AL DÍA Y TE AHORRÁS LA ÚLTIMA CUOTA",
        PAGE_WIDTH / 2,
        yActual + 5.5,
        { align: "center" }
      );

      yActual += 13;
    }
  }

  // ============================================================
  // PLAN CANJE — EQUIPO ENTREGADO (solo si es plan canje)
  // ============================================================

  if (esPlanCanje) {
    comprobarEspacio(35);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(azulOscuro);
    doc.text("Plan Canje — Equipo Entregado", MARGIN_LEFT, yActual + 3);
    yActual += 7;

    autoTable(doc, {
      startY: yActual,
      head: [["Modelo", "Color", "Capacidad (GB)", "Condición batería", "IMEI"]],
      body: [[
        equipoCanje?.modelo || "___________",
        equipoCanje?.color || "___________",
        equipoCanje?.capacidad || "___________",
        equipoCanje?.bateria || "___________",
        equipoCanje?.imei || "___________",
      ]],
      margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
      styles: {
        font: "helvetica",
        fontSize: 7.5,
        cellPadding: 3,
        textColor: negro,
        lineColor: "#DDDDDD",
        lineWidth: 0.2,
        halign: "center",
      },
      headStyles: {
        fillColor: grisFondo,
        textColor: azulOscuro,
        fontStyle: "bold",
        fontSize: 7.5,
        halign: "center",
      },
    });

    yActual = doc.lastAutoTable.finalY + 4;

    autoTable(doc, {
      startY: yActual,
      body: [
        ["Correo del equipo entregado", equipoCanje?.correo || "___________", "Contraseña", equipoCanje?.contrasena || "___________"],
      ],
      margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
      styles: {
        font: "helvetica",
        fontSize: 7.5,
        cellPadding: 2,
        textColor: negro,
        lineColor: "#DDDDDD",
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7 },
        1: { cellWidth: 50 },
        2: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7 },
        3: { cellWidth: 46 },
      },
    });

    yActual = doc.lastAutoTable.finalY + 6;
  }

  // ============================================================
  // 4. DATOS DEL GARANTE
  // ============================================================

  agregarTituloSeccion("4", "DATOS DEL GARANTE");

  autoTable(doc, {
    startY: yActual,
    body: [
      ["Apellido y Nombre completo", nombreGarante || "___________", "DNI", garante?.dni || "___________"],
      ["CUIT / CUIL", garante?.cuil || "___________", "Teléfono", garante?.telefono || "___________"],
      ["Relación con el solicitante", garante?.relacion || "___________", "Ocupación / Profesión", garante?.ocupacion || "___________"],
      ["Domicilio del Garante", garante?.direccion || "___________", "", ""],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      textColor: negro,
      lineColor: "#DDDDDD",
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.5 },
      1: { cellWidth: 50 },
      2: { fontStyle: "bold", cellWidth: 42, fillColor: grisFondo, fontSize: 7.5 },
      3: { cellWidth: 46 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 8;

  // ============================================================
  // PROTECCIÓN DE DATOS PERSONALES
  // ============================================================

  comprobarEspacio(30);

  doc.setFillColor(grisFondo);
  doc.roundedRect(MARGIN_LEFT, yActual - 2, CONTENT_WIDTH, 18, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(azulOscuro);
  doc.text("PROTECCIÓN DE DATOS PERSONALES — Ley N° 25.326", MARGIN_LEFT + 3, yActual + 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(negro);

  const textoProteccion = "El/la solicitante autoriza el tratamiento de sus datos personales para evaluación crediticia, gestión administrativa y verificación en bases de datos públicas o privadas, aceptando que su comportamiento de pago podrá ser informado ante incumplimiento.";
  const lineasProteccion = doc.splitTextToSize(textoProteccion, CONTENT_WIDTH - 6);
  doc.text(lineasProteccion, MARGIN_LEFT + 3, yActual + 8);

  yActual += 21;

  // Checkbox de términos con tilde verde
  dibujarTildeVerde(MARGIN_LEFT + 3, yActual, 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(verdeCheck);
  doc.text("He leído, comprendo y acepto los términos y condiciones del servicio.", MARGIN_LEFT + 8, yActual);

  yActual += 15;

  // ============================================================
  // FIRMAS (cliente + garante lado a lado)
  // ============================================================

  comprobarEspacio(70);

  const colIzqX = MARGIN_LEFT;
  const colDerX = PAGE_WIDTH / 2 + 5;
  const anchoCol = PAGE_WIDTH / 2 - MARGIN_LEFT - 5;

  const firmaYInicio = yActual;

  // ---------- FIRMA DEL SOLICITANTE (izquierda) ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(azulOscuro);
  doc.text("FIRMA DEL SOLICITANTE", colIzqX + anchoCol / 2, firmaYInicio, { align: "center" });

  if (firmaClienteDataURL) {
    try {
      doc.addImage(
        firmaClienteDataURL,
        "PNG",
        colIzqX + 5,
        firmaYInicio + 5,
        anchoCol - 10,
        30
      );
    } catch (error) {
      console.warn("No se pudo insertar la firma del cliente:", error);
    }
  }

  const lineFirmaY = firmaYInicio + 38;
  doc.setDrawColor("#999999");
  doc.setLineWidth(0.3);
  doc.line(colIzqX + 5, lineFirmaY, colIzqX + anchoCol - 5, lineFirmaY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(negro);
  doc.text(`Aclaración: ${nombreCliente}`, colIzqX, lineFirmaY + 5);
  doc.text(`DNI N°: ${dni}`, colIzqX, lineFirmaY + 10);

  // ---------- FIRMA DEL GARANTE (derecha) ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(azulOscuro);
  doc.text("FIRMA DEL GARANTE", colDerX + anchoCol / 2, firmaYInicio, { align: "center" });

  if (firmaGaranteDataURL) {
    try {
      doc.addImage(
        firmaGaranteDataURL,
        "PNG",
        colDerX + 5,
        firmaYInicio + 5,
        anchoCol - 10,
        30
      );
    } catch (error) {
      console.warn("No se pudo insertar la firma del garante:", error);
    }
  }

  doc.setDrawColor("#999999");
  doc.setLineWidth(0.3);
  doc.line(colDerX + 5, lineFirmaY, colDerX + anchoCol - 5, lineFirmaY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(negro);
  doc.text(`Aclaración: ${nombreGarante || "___________"}`, colDerX, lineFirmaY + 5);
  doc.text(`DNI N°: ${garante?.dni || "___________"}`, colDerX, lineFirmaY + 10);

  // ============================================================
  // (Sin bloque de empresa - los solicitantes son quienes firman)
  // ============================================================

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

  const nombreArchivo = `solicitud-adhesion-${apellidoArchivo}-${dniArchivo}.pdf`;

  doc.save(nombreArchivo);
};