import { jsPDF } from "jspdf";

const GeneraInforme = async (solicitud_gasto, informe, evidencias) => {
  try {
    const doc = new jsPDF({ orientation: "portrait", format: "letter" });
    doc.setPage();
    doc.setFontSize(20);
    doc.setFont("bold");
    let pdfWidth = doc.internal.pageSize.getWidth();
    var imgWidth = 30;
    var imgHeight = 20;
    let x = 10;
    let y = 22;
    let img = new Image();
    img.src = require("../assets/IEEN300.png");
    doc.addImage(img, "png", 10, 5, 30, 20);
    let title = "Instituto Estatal Electoral de Nayarit";
    let titleWidth = doc.getTextWidth(title);
    let titleX = (pdfWidth - titleWidth) / 2;
    doc.text(titleX, 15, title);
    doc.setFontSize(15);
    doc.text("Informe de comisión", 89, y);
    doc.setFontSize(14);
    doc.text(`Folio: ${solicitud_gasto.folio}`, 160, y);
    doc.setFontSize(12);
    y = 35;
    doc.text(
      "En términos de lo dispuesto por los lineamientos administrativos para el ejercicio y control del gasto del Instituto Estatal Electoral de Nayarit, titulo V, numeral 5 de los viáticos y gasto de viaje, punto 12, en relación con el artículo 33 numeral IX de la Ley de Transparencia y Acceso a la Información del Estado de Nayarit, se rinde informe de comisión:",
      x,
      y,
      {
        align: "justify",
        maxWidth: pdfWidth - 20,
      }
    );
    y += 20;
    let rectHeight = 8;
    doc.rect(x - 2, y, pdfWidth - 15, rectHeight, "S");
    let titleDatosComisionado = "Datos del comisionado";
    let titleDatosPersonalWidth = doc.getTextWidth(title);
    let titlexDatosPerosnal = (pdfWidth - titleDatosPersonalWidth) / 2;
    y += 7;
    doc.text(titleDatosComisionado, titlexDatosPerosnal, y);
    y += 1;
    // doc.rect(x - 2, y, 55, rectHeight, "S");
    // doc.rect(x + 53, y, 146, rectHeight, "S");
    // y += 5;
    // doc.text("Nombre del comisionado:", x + 3, y);
    // doc.text(
    //   "Edgar Daniel Jiménez Cabrera - Titular de la Unidad Técnica de Informática y Estadística",
    //   x + 60,
    //   y
    // );
    let strArrNombre = doc.splitTextToSize(
      solicitud_gasto.empleado_Solicitante,
      pdfWidth - 77
    );
    let rectNomHeight = 6 * strArrNombre.length;
    doc.rect(x - 2, y, 55, rectNomHeight, "S");
    doc.rect(x + 53, y, 146, rectNomHeight, "S");
    y += 5;
    doc.text("Nombre del comisionado:", x + 3, y);
    doc.text(solicitud_gasto.empleado_Solicitante, x + 60, y, {
      align: "justify",
      maxWidth: pdfWidth - 79,
    });
    //-------
    y += rectNomHeight - 5;
    doc.rect(x - 2, y, 55, rectHeight, "S");
    doc.rect(x + 53, y, 146, rectHeight, "S");
    y += 5;
    doc.text("Adscripción:", x + 3, y);
    doc.text(solicitud_gasto.area, x + 60, y);
    y += 7;
    doc.rect(x - 2, y, pdfWidth - 15, rectHeight, "S");
    y += 7;
    let titleDatosComision = "Datos de la comisión";
    let titleDatosComisionWidth = doc.getTextWidth(titleDatosComision);
    let titlexDatosComision = (pdfWidth - titleDatosComisionWidth) / 2;
    doc.text(titleDatosComision, titlexDatosComision, y);
    y += 1;
    doc.rect(x - 2, y, 55, rectHeight, "S");
    doc.rect(x + 53, y, 146, rectHeight, "S");
    y += 7;
    doc.text("No. Oficio comisión:", x + 3, y);
    doc.text(solicitud_gasto.folio, x + 60, y);
    y += 1;

    let strArrDest = doc.splitTextToSize(
      solicitud_gasto.destino_String,
      pdfWidth - 77
    );
    let rectDestHeight = 6 * strArrDest.length;

    doc.rect(x - 2, y, 55, rectDestHeight, "S");
    doc.rect(x + 53, y, 146, rectDestHeight, "S");

    doc.text("Lugar de la comisión:", x + 3, y + 6);
    doc.text(solicitud_gasto.destino_String, x + 60, y + 6, {
      align: "justify",
      maxWidth: pdfWidth - 79,
    });
    y += rectDestHeight;
    doc.rect(x - 2, y, 55, rectHeight, "S");
    doc.rect(x + 53, y, 146, rectHeight, "S");
    y += 7;
    doc.text("Periodo de la comisión:", x + 3, y);
    doc.text(
      `Del ${solicitud_gasto.fecha_Salida} al ${solicitud_gasto.fecha_LLegada}`,
      x + 60,
      y
    );
    y += 1;
    doc.rect(x - 2, y, 55, rectHeight, "S");
    doc.rect(x + 53, y, 146, rectHeight, "S");
    y += 7;
    doc.text("Medio de transporte:", x + 3, y);
    doc.text(
      `${solicitud_gasto.medio_Transporte} ${
        solicitud_gasto.medio_Transporte_Especifico ?? ""
      }`,
      x + 60,
      y
    );
    y += 1;
    doc.rect(x - 2, y, 55, rectHeight, "S");
    doc.rect(x + 53, y, 146, rectHeight, "S");
    y += 7;
    doc.text("Vehículo:", x + 3, y);
    doc.text(solicitud_gasto.vehiculo ?? "N/A", x + 60, y);
    y += 1;
    doc.rect(x - 2, y, 55, rectHeight, "S");
    doc.rect(x + 53, y, 146, rectHeight, "S");
    y += 7;
    let importeWidth = doc.getTextWidth(`$${solicitud_gasto.monto_Asignado}`);
    doc.text("Monto erogado:", x + 3, y);
    doc.text(
      `${solicitud_gasto.monto_Asignado}`,
      pdfWidth - 10 - importeWidth,
      y
    );
    y += 1;
    let strArrObjetivo = doc.splitTextToSize(
      solicitud_gasto.actividad,
      pdfWidth - 77
    );
    let rectActHeight = 6 * strArrObjetivo.length;
    doc.rect(x - 2, y, 55, rectActHeight, "S");
    doc.rect(x + 53, y, 146, rectActHeight, "S");
    y += 5;
    doc.text("Objetivo de la comisión:", x + 3, y);
    doc.text(solicitud_gasto.actividad, x + 60, y, {
      align: "justify",
      maxWidth: pdfWidth - 79,
    });

    y += rectActHeight;
    doc.rect(x - 2, y, pdfWidth - 15, rectHeight, "S");
    let titleResumen = "Resumen de las actividades realizadas";
    let titlerESUMENWidth = doc.getTextWidth(titleResumen);
    let titlexResumen = (pdfWidth - titlerESUMENWidth) / 2;

    y += 7;
    doc.text(titleResumen, titlexResumen, y);
    y += 1;
    let strArrResumen = doc.splitTextToSize(
      informe.actividad_Realizada,
      pdfWidth - 20
    );
    let rectResumHeight = 6 * strArrResumen.length;
    doc.rect(x - 2, y, pdfWidth - 15, rectResumHeight, "S");
    y += 5;
    doc.text(informe.actividad_Realizada, x, y, {
      align: "justify",
      maxWidth: pdfWidth - 20,
    });
    y += rectResumHeight;

    if (y > 210) {
      doc.addPage();
      doc.setPage();

      x = 10;
      y = 10;
    }

    doc.rect(x - 2, y, pdfWidth - 15, rectHeight, "S");
    let titleConclusion = "Conclusión y resultado obtenido";
    let titlerConclusionWidth = doc.getTextWidth(titleConclusion);
    let titlexConslusion = (pdfWidth - titlerConclusionWidth) / 2;
    y += 6;
    doc.text(titleConclusion, titlexConslusion, y);

    let strArrConclusion = doc.splitTextToSize(
      informe.conclusion,
      pdfWidth - 20
    );
    let rectConcluHeight = 6 * strArrConclusion.length;
    y += 2;
    doc.rect(x - 2, y, pdfWidth - 15, rectConcluHeight, "S");
    y += 5;
    doc.text(informe.conclusion, x, y, {
      align: "justify",
      maxWidth: pdfWidth - 20,
    });

    // doc.setFontSize(14);
    // y += 20 + rectConcluHeight;
    // let titleAtte = "Atentamente";
    // let titleAtteWidth = doc.getTextWidth(titleAtte);
    // let titlexAtte = (pdfWidth - titleAtteWidth) / 2;
    // doc.text(titleAtte, titlexAtte, y);
    // y += 10;
    // doc.setFontSize(12);

    // doc.rect(x + 40, y, 110, 1, "F");
    // y += 5;
    // let titleAtteP = solicitud_gasto.empleado_Solicitante;
    // let titleAtteWidthP = doc.getTextWidth(titleAtteP);
    // let titlexAtteP = (pdfWidth - titleAtteWidthP) / 2;
    // doc.text(titleAtteP, titlexAtteP, y);
    doc.addPage();
    doc.setPage();

    // Get the width of the PDF document
    imgWidth = 90;
    imgHeight = 110;

    doc.setFontSize(20);
    doc.addImage(img, "png", 10, 5, 30, 20);
    let titleWidthE = doc.getTextWidth(
      "Instituto Estatal Electoral de Nayarit"
    );
    let titleXE = (pdfWidth - titleWidthE) / 2;
    doc.text(titleXE, 15, "Instituto Estatal Electoral de Nayarit");
    doc.setFontSize(15);
    doc.text("Evidencias", 100, 22);
    doc.setFontSize(15);
    doc.text(`Folio: ${solicitud_gasto.folio}`, 160, 22);

    let vuelta = 1;
    for (let evidencia of evidencias) {
      switch (vuelta) {
        case 1:
          x = 10;
          y = 25;
          break;
        case 2:
          x = 110;
          y = 25;
          break;
        case 3:
          x = 10;
          y = 138;
          break;
        case 4:
          x = 110;
          y = 138;
      }
      const extension = evidencia.evidencia_URL.split(".").pop();
      doc.addImage(evidencia.base_64, extension, x, y, imgWidth, imgHeight);
      vuelta++;
      if (vuelta == 5 && vuelta != evidencias.length + 1) {
        doc.addPage();
        doc.setPage();
        x = 10;
        y = 10;
        vuelta = 1;
      }
    }
    function createFooter() {
      doc.setFontSize(14);
      y = 255;
      let titleAtte = "Atentamente";
      let titleAtteWidth = doc.getTextWidth(titleAtte);
      let titlexAtte = (pdfWidth - titleAtteWidth) / 2;
      doc.text(titleAtte, titlexAtte, y);
      y += 10;
      doc.setFontSize(12);

      doc.rect(50, y, 110, 1, "F");
      y += 5;
      let titleAtteP = solicitud_gasto.empleado_Solicitante;
      let titleAtteWidthP = doc.getTextWidth(titleAtteP);
      let titlexAtteP = (pdfWidth - titleAtteWidthP) / 2;
      doc.text(titleAtteP, titlexAtteP, y);

      doc.setPage(i + 1);
      doc.setTextColor(0, 0, 0);
      doc.text(
        "Página " + (i + 1) + " de " + newPageCount,
        200,
        275,
        null,
        null,
        "right"
      );
    }
    var newPageCount = doc.internal.getNumberOfPages();
    for (var i = 0; i < newPageCount; i++) {
      createFooter();
    }
    doc.save(`${solicitud_gasto.folio}.pdf`);
    $q.loading.hide();
    return {
      success: true,
      msj: "Recibo generado con éxito",
    };
  } catch (error) {
    return {
      success: false,
      data: "Ocurrió un error, inténtelo de nuevo. Si el error persiste, contacte a soporte",
    };
  }
};

export default GeneraInforme;
