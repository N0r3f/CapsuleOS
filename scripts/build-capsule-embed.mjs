#!/usr/bin/env node
/**
 * Génère OS/linux/kernel/js/capsule-app-embed.js pour usage en file://
 * (fetch interdit / peu fiable). Relancer après modification des gabarits
 * shared/apps ou des skins apps sous mint/ubuntu/fedora.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const APPS_DIR = path.join(ROOT, 'OS/linux/shared/apps');
const STYLE_DIR = path.join(APPS_DIR, 'style');
const OUT_FILE = path.join(ROOT, 'OS/linux/kernel/js/capsule-app-embed.js');
const MANIFEST_PATH = path.join(
    ROOT,
    'OS/linux/shared/content/Dossier_personnel/nemo-manifest.json'
);

const SKIN_DIRS = [
    {
        key: 'mint',
        dir: path.join(ROOT, 'OS/linux/families/debian/mint/style/apps'),
        strings: path.join(ROOT, 'OS/linux/families/debian/mint/content/strings.json')
    },
    {
        key: 'ubuntu',
        dir: path.join(ROOT, 'OS/linux/families/debian/ubuntu/style/apps'),
        strings: path.join(ROOT, 'OS/linux/families/debian/ubuntu/content/strings.json')
    },
    {
        key: 'mxkde',
        dir: path.join(ROOT, 'OS/linux/families/debian/mx-kde/style/apps'),
        strings: path.join(ROOT, 'OS/linux/families/debian/mx-kde/content/strings.json')
    },
    {
        key: 'fedora',
        dir: path.join(ROOT, 'OS/linux/families/redhat/fedora/style/apps'),
        strings: path.join(ROOT, 'OS/linux/families/redhat/fedora/content/strings.json')
    }
];

function readUtf8(p) {
    return fs.readFileSync(p, 'utf8');
}

function listTemplateIds() {
    const names = fs.readdirSync(APPS_DIR);
    return names
        .filter((n) => n.endsWith('.html') && !fs.statSync(path.join(APPS_DIR, n)).isDirectory())
        .map((n) => path.basename(n, '.html'));
}

function listSkinIds(skinDir) {
    if (!fs.existsSync(skinDir)) {
        return [];
    }
    return fs.readdirSync(skinDir)
        .filter((n) => n.endsWith('.skin.css') && !fs.statSync(path.join(skinDir, n)).isDirectory())
        .map((n) => n.slice(0, -'.skin.css'.length));
}

function buildCssBase(templateId) {
    const baseFile = path.join(STYLE_DIR, `${templateId}.base.css`);
    let text = readUtf8(baseFile);
    if (templateId === 'dolphin') {
        const nemoBase = path.join(STYLE_DIR, 'nemo.base.css');
        text = `${readUtf8(nemoBase)}\n${text}`;
    }
    return text;
}

function readSkinCss(skinDir, templateId) {
    const f = path.join(skinDir, `${templateId}.skin.css`);
    if (!fs.existsSync(f)) {
        return '';
    }
    return readUtf8(f);
}

function readSkinStrings(stringsPath) {
    if (!fs.existsSync(stringsPath)) {
        return {};
    }
    try {
        return JSON.parse(readUtf8(stringsPath));
    } catch (error) {
        console.warn(`Chaînes ignorées (${stringsPath}): ${error.message}`);
        return {};
    }
}

function main() {
    const templateIds = listTemplateIds().sort();
    const templates = {};
    for (const id of templateIds) {
        const htmlPath = path.join(APPS_DIR, `${id}.html`);
        templates[id] = {
            html: readUtf8(htmlPath),
            cssBase: buildCssBase(id)
        };
    }

    const skins = {};
    const embedStrings = {};
    for (const { key, dir, strings } of SKIN_DIRS) {
        skins[key] = {};
        embedStrings[key] = readSkinStrings(strings);
        const skinIds = Array.from(new Set([...templateIds, ...listSkinIds(dir)])).sort();
        for (const id of skinIds) {
            skins[key][id] = readSkinCss(dir, id);
        }
    }

    const manifest = JSON.parse(readUtf8(MANIFEST_PATH));

    const header = `/* Généré par scripts/build-capsule-embed.mjs — ne pas éditer à la main */
(function () {
'use strict';
`;

    const body = `window.CAPSULE_APP_EMBED = ${JSON.stringify({ templates, skins })};
window.CAPSULE_EMBED_STRINGS = ${JSON.stringify(embedStrings)};
window.CAPSULE_FILE_EXPLORER_MANIFEST_EMBED = ${JSON.stringify(manifest)};
window.CAPSULE_NEMO_MANIFEST_EMBED = window.CAPSULE_FILE_EXPLORER_MANIFEST_EMBED;
})();`;

    fs.writeFileSync(OUT_FILE, `${header}\n${body}\n`, 'utf8');
    console.log(`Écrit ${OUT_FILE} (${templateIds.length} templates, ${SKIN_DIRS.length} skins)`);
}

main();
