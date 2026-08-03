const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { uploadOrderPdfToS3, getPresignedUrl, isS3Configured } = require('./s3Service');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function resolveExistingFilePath(candidates) {
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // ignore broken candidate path and continue
    }
  }
  return null;
}

function safeFilename(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, '_');
}

function formatDateTimeCL(date) {
  try {
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function normalizeOrderNotes(notes) {
  if (!notes) {
    return '';
  }

  const cleanedNotes = String(notes).trim();
  const isAutoCartNote = /^Carrito de compras\s*-\s*\d+\s+tipos?\s+de\s+ex[aá]menes\s+diferentes$/i.test(cleanedNotes);

  return isAutoCartNote ? '' : cleanedNotes;
}

function getPatientFullName(user) {
  const fullName = [user?.name, user?.apellidoPaterno, user?.apellidoMaterno]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ');

  return fullName || 'N/A';
}

function formatRutForDisplay(rut) {
  const normalized = String(rut || '')
    .replace(/[^0-9kK]/g, '')
    .toUpperCase();

  if (!normalized) {
    return '';
  }

  if (normalized.length === 1) {
    return normalized;
  }

  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);
  const bodyWithDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${bodyWithDots}-${dv}`;
}

/**
 * Genera un PDF de Orden Médica y lo guarda en disco y S3.
 *
 * @param {Object} params
 * @param {Object} params.order - Documento Order (mongoose)
 * @param {Object} params.user - Documento User (mongoose)
 * @returns {Promise<{ fileName: string, filePath: string, s3Key?: string, s3Url?: string }>}
 */
async function generateMedicalOrderPdf({ order, user }) {
  const downloadsDir = path.join(__dirname, '..', 'downloads', 'orders');
  ensureDirSync(downloadsDir);

  const pdfVersion = Date.now();
  const fileName = safeFilename(`orden-medica-${order._id}-${pdfVersion}.pdf`);
  const filePath = path.join(downloadsDir, fileName);

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 48, left: 48, right: 48, bottom: 48 },
  });

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Brand header logo (same asset used in the main banner)
  const logoPngPath = resolveExistingFilePath([
    path.join(__dirname, '..', 'public', 'siempresaludp.png'),
    path.join(__dirname, '..', 'assets', 'siempresaludp.png'),
  ]);
  const signaturePngPath = resolveExistingFilePath([
    path.join(__dirname, '..', 'public', 'firmaroberto.png'),
    path.join(__dirname, '..', 'assets', 'firmaroberto.png'),
    path.join(process.cwd(), 'server', 'public', 'firmaroberto.png'),
    path.join(process.cwd(), 'public', 'firmaroberto.png'),
  ]);
  const contentLeft = doc.page.margins.left;
  const contentRight = doc.page.width - doc.page.margins.right;
  const contentWidth = contentRight - contentLeft;
  // IMPORTANT: Header image rendering does NOT always move doc.y. Reserve space manually to avoid overlap.
  const headerTopY = 34;
  const logoY = headerTopY;
  const logoWidth = 260;
  const logoX = (doc.page.width - logoWidth) / 2;
  const headerBottomY = 172; // safe space under the centered logo so the title sits fully below the banner

  if (logoPngPath) {
    doc.image(logoPngPath, logoX, logoY, { width: logoWidth });
  } else {
    doc.fontSize(18).fillColor('#0f172a').text('SiempreSalud', contentLeft, 48, {
      width: contentWidth,
      align: 'center'
    });
  }

  // Move cursor below header
  doc.y = Math.max(doc.y, headerBottomY);

  // Title (always below logo)
  doc
    .fontSize(22)
    .fillColor('#0f172a')
    .text('ORDEN MÉDICA', contentLeft, doc.y, {
      width: contentWidth,
      align: 'center'
    });

  doc.moveDown(0.5);
  doc
    .strokeColor('#e2e8f0')
    .lineWidth(1)
    .moveTo(contentLeft, doc.y)
    .lineTo(contentRight, doc.y)
    .stroke();

  doc.moveDown(1);

  // Reference + date
  doc.fontSize(11).fillColor('#334155');
  doc.text(`Referencia: ${order._id}`);
  doc.text(`Fecha de emisión: ${formatDateTimeCL(new Date())}`);

  doc.moveDown(1);

  // Patient info
  doc.fontSize(12).fillColor('#0f172a').text('Datos del paciente', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#334155');
  doc.text(`Nombre: ${getPatientFullName(user)}`);
  if (user?.rut) {
    doc.text(`RUT: ${formatRutForDisplay(user.rut)}`);
  }
  doc.text(`Email: ${user?.email || 'N/A'}`);

  doc.moveDown(1);

  // Doctor info
  const doctorName =
    order?.doctorName ||
    process.env.DEFAULT_DOCTOR_NAME ||
    'Roberto Merino';
  const signatureLabel = 'Medico: Roberto Merino Zerega';
  const doctorRut = '10.871.677-0';

  doc.fontSize(12).fillColor('#0f172a').text('Médico tratante', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#334155');
  doc.text(`Nombre del médico: ${doctorName}`);
  doc.text(`RUT: ${doctorRut}`);

  doc.moveDown(1);

  // Exams purchased
  const exams = Array.isArray(order.exams) && order.exams.length > 0
    ? order.exams
    : order.examName
      ? [order.examName]
      : [];

  doc.fontSize(12).fillColor('#0f172a').text('Exámenes solicitados', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#334155');

  if (exams.length === 0) {
    doc.text('No se registraron exámenes en esta orden.');
  } else {
    exams.forEach((exam, idx) => {
      doc.text(`${idx + 1}. ${exam}`);
    });
  }

  const printableNotes = normalizeOrderNotes(order.notes);

  if (printableNotes) {
    doc.moveDown(1);
    doc.fontSize(12).fillColor('#0f172a').text('Observaciones', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#334155').text(printableNotes);
  }

  // Signature block. Ensure enough space remains so image/text is not pushed out of page bounds.
  const signatureSectionHeight = 150;
  if (doc.y + signatureSectionHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
    doc.y = doc.page.margins.top;
  }

  doc.moveDown(2.4);
  const signatureTopY = doc.y;
  const signatureBlockWidth = 280;
  const signatureBlockX = (doc.page.width - signatureBlockWidth) / 2;
  const signatureImageWidth = 260;
  const signatureImageHeight = 96;
  const signatureImageX = signatureBlockX + ((signatureBlockWidth - signatureImageWidth) / 2);

  if (signaturePngPath) {
    try {
      doc.image(signaturePngPath, signatureImageX, signatureTopY - 8, {
        fit: [signatureImageWidth, signatureImageHeight],
        align: 'center'
      });
      doc.y = Math.max(doc.y, signatureTopY + 72);
    } catch (signatureError) {
      console.error('⚠️ Error rendering signature image in medical order PDF:', signatureError.message);
    }
  } else {
    console.error('⚠️ Signature PNG not found in expected paths.');
  }

  doc
    .strokeColor('#94a3b8')
    .lineWidth(1)
    .moveTo(signatureBlockX, doc.y)
    .lineTo(signatureBlockX + signatureBlockWidth, doc.y)
    .stroke();
  doc
    .fontSize(10)
    .fillColor('#64748b');

  const signatureTextY = doc.y + 6;
  doc.text(signatureLabel, signatureBlockX, signatureTextY, { width: signatureBlockWidth, align: 'center' });
  doc.text(`RUT: ${doctorRut}`, signatureBlockX, signatureTextY + 14, { width: signatureBlockWidth, align: 'center' });

  // Footer: keep it on the current page to avoid creating an extra trailing page.
  const footerY = doc.page.height - doc.page.margins.bottom - 12;
  doc
    .fontSize(9)
    .fillColor('#94a3b8')
    .text('Conserve esta orden para su ficha clínica.', contentLeft, footerY, {
      width: contentWidth,
      align: 'center'
    });

  doc.end();

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  // Upload to S3 if configured
  let s3Key = null;
  let s3Url = null;
  
  if (isS3Configured()) {
    try {
      const pdfBuffer = fs.readFileSync(filePath);
      const s3Result = await uploadOrderPdfToS3(
        pdfBuffer,
        order._id.toString(),
        user._id.toString()
      );
      s3Key = s3Result.key;
      
      // Generate presigned URL (valid for 1 year for medical orders)
      s3Url = await getPresignedUrl(s3Key, 31536000); // 1 year
      
      console.log('✅ PDF uploaded to S3:', s3Key);
    } catch (s3Error) {
      console.error('⚠️ Error uploading PDF to S3:', s3Error.message);
      // Don't fail the PDF generation if S3 upload fails
    }
  }

  return { fileName, filePath, s3Key, s3Url };
}

module.exports = {
  generateMedicalOrderPdf,
};

