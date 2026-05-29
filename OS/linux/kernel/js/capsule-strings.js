/**
 * Fusion des chaînes par défaut avec les surcharges skin + application dans le DOM.
 */

function mergeCapsuleStrings(defaults, overrides) {
    const out = { ...(defaults || {}) };
    if (overrides && typeof overrides === 'object') {
        Object.keys(overrides).forEach((k) => {
            if (overrides[k] !== undefined && overrides[k] !== null) {
                out[k] = overrides[k];
            }
        });
    }
    return out;
}

let mergedStringsPromise = null;

function getMergedStrings() {
    if (mergedStringsPromise) {
        return mergedStringsPromise;
    }

    mergedStringsPromise = (async () => {
        const defaults = (typeof window !== 'undefined' && window.CAPSULE_STRINGS_DEFAULT) || {};
        let overrides = {};

        if (typeof window !== 'undefined' && window.CAPSULE_STRINGS_INLINE && typeof window.CAPSULE_STRINGS_INLINE === 'object') {
            overrides = mergeCapsuleStrings(overrides, window.CAPSULE_STRINGS_INLINE);
        }

        const isFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';
        if (isFileProtocol) {
            const embedKey = typeof window !== 'undefined' && window.CAPSULE_EMBED_SKIN_KEY
                ? String(window.CAPSULE_EMBED_SKIN_KEY)
                : '';
            const embedStrings = typeof window !== 'undefined'
                && window.CAPSULE_EMBED_STRINGS
                && embedKey
                && window.CAPSULE_EMBED_STRINGS[embedKey];
            if (embedStrings && typeof embedStrings === 'object') {
                overrides = mergeCapsuleStrings(overrides, embedStrings);
            }
        }

        if (!isFileProtocol) {
            const url = (typeof window !== 'undefined' && window.CAPSULE_STRINGS_URL) || './content/strings.json';
            try {
                const response = await fetch(url, { cache: 'no-store' });
                if (response.ok) {
                    const json = await response.json();
                    if (json && typeof json === 'object') {
                        overrides = mergeCapsuleStrings(overrides, json);
                    }
                }
            } catch (e) {
                /* hors ligne ou fichier absent : garder les défauts */
            }
        }

        return mergeCapsuleStrings(defaults, overrides);
    })();

    return mergedStringsPromise;
}

function buildWindowTitles(merged) {
    const m = merged || {};
    const explorerDisplayName = (typeof window !== 'undefined' && window.CAPSULE_EXPLORER_DISPLAY_NAME)
        ? String(window.CAPSULE_EXPLORER_DISPLAY_NAME)
        : 'Fichiers';
    return {
        nemo: m['explorer.windowTitle'] || `Dossier personnel - ${explorerDisplayName}`,
        firefox: m['firefox.windowTitle'] || 'Navigateur Web',
        profile: m['profile.windowTitle'] || 'À Propos',
        librewriter: m['librewriter.windowTitle'] || 'Sans nom 1 - LibreOffice Writer',
        terminal: m['terminal.windowTitle'] || 'Terminal',
        update_manager: m['update_manager.windowTitle'] || 'Gestionnaire de mise à jour',
        themes: m['themes.windowTitle'] || 'Thèmes',
        checklist: m['checklist.windowTitle'] || 'Missions',
        mainMenu: m['mainMenu.windowTitle'] || 'Menu',
        visionneur_images: m['visionneur_images.windowTitle'] || 'Visionneur d\'images',
        visionneur_pdf: m['visionneur_pdf.windowTitle'] || 'Visionneur PDF',
        lecteur_multimedia: m['lecteur_multimedia.windowTitle'] || 'Lecteur multimédia'
    };
}

function applyCapsuleStrings(root, merged) {
    if (!root || !merged) {
        return;
    }

    root.querySelectorAll('[data-capsule-text]').forEach((el) => {
        const key = el.getAttribute('data-capsule-text');
        if (key && merged[key] !== undefined) {
            el.textContent = merged[key];
        }
    });

    root.querySelectorAll('[data-capsule-attr]').forEach((el) => {
        const raw = el.getAttribute('data-capsule-attr');
        if (!raw || !merged) {
            return;
        }
        const parts = raw.split('|');
        parts.forEach((part) => {
            const [attr, key] = part.split(':').map((s) => s && s.trim());
            if (attr && key && merged[key] !== undefined) {
                el.setAttribute(attr, merged[key]);
            }
        });
    });
}

function getResolvedWindowTitle(dataLink) {
    const wt = typeof window !== 'undefined' && window.CAPSULE_WINDOW_TITLES;
    if (wt && wt[dataLink]) {
        return wt[dataLink];
    }
    return null;
}

window.mergeCapsuleStrings = mergeCapsuleStrings;
window.getMergedStrings = getMergedStrings;
window.buildWindowTitles = buildWindowTitles;
window.applyCapsuleStrings = applyCapsuleStrings;
window.getResolvedWindowTitle = getResolvedWindowTitle;
