import { r as renderErrorPage } from '../vercel.mjs';
import { c as createMiddleware, a as createStart } from './server-BaZlr8n8.mjs';
import 'node-fetch-native/polyfill';
import 'ufo';
import 'ofetch';
import 'destr';
import 'unenv/runtime/fetch/index';
import 'hookable';
import 'scule';
import 'ohash';
import 'unstorage';
import 'node:async_hooks';
import '@tanstack/router-core';
import '@tanstack/router-core/ssr/client';
import '@tanstack/react-router';
import 'react/jsx-runtime';
import '@tanstack/react-router/ssr/server';
import 'h3-v2';
import 'seroval';
import '@tanstack/history';
import '@tanstack/router-core/ssr/server';

var errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error)
      throw error;
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }
});
var startInstance = createStart(() => ({ requestMiddleware: [errorMiddleware] }));

export { startInstance };
//# sourceMappingURL=start-EOAzYlXa.mjs.map
