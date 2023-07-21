import fs from "fs";
import url from "url";
import path from "path";
import {send} from "vite";
// import {lookup} from "mrmime";

var contentType = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "application/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml",
    "woff2": "application/octet-stream",
    "gz": "application/octet-stream",
    "wasm": "application/wasm",
    "mp4": "video/mp4"
};


function lookup(extn) {
    let tmp = ('' + extn).trim().toLowerCase();
    let idx = tmp.lastIndexOf('.');
    return contentType[!~idx ? tmp : tmp.substring(++idx)];
}

function getHtmlFilename(url, server) {
    // if (url.startsWith(FS_PREFIX)) {
    //     return decodeURIComponent(fsPathFromId(url));
    // }
    // else {
    return decodeURIComponent(path.join(server.config.root, url));
    // }
}

export default (options) => ({
    name: 'vite-workspace',
    configureServer(server) {
        // hook original spa and 404 Middleware
        const spa = new SpaMiddleware(server);
        const serve = new ServeMiddleware(server.config.root);
        setTimeout(() => {
            const middleware0 = server.middlewares.stack.find(v => (v.handle.name === "viteSpaFallbackMiddleware" || v.handle.name === "viteHtmlFallbackMiddleware"));
            middleware0.handle = serve;
            const middleware = server.middlewares.stack.find(v => v.handle.name === "vite404Middleware");
            middleware.handle = spa;
        }, 0)
    }
})

function isFileReadable(filename, ref) {
    try {
        const stat = fs.statSync(filename, {throwIfNoEntry: false});
        if (ref)
            ref.stat = stat;
        return !!stat;
    } catch {
        return false;
    }
}

function ServeMiddleware(dir, headers) {
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return function serveMiddleware(request, response, next) {
        var requestPathname = decodeURI(url.parse(request.url).pathname),
            // skip import request and internal requests `/@fs/ /@vite-client` etc...
            realPathname;
        // console.log("[Server] " + pathname);
        var pathname = path.join("/", requestPathname);
        realPathname = path.join(dir, pathname);
        console.log("[Server] location", requestPathname, "to", realPathname);
        const result = {};
        if (isFileReadable(realPathname, result)) {
            if (result.stat.isDirectory()) {
                const paths = fs.readdirSync(realPathname);
                if (paths) {
                    var items = paths.map(function (name) {
                        var subPathname = path.join(pathname, name);
                        return `<a href="${subPathname}"><p>${subPathname}</p>`;
                    });
                    var html = "<h1>Directory:</h1>";
                    if (pathname !== path.sep) {
                        html += `<a href=${".." + path.sep}><p>${".." + path.sep}</p>`;
                    }
                    response.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                    response.write(html + items.join("\n"));
                    response.end();
                    return false;
                }
            } else {
                const file = fs.readFileSync(realPathname);
                var ext = path.extname(realPathname);
                ext = ext ? ext.slice(1) : 'unknown';
                response.writeHead(200, {
                    'Content-Type': lookup(ext) || "text/plain",
                    'Content-Length': file.byteLength || file.length,
                    'Access-Control-Allow-Origin': '*'
                });
                response.write(file, "binary");
                response.end();
                return false;
            }
        } else {
            next();
        }
    };
}

function SpaMiddleware(server) {

    const entry = server.config.server?.open;
    // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
    return async function spaMiddleware(req, res, next) {
        const filename = getHtmlFilename(entry, server);
        if (fs.existsSync(filename)) {
            try {
                let html = fs.readFileSync(filename, 'utf-8');
                html = await server.transformIndexHtml(entry, html, req.originalUrl);
                return send(req, res, html, 'html', {
                    headers: server.config.server.headers
                });
            } catch (e) {
                return next(e);
            }
        } else {
            res.statusCode = 404;
            res.end();
        }
    };
}
