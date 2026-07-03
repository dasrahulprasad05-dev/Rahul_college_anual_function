import { r as renderErrorPage } from './nitro.mjs';
import { c as createStart, a as createMiddleware } from './server-BaZlr8n8.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:async_hooks';
import '@tanstack/router-core';
import '@tanstack/router-core/ssr/client';
import '@tanstack/react-router';
import 'react/jsx-runtime';
import '@tanstack/react-router/ssr/server';
import 'rou3';
import 'srvx';
import 'seroval';
import '@tanstack/history';
import '@tanstack/router-core/ssr/server';

var errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) throw error;
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
