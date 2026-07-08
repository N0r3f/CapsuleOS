(function bootstrapCapsuleA11y(global) {
    'use strict';

    const doc = global.document;
    if (!doc || !doc.documentElement) {
        return;
    }

    const KEYS = {
        contrast: 'mint-contrast-mode',
        fontScale: 'mint-font-scale',
        reducedMotion: 'capsule-reduced-motion',
        underlineLinks: 'capsule-underline-links',
    };

    function readPref(key, fallback) {
        try {
            return global.localStorage.getItem(key) || fallback;
        } catch (e) {
            return fallback;
        }
    }

    const root = doc.documentElement;
    const contrast = readPref(KEYS.contrast, 'normal');
    root.dataset.contrastMode = contrast === 'high' ? 'high' : 'normal';

    const scale = String(readPref(KEYS.fontScale, '100'));
    root.dataset.fontScale = ['110', '125'].includes(scale) ? scale : '100';

    root.dataset.reducedMotion = readPref(KEYS.reducedMotion, 'off') === 'on' ? 'on' : 'off';
    root.dataset.underlineLinks = readPref(KEYS.underlineLinks, 'off') === 'on' ? 'on' : 'off';
}(typeof window !== 'undefined' ? window : globalThis));

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

/** Kickoff Plasma : le gabarit HTML + skin.css suffisent — mainMenu.base.css (MX/Cinnamon) casse le layout. */
const PLASMA_MAIN_MENU_SKINS = new Set(['opensuse', 'kde-neon', 'mxkde', 'debian-kde']);
const PLASMA_MAIN_MENU_BODY_IDS = new Set(['opensuse', 'kde-neon', 'debian-kde', 'mx-kde']);
/** Mint Cinnamon : menu panneau — layout entièrement dans mainMenu.skin.css (imports statiques). */
const CINNAMON_PANEL_MENU_SKINS = new Set(['mint']);
const CINNAMON_PANEL_MENU_BODY_IDS = new Set(['mint']);

/** Discover KDE : CSS commun (grille sidebar) embarqué au build — doit aussi être fetché en HTTP. */
const KDE_DISCOVER_SKINS = new Set(['opensuse', 'mxkde', 'kde-neon', 'debian-kde', 'debiankde']);
const KDE_DISCOVER_BODY_IDS = new Set(['opensuse', 'kde-neon', 'debian-kde', 'mx-kde']);

const isKdeDiscoverContext = () => {
    if (KDE_DISCOVER_SKINS.has(getEmbedSkinKey())) {
        return true;
    }
    const bodyId = typeof document !== 'undefined' && document.body && document.body.id;
    return !!(bodyId && KDE_DISCOVER_BODY_IDS.has(bodyId));
};

const isKdePlasmaContext = () => isKdeDiscoverContext()
    || PLASMA_MAIN_MENU_SKINS.has(getEmbedSkinKey())
    || (typeof document !== 'undefined' && document.body && PLASMA_MAIN_MENU_BODY_IDS.has(document.body.id));

const resolveKdeDiscoverCssBaseId = () => {
    const overrides = typeof window !== 'undefined' && window.CAPSULE_TEMPLATE_OVERRIDES;
    if (overrides && overrides.update_manager
        && String(overrides.update_manager).includes('update_manager_kde_neon')) {
        return 'update_manager_kde_neon';
    }
    const bodyId = typeof document !== 'undefined' && document.body && document.body.id;
    if (getEmbedSkinKey() === 'kde-neon' || bodyId === 'kde-neon') {
        return 'update_manager_kde_neon';
    }
    if (isKdeDiscoverContext()) {
        return 'update_manager_kde_neon';
    }
    return 'update_manager_kde';
};

const shouldSkipMainMenuBaseCss = (templateId, htmlHint) => {
    if (templateId !== 'mainMenu') {
        return false;
    }
    if (htmlHint && htmlHint.includes('menu-root--plasma')) {
        return true;
    }
    if (PLASMA_MAIN_MENU_SKINS.has(getEmbedSkinKey())) {
        return true;
    }
    if (CINNAMON_PANEL_MENU_SKINS.has(getEmbedSkinKey())) {
        return true;
    }
    const bodyId = typeof document !== 'undefined' && document.body && document.body.id;
    if (bodyId && PLASMA_MAIN_MENU_BODY_IDS.has(bodyId)) {
        return true;
    }
    return !!(bodyId && CINNAMON_PANEL_MENU_BODY_IDS.has(bodyId));
};

const shouldSkipDynamicSkinCss = (slotId) => {
    const staticSlots = typeof window !== 'undefined' && window.CAPSULE_STATIC_SKIN_SLOTS;
    if (!Array.isArray(staticSlots)) {
        return false;
    }
    return staticSlots.indexOf(slotId) !== -1;
};

