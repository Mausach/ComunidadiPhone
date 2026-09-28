// src/Helpers/Contratos/ContratoCredito.js

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../assets/logocenter.png";

// ============================================================
// GENERADOR DE CONTRATO DE CRÉDITO PERSONAL
// ============================================================
// Genera el Contrato de Crédito Personal para COMUNIDAD IPHONE.
// Aplica a ventas de tipo: sistema1 y sistema2.
//
// @param {Object} venta - Datos de la venta
// @param {string} firmaClienteDataURL - Firma del cliente (PNG base64)
// @param {string} firmaGaranteDataURL - Firma del garante (PNG base64) [solo sistema1]
// ============================================================

export const generarContratoCredito = (venta, firmaClienteDataURL, firmaGaranteDataURL = null) => {
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
  const garante = venta?.garante || {};

  const nombreCliente = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() || "-";
  const nombreGarante = `${garante.nombre || ""} ${garante.apellido || ""}`.trim() || "-";
  const dni = cliente.dni || "-";
  const domicilio = cliente.direccion || "-";
  const telefono = cliente.telefono || "";
  const email = cliente.email || "";

  const esSistema1 = venta?.tipoVenta === "sistema1";
  const mostrarGarante = esSistema1 && (venta?.requiereGarante || garante?.nombre);

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
      "COMUNIDAD IPHONE | Contrato de Crédito Personal | Santiago del Estero",
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

  const agregarTituloArticulo = (titulo) => {
    comprobarEspacio(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(azulOscuro);
    doc.text(titulo, MARGIN_LEFT, yActual);
    yActual += 5.5;
  };

  const agregarSubtitulo = (texto) => {
    comprobarEspacio(9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.7);
    doc.setTextColor(azulOscuro);
    doc.text(texto, MARGIN_LEFT, yActual);
    yActual += 4.5;
  };

  const agregarParrafo = (texto) => {
    agregarTexto(texto, {
      fontSize: 8.5,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.8,
      spacingAfter: 4,
    });
  };

  const agregarLista = (texto) => {
    agregarTexto(`– ${texto}`, {
      fontSize: 8.5,
      color: negro,
      fontStyle: "normal",
      lineHeight: 3.8,
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
  doc.text("CONTRATO DE CRÉDITO PERSONAL", PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(gris);
  doc.text("Condiciones Generales", PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 10;

  // ============================================================
  // INTRODUCCIÓN CON FECHA
  // ============================================================

  agregarParrafo(
    `En la ciudad Capital, provincia de Santiago del Estero, a los ${dia} días del mes de ${mes} del año ${anio}, COMUNIDAD IPHONE, con domicilio comercial en calle Patagonia Nº 695, ciudad Capital de Santiago del Estero, provincia de Santiago del Estero, en adelante "LA EMPRESA", establece las siguientes CONDICIONES GENERALES DE ADHESIÓN, las cuales regirán la relación contractual con el SOLICITANTE / ADHERENTE, quien declara conocerlas, comprenderlas y aceptarlas íntegramente al momento de la firma de la presente.`
  );

  agregarParrafo(
    "La presente solicitud constituye un instrumento preliminar y vinculante, sin perjuicio de los contratos, recibos, anexos y documentos complementarios que se suscriban."
  );

  // ============================================================
  // TABLA DE DATOS DEL SOLICITANTE Y PRODUCTO
  // ============================================================

  yActual += 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(azulOscuro);
  doc.text("DATOS DEL SOLICITANTE Y OPERACIÓN", MARGIN_LEFT, yActual);
  yActual += 5;

  autoTable(doc, {
    startY: yActual,
    body: [
      ["Nombre y Apellido:", nombreCliente, "DNI:", dni],
      ["Domicilio:", domicilio, "Teléfono:", telefono || "-"],
      ["Producto:", producto.nombre || "-", "Modelo:", producto.modelo || "-"],
      ["Capacidad:", producto.capacidad || "-", "Color:", producto.color || "-"],
      ["IMEI:", producto.imei || "-", "Estado:", producto.estado || "-"],
      ["Monto Total:", venta?.montoTotal ? `$${venta.montoTotal.toLocaleString("es-AR")}` : "$0", "Localidad:", venta?.localidad || "-"],
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
      0: { fontStyle: "bold", cellWidth: 32, fillColor: "#F5F7FB" },
      1: { cellWidth: 55 },
      2: { fontStyle: "bold", cellWidth: 32, fillColor: "#F5F7FB" },
      3: { cellWidth: 56 },
    },
  });

  yActual = doc.lastAutoTable.finalY + 8;

  // ============================================================
  // DEFINICIONES
  // ============================================================

  agregarTituloArticulo("DEFINICIONES");

  agregarSubtitulo("Solicitante — Adherente:");
  agregarParrafo(
    "Es toda persona de existencia física o jurídica que presenta debidamente llenada y firmada la Solicitud de Adhesión."
  );

  agregarSubtitulo("Adjudicatario:");
  agregarParrafo(
    "Es el adherente al que se le ha adjudicado un bien."
  );

  agregarSubtitulo("Sistema:");
  agregarParrafo(
    "Modalidad comercial ofrecida por LA EMPRESA para la adquisición de teléfonos celulares marca Apple-Iphone, ya sea mediante sistema de entrega inmediata, sistema de ahorro y/o plan canje, conforme a las condiciones aquí establecidas."
  );

  agregarSubtitulo("Documentación contractual:");
  agregarParrafo(
    "Conjunto integrado por la presente solicitud de adhesión, el contrato específico que corresponda, recibos de pagos, pagarés, comprobantes de plan canje y certificado de garantía, los cuales forman un todo indivisible."
  );

  // ============================================================
  // ARTÍCULO 1
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 1 — OBJETO");

  agregarParrafo(
    "La presente Solicitud de Adhesión tiene por objeto regular las condiciones bajo las cuales el SOLICITANTE, solicita su incorporación a los sistemas de crédito personal y/o sistema de ahorro administrados por COMUNIDAD IPHONE, destinados a la adquisición de teléfonos celulares marca Apple – iPhone, conforme la modalidad elegida."
  );

  // ============================================================
  // ARTÍCULO 2
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 2 — SISTEMA DE ENTREGA INMEDIATA");

  agregarParrafo(
    "Al ingresar a este sistema, el adherente deberá abonar en concepto de entrega un porcentaje del costo total financiado, que será recibida por el asesor comercial, supervisor autorizado y/o área administrativa, quien posteriormente le emitirá un recibo oficial con el sello de la empresa. El pago podrá hacerlo con dinero en efectivo (pesos y/o dólares), tarjetas de créditos y débitos, financieras, transferencias bancarias o de billeteras virtuales a la única cuenta oficial habilitada por la empresa que se comunicará previamente, como así también en especie con la entrega de un celular que cubra el porcentaje antedicho."
  );

  agregarParrafo(
    "El saldo pendiente, el adjudicatario lo abonará en cuotas consecutivas fijas y en pesos, conforme al plan de pago, cantidad de cuotas y periodicidad (semanal, quincenal, mensual) pactada, las cuales quedarán expresamente consignadas."
  );

  // ============================================================
  // ARTÍCULO 3
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 3 — SISTEMA DE AHORRO");

  agregarParrafo(
    "Ingresará al sistema en cuota número 1 y finalizará en cuota número 10. Durante este lapso de tiempo el adherente deberá abonar de forma mensual y consecutiva entre el día 1 y el día 10 de cada mes el monto de cuota acordado con el asesor comercial al momento de suscribirse, el cual estará plasmado en este contrato para su validez. En el supuesto que el vencimiento ocurriese en día no hábil, deberá efectivizarse el primer día hábil inmediato posterior. Los pagos deberán efectuarse en efectivo en el domicilio constituido de la empresa, mediante transferencia a la única cuenta oficial autorizada por la empresa o ante su cobrador oficial autorizado mediante el uso de los cupones o formularios que se le entregará en cada caso. La falta del Cupón de Pago y/o cualquier otra falencia para efectuar el mismo, no exime al Adherente o Adjudicatario de su obligación de efectuar el pago en tiempo y forma. La empresa carecerá de toda responsabilidad por pagos realizados por los Adherentes y Adjudicatarios a terceros y en especial a los asesores comerciales que pertenezcan a nuestra empresa, como así también a cobradores que no pertenezcan a nuestra empresa."
  );

  agregarSubtitulo("Entrega Pactada:");
  agregarParrafo(
    "La primera posibilidad de retirar el bien será en cuota número Nº6. Para esto el adherente deberá tener una conducta de pago (estar al día) y haber cumplido regular y consecutivamente sin interrupción mes a mes con su cuota. Se hará efectiva la entrega del equipo y por el saldo pendiente (si lo hubiese) se hará una financiación propia de la empresa."
  );

  agregarSubtitulo("Adelanto de Cuota:");
  agregarParrafo(
    "El adherente podrá adelantar hasta 1 cuotas desde el inicio al sistema de ahorro y hasta la finalización del saldo pendiente si lo hubiese."
  );

  agregarSubtitulo("Pedido y Retiro del Bien:");
  agregarParrafo(
    "La empresa Comunidad Ahorro asume plena obligación de entregar el Bien adjudicado dentro de los 20 (veinte) días corridos de haber cumplido el adherente con todos los requisitos establecidos en las presentes Condiciones Generales, a saber:"
  );

  agregarLista("1) Haber llenado y firmado debidamente el formulario de pedido de unidad.");
  agregarLista("2) Demostrar encontrarse al día con los pagos de todas las obligaciones asumidas, cuando sea requerido por la empresa.");
  agregarLista("3) Presentar un garante y/o fiador por el saldo deudor.");
  agregarLista("4) Presentar una boleta de impuesto que se encuentre al día y que coincida con el domicilio registrado por el solicitante y por el garante.");

  agregarParrafo(
    "El Adherente Adjudicatario deberá presentar la documentación requerida en la empresa, conjuntamente con la presentación del formulario de pedido del bien, dando así por cumplida esta obligación."
  );

  agregarParrafo(
    "Si el Adherente adjudicatario no ha presentado la totalidad de la documentación referida al término de los 30 (treinta) días corridos a partir del día siguiente de la notificación de adjudicación, será intimado por el término de 10 (diez) días corridos, bajo apercibimiento de invalidar la adjudicación. Una vez que el Adherente adjudicatario presenta la totalidad de la documentación que conforma la carpeta de crédito, la empresa notificará al Adherente adjudicatario la aceptación o no de la misma en el término de 24hs."
  );

  agregarSubtitulo("Entrega del bien:");
  agregarParrafo(
    "El Adjudicatario recibirá el bien en el domicilio de la empresa, previo cumplimiento de los siguientes requisitos:"
  );

  agregarLista("1) Los gastos de envío a domicilio, fuera de la ciudad Capital y Ciudad de La Banda de Santiago del Estero son a cargo del Adjudicatario y deberá abonarlos antes de tomar posesión del mismo.");
  agregarLista("2) La elección de marca, modelos y colores por parte del Adjudicatario será factible exclusivamente en caso de disponibilidad por parte de la empresa y a criterio de esta.");

  agregarSubtitulo("Extinción del contrato:");
  agregarParrafo(
    "Finalizado el plazo de vigencia del sistema, aquellos Adherentes que aún no hayan formalizado la adjudicación o no hubieran ingresado el pedido del bien, deberán hacerlo en el plazo de 10 (diez) días corridos de finalizado el plan, bajo apercibimiento de tener por resuelto el contrato sin necesidad de notificación fehaciente."
  );

  // ============================================================
  // ARTÍCULO 4
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 4 — CANCELACIÓN ANTICIPADA DE DEUDA");

  agregarParrafo(
    "El Adherente adjudicatario podrá solicitar a la empresa la cancelación anticipada de sus cuotas pendientes, sin cargo por Administración."
  );

  // ============================================================
  // ARTÍCULO 5
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 5 — CESIÓN DEL CRÉDITO");

  agregarParrafo(
    "El Solicitante o Adherente que se encuentre al día en el cumplimiento de sus obligaciones, o que por cualquier motivo no haya podido completar el sistema de ahorro o crédito, podrá solicitar la cesión de su Solicitud de Adhesión, junto con todos los derechos y obligaciones emergentes de la misma. La cesión no producirá efecto alguno frente a COMUNIDAD IPHONE si no ha sido expresamente autorizada por la empresa, mediante aceptación escrita, previa presentación de nota conjunta suscripta por el cedente y el cesionario, y siempre que ambos hayan dado cumplimiento a la totalidad de las obligaciones establecidas en la presente Solicitud de Adhesión y en las Condiciones Generales."
  );

  agregarParrafo(
    "La solicitud de cesión deberá instrumentarse mediante formulario y/o instrumento de cesión, con firmas del cedente y del cesionario, las cuales deberán: a) Estar certificadas por escribano público, o b) Ser suscriptas personalmente en el domicilio comercial de COMUNIDAD IPHONE, ante personal autorizado y/o gerentes de la empresa. El cesionario deberá cumplir con todos los requisitos crediticios, comerciales y administrativos exigidos por la empresa al momento de la cesión, quedando sujeto a evaluación y aprobación, sin que la cesión implique continuidad automática del vínculo contractual. COMUNIDAD IPHONE se reserva el derecho de aceptar o rechazar la cesión, a su exclusivo criterio, sin expresión de causa, sin que ello genere derecho a reclamo, indemnización o compensación alguna a favor del solicitante, adherente o cesionario. Hasta tanto la cesión no sea expresamente aprobada y formalizada, el cedente continuará siendo el único y exclusivo responsable frente a la empresa por el cumplimiento de todas las obligaciones emergentes de la Solicitud de Adhesión."
  );

  // ============================================================
  // ARTÍCULO 6
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 6 — REMBOLSO DEL SISTEMA DE AHORRO");

  agregarParrafo(
    "De no ser posible la adjudicación del bien, la empresa reembolsará el 20 % del ahorro efectuado durante la vigencia del sistema. La empresa comunicará los fondos a disposición para su reintegro mediante notificación fehaciente, mail o llamado telefónico. Los eventuales fondos serán puestos a disposición en el domicilio de la empresa dentro de las 72 horas hábiles posteriores a la notificación. En caso de no retirar el ahorro dentro de las 24hs posteriores a la notificación, el dinero ahorrado quedará para la empresa."
  );

  // ============================================================
  // ARTÍCULO 7
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 7 — CAMBIO DE MODELO");

  agregarParrafo(
    "El adherente podrá cambiar el modelo suscripto antes de recibir la adjudicación. Para esto deberá comunicar previamente con 30 (treinta) días de anticipación a la empresa. Esta cláusula estará sujeta al stock disponible de la empresa por lo que en caso de no ser posible el cambio de modelo comunicará al adjudicatario dentro de los 7 días anteriores al retiro del bien."
  );

  // ============================================================
  // ARTÍCULO 8
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 8 — SISTEMA DE PLAN CANJE");

  agregarParrafo(
    "El Adherente podrá entregar exclusivamente como parte de pago de la operación un teléfono celular marca Apple – iPhone, el cual será recibido, revisado y evaluado por el equipo técnico de COMUNIDAD IPHONE a fin de verificar su estado general, funcionamiento, procedencia y condiciones técnicas, para su posterior cotización comercial."
  );

  agregarParrafo(
    "La recepción del equipo no implica aceptación automática del mismo, quedando su valor sujeto a la verificación técnica y comercial efectuada por la empresa. Una vez superada dicha instancia, las partes acordarán el valor definitivo que se asignará al equipo entregado como parte de pago, el cual quedará debidamente consignado en el COMPROBANTE DE PLAN CANJE correspondiente."
  );

  agregarParrafo(
    "El saldo restante de la operación, una vez imputado el valor del equipo entregado, podrá ser abonado por el Adherente mediante alguna de las siguientes modalidades, a su elección y/o según lo aprobado por la empresa:"
  );

  agregarLista("a) Dinero en efectivo, ya sea en pesos o dólares estadounidenses;");
  agregarLista("b) Transferencia bancaria y/o billetera virtual;");
  agregarLista("c) Tarjetas de crédito y/o débito;");
  agregarLista("d) Financiera;");
  agregarLista("e) Crédito personal otorgado por COMUNIDAD IPHONE, conforme las condiciones pactadas en la presente Solicitud de Adhesión y demás documentación contractual.");

  agregarParrafo(
    "Toda la operatoria del Plan Canje, incluyendo la entrega del equipo, el valor asignado, la entrega de dinero y/o el saldo financiado, será documentada mediante el COMPROBANTE DE PLAN CANJE, el cual se integrará como ANEXO a la presente Solicitud de Adhesión, formando parte indivisible de la documentación contractual, otorgando plena fuerza legal y validez a la operación crediticia y obligando a las partes al estricto cumplimiento de todas las condiciones allí establecidas."
  );

  agregarParrafo(
    "El Adherente reconoce y acepta que, una vez entregado el equipo y firmado el Comprobante de Plan Canje, no tendrá derecho a exigir la restitución del mismo, aun cuando la operación principal se encuentre sujeta a plazos, verificación, aprobación o financiación, sin perjuicio de lo previsto para los supuestos de vicios ocultos."
  );

  // ============================================================
  // ARTÍCULO 9
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 9 — FECHA, LUGAR Y FORMA DE PAGO");

  agregarParrafo(
    "Para los pagos mensuales, el adherente deberá abonar entre el día 1 y el día 10 de cada mes, el monto de cuota acordado con el asesor comercial al momento de suscribirse, el cual estará plasmado en este contrato para su validez. En los demás casos (semanal y quincenal) deberá acordar con el asesor comercial el día de pago correspondiente y dejar asentado en la solicitud. En el supuesto que el vencimiento ocurriese en día no hábil, deberá efectivizarse el primer día hábil inmediato posterior. Los pagos podrán efectuarse en efectivo en el domicilio constituido de la empresa, mediante transferencia a la única cuenta oficial habilitada por la empresa o ante su cobrador oficial autorizado mediante el uso de los cupones o formularios que se le entregará en cada caso. La falta del Cupón de Pago y/o cualquier otra falencia para efectuar el mismo, no exime al Adherente o Adjudicatario de su obligación de efectuar el pago en tiempo y forma. La empresa carecerá de toda responsabilidad por pagos realizados por los Adherentes y Adjudicatarios a terceros y en especial a los asesores comerciales que pertenezcan a nuestra empresa, como así también a cobradores que no pertenezcan a nuestra empresa. Vencido el plazo de pago el adherente deberá abonar aparte de la cuota correspondiente los intereses descriptos en el art. 17."
  );

  // ============================================================
  // ARTÍCULO 10
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 10 — BENEFICIO POR PAGO ANTICIPADO");

  agregarParrafo(
    "Como beneficio comercial, COMUNIDAD IPHONE BONIFICARÁ EL VALOR DE LA ÚLTIMA CUOTA DEL CRÉDITO, a aquellos Adherentes que abonen la cuota correspondiente entre los días 1 y 5 inclusive de cada mes, beneficio que será aplicable exclusivamente a pagos mensuales, y no será acumulable con otros descuentos, promociones o beneficios."
  );

  // ============================================================
  // ARTÍCULO 11
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 11 — BENEFICIO POR CUMPLIMIENTO — SORTEO PRIVADO MENSUAL");

  agregarParrafo(
    "COMUNIDAD IPHONE realizará un sorteo privado y exclusivo destinado a los integrantes de la comunidad que mantengan sus pagos al día, entendiéndose como tales aquellos Adherentes que abonen su cuota mensual entre los días 1 y 10 inclusive de cada mes."
  );

  agregarParrafo(
    "Los Adherentes que abonen su cuota entre los días 1 y 5 de cada mes accederán al sorteo con triple (3) chance de participación, mientras que quienes abonen entre los días 6 y 10 participarán con una (1) chance."
  );

  agregarParrafo(
    "El sorteo se realizará el último día de cada mes, en el domicilio comercial de COMUNIDAD IPHONE, y será transmitido en vivo a través de la página oficial de Instagram de la empresa, mediante video en vivo, modalidad que el Adherente declara conocer y aceptar."
  );

  agregarSubtitulo("Presencia obligatoria");
  agregarParrafo(
    "Para acceder al beneficio, el Adherente deberá encontrarse presente en el video en vivo al momento de realizarse el sorteo."
  );

  agregarParrafo(
    "En caso de resultar favorecido y no encontrarse presente, el sorteo se considerará inválido respecto de dicho participante, procediéndose de inmediato a realizar un nuevo sorteo, repitiéndose dicha mecánica cuantas veces sea necesario hasta que resulte favorecido un participante que se encuentre presente en el vivo, sin derecho a reclamo alguno."
  );

  agregarSubtitulo("Premios");
  agregarParrafo(
    "Los premios a sortear podrán consistir, a exclusivo criterio de COMUNIDAD IPHONE, en uno o más de los siguientes beneficios:"
  );

  agregarLista("a) Productos de la marca Apple");
  agregarLista("b) Dinero en efectivo (pesos o dólares);");
  agregarLista("c) Vouchers o créditos a favor, aplicables al valor total o parcial de la cuota mensual;");
  agregarLista("d) Bonificaciones comerciales, promociones especiales u otros beneficios equivalentes.");

  agregarParrafo(
    "La determinación del premio específico correspondiente a cada sorteo quedará exclusivamente a cargo de COMUNIDAD IPHONE, quien lo informará al momento de su realización."
  );

  agregarSubtitulo("Entrega del beneficio");
  agregarParrafo(
    "La entrega del premio se realizará en el domicilio comercial de COMUNIDAD IPHONE, a partir del día hábil siguiente al sorteo."
  );

  agregarParrafo(
    "El Adherente favorecido contará con un plazo máximo de tres (3) días corridos para presentarse a retirar el premio."
  );

  agregarParrafo(
    "Vencido dicho plazo sin que el beneficio haya sido retirado, el mismo se considerará automáticamente perdido, sin derecho a reclamo, excepción, prórroga ni compensación alguna, quedando COMUNIDAD IPHONE liberada de toda obligación."
  );

  agregarSubtitulo("Facultad de modificación");
  agregarParrafo(
    "COMUNIDAD IPHONE se reserva el derecho de modificar, suspender o discontinuar el presente beneficio, así como de alterar su modalidad, premios o condiciones, por razones comerciales, operativas o de fuerza mayor, sin que ello genere derecho a reclamo alguno por parte de los Adherentes."
  );

  // ============================================================
  // ARTÍCULO 12
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 12 — IMPOSIBILIDAD DE PAGO");

  agregarParrafo(
    "En caso fortuito y/o de fuerza mayor o situaciones especiales en la que el adherente no pudiese continuar abonando las cuotas del crédito personal, la empresa tendrá la facultad de pedir la devolución del producto entregado sin derecho a rembolso y/o compensación económica alguna bajo ningún concepto o ajustar un plan de pago para que pueda continuar con la obligación asumida."
  );

  // ============================================================
  // ARTÍCULO 13
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 13 — CONDICIONES PARA EL CRÉDITO PERSONAL");

  agregarLista("El adherente deberá presentar un garante y/o fiador solidario en actividad con recibo de sueldo o monotributo. Este deberá acreditar un ingreso no inferior al triple de las cuotas que resten abonar, en todos los sistemas.");
  agregarLista("Tanto el adherente como su garante no deberán registrar informes con antecedentes negativos en Veraz, BCRA, NOSIS y el Instituto de informaciones comerciales.");
  agregarLista("Así mismo no deberán registrar juicios por cobro de pesos en instancias judiciales como demandados o tener embargos realizados en sus domicilios o en los recibos de sueldo.");

  // ============================================================
  // ARTÍCULO 14
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 14 — DOCUMENTACIÓN OBLIGATORIA");

  agregarParrafo(
    "El adherente para poder acceder al crédito personal de la empresa deberá reunir la siguiente documentación y requisitos:"
  );

  agregarLista("Firmar un pagaré sin protesto como compromiso de pago junto a su garante.");
  agregarLista("Acreditar su identidad y la de su garante con una copia de su DNI.");
  agregarLista("Deben presentar ambos la boleta del servicio de luz al día y que coincida con el domicilio registrado en el pagaré.");
  agregarLista("Deben dejar 2 números de teléfono cada uno de sus familiares más cercanos (padres, hijos, hermanos) como así también sus domicilios.");
  agregarLista("La empresa podrá solicitar fotografías del frente del domicilio consignado en el pagaré y/o referencias para poder llegar al inmueble.");

  // ============================================================
  // ARTÍCULO 15
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 15 — CONDICIONES DEL EQUIPO ENTREGADO");

  agregarParrafo(
    "Se deja establecido que en los productos entregados por la EMPRESA no pesa ninguna medida cautelar, embargo o gravamen. Asimismo no se encuentran denunciados el IMEI, son libre de empresas, Icloud y no tienen vicios ocultos. A su vez, el Adquirente aceptará el bien en las condiciones tanto estéticas como funcionales que la recibe."
  );

  // ============================================================
  // ARTÍCULO 16
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 16 — GARANTÍA DEL PRODUCTO");

  agregarParrafo(
    "Al momento de la adquisición del producto, se le otorgará un CERTIFICADO DE GARANTÍA por el tiempo de 60 días corridos. A excepción de equipos sellados (ya que el fabricante cubre garantía por 1 año)."
  );

  agregarSubtitulo("Alcance de la Garantía:");
  agregarLista("Cubrirá fallas de fábrica (Software).");

  agregarSubtitulo("Desperfectos que NO entran en garantía:");
  agregarLista("Desperfecto causado por el uso indebido, caídas, golpes, mojados o ingreso de líquido.");
  agregarLista("Problemas de display o módulo, táctil, batería ocasionados por el uso.");
  agregarLista("Placa con firmware alterado.");
  agregarLista("Instalación o uso de software no recomendado por las marcas fabricantes.");
  agregarLista("Los equipos manipulados por terceros.");

  agregarParrafo(
    "LA EMPRESA NO SE RESPONSABILIZA POR HURTOS O ROBOS DEL BIEN ADJUDICADO COMO ASÍ TAMBIÉN NO ESTARÁ OBLIGADA A GUARDAR EL IMEI Y CONTRASEÑAS DEL CELULAR ADQUIRIDO."
  );

  agregarParrafo(
    "En caso de presentarse una falla, el ADHERENTE deberá poner el equipo a disposición para su revisión exclusiva por el servicio técnico de LA EMPRESA."
  );

  agregarParrafo(
    "La garantía otorgada por LA EMPRESA estará sujeta a la condición esencial de que el equipo no haya sido abierto, intervenido, reparado ni manipulado por terceros ajenos al servicio técnico autorizado de LA EMPRESA. El incumplimiento de esta condición, o la constatación de intervención previa por parte de terceros no autorizados, implicará la pérdida automática de la garantía, sin derecho a reclamo alguno."
  );

  // ============================================================
  // ARTÍCULO 17
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 17 — INTERESES MORATORIOS Y PUNITORIOS");

  agregarParrafo(
    "En caso de atraso, mora o incumplimiento en el pago de cualquiera de las cuotas, importes o sumas adeudadas, el Adherente y/o Adjudicatario incurrirá en mora automática, sin necesidad de interpelación previa, y acepta expresamente la aplicación de intereses moratorios y punitorios por cada día de atraso."
  );

  agregarParrafo(
    "Dichos intereses se fijan inicialmente en la suma de $4.000 (pesos cuatro mil) por cada día de atraso, los cuales se devengarán desde el día siguiente al vencimiento de la obligación y se aplicarán durante todo el período en que subsista el incumplimiento."
  );

  agregarParrafo(
    "El Adherente reconoce y acepta que el monto del interés diario pactado podrá ser modificado y/o actualizado por COMUNIDAD IPHONE, en función de variaciones económicas, inflacionarias, financieras o de política interna de la empresa, comprometiendo la administración de la empresa a comunicar dicha modificación con la debida antelación a la fecha de vencimiento del pago correspondiente, por los medios habituales de contacto."
  );

  // ============================================================
  // ARTÍCULO 18
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 18 — REFINANCIACIÓN");

  agregarParrafo(
    "En caso de que el ADHERENTE incurra en mora equivalente a dos (2) cuotas impagas, LA EMPRESA podrá, a su exclusivo criterio, ofrecer una instancia de refinanciación extrajudicial del crédito, sin que ello implique obligación de otorgarla. La refinanciación constituye una instancia excepcional destinada a permitir la regularización de la deuda, evitando la inmediata judicialización del crédito."
  );

  agregarSubtitulo("a) RECONOCIMIENTO DE DEUDA");
  agregarParrafo(
    "El ADHERENTE reconoce en forma expresa, voluntaria e irrevocable la existencia, legitimidad y exigibilidad de la deuda, renunciando a cuestionamientos vinculados al origen de la obligación."
  );

  agregarSubtitulo("b) COMPOSICIÓN DEL SALDO");
  agregarParrafo(
    "El monto a refinanciar estará compuesto por la totalidad de los conceptos adeudados a la fecha de la refinanciación, incluyendo:"
  );

  agregarLista("cuotas vencidas e impagas,");
  agregarLista("intereses por mora devengados conforme lo pactado,");
  agregarLista("gastos administrativos derivados de la gestión de cobranza, los cuales se establecen en un diez por ciento (10%) sobre el monto adeudado,");
  agregarLista("honorarios profesionales generados por la intervención del área legal, los cuales se establecen en un veinte por ciento (20%) sobre el monto adeudado.");

  agregarParrafo(
    "El ADHERENTE declara conocer y aceptar que dichos conceptos responden a los costos reales del incumplimiento."
  );

  agregarSubtitulo("c) PAGO INICIAL OBLIGATORIO");
  agregarParrafo(
    "Como condición indispensable para acceder a la refinanciación, el ADHERENTE deberá abonar como mínimo el valor de una cuota inicial en forma inmediata, cuyo monto será determinado por LA EMPRESA en función del saldo adeudado. Dicho pago tendrá carácter de confirmación del acuerdo y será imputado a cuenta de la deuda consolidada."
  );

  agregarSubtitulo("d) PRORRATEO DEL SALDO");
  agregarParrafo(
    "El saldo restante, una vez efectuado el pago inicial, será distribuido entre las cuotas pendientes de pago, generando un nuevo valor de cuota. En función de ello, se establecerá un nuevo plan de pagos, el cual será informado al ADHERENTE, detallando:"
  );

  agregarLista("cantidad de cuotas,");
  agregarLista("monto de cada cuota.");
  agregarLista("fechas de vencimiento.");
  agregarLista("modalidad de pago.");

  agregarParrafo(
    "El ADHERENTE declara comprender que el valor de las nuevas cuotas podrá diferir del plan original, en función del saldo consolidado."
  );

  agregarSubtitulo("e) NATURALEZA DE LOS INTERESES");
  agregarParrafo(
    "El ADHERENTE reconoce que los intereses incluidos en la refinanciación no constituyen una penalidad, sino una compensación derivada del uso del capital fuera de término, el riesgo asumido por LA EMPRESA y los costos administrativos y profesionales generados por la mora."
  );

  agregarSubtitulo("f) CADUCIDAD DEL PLAN DE REFINANCIACIÓN");
  agregarParrafo(
    "El incumplimiento de cualquiera de las cuotas del nuevo plan producirá la caducidad automática del mismo, quedando LA EMPRESA facultada para:"
  );

  agregarLista("dar por vencidos todos los plazos,");
  agregarLista("exigir el pago total inmediato del saldo adeudado,");
  agregarLista("iniciar acciones judiciales sin necesidad de intimación previa.");

  agregarSubtitulo("g) INSTANCIA FINAL");
  agregarParrafo(
    "El ADHERENTE reconoce que la refinanciación constituye la última instancia extrajudicial de regularización, por lo que, en caso de incumplimiento, LA EMPRESA podrá iniciar directamente el cobro judicial sin otorgar nuevas facilidades."
  );

  // ============================================================
  // ARTÍCULO 19
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 19 — EJECUCIÓN JUDICIAL");

  agregarParrafo(
    "En caso de incumplimiento del plan de pago de refinanciación o llegado a la cuota número 2 (dos) y cuando el adherente mantenga este incumplimiento de pago, el contrato se considerará resuelto de pleno derecho, sin necesidad de notificación previa, quedando COMUNIDAD IPHONE habilitada para iniciar las acciones de cobro judicial contra el solicitante y/o el garante del pagaré sin protesto firmado por ambos, a través de vía ejecutiva, en donde las cuotas adeudadas, los intereses moratorios acumulados, intereses judiciales, gastos y costas del juicio y honorarios profesionales de los profesionales intervinientes serán a cargo del deudor y/o garante."
  );

  // ============================================================
  // ARTÍCULO 20
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 20 — CESIÓN DE CRÉDITO");

  agregarParrafo(
    "LA EMPRESA podrá ceder total o parcialmente el crédito a terceros, incluyendo estudios jurídicos o entidades de cobranza, sin necesidad de autorización del ADHERENTE."
  );

  agregarParrafo("El ADHERENTE acepta desde ya dicha posibilidad.");

  // ============================================================
  // ARTÍCULO 21
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 21 — OBLIGACIONES DEL ADHERENTE EN MATERIA DE CONTACTO");

  agregarParrafo("El ADHERENTE se obliga a:");

  agregarLista("a) Mantener actualizados sus datos personales y de contacto.");
  agregarLista("b) Atender las comunicaciones efectuadas por LA EMPRESA.");
  agregarLista("c) Informar de manera inmediata cualquier imposibilidad de pago.");
  agregarLista("d) Cumplir con las fechas pactadas sin necesidad de recordatorio previo.");

  agregarParrafo(
    "La falta de respuesta a los requerimientos de LA EMPRESA será considerada conducta evasiva y podrá habilitar el escalamiento del proceso de cobranza."
  );

  // ============================================================
  // ARTÍCULO 22
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 22 — DERECHO DEL CONSUMIDOR");

  agregarParrafo(
    "El Adherente declara haber recibido por parte de COMUNIDAD IPHONE información clara, cierta, detallada y suficiente respecto de las características del bien adquirido, condiciones de comercialización, modalidad de pago, plazos, intereses, cargos, garantías, exclusiones, procedimientos de reclamo y consecuencias del incumplimiento, en cumplimiento de lo dispuesto por la Ley Nº 24.240 de Defensa del Consumidor y normativa complementaria."
  );

  agregarParrafo(
    "Asimismo, el Adherente manifiesta que la presente Solicitud de Adhesión y la documentación contractual vinculada no le han sido impuestas, sino que han sido leídas, explicadas y aceptadas libremente, contando con la posibilidad de efectuar consultas previas, solicitar aclaraciones y evaluar alternativas antes de la firma."
  );

  agregarParrafo(
    "COMUNIDAD IPHONE deja constancia de que no condiciona la contratación a la renuncia de derechos reconocidos por la normativa vigente, comprometiéndose a respetar los principios de trato digno, información adecuada y protección de los intereses económicos del consumidor, dentro del marco legal aplicable."
  );

  agregarParrafo(
    "El Adherente reconoce que las condiciones aquí pactadas responden a un equilibrio razonable entre las partes, teniendo en cuenta la naturaleza del sistema, la financiación otorgada, los beneficios comerciales ofrecidos y las obligaciones asumidas."
  );

  // ============================================================
  // ARTÍCULO 23
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 23 — CONSENTIMIENTO PARA USO DE IMAGEN Y CONTENIDO DIGITAL");

  agregarParrafo(
    "El Adherente presta su consentimiento expreso, libre e informado para que COMUNIDAD IPHONE pueda tomar fotografías, grabar imágenes y/o videos al momento de la entrega del equipo, adjudicación del bien, retiro de premios, sorteos o cualquier instancia vinculada a la operación comercial."
  );

  agregarParrafo(
    "Dicho material podrá ser utilizado por COMUNIDAD IPHONE con fines comerciales, publicitarios, promocionales y de comunicación institucional, incluyendo, de manera enunciativa pero no limitativa, su publicación en redes sociales, página web, campañas digitales, material gráfico y audiovisual, sin derecho a retribución económica alguna por parte del Adherente."
  );

  agregarParrafo(
    "El Adherente reconoce que la utilización del material mencionado no afectará su honor, intimidad ni reputación, y autoriza su difusión por tiempo indeterminado, pudiendo revocar dicho consentimiento únicamente mediante notificación fehaciente, la cual no tendrá efectos retroactivos sobre publicaciones ya realizadas."
  );

  agregarParrafo(
    "COMUNIDAD IPHONE se compromete a realizar un uso responsable y respetuoso del material, conforme las buenas prácticas comerciales y la normativa vigente."
  );

  // ============================================================
  // ARTÍCULO 24
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 24 — DOMICILIO DE LA EMPRESA COMUNIDAD AHORRO");

  agregarParrafo(
    "Para todos los efectos legales, la empresa constituye domicilio legal en calle Patagonia Nº695 de la Ciudad Capital de la provincia de Santiago del Estero y el Adherente en el indicado en la Solicitud de Adhesión y/o pagaré firmado. Los cambios de domicilio no surtirán efecto alguno mientras no sean comunicados de manera fehaciente."
  );

  // ============================================================
  // ARTÍCULO 25
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 25 — JURISDICCIÓN");

  agregarParrafo(
    "Para todos los efectos derivados de la presente Solicitud de Adhesión, serán competentes los Tribunales Ordinarios de la provincia de Santiago del Estero, ciudad capital."
  );

  // ============================================================
  // ARTÍCULO 26
  // ============================================================

  agregarTituloArticulo("ARTÍCULO 26 — FIRMA DIGITAL");

  agregarParrafo(
    "Las partes acuerdan que la presente solicitud podrá ser suscrita mediante firma digital y/o electrónica, conforme a la Ley N° 25.506, reconociendo plena validez jurídica a dicha modalidad. Las partes aceptan que dicha firma producirá los mismos efectos que la firma ológrafa, obligando plenamente desde su aceptación, renunciando a desconocer su validez por el solo hecho de haberse instrumentado en formato digital. El documento digital tendrá carácter de original y plena eficacia probatoria."
  );

  // ============================================================
  // FIRMAS
  // ============================================================

  comprobarEspacio(mostrarGarante ? 100 : 60);

  yActual += 10;

  // ---------- FIRMA DEL CLIENTE ----------
  if (firmaClienteDataURL) {
    try {
      doc.addImage(firmaClienteDataURL, "PNG", 45, yActual, 120, 35);
    } catch (error) {
      console.warn("No se pudo insertar la firma del cliente:", error);
    }
  }

  yActual += 38;

  doc.setDrawColor("#999999");
  doc.setLineWidth(0.3);
  doc.line(45, yActual, 165, yActual);

  yActual += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(negro);
  doc.text("Firma del Solicitante", MARGIN_LEFT, yActual);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Aclaración: ${nombreCliente}`, MARGIN_LEFT, yActual + 5);
  doc.text(`DNI N°: ${dni}`, MARGIN_LEFT, yActual + 10);

  yActual += 18;

  // ---------- FIRMA DEL GARANTE (SOLO SISTEMA 1) ----------
  if (mostrarGarante && firmaGaranteDataURL) {
    comprobarEspacio(60);

    if (firmaGaranteDataURL) {
      try {
        doc.addImage(firmaGaranteDataURL, "PNG", 45, yActual, 120, 35);
      } catch (error) {
        console.warn("No se pudo insertar la firma del garante:", error);
      }
    }

    yActual += 38;

    doc.setDrawColor("#999999");
    doc.setLineWidth(0.3);
    doc.line(45, yActual, 165, yActual);

    yActual += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(negro);
    doc.text("Firma del Garante", MARGIN_LEFT, yActual);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Aclaración: ${nombreGarante}`, MARGIN_LEFT, yActual + 5);
    doc.text(`DNI N°: ${garante.dni || "-"}`, MARGIN_LEFT, yActual + 10);

    yActual += 18;
  }

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

  yActual += 8;

  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(8);
  doc.setTextColor(azulOscuro);
  doc.text("“TU MOMENTO LLEGÓ. CUMPLÍ TU SUEÑO Y FORMÁ PARTE DE NUESTRA COMUNIDAD”", PAGE_WIDTH / 2, yActual, { align: "center" });

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

  const nombreArchivo = `contrato-credito-${apellidoArchivo}-${dniArchivo}.pdf`;

  doc.save(nombreArchivo);
};