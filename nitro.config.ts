import { defineNitroConfig } from "nitropack";

export default defineNitroConfig({
  preset: "vercel",
  srcDir: ".",
  routeRules: {
    "/**": { ssr: true },
    "/assets/**": { headers: { "cache-control": "s-maxage=31536000" } },
  },
  publicAssets: [
    {
      dir: "./dist/client",
      maxAge: 31536000,
    },
  ],
  handlers: [
    {
      route: "/**",
      handler: "./dist/server/server.js",
    },
  ],
});