const shouldUseAppEmbed = (templateId) => {
    const embed = typeof window !== 'undefined' && window.CAPSULE_APP_EMBED;
    if (!embed || !embed.templates || !embed.templates[templateId]) {
        return false;
    }
    if (typeof window !== 'undefined' && window.CAPSULE_FORCE_APP_EMBED === true) {
        return true;
    }
    if (typeof window !== 'undefined' && window.CapsuleBrowserCapabilities) {
        const caps = window.CapsuleBrowserCapabilities.capabilities;
        if (caps.fileProtocolEmbed && typeof location !== 'undefined' && location.protocol === 'file:') {
            return true;
        }
        if (window.CapsuleEngineAdapter && window.CapsuleEngineAdapter.preferEmbedOnFileProtocol === false) {
            return false;
        }
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
    if (templateId === 'update_manager' && isKdeDiscoverContext()) {
        return resolveKdeDiscoverCssBaseId();
    }
    if (templateId === 'nemo-gnome' || templateId === 'nemo-cosmic') {
        return 'nemo';
    }
    if (templateId === 'mainMenu-gnome') {
        return 'mainMenu-gnome';
    }
    if (templateId === 'systemsettings_kde_neon') {
        return 'systemsettings_kde';
    }
    return templateId;
};

/**
 * Slot logique → id de gabarit effectif (CAPSULE_TEMPLATE_OVERRIDES ou slot brut).
 * Ex. update_manager + override …/update_manager_gnome.html → update_manager_gnome.
 */
const resolveEffectiveTemplateId = (slotId, templateId) => {
    if (typeof window !== 'undefined'
        && window.CAPSULE_TEMPLATE_OVERRIDES
        && window.CAPSULE_TEMPLATE_OVERRIDES[slotId]) {
        const override = String(window.CAPSULE_TEMPLATE_OVERRIDES[slotId]);
        const fileName = override.split('/').pop() || '';
        const stem = fileName.replace(/\.html$/i, '');
        if (stem) {
            return stem;
        }
    }
    return templateId;
};

const resolveEmbedSkinOverride = (skinKey, templateId) => {
    const embed = typeof window !== 'undefined' && window.CAPSULE_APP_EMBED;
    if (!embed || !embed.skinTemplates || !skinKey) {
        return null;
    }
    return embed.skinTemplates[skinKey] && embed.skinTemplates[skinKey][templateId]
        ? embed.skinTemplates[skinKey][templateId]
        : null;
};

const resolveEmbeddedCssBase = (slotId, templateId, htmlHint) => {
    if (shouldSkipMainMenuBaseCss(templateId, htmlHint)) {
        return '';
    }
    const embed = typeof window !== 'undefined' && window.CAPSULE_APP_EMBED;
    if (!embed || !embed.templates) {
        return '';
    }
    const skinKey = getEmbedSkinKey();
    const skinOverride = resolveEmbedSkinOverride(skinKey, templateId);
    if (skinOverride && skinOverride.cssBase) {
        return skinOverride.cssBase;
    }
    const effectiveTemplateId = resolveEffectiveTemplateId(slotId, templateId);
    // Pile explorers/ (nemo-gnome, nautilus…) avant l'alias nemo → apps/style/nemo.base.css.
    if (embed.templates[templateId] && embed.templates[templateId].cssBase) {
        return embed.templates[templateId].cssBase;
    }
    if (effectiveTemplateId !== templateId
        && embed.templates[effectiveTemplateId]
        && embed.templates[effectiveTemplateId].cssBase) {
        return embed.templates[effectiveTemplateId].cssBase;
    }
    const cssBaseTemplateId = resolveCssBaseTemplateId(effectiveTemplateId);
    if (embed.templates[cssBaseTemplateId] && embed.templates[cssBaseTemplateId].cssBase) {
        return embed.templates[cssBaseTemplateId].cssBase;
    }
    return '';
};

const normalizeExplorerSkinId = (skinId, templateId) => {
    if (skinId === 'nemo-gnome' || skinId === 'files') {
        return 'nautilus';
    }
    if ((templateId === 'nemo-gnome' || templateId === 'nautilus') && skinId === templateId) {
        return 'nautilus';
    }
    return skinId;
};

const resolveExplorerSkinFallbackId = (templateId) => {
    if (templateId === 'nemo-gnome' || templateId === 'nautilus') {
        return 'nautilus';
    }
    return templateId;
};

const resolveSkinId = (slotId, templateId) => {
    if (slotId === 'nemo' && typeof window !== 'undefined' && window.CAPSULE_EXPLORER_SKIN_KEY) {
        const skin = String(window.CAPSULE_EXPLORER_SKIN_KEY).replace(/\/+$/, '');
        return normalizeExplorerSkinId(skin || templateId, templateId);
    }
    if (slotId === 'mainMenu' && typeof window !== 'undefined' && window.CAPSULE_MAIN_MENU_SKIN_KEY) {
        const skin = String(window.CAPSULE_MAIN_MENU_SKIN_KEY).replace(/\/+$/, '');
        return skin || templateId;
    }
    return templateId;
};

const divs = document.querySelectorAll('div[data-link]');

const slotElements = new Map();
const slotLoadPromises = new Map();

Array.from(divs).forEach((div) => {
    const slotId = div.getAttribute('data-link');
    if (slotId) {
        slotElements.set(slotId, div);
    }
});

const DEFAULT_TIERED_SLOT_PRIORITY = [
    'mainMenu', 'nemo', 'firefox', 'terminal', 'themes',
    'update_manager', 'mintinstall', 'profile',
    'text_editor', 'calculator', 'visionneur_images', 'visionneur_pdf',
    'lecteur_multimedia', 'file_roller',
];

const shouldUseTieredSlotLoad = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    if (window.CAPSULE_SLOT_LOAD_TIERED === false) {
        return false;
    }
    if (window.CAPSULE_SLOT_LOAD_TIERED === true) {
        return true;
    }
    const bodyId = typeof document !== 'undefined' && document.body && document.body.id;
    if (bodyId === 'mint' || getEmbedSkinKey() === 'mint') {
        return divs.length >= 20;
    }
    return false;
};

const resolveSlotLoadPriority = () => {
    if (typeof window !== 'undefined' && Array.isArray(window.CAPSULE_SLOT_LOAD_PRIORITY)
        && window.CAPSULE_SLOT_LOAD_PRIORITY.length) {
        return window.CAPSULE_SLOT_LOAD_PRIORITY.slice();
    }
    return DEFAULT_TIERED_SLOT_PRIORITY.slice();
};

