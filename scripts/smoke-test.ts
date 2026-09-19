/**
 * Functional smoke test for the client-side PDF engine.
 *
 * Runs the real module graph (src/lib/pdfEngine.ts, src/lib/samplePdf.ts,
 * src/lib/pdfRenderer.ts) under Node and exercises every PDF operation that
 * does not require a browser canvas. Verifies outputs are valid, loadable
 * PDFs with the expected page counts and properties.
 *
 * Usage: npm test
 */
import { rejects as assertRejects } from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
// The legacy build runs without a DOM/worker; used here only to verify that
// drawn text actually made it into generated documents.
import * as pdfjsLegacy from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  mergePdfFiles,
  splitPdf,
  compressPdf,
  organizePdf,
  rotatePdf,
  watermarkPdf,
  addPageNumbersToPdf,
  convertImagesToPdf,
  signPdf,
  addTextToPdf,
  protectPdf,
  unlockPdf,
  editPdfMetadata,
  repairPdf,
  convertTextToPdf,
  redactPdf,
  cropPdf,
  editPdf,
} from '../src/lib/pdfEngine';
import { generateSamplePdf } from '../src/lib/samplePdf';
import { verifyPdfDocument } from '../src/lib/pdfRenderer';

let passed = 0;
let failed = 0;

