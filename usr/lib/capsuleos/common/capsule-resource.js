/**
 * CapsuleResource — résolution logique → physique des assets (manifest-driven).
 * Requiert capsule-assets-manifest.js (file://) ou fetch HTTP en dev.
 */
(function initCapsuleResource(global) {
  'use strict';

  const DEFAULT_MANIFEST = {
    logicalPrefixes: [
      { prefix: './media/', resolver: 'CAPSULE_TOOLKIT_ASSETS_BASE' },
      { prefix: './assets/', resolver: 'CAPSULE_ASSETS_BASE' },
      { prefix: './icons/kde/', resolver: 'CAPSULE_KDE_ICONS_BASE', pack: 'icons/kde' },
      { prefix: './icons/cinnamon/', resolver: 'CAPSULE_CINNAMON_ICONS_BASE', pack: 'icons/cinnamon' },
      { prefix: './icons/gnome/', resolver: 'CAPSULE_GNOME_ICONS_BASE', pack: 'icons/gnome' },
      { prefix: './icons/common/', resolver: 'CAPSULE_ASSETS_BASE', pack: 'icons/common' },
    ],
    packs: {
      'icons/kde': { path: 'icons/kde', global: 'CAPSULE_KDE_ICONS_BASE', fallback: 'icons/common' },
      'icons/cinnamon': { path: 'icons/cinnamon', global: 'CAPSULE_CINNAMON_ICONS_BASE' },
      'icons/gnome': { path: 'icons/gnome', global: 'CAPSULE_GNOME_ICONS_BASE' },
      'icons/common': { path: 'icons/common', global: 'CAPSULE_ASSETS_BASE' },
    },
  };

  const getManifest = () => global.CAPSULE_ASSETS_MANIFEST || DEFAULT_MANIFEST;

  const trimBase = (base) => String(base || '').replace(/\/+$/, '');

  const getGlobalBase = (resolverName) => {
    if (!resolverName || typeof global[resolverName] === 'undefined') {
      return null;
    }
    return trimBase(global[resolverName]);
  };

  const getAssetsBase = () => {
    const fromGlobal = getGlobalBase('CAPSULE_ASSETS_BASE');
    if (fromGlobal) {
      return fromGlobal;
    }
    return './assets';
  };

  const getToolkitAssetsBase = () => getGlobalBase('CAPSULE_TOOLKIT_ASSETS_BASE');

  /** @deprecated Préférer CAPSULE_TOOLKIT_ASSETS_BASE et ./assets/… */
  const getMediaBase = () =>
    getToolkitAssetsBase() || getGlobalBase('CAPSULE_MEDIA_BASE') || null;

  const getPackBase = (packId) => {
    const manifest = getManifest();
    const pack =(manifest.packs == null ? void 0 : manifest.packs[packId]);
    if (!pack) {
      return null;
    }
    if (pack.global) {
      const resolved = getGlobalBase(pack.global);
      if (resolved) {
        return resolved;
      }
    }
    const assetsBase = getAssetsBase();
    if (pack.path && assetsBase) {
      return `${assetsBase}/${pack.path}`;
    }
    return null;
  };

  const resolvePrefix = (url) => {
    const manifest = getManifest();
    const prefixes = [...(manifest.logicalPrefixes || [])].sort(
      (a, b) => b.prefix.length - a.prefix.length
    );
    for (let i = 0; i < prefixes.length; i += 1) {
      const entry = prefixes[i];
      if (!url.startsWith(entry.prefix)) {
        continue;
      }
      const tail = url.slice(entry.prefix.length);
      let base = getGlobalBase(entry.resolver);
      if (!base && entry.pack) {
        base = getPackBase(entry.pack);
      }
      if (!base && entry.resolver === 'CAPSULE_ASSETS_BASE') {
        base = getAssetsBase();
      }
      if (!base && entry.resolver === 'CAPSULE_TOOLKIT_ASSETS_BASE') {
        base = getToolkitAssetsBase();
      }
      if (!base && entry.resolver === 'CAPSULE_MEDIA_BASE') {
        base = getMediaBase();
      }
      if (base) {
        return `${base}/${tail}`;
      }
    }
    return url;
  };

  const resolve = (url) => {
    if (!url || typeof url !== 'string') {
      return url;
    }
    if (/^(https?:|data:|blob:|\/\/)/.test(url)) {
      return url;
    }
    return resolvePrefix(url);
  };

  const rewriteInText = (text) => {
    if (!text || typeof text !== 'string') {
      return text;
    }
    const manifest = getManifest();
    let out = text;
    (manifest.logicalPrefixes || []).forEach((entry) => {
      const base = getGlobalBase(entry.resolver)
        || (entry.pack ? getPackBase(entry.pack) : null)
        || (entry.resolver === 'CAPSULE_ASSETS_BASE' ? getAssetsBase() : null)
        || (entry.resolver === 'CAPSULE_TOOLKIT_ASSETS_BASE' ? getToolkitAssetsBase() : null)
        || (entry.resolver === 'CAPSULE_MEDIA_BASE' ? getMediaBase() : null);
      if (base && base !== entry.prefix.replace(/\/$/, '')) {
        out = out.split(entry.prefix).join(`${base}/`);
      }
    });
    return out;
  };

  const applyProfileAssets = (profile) => {
    if (!(profile == null ? void 0 : profile.assets)) {
      return;
    }
    const { assets } = profile;
    if (assets.assetsBase) {
      global.CAPSULE_ASSETS_BASE = assets.assetsBase;
    }
    if (assets.kdeIconsBase) {
      global.CAPSULE_KDE_ICONS_BASE = assets.kdeIconsBase;
    }
    if (assets.gnomeIconsBase) {
      global.CAPSULE_GNOME_ICONS_BASE = assets.gnomeIconsBase;
    }
    if (assets.cinnamonIconsBase) {
      global.CAPSULE_CINNAMON_ICONS_BASE = assets.cinnamonIconsBase;
    }
    if (assets.pickOsIconsBase) {
      global.CAPSULE_PICK_OS_ICONS_BASE = assets.pickOsIconsBase;
    }
    if (Array.isArray(assets.iconPacks)) {
      global.CAPSULE_SKIN_PROFILE_ICON_PACKS = assets.iconPacks.slice();
      assets.iconPacks.forEach((packId) => {
        const pack =(getManifest().packs == null ? void 0 : getManifest().packs[packId]);
        if ((pack == null ? void 0 : pack.global) && assets.assetsBase && pack.path) {
          global[pack.global] = `${trimBase(assets.assetsBase)}/${pack.path}`;
        }
      });
    }
    if (assets.toolkitPack && assets.assetsBase) {
      global.CAPSULE_TOOLKIT_ASSETS_BASE = `${trimBase(assets.assetsBase)}/images/${assets.toolkitPack}`;
    }
  };

  const CapsuleResource = {
    getManifest,
    getAssetsBase,
    getToolkitAssetsBase,
    getMediaBase,
    getPackBase,
    resolve,
    rewriteInText,
    applyProfileAssets,
  };

  global.CapsuleResource = CapsuleResource;
  global.getCapsuleMediaBase = getMediaBase;
  global.getCapsuleAssetsBase = getAssetsBase;
  global.getCapsuleKdeIconsBase = () => getPackBase('icons/kde');
  global.getCapsuleGnomeIconsBase = () => getPackBase('icons/gnome');
  global.getCapsuleCinnamonIconsBase = () => getPackBase('icons/cinnamon');
  global.resolveCapsuleResourceUrl = resolve;
  global.rewriteCapsuleResourceUrlsInText = rewriteInText;
}(typeof window !== 'undefined' ? window : globalThis));