const isSlotLoaded = (slotId) => {
    const el = slotElements.get(slotId);
    return !!(el && el.dataset.capsuleSlotLoaded === 'true');
};

const bootCapsuleWindowContext = () => {
    if (typeof window.CapsuleLinuxWindowContext !== 'undefined'
        && typeof window.CapsuleLinuxWindowContext.boot === 'function') {
        window.CapsuleLinuxWindowContext.boot();
    }
};

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
    if (typeof window !== 'undefined'
        && window.CapsuleClusterRegistry
        && typeof window.CapsuleClusterRegistry.resolveHtmlPath === 'function') {
        const clusterPath = window.CapsuleClusterRegistry.resolveHtmlPath(templateId, appsBase);
        if (clusterPath) {
            return clusterPath;
        }
    }
    if (typeof window !== 'undefined'
        && window.CapsuleExplorerRegistry
        && typeof window.CapsuleExplorerRegistry.isExplorerTemplate === 'function'
        && window.CapsuleExplorerRegistry.isExplorerTemplate(templateId)
        && typeof window.CapsuleExplorerRegistry.resolveShellPathFromAppsBase === 'function') {
        return window.CapsuleExplorerRegistry.resolveShellPathFromAppsBase(appsBase, templateId);
    }
    return `${appsBase}/${templateId}.html`;
};

/** Override HTML local au skin (Kickoff Plasma, Discover Neon, etc.) — pas de probe 404 pour les autres slots. */
const hasSkinHtmlOverride = (templateId) => {
    const embed = typeof window !== 'undefined' && window.CAPSULE_APP_EMBED;
    const skinKey = getEmbedSkinKey();
    const skinMap = embed && embed.skinTemplates && embed.skinTemplates[skinKey];
    if (skinMap && skinMap[templateId] && skinMap[templateId].html) {
        return true;
    }
    if (typeof window !== 'undefined' && window.CAPSULE_TEMPLATE_OVERRIDES && window.CAPSULE_TEMPLATE_OVERRIDES[templateId]) {
        return true;
    }
    if (typeof window !== 'undefined' && window.CAPSULE_SKIN_APP_OVERRIDES) {
        const list = window.CAPSULE_SKIN_APP_OVERRIDES;
        if (Array.isArray(list) && list.includes(templateId)) {
            return true;
        }
        if (list && typeof list === 'object' && list[templateId]) {
            return true;
        }
    }
    return false;
};

/** Candidats HTML : skin d’abord si override connu, puis noyau partagé. */
const resolveTemplateHtmlCandidates = (templateId, appsBase, skinBase) => {
    const candidates = [];
    if (typeof window !== 'undefined'
        && window.CAPSULE_TEMPLATE_OVERRIDES
        && window.CAPSULE_TEMPLATE_OVERRIDES[templateId]) {
        candidates.push(String(window.CAPSULE_TEMPLATE_OVERRIDES[templateId]));
    }
    if (skinBase && hasSkinHtmlOverride(templateId)) {
        const localSkinHtml = `${String(skinBase).replace(/\/+$/, '')}/apps/${templateId}.html`;
        if (!candidates.includes(localSkinHtml)) {
            candidates.push(localSkinHtml);
        }
    }
    const shared = resolveTemplateHtmlFile(templateId, appsBase);
    if (!candidates.includes(shared)) {
        candidates.push(shared);
    }
    return candidates;
};

