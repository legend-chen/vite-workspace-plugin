import {defineConfig} from 'vite'
import {resolve} from "path";
import ViteRedirect404Plugin from "./vite.redirect";

export default defineConfig({
    server: {
        open: './src/index.html',
        host: "0.0.0.0",
        port: "8080"
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src")
        },
    },
    plugins: [ViteRedirect404Plugin()]
});
