// src/Helpers/contratos/generarCertificadoGarantia.js

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../assets/logocenter.png";

// ============================================================
// GENERADOR DE CERTIFICADO DE GARANTÍA
// ============================================================
// Genera el Certificado de Garantía para COMUNIDAD IPHONE.
// El texto es el mismo para equipos sellados y usados (Art. 2
// cubre la excepción de los sellados).
//
// @param {Object} venta - Datos de la venta
// @param {string} firmaDataURL - Firma del cliente en formato dataURL (PNG)
// ============================================================


export const generarCertificadoGarantia = (venta) => {
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

  let yActual = FIRST_PAGE_TOP;

  // ============================================================
  // DATOS DINÁMICOS
  // ============================================================

  const cliente = venta?.cliente || {};
  const producto = venta?.producto || {};

  const nombreCliente = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "-";
  const dni = cliente.dni || "-";

  // Fecha de entrega: sistema2 usa fechaEntrega, otros usan fechaRealizada
  const fechaParaCertificado = venta?.tipoVenta === "sistema2" && venta?.fechaEntrega
    ? venta.fechaEntrega
    : venta?.fechaRealizada;

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

  const fechaEntregaTexto = formatoFecha(fechaParaCertificado);

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
      "COMUNIDAD IPHONE | Certificado de Garantía | Santiago del Estero",
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

  const agregarTituloArticulo = (titulo) => {
    comprobarEspacio(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.2);
    doc.setTextColor(azulOscuro);
    doc.text(titulo, MARGIN_LEFT, yActual);
    yActual += 5;
  };

  const agregarParrafo = (texto) => {
    agregarTexto(texto, {
      fontSize: 8.3,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.6,
      spacingAfter: 3.5,
    });
  };

  const agregarLista = (texto) => {
    agregarTexto(`– ${texto}`, {
      fontSize: 8.3,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.6,
      spacingAfter: 2,
      x: MARGIN_LEFT + 3,
      width: CONTENT_WIDTH - 3,
    });
  };

  // ============================================================
  // ENCABEZADO Y TÍTULO
  // ============================================================

  dibujarEncabezado();
  yActual = FIRST_PAGE_TOP;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(azulOscuro);
  doc.text("CERTIFICADO DE GARANTÍA", PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 10;

  // ============================================================
  // DATOS DEL EQUIPO
  // ============================================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(azulOscuro);
  doc.text("DATOS DEL EQUIPO", MARGIN_LEFT, yActual);

  yActual += 5;

  autoTable(doc, {
    startY: yActual,
    head: [["Modelo", "Capacidad", "Color", "N° de IMEI", "Estado", "Fecha de Entrega"]],
    body: [[
      producto.modelo || "-",
      producto.capacidad || "-",
      producto.color || "-",
      producto.imei || "-",
      producto.estado || "-",
      fechaEntregaTexto
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
  // INTRODUCCIÓN
  // ============================================================

  agregarParrafo(
    "COMUNIDAD IPHONE, con domicilio comercial en Patagonia Nº 695, ciudad Capital de la provincia de Santiago del Estero, otorga el presente CERTIFICADO DE GARANTÍA, el cual forma parte integrante de la operación de compraventa realizada con el cliente que suscribe, y se rige por las siguientes cláusulas:"
  );

  // ============================================================
  // ARTÍCULO 1
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 1 — ALCANCE DE LA GARANTÍA");

  agregarParrafo(
    "COMUNIDAD IPHONE otorga una garantía limitada de SESENTA (60) DÍAS CORRIDOS, contados a partir de la fecha de entrega del equipo, la cual cubre únicamente fallas de origen vinculadas al software del dispositivo, siempre que dichas fallas no sean consecuencia de un uso indebido, negligente o contrario a las recomendaciones del fabricante."
  );

  agregarParrafo(
    "La garantía se limita exclusivamente a la reparación del defecto cubierto o cambio del equipo, no generando derecho a reintegro alguno de dinero."
  );

  // ============================================================
  // ARTÍCULO 2
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 2 — EQUIPOS SELLADOS DE FÁBRICA");

  agregarParrafo(
    "En el caso de equipos nuevos y sellados de fábrica, la garantía aplicable será la garantía oficial del fabricante Apple, conforme sus propios términos y condiciones."
  );

  agregarParrafo(
    "En dichos supuestos, cualquier reclamo deberá ser canalizado directamente por el cliente ante los servicios técnicos oficiales autorizados por Apple, no asumiendo COMUNIDAD IPHONE responsabilidad alguna por la gestión, tiempos o resultado de dicha garantía del fabricante."
  );

  // ============================================================
  // ARTÍCULO 3
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 3 — EXCLUSIONES DE GARANTÍA");

  agregarParrafo(
    "La garantía NO CUBRE, sin excepción alguna, los siguientes supuestos:"
  );

  agregarLista("Daños ocasionados por uso indebido, negligente o distinto al previsto por el fabricante.");
  agregarLista("Caídas, golpes, aplastamientos, roturas o deterioro físico del equipo.");
  agregarLista("Ingreso de líquidos, humedad o exposición a condiciones ambientales inadecuadas.");
  agregarLista("Fallas de display, módulo, táctil o batería ocasionadas por el uso normal o indebido.");
  agregarLista("Equipos con firmware, sistema operativo o placa alterados.");
  agregarLista("Instalación o utilización de software no recomendado o no autorizado por el fabricante.");
  agregarLista("Equipos abiertos, manipulados, reparados o intervenidos por terceros ajenos a COMUNIDAD IPHONE.");

  yActual += 3;

  // ============================================================
  // ARTÍCULO 4
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 4 — PROCEDIMIENTO PARA HACER USO DE LA GARANTÍA");

  agregarParrafo("Para hacer uso de la presente garantía, el cliente deberá:");

  agregarLista("Presentar el equipo en el local comercial de COMUNIDAD IPHONE.");
  agregarLista("Acompañar el presente Certificado de Garantía y el boleto de compra-venta.");
  agregarLista("Permitir la revisión técnica del equipo por parte del personal autorizado.");

  agregarParrafo(
    "La empresa se reserva el derecho de rechazar la garantía cuando se constate que el desperfecto se encuentra comprendido dentro de las exclusiones detalladas en el artículo precedente."
  );

  // ============================================================
  // ARTÍCULO 5
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 5 — EXCLUSIÓN DE RESPONSABILIDAD");

  agregarParrafo("COMUNIDAD IPHONE NO SE RESPONSABILIZA por:");

  agregarLista("Hurtos, robos o extravíos del equipo.");
  agregarLista("Daños ocurridos con posterioridad a la entrega.");
  agregarLista("Información, datos personales, archivos o contenido almacenado en el dispositivo.");
  agregarLista("Configuraciones, bloqueos, actualizaciones o incompatibilidades futuras del sistema.");

  agregarParrafo(
    "Asimismo, la empresa no se encuentra obligada a conservar, registrar ni respaldar el número de IMEI del equipo una vez efectuada la entrega del mismo al cliente."
  );

  // ============================================================
  // ARTÍCULO 6
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 6 — DERECHOS DEL CONSUMIDOR");

  agregarParrafo(
    "El cliente declara haber recibido información clara, cierta y suficiente respecto del alcance y limitaciones de la presente garantía, conforme a lo dispuesto por la Ley 24.240 de Defensa del Consumidor, manifestando su expresa conformidad con las condiciones aquí establecidas."
  );

  // ============================================================
  // ARTÍCULO 7
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 7 — REPARACIÓN DEL EQUIPO Y/O CAMBIO DEL MISMO");

  agregarParrafo(
    "Ante la verificación de un desperfecto comprendido dentro de la presente garantía, COMUNIDAD IPHONE podrá optar, a su exclusivo criterio técnico y comercial, por la reparación del equipo y/o el cambio del mismo, según la naturaleza de la falla detectada."
  );

  agregarParrafo(
    "La reparación del equipo constituirá la regla general, procediendo el cambio del equipo únicamente en forma excepcional, cuando la reparación no resulte técnica o razonablemente viable."
  );

  agregarParrafo(
    "En caso de corresponder la reparación, el plazo máximo para su realización será de TREINTA (30) DÍAS CORRIDOS, contados a partir de la fecha de recepción del equipo por parte de COMUNIDAD IPHONE, conforme los tiempos técnicos razonables que demande el diagnóstico, la reparación y/o la provisión de repuestos."
  );

  agregarParrafo(
    "Al momento de recibir el equipo para su reparación y/o eventual cambio, COMUNIDAD IPHONE emitirá un comprobante de recepción, en el cual se dejará constancia del estado general del equipo, las condiciones de entrega, las posibles fallas denunciadas por el cliente, así como la fecha y hora exactas de ingreso del producto."
  );

  agregarParrafo(
    "Dicho comprobante será firmado por la empresa y el cliente, quien declara su conformidad con la información allí consignada, constituyendo el mismo prueba suficiente del estado del equipo al momento de su recepción, no admitiéndose reclamos posteriores por daños, faltantes o desperfectos no consignados en dicho documento."
  );

  agregarParrafo(
    "En el supuesto excepcional de corresponder el cambio del equipo, el mismo se realizará exclusivamente sujeto a la disponibilidad de stock existente al momento del cambio, no pudiendo el cliente exigir un modelo, capacidad o color determinados."
  );

  agregarParrafo(
    "Asimismo, el cliente acepta expresamente que el color del equipo a entregar, en caso de cambio, quedará supeditado a la disponibilidad de stock, pudiendo recibir un equipo de igual modelo y características técnicas, aunque de color distinto al originalmente adquirido, sin que ello genere derecho a reclamo, compensación o reintegro alguno."
  );

  agregarParrafo(
    "Durante el plazo de reparación o gestión de cambio, el cliente no podrá exigir equipo de reemplazo, devolución del dinero ni compensación alguna, aceptando expresamente las condiciones aquí establecidas."
  );

  // ============================================================
  // ARTÍCULO 8
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 8 — FIRMA DIGITAL");

  agregarParrafo(
    "Las partes acuerdan que el presente contrato podrá ser suscripto mediante firma digital y/o electrónica, conforme a la Ley N° 25.506, reconociendo plena validez jurídica a dicha modalidad."
  );

  agregarParrafo(
    "Las partes aceptan que dicha firma producirá los mismos efectos que la firma ológrafa, obligándose plenamente desde su aceptación, renunciando a desconocer su validez por el solo hecho de haberse instrumentado en formato digital. El documento digital tendrá carácter de original y plena eficacia probatoria."
  );

  // ============================================================
  // ARTÍCULO 9
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 9 — ACEPTACIÓN");

  agregarParrafo(
    "El presente Certificado de Garantía ha sido leído, comprendido y aceptado en su totalidad por el cliente, quien presta su conformidad sin reservas."
  );

  // ============================================================
  // (Sin firma del cliente - la garantía la otorga la empresa)
  // ============================================================

  comprobarEspacio(20);

  yActual += 8;

  // ============================================================
  // DATOS DE LA EMPRESA
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

  const nombreArchivo = `certificado-garantia-${apellidoArchivo}-${dniArchivo}.pdf`;

  doc.save(nombreArchivo);
};