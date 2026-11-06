// src/Helpers/Contratos/ContratoCredito.js

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../assets/logocenter.png";

// src/Helpers/Contratos/ContratoCredito.js

// ============================================================
// GENERADOR DE CONTRATO DE CRÉDITO PERSONAL (NUEVO DISEÑO)
// ============================================================
// @param {Object} datos - JSON traído del backend
// @param {string} firmaClienteDataURL - Firma del cliente (Base64)
// @param {string} firmaGaranteDataURL - Firma del garante (Base64) [opcional]
// ============================================================

export const generarContratoCredito = (datos, firmaClienteDataURL, firmaGaranteDataURL = null) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // ============================================================
  // CONFIGURACIÓN DE DISEÑO
  // ============================================================
  const PAGE_WIDTH = 210;
  const MARGIN_LEFT = 15;
  const MARGIN_RIGHT = 15;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
 const FIRST_PAGE_TOP = 78;
  const NORMAL_PAGE_TOP = 20;
  const FOOTER_Y = 286;

  // Paleta de colores (basada en tu nuevo diseño)
  const azulOscuro = "#021C5E";
  const azul = "#3483FA";
  const negro = "#222222";
  const gris = "#777777";
  const grisClaro = "#AAAAAA";
  const fondoGris = "#F5F7FB"; // Fondo de las tablas

  let yActual = FIRST_PAGE_TOP;

  // ============================================================
  // FUNCIONES AUXILIARES
  // ============================================================

 const dibujarEncabezado = () => {
    try {
      // Logo centrado arriba del título
      // Ancho del logo: 45mm, alto: 25mm
      // Centrado horizontalmente: (PAGE_WIDTH - 45) / 2 = (210 - 45) / 2 = 82.5
      doc.addImage(logo, "PNG", (PAGE_WIDTH - 45) / 2, 8, 45, 25);
    } catch (error) {
      console.warn("No se pudo cargar el logo:", error);
    }

    // Título (bajado para dejar espacio al logo)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(azulOscuro);
    doc.text("CONTRATO DE COMPRAVENTA EN CUOTAS CON RESERVA DE DOMINIO", PAGE_WIDTH / 2, 38, { align: "center" });
    doc.text("Y SISTEMA DE GESTIÓN REMOTA DEL EQUIPO", PAGE_WIDTH / 2, 43, { align: "center" });
    
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(gris);
    doc.text(`Contrato N° ${datos.contrato.numeroContrato} - Sistema 1 - Crédito Personal`, PAGE_WIDTH / 2, 49, { align: "center" });

    // Subtítulo introductorio
    doc.setFontSize(8);
    doc.setTextColor(negro);
    const intro = `En ${datos.contrato.localidadFirma}, provincia de Santiago del Estero, el ${datos.contrato.firmaLetras || datos.contrato.fechaFirmaLetras}, las partes que se identifican en el Cuadro de Condiciones Particulares celebran el presente contrato de compraventa en cuotas, que se rige por la Ley N° 24.240 de Defensa del Consumidor, el Código Civil y Comercial de la Nación y la Ley N° 25.326 de Protección de Datos Personales, conforme las condiciones particulares y las cláusulas que siguen.`;
    
    const lineasIntro = doc.splitTextToSize(intro, CONTENT_WIDTH);
    doc.text(lineasIntro, MARGIN_LEFT, 57);
    
    // Línea divisoria (bajada también)
    doc.setDrawColor(azul);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, 72, PAGE_WIDTH - MARGIN_RIGHT, 72);
  };

  const dibujarPiePagina = (numeroPagina, totalPaginas) => {
    doc.setDrawColor("#DDDDDD");
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT, 279, PAGE_WIDTH - MARGIN_RIGHT, 279);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(grisClaro);

    doc.text(
      `COMUNIDAD IPHONE - Contrato N° ${datos.contrato.numeroContrato}`,
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
    if (yActual + alturaNecesaria > 273) {
      nuevaPagina();
      return true;
    }
    return false;
  };

  const agregarTituloArticulo = (titulo) => {
    comprobarEspacio(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(azulOscuro);
    doc.text(titulo, MARGIN_LEFT, yActual);
    yActual += 5.5;
  };

  const agregarParrafo = (texto, fontSize = 8.5, spacing = 4) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(negro);
    const lineas = doc.splitTextToSize(texto, CONTENT_WIDTH);
    const altura = lineas.length * 3.8;
    comprobarEspacio(altura + spacing);
    doc.text(lineas, MARGIN_LEFT, yActual);
    yActual += altura + spacing;
  };

  // ============================================================
  // ESTILOS GLOBALES PARA TABLAS
  // ============================================================
  const estiloTablaBase = {
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    theme: 'grid',
    styles: { 
      font: "helvetica", 
      fontSize: 8, 
      cellPadding: 2.5, 
      textColor: negro, 
      lineColor: "#E5E5E5", // Gris suave para líneas
      lineWidth: 0.2 
    },
    headStyles: { 
      fillColor: azulOscuro, // Fondo azul oscuro
      textColor: "#FFFFFF",  // Texto blanco
      fontStyle: 'bold' 
    },
    columnStyles: { 
      0: { 
        fontStyle: "bold", 
        cellWidth: 55, // Columna izquierda más ancha
        fillColor: fondoGris // Fondo gris azulado
      } 
    },
  };

  // ============================================================
  // CONTENIDO DEL CONTRATO
  // ============================================================
  
  dibujarEncabezado();

  // 1. CUADRO DE CONDICIONES PARTICULARES
  agregarTituloArticulo("CUADRO DE CONDICIONES PARTICULARES");
  
  // Tabla 1: Partes
  autoTable(doc, {
    ...estiloTablaBase,
    startY: yActual,
    head: [['1. PARTES', '']],
    body: [
      ['EL VENDEDOR', `${datos.empresa.razonSocial}, nombre comercial bajo el cual opera ${datos.empresa.titular}, DNI N° ${datos.empresa.dniTitular}, con domicilio comercial en ${datos.empresa.direccion}. WhatsApp oficial: ${datos.empresa.whatsapp} - Correo: ${datos.empresa.email}`],
      ['EL COMPRADOR', `${datos.comprador.nombre}, DNI N° ${datos.comprador.dni}, CUIL ${datos.comprador.cuil}, con domicilio real en ${datos.comprador.domicilio}, ${datos.comprador.localidad}`],
      ...(datos.contrato.tieneGarante ? [
        ['EL GARANTE', `${datos.garante.nombre}, DNI N° ${datos.garante.dni}, con domicilio real en ${datos.garante.domicilio}, ${datos.garante.localidad || '-'}`]
      ] : [
        ['EL GARANTE', 'No interviene garante en esta operación.']
      ])
    ],
  });
  yActual = doc.lastAutoTable.finalY + 5;

  // Tabla 2: Equipo
  autoTable(doc, {
    ...estiloTablaBase,
    startY: yActual,
    head: [['2. EL EQUIPO (exclusivamente Apple iPhone)', '']],
    body: [
      ['Modelo, capacidad y color', `iPhone ${datos.equipo.modelo} · ${datos.equipo.capacidad} · ${datos.equipo.color}`],
      ['Estado', datos.equipo.estado],
      ['IMEI 1 / IMEI 2', `${datos.equipo.imei1} / ${datos.equipo.imei2 || '-'}`],
      ['Número de serie / iOS', `${datos.equipo.numeroSerie || '-'} / ${datos.equipo.ios || '-'}`],
      ['Accesorios entregados', datos.equipo.accesorios || '-']
    ],
  });
  yActual = doc.lastAutoTable.finalY + 5;

  // Tabla 3: Condiciones Económicas
  autoTable(doc, {
    ...estiloTablaBase,
    startY: yActual,
    head: [['3. CONDICIONES ECONÓMICAS (art. 36, Ley N° 24.240)', '']],
    body: [
      ['a) Precio de contado', `$ ${datos.finanzas.precioContado.toLocaleString('es-AR')}`],
      ['b) Anticipo pagado en este acto', `$ ${datos.finanzas.anticipoTotal.toLocaleString('es-AR')} ${datos.finanzas.anticipoDetalle}`],
      ['c) Saldo financiado', `$ ${datos.finanzas.saldoFinanciado.toLocaleString('es-AR')}`],
      ['d) Cantidad de cuotas', `${datos.finanzas.cantidadCuotas} cuotas mensuales, iguales y consecutivas`],
      ['e) Valor de cada cuota', `$ ${datos.finanzas.valorCuota.toLocaleString('es-AR')}`],
      ['f) Vencimiento de las cuotas', `Del día 1 al día ${datos.finanzas.diaLimitePago} de cada mes. Primera cuota: ${datos.finanzas.mesPrimeraCuota}. Cronograma completo en el Anexo II.`],
      ['g) Tasa nominal anual (TNA)', `${datos.finanzas.tna} %`],
      ['h) Tasa efectiva anual (TEA)', `${datos.finanzas.tea} %`],
      ['i) Costo financiero total (CFT, efectivo anual)', `${datos.finanzas.cft} %`],
      ['j) Sistema de amortización', 'Francés: cuotas fijas, iguales y consecutivas, que incluyen capital e interés'],
      ['k) Total de intereses de financiación', `$ ${datos.finanzas.totalIntereses.toLocaleString('es-AR')}`],
      ['l) Gastos adicionales', 'Ninguno. No se cobran gastos de otorgamiento, de administración ni de licencia del sistema de gestión remota.'],
      ['m) Total a pagar en cuotas', `$ ${datos.finanzas.totalCuotas.toLocaleString('es-AR')}`],
      ['n) Total de la operación (anticipo + cuotas)', `$ ${datos.finanzas.totalOperacion.toLocaleString('es-AR')}`],
      ['o) Medios de pago oficiales', `Efectivo en el local, contra recibo oficial emitido por el sistema, o transferencia a la cuenta oficial: alias ${datos.empresa.aliasPago}, CBU/CVU ${datos.empresa.cbuPago}, titular ${datos.empresa.titularCuentaPago}.`]
    ],
  });
  yActual = doc.lastAutoTable.finalY + 5;

  // Tabla 4: Mora y Cobranza
  autoTable(doc, {
    ...estiloTablaBase,
    startY: yActual,
    head: [['4. MORA Y COBRANZA (detalle en las cláusulas Séptima a Novena)', '']],
    body: [
      ['Interés moratorio y punitorio', '$ 4.000 (pesos cuatro mil) por cada día de atraso, en total, cualquiera sea la cantidad de cuotas vencidas'],
      ['Bloqueo del equipo', 'Vencidos 5 días corridos desde el primer día de mora'],
      ['Área Legal', 'Con dos cuotas vencidas e impagas: intimación con plazo de 48 horas para pagar o devolver el equipo'],
      ['Honorarios de gestión extrajudicial', '10 % si regulariza de contado; 20 % si regulariza con plan de pagos. Solo sobre el capital reclamado.']
    ],
  });
  yActual = doc.lastAutoTable.finalY + 5;

  // Tabla 5: Domicilios Electrónicos
  autoTable(doc, {
    ...estiloTablaBase,
    startY: yActual,
    head: [['5. DOMICILIOS ELECTRÓNICOS (cláusula Vigésima)', '']],
    body: [
      ['EL COMPRADOR', `Celular principal ${datos.comprador.celular} · Celular alternativo ${datos.comprador.celularAlt || '-'} · Correo ${datos.comprador.email || '-'}`],
      ...(datos.contrato.tieneGarante ? [
        ['EL GARANTE', `Celular principal ${datos.garante.celular} · Celular alternativo ${datos.garante.celularAlt || '-'} · Correo ${datos.garante.email || '-'}`]
      ] : [
        ['EL GARANTE', '—']
      ])
    ],
  });
  yActual = doc.lastAutoTable.finalY + 8;

  // ============================================================
  // CONDICIONES GENERALES
  // ============================================================
  
  agregarParrafo("El CFT y las tasas se calculan sobre el saldo financiado y las cuotas pactadas. Cancelando antes, el COMPRADOR paga menos intereses (cláusula Cuarta).", 8.5, 6);

  agregarTituloArticulo("CONDICIONES GENERALES");

  agregarTituloArticulo("CLÁUSULA PRIMERA — PARTES Y DOCUMENTACIÓN CONTRACTUAL");
  agregarParrafo(`1.1. ${datos.empresa.razonSocial} es el nombre comercial bajo el cual opera ${datos.empresa.titular}, DNI N° ${datos.empresa.dniTitular}, quien es el VENDEDOR a todos los efectos legales de este contrato. Toda mención a ${datos.empresa.razonSocial} o a LA EMPRESA se refiere al VENDEDOR.`);
  agregarParrafo("1.2. Integran este contrato y forman con él un todo indivisible: el Cuadro de Condiciones Particulares; estas Condiciones Generales; el Anexo I (consentimientos informados); el Anexo II (cronograma de pagos); el Anexo III (estado del equipo entregado); el Anexo IV (comprobante de plan canje), si lo hubiera; la Solicitud de Financiación; los recibos oficiales y el pagaré vinculado de la cláusula Octava.");
  agregarParrafo("1.3. Si hubiera contradicción entre el Cuadro y las Condiciones Generales, prevalece el Cuadro. En caso de duda sobre el alcance de cualquier cláusula, se estará a la interpretación más favorable al COMPRADOR (art. 37, Ley N° 24.240).");

  agregarTituloArticulo("CLÁUSULA SEGUNDA — OBJETO");
  agregarParrafo("2.1. El VENDEDOR vende al COMPRADOR, y este compra, el teléfono celular marca Apple, modelo iPhone, identificado en el punto 2 del Cuadro (en adelante, EL EQUIPO), con sus accesorios.");
  agregarParrafo("2.2. La venta es en cuotas. Como garantía del pago, EL EQUIPO se entrega con un sistema de gestión remota instalado, que permite al VENDEDOR bloquearlo y desbloquearlo a distancia en los casos y con los límites de las cláusulas Décima a Decimoquinta. El COMPRADOR conoce y acepta esa condición antes de firmar.");

  agregarTituloArticulo("CLÁUSULA TERCERA — ENTREGA Y ESTADO DEL EQUIPO");
  agregarParrafo("3.1. El COMPRADOR recibe EL EQUIPO en este acto y verifica, antes de retirarlo, su encendido, pantalla, táctil, cámaras, audio, carga, señal, Face ID o Touch ID y conexión. El estado del equipo al momento de la entrega, incluida la salud de la batería y la condición de sus piezas según el propio iPhone, queda documentado en el Anexo III, con fotografías guardadas en el sistema.");
  agregarParrafo("3.2. El VENDEDOR declara que sobre EL EQUIPO no pesa medida cautelar, embargo ni gravamen; que su IMEI no está denunciado; que es libre de operadora; que no tiene cuenta de iCloud de terceros, sin perjuicio del sistema de gestión de la cláusula Décima, y que es de procedencia lícita.");
  agregarParrafo("3.3. Desde la entrega, el COMPRADOR tiene el uso de EL EQUIPO y es responsable de su guarda y conservación, con los alcances de la cláusula Sexta.");

  agregarTituloArticulo("CLÁUSULA CUARTA — PRECIO, FINANCIACIÓN Y CANCELACIÓN ANTICIPADA");
  agregarParrafo("4.1. Las condiciones económicas son las del punto 3 del Cuadro. El interés de financiación ya está incluido en el valor de cada cuota.");
  agregarParrafo("4.2. El VENDEDOR no puede cobrar ningún importe que no figure en el Cuadro, salvo el interés moratorio y punitorio de la cláusula Séptima, los honorarios de gestión extrajudicial de la cláusula Octava y las costas que fije un juez.");
  agregarParrafo("4.3. El COMPRADOR puede cancelar anticipadamente, en forma total o parcial, el saldo adeudado en cualquier momento y sin cargo. En ese caso, los intereses de financiación se calculan solo por el tiempo efectivamente transcurrido (art. 36, Ley N° 24.240). Si cancela el total, se aplica la cláusula Decimocuarta.");
  agregarParrafo("4.4. El cronograma de vencimientos, con la fecha y el importe de cada cuota, integra este contrato como Anexo II.");

  agregarTituloArticulo("CLÁUSULA QUINTA — LUGAR, FORMA Y PLAZO DE PAGO");
  agregarParrafo("5.1. Cada cuota se paga entre el día 1 y el día indicado en el punto 3.f) del Cuadro de cada mes. El plazo vence ese día aunque sea inhábil: en ese caso, el COMPRADOR puede pagar por transferencia a la cuenta oficial, que está disponible todos los días, o en efectivo en el local el último día hábil anterior.");
  agregarParrafo("5.2. Solo son válidos los pagos hechos por los medios oficiales del punto 3.o) del Cuadro: en efectivo en el local, contra recibo oficial emitido por el sistema, o por transferencia a la cuenta oficial allí indicada. El COMPRADOR no debe pagar en cuentas personales de asesores, cobradores ni terceros.");
  agregarParrafo("5.3. El pago se considera hecho en la fecha en que el importe queda acreditado en la cuenta oficial o recibido en el local. Si paga por transferencia, el COMPRADOR envía el comprobante al WhatsApp oficial para agilizar su registro y, si correspondiera, el desbloqueo.");
  agregarParrafo("5.4. Los pagos se imputan primero a los intereses moratorios y punitorios adeudados y luego a las cuotas vencidas, comenzando por la más antigua.");
  agregarParrafo("5.5. La falta de recordatorio o de aviso de vencimiento no exime al COMPRADOR de pagar en término.");

  agregarTituloArticulo("CLÁUSULA SEXTA — RESERVA DE DOMINIO");
  agregarParrafo("6.1. El VENDEDOR conserva la propiedad de EL EQUIPO hasta que el COMPRADOR pague la totalidad del precio. Con el pago total, la propiedad pasa al COMPRADOR sin necesidad de otro acto, y se aplica la cláusula Decimocuarta.");
  agregarParrafo("6.2. Mientras rija la reserva de dominio, el COMPRADOR no puede vender, prendar, alquilar ni entregar EL EQUIPO a terceros, ni modificar su hardware o el software de gestión. Sí puede usarlo libremente para fines personales, cargar sus datos y aplicaciones y prestarlo ocasionalmente bajo su responsabilidad.");
  agregarParrafo("6.3. Si EL EQUIPO se pierde o es robado, el COMPRADOR lo informa al VENDEDOR dentro de las cuarenta y ocho (48) horas y acompaña la denuncia policial. La pérdida o el robo no extinguen la deuda.");

  agregarTituloArticulo("CLÁUSULA SÉPTIMA — MORA E INTERÉS MORATORIO Y PUNITORIO");
  agregarParrafo("7.1. La mora se produce de pleno derecho, sin necesidad de intimación, si la cuota no se paga dentro del plazo del punto 3.f) del Cuadro (art. 886, Código Civil y Comercial).");
  agregarParrafo("7.2. Desde el día siguiente al vencimiento impago y hasta su efectivo pago, se devenga un interés moratorio y punitorio de $ 4.000 (pesos cuatro mil) por cada día corrido de atraso, en total, cualquiera sea la cantidad de cuotas vencidas. El interés corre también durante los días de gracia y mientras EL EQUIPO esté bloqueado.");
  agregarParrafo("7.3. El importe diario es fijo durante toda la vigencia de este contrato y el VENDEDOR no puede modificarlo. No se aplica sobre cuotas no vencidas. El VENDEDOR informa el importe acumulado antes de cobrarlo.");
  agregarParrafo("7.4. El VENDEDOR puede otorgar una prórroga o cambiar la fecha de un vencimiento a pedido del COMPRADOR. Si lo hace, debe dejarlo registrado en el sistema y el bloqueo se rige por la nueva fecha.");

  agregarTituloArticulo("CLÁUSULA OCTAVA — COBRANZA, ÁREA LEGAL, CADUCIDAD DE PLAZOS, PAGARÉ Y COSTAS");
  agregarParrafo("8.1. Cobranza administrativa. Desde el primer día de mora y hasta el pago, el área de cobranza gestiona la regularización con el COMPRADOR por los medios de la cláusula Vigésima.");
  agregarParrafo("8.2. Bloqueo. Vencidos cinco (5) días corridos desde el primer día de mora sin que la cuota haya sido pagada, EL EQUIPO puede bloquearse conforme la cláusula Undécima. Para desbloquearlo, el COMPRADOR paga las cuotas vencidas y los intereses de la cláusula Séptima.");
  agregarParrafo("8.3. Área Legal. Si vence una segunda cuota sin que se haya pagado la anterior, el caso pasa al Área Legal, que intima al COMPRADOR y al GARANTE, por los medios de la cláusula Vigésima, para que dentro de las cuarenta y ocho (48) horas: a) paguen las cuotas vencidas, los intereses de la cláusula Séptima y los honorarios de gestión extrajudicial del punto 8.4; o b) restituyan EL EQUIPO en el local, con la liquidación de la cláusula Novena.");
  agregarParrafo("8.4. Honorarios de gestión extrajudicial. Si el caso se regulariza en la instancia del punto 8.3, se agregan honorarios de gestión extrajudicial del diez por ciento (10 %) si el pago es de contado, o del veinte por ciento (20 %) si se acuerda un plan de pagos. En ambos casos se calculan exclusivamente sobre el capital reclamado, que es el importe de las cuotas vencidas e impagas, sin intereses ni otros conceptos. El plan de pagos es facultativo para el VENDEDOR, exige un pago inicial y caduca automáticamente si se incumple cualquiera de sus cuotas.");
  agregarParrafo("8.5. Caducidad de plazos o resolución. Vencido el plazo del punto 8.3 sin pago ni restitución, o incumplido el plan de pagos, el VENDEDOR puede, a su elección y mediante comunicación por los medios de la cláusula Vigésima: a) dar por caducos todos los plazos y exigir el saldo total adeudado, más los intereses de la cláusula Séptima, descontando los intereses de financiación de las cuotas no vencidas, y ejecutar el pagaré del punto 8.6; o b) resolver el contrato en los términos del artículo 1086 del Código Civil y Comercial, que las partes pactan como cláusula resolutoria expresa, y exigir la restitución de EL EQUIPO con la liquidación de la cláusula Novena.");
  agregarParrafo(`8.6. Pagaré. En garantía del saldo financiado, el COMPRADOR suscribe un pagaré sin protesto, por el total de las cuotas, a la orden de ${datos.empresa.titular}, con la leyenda «Pagaré vinculado al contrato de compraventa en cuotas N° ${datos.contrato.numeroContrato}», que el GARANTE firma por aval. El pagaré se entrega con el lugar y la fecha de emisión y el vencimiento en blanco, y el COMPRADOR y el GARANTE autorizan expresamente al VENDEDOR a completarlos una vez producida la caducidad de plazos del punto 8.5, conforme el artículo 11 del Decreto-Ley N° 5965/63. El pagaré integra este contrato, no se presenta al cobro antes de la caducidad de plazos y no puede ejecutarse por un importe mayor al saldo adeudado según este contrato: los pagos a cuenta se imputan en la liquidación. Cancelado el total, el pagaré queda a disposición del COMPRADOR para su retiro en la casa central.`);
  agregarParrafo("8.7. Costas. En caso de reclamo judicial, las costas y los honorarios de los profesionales intervinientes quedan a cargo del COMPRADOR y del GARANTE, según la regulación que haga el juez conforme la ley arancelaria aplicable y con el límite del artículo 730 del Código Civil y Comercial.");

  agregarTituloArticulo("CLÁUSULA NOVENA — RESTITUCIÓN DEL EQUIPO Y LIQUIDACIÓN");
  agregarParrafo("9.1. La restitución se hace por entrega voluntaria del COMPRADOR en el local o por vía judicial. El VENDEDOR nunca puede retirar EL EQUIPO por la fuerza ni sin consentimiento.");
  agregarParrafo("9.2. Restituido EL EQUIPO, el VENDEDOR practica dentro de los diez (10) días hábiles una liquidación por escrito. A lo pagado por el COMPRADOR (anticipo, valor del equipo entregado en canje y cuotas) le descuenta: a) por el uso y la desvalorización del equipo, el diez por ciento (10 %) del precio de contado por el primer mes o fracción, y el cinco por ciento (5 %) por cada mes o fracción siguiente; b) una indemnización fija del quince por ciento (15 %) del precio de contado por la resolución por incumplimiento, que comprende la ganancia frustrada, el reacondicionamiento y la nueva comercialización del equipo (art. 790, Código Civil y Comercial); c) los intereses de la cláusula Séptima devengados; y d) los daños que excedan el desgaste normal respecto del estado del Anexo III, según presupuesto escrito del servicio técnico, con detalle de piezas y precios.");
  agregarParrafo("9.3. Tope. El total de los descuentos nunca puede superar lo pagado por el COMPRADOR. Con la restitución y la liquidación, el COMPRADOR y el GARANTE quedan liberados de toda otra deuda derivada de este contrato, y el pagaré queda sin efecto.");
  agregarParrafo("9.4. Si queda saldo a favor del COMPRADOR, el VENDEDOR se lo devuelve dentro de los diez (10) días hábiles de practicada la liquidación. El COMPRADOR nunca pierde lo pagado sin esta liquidación.");

  agregarTituloArticulo("CLÁUSULA DÉCIMA — CONSENTIMIENTO EXPRESO E INFORMADO AL SISTEMA DE GESTIÓN REMOTA");
  agregarParrafo("10.1. El COMPRADOR declara que, antes de firmar, el VENDEDOR le explicó en forma clara cómo funciona el sistema de gestión remota instalado en EL EQUIPO, en los términos de las cláusulas Undécima a Decimoquinta, y presta su consentimiento libre, expreso e informado para su instalación y uso, que ratifica en el Anexo I.");
  agregarParrafo("10.2. El sistema es un software provisto al VENDEDOR por un proveedor del servicio tecnológico contratado por él (en adelante, EL PROVEEDOR DEL SERVICIO). No es un producto ni un servicio de Apple, que no lo patrocina ni lo garantiza. El sistema usa las herramientas de administración de dispositivos que Apple ofrece para equipos gestionados.");
  agregarParrafo("10.3. EL EQUIPO queda registrado en la cuenta de Apple Business Manager de la organización, en modo supervisado, con un perfil de administración (MDM) y un perfil de restricciones que impiden borrar el contenido del equipo, instalar otros perfiles de configuración y conectarlo a computadoras para modificarlo.");
  agregarParrafo("10.4. El sistema tiene como única finalidad garantizar el pago de las cuotas. El VENDEDOR no puede usarlo para leer mensajes, fotos, contactos, correos, historial de navegación ni el contenido de las aplicaciones del COMPRADOR, y el sistema no tiene esa función.");

  agregarTituloArticulo("CLÁUSULA UNDÉCIMA — FUNCIONAMIENTO DEL BLOQUEO Y DESBLOQUEO");
  agregarParrafo(`11.1. Qué es el bloqueo. Se activa el «Modo Perdido» de Apple: EL EQUIPO queda inutilizable y muestra en pantalla el mensaje «Equipo bloqueado por falta de pago. Para desbloquearlo, comunícate con ${datos.empresa.razonSocial} al ${datos.empresa.whatsapp}». El mensaje nunca revela datos de la deuda a terceros. El comportamiento del Modo Perdido lo define Apple y el VENDEDOR no puede modificarlo.`);
  agregarParrafo("11.2. Cuándo se bloquea. Solo cuando existe al menos una cuota vencida e impaga y venció el plazo del punto 8.2. Nunca se bloquea a un COMPRADOR que está al día. El bloqueo puede ordenarse en forma automática, al verificar el sistema la cuota impaga, o en forma manual desde el panel del VENDEDOR, siempre en la misma situación de mora.");
  agregarParrafo("11.3. Avisos previos. Desde el primer día de mora, el VENDEDOR envía al COMPRADOR, por los medios de la cláusula Vigésima, un aviso con el importe adeudado y la fecha a partir de la cual se aplicará el bloqueo.");
  agregarParrafo("11.4. Conexión. La orden de bloqueo o de desbloqueo llega a EL EQUIPO cuando este tiene conexión a internet. Si está apagado o sin conexión, se aplica cuando vuelve a conectarse.");
  agregarParrafo("11.5. Llamadas de emergencia. El bloqueo nunca impide llamar a los números de emergencia (911, 107, 100 y los demás que correspondan): el Modo Perdido de Apple mantiene disponible esa llamada desde la pantalla de bloqueo, siempre que el equipo tenga chip activo o cobertura de red.");
  agregarParrafo("11.6. Desbloqueo. El VENDEDOR desbloquea EL EQUIPO cuando el COMPRADOR paga las cuotas vencidas y los intereses de la cláusula Séptima: en el acto, si paga en efectivo en el local, y dentro de las veinticuatro (24) horas de acreditado el pago, si lo hace por transferencia.");
  agregarParrafo("11.7. Bloqueo indebido. Si EL EQUIPO se bloquea estando el COMPRADOR al día, el VENDEDOR lo desbloquea de inmediato al ser informado, sin costo, y responde por los daños que el bloqueo indebido le hubiera causado.");

  agregarTituloArticulo("CLÁUSULA DUODÉCIMA — OBLIGACIONES DEL COMPRADOR SOBRE EL SISTEMA");
  agregarParrafo("12.1. Mientras rija la reserva de dominio, el COMPRADOR se obliga a no: a) desinstalar, desactivar o intentar eludir el perfil de gestión; b) restablecer EL EQUIPO de fábrica o intentar hacerlo; c) modificar o reemplazar el sistema operativo («jailbreak») ni alterar el IMEI; d) entregar EL EQUIPO a terceros para que realicen cualquiera de esas acciones.");
  agregarParrafo("12.2. El COMPRADOR puede cambiar el chip o la empresa de telefonía, informándolo al VENDEDOR.");
  agregarParrafo("12.3. El sistema informa al VENDEDOR si se quita el perfil de gestión o el equipo sale de la organización. Esa situación, por sí sola, no provoca el bloqueo de un COMPRADOR al día, pero constituye un incumplimiento grave que habilita la intimación del punto 8.3 y, vencido su plazo, las opciones del punto 8.5.");
  agregarParrafo("12.4. Las acciones del punto 12.1 pueden dejar EL EQUIPO inutilizable (cláusula Decimotercera), y los daños que causen no están cubiertos por la garantía. Se recomienda conectar EL EQUIPO a internet con regularidad, para recibir a tiempo los avisos y los desbloqueos.");

  agregarTituloArticulo("CLÁUSULA DECIMOTERCERA — PROTECCIÓN CONTRA EL RESTABLECIMIENTO DE FÁBRICA");
  agregarParrafo("13.1. Hasta la liberación de la cláusula Decimocuarta, el «Bloqueo de activación» de Apple queda vinculado a la organización del VENDEDOR, lo que impide reactivar EL EQUIPO después de un restablecimiento de fábrica. El sistema guarda el código técnico que permite levantar ese bloqueo y lo usa únicamente para liberar EL EQUIPO conforme la cláusula Decimocuarta o para habilitarlo después de una restitución.");
  agregarParrafo("13.2. Si el COMPRADOR restablece EL EQUIPO estando al día, el VENDEDOR lo asiste para reactivarlo en el local, sin costo.");

  agregarTituloArticulo("CLÁUSULA DECIMOCUARTA — LIBERACIÓN TOTAL DEL EQUIPO AL TERMINAR DE PAGAR");
  agregarParrafo("14.1. Pagado el total, en término o por cancelación anticipada, el VENDEDOR libera EL EQUIPO dentro de las cuarenta y ocho (48) horas hábiles siguientes al pago, sin costo: desactiva el Modo Perdido si estaba activo, levanta el Bloqueo de activación, quita la asignación del equipo al servidor de gestión en Apple Business Manager y elimina el perfil de gestión.");
  agregarParrafo("14.2. Para que la liberación se aplique, EL EQUIPO debe estar encendido y conectado a internet. Si no se conecta, el plazo corre desde que se conecta. Si algún paso falla, el VENDEDOR lo completa con EL EQUIPO en el local, siempre sin costo.");
  agregarParrafo("14.3. Con la liberación, EL EQUIPO queda bajo la propiedad y el control total del COMPRADOR, sin ninguna aplicación, perfil, cuenta ni restricción del sistema. El VENDEDOR entrega el recibo de pago y certificado de libre deuda, pone el pagaré a disposición para su retiro en la casa central y elimina el código de la cláusula Decimotercera.");
  agregarParrafo("14.4. Si el VENDEDOR no libera EL EQUIPO en el plazo, el COMPRADOR puede intimarlo por los medios de la cláusula Vigésima, sin perjuicio de sus derechos bajo la Ley N° 24.240.");

  agregarTituloArticulo("CLÁUSULA DECIMOQUINTA — UBICACIÓN DEL EQUIPO");
  agregarParrafo("15.1. El sistema solo obtiene la ubicación de EL EQUIPO mientras está bloqueado por mora, a través del Modo Perdido de Apple. Mientras el COMPRADOR está al día, el sistema no registra su ubicación.");
  agregarParrafo("15.2. La ubicación es la del equipo, no la de una persona, y puede ser aproximada o no estar disponible. Se usa únicamente para gestionar el cobro y, en su caso, la restitución por las vías de la cláusula Novena. El VENDEDOR no puede usarla para seguir ni contactar en persona al COMPRADOR o a terceros, ni comunicarla a nadie, salvo orden judicial. Esto no impide las notificaciones al domicilio real declarado en este contrato.");

  agregarTituloArticulo("CLÁUSULA DECIMOSEXTA — GARANTÍA LEGAL DEL PRODUCTO");
  agregarParrafo("16.1. EL EQUIPO tiene la garantía legal de la Ley N° 24.240 por defectos o vicios: seis (6) meses si es nuevo y tres (3) meses si es usado o reacondicionado, contados desde la entrega. Los equipos sellados cuentan además con la garantía del fabricante. El VENDEDOR responde por la garantía en el local, a través de su servicio técnico.");
  agregarParrafo("16.2. Ante una falla, el COMPRADOR pone EL EQUIPO a disposición del servicio técnico del VENDEDOR, que procede a su reparación. El plazo de garantía se prolonga por el tiempo que dure la reparación, y las cuotas que venzan mientras tanto pueden pagarse hasta diez (10) días después de la devolución del equipo, sin intereses ni bloqueo.");
  agregarParrafo("16.3. La garantía no cubre los daños causados por golpes, caídas, humedad o ingreso de líquidos, uso indebido, intervención de terceros ajenos al servicio técnico del VENDEDOR, firmware alterado, software no autorizado por el fabricante o las acciones prohibidas en la cláusula Duodécima, ni el desgaste normal de la batería respecto del estado declarado en el Anexo III.");
  agregarParrafo("16.4. La garantía es independiente del sistema de gestión: un bloqueo por mora no es un defecto del equipo, y la garantía no se suspende ni se pierde por estar el equipo bloqueado. El VENDEDOR no responde por hurto o robo de EL EQUIPO.");

  agregarTituloArticulo("CLÁUSULA DECIMOSÉPTIMA — INFORMES CREDITICIOS (VERAZ)");
  agregarParrafo("17.1. El COMPRADOR y el GARANTE autorizan al VENDEDOR a consultar sus antecedentes en Veraz (Equifax), Nosis, la Central de Deudores del BCRA y bases similares, para evaluar la financiación y durante toda la vigencia del contrato.");
  agregarParrafo("17.2. Afectación. Si la deuda no se regulariza en la instancia del punto 8.3, el VENDEDOR queda facultado para informar la deuda del COMPRADOR y del GARANTE en Veraz (Equifax) y en otras bases de información crediticia, conforme el artículo 26 de la Ley N° 25.326.");
  agregarParrafo("17.3. Desafectación. Cancelada la totalidad de la deuda, el VENDEDOR solicita la desafectación del COMPRADOR y del GARANTE dentro de los cinco (5) días hábiles. Conforme el artículo 26, inciso 4, de la Ley N° 25.326, la información sobre una deuda cancelada puede permanecer registrada, con la constancia de su cancelación, hasta dos (2) años.");

  agregarTituloArticulo("CLÁUSULA DECIMOCTAVA — PROTECCIÓN DE DATOS PERSONALES (LEY N° 25.326)");
  agregarParrafo("18.1. Responsable. El responsable de la base de datos es el VENDEDOR, con los datos del punto 1 del Cuadro. EL PROVEEDOR DEL SERVICIO actúa como encargado del tratamiento: aloja los datos y presta soporte técnico, solo por cuenta del VENDEDOR y sin usarlos para fines propios.");
  agregarParrafo("18.2. Datos que se recolectan. a) Del COMPRADOR: nombre, DNI, CUIL, teléfonos, domicilio, correo, comprobantes de ingresos, imagen del DNI y fotografía de validación, firma, evaluación crediticia e historial de pagos. b) Del GARANTE: los mismos datos de identificación, contacto e ingresos. c) De EL EQUIPO: modelo, IMEI, número de serie, versión de iOS, nombre del dispositivo, fechas de conexión, estado de bloqueo y de la protección contra el restablecimiento. d) Ubicación: solo mientras el equipo está bloqueado (cláusula Decimoquinta). e) Registros de bloqueos, desbloqueos, liberación, códigos y pagos, con fecha, hora y usuario. El sistema no accede al contenido de mensajes, llamadas, fotos, contactos, correos ni navegación.");
  agregarParrafo("18.3. Finalidad. Los datos se usan solo para evaluar la financiación, celebrar y administrar este contrato, gestionar cobros, avisos, bloqueos, desbloqueos y la liberación, y, en caso de incumplimiento, para el reclamo extrajudicial o judicial y los informes de la cláusula Decimoséptima. No se usan con fines publicitarios ni se venden.");
  agregarParrafo("18.4. Acceso y almacenamiento. Acceden el VENDEDOR, su personal autorizado y el personal del PROVEEDOR DEL SERVICIO en tareas de soporte. Los datos no se comunican a terceros, salvo a autoridades que los requieran legalmente, a las bases de la cláusula Decimoséptima o a quienes el VENDEDOR encargue la cobranza, sujetos a la misma confidencialidad. Los datos se alojan en servidores en la nube que pueden estar ubicados fuera de la República Argentina, y el COMPRADOR y el GARANTE consienten esa transferencia, que se realiza con medidas de seguridad y confidencialidad.");
  agregarParrafo("18.5. Conservación. Los datos se conservan mientras dure el contrato y hasta cinco (5) años después de su cancelación o finalización, para atender reclamos. La ubicación se elimina a los treinta (30) días de la liberación o de la restitución del equipo. Vencidos esos plazos, los datos se eliminan o se anonimizan.");
  agregarParrafo("18.6. Derechos. El COMPRADOR y el GARANTE pueden pedir el acceso, la rectificación, la actualización y la supresión de sus datos por WhatsApp, por correo o en el local. El VENDEDOR responde el pedido de acceso dentro de los diez (10) días corridos y el de rectificación o supresión dentro de los cinco (5) días hábiles. La supresión no procede mientras los datos sean necesarios para cumplir el contrato.");
  agregarParrafo("18.7. El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326. La Agencia de Acceso a la Información Pública, órgano de control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.");

  agregarTituloArticulo("CLÁUSULA DECIMONOVENA — GARANTE");
  agregarParrafo("19.1. El GARANTE se constituye en fiador solidario, liso, llano y principal pagador de todas las obligaciones de pago del COMPRADOR derivadas de este contrato (arts. 1590 y 1591, Código Civil y Comercial), hasta un importe máximo igual al total a pagar en cuotas del Cuadro, más los intereses de la cláusula Séptima y las costas.");
  agregarParrafo("19.2. El GARANTE firma por aval el pagaré de la cláusula Octava, declara haber leído este contrato completo, incluidas las cláusulas sobre el sistema de bloqueo, y queda sujeto a las notificaciones de la cláusula Vigésima y a los informes de la cláusula Decimoséptima. Su obligación se extingue con el pago total.");

  agregarTituloArticulo("CLÁUSULA VIGÉSIMA — DOMICILIOS Y NOTIFICACIONES");
  agregarParrafo("20.1. Las partes constituyen domicilio real en los indicados en el Cuadro, donde son válidas todas las notificaciones.");
  agregarParrafo("20.2. Domicilio electrónico. El COMPRADOR y el GARANTE constituyen como domicilio electrónico (art. 75, Código Civil y Comercial) el celular principal, el celular alternativo y el correo electrónico declarados en el punto 5 del Cuadro. Los avisos de vencimiento, mora y bloqueo, la intimación del punto 8.3 y las comunicaciones del punto 8.5 son válidos si se envían a cualquiera de esos canales, o por escrito en el domicilio real.");
  agregarParrafo("20.3. Un mensaje de WhatsApp se tiene por recibido cuando figura entregado en el dispositivo de destino (doble tilde) o leído. Si dentro de las cuarenta y ocho (48) horas ningún canal electrónico registra la entrega, la notificación se practica por escrito en el domicilio real.");
  agregarParrafo("20.4. Cada parte debe informar a la otra cualquier cambio de sus datos de contacto. Mientras no lo haga, son válidas las notificaciones a los datos declarados. Bloquear el número oficial del VENDEDOR no impide la notificación por los demás canales ni en el domicilio real.");

  agregarTituloArticulo("CLÁUSULA VIGÉSIMA PRIMERA — CESIONES");
  agregarParrafo("21.1. El COMPRADOR no puede ceder su posición en este contrato sin la conformidad previa y escrita del VENDEDOR. La cesión se instrumenta por escrito, con firmas del cedente y del cesionario puestas en el local ante personal autorizado o certificadas, y el cesionario queda sujeto a la evaluación crediticia del VENDEDOR. Hasta que la cesión sea aprobada y formalizada, el cedente sigue siendo el único responsable.");
  agregarParrafo("21.2. El VENDEDOR puede ceder total o parcialmente los créditos de este contrato y endosar el pagaré, sin necesidad de conformidad del COMPRADOR, notificándolo por los medios de la cláusula Vigésima.");

  if (datos.contrato.tieneCanje) {
    agregarTituloArticulo("CLÁUSULA VIGÉSIMA SEGUNDA — PLAN CANJE");
    agregarParrafo("22.1. El COMPRADOR podrá entregar como parte de pago del anticipo un teléfono Apple iPhone, revisado por el servicio técnico del VENDEDOR, por el valor asignado de común acuerdo en el Anexo IV.");
    agregarParrafo("22.2. El COMPRADOR declara bajo juramento que es titular del equipo entregado, que es de procedencia lícita, que su IMEI no está denunciado y que lo entrega sin cuenta de iCloud, código ni bloqueo, que se retiran en presencia del VENDEDOR. Si se comprobara lo contrario, el COMPRADOR responde por todos los daños, y el valor asignado se deja sin efecto y pasa a integrar el saldo adeudado.");
    agregarParrafo("22.3. Con la firma del Anexo IV, la propiedad del equipo entregado pasa al VENDEDOR. El COMPRADOR no puede exigir su devolución, salvo en el caso de revocación de la cláusula Vigésima Tercera o de nulidad del contrato.");
  }

  agregarTituloArticulo("CLÁUSULA VIGÉSIMA TERCERA — DERECHO DE REVOCACIÓN");
  agregarParrafo("Si este contrato se celebró fuera del local comercial o a distancia, el COMPRADOR puede revocar la aceptación dentro de los diez (10) días corridos contados desde la entrega del equipo o la firma, lo que ocurra último, sin costo ni responsabilidad alguna (arts. 1110 a 1116, Código Civil y Comercial, y art. 34, Ley N° 24.240), devolviendo EL EQUIPO en el estado en que lo recibió. El VENDEDOR le reintegra lo pagado, le devuelve el equipo entregado en canje o, si ya no lo tuviera, su valor asignado, y deja sin efecto el pagaré.");

  agregarTituloArticulo("CLÁUSULA VIGÉSIMA CUARTA — USO DE IMAGEN");
  agregarParrafo("Solo si el COMPRADOR lo autoriza en el Anexo I, el VENDEDOR puede tomar fotografías o videos de la entrega del equipo y publicarlos en sus redes y medios con fines comerciales e institucionales, sin retribución. La autorización es opcional, no condiciona la venta y puede revocarse en cualquier momento por los medios de la cláusula Vigésima, sin efecto sobre lo ya publicado.");

  agregarTituloArticulo("CLÁUSULA VIGÉSIMA QUINTA — FIRMA ELECTRÓNICA Y EJEMPLARES");
  agregarParrafo("25.1. Las partes acuerdan firmar este contrato y sus anexos mediante firma electrónica (art. 5, Ley N° 25.506), en el sistema de COMUNIDAD IPHONE, con un código de un solo uso enviado al celular declarado y el registro de fecha, hora, dispositivo y fotografía de validación con el DNI. El COMPRADOR y el GARANTE reconocen que esa firma expresa su consentimiento y su autoría sobre el contenido del documento.");
  agregarParrafo("25.2. El pagaré de la cláusula Octava se firma en forma manuscrita, en papel.");
  agregarParrafo("25.3. El COMPRADOR y el GARANTE reciben en este acto una copia íntegra de este contrato y sus anexos en formato PDF, por WhatsApp o por correo electrónico, y pueden pedir una copia impresa en el local.");

  agregarTituloArticulo("CLÁUSULA VIGÉSIMA SEXTA — JURISDICCIÓN Y RECLAMOS");
  agregarParrafo("26.1. Para cualquier controversia son competentes los tribunales ordinarios del domicilio real del COMPRADOR, conforme el artículo 36 de la Ley N° 24.240.");
  agregarParrafo("26.2. Ante cualquier reclamo, el COMPRADOR puede dirigirse al VENDEDOR, a la autoridad de aplicación de Defensa del Consumidor de la provincia de Santiago del Estero o a la Ventanilla Única Federal de Defensa del Consumidor (argentina.gob.ar/produccion/defensadelconsumidor).");

  agregarParrafo("En prueba de conformidad, las partes firman electrónicamente el presente contrato y sus anexos, en el lugar y la fecha indicados en el encabezado.", 8.5, 10);

  // ============================================================
  // FIRMAS
  // ============================================================
  comprobarEspacio(datos.contrato.tieneGarante ? 100 : 60);
  yActual += 5;

  // Firma Cliente
  if (firmaClienteDataURL) {
    try {
      doc.addImage(firmaClienteDataURL, "PNG", 45, yActual, 120, 35);
    } catch (error) { console.warn("Error firma cliente:", error); }
  }
  yActual += 38;
  doc.setDrawColor("#999999");
  doc.setLineWidth(0.3);
  doc.line(45, yActual, 165, yActual);
  yActual += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(negro);
  doc.text("EL COMPRADOR", MARGIN_LEFT, yActual);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Firmado electrónicamente por ${datos.comprador.nombre}, DNI N° ${datos.comprador.dni}`, MARGIN_LEFT, yActual + 5);
  doc.text(`Fecha y hora: ${datos.comprador.firmaFechaHora || 'No registrada'} · Código de validación enviado a ${datos.comprador.celular}`, MARGIN_LEFT, yActual + 10);
  doc.text(`ID de firma: ${datos.comprador.firmaId || 'No registrado'} · Ley N° 25.506, art. 5`, MARGIN_LEFT, yActual + 15);
  yActual += 25;

  // Firma Garante (Si aplica)
  if (datos.contrato.tieneGarante && firmaGaranteDataURL) {
    comprobarEspacio(60);
    try {
      doc.addImage(firmaGaranteDataURL, "PNG", 45, yActual, 120, 35);
    } catch (error) { console.warn("Error firma garante:", error); }
    yActual += 38;
    doc.setDrawColor("#999999");
    doc.setLineWidth(0.3);
    doc.line(45, yActual, 165, yActual);
    yActual += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(negro);
    doc.text("EL GARANTE", MARGIN_LEFT, yActual);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`Firmado electrónicamente por ${datos.garante.nombre}, DNI N° ${datos.garante.dni}`, MARGIN_LEFT, yActual + 5);
    doc.text(`Fecha y hora: ${datos.garante.firmaFechaHora || 'No registrada'} · Código de validación enviado a ${datos.garante.celular}`, MARGIN_LEFT, yActual + 10);
    doc.text(`ID de firma: ${datos.garante.firmaId || 'No registrado'} · Ley N° 25.506, art. 5`, MARGIN_LEFT, yActual + 15);
    yActual += 25;
  }

  // Firma Empresa
  comprobarEspacio(35);
  yActual += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(azulOscuro);
  doc.text("COMUNIDAD IPHONE", PAGE_WIDTH / 2, yActual, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(gris);
  doc.text(`Nombre comercial de ${datos.empresa.titular} · DNI N° ${datos.empresa.dniTitular}`, PAGE_WIDTH / 2, yActual + 5, { align: "center" });
  doc.text(`${datos.empresa.direccion}`, PAGE_WIDTH / 2, yActual + 10, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(azul);
  doc.text("FIRMA AUTORIZADA", PAGE_WIDTH / 2, yActual + 16, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text(`Firma electrónica — Ley N° 25.506`, PAGE_WIDTH / 2, yActual + 20, { align: "center" });
  doc.text(`ID de firma: ${datos.empresa.firmaEmpresaId || 'EMP-S/N'} · ${datos.empresa.firmaEmpresaFechaHora || new Date().toLocaleString('es-AR')}`, PAGE_WIDTH / 2, yActual + 24, { align: "center" });

  // ============================================================
  // ANEXOS
  // ============================================================
  
  // ANEXO I
  nuevaPagina();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(azulOscuro);
  doc.text("ANEXO I — CONSENTIMIENTOS INFORMADOS", PAGE_WIDTH / 2, 20, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gris);
  doc.text(`Contrato N° ${datos.contrato.numeroContrato} - iPhone ${datos.equipo.modelo} - IMEI ${datos.equipo.imei1}`, PAGE_WIDTH / 2, 26, { align: "center" });
  
  yActual = 35;
  agregarParrafo("El COMPRADOR confirma cada punto en el sistema. Cada confirmación queda registrada con fecha y hora. Declaro que se me explicó y que entiendo y acepto que:", 8.5, 6);

  const consentimientosData = [
    ["1", "El equipo tiene instalado un sistema que permite a COMUNIDAD IPHONE bloquearlo a distancia si no pago.", datos.consentimientos.ok_1],
    ["2", "Solo se puede bloquear si tengo una cuota vencida e impaga y pasaron cinco (5) días corridos desde el primer día de mora. Si estoy al día, nunca se bloquea.", datos.consentimientos.ok_2],
    ["3", "Bloqueado, no puedo usar las aplicaciones, pero siempre puedo llamar a emergencias (911) y comunicarme con el local.", datos.consentimientos.ok_3],
    ["4", "Desde el primer día de mora, el local me avisa por WhatsApp el importe adeudado y la fecha del bloqueo.", datos.consentimientos.ok_4],
    ["5", "El bloqueo y el desbloqueo se aplican cuando el equipo tiene conexión a internet.", datos.consentimientos.ok_5],
    ["6", "Cuando pago lo adeudado, el local desbloquea el equipo: en el acto si pago en efectivo, y dentro de las 24 horas de acreditado si pago por transferencia.", datos.consentimientos.ok_6],
    ["7", "No debo quitar el perfil de gestión, restablecer de fábrica ni alterar el equipo; si lo hago, puede quedar inutilizable y es un incumplimiento grave.", datos.consentimientos.ok_7],
    ["8", "El sistema registra la ubicación del equipo solo mientras está bloqueado.", datos.consentimientos.ok_8],
    ["9", "El sistema no lee mis mensajes, fotos, contactos ni navegación.", datos.consentimientos.ok_9],
    ["10", "Cuando termino de pagar, el local libera el equipo dentro de las 48 horas hábiles y queda totalmente mío, sin sistema ni restricciones.", datos.consentimientos.ok_10],
    ["11", "El sistema no es un producto de Apple y no es infalible.", datos.consentimientos.ok_11],
    ["12", "Si me atraso, pago $ 4.000 por cada día de atraso, en total, desde el día siguiente al vencimiento y hasta que pague.", datos.consentimientos.ok_12],
    ["13", "Si vence una segunda cuota sin pagar la anterior, mi caso pasa al Área Legal, que me intima a pagar o devolver el equipo en 48 horas, con honorarios del 10 % (de contado) o del 20 % (con plan de pagos) sobre el capital reclamado.", datos.consentimientos.ok_13],
    ["14", "Si no regularizo, pueden informarme a Veraz a mí y a mi garante; al cancelar, piden la desafectación dentro de los 5 días hábiles.", datos.consentimientos.ok_14],
    ["15", "Mi celular principal, mi celular alternativo y mi correo son válidos para recibir avisos e intimaciones.", datos.consentimientos.ok_15],
    ["16", "Doy mi consentimiento para el tratamiento de mis datos personales según la cláusula Decimoctava.", datos.consentimientos.ok_16],
    ["17", "Opcional. Autorizo el uso de mi imagen en las publicaciones de COMUNIDAD IPHONE (cláusula Vigésima Cuarta).", datos.consentimientos.ok_imagen]
  ];

  autoTable(doc, {
    ...estiloTablaBase,
    startY: yActual,
    head: [['N°', 'Declaración', 'Aceptación']],
    body: consentimientosData,
    columnStyles: { 0: { cellWidth: 10, halign: 'center', fillColor: "#FFFFFF" }, 1: { cellWidth: 140, fillColor: "#FFFFFF" }, 2: { cellWidth: 30, halign: 'center', fontStyle: 'bold', fillColor: "#FFFFFF" } },
  });
  yActual = doc.lastAutoTable.finalY + 10;

  if (datos.contrato.tieneGarante) {
    agregarParrafo("EL GARANTE declara que leyó el contrato completo, que acepta ser fiador solidario y principal pagador (cláusula Decimonovena), que sus datos de contacto son válidos para notificaciones (cláusula Vigésima), y que autoriza los informes crediticios (cláusula Decimoséptima) y el tratamiento de sus datos (cláusula Decimoctava): " + datos.consentimientos.ok_garante, 8.5, 10);
  }

  // ANEXO II
  nuevaPagina();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(azulOscuro);
  doc.text("ANEXO II — CRONOGRAMA DE PAGOS", PAGE_WIDTH / 2, 20, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gris);
  doc.text(`Contrato N° ${datos.contrato.numeroContrato} • ${datos.comprador.nombre} • DNI N° ${datos.comprador.dni}`, PAGE_WIDTH / 2, 26, { align: "center" });

  yActual = 35;

  autoTable(doc, {
    ...estiloTablaBase,
    startY: yActual,
    body: [
      ['Saldo financiado', `$ ${datos.finanzas.saldoFinanciado.toLocaleString('es-AR')}`],
      ['Cuotas', `${datos.finanzas.cantidadCuotas} cuotas mensuales de $ ${datos.finanzas.valorCuota.toLocaleString('es-AR')}`],
      ['Plazo de pago de cada cuota', `Del día 1 al día ${datos.finanzas.diaLimitePago} del mes de vencimiento`],
      ['Medios de pago oficiales', `Efectivo en el local contra recibo oficial, o transferencia al alias ${datos.empresa.aliasPago}`]
    ],
  });
  yActual = doc.lastAutoTable.finalY + 5;

  autoTable(doc, {
    ...estiloTablaBase,
    startY: yActual,
    head: [['Cuota N°', 'Vence (del 1 al ' + datos.finanzas.diaLimitePago + ' de)', 'Importe', 'Pagada el', 'Recibo N°']],
    body: datos.finanzas.cuotas.map(c => [c.numero, c.mesVencimiento, `$ ${c.importe.toLocaleString('es-AR')}`, c.fechaPago, c.recibo]),
    columnStyles: { 0: { halign: 'center', fillColor: "#FFFFFF" }, 1: { halign: 'center', fillColor: "#FFFFFF" }, 2: { halign: 'right', fillColor: "#FFFFFF" }, 3: { halign: 'center', fillColor: "#FFFFFF" }, 4: { halign: 'center', fillColor: "#FFFFFF" } },
  });
  yActual = doc.lastAutoTable.finalY + 5;

  autoTable(doc, {
    ...estiloTablaBase,
    startY: yActual,
    body: [['Total a pagar en cuotas', `$ ${datos.finanzas.totalCuotas.toLocaleString('es-AR')}`]],
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.5, textColor: negro, fontStyle: 'bold' },
  });
  
  yActual = doc.lastAutoTable.finalY + 10;
  agregarParrafo("Desde el día siguiente al vencimiento corre un interés de $ 4.000 por día de atraso, en total (cláusula Séptima). Las columnas «Pagada el» y «Recibo N°» las completa el sistema al registrar cada pago.", 8, 0);

  // ANEXO III
  nuevaPagina();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(azulOscuro);
  doc.text("ANEXO III — ESTADO DEL EQUIPO ENTREGADO", PAGE_WIDTH / 2, 20, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gris);
  doc.text(`Contrato N° ${datos.contrato.numeroContrato} · Verificado por ${datos.equipo.tecnicoNombre} el ${datos.contrato.fechaFirmaLetras}`, PAGE_WIDTH / 2, 26, { align: "center" });

  yActual = 35;

  autoTable(doc, {
    ...estiloTablaBase,
    startY: yActual,
    head: [['IDENTIFICACIÓN', '']],
    body: [
      ['Modelo / capacidad / color', `iPhone ${datos.equipo.modelo} · ${datos.equipo.capacidad} · ${datos.equipo.color}`],
      ['Estado', datos.equipo.estado],
      ['IMEI 1 / IMEI 2 / N° de serie', `${datos.equipo.imei1} / ${datos.equipo.imei2 || '-'} / ${datos.equipo.numeroSerie || '-'}`],
      ['Versión de iOS', datos.equipo.ios || '-']
    ],
  });
  yActual = doc.lastAutoTable.finalY + 1;

  autoTable(doc, {
    ...estiloTablaBase,
    startY: yActual,
    head: [['VERIFICACIONES (Ajustes del iPhone)', '']],
    body: [
      ['Salud de la batería', `${datos.equipo.bateriaSalud} % (Ajustes > Batería > Estado)`],
      ['Piezas reportadas por el iPhone', `${datos.equipo.piezasEstado} (Ajustes > General > Información)`],
      ['Cuenta de iCloud de terceros', 'No tiene'],
      ['IMEI denunciado', `No. Consultado el ${datos.equipo.imeiConsultaFecha}`]
    ],
  });
  yActual = doc.lastAutoTable.finalY + 1;

  autoTable(doc, {
    ...estiloTablaBase,
    startY: yActual,
    head: [['ESTADO FUNCIONAL Y ESTÉTICO', '']],
    body: [
      ['Pantalla y táctil', datos.equipo.estadoPantalla || '-'],
      ['Cámaras / Face ID o Touch ID', `${datos.equipo.estadoCamaras || '-'} / ${datos.equipo.estadoBiometria || '-'}`],
      ['Audio, micrófono, carga y señal', datos.equipo.estadoFunciones || '-'],
      ['Estado estético (marcos y tapa)', datos.equipo.estadoEstetico || '-'],
      ['Observaciones', datos.equipo.observacionesEquipo || '-'],
      ['Fotografías', `${datos.equipo.cantidadFotos} fotografías del equipo guardadas en el sistema`],
      ['Accesorios entregados', datos.equipo.accesorios || '-']
    ],
  });
  yActual = doc.lastAutoTable.finalY + 10;

  agregarParrafo("El COMPRADOR declara que verificó EL EQUIPO antes de retirarlo y que lo recibe en el estado aquí descripto. Este anexo es la base para la garantía (cláusula Decimosexta) y para la liquidación de daños en caso de restitución (cláusula Novena).", 8.5, 10);

  // Firmas Anexo III
  if (firmaClienteDataURL) {
    try {
      doc.addImage(firmaClienteDataURL, "PNG", 20, yActual, 80, 25);
    } catch (error) { console.warn("Error firma cliente:", error); }
  }
  yActual += 28;
  doc.setDrawColor("#999999");
  doc.setLineWidth(0.3);
  doc.line(20, yActual, 100, yActual);
  yActual += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(negro);
  doc.text("EL COMPRADOR", 20, yActual);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Firmado electrónicamente por ${datos.comprador.nombre}, DNI N° ${datos.comprador.dni}`, 20, yActual + 4);
  doc.text(`Fecha y hora: ${datos.comprador.firmaFechaHora || 'No registrada'} · Código de validación enviado a ${datos.comprador.celular}`, 20, yActual + 8);
  doc.text(`ID de firma: ${datos.comprador.firmaId || 'No registrado'} · Ley N° 25.506, art. 5`, 20, yActual + 12);

  // Firma Empresa (Anexo III)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(azulOscuro);
  doc.text("COMUNIDAD IPHONE", 150, yActual - 12, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(gris);
  doc.text(`Nombre comercial de ${datos.empresa.titular} · DNI N° ${datos.empresa.dniTitular}`, 150, yActual - 8, { align: "center" });
  doc.text(`${datos.empresa.direccion}`, 150, yActual - 4, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(azul);
  doc.text("FIRMA AUTORIZADA", 150, yActual + 1, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text(`Firma electrónica — Ley N° 25.506`, 150, yActual + 5, { align: "center" });
  doc.text(`ID de firma: ${datos.empresa.firmaEmpresaId || 'EMP-S/N'} · ${datos.empresa.firmaEmpresaFechaHora || new Date().toLocaleString('es-AR')}`, 150, yActual + 9, { align: "center" });

  // ANEXO IV (Solo si hay canje)
  if (datos.contrato.tieneCanje && datos.canje) {
    nuevaPagina();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(azulOscuro);
    doc.text("ANEXO IV — COMPROBANTE DE PLAN CANJE", PAGE_WIDTH / 2, 20, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(gris);
    doc.text(`Contrato N° ${datos.contrato.numeroContrato} • ${datos.comprador.nombre} • DNI N° ${datos.comprador.dni}`, PAGE_WIDTH / 2, 26, { align: "center" });

    yActual = 35;

    autoTable(doc, {
      ...estiloTablaBase,
      startY: yActual,
      head: [['EQUIPO ENTREGADO POR EL COMPRADOR', '']],
      body: [
        ['Modelo / capacidad / color', `iPhone ${datos.canje.modelo} · ${datos.canje.capacidad} · ${datos.canje.color}`],
        ['IMEI / N° de serie', `${datos.canje.imei} / ${datos.canje.numeroSerie || '-'}`],
        ['Salud de la batería', `${datos.canje.bateria} %`],
        ['Estado según revisión técnica', datos.canje.estado],
        ['iCloud y código', 'Retirados en presencia del VENDEDOR'],
        ['Revisado por', datos.equipo.tecnicoNombre]
      ],
    });
    yActual = doc.lastAutoTable.finalY + 1;

    autoTable(doc, {
      ...estiloTablaBase,
      startY: yActual,
      head: [['IMPUTACIÓN', '']],
      body: [
        ['Valor asignado de común acuerdo', `$ ${datos.canje.valor.toLocaleString('es-AR')}`],
        ['Se imputa a', `Anticipo del contrato N° ${datos.contrato.numeroContrato}`]
      ],
    });
    yActual = doc.lastAutoTable.finalY + 10;

    agregarParrafo("El COMPRADOR declara bajo juramento que es titular del equipo entregado, que es de procedencia lícita y que su IMEI no está denunciado, y transfiere su propiedad al VENDEDOR en los términos de la cláusula Vigésima Segunda.", 8.5, 15);

    // Firmas Anexo IV
    if (firmaClienteDataURL) {
      try {
        doc.addImage(firmaClienteDataURL, "PNG", 20, yActual, 80, 25);
      } catch (error) { console.warn("Error firma cliente:", error); }
    }
    yActual += 28;
    doc.setDrawColor("#999999");
    doc.setLineWidth(0.3);
    doc.line(20, yActual, 100, yActual);
    yActual += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(negro);
    doc.text("EL COMPRADOR", 20, yActual);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`Firmado electrónicamente por ${datos.comprador.nombre}, DNI N° ${datos.comprador.dni}`, 20, yActual + 4);
    doc.text(`Fecha y hora: ${datos.comprador.firmaFechaHora || 'No registrada'} · Código de validación enviado a ${datos.comprador.celular}`, 20, yActual + 8);
    doc.text(`ID de firma: ${datos.comprador.firmaId || 'No registrado'} · Ley N° 25.506, art. 5`, 20, yActual + 12);

    // Firma Empresa (Anexo IV)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(azulOscuro);
    doc.text("COMUNIDAD IPHONE", 150, yActual - 12, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(gris);
    doc.text(`Nombre comercial de ${datos.empresa.titular} · DNI N° ${datos.empresa.dniTitular}`, 150, yActual - 8, { align: "center" });
    doc.text(`${datos.empresa.direccion}`, 150, yActual - 4, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(azul);
    doc.text("FIRMA AUTORIZADA", 150, yActual + 1, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(`Firma electrónica — Ley N° 25.506`, 150, yActual + 5, { align: "center" });
    doc.text(`ID de firma: ${datos.empresa.firmaEmpresaId || 'EMP-S/N'} · ${datos.empresa.firmaEmpresaFechaHora || new Date().toLocaleString('es-AR')}`, 150, yActual + 9, { align: "center" });
  }

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
  const nombreArchivo = `contrato-credito-${datos.comprador.nombre.replace(/\s+/g, '-')}-${datos.comprador.dni}.pdf`;
  doc.save(nombreArchivo);
};