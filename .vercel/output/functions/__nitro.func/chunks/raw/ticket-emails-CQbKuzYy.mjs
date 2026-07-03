import { b as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from './server-BaZlr8n8.mjs';
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

var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
var sendTicketConfirmation = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("c0d8d04ebe61932401adcceeaa9c81f295042937a3a78c99ab31e9f621e45945"));
var sendScanConfirmation = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("a93969aae98d5e42b2b702cf4effb13c056aaf935b99873d1abd06d2c5aaa239"));

export { sendScanConfirmation, sendTicketConfirmation };
//# sourceMappingURL=ticket-emails-CQbKuzYy.mjs.map
