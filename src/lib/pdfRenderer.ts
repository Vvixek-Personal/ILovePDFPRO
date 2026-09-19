import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import type { PageThumbnail, PdfVerificationResult, PdfPageMeta } from '../types';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

/**
 * Client-Side PDF Verification & Security Inspector
 * Inspects PDF magic bytes, encryption, metadata, page dimensions, and integrity.
 */
export async function verifyPdfDocument(
  pdfBytes: ArrayBuffer,
  fileName = 'document.pdf'
): Promise<PdfVerificationResult> {
  const integrityIssues: string[] = [];

  // Check magic bytes
  let isValid = false;
  let pdfVersion = '1.4';
  try {
    const uint8 = new Uint8Array(pdfBytes.slice(0, 16));
    const headerStr = String.fromCharCode(...uint8);
    isValid = headerStr.startsWith('%PDF-');
    const versionMatch = headerStr.match(/%PDF-(\d+\.\d+)/);
    if (versionMatch) {
      pdfVersion = versionMatch[1];
    } else if (!isValid) {
      integrityIssues.push('Missing standard %PDF- header magic signature.');
    }
  } catch {
    integrityIssues.push('Failed to read document header bytes.');
  }

  let isEncrypted = false;
  let pageCount = 0;
  const pages: PdfPageMeta[] = [];
  let metadata: PdfVerificationResult['metadata'] = undefined;

  try {
    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    isEncrypted = doc.isEncrypted;
    pageCount = doc.getPageCount();

    if (isEncrypted) {
      integrityIssues.push('Document is encrypted/password protected.');
    }

    if (pageCount === 0) {
      integrityIssues.push('Document contains 0 pages.');
    }

    for (let i = 0; i < pageCount; i++) {
      try {
        const page = doc.getPage(i);
        const { width, height } = page.getSize();
        const widthPt = Math.round(width);
        const heightPt = Math.round(height);
        const widthMm = Math.round(width * 0.352778);
        const heightMm = Math.round(height * 0.352778);
        const orientation: 'portrait' | 'landscape' | 'square' =
          widthPt > heightPt ? 'landscape' : widthPt < heightPt ? 'portrait' : 'square';

        let format = 'Custom';
        const w = widthPt;
        const h = heightPt;
        if (
          (Math.abs(w - 595) <= 6 && Math.abs(h - 842) <= 6) ||
          (Math.abs(h - 595) <= 6 && Math.abs(w - 842) <= 6)
        ) {
          format = 'A4';
        } else if (
          (Math.abs(w - 612) <= 6 && Math.abs(h - 792) <= 6) ||
          (Math.abs(h - 612) <= 6 && Math.abs(w - 792) <= 6)
        ) {
          format = 'US Letter';
        } else if (
          (Math.abs(w - 612) <= 6 && Math.abs(h - 1008) <= 6) ||
          (Math.abs(h - 612) <= 6 && Math.abs(w - 1008) <= 6)
        ) {
          format = 'US Legal';
        } else if (
          (Math.abs(w - 842) <= 8 && Math.abs(h - 1191) <= 8) ||
          (Math.abs(h - 842) <= 8 && Math.abs(w - 1191) <= 8)
        ) {
          format = 'A3';
        } else if (
          (Math.abs(w - 420) <= 6 && Math.abs(h - 595) <= 6) ||
          (Math.abs(h - 420) <= 6 && Math.abs(w - 595) <= 6)
        ) {
          format = 'A5';
        }

        pages.push({
          pageNumber: i + 1,
          widthPt,
          heightPt,
          widthMm,
          heightMm,
          format,
          orientation,
        });
      } catch {
        integrityIssues.push(`Could not read geometry for page ${i + 1}.`);
      }
    }

    try {
      const cDate = doc.getCreationDate();
      const mDate = doc.getModificationDate();
      metadata = {
        title: doc.getTitle() || undefined,
        author: doc.getAuthor() || undefined,
        subject: doc.getSubject() || undefined,
        creator: doc.getCreator() || undefined,
        producer: doc.getProducer() || undefined,
        creationDate: cDate ? cDate.toLocaleString() : undefined,
        modificationDate: mDate ? mDate.toLocaleString() : undefined,
      };
    } catch {
      // metadata optional
    }

    isValid = true;
  } catch (err: any) {
    console.warn('PDF verification note:', err);
    if (err?.message?.includes('password') || err?.message?.includes('encrypted')) {
      isEncrypted = true;
      integrityIssues.push('Document requires a password to read.');
    } else {
      integrityIssues.push(`PDF parse warning: ${err?.message || 'Unexpected structure'}`);
    }
  }

  return {
    isValid,
    isEncrypted,
    pageCount,
    fileSizeBytes: pdfBytes.byteLength,
    fileName,
    pdfVersion,
    metadata,
    pages,
    integrityIssues,
  };
}

