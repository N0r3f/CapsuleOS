/**
 * CapsuleClusterRegistry — résolution gabarits par cluster (runtime).
 * Données embarquées ; source JSON : etc/capsuleos/cluster-registry.json
 * Regénérer : node usr/lib/capsuleos/tools/build-cluster-registry.mjs
 */
(function (global) {
    'use strict';

    /** @type {Record<string, object>} */
    const BY_TEMPLATE = {
        dolphin: { paths: { html: 'dolphin/shell.html', css: ['nemo/base.css', 'dolphin/base.css'] }, explorersBase: true },
        firefox: { paths: { html: 'firefox.html', css: ['style/firefox.base.css'] }, explorersBase: false },
        nautilus: { paths: { html: 'nautilus/shell-gnome.html', css: ['nemo/base.css', 'nautilus/header-gnome.css'] }, explorersBase: true },
        'nautilus-cosmic': { paths: { html: 'nautilus/shell-cosmic.html', css: ['nemo/base.css'] }, explorersBase: true },
        nemo: { paths: { html: 'nemo/shell.html', css: ['nemo/base.css'] }, explorersBase: true },
        'nemo-cosmic': { paths: { html: 'nautilus/shell-cosmic.html', css: ['nemo/base.css'] }, explorersBase: true },
        'nemo-gnome': { paths: { html: 'nautilus/shell-gnome.html', css: ['nemo/base.css', 'nautilus/header-gnome.css'] }, explorersBase: true },
        terminal: { paths: { html: 'terminal.html', css: ['style/terminal.base.css', 'style/terminal-ptyxis.base.css'] }, explorersBase: false }
    };

    function explorersBaseFromApps(appsBase) {
        return String(appsBase).replace(/\/apps\/?$/, '/explorers/');
    }

    global.CapsuleClusterRegistry = {
        byTemplateId(templateId) {
            return BY_TEMPLATE[templateId] || null;
        },
        resolveHtmlPath(templateId, appsBase) {
            const cluster = BY_TEMPLATE[templateId];
            if (!cluster || !cluster.paths) {
                return null;
            }
            if (cluster.explorersBase) {
                return explorersBaseFromApps(appsBase) + cluster.paths.html;
            }
            return `${appsBase}/${cluster.paths.html}`;
        },
        resolveCssStack(templateId, appsBase) {
            const cluster = BY_TEMPLATE[templateId];
            if (!cluster || !cluster.paths || !cluster.paths.css) {
                return [];
            }
            const base = cluster.explorersBase ? explorersBaseFromApps(appsBase) : appsBase;
            return cluster.paths.css.map((c) => `${base}/${c}`);
        },
        isClusterTemplate(templateId) {
            return !!BY_TEMPLATE[templateId];
        }
    };
}(typeof window !== 'undefined' ? window : globalThis));
