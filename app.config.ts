import { defineConfig } from "@solidjs/start/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    middleware: "src/middleware.ts",
    vite: {
        plugins: [],
        resolve: {
            alias: {
                "@": resolve(__dirname, "./src"),
            },
        },
    },
    server: {
        esbuild: { options: { target: "esnext" } },
        routeRules: {
            "/api/**": {
                cors: true,
                headers: {
                    "access-control-allow-methods":
                        "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                    "access-control-allow-headers":
                        "Content-Type, Authorization",
                    "access-control-allow-origin": "http://tauri.localhost",
                },
            },
        },
    },
});
