/**
 * Node module-resolution hook for running the app's real module graph outside
 * the browser (used by `npm test`).
 *
 * 1. Vite-style `?url` imports (e.g. the bundled pdf.js worker) are resolved
 *    to an empty module — the browser transform does not exist under Node.
 * 2. `jspdf` is resolved to its ESM build. The package's Node build exports the
 *    constructor only as a named export (`exports.jsPDF`), which breaks
 *    `import jsPDF from 'jspdf'` under Node ESM. The ESM build works fine in
 *    Node and keeps the default import intact.
 */

const EMPTY_URL_MODULE = `data:text/javascript,${encodeURIComponent('export default "";')}`;

const jspdfEsmUrl = new URL('../node_modules/jspdf/dist/jspdf.es.min.js', import.meta.url).href;

export function resolve(specifier, context, nextResolve) {
  if (typeof specifier === 'string' && specifier.endsWith('?url')) {
    return { url: EMPTY_URL_MODULE, shortCircuit: true };
  }
  if (specifier === 'jspdf') {
    return { url: jspdfEsmUrl, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
