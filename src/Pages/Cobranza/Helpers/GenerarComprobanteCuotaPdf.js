import logo from '../../../assets/logocenter.png'; // Ajustá la ruta a tu logo
import { jsPDF } from "jspdf";

// ============================================================
// GENERADOR DE COMPROBANTE DE PAGO DE CUOTA
// ============================================================
// Genera el Comprobante de Pago de Cuota para COMUNIDAD IPHONE.
// Se emite cuando el cliente abona una cuota del crédito personal.
//
// @param {Object} venta - Datos de la venta
// @param {Object} cuota - Datos de la cuota específica que se cobró
// @param {string} metodoPago - Método de pago (efectivo, transferencia, etc.)
// ============================================================

export const generarReciboPago = (venta, cuota, metodoPago) => {
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
  const grisFondo = "#F5F7FB";
  const verdeCheck = "#00A650";
  const rojoAlerta = "#DC3545";

  let y = FIRST_PAGE_TOP;

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

  const nombreCliente = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "-";
  const dni = cliente.dni || "-";
  const domicilio = cliente.direccion || "-";

  const numeroCuota = cuota?.numeroCuota || "-";
  const montoCuota = cuota?.montoCuota || 0;
  const totalRecargos = (cuota?.recargos || []).reduce((s, r) => s + (r.monto || 0), 0);
  const totalPagado = montoCuota + totalRecargos;

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
  const numeroRecibo = `REC-${anio}-${venta._id?.slice(-6).toUpperCase() || "000000"}-C${numeroCuota}`;

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
  doc.text("COMPROBANTE DE PAGO DE CUOTA", PAGE_WIDTH / 2, y, { align: "center" });

  y += 6;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(gris);
  doc.text("FORMATO DIGITAL", PAGE_WIDTH / 2, y, { align: "center" });

  y += 7;

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

  // Número de recibo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(azul);
  doc.text(`N° ${numeroRecibo}`, PAGE_WIDTH - MARGIN_RIGHT, y, { align: "right" });

  y += 11;

  // ============================================================
  // INTRODUCCIÓN
  // ============================================================

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

  doc.text(`Nombre y Apellido: ${nombreCliente}`, MARGIN_LEFT, y);
  y += 5;
  doc.text(`DNI: ${dni}`, MARGIN_LEFT, y);
  y += 5;
  doc.text(`Domicilio: ${domicilio}`, MARGIN_LEFT, y);
  y += 10;

  // ============================================================
  // 1. DETALLE DEL PAGO
  // ============================================================

  doc.setFillColor(azulOscuro);
  doc.roundedRect(MARGIN_LEFT, y - 3, CONTENT_WIDTH, 7, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor("#FFFFFF");
  doc.text("1. DETALLE DEL PAGO", MARGIN_LEFT + 3, y + 2);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(negro);

  // Producto
  doc.text(`Producto: ${producto.nombre || "-"} ${producto.modelo || ""}`.trim(), MARGIN_LEFT, y);
  y += 5;
  doc.text(`IMEI: ${producto.imei || "-"}`, MARGIN_LEFT, y);
  y += 7;

  // Número de cuota
  doc.setFont("helvetica", "bold");
  doc.text(`Cuota N°: `, MARGIN_LEFT, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${numeroCuota}`, MARGIN_LEFT + 20, y);
  y += 6;

  // Método de pago (con tilde verde)
  doc.setFont("helvetica", "bold");
  doc.text(`Método de pago:`, MARGIN_LEFT, y);
  
  // Dibujamos el tilde verde al lado del método
  const metodoTexto = metodoPago || cuota?.metodoPago || "-";
  dibujarTildeVerde(MARGIN_LEFT + 35, y, 3);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(verdeCheck);
  doc.text(metodoTexto.charAt(0).toUpperCase() + metodoTexto.slice(1), MARGIN_LEFT + 40, y);
  y += 6;

  // Montos
  doc.setFont("helvetica", "normal");
  doc.setTextColor(negro);
  doc.text(`Monto abonado: ${formatoMoneda(montoCuota)}`, MARGIN_LEFT, y);
  y += 5;

  if (totalRecargos > 0) {
    doc.setTextColor(rojoAlerta);
    doc.text(`Recargos: ${formatoMoneda(totalRecargos)}`, MARGIN_LEFT, y);
    y += 5;
    doc.setTextColor(negro);
  }

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(azulOscuro);
  doc.text(`Total pagado: ${formatoMoneda(totalPagado)}`, MARGIN_LEFT, y);
  y += 10;

  // ============================================================
  // 2. DATOS DE COBRANZA
  // ============================================================

  doc.setFillColor(azulOscuro);
  doc.roundedRect(MARGIN_LEFT, y - 3, CONTENT_WIDTH, 7, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor("#FFFFFF");
  doc.text("2. DATOS DE COBRANZA", MARGIN_LEFT + 3, y + 2);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(negro);

  doc.text(`Fecha de vencimiento: ${formatoFecha(cuota?.fechaCobro)}`, MARGIN_LEFT, y);
  y += 5;

  if (cuota?.fechaCobrada) {
    doc.text(`Fecha de cobro: ${formatoFecha(cuota.fechaCobrada)}`, MARGIN_LEFT, y);
    y += 5;
  }

  if (cuota?.cobrador?.nombre) {
    doc.text(`Cobrador: ${cuota.cobrador.nombre}`, MARGIN_LEFT, y);
    y += 5;
  }

  y += 8;

  // ============================================================
  // 3. ALCANCE DEL COMPROBANTE
  // ============================================================

  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(azulOscuro);
  doc.roundedRect(MARGIN_LEFT, y - 3, CONTENT_WIDTH, 7, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor("#FFFFFF");
  doc.text("3. ALCANCE DEL COMPROBANTE", MARGIN_LEFT + 3, y + 2);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(negro);

  const textosAlcance = [
    "El presente comprobante digital acredita exclusivamente la recepción del dinero correspondiente a la cuota indicada, por parte de COMUNIDAD IPHONE en la fecha consignada.",
    "El pago de esta cuota no implica por sí solo la cancelación total del crédito, salvo constancia expresa en contrario. El saldo pendiente continuará siendo exigible conforme las condiciones pactadas entre las partes.",
    "En caso de pago parcial o pago efectuado bajo modalidad mixta, el saldo restante de la cuota continuará siendo exigible en los plazos convenidos.",
    "El presente comprobante es válido como constancia de pago, conforme lo dispuesto por el Código Civil y Comercial de la Nación, al tratarse de una constancia oficial emitida por el acreedor.",
  ];

  textosAlcance.forEach(t => {
    const lineas = doc.splitTextToSize(t, CONTENT_WIDTH);
    doc.text(lineas, MARGIN_LEFT, y);
    y += lineas.length * 3.8 + 3;
  });

  y += 6;

  // ============================================================
  // 4. VALIDEZ Y FIRMA DIGITAL
  // ============================================================

  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(azulOscuro);
  doc.roundedRect(MARGIN_LEFT, y - 3, CONTENT_WIDTH, 7, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor("#FFFFFF");
  doc.text("4. VALIDEZ Y FIRMA DIGITAL", MARGIN_LEFT + 3, y + 2);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(negro);

  const textoValidez = "Las partes acuerdan que el presente comprobante podrá ser suscripto mediante firma digital y/o electrónica, conforme a la Ley N° 25.506, reconociendo plena validez jurídica a dicha modalidad. La firma digital o electrónica producirá los mismos efectos que la firma manuscrita, obligándose plenamente desde su aceptación, renunciando expresamente a desconocer su validez por el solo hecho de haberse instrumentado en formato digital. El presente documento digital tendrá carácter de original y plena eficacia probatoria.";

  const lineasValidez = doc.splitTextToSize(textoValidez, CONTENT_WIDTH);
  doc.text(lineasValidez, MARGIN_LEFT, y);
  y += lineasValidez.length * 3.8 + 6;

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
      "COMUNIDAD IPHONE | Comprobante de Pago de Cuota | Santiago del Estero",
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

  const nombreArchivo = `comprobante-cuota-${numeroCuota}-${apellidoArchivo}-${dniArchivo}.pdf`;

  doc.save(nombreArchivo);
};