const getAppsBase = () => {
    if (typeof window !== 'undefined' && window.CAPSULE_APPS_BASE) {
        return String(window.CAPSULE_APPS_BASE).replace(/\/+$/, '');
    }
    return './apps';
};

const getSkinBase = () => {
    if (typeof window !== 'undefined' && window.CAPSULE_SKIN_BASE) {
        return String(window.CAPSULE_SKIN_BASE).replace(/\/+$/, '');
    }
    return '';
};

const getEmbedSkinKey = () => {
    if (typeof window !== 'undefined' && window.CAPSULE_EMBED_SKIN_KEY) {
        return String(window.CAPSULE_EMBED_SKIN_KEY);
    }
    return 'mint';
};

const shouldUseAppEmbed = (templateId) => {
    const embed = typeof window !== 'undefined' && window.CAPSULE_APP_EMBED;
    if (!embed || !embed.templates || !embed.templates[templateId]) {
        return false;
    }
    if (typeof window !== 'undefined' && window.CAPSULE_FORCE_APP_EMBED === true) {
        return true;
    }
    if (typeof location !== 'undefined' && location.protocol === 'file:') {
        return true;
    }
    return false;
};

/**
 * Slot logique (data-link) → nom de fichier template sous shared/apps (sans .html).
 */
const resolveTemplateId = (slotId) => {
    if (slotId === 'nemo' && typeof window !== 'undefined' && window.CAPSULE_EXPLORER_TEMPLATE) {
        const t = String(window.CAPSULE_EXPLORER_TEMPLATE).replace(/\/+$/, '');
        return t || 'nemo';
    }
    if (slotId === 'mainMenu' && typeof window !== 'undefined' && window.CAPSULE_MAIN_MENU_TEMPLATE) {
        const t = String(window.CAPSULE_MAIN_MENU_TEMPLATE).replace(/\/+$/, '');
        return t || 'mainMenu';
    }
    return slotId;
};

/** Gabarit HTML dérivé de Nautilus (ex. nemo-gnome) → CSS de base `nemo.base.css`. */
const resolveCssBaseTemplateId = (templateId) => {
    if (templateId === 'nemo-gnome' || templateId === 'nemo-cosmic') {
        return 'nemo';
    }
    if (templateId === 'mainMenu-gnome') {
        return 'mainMenu-gnome';
    }
    return templateId;
};

const resolveSkinId = (slotId, templateId) => {
    if (slotId === 'nemo' && typeof window !== 'undefined' && window.CAPSULE_EXPLORER_SKIN_KEY) {
        const skin = String(window.CAPSULE_EXPLORER_SKIN_KEY).replace(/\/+$/, '');
        return skin || templateId;
    }
    if (slotId === 'mainMenu' && typeof window !== 'undefined' && window.CAPSULE_MAIN_MENU_SKIN_KEY) {
        const skin = String(window.CAPSULE_MAIN_MENU_SKIN_KEY).replace(/\/+$/, '');
        return skin || templateId;
    }
    return templateId;
};

const divs = document.querySelectorAll('div[data-link]');

/**
 * @param {string} templateId
 * @param {string} skinId
 * @param {string} appsBase
 * @param {string|null} cssSkinFile
 * @param {string|null} cssSkinFallbackFile
 * @returns {Promise<{ html: string, cssBase: string, cssSkin: string }>}
 */
const resolveTemplateHtmlFile = (templateId, appsBase) => {
    if (typeof window !== 'undefined' && window.CAPSULE_TEMPLATE_OVERRIDES && window.CAPSULE_TEMPLATE_OVERRIDES[templateId]) {
        return String(window.CAPSULE_TEMPLATE_OVERRIDES[templateId]);
    }
    if (templateId === 'dolphin') {
        return '../../../../../modules/app/dolphin/dolphin.html';
    }
    return `${appsBase}/${templateId}.html`;
};

