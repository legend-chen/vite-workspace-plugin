import fs from "fs";
import path from "path";
import {send} from "vite";

function getHtmlFilename(url, server) {
    // if (url.startsWith(FS_PREFIX)) {
    //     return decodeURIComponent(fsPathFromId(url));
    // }
    // else {
    return decodeURIComponent(path.join(server.config.root, url));
    // }
}

export default (options) => ({
    name: 'vite-404-redirect',

    configureServer(server) {
        // redirect to the entry of app
        const entry = server.config.server?.open;

        entry && setTimeout(()=>{
            const middleware = server.middlewares.stack.find( v=> v.handle.name === "vite404Middleware");
            middleware.handle = async function viteRedirect404ToIndex (req, res, next) {
                const filename = getHtmlFilename(entry, server);
                if (fs.existsSync(filename)) {
                    try {
                        let html = fs.readFileSync(filename, 'utf-8');
                        html = await server.transformIndexHtml(entry, html, req.originalUrl);
                        return send(req, res, html, 'html', {
                            headers: server.config.server.headers
                        });
                    }
                    catch (e) {
                        return next(e);
                    }
                } else {
                    res.statusCode = 404;
                    res.end();
                }
            }
        }, 0)
    }
})