const loadSlotAssets = (slotId, templateId, skinId, appsBase, skinBase, cssSkinFile, cssSkinFallbackFile) => {
    const embed = typeof window !== 'undefined' && window.CAPSULE_APP_EMBED;
    if (shouldUseAppEmbed(templateId) && embed && embed.templates && embed.templates[templateId]) {
        const skinKey = getEmbedSkinKey();
        const skinMap = embed.skins && embed.skins[skinKey];
        if (skinMap) {
            const t = embed.templates[templateId];
            const skinOverride = resolveEmbedSkinOverride(skinKey, templateId);
            const resolvedHtml = skinOverride && skinOverride.html ? skinOverride.html : t.html;
            const skipDynamicSkin = shouldSkipDynamicSkinCss(slotId);
            const cssSkin = skipDynamicSkin
                ? ''
                : (skinMap[skinId] != null
                    ? skinMap[skinId]
                    : (skinMap[templateId] != null ? skinMap[templateId] : ''));
            let cssBase = resolveEmbeddedCssBase(slotId, templateId, resolvedHtml);
            const fetchMintinstallBaseCss = async () => {
                if (templateId !== 'mintinstall' || (cssBase && cssBase.includes('mi-app--mode-home'))) {
                    return cssBase;
                }
                try {
                    const url = `${appsBase}/style/mintinstall.base.css`;
                    const response = await fetch(url, { cache: 'no-store' });
                    if (response.ok) {
                        return await response.text();
                    }
                } catch (_) {
                    /* repli embed */
                }
                return cssBase;
            };
            return fetchMintinstallBaseCss().then((resolvedCssBase) => ({
                html: resolvedHtml,
                cssBase: resolvedCssBase,
                cssSkin
            }));
        }
        console.warn(`CapsuleOS: embed sans skin "${skinKey}" pour ${templateId} — chargement fetch`);
    }

    const effectiveTemplateId = resolveEffectiveTemplateId(slotId, templateId);
    const htmlCandidates = resolveTemplateHtmlCandidates(templateId, appsBase, skinBase);
    const cssBaseTemplateId = resolveCssBaseTemplateId(effectiveTemplateId);
    const cssBaseFile = `${appsBase}/style/${cssBaseTemplateId}.base.css`;

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

    const fetchHtml = (async () => {
        const skinKey = getEmbedSkinKey();
        const skinOverride = resolveEmbedSkinOverride(skinKey, templateId);
        if (skinOverride && skinOverride.html) {
            return skinOverride.html;
        }

        let lastError = null;
        for (const url of htmlCandidates) {
            try {
                const response = await fetch(url, { cache: 'no-store' });
                if (response.ok) {
                    return response.text();
                }
                lastError = new Error(`HTTP ${response.status} ${url}`);
            } catch (error) {
                lastError = error;
            }
        }
        const fallbackHtml = resolveEmbedHtml();
        if (fallbackHtml) {
            const reason = lastError && lastError.message ? lastError.message : 'échec fetch';
            console.warn(`CapsuleOS: gabarit ${templateId} via embed (${reason})`);
            return fallbackHtml;
        }
        throw lastError || new Error(`CapsuleOS: gabarit ${templateId} introuvable`);
    })();

    const fetchCssBase = (async () => {
        if (shouldSkipMainMenuBaseCss(templateId)) {
            return '';
        }

        const embedKey = typeof window !== 'undefined' && window.CAPSULE_EMBED_SKIN_KEY
            ? String(window.CAPSULE_EMBED_SKIN_KEY)
            : '';
        if (templateId === 'themes' && embedKey === 'mint') {
            const embeddedMintCs = resolveEmbeddedCssBase(slotId, templateId);
            if (embeddedMintCs) {
                return embeddedMintCs;
            }
            try {
                const cinnamonFile = `${appsBase}/style/cinnamon_settings.base.css`;
                const cinnamonResp = await fetch(cinnamonFile, { cache: 'no-store' });
                if (cinnamonResp.ok) {
                    return await cinnamonResp.text();
                }
            } catch (_) {
                /* repli fetch themes.base ci-dessous */
            }
        }

        if (templateId === 'calculator' && embedKey === 'mint') {
            const embeddedMintCalcCss = resolveEmbeddedCssBase(slotId, templateId);
            if (embeddedMintCalcCss) {
                return embeddedMintCalcCss;
            }
            try {
                const mintCalcFile = `${appsBase}/style/calculator_cinnamon.base.css`;
                const mintCalcResp = await fetch(mintCalcFile, { cache: 'no-store' });
                if (mintCalcResp.ok) {
                    return await mintCalcResp.text();
                }
            } catch (_) {
                /* repli fetch calculator.base ci-dessous */
            }
        }

        const fetchOneCss = async (url) => {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${url}`);
            }
            return response.text();
        };

        let stackUrls = [];
        if (typeof window !== 'undefined'
            && window.CapsuleExplorerRegistry
            && typeof window.CapsuleExplorerRegistry.resolveCssBasePathsFromAppsBase === 'function') {
            stackUrls = window.CapsuleExplorerRegistry.resolveCssBasePathsFromAppsBase(appsBase, templateId);
        }

        // Pile explorers/ = source de vérité (même contenu que l'embed file://).
        // Auparavant seuls les stacks multi-fichiers passaient ici, laissant les
        // templates nemo simples sur la copie legacy apps/style/nemo.base.css (dérive).
        if (stackUrls.length >= 1
            && typeof window.CapsuleExplorerRegistry.isExplorerTemplate === 'function'
            && window.CapsuleExplorerRegistry.isExplorerTemplate(templateId)) {
            try {
                const chunks = await Promise.all(stackUrls.map((url) => fetchOneCss(url)));
                return chunks.join('\n');
            } catch (stackError) {
                console.warn(`CapsuleOS: pile CSS explorateur ${templateId} — repli nemo.base`, stackError.message);
            }
        }

        let text = '';
        const response = await fetch(cssBaseFile, { cache: 'no-store' });
        if (!response.ok) {
            const embeddedCssBase = resolveEmbeddedCssBase(slotId, templateId);
            if (embeddedCssBase) {
                console.warn(`CapsuleOS: CSS base ${cssBaseTemplateId} via embed (HTTP ${response.status})`);
                text = embeddedCssBase;
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
        if (templateId === 'themes' && text) {
            if (embedKey === 'mint') {
                /* traité en tête de fetchCssBase */
            } else if (isKdePlasmaContext()) {
                const kdeFile = `${appsBase}/style/systemsettings_kde.base.css`;
                const kdeResp = await fetch(kdeFile, { cache: 'no-store' });
                if (kdeResp.ok) {
                    text = await kdeResp.text();
                }
            } else {
                const gnomeFile = `${appsBase}/style/themes_gnome.base.css`;
                const gnomeResp = await fetch(gnomeFile, { cache: 'no-store' });
                if (gnomeResp.ok) {
                    text = `${text}\n${await gnomeResp.text()}`;
                }
            }
        }
        if (templateId === 'terminal' && text) {
            const ptyxisFile = `${appsBase}/style/terminal-ptyxis.base.css`;
            const ptyxisResp = await fetch(ptyxisFile, { cache: 'no-store' });
            if (ptyxisResp.ok) {
                text = `${text}\n${await ptyxisResp.text()}`;
            } else {
                console.error(`CapsuleOS: terminal-ptyxis.base.css indisponible (HTTP ${ptyxisResp.status}) — ${ptyxisFile}`);
            }
        }
        if (templateId === 'firefox' && text) {
            const protonFile = `${appsBase}/style/firefox-proton.base.css`;
            const protonResp = await fetch(protonFile, { cache: 'no-store' });
            if (protonResp.ok) {
                text = `${text}\n${await protonResp.text()}`;
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

    const fetchCssSkin = (async () => {
        let skinText = '';
        const embedKey = typeof window !== 'undefined' && window.CAPSULE_EMBED_SKIN_KEY
            ? String(window.CAPSULE_EMBED_SKIN_KEY)
            : '';
        if (templateId === 'themes' && embedKey === 'mint' && embed && embed.skins && embed.skins.mint) {
            const embeddedSkin = embed.skins.mint.themes || embed.skins.mint[skinId];
            if (embeddedSkin) {
                return embeddedSkin;
            }
        }
        if (cssSkinFile) {
            try {
                const response = await fetch(withSkinCssBust(cssSkinFile), { cache: 'no-store' });
                if (response.ok) {
                    skinText = await response.text();
                } else if (cssSkinFallbackFile && cssSkinFallbackFile !== cssSkinFile) {
                    const fallbackResponse = await fetch(withSkinCssBust(cssSkinFallbackFile), { cache: 'no-store' });
                    if (fallbackResponse.ok) {
                        skinText = await fallbackResponse.text();
                    }
                }
            } catch (_) {
                skinText = '';
            }
        }
        if (templateId === 'themes' && embedKey === 'mint' && skinBase) {
            try {
                const csSkinFile = `${String(skinBase).replace(/\/+$/, '')}/style/apps/cinnamon_settings.skin.css`;
                const csResp = await fetch(withSkinCssBust(csSkinFile), { cache: 'no-store' });
                if (csResp.ok) {
                    const csText = await csResp.text();
                    skinText = skinText ? `${skinText}\n${csText}` : csText;
                }
            } catch (_) {
                /* optionnel */
            }
        }
        if (templateId === 'update_manager' && isKdeDiscoverContext()) {
            const kdeCommonFile = `${appsBase}/style/skins/kde/update_manager.skin.css`;
            try {
                const response = await fetch(withSkinCssBust(kdeCommonFile), { cache: 'no-store' });
                if (response.ok) {
                    const commonText = await response.text();
                    skinText = commonText + (skinText ? `\n${skinText}` : '');
                }
            } catch (_) {
                /* repli embed géré par l’appelant si besoin */
            }
        }
        return skinText;
    })();

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
    nemo: (container) => {
        if (typeof window.initExplorerWindowInstance === 'function') {
            window.initExplorerWindowInstance(container);
        }
        if (typeof window.preloadExplorerAdvancedChrome === 'function') {
            window.preloadExplorerAdvancedChrome();
        }
        if (typeof window.resetFileExplorerSlotBindings === 'function') {
            window.resetFileExplorerSlotBindings(container);
        }
        const contentRoot = typeof window !== 'undefined' && window.CAPSULE_CONTENT_ROOT
            ? window.CAPSULE_CONTENT_ROOT
            : (typeof window !== 'undefined' && window.CapsuleUserHome)
                ? window.CapsuleUserHome.resolveRelative()
                : 'home/public';
        runFirstAvailable([
            {
                fn: typeof window.refreshDolphinShellLayout === 'function' ? window.refreshDolphinShellLayout : null,
                args: [container],
            },
        ]);
        runFirstAvailable([
            {
                fn: typeof initFileExplorerContainer === 'function' ? initFileExplorerContainer : null,
                args: [container],
            },
            {
                fn: typeof initNemoContainer === 'function' ? initNemoContainer : null,
                args: [container],
            },
        ], 'initFileExplorerContainer');
        runFirstAvailable([
            {
                fn: typeof navigateToFileExplorerDirectory === 'function' ? navigateToFileExplorerDirectory : null,
                args: [contentRoot, { updateHistory: true, explorerRoot: container }],
            },
            { fn: typeof loadFileExplorerDirectory === 'function' ? loadFileExplorerDirectory : null, args: [contentRoot] },
            { fn: typeof loadDirectory === 'function' ? loadDirectory : null, args: [contentRoot] }
        ]);
        runFirstAvailable([
            { fn: typeof initFileExplorerDnD === 'function' ? initFileExplorerDnD : null }
        ]);
        if (typeof window.bindFileExplorerNemoOps === 'function') {
            window.bindFileExplorerNemoOps();
        }
        if (typeof window.bindFileExplorerProperties === 'function') {
            window.bindFileExplorerProperties();
        }
        if (typeof window.bindFileExplorerContextMenu === 'function') {
            window.bindFileExplorerContextMenu(container);
        }
    },
    terminal: (container) => {
        runFirstAvailable([
            {
                fn: typeof initTerminalForContainer === 'function' ? initTerminalForContainer : null,
                args: [container],
            },
            { fn: typeof initTerminalWhenReady === 'function' ? initTerminalWhenReady : null },
        ], 'initTerminalForContainer');
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
    themes: (container) => {
        if (typeof initCinnamonSettingsApp === 'function' && document.getElementById('cinnamonSettingsApp')) {
            initCinnamonSettingsApp();
        } else if (typeof initKdeSettingsApp === 'function' && (
            (container && container.querySelector('[data-kde-settings-root]'))
            || document.querySelector('[data-kde-settings-root]')
            || document.getElementById('kdeSystemSettingsShell')
            || document.getElementById('kdeSystemSettingsApp')
        )) {
            if (typeof window.CapsuleKdeSystemSettings === 'object'
                && typeof window.CapsuleKdeSystemSettings.wire === 'function') {
                window.CapsuleKdeSystemSettings.wire(container);
            } else {
                initKdeSettingsApp(container);
            }
        } else if (typeof initThemesApp === 'function') {
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
    librecalc: () => {
        if (typeof initLibreCalc === 'function') {
            initLibreCalc();
        }
    },
    visionneur_images: () => {
        if (typeof initVisionneurImagesApp === 'function' && document.getElementById('visionneurImages')) {
            initVisionneurImagesApp();
        }
        runFirstAvailable([
            {
                fn: typeof renderFileViewer === 'function' ? renderFileViewer : null,
                args: ['visionneur_images']
            },
            {
                fn: typeof renderMintViewer === 'function' ? renderMintViewer : null,
                args: ['visionneur_images']
            }
        ]);
    },
    visionneur_pdf: () => {
        if (typeof initVisionneurPdfApp === 'function' && document.getElementById('visionneurPdf')) {
            initVisionneurPdfApp();
        }
        runFirstAvailable([
            {
                fn: typeof renderFileViewer === 'function' ? renderFileViewer : null,
                args: ['visionneur_pdf']
            },
            {
                fn: typeof renderMintViewer === 'function' ? renderMintViewer : null,
                args: ['visionneur_pdf']
            }
        ]);
    },
    lecteur_multimedia: () => {
        if (document.getElementById('rhythmboxApp')) {
            if (typeof initRhythmboxApp === 'function') {
                initRhythmboxApp();
            }
            return;
        }
        if (typeof initCelluloidApp === 'function') {
            initCelluloidApp();
        }
        runFirstAvailable([
            { fn: typeof renderFileViewer === 'function' ? renderFileViewer : null, args: ['lecteur_multimedia'] },
            { fn: typeof renderMintViewer === 'function' ? renderMintViewer : null, args: ['lecteur_multimedia'] }
        ]);
    },
    update_manager: () => {
        if (typeof initUpdateManagerApp === 'function') {
            initUpdateManagerApp();
        }
    },
    mintinstall: () => {
        if (typeof initMintInstallApp === 'function') {
            initMintInstallApp();
        }
    },
    system_monitor: () => {
        if (typeof initSystemMonitorApp === 'function') {
            initSystemMonitorApp();
        }
    },
    calculator: () => {
        if (typeof initCalculatorApp === 'function') {
            initCalculatorApp();
        }
    },
    clocks: () => {
        if (typeof initClocksApp === 'function') {
            initClocksApp();
        }
    },
    snapshot: () => {
        if (typeof initSnapshotApp === 'function') {
            initSnapshotApp();
        }
    },
    characters: () => {
        if (typeof initCharactersApp === 'function') {
            initCharactersApp();
        }
    },
    tour: () => {
        if (typeof initTourApp === 'function') {
            initTourApp();
        }
    },
    calendar: () => {
        if (typeof initCalendarApp === 'function') {
            initCalendarApp();
        }
    },
    screenshot: () => {
        if (typeof initScreenshotApp === 'function') {
            initScreenshotApp();
        }
    },
    spectacle: () => {
        if (typeof initSpectacleKdeNeonApp === 'function') {
            initSpectacleKdeNeonApp();
        }
    },
    kinfocenter: () => {
        if (typeof initKinfocenterKdeNeonApp === 'function') {
            initKinfocenterKdeNeonApp();
        }
    },
    drawing: () => {
        if (typeof initDrawingApp === 'function') {
            initDrawingApp();
        }
    },
    file_roller: () => {
        if (typeof initFileRollerApp === 'function') {
            initFileRollerApp();
        }
    },
    mintdrivers: () => {
        if (typeof initMintDriversApp === 'function') {
            initMintDriversApp();
        }
    },
    baobab: () => {
        if (typeof initBaobabApp === 'function') {
            initBaobabApp();
        }
    },
    webapp_manager: () => {
        if (typeof initWebappManagerApp === 'function') {
            initWebappManagerApp();
        }
    },
    sticky: () => {
        if (typeof initStickyApp === 'function') {
            initStickyApp();
        }
    },
    warpinator: () => {
        if (typeof initWarpinatorApp === 'function') {
            initWarpinatorApp();
        }
    },
    hypnotix: () => {
        if (typeof initHypnotixApp === 'function') {
            initHypnotixApp();
        }
    },
    transmission: () => {
        if (typeof initTransmissionApp === 'function') {
            initTransmissionApp();
        }
    },
    mintbackup: () => {
        if (typeof initMintbackupApp === 'function') {
            initMintbackupApp();
        }
    },
    bulky: () => {
        if (typeof initBulkyApp === 'function') {
            initBulkyApp();
        }
    },
    timeshift: () => {
        if (typeof initTimeshiftApp === 'function') {
            initTimeshiftApp();
        }
    },
    thunderbird: () => {
        if (typeof initThunderbirdApp === 'function') {
            initThunderbirdApp();
        }
    },
    mintwelcome: () => {
        if (typeof initMintwelcomeApp === 'function') {
            initMintwelcomeApp();
        }
    },
    gucharmap: () => {
        if (typeof initGucharmapApp === 'function') {
            initGucharmapApp();
        }
    },
    simple_scan: () => {
        if (typeof initSimpleScanApp === 'function') {
            initSimpleScanApp();
        }
    },
    thingy: () => {
        if (typeof initThingyApp === 'function') {
            initThingyApp();
        }
    },
    rhythmbox: () => {
        if (typeof initRhythmboxApp === 'function') {
            initRhythmboxApp();
        }
    },
    gnome_disks: () => {
        if (typeof initGnomeDisksApp === 'function') {
            initGnomeDisksApp();
        }
    },
    libreoffice_startcenter: () => {
        if (typeof initLibreofficeStartcenterApp === 'function') {
            initLibreofficeStartcenterApp();
        }
    },
    libreoffice_draw: () => {
        if (typeof initLibreofficeDrawApp === 'function') {
            initLibreofficeDrawApp();
        }
    },
    libreoffice_impress: () => {
        if (typeof initLibreofficeImpressApp === 'function') {
            initLibreofficeImpressApp();
        }
    },
    mintstick: () => {
        if (typeof initMintstickApp === 'function') {
            initMintstickApp();
        }
    },
    mintstick_format: () => {
        if (typeof initMintstickFormatApp === 'function') {
            initMintstickFormatApp();
        }
    },
    font_viewer: () => {
        if (typeof initFontViewerApp === 'function') {
            initFontViewerApp();
        }
    },
    power_stats: () => {
        if (typeof initPowerStatsApp === 'function') {
            initPowerStatsApp();
        }
    },
    mate_color_select: () => {
        if (typeof initMateColorSelectApp === 'function') {
            initMateColorSelectApp();
        }
    },
    text_editor: () => {
        if (typeof initTextEditorApp === 'function') {
            initTextEditorApp();
        }
    }
};

const injectSlot = (motionless, slotId, templateId, html, cssBase, cssSkin) => {
    const rewriteUrls = typeof rewriteCapsuleResourceUrlsInText === 'function'
        ? rewriteCapsuleResourceUrlsInText
        : (text) => text;
    const resolvedHtml = rewriteUrls(html);
    let resolvedCssBase = rewriteUrls(cssBase);
    const resolvedCssSkin = cssSkin ? rewriteUrls(cssSkin) : '';

    if (shouldSkipMainMenuBaseCss(templateId, resolvedHtml)) {
        resolvedCssBase = '';
    }

    const preservedHeader = motionless.querySelector(':scope > #windowHeader');
    const headerClone = preservedHeader ? preservedHeader.cloneNode(true) : null;

    motionless.innerHTML = resolvedHtml;

    if (headerClone) {
        motionless.insertBefore(headerClone, motionless.firstChild);
    }

    if (typeof window.applyCapsuleStrings === 'function' && typeof window !== 'undefined' && window.CAPSULE_STRINGS_MERGED) {
        window.applyCapsuleStrings(motionless, window.CAPSULE_STRINGS_MERGED);
    }

    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = resolvedCssBase + (resolvedCssSkin ? `\n${resolvedCssSkin}` : '');
    document.head.appendChild(style);

    const prepareSlotWindowChrome = (container, id) => {
        if (typeof window.CapsuleWindowChrome === 'undefined') {
            return;
        }
        window.CapsuleWindowChrome.ensureHeader(container, id);
        window.CapsuleWindowChrome.afterInject(container, id);
    };

    const finalizeSlotWindowChrome = (container, id) => {
        if (id === 'firefox'
            && typeof window.CapsuleWindowChrome !== 'undefined'
            && typeof window.CapsuleWindowChrome.syncFirefoxGnomeChrome === 'function') {
            window.CapsuleWindowChrome.syncFirefoxGnomeChrome(container);
        }
        if (typeof window.ensureWindowChromeAfterSlotInject === 'function'
            && container.style.display !== 'none') {
            window.ensureWindowChromeAfterSlotInject(container, id);
        }
    };

    prepareSlotWindowChrome(motionless, slotId);

    const initSlot = SLOT_INIT_HANDLERS[slotId];
    if (typeof initSlot === 'function') {
        initSlot(motionless, slotId, templateId);
    }

    finalizeSlotWindowChrome(motionless, slotId);

    motionless.dataset.capsuleSlotLoaded = 'true';

    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('capsule:slot-injected', {
            detail: { container: motionless, slotId: slotId, templateId: templateId },
        }));
    }
};

const loadMergedStrings = () => {
    if (typeof window.getMergedStrings === 'function') {
        return window.getMergedStrings();
    }
    const defaults = (typeof window !== 'undefined' && window.CAPSULE_STRINGS_DEFAULT) || {};
    return Promise.resolve(defaults);
};

const buildSlotLoadTask = (div) => {
    const slotId = div.getAttribute('data-link');
    const templateId = resolveTemplateId(slotId);
    const skinId = resolveSkinId(slotId, templateId);
    const appsBase = getAppsBase();
    const skinBase = getSkinBase();
    const skipDynamicSkin = shouldSkipDynamicSkinCss(slotId);
    const cssSkinFile = !skipDynamicSkin && skinBase
        ? `${skinBase}/style/apps/${skinId}.skin.css`
        : null;
    const cssSkinFallbackFile = !skipDynamicSkin && skinBase
        ? `${skinBase}/style/apps/${resolveExplorerSkinFallbackId(templateId)}.skin.css`
        : null;

    return loadSlotAssets(slotId, templateId, skinId, appsBase, skinBase, cssSkinFile, cssSkinFallbackFile)
        .then(({ html, cssBase, cssSkin }) => {
            injectSlot(div, slotId, templateId, html, cssBase, cssSkin);
        })
        .catch((error) => {
            console.error('Erreur lors du chargement des fichiers:', error);
            div.innerHTML = '<section style="padding:12px;font-family:sans-serif;">Impossible de charger ce module. Vérifiez que les fichiers de l’application sont présents ou régénérez capsule-app-embed.js (voir README).</section>';
            div.dataset.capsuleSlotLoaded = 'error';
        });
};

const ensureSlotLoaded = (slotId) => {
    if (!slotId || isSlotLoaded(slotId)) {
        return Promise.resolve();
    }
    const pending = slotLoadPromises.get(slotId);
    if (pending) {
        return pending;
    }
    const div = slotElements.get(slotId);
    if (!div) {
        return Promise.resolve();
    }
    const loadPromise = buildSlotLoadTask(div);
    slotLoadPromises.set(slotId, loadPromise);
    return loadPromise;
};

const scheduleDeferredSlotLoads = (deferredDivs) => {
    if (!deferredDivs.length) {
        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('capsule:slots-all-ready'));
        }
        return;
    }
    const batchSize = typeof window !== 'undefined' && typeof window.CAPSULE_SLOT_LOAD_BATCH === 'number'
        ? Math.max(1, window.CAPSULE_SLOT_LOAD_BATCH)
        : 4;
    let index = 0;
    const pump = () => {
        if (index >= deferredDivs.length) {
            if (typeof document !== 'undefined') {
                document.dispatchEvent(new CustomEvent('capsule:slots-all-ready'));
            }
            return;
        }
        const batch = deferredDivs.slice(index, index + batchSize);
        index += batchSize;
        Promise.all(batch.map(buildSlotLoadTask)).then(() => {
            const schedule = typeof requestIdleCallback === 'function'
                ? (fn) => requestIdleCallback(fn, { timeout: 2000 })
                : (fn) => setTimeout(fn, 32);
            schedule(pump);
        });
    };
    pump();
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

            if (shouldUseTieredSlotLoad()) {
                const priority = resolveSlotLoadPriority();
                const prioritySet = new Set(priority);
                const eagerDivs = priority
                    .map((slotId) => slotElements.get(slotId))
                    .filter(Boolean);
                const deferredDivs = Array.from(divs).filter((div) => {
                    const slotId = div.getAttribute('data-link');
                    return slotId && !prioritySet.has(slotId);
                });

                Promise.all(eagerDivs.map(buildSlotLoadTask)).then(() => {
                    if (typeof window !== 'undefined') {
                        window.CAPSULE_SLOT_LOAD_PRIORITY_READY = true;
                    }
                    if (typeof document !== 'undefined') {
                        document.dispatchEvent(new CustomEvent('capsule:slots-priority-ready'));
                    }
                    bootCapsuleWindowContext();
                    scheduleDeferredSlotLoads(deferredDivs);
                });
                return;
            }

            const slotLoads = Array.from(divs).map(buildSlotLoadTask);

            Promise.all(slotLoads).then(bootCapsuleWindowContext);
        })
        .catch((err) => {
            console.error('CapsuleOS: échec fusion des chaînes', err);
            divs.forEach((div) => {
                div.innerHTML = '<section style="padding:12px;font-family:sans-serif;">Erreur de chargement des textes.</section>';
            });
        });
};

const reloadCapsuleSlot = (container, slotId) => {
    if (!container || !slotId) {
        return Promise.reject(new Error('reloadCapsuleSlot: container ou slotId manquant'));
    }
    const templateId = resolveTemplateId(slotId);
    const skinId = resolveSkinId(slotId, templateId);
    const appsBase = getAppsBase();
    const skinBase = getSkinBase();
    const skipDynamicSkin = shouldSkipDynamicSkinCss(slotId);
    const cssSkinFile = !skipDynamicSkin && skinBase
        ? `${skinBase}/style/apps/${skinId}.skin.css`
        : null;
    const cssSkinFallbackFile = !skipDynamicSkin && skinBase
        ? `${skinBase}/style/apps/${resolveExplorerSkinFallbackId(templateId)}.skin.css`
        : null;

    return loadSlotAssets(slotId, templateId, skinId, appsBase, skinBase, cssSkinFile, cssSkinFallbackFile)
        .then(({ html, cssBase, cssSkin }) => {
            injectSlot(container, slotId, templateId, html, cssBase, cssSkin);
        });
};

if (typeof window !== 'undefined') {
    window.reloadCapsuleSlot = reloadCapsuleSlot;
    window.CapsuleSlotLoader = {
        ensureSlotLoaded,
        isSlotLoaded,
    };
}

const bootCapsuleContentLoad = () => {
    if (typeof window !== 'undefined' && window.CAPSULE_SKIN_PROFILE_APPLIED) {
        startCapsuleContentLoad();
        return;
    }
    if (typeof document !== 'undefined') {
        document.addEventListener('capsule-skin-ready', () => {
            startCapsuleContentLoad();
        }, { once: true });
        return;
    }
    startCapsuleContentLoad();
};

if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootCapsuleContentLoad);
} else {
    setTimeout(bootCapsuleContentLoad, 0);
}

(function ensureSeLayerBusScripts(global) {
    if (typeof global.document === 'undefined') {
        return;
    }
    const queue = [
        { src: '../../../usr/lib/capsuleos/core/capsule-a11y.js', marker: 'capsule-a11y.js' },
        { src: '../../../usr/lib/capsuleos/shells/linux/se-toolkit-guards.js', marker: 'se-toolkit-guards.js' },
        { src: '../../../usr/lib/capsuleos/shells/linux/se-a11y-bus.js', marker: 'se-a11y-bus.js' },
        { src: '../../../usr/lib/capsuleos/shells/linux/se-shell-bus.js', marker: 'se-shell-bus.js' },
        { src: '../../../usr/lib/capsuleos/shells/linux/se-wm-bus.js', marker: 'se-wm-bus.js' },
    ];
    const scripts = global.document.getElementsByTagName('script');
    const hasMarker = (marker) => {
        for (let i = 0; i < scripts.length; i += 1) {
            if (scripts[i].src && scripts[i].src.indexOf(marker) >= 0) {
                return true;
            }
        }
        return false;
    };
    queue.forEach((entry) => {
        if (hasMarker(entry.marker)) {
            return;
        }
        const tag = global.document.createElement('script');
        tag.src = entry.src;
        tag.async = false;
        global.document.head.appendChild(tag);
    });
}(typeof window !== 'undefined' ? window : globalThis));