const loadSlotAssets = (templateId, skinId, appsBase, cssSkinFile, cssSkinFallbackFile) => {
    const embed = typeof window !== 'undefined' && window.CAPSULE_APP_EMBED;
    if (shouldUseAppEmbed(templateId) && embed && embed.templates && embed.templates[templateId]) {
        const skinKey = getEmbedSkinKey();
        const skinMap = embed.skins && embed.skins[skinKey];
        if (skinMap) {
            const t = embed.templates[templateId];
            const skinOverride = embed.skinTemplates
                && embed.skinTemplates[skinKey]
                && embed.skinTemplates[skinKey][templateId];
            const cssSkin = skinMap[skinId] != null
                ? skinMap[skinId]
                : (skinMap[templateId] != null ? skinMap[templateId] : '');
            return Promise.resolve({
                html: skinOverride && skinOverride.html ? skinOverride.html : t.html,
                cssBase: t.cssBase,
                cssSkin
            });
        }
        console.warn(`CapsuleOS: embed sans skin "${skinKey}" pour ${templateId} — chargement fetch`);
    }

    const htmlFile = resolveTemplateHtmlFile(templateId, appsBase);
    const cssBaseTemplateId = resolveCssBaseTemplateId(templateId);
    const cssBaseFile = templateId === 'dolphin'
        ? '../../../../../modules/app/dolphin/dolphin.base.css'
        : `${appsBase}/style/${cssBaseTemplateId}.base.css`;

    const resolveEmbedHtml = () => {
        if (!embed || !embed.templates || !embed.templates[templateId]) {
            return null;
        }
        const skinKey = getEmbedSkinKey();
        const skinOverride = embed.skinTemplates
            && embed.skinTemplates[skinKey]
            && embed.skinTemplates[skinKey][templateId];
        return (skinOverride && skinOverride.html) ? skinOverride.html : embed.templates[templateId].html;
    };

    const fetchHtml = fetch(htmlFile, { cache: 'no-store' }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${htmlFile}`);
        }
        return response.text();
    }).catch((error) => {
        const fallbackHtml = resolveEmbedHtml();
        if (fallbackHtml) {
            console.warn(`CapsuleOS: gabarit ${templateId} via embed (${error.message})`);
            return fallbackHtml;
        }
        throw error;
    });

    const fetchCssBase = (async () => {
        let text = '';
        const response = await fetch(cssBaseFile, { cache: 'no-store' });
        if (!response.ok) {
            if (embed && embed.templates && embed.templates[templateId] && embed.templates[templateId].cssBase) {
                console.warn(`CapsuleOS: CSS base ${templateId} via embed (HTTP ${response.status})`);
                text = embed.templates[templateId].cssBase;
            } else {
                throw new Error(`HTTP ${response.status} ${cssBaseFile}`);
            }
        } else {
            text = await response.text();
        }
        if (templateId === 'dolphin' && text) {
            const nemoFile = `${appsBase}/style/nemo.base.css`;
            const nemoResp = await fetch(nemoFile, { cache: 'no-store' });
            if (nemoResp.ok) {
                text = `${await nemoResp.text()}\n${text}`;
            }
        }
        return text;
    })();

    const skinCssVersion = typeof window !== 'undefined' && window.CAPSULE_SKIN_CSS_VERSION
        ? String(window.CAPSULE_SKIN_CSS_VERSION)
        : '';
    const withSkinCssBust = (url) => (
        skinCssVersion && url ? `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(skinCssVersion)}` : url
    );

    const fetchCssSkin = cssSkinFile
        ? fetch(withSkinCssBust(cssSkinFile), { cache: 'no-store' }).then((response) => {
            if (response.ok) {
                return response.text();
            }
            if (cssSkinFallbackFile && cssSkinFallbackFile !== cssSkinFile) {
                return fetch(withSkinCssBust(cssSkinFallbackFile), { cache: 'no-store' }).then((fallbackResponse) => (
                    fallbackResponse.ok ? fallbackResponse.text() : ''
                ));
            }
            return '';
        })
        : Promise.resolve('');

    return Promise.all([fetchHtml, fetchCssBase, fetchCssSkin]).then(([html, cssBase, cssSkin]) => ({
        html,
        cssBase,
        cssSkin
    }));
};

const runFirstAvailable = (candidates, warnLabel) => {
    for (let index = 0; index < candidates.length; index += 1) {
        const candidate = candidates[index];
        if (typeof candidate.fn === 'function') {
            candidate.fn(...(candidate.args || []));
            return true;
        }
    }
    if (warnLabel) {
        console.warn(`CapsuleOS: ${warnLabel} indisponible (ordre des scripts ?)`);
    }
    return false;
};

const SLOT_INIT_HANDLERS = {
    nemo: () => {
        const contentRoot = typeof window !== 'undefined' && window.CAPSULE_CONTENT_ROOT
            ? window.CAPSULE_CONTENT_ROOT
            : './apps/system/Dossier_personnel';
        runFirstAvailable([
            { fn: typeof window.refreshDolphinShellLayout === 'function' ? window.refreshDolphinShellLayout : null }
        ]);
        runFirstAvailable([
            { fn: typeof initFileExplorerContainer === 'function' ? initFileExplorerContainer : null },
            { fn: typeof initNemoContainer === 'function' ? initNemoContainer : null }
        ], 'initFileExplorerContainer');
        runFirstAvailable([
            { fn: typeof loadFileExplorerDirectory === 'function' ? loadFileExplorerDirectory : null, args: [contentRoot] },
            { fn: typeof loadDirectory === 'function' ? loadDirectory : null, args: [contentRoot] }
        ]);
    },
    terminal: () => {
        runFirstAvailable([
            { fn: typeof initTerminalWhenReady === 'function' ? initTerminalWhenReady : null }
        ], 'initTerminalWhenReady');
    },
    mainMenu: () => {
        if (typeof initMainMenu === 'function') {
            initMainMenu();
        }
    },
    firefox: () => {
        runFirstAvailable([
            { fn: typeof initFirefoxBrowser === 'function' ? initFirefoxBrowser : null },
            { fn: typeof initMintFirefoxBrowser === 'function' ? initMintFirefoxBrowser : null }
        ]);
    },
    themes: () => {
        if (typeof initThemesApp === 'function') {
            initThemesApp();
        }
    },
    profile: () => {
        if (typeof initProfileApp === 'function') {
            initProfileApp();
        }
    },
    checklist: () => {
        if (typeof initChecklistApp === 'function') {
            initChecklistApp();
        }
    },
    librewriter: () => {
        if (typeof initLibreWriter === 'function') {
            initLibreWriter();
        }
    },
    visionneur_images: () => {
        runFirstAvailable([
            { fn: typeof renderFileViewer === 'function' ? renderFileViewer : null, args: ['visionneur_images'] },
            { fn: typeof renderMintViewer === 'function' ? renderMintViewer : null, args: ['visionneur_images'] }
        ]);
    },
    visionneur_pdf: () => {
        runFirstAvailable([
            { fn: typeof renderFileViewer === 'function' ? renderFileViewer : null, args: ['visionneur_pdf'] },
            { fn: typeof renderMintViewer === 'function' ? renderMintViewer : null, args: ['visionneur_pdf'] }
        ]);
    },
    lecteur_multimedia: () => {
        runFirstAvailable([
            { fn: typeof renderFileViewer === 'function' ? renderFileViewer : null, args: ['lecteur_multimedia'] },
            { fn: typeof renderMintViewer === 'function' ? renderMintViewer : null, args: ['lecteur_multimedia'] }
        ]);
    },
    update_manager: () => {
        if (typeof initUpdateManagerApp === 'function') {
            initUpdateManagerApp();
        }
    }
};

const injectSlot = (motionless, slotId, templateId, html, cssBase, cssSkin) => {
    const rewriteUrls = typeof rewriteCapsuleResourceUrlsInText === 'function'
        ? rewriteCapsuleResourceUrlsInText
        : (text) => text;
    const resolvedHtml = rewriteUrls(html);
    const resolvedCssBase = rewriteUrls(cssBase);
    const resolvedCssSkin = cssSkin ? rewriteUrls(cssSkin) : '';

    motionless.innerHTML = resolvedHtml;

    if (typeof window.applyCapsuleStrings === 'function' && typeof window !== 'undefined' && window.CAPSULE_STRINGS_MERGED) {
        window.applyCapsuleStrings(motionless, window.CAPSULE_STRINGS_MERGED);
    }

    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = resolvedCssBase + (resolvedCssSkin ? `\n${resolvedCssSkin}` : '');
    document.head.appendChild(style);

    const initSlot = SLOT_INIT_HANDLERS[slotId];
    if (typeof initSlot === 'function') {
        initSlot(motionless, slotId, templateId);
    }
};

const loadMergedStrings = () => {
    if (typeof window.getMergedStrings === 'function') {
        return window.getMergedStrings();
    }
    const defaults = (typeof window !== 'undefined' && window.CAPSULE_STRINGS_DEFAULT) || {};
    return Promise.resolve(defaults);
};

const startCapsuleContentLoad = () => {
    loadMergedStrings()
        .then((merged) => {
            if (typeof window !== 'undefined') {
                window.CAPSULE_STRINGS_MERGED = merged;
                window.CAPSULE_WINDOW_TITLES = typeof window.buildWindowTitles === 'function'
                    ? window.buildWindowTitles(merged)
                    : {};
            }

            divs.forEach((div) => {
                const slotId = div.getAttribute('data-link');
                const templateId = resolveTemplateId(slotId);
                const skinId = resolveSkinId(slotId, templateId);
                const appsBase = getAppsBase();
                const skinBase = getSkinBase();
                const cssSkinFile = skinBase ? `${skinBase}/style/apps/${skinId}.skin.css` : null;
                const cssSkinFallbackFile = skinBase ? `${skinBase}/style/apps/${templateId}.skin.css` : null;

                loadSlotAssets(templateId, skinId, appsBase, cssSkinFile, cssSkinFallbackFile)
                    .then(({ html, cssBase, cssSkin }) => {
                        injectSlot(div, slotId, templateId, html, cssBase, cssSkin);
                    })
                    .catch((error) => {
                        console.error('Erreur lors du chargement des fichiers:', error);
                        div.innerHTML = '<section style="padding:12px;font-family:sans-serif;">Impossible de charger ce module. Vérifiez que les fichiers de l’application sont présents ou régénérez capsule-app-embed.js (voir README).</section>';
                    });
            });
        })
        .catch((err) => {
            console.error('CapsuleOS: échec fusion des chaînes', err);
            divs.forEach((div) => {
                div.innerHTML = '<section style="padding:12px;font-family:sans-serif;">Erreur de chargement des textes.</section>';
            });
        });
};

if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCapsuleContentLoad);
} else {
    setTimeout(startCapsuleContentLoad, 0);
}