function assert(cond: boolean, label: string, detail = '') {
  if (cond) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    console.error(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function blobToFile(blob: Blob, name: string, type = 'application/pdf'): Promise<File> {
  return new File([blob], name, { type });
}

async function asPdfDoc(blob: Blob) {
  const buf = await blob.arrayBuffer();
  return PDFDocument.load(buf, { ignoreEncryption: true });
}

async function isPdfBytes(blob: Blob): Promise<boolean> {
  const buf = await blob.arrayBuffer();
  const head = new Uint8Array(buf.slice(0, 5));
  return String.fromCharCode(...head) === '%PDF-';
}

/** Extracts the concatenated text of every page (pdf.js runs main-thread here). */
async function extractPdfText(blob: Blob): Promise<string> {
  const data = new Uint8Array(await blob.arrayBuffer());
  const pdf = await pdfjsLegacy.getDocument({ data }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text;
}

// 1x1 red PNG used for image embedding tests.
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const tinyPngBytes = Uint8Array.from(atob(TINY_PNG_BASE64), (c) => c.charCodeAt(0));

async function main() {
  console.log('\n=== PDF Tools — engine smoke test ===\n');

  // ---------- Sample document generation ----------
  console.log('[samplePdf] generateSamplePdf');
  const sample = await generateSamplePdf('Sample.pdf', 3);
  assert(sample instanceof File && sample.size > 1000, 'sample PDF generated', `${sample.size} bytes`);
  assert(await isPdfBytes(sample), 'sample has %PDF- magic header');
  const sampleDoc = await asPdfDoc(sample);
  assert(sampleDoc.getPageCount() === 3, 'sample has 3 pages');

  // ---------- pdfRenderer: verifyPdfDocument ----------
  console.log('\n[pdfRenderer] verifyPdfDocument');
  const verification = await verifyPdfDocument(await sample.arrayBuffer(), 'Sample.pdf');
  assert(verification.isValid === true, 'verification reports valid PDF');
  assert(verification.pageCount === 3, 'verification counts 3 pages');
  assert(verification.isEncrypted === false, 'verification reports not encrypted');
  assert(verification.pages.length === 3, 'verification returns per-page geometry');
  assert(verification.pages[0].format === 'A4', 'page 1 detected as A4');

  // ---------- 1. MERGE ----------
  console.log('\n[pdfEngine] mergePdfFiles');
  const merged = await mergePdfFiles([sample, sample]);
  assert(merged.pageCount === 6, 'merge of two 3-page docs yields 6 pages', `got ${merged.pageCount}`);
  assert(merged.size > 0 && (await isPdfBytes(merged.blob)), 'merged output is a valid PDF');
  await assertRejects(
    () => mergePdfFiles([sample]),
    /at least 2/,
    'merge rejects a single file with a helpful error'
  );

  // ---------- 2. SPLIT ----------
  console.log('\n[pdfEngine] splitPdf');
  const splitRanges = await splitPdf(sample, { mode: 'ranges', ranges: '1-2' });
  assert(splitRanges.isZip === false, 'ranges mode returns a single PDF');
  assert((await asPdfDoc(splitRanges.blob)).getPageCount() === 2, 'range "1-2" extracts 2 pages');
  const splitPicked = await splitPdf(sample, { mode: 'extract-selected', selectedPages: [3, 1] });
  assert(
    (await asPdfDoc(splitPicked.blob)).getPageCount() === 2,
    'extract-selected honors selected pages'
  );
  const splitAll = await splitPdf(sample, { mode: 'all-pages' });
  assert(splitAll.isZip === true, 'all-pages mode returns a ZIP');
  const zip = await JSZip.loadAsync(await splitAll.blob.arrayBuffer());
  const innerNames = Object.keys(zip.files).filter((n) => n.endsWith('.pdf'));
  assert(innerNames.length === 3, 'ZIP contains one PDF per page', `got ${innerNames.length}`);
  const firstInner = await zip.files[innerNames[0]].async('arraybuffer');
  assert((await PDFDocument.load(firstInner)).getPageCount() === 1, 'each inner PDF has 1 page');

  // ---------- 3. COMPRESS ----------
  console.log('\n[pdfEngine] compressPdf');
  const compressed = await compressPdf(sample, 'recommended');
  assert(await isPdfBytes(compressed.blob), 'compressed output is a valid PDF');
  assert((await asPdfDoc(compressed.blob)).getPageCount() === 3, 'compression preserves page count');
  assert(
    compressed.originalSize === sample.size && compressed.savingsPercent >= 0,
    'compression reports sizes/savings',
    `original=${compressed.originalSize} savings=${compressed.savingsPercent}%`
  );

  // ---------- 4. ORGANIZE ----------
  console.log('\n[pdfEngine] organizePdf');
  const organized = await organizePdf(sample, [
    { originalIndex: 2, rotation: 0 },
    { originalIndex: 0, rotation: 90 },
    { originalIndex: 1, rotation: 0 },
  ]);
  assert(organized.pageCount === 3, 'organize preserves page count');
  const organizedDoc = await asPdfDoc(organized.blob);
  assert(organizedDoc.getPage(1).getRotation().angle === 90, 'organize applies per-page rotation');
  const withBlank = await organizePdf(sample, [
    { originalIndex: 0, rotation: 0 },
    { originalIndex: -1, rotation: 0, isBlank: true },
  ]);
  assert(withBlank.pageCount === 2, 'organize can insert a blank page');

  // ---------- 5. ROTATE ----------
  console.log('\n[pdfEngine] rotatePdf');
  const rotated = await rotatePdf(sample, 90);
  const rotatedDoc = await asPdfDoc(rotated.blob);
  assert(
    rotatedDoc.getPages().every((p) => p.getRotation().angle === 90),
    'rotatePdf(90) rotates every page'
  );
  const rotatedPer = await rotatePdf(sample, [0, 180, 270]);
  const rotatedPerDoc = await asPdfDoc(rotatedPer.blob);
  assert(rotatedPerDoc.getPage(1).getRotation().angle === 180, 'per-page rotation angles honored');

  // ---------- 6. WATERMARK ----------
  console.log('\n[pdfEngine] watermarkPdf');
  const watermarked = await watermarkPdf(sample, {
    type: 'text',
    text: 'CONFIDENTIAL',
    fontSize: 48,
    fontColor: '#e11d48',
    opacity: 0.3,
    rotation: 45,
    position: 'center',
    layer: 'above',
    pages: 'all',
  });
  assert(watermarked.pageCount === 3, 'watermark preserves page count');
  assert(await isPdfBytes(watermarked.blob), 'watermarked output is a valid PDF');
  const watermarkText = await extractPdfText(watermarked.blob);
  assert(watermarkText.includes('CONFIDENTIAL'), 'watermark text present in output');

  // ---------- 7. PAGE NUMBERS ----------
  console.log('\n[pdfEngine] addPageNumbersToPdf');
  const numbered = await addPageNumbersToPdf(sample, {
    position: 'bottom-center',
    format: 'page_n_of_m',
    startNumber: 1,
    fontSize: 10,
    color: '#333333',
    margin: 30,
    pages: 'all',
  });
  assert(numbered.pageCount === 3, 'page numbers preserve page count');
  const numberedText = await extractPdfText(numbered.blob);
  assert(numberedText.includes('Page 1 of 3'), 'page number label rendered');

  // ---------- 8. JPG/PNG -> PDF ----------
  console.log('\n[pdfEngine] convertImagesToPdf');
  const imgFile = new File([tinyPngBytes as unknown as BlobPart], 'tiny.png', { type: 'image/png' });
  const imgPdf = await convertImagesToPdf([imgFile, imgFile], {
    orientation: 'portrait',
    margin: 'small',
    pageSize: 'a4',
  });
  assert(imgPdf.pageCount === 2, 'two images yield two pages');
  assert(await isPdfBytes(imgPdf.blob), 'image PDF is a valid PDF');

  // ---------- 9. SIGN ----------
  console.log('\n[pdfEngine] signPdf');
  const signed = await signPdf(sample, [
    {
      id: 'sig-1',
      type: 'draw',
      dataUrl: `data:image/png;base64,${TINY_PNG_BASE64}`,
      pageNumber: 1,
      x: 10,
      y: 10,
      width: 20,
      height: 8,
    },
  ]);
  assert(signed.pageCount === 3, 'signing preserves page count');
  assert(await isPdfBytes(signed.blob), 'signed output is a valid PDF');

  // ---------- 10. ADD TEXT ----------
  console.log('\n[pdfEngine] addTextToPdf');
  const annotated = await addTextToPdf(sample, [
    { text: 'APPROVED', x: 40, y: 50, pageNumber: 2, fontSize: 16, color: '#00aa00' },
  ]);
  assert(annotated.pageCount === 3, 'add-text preserves page count');
  const annotatedText = await extractPdfText(annotated.blob);
  assert(annotatedText.includes('APPROVED'), 'added text present in output');

  // ---------- 11. PROTECT ----------
  console.log('\n[pdfEngine] protectPdf');
  const protected_ = await protectPdf(sample, {
    userPassword: 'open123',
    ownerPassword: 'owner456',
    algorithm: 'AES-256',
  });
  assert(await isPdfBytes(protected_.blob), 'encrypted output is a valid PDF');
  const encCheck = await PDFDocument.load(await protected_.blob.arrayBuffer(), {
    ignoreEncryption: true,
  });
  assert(encCheck.isEncrypted === true, 'output flagged as encrypted');
  assert(encCheck.getPageCount() === 3, 'encrypted PDF preserves page count');
  await assertRejects(
    async () => PDFDocument.load(await protected_.blob.arrayBuffer()),
    /encrypt/i,
    'encrypted PDF cannot be loaded without a password'
  );
  await assertRejects(
    () => protectPdf(sample, {}),
    /specify a password/i,
    'protectPdf requires a password'
  );

  // ---------- 12. UNLOCK (non-encrypted pass-through path) ----------
  console.log('\n[pdfEngine] unlockPdf');
  const unlockedPlain = await unlockPdf(sample);
  assert(unlockedPlain.pageCount === 3, 'unlock of unencrypted doc returns clean PDF');
  const protectedFile = await blobToFile(protected_.blob, 'protected.pdf');
  await assertRejects(
    () => unlockPdf(protectedFile, 'wrong-password'),
    /password/i,
    'unlock with wrong password raises a friendly error'
  );

  // ---------- 13. METADATA ----------
  console.log('\n[pdfEngine] editPdfMetadata');
  const meta = await editPdfMetadata(sample, {
    title: 'Smoke Test Title',
    author: 'QA Bot',
    subject: 'Verification',
    keywords: 'pdf, test, smoke',
    creator: 'smoke-test',
    producer: 'smoke-test',
  });
  const metaDoc = await asPdfDoc(meta.blob);
  assert(metaDoc.getTitle() === 'Smoke Test Title', 'title round-trips');
  assert(metaDoc.getAuthor() === 'QA Bot', 'author round-trips');
  assert(
    (metaDoc.getKeywords() as unknown as string).split(/\s+/).filter(Boolean).join(' ') === 'pdf test smoke',
    'keywords parsed and stored'
  );

  // ---------- 14. REPAIR ----------
  console.log('\n[pdfEngine] repairPdf');
  const repairedOk = await repairPdf(sample);
  assert(repairedOk.pageCount === 3, 'repair of valid doc keeps 3 pages');
  assert(/XREF|re-aligned/i.test(repairedOk.statusMessage), 'repair reports XREF realignment');
  const garbage = new File([new TextEncoder().encode('this is not a pdf at all')] as BlobPart[], 'broken.pdf', {
    type: 'application/pdf',
  });
  const repairedBad = await repairPdf(garbage);
  assert(repairedBad.pageCount === 1, 'repair of corrupt doc recovers 1 page');
  assert(await isPdfBytes(repairedBad.blob), 'recovered output is a valid PDF');

  // ---------- 15. TEXT -> PDF ----------
  console.log('\n[pdfEngine] convertTextToPdf');
  const fromText = await convertTextToPdf(
    'Line one of the generated document.\nLine two follows here.'.repeat(40),
    { title: 'Text to PDF Test', fontSize: 12 }
  );
  assert(fromText.pageCount >= 1, 'text-to-pdf produces at least one page');
  assert(await isPdfBytes(fromText.blob), 'text-to-pdf output is a valid PDF');

  // ---------- 16. REDACT ----------
  console.log('\n[pdfEngine] redactPdf');
  const redacted = await redactPdf(sample, [
    { pageNumber: 1, x: 0, y: 0, width: 100, height: 10 },
  ]);
  assert(redacted.pageCount === 3, 'redaction preserves page count');
  assert(await isPdfBytes(redacted.blob), 'redacted output is a valid PDF');

  // ---------- 17. CROP ----------
  console.log('\n[pdfEngine] cropPdf');
  const cropped = await cropPdf(sample, { xPercent: 10, yPercent: 10, widthPercent: 80, heightPercent: 80 });
  const croppedDoc = await asPdfDoc(cropped.blob);
  const cropBox = croppedDoc.getPage(0).getCropBox();
  const { width: pw, height: ph } = croppedDoc.getPage(0).getSize();
  assert(
    Math.abs(cropBox.width - pw * 0.8) < 1 && Math.abs(cropBox.height - ph * 0.8) < 1,
    'crop box set to 80% of page',
    `crop=${cropBox.width}x${cropBox.height} page=${pw}x${ph}`
  );

  // ---------- 18. EDIT ----------
  console.log('\n[pdfEngine] editPdf');
  const edited = await editPdf(sample, [
    { id: 'a1', type: 'text', text: 'EDITED', x: 30, y: 30, width: 30, height: 5, pageNumber: 1, fontSize: 14, color: '#e5322d' },
    { id: 'a2', type: 'rectangle', x: 10, y: 60, width: 40, height: 20, pageNumber: 2, color: '#0066ff', strokeWidth: 2 },
  ]);
  assert(edited.pageCount === 3, 'edit preserves page count');
  const editedText = await extractPdfText(edited.blob);
  assert(editedText.includes('EDITED'), 'edit text annotation present');

  // ---------- Summary ----------
  console.log('\n=== Results ===');
  console.log(`  passed: ${passed}`);
  console.log(`  failed: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  }
  console.log('\nAll PDF engine operations verified successfully. ✨');
}

main().catch((err) => {
  console.error('\n💥 Smoke test crashed:', err);
  process.exit(1);
});
