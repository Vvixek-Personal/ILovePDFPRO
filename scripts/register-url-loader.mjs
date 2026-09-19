import * as nodeModule from 'node:module';
import { resolve } from './url-import-loader.mjs';

// tsx registers its hooks via the synchronous `registerHooks` API when
// available, which runs before asynchronous `register()` chains. Register the
// same way so this hook gets first crack at `?url` specifiers.
if (typeof nodeModule.registerHooks === 'function') {
  nodeModule.registerHooks({ resolve });
} else {
  nodeModule.register(
    {
      resolve(specifier, context, nextResolve) {
        return resolve(specifier, context, nextResolve);
      },
    },
    import.meta.url
  );
}