/**
 * Renders a single high-resolution page as a data URL for sharp preview inspection
 */
export async function renderHighResPage(
  pdfBytes: ArrayBuffer,
  pageNumber: number,
  scale = 1.25
): Promise<{ dataUrl: string; width: number; height: number }> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Cannot get 2D context');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await (page.render as any)({
      canvasContext: context,
      viewport,
      canvas,
    }).promise;

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      width: viewport.width,
      height: viewport.height,
    };
  } catch (err) {
    console.warn(`High-res render fallback for page ${pageNumber}:`, err);
    const fallback = createFallbackThumbnail(pageNumber);
    return {
      dataUrl: fallback.dataUrl || '',
      width: 480,
      height: 680,
    };
  }
}

/**
 * Renders all pages of a PDF document as data URLs for fast thumbnail generation
 */
export async function renderPdfThumbnails(
  pdfBytes: ArrayBuffer,
  maxPages = 50,
  scale = 0.4
): Promise<PageThumbnail[]> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdfDoc = await loadingTask.promise;
    const numPages = Math.min(pdfDoc.numPages, maxPages);
    const thumbnails: PageThumbnail[] = [];

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await (page.render as any)({
            canvasContext: context,
            viewport,
            canvas,
          }).promise;

          thumbnails.push({
            pageNumber: i,
            originalPageNumber: i,
            dataUrl: canvas.toDataURL('image/jpeg', 0.8),
            rotation: 0,
            width: viewport.width,
            height: viewport.height,
          });
        }
      } catch (pageErr) {
        console.warn(`Error rendering page ${i}:`, pageErr);
        thumbnails.push(createFallbackThumbnail(i));
      }
    }

    return thumbnails;
  } catch (err) {
    console.warn('PDF.js rendering fallback triggered:', err);
    return [createFallbackThumbnail(1), createFallbackThumbnail(2), createFallbackThumbnail(3)];
  }
}

/**
 * Renders a single specific page of a PDF onto an HTML5 canvas
 */
export async function renderPageToCanvas(
  pdfBytes: ArrayBuffer,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale = 1.0
): Promise<{ width: number; height: number }> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');

    if (context) {
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await (page.render as any)({
        canvasContext: context,
        viewport,
        canvas,
      }).promise;
    }

    return { width: viewport.width, height: viewport.height };
  } catch (err) {
    console.error(`Error rendering page ${pageNumber} to canvas:`, err);
    throw err;
  }
}

/**
 * Extracts plain text from all pages of a PDF using PDF.js
 */
export async function extractTextFromPdf(pdfBytes: ArrayBuffer): Promise<{ text: string; pageCount: number }> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdfDoc = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');

      fullText += `--- Page ${i} ---\n\n` + pageStrings + '\n\n';
    }

    return { text: fullText.trim(), pageCount: pdfDoc.numPages };
  } catch (err) {
    console.error('Text extraction failed:', err);
    throw new Error('Could not extract text from this PDF.');
  }
}

/**
 * Creates a clean geometric fallback thumbnail if worker is loading
 */
function createFallbackThumbnail(pageNum: number): PageThumbnail {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 226;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 160, 226);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 160, 226);

    // Mock header
    ctx.fillStyle = '#e5322d';
    ctx.fillRect(15, 15, 130, 20);

    // Mock lines
    ctx.fillStyle = '#cbd5e1';
    for (let y = 50; y < 190; y += 14) {
      ctx.fillRect(15, y, y % 28 === 0 ? 90 : 130, 6);
    }

    // Page badge
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`Page ${pageNum}`, 55, 210);
  }

  return {
    pageNumber: pageNum,
    originalPageNumber: pageNum,
    dataUrl: canvas.toDataURL(),
    rotation: 0,
    width: 160,
    height: 226,
  };
}
