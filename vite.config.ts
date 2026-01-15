import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname
const isVitest = process.env.VITEST === 'true' || process.env.NODE_ENV === 'test'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      useAtYourOwnRisk_mutateSwcOptions(options) {
        if (!isVitest) return;
        options.jsc ??= {} as any;
        (options.jsc as any).transform ??= {};
        (options.jsc as any).transform.react ??= {};
        (options.jsc as any).transform.react.refresh = false;
      },
    }),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  test: {
    environment: 'jsdom',
  },
});
