import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../../assets/logocenter.png";

export const generarSolicitudFinanciacion = (datos, firmaClienteDataURL, firmaGaranteDataURL = null) => {
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
  let yActual = 20;

  const azulOscuro = "#021C5E";
  const azul = "#3483FA";
  const negro = "#222222";
  const gris = "#777777";
  const grisClaro = "#AAAAAA";
  const grisFondo = "#F5F7FB";

  // ============================================================
  // FUNCIONES AUXILIARES
  // ============================================================
  const comprobarEspacio = (alturaNecesaria = 10) => {
    if (yActual + alturaNecesaria > 273) {
      doc.addPage();
      yActual = 20;
      return true;
    }
    return false;
  };

  const agregarTituloSeccion = (letra, titulo) => {
    comprobarEspacio(15);
    yActual += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(azulOscuro);
    doc.text(`${letra}. ${titulo}`, MARGIN_LEFT, yActual);
    yActual += 4;
    doc.setDrawColor(azulOscuro);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT, yActual, PAGE_WIDTH - MARGIN_RIGHT, yActual);
    yActual += 4;
  };

  const formatoMoneda = (v) => v ? `$${Number(v).toLocaleString("es-AR")}` : "$0";
  const check = (val) => val && val !== "-" ? val : "___________";

  // ============================================================
  // ENCABEZADO (Logo centrado, título, subtítulo)
  // ============================================================
  try {
    // Logo centrado (ancho 40, alto 20)
    doc.addImage(logo, "PNG", (PAGE_WIDTH - 40) / 2, 10, 40, 20);
  } catch (error) {
    console.warn("No se pudo cargar el logo:", error);
  }

  yActual = 35;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(gris);
  doc.text("COMUNIDAD IPHONE · Patagonia 695 · Santiago del Estero · 385 417-8021", PAGE_WIDTH / 2, yActual, { align: "center" });
  
  yActual += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(azulOscuro);
  doc.text("SOLICITUD DE FINANCIACIÓN", PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(gris);
  doc.text(`Crédito personal · Sistema 1 · Solicitud N° ${datos.contrato.numeroContrato}`, PAGE_WIDTH / 2, yActual, { align: "center" });

  yActual += 10;

  // ============================================================
  // TABLA DATOS DE LA SOLICITUD (Fecha, sucursal, asesor)
  // ============================================================
  autoTable(doc, {
    startY: yActual,
    body: [
      ["Fecha y sucursal", `${datos.contrato.fechaSolicitud} · ${datos.contrato.sucursal}`],
      ["Asesor comercial", datos.contrato.asesorNombre],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    theme: 'grid',
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2, textColor: negro, lineColor: "#E5E5E5", lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 45, fillColor: grisFondo } },
  });
  yActual = doc.lastAutoTable.finalY + 3;

  // Texto legal
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(gris);
  const textoLegal = "Esta solicitud sirve para evaluar la financiación. No obliga a COMUNIDAD IPHONE a otorgarla ni al solicitante a contratarla. Si se aprueba, la operación se formaliza en el contrato de compraventa en cuotas.";
  const lineasLegal = doc.splitTextToSize(textoLegal, CONTENT_WIDTH);
  doc.text(lineasLegal, MARGIN_LEFT, yActual);
  yActual += lineasLegal.length * 3.5 + 5;

  // ============================================================
  // A. DATOS DEL SOLICITANTE
  // ============================================================
  agregarTituloSeccion("A", "DATOS DEL SOLICITANTE");
  autoTable(doc, {
    startY: yActual,
    body: [
      ["Nombre y apellido", check(datos.cliente.nombre)],
      ["DNI / CUIL", `${check(datos.cliente.dni)} / ${check(datos.cliente.cuil)}`],
      ["Fecha de nacimiento / estado civil", `${check(datos.cliente.nacimiento)} / ${check(datos.cliente.estadoCivil)}`],
      ["Domicilio real", `${check(datos.cliente.domicilio)}, barrio ${check(datos.cliente.barrio)}, ${check(datos.cliente.localidad)}`],
      ["Referencias para llegar", check(datos.cliente.referenciasDomicilio)],
      ["Celular principal / alternativo", `${check(datos.cliente.celular)} / ${check(datos.cliente.celularAlt)}`],
      ["Correo electrónico", check(datos.cliente.email)],
      ["Ocupación y empleador", `${check(datos.cliente.ocupacion)} · ${check(datos.cliente.empleador)}`],
      ["Antigüedad / ingreso mensual neto", `${check(datos.cliente.antiguedad)} / ${formatoMoneda(datos.cliente.ingreso)}`],
      ["Cómo cobra sus ingresos", check(datos.cliente.medioCobro)],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    theme: 'grid',
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2, textColor: negro, lineColor: "#E5E5E5", lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55, fillColor: grisFondo } },
  });
  yActual = doc.lastAutoTable.finalY + 5;

  // ============================================================
  // B. DATOS DEL GARANTE (Si aplica)
  // ============================================================
  if (datos.contrato.tieneGarante) {
    agregarTituloSeccion("B", "DATOS DEL GARANTE");
    autoTable(doc, {
      startY: yActual,
      body: [
        ["Nombre y apellido", check(datos.garante.nombre)],
        ["DNI / CUIL", `${check(datos.garante.dni)} / ${check(datos.garante.cuil)}`],
        ["Fecha de nacimiento / estado civil", `${check(datos.garante.nacimiento)} / ${check(datos.garante.estadoCivil)}`],
        ["Domicilio real", `${check(datos.garante.domicilio)}, barrio ${check(datos.garante.barrio)}, ${check(datos.garante.localidad)}`],
        ["Referencias para llegar", check(datos.garante.referenciasDomicilio)],
        ["Celular principal / alternativo", `${check(datos.garante.celular)} / ${check(datos.garante.celularAlt)}`],
        ["Correo electrónico", check(datos.garante.email)],
        ["Ocupación y empleador", `${check(datos.garante.ocupacion)} · ${check(datos.garante.empleador)}`],
        ["Antigüedad / ingreso mensual neto", `${check(datos.garante.antiguedad)} / ${formatoMoneda(datos.garante.ingreso)}`],
        ["Cómo cobra sus ingresos", check(datos.garante.medioCobro)],
        ["Vínculo con el solicitante", check(datos.garante.vinculo)],
      ],
      margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
      theme: 'grid',
      styles: { font: "helvetica", fontSize: 8, cellPadding: 2, textColor: negro, lineColor: "#E5E5E5", lineWidth: 0.2 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 55, fillColor: grisFondo } },
    });
    yActual = doc.lastAutoTable.finalY + 5;
  }

  // ============================================================
  // NUEVA PÁGINA PARA SECCIONES RESTANTES
  // ============================================================
  doc.addPage();
  yActual = 20;

  // ============================================================
  // C. REFERENCIAS PERSONALES DEL SOLICITANTE
  // ============================================================
  agregarTituloSeccion("C", "REFERENCIAS PERSONALES DEL SOLICITANTE");
  autoTable(doc, {
    startY: yActual,
    head: [['Nombre y apellido', 'Vínculo', 'Teléfono', 'Domicilio']],
    body: datos.referencias.map(ref => [check(ref.nombre), check(ref.vinculo), check(ref.telefono), check(ref.domicilio)]),
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    theme: 'grid',
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2, textColor: negro, lineColor: "#E5E5E5", lineWidth: 0.2 },
    headStyles: { fillColor: azulOscuro, textColor: "#FFFFFF", fontStyle: "bold" },
  });
  yActual = doc.lastAutoTable.finalY + 5;

  // ============================================================
  // D. OPERACIÓN SOLICITADA
  // ============================================================
  agregarTituloSeccion("D", "OPERACIÓN SOLICITADA");
  autoTable(doc, {
    startY: yActual,
    body: [
      ["Equipo", `iPhone ${check(datos.operacion.equipoModelo)} · ${check(datos.operacion.equipoCapacidad)} · ${check(datos.operacion.equipoColor)} · ${check(datos.operacion.equipoEstado)}`],
      ["Precio de contado", formatoMoneda(datos.operacion.precioContado)],
      ["Anticipo propuesto", `${formatoMoneda(datos.operacion.anticipoTotal)} ${datos.operacion.anticipoDetalle}`],
      ["Equipo en canje", datos.contrato.tieneCanje ? `iPhone ${check(datos.canje.modelo)} · valor estimado ${formatoMoneda(datos.canje.valor)}` : "No"],
      ["Saldo a financiar", formatoMoneda(datos.operacion.saldoFinanciado)],
      ["Plan", `${datos.operacion.cantidadCuotas} cuotas mensuales de ${formatoMoneda(datos.operacion.valorCuota)}, pagaderas del 1 al ${datos.operacion.diaLimitePago} de cada mes`],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    theme: 'grid',
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2, textColor: negro, lineColor: "#E5E5E5", lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55, fillColor: grisFondo } },
  });
  yActual = doc.lastAutoTable.finalY + 5;

  // ============================================================
  // E. DOCUMENTACIÓN PRESENTADA
  // ============================================================
  agregarTituloSeccion("E", "DOCUMENTACIÓN PRESENTADA");
  autoTable(doc, {
    startY: yActual,
    head: [['Documento', 'Solicitante', 'Garante']],
    body: [
      ['DNI, frente y dorso (original a la vista)', check(datos.documentacion.doc_dni_cliente), check(datos.documentacion.doc_dni_garante)],
      ['Fotografía de validación con el DNI en mano', check(datos.documentacion.doc_selfie_cliente), check(datos.documentacion.doc_selfie_garante)],
      ['Boleta de servicio (luz) del domicilio declarado', check(datos.documentacion.doc_servicio_cliente), check(datos.documentacion.doc_servicio_garante)],
      ['Comprobante de ingresos (recibo de sueldo o constancia de monotributo)', check(datos.documentacion.doc_ingresos_cliente), check(datos.documentacion.doc_ingresos_garante)],
      ['Foto del frente del domicilio (opcional)', check(datos.documentacion.doc_frente_cliente), check(datos.documentacion.doc_frente_garante)],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    theme: 'grid',
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2, textColor: negro, lineColor: "#E5E5E5", lineWidth: 0.2 },
    headStyles: { fillColor: azulOscuro, textColor: "#FFFFFF", fontStyle: "bold" },
  });
  yActual = doc.lastAutoTable.finalY + 5;

  // ============================================================
  // F. DECLARACIONES Y AUTORIZACIONES
  // ============================================================
  agregarTituloSeccion("F", "DECLARACIONES Y AUTORIZACIONES");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(negro);
  const textoDeclaraciones = "F.1. Declaración jurada. El solicitante y el garante declaran bajo juramento que los datos y la documentación presentados son verdaderos y completos, y que conocen que su falsedad autoriza a rechazar la solicitud o, si el crédito ya se hubiera otorgado, a dar por caducos los plazos.\n\nF.2. Informes crediticios. El solicitante y el garante autorizan a COMUNIDAD IPHONE, nombre comercial de Franco Carlos Lautaro Gómez Cano, a consultar sus antecedentes en Veraz (Equifax), Nosis, la Central de Deudores del BCRA y bases similares, para evaluar esta solicitud.\n\nF.3. Datos personales. El solicitante y el garante prestan su consentimiento para que sus datos se traten con la finalidad de evaluar esta solicitud y, si se aprueba, de administrar el contrato, conforme la Ley N° 25.326. Si la solicitud se rechaza, los datos se conservan solo el tiempo necesario para atender consultas y luego se eliminan.";
  const lineasDecl = doc.splitTextToSize(textoDeclaraciones, CONTENT_WIDTH);
  doc.text(lineasDecl, MARGIN_LEFT, yActual);
  yActual += lineasDecl.length * 3.5 + 5;

  // ============================================================
  // NUEVA PÁGINA PARA FIRMAS Y EVALUACIÓN
  // ============================================================
  doc.addPage();
  yActual = 20;

  // ============================================================
  // FIRMAS
  // ============================================================
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("4. Resultado. COMUNIDAD IPHONE evalúa la solicitud conforme su política de crédito y comunica el resultado por WhatsApp al celular declarado.", MARGIN_LEFT, yActual);
  yActual += 8;

  const dibujarFirma = (titulo, nombre, dni, firmaDataURL, x, y) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(azulOscuro);
    doc.text(titulo, x + 35, y);
    
    if (firmaDataURL) {
      try { doc.addImage(firmaDataURL, "PNG", x + 10, y + 3, 50, 20); } catch (e) {}
    }
    
    doc.setDrawColor("#999999");
    doc.setLineWidth(0.3);
    doc.line(x + 10, y + 25, x + 60, y + 25);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(negro);
    doc.text(`Firmado electrónicamente por ${nombre}, DNI N° ${dni}`, x + 10, y + 29);
    doc.text(`Fecha y hora: ${datos.contrato.fechaSolicitud}`, x + 10, y + 33);
    doc.text(`Ley N° 25.506, art. 5`, x + 10, y + 37);
  };

  // Firma Solicitante (Izquierda)
  dibujarFirma("EL SOLICITANTE", datos.cliente.nombre, datos.cliente.dni, firmaClienteDataURL, MARGIN_LEFT, yActual);

  // Firma Garante (Derecha)
  if (datos.contrato.tieneGarante) {
    dibujarFirma("EL GARANTE", datos.garante.nombre, datos.garante.dni, firmaGaranteDataURL, PAGE_WIDTH / 2 + 5, yActual);
  }

  yActual += 50;

  // ============================================================
  // G. EVALUACIÓN CREDITICIA (USO INTERNO)
  // ============================================================
  agregarTituloSeccion("G", "EVALUACIÓN CREDITICIA (uso interno)");
  autoTable(doc, {
    startY: yActual,
    body: [
      ["Veraz del solicitante", `${datos.evaluacion.verazClienteResultado} - consultado el ${datos.evaluacion.verazClienteFecha}`],
      ["Veraz del garante", `${datos.evaluacion.verazGaranteResultado} - consultado el ${datos.evaluacion.verazGaranteFecha}`],
      ["Cuota sobre ingreso del solicitante", `${datos.evaluacion.relacionCuotaIngresoCliente} %`],
      ["Cuota sobre ingreso del garante", `${datos.evaluacion.relacionCuotaIngresoGarante} %`],
      ["Juicios o embargos registrados", datos.evaluacion.juiciosEmbargos],
      ["Resultado", datos.evaluacion.resultado],
      ["Condiciones o motivo", datos.evaluacion.condiciones],
      ["Evaluó / fecha", `${datos.evaluacion.analistaNombre} - ${datos.evaluacion.fechaEvaluacion}`],
    ],
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    theme: 'grid',
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2, textColor: negro, lineColor: "#E5E5E5", lineWidth: 0.2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 60, fillColor: grisFondo } },
  });

  // ============================================================
  // PIE DE PÁGINA Y GUARDADO
  // ============================================================
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(grisClaro);
    doc.text(`COMUNIDAD IPHONE - Solicitud de financiación N° ${datos.contrato.numeroContrato}`, MARGIN_LEFT, 286);
    doc.text(`Página ${i} de ${totalPaginas}`, PAGE_WIDTH - MARGIN_RIGHT, 286, { align: "right" });
  }

  const nombreArchivo = `solicitud-financiacion-${datos.cliente.nombre.replace(/\s+/g, '-')}-${datos.cliente.dni}.pdf`;
  doc.save(nombreArchivo);
};