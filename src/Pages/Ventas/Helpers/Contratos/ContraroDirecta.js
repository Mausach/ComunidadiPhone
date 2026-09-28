// src/Helpers/contratos/generarContratoVentaDirecta.js

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../assets/logocenter.png";

// ============================================================
// GENERADOR DE CONTRATO DE VENTA DIRECTA
// ============================================================
// Genera el Contrato de Compraventa de Teléfono Celular
// (Sellado o Usado) para COMUNIDAD IPHONE.
//
// @param {Object} venta - Datos de la venta (con cliente, producto, pagos, etc.)
// @param {string} firmaDataURL - Firma del cliente en formato dataURL (PNG)
// ============================================================

export const generarContratoVentaDirecta = (venta, firmaDataURL) => {
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
  const FIRST_PAGE_TOP = 48;
  const NORMAL_PAGE_TOP = 20;
  const FOOTER_Y = 286;

  const azulOscuro = "#021C5E";
  const azul = "#3483FA";
  const negro = "#222222";
  const gris = "#777777";
  const grisClaro = "#AAAAAA";

  let yActual = FIRST_PAGE_TOP;

  // ============================================================
  // DATOS DINÁMICOS
  // ============================================================

  const cliente = venta?.cliente || {};
  const producto = venta?.producto || {};

  const nombreCliente = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "-";
  const dni = cliente.dni || "-";
  const domicilio = cliente.direccion || "................................................";

  // Detectar tipo: sellado o usado
  const esSellado = producto.estado === "sellado";

  const tituloDocumento = esSellado
    ? "de Teléfono Celular Sellado"
    : "de Teléfono Celular Usado";

  const objetoTexto = esSellado
    ? "un teléfono celular EN CAJA SELLADA SIN USO marca Apple — iPhone"
    : "un teléfono celular USADO, marca Apple — iPhone";

  // ============================================================
  // FORMATEAR FECHA EN LETRAS
  // ============================================================

  const mesesLetras = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const fechaVenta = venta?.fechaRealizada ? new Date(venta.fechaRealizada) : new Date();
  const dia = fechaVenta.getDate();
  const mes = mesesLetras[fechaVenta.getMonth()];
  const anio = fechaVenta.getFullYear();

  // ============================================================
  // FORMATEAR MONEDA
  // ============================================================

  const formatoMoneda = (valor) => {
    if (valor === null || valor === undefined || valor === "") return "$0";
    const numero = Number(valor);
    if (Number.isNaN(numero)) return `$${valor}`;
    return `$${numero.toLocaleString("es-AR")}`;
  };

  const precioTexto = formatoMoneda(venta?.montoTotal);

  // ============================================================
  // FORMATEAR MÉTODOS DE PAGO
  // ============================================================

  const metodosPagoTexto = (() => {
    if (!Array.isArray(venta?.pagos) || venta.pagos.length === 0) return "efectivo";

    const metodos = venta.pagos
      .map(p => p.metodo)
      .filter(m => m && m.trim() !== "");

    // Únicos, sin repetir
    const unicos = [...new Set(metodos)];

    return unicos.join(", ");
  })();

  // ============================================================
  // FUNCIONES AUXILIARES
  // ============================================================

  const dibujarEncabezadoPrimeraPagina = () => {
    try {
      doc.addImage(logo, "PNG", -5, 3, 60, 35);
    } catch (error) {
      console.warn("No se pudo cargar el logo:", error);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(azulOscuro);
    doc.text("COMUNIDAD IPHONE", 42, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(gris);
    doc.text("Patagonia 695, Sgo. del Estero", 42, 21);
    doc.text("Tel: 385 317-6107", 42, 26);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(azulOscuro);
    doc.text("CONTRATO DE COMPRAVENTA", 198, 15, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(gris);
    doc.text(esSellado ? "Teléfono Celular Sellado" : "Teléfono Celular Usado", 198, 21, { align: "right" });

    doc.setDrawColor(azul);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, 36, PAGE_WIDTH - MARGIN_RIGHT, 36);
  };

  const dibujarPiePagina = (numeroPagina, totalPaginas) => {
    doc.setDrawColor("#DDDDDD");
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT, 279, PAGE_WIDTH - MARGIN_RIGHT, 279);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(grisClaro);

    doc.text(
      "COMUNIDAD IPHONE | Contrato de Compraventa | Santiago del Estero",
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
      fontSize = 9,
      color = negro,
      fontStyle = "normal",
      lineHeight = 4,
      spacingAfter = 5,
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

  const agregarTituloClausula = (titulo) => {
    comprobarEspacio(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(azulOscuro);
    doc.text(titulo, MARGIN_LEFT, yActual);
    yActual += 6;
  };

  const agregarParrafo = (texto) => {
    agregarTexto(texto, {
      fontSize: 8.6,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.9,
      spacingAfter: 5,
    });
  };

  // ============================================================
  // PÁGINA 1 - ENCABEZADO Y TÍTULO
  // ============================================================

  dibujarEncabezadoPrimeraPagina();
  yActual = FIRST_PAGE_TOP;

  // Título principal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(azulOscuro);
  doc.text("CONTRATO DE COMPRAVENTA", PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(gris);
  doc.text(tituloDocumento, PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 12;

  // ============================================================
  // INTRODUCCIÓN
  // ============================================================

  agregarParrafo(
    `En la ciudad Capital, provincia de Santiago del Estero, a los ${dia} días del mes de ${mes} del año ${anio}, entre la EMPRESA COMUNIDAD IPHONE, con domicilio comercial en calle Patagonia 695 de la ciudad capital de nuestra provincia, en adelante denominada LA VENDEDORA y el/la Sr./Sra. ${nombreCliente}, DNI N° ${dni}, con domicilio real en ${domicilio}, en adelante COMPRADOR, se conviene en celebrar el presente boleto de Compra Venta, el cual se regirá por las siguientes cláusulas y conforme a las disposiciones legales del Código Civil y Comercial de la Nación.`
  );

  // ============================================================
  // PRIMERA — OBJETO
  // ============================================================

  agregarTituloClausula("PRIMERA — OBJETO");

  agregarParrafo(
    `La VENDEDORA vende al COMPRADOR ${objetoTexto}, cuyas características son las siguientes:`
  );

  // Tabla de características
  comprobarEspacio(25);

  autoTable(doc, {
    startY: yActual,
    head: [["Modelo", "Capacidad de Almacenamiento", "Condición de Batería", "Color", "Estado", "N° de IMEI"]],
    body: [[
      producto.modelo || "-",
      producto.capacidad || "-",
      producto.bateria || "-",
      producto.color || "-",
      producto.estado || "-",
      producto.imei || "-"
    ]],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 2.5,
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
      fontSize: 7.5,
      halign: "center",
    },
    alternateRowStyles: { fillColor: "#F5F5F5" },
  });

  yActual = doc.lastAutoTable.finalY + 8;

  // ============================================================
  // SEGUNDA — INFORMACIÓN AL CONSUMIDOR
  // ============================================================

  agregarTituloClausula("SEGUNDA — INFORMACIÓN AL CONSUMIDOR");

  agregarParrafo(
    "El COMPRADOR declara haber recibido por parte de LA VENDEDORA información cierta, clara, detallada y suficiente respecto del bien adquirido, su estado, funcionamiento, características, precio, condiciones de pago, garantía y exclusiones, conforme lo dispuesto por los artículos 4 y ccs. de la Ley 24.240 de Defensa del Consumidor. Asimismo, manifiesta haber sido atendido con trato digno y respetuoso, no habiendo mediado presión, engaño ni inducción alguna al momento de la celebración del presente acto."
  );

  // ============================================================
  // TERCERA — ACEPTACIÓN EXPRESA DEL PRODUCTO
  // ============================================================

  agregarTituloClausula("TERCERA — ACEPTACIÓN EXPRESA DEL PRODUCTO");

  agregarParrafo(
    "En cumplimiento de la normativa de defensa del consumidor, EL COMPRADOR declara haber recibido y examinado el bien en este acto, probado su funcionamiento, verificado su estado general y aceptarlo de manera expresa y voluntaria en las condiciones en que se encuentra, dejando constancia que el producto se ajusta a lo ofrecido por el VENDEDOR, conforme al artículo 5 de la Ley 24.240."
  );

  // ============================================================
  // CUARTA — PRECIO Y FORMA DE PAGO
  // ============================================================

  agregarTituloClausula("CUARTA — PRECIO Y FORMA DE PAGO");

  agregarParrafo(
    `El precio total convenido es de (${precioTexto}) abonado en este acto mediante ${metodosPagoTexto}, extendiéndose el recibo oficial de la empresa correspondiente.`
  );

  // ============================================================
  // QUINTA — GARANTÍA Y EXCLUSIONES DE COBERTURA
  // ============================================================

  agregarTituloClausula("QUINTA — GARANTÍA Y EXCLUSIONES DE COBERTURA");

  agregarParrafo(
    "La garantía aplicable se rige por el Certificado de Garantía entregado por separado como anexo al presente, aceptando expresamente sus alcances y exclusiones por EL COMPRADOR."
  );

  // ============================================================
  // SEXTA — LIMITACIÓN DE RESPONSABILIDAD
  // ============================================================

  agregarTituloClausula("SEXTA — LIMITACIÓN DE RESPONSABILIDAD");

  agregarParrafo(
    "Sin perjuicio de los derechos irrenunciables que reconoce la Ley 24.240, EL COMPRADOR acepta que la responsabilidad de LA VENDEDORA se limita exclusivamente a los alcances de la garantía otorgada y a las condiciones expresamente pactadas en el presente Boleto de Compraventa y en el Certificado de Garantía adjunto, quedando excluidos reclamos por hechos, daños, pérdidas, robos, usos indebidos, manipulaciones de terceros, alteraciones o circunstancias sobrevinientes posteriores a la entrega del bien y ajenos al control de LA VENDEDORA."
  );

  // ============================================================
  // SÉPTIMA — JURISDICCIÓN
  // ============================================================

  agregarTituloClausula("SÉPTIMA — JURISDICCIÓN");

  agregarParrafo(
    "Para cualquier cuestión judicial derivada del presente, las partes se someten a la jurisdicción de los Tribunales Ordinarios de la ciudad de Santiago del Estero, renunciando a cualquier otro fuero."
  );

  // ============================================================
  // OCTAVA — FIRMA DIGITAL
  // ============================================================

  agregarTituloClausula("OCTAVA — FIRMA DIGITAL");

  agregarParrafo(
    "Las partes acuerdan que el presente contrato podrá ser suscripto mediante firma digital y/o electrónica, conforme a la Ley N° 25.506, reconociendo plena validez jurídica a dicha modalidad. Asimismo, manifiestan que dicha firma producirá los mismos efectos que la firma ológrafa, obligándose plenamente desde su aceptación, renunciando a desconocer su validez por el solo hecho de haberse instrumentado en formato digital."
  );

  agregarParrafo(
    "El documento digital tendrá carácter de original y plena eficacia probatoria."
  );

  // ============================================================
  // FIRMA DEL CLIENTE
  // ============================================================

  comprobarEspacio(60);

  yActual += 10;

  // Insertar firma del cliente
  if (firmaDataURL) {
    try {
      doc.addImage(firmaDataURL, "PNG", 45, yActual, 120, 40);
    } catch (error) {
      console.warn("No se pudo insertar la firma del cliente:", error);
    }
  }

  yActual += 45;

  // Línea para firma
  doc.setDrawColor("#999999");
  doc.setLineWidth(0.3);
  doc.line(45, yActual, 165, yActual);

  yActual += 5;

  // Aclaración
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(negro);
  doc.text("Firma del Cliente", MARGIN_LEFT, yActual);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Aclaración: ${nombreCliente}`, MARGIN_LEFT, yActual + 5);
  doc.text(`DNI N°: ${dni}`, MARGIN_LEFT, yActual + 10);

  yActual += 18;

  // Datos de la empresa
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

  yActual += 15;

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

  const nombreArchivo = `contrato-compraventa-${apellidoArchivo}-${dniArchivo}.pdf`;

  doc.save(nombreArchivo);
};