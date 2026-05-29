#!/usr/bin/env node
/**
 * Génère OS/android/js/capsule-android-embed.js pour file://
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APPS_DIR = path.join(ROOT, 'OS/android/apps');
const STYLE_DIR = path.join(APPS_DIR, 'style');
const OUT_FILE = path.join(ROOT, 'OS/android/js/capsule-android-embed.js');
const MESSAGES_JSON = path.join(ROOT, 'OS/android/ressources/messages.json');

function readUtf8(p) {
    return fs.readFileSync(p, 'utf8');
}

function listAppIds() {
    const names = fs.readdirSync(APPS_DIR);
    return names
        .filter((n) => n.endsWith('.html') && !fs.statSync(path.join(APPS_DIR, n)).isDirectory())
        .map((n) => path.basename(n, '.html'));
}

function main() {
    const ids = listAppIds().sort();
    const apps = {};
    for (const id of ids) {
        const htmlPath = path.join(APPS_DIR, `${id}.html`);
        const cssPath = path.join(STYLE_DIR, `${id}.css`);
        apps[id] = {
            html: readUtf8(htmlPath),
            css: fs.existsSync(cssPath) ? readUtf8(cssPath) : ''
        };
    }

    const messages = JSON.parse(readUtf8(MESSAGES_JSON));

    const header = `/* Généré par js/build-android-embed.mjs — ne pas éditer à la main */
(function () {
'use strict';
`;

    const body = `window.CAPSULE_ANDROID_APP_EMBED = ${JSON.stringify(apps)};
window.CAPSULE_ANDROID_MESSAGES_EMBED = ${JSON.stringify(messages)};
})();`;

    fs.writeFileSync(OUT_FILE, `${header}\n${body}\n`, 'utf8');
    console.log(`Écrit ${OUT_FILE} (${ids.length} apps)`);
}

main();
