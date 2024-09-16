import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const GeneraComprobacion = async (solicitud_gasto, comprobaciones) => {
  try {
    const doc = new jsPDF({ orientation: "portrait", format: "letter" });
    doc.setPage();
    doc.setFontSize(17);
    doc.setFont("bold");

    let pdfWidth = doc.internal.pageSize.getWidth();
    let pdfHeight = doc.internal.pageSize.getHeight();
    var imgWidth = 20;
    var imgHeight = 10;
    let rectHeight = 8;
    let x = 10;
    let y = 30;
    let img = new Image();
    img.src = require("../assets/IEEN300.png");
    doc.addImage(img, "png", 10, 5, 30, 20);
    //let title = "Relación detallada de documentos comprobatorios de gastos";
    //let titleWidth = doc.getTextWidth(title);
    //let titleX = (pdfWidth - titleWidth) / 2;
    doc.setFontSize(10);
    doc.setFont("normal", "bold");
    doc.text(
      "RELACIÓN DETALLADA DE DOCUMENTOS COMPROBATORIOS DE GASTOS",
      110,
      15,
      null,
      null,
      "center"
    );
    doc.setFontSize(12);
    doc.text(`FOLIO: ${solicitud_gasto.folio}`, 90, 21);
    //doc.text(titleX, 20, title);
    y += 5;
    doc.setFont("normal", "normal");
    doc.setFontSize(12);
    doc.text(
      `Relación de documentos que se anexan para comprobar los gastos otorgados el día ${solicitud_gasto.fecha_Pago_Largo}`,
      x,
      y,
      {
        align: "justify",
        maxWidth: pdfWidth - 20,
      }
    );
    y += 10;
    let strArrActividad = doc.splitTextToSize(
      solicitud_gasto.actividad,
      pdfWidth - 20
    );
    doc.text(`Con motivo de: ${solicitud_gasto.actividad}`, x, y, {
      align: "justify",
      maxWidth: pdfWidth - 20,
    });
    y += strArrActividad.length * rectHeight;
    y += 5;

    // doc.rect(x - 2, y, 10, rectHeight, "S"); // no
    // doc.rect(x + 8, y, 30, rectHeight, "S"); // Fecha
    // doc.rect(x + 38, y, 65, rectHeight, "S"); //No folio
    // doc.rect(x + 103, y, 60, rectHeight, "S"); // Empresa
    // doc.rect(x + 163, y, 30, rectHeight, "S");//Importe
    // y += 5
    // doc.setFontSize(10)
    var columnStyles = {
      4: { halign: "right" },
    };
    var headStyles = {
      fillColor: [93, 109, 126],
    };

    var body = [
      ...comprobaciones.map((el) => [
        el.no,
        el.clave_Gasto,
        el.fecha_Comprobante,
        el.folio,
        el.emisor,
        el.importe,
      ]),
      [
        {
          content: `Total  ${solicitud_gasto.monto_Utilizado}`,
          colSpan: 6,
          styles: { halign: "right" },
        },
      ],
      [
        {
          content: `Monto asignado  ${solicitud_gasto.monto_Asignado}`,
          colSpan: 6,
          styles: { halign: "right" },
        },
      ],
      [
        {
          content: `Reintegro  ${solicitud_gasto.monto_Reintegro}`,
          colSpan: 6,
          styles: { halign: "right" },
        },
      ],
      [
        {
          content: `Diferencia  $${solicitud_gasto.monto_Saldo}`,
          colSpan: 6,
          styles: { halign: "right" },
        },
      ],
    ];

    doc.autoTable({
      head: [
        ["No", "Gasto", "Fecha", "Folio del comprobante", "Emisor", "Importe"],
      ],
      body: body,
      headStyles: headStyles,
      columnStyles: columnStyles,
      columns: [
        { dataKey: "no" },
        { dataKey: "clave_Gasto" },
        { dataKey: "fecha_Comprobante" },
        { dataKey: "folio" },
        { dataKey: "emisor" },
        { dataKey: "importe" },
      ],

      startY: y,
      tableWidth: pdfWidth - 25,
      pageBreak: "avoid",
    });
    const heigthTable = doc.lastAutoTable.finalY;
    y = heigthTable + 15;
    doc.text(
      "Me responsabilizo la autenticidad de las facturas y documentos que se presentan.",
      x,
      y,
      {
        align: "justify",
      }
    );
    y = pdfHeight - 45;
    let atte = "Atentamente";
    let atteWidth = doc.getTextWidth(atte);
    let atteX = (pdfWidth - atteWidth) / 2;
    doc.text(atteX, y, atte);

    y += 10;
    doc.line(30, y, 180, y);
    y += 5;
    let empleado = solicitud_gasto.empleado_Solicitante;
    let empleadoWidth = doc.getTextWidth(empleado);
    let empleadoX = (pdfWidth - empleadoWidth) / 2;
    doc.text(empleadoX, y, empleado);

    doc.save(`${solicitud_gasto.folio}-Gastos.pdf`);

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

export default GeneraComprobacion;
