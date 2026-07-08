/**
 * Shim compat — délègue à CapsuleResource (charger capsule-resource.js avant).
 */
(function initCapsuleResourceUrlShim(global) {
  'use strict';
  if (typeof CapsuleResource === 'undefined') {
    console.warn('CapsuleOS: charger capsule-resource.js avant capsule-resource-url.js');
    return;
  }
  if (typeof global.resolveCapsuleResourceUrl !== 'function') {
    global.resolveCapsuleResourceUrl = (url) => CapsuleResource.resolve(url);
    global.rewriteCapsuleResourceUrlsInText = (text) => CapsuleResource.rewriteInText(text);
  }

  function basenamePath(url) {
    var parts = String(url || '').split('/');
    return parts[parts.length - 1] || '';
  }

  function leafHasExtension(url) {
    return /\.(png|svg|webp|jpg|jpeg|gif|xpm|ico)$/i.test(String(url || ''));
  }

  var PNG_TOOLKIT_APP_RE = /^(com\.github\.maoschanz\.drawing|io\.github\.celluloid_player\.Celluloid|org\.freedesktop\.IBus\.Setup|org\.gnome\.FileRoller|org\.gnome\.PowerStats|org\.gnome\.SystemMonitor)$/;

  function inferIconUrl(url) {
    if (!url || typeof url !== 'string' || leafHasExtension(url)) {
      return url;
    }
    if (url.indexOf('/vendors/mint/panel/') >= 0) {
      return url + '.webp';
    }
    if (url.indexOf('/icons/cinnamon/cs/') >= 0) {
      return url + '.png';
    }
    if (url.indexOf('/toolkits/') >= 0 && url.indexOf('/apps/') >= 0) {
      var leaf = basenamePath(url);
      var extMap = global.CAPSULE_CINNAMON_APP_RASTER_EXT;
      if (extMap && extMap[leaf]) {
        return url + '.' + extMap[leaf];
      }
      if (PNG_TOOLKIT_APP_RE.test(leaf)) {
        return url + '.png';
      }
      return url + '.svg';
    }
    if (url.indexOf('/icons/') >= 0) {
      return url + '.svg';
    }
    if (url.indexOf('/images/') >= 0) {
      return url + '.png';
    }
    return url;
  }

  if (typeof global.resolveCapsuleAssetUrl !== 'function') {
    global.resolveCapsuleAssetUrl = (url) => global.resolveCapsuleResourceUrl(inferIconUrl(url));
  }
  global.inferCapsuleIconUrl = inferIconUrl;
  global.getCapsuleAssetsBase = () => CapsuleResource.getAssetsBase();
  global.getCapsuleMediaBase = () => CapsuleResource.getMediaBase();
  global.getCapsuleKdeIconsBase = () => CapsuleResource.getPackBase('icons/kde');
  global.getCapsuleGnomeIconsBase = () => CapsuleResource.getPackBase('icons/gnome');
  global.getCapsuleCinnamonIconsBase = () => CapsuleResource.getPackBase('icons/cinnamon');
}(typeof window !== 'undefined' ? window : globalThis));
