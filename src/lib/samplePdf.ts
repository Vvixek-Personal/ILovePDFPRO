import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generates a realistic 3-page sample PDF on the fly for instant testing
 */
export async function generateSamplePdf(name = 'Sample_Document.pdf', pageCount = 3): Promise<File> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page 1: Cover & Executive Summary
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width: p1W, height: p1H } = page1.getSize();

  // Header banner
  page1.drawRectangle({
    x: 0,
    y: p1H - 120,
    width: p1W,
    height: 120,
    color: rgb(0.9, 0.2, 0.18),
  });

  page1.drawText('iLovePDF Sample Document', {
    x: 40,
    y: p1H - 65,
    size: 26,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText('Generated for testing all PDF tools in real time', {
    x: 40,
    y: p1H - 95,
    size: 13,
    font,
    color: rgb(0.95, 0.95, 0.95),
  });

  // Body content Page 1
  page1.drawText('1. Executive Overview & Specifications', {
    x: 40,
    y: p1H - 160,
    size: 18,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.15),
  });

  const p1Paragraphs = [
    'Welcome to the all-in-one PDF Tools platform inspired by iLovePDF.',
    'This document is generated client-side to let you test Merge, Split, Compress,',
    'Rotate, Organize, Watermark, Add Page Numbers, eSign, Annotate, and more.',
    'All processing happens privately and securely inside your browser.',
  ];

  let currentY = p1H - 200;
  for (const line of p1Paragraphs) {
    page1.drawText(line, {
      x: 40,
      y: currentY,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    currentY -= 22;
  }

  // Feature boxes
  const features = [
    { title: 'Merge & Organize', desc: 'Combine multiple PDFs and visually reorder pages.' },
    { title: 'Compress & Optimize', desc: 'Smart stream optimization with byte reduction.' },
    { title: 'Sign & Protect', desc: 'Electronic signatures and password encryption.' },
  ];

  let boxY = currentY - 30;
  features.forEach((feat) => {
    page1.drawRectangle({
      x: 40,
      y: boxY - 45,
      width: p1W - 80,
      height: 50,
      color: rgb(0.97, 0.97, 0.98),
      borderColor: rgb(0.85, 0.85, 0.88),
      borderWidth: 1,
    });
    page1.drawText(feat.title, {
      x: 55,
      y: boxY - 20,
      size: 13,
      font: fontBold,
      color: rgb(0.9, 0.2, 0.18),
    });
    page1.drawText(feat.desc, {
      x: 55,
      y: boxY - 36,
      size: 10.5,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    boxY -= 65;
  });

  // Footer
  page1.drawText('Page 1 of 3 — iLovePDF Testing Sample', {
    x: 40,
    y: 30,
    size: 9,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });

  // Page 2: Data Tables & Analytics
  if (pageCount >= 2) {
    const page2 = pdfDoc.addPage([595.28, 841.89]);
    const { width: p2W, height: p2H } = page2.getSize();

    page2.drawText('2. Performance & Privacy Metrics', {
      x: 40,
      y: p2H - 60,
      size: 20,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.15),
    });

    page2.drawText('Client-side processing guarantees zero data leakage for confidential files.', {
      x: 40,
      y: p2H - 85,
      size: 11,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Table Header
    page2.drawRectangle({
      x: 40,
      y: p2H - 140,
      width: p2W - 80,
      height: 30,
      color: rgb(0.2, 0.25, 0.35),
    });
    page2.drawText('Tool Category', { x: 55, y: p2H - 128, size: 11, font: fontBold, color: rgb(1, 1, 1) });
    page2.drawText('Processing Speed', { x: 220, y: p2H - 128, size: 11, font: fontBold, color: rgb(1, 1, 1) });
    page2.drawText('Privacy Level', { x: 380, y: p2H - 128, size: 11, font: fontBold, color: rgb(1, 1, 1) });

    const rows = [
      ['PDF Merge & Split', '< 250ms', '100% Client-Side Local'],
      ['Compress Engine', '< 600ms', '100% Client-Side Local'],
      ['Organize & Rotate', '< 150ms', '100% Client-Side Local'],
      ['Watermark & Numbers', '< 300ms', '100% Client-Side Local'],
      ['Electronic Signatures', '< 200ms', '100% Client-Side Local'],
    ];

    let rowY = p2H - 170;
    rows.forEach((row, i) => {
      page2.drawRectangle({
        x: 40,
        y: rowY - 10,
        width: p2W - 80,
        height: 25,
        color: i % 2 === 0 ? rgb(0.96, 0.96, 0.98) : rgb(1, 1, 1),
      });
      page2.drawText(row[0], { x: 55, y: rowY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      page2.drawText(row[1], { x: 220, y: rowY, size: 10, font, color: rgb(0.2, 0.6, 0.3) });
      page2.drawText(row[2], { x: 380, y: rowY, size: 10, font, color: rgb(0.9, 0.2, 0.18) });
      rowY -= 25;
    });

    page2.drawText('Page 2 of 3 — iLovePDF Testing Sample', {
      x: 40,
      y: 30,
      size: 9,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  // Page 3: Signatures & Verification Area
  if (pageCount >= 3) {
    const page3 = pdfDoc.addPage([595.28, 841.89]);
    const { width: p3W, height: p3H } = page3.getSize();

    page3.drawText('3. Signature & Authorization Page', {
      x: 40,
      y: p3H - 60,
      size: 20,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.15),
    });

    page3.drawText('Use the "Sign PDF" or "Edit PDF" tools to place your signature or stamp below.', {
      x: 40,
      y: p3H - 85,
      size: 11,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Signature boxes
    page3.drawRectangle({
      x: 40,
      y: p3H - 300,
      width: (p3W - 100) / 2,
      height: 160,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: rgb(0.8, 0.8, 0.85),
      borderWidth: 1,
    });
    page3.drawText('Primary Signer Box', { x: 55, y: p3H - 165, size: 12, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
    page3.drawLine({
      start: { x: 60, y: p3H - 260 },
      end: { x: (p3W - 100) / 2 + 20, y: p3H - 260 },
      color: rgb(0.7, 0.7, 0.7),
      thickness: 1,
    });
    page3.drawText('Sign Here: ____________________', { x: 60, y: p3H - 280, size: 10, font, color: rgb(0.5, 0.5, 0.5) });

    page3.drawRectangle({
      x: (p3W - 100) / 2 + 60,
      y: p3H - 300,
      width: (p3W - 100) / 2,
      height: 160,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: rgb(0.8, 0.8, 0.85),
      borderWidth: 1,
    });
    page3.drawText('Witness / Stamp Box', { x: (p3W - 100) / 2 + 75, y: p3H - 165, size: 12, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
    page3.drawText('Date: ________________________', { x: (p3W - 100) / 2 + 75, y: p3H - 280, size: 10, font, color: rgb(0.5, 0.5, 0.5) });

    page3.drawText('Page 3 of 3 — iLovePDF Testing Sample', {
      x: 40,
      y: 30,
      size: 9,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new File([pdfBytes as unknown as BlobPart], name, { type: 'application/pdf' });
}
