import {defineConfig} from 'vite'
import {resolve} from "path";
import ViteWorkspacePlugin from "./ViteWorkspace";

export default defineConfig({
    base: "./",
    server: {
        open: './src/index.html',
        host: true,
        port: "8080"
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src")
        },
    },
    plugins: [ViteWorkspacePlugin()]
});
