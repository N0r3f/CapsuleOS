/**
 * Résolution des chemins ./media/ et ./assets/ pour les skins dérivées
 * (ex. Ubuntu réutilise les médias Mint via CAPSULE_MEDIA_BASE).
 */
const getCapsuleMediaBase = () => {
    if (typeof window !== 'undefined' && window.CAPSULE_MEDIA_BASE) {
        return String(window.CAPSULE_MEDIA_BASE).replace(/\/+$/, '');
    }
    return './media';
};

const getCapsuleAssetsBase = () => {
    if (typeof window !== 'undefined' && window.CAPSULE_ASSETS_BASE) {
        return String(window.CAPSULE_ASSETS_BASE).replace(/\/+$/, '');
    }
    return './assets';
};

const resolveCapsuleResourceUrl = (url) => {
    if (!url || typeof url !== 'string') {
        return url;
    }
    if (url.startsWith('./media/')) {
        return `${getCapsuleMediaBase()}/${url.slice('./media/'.length)}`;
    }
    if (url.startsWith('./assets/')) {
        return `${getCapsuleAssetsBase()}/${url.slice('./assets/'.length)}`;
    }
    return url;
};

const rewriteCapsuleResourceUrlsInText = (text) => {
    if (!text || typeof text !== 'string') {
        return text;
    }
    const mediaBase = getCapsuleMediaBase();
    const assetsBase = getCapsuleAssetsBase();
    if (mediaBase === './media' && assetsBase === './assets') {
        return text;
    }
    return text
        .split('./media/')
        .join(`${mediaBase}/`)
        .split('./assets/')
        .join(`${assetsBase}/`);
};

if (typeof window !== 'undefined') {
    window.getCapsuleMediaBase = getCapsuleMediaBase;
    window.getCapsuleAssetsBase = getCapsuleAssetsBase;
    window.resolveCapsuleResourceUrl = resolveCapsuleResourceUrl;
    window.rewriteCapsuleResourceUrlsInText = rewriteCapsuleResourceUrlsInText;
}
