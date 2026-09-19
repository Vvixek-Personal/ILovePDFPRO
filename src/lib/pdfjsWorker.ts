import * as pdfjsLib from 'pdfjs-dist';
// Bundle the worker locally so its version always matches the pdfjs-dist
// library and rendering works offline / behind strict CSPs (no CDN dependency).
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

export const pdfjsWorkerSrc = workerUrl;
