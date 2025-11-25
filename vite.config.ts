import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx, ManifestV3Export } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

// We are going back to manifest-defined content scripts
const manifestWithContentScript: ManifestV3Export = {
  ...(manifest as ManifestV3Export),
  content_scripts: [
    {
      matches: ["https://gemini.google.com/*"],
      js: ["src/content.ts"],
    },
  ],
  permissions: [
    "storage",
    // Note: chrome.tabs.create() does not require "tabs" permission
    // Only accessing tab properties like url/title requires the permission
  ],
};

export default defineConfig({
  plugins: [react(), crx({ manifest: manifestWithContentScript })],
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      host: "localhost",
      port: 5174,
    },
  },
});
