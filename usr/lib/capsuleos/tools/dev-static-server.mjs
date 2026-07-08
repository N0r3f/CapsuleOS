#!/usr/bin/env node
/**
 * Serveur HTTP statique dev — OS/index statiques + sidecar PHP (comptes, API, admin).
 * Usage interne : serve-capsuleos.mjs dev
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import net from 'net';
import { resolvePortalSqlitePath } from './portal-sqlite-path.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.php': 'text/html; charset=utf-8',
};

const NO_STORE = new Set([
    '/usr/lib/capsuleos/site/portal-site-home.js',
    '/index.html',
    '/account.html',
    '/sw.js',
]);

const isPhpBackendRoute = (pathname) => {
    if (pathname === '/admin' || pathname === '/admin/' || pathname.startsWith('/admin/')) {
        return true;
    }
    if (pathname === '/index.php') {
        return true;
    }
    if (pathname === '/portal' || pathname.startsWith('/portal/')) {
        return true;
    }
    return false;
};

const devRedirectTarget = (pathname, url, sidecarActive) => {
    if (sidecarActive && (pathname === '/account.html' || pathname === '/account.html/')) {
        return `/portal/account.php${url.search || ''}${url.hash || ''}`;
    }
    if (pathname === '/index.php') {
        return `/index.html${url.search || ''}${url.hash || ''}`;
    }
    if (!sidecarActive && (pathname === '/portal' || pathname.startsWith('/portal/'))) {
        return `/index.html${url.search || ''}${url.hash || ''}`;
    }
    return null;
};

const resolveFile = (pathname) => {
    const rel = pathname === '/' ? '/index.html' : pathname;
    const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, '');
    const abs = path.join(ROOT, safe);
    if (!abs.startsWith(ROOT)) {
        return null;
    }
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
        const index = path.join(abs, 'index.html');
        return fs.existsSync(index) ? index : null;
    }
    return fs.existsSync(abs) && fs.statSync(abs).isFile() ? abs : null;
};

const findFreePort = () => new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        server.close(() => resolve(port));
    });
    server.on('error', reject);
});

const startPhpSidecar = async () => {
    const sqlitePath = resolvePortalSqlitePath(ROOT);
    const port = await findFreePort();
    const host = '127.0.0.1';
    const child = spawn('php', ['-S', `${host}:${port}`, '-t', '.', 'router.php'], {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
            ...process.env,
            CAPSULE_PORTAL_MODE: 'dev',
            CAPSULE_PORTAL_SQLITE: sqlitePath,
        },
    });
    child.stderr?.on('data', () => {});
    await new Promise((resolve) => setTimeout(resolve, 250));
    return { host, port, child, sqlitePath };
};

const proxyToPhp = (req, res, sidecar) => {
    const options = {
        hostname: sidecar.host,
        port: sidecar.port,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: `${sidecar.host}:${sidecar.port}` },
    };
    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
        proxyRes.pipe(res);
    });
    proxyReq.on('error', () => {
        if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Sidecar PHP indisponible — vérifier php 8.2+.\n');
        }
    });
    req.pipe(proxyReq);
};

/**
 * @param {{ host?: string, port?: number }} opts
 */
export const startDevServer = async (opts = {}) => {
    const host = opts.host || '127.0.0.1';
    const port = opts.port || 2929;
    let sidecar = null;
    try {
        sidecar = await startPhpSidecar();
        process.stderr.write('    backend → PHP sidecar (/portal/api, /portal/*.php, /admin*)\n');
        process.stderr.write(`    sqlite  → ${sidecar.sqlitePath}\n`);
    } catch (err) {
        process.stderr.write(`    backend → indisponible (${err.message})\n`);
    }

    const server = http.createServer((req, res) => {
        const url = new URL(req.url || '/', `http://${host}:${port}`);
        const pathname = decodeURIComponent(url.pathname);

        if (sidecar && isPhpBackendRoute(pathname)) {
            proxyToPhp(req, res, sidecar);
            return;
        }

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Method not allowed');
            return;
        }

        const redirectTarget = devRedirectTarget(pathname, url, Boolean(sidecar));
        if (redirectTarget !== null) {
            res.writeHead(302, {
                Location: redirectTarget,
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            });
            res.end();
            return;
        }

        const filePath = resolveFile(pathname);
        if (!filePath) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`404 — ${pathname}\n`);
            return;
        }

        const rel = `/${path.relative(ROOT, filePath).split(path.sep).join('/')}`;
        const ext = path.extname(filePath).toLowerCase();
        const headers = {
            'Content-Type': MIME[ext] || 'application/octet-stream',
        };
        if (NO_STORE.has(rel) || rel.endsWith('portal-site-home.js')) {
            headers['Cache-Control'] = 'no-store, no-cache, must-revalidate';
        }

        if (req.method === 'HEAD') {
            res.writeHead(200, headers);
            res.end();
            return;
        }

        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);
    });

    return new Promise((resolve, reject) => {
        server.on('error', reject);
        server.listen(port, host, () => resolve({ server, sidecar }));
    });
};

if (import.meta.url === `file://${process.argv[1]}`) {
    const listenPort = Number(process.env.PORT || 2929);
    const listenHost = process.env.HOST || '127.0.0.1';
    startDevServer({ host: listenHost, port: listenPort }).then(() => {
        process.stderr.write(`dev-static-server http://${listenHost}:${listenPort}/\n`);
    });
}
