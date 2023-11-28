const fs = require("fs");
const path = require("path");
const HTML5ToPDF = require("html5-to-pdf");
const uploadsDir = "src/uploads/";
const pdfsDir = `${uploadsDir}pdfs`;

exports.generatePdf = async (htmlData, pdfName) => {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

  // make pdfs directory if do not exist
  if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir);

  const html5ToPDF = new HTML5ToPDF({
    inputBody: htmlData,
    outputPath: `${pdfsDir}/${pdfName}`,
    include: [path.join(__dirname, "./pdf.css")],
    renderDelay: 3000,
  });

  await html5ToPDF.start();
  await html5ToPDF.build();
  await html5ToPDF.close();

  return pdfName;
};
