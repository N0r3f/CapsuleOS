/**
 * Résolution vendor → chemins logiques assets (runtime navigateur).
 * Miroir de vendor-icon-resolution-lib.mjs — ES6 strict (pas de syntaxe moderne interdite).
 */
(function initVendorIconResolution(global) {
  'use strict';

  var VENDOR_SLUG_ALIASES = {
    anduinos: 'anduin',
    'linux-anduinos': 'anduin',
    linuxmint: 'mint',
    'linux-mint': 'mint',
    'mx-kde': 'mx',
    'linux-mx-kde': 'mx',
    'kde-neon': 'neon',
    'linux-kde-neon': 'neon',
    pop_os: 'popos',
    'linux-popos': 'popos',
    rhel: 'rocky',
    almalinux: 'alma',
    'linux-alma': 'alma',
    'linux-rocky': 'rocky',
    redhat: 'fedora',
    generic: 'debian',
    lineage: 'debian',
    manjaro: 'debian',
    zorin: 'debian',
    kali: 'debian',
    valve: 'debian',
    nixos: 'debian',
    slackware: 'debian',
    gentoo: 'debian',
    alpine: 'debian',
    arch: 'arch',
    elementary: 'elementary',
    freebsd: 'debian',
    openbsd: 'debian',
    netbsd: 'debian',
    ghostbsd: 'debian',
    haiku: 'debian',
    reactos: 'debian',
    qnx: 'debian',
    windriver: 'debian',
    minix: 'debian',
    huawei: 'debian',
    oracle: 'debian',
  };

  var LOGO_BY_SLUG = {
    mint: 'logo.svg',
    ubuntu: 'ubuntu-logo.svg',
    fedora: 'fedora-logo.svg',
    debian: 'debian-logo.svg',
    mx: 'mx-logo.png',
    opensuse: 'opensuse-logo.svg',
    popos: 'pop-logo.png',
    anduin: 'anduin-logo.svg',
    rocky: 'rocky-logo.svg',
    alma: 'alma-logo.svg',
    neon: 'neon-logo.svg',
    arch: 'logo.png',
    elementary: 'logo.png',
  };

  var resolveVendorSlug = function resolveVendorSlug(entry) {
    var vendor = entry && entry.vendor ? entry.vendor : '';
    var id = entry && entry.id ? entry.id : '';
    if (vendor && LOGO_BY_SLUG[vendor]) {
      return vendor;
    }
    if (vendor && VENDOR_SLUG_ALIASES[vendor]) {
      return VENDOR_SLUG_ALIASES[vendor];
    }
    var fromId = id.replace(/^(linux|windows|macos|android|ios)-/, '');
    if (fromId && VENDOR_SLUG_ALIASES[fromId]) {
      return VENDOR_SLUG_ALIASES[fromId];
    }
    if (fromId && LOGO_BY_SLUG[fromId]) {
      return fromId;
    }
    return vendor || fromId || 'debian';
  };

  var resolveAboutLogoLogical = function resolveAboutLogoLogical(entry) {
    var slug = resolveVendorSlug(entry);
    var file = LOGO_BY_SLUG[slug];
    if (!file) {
      return null;
    }
    return './assets/images/vendors/' + slug + '/' + file;
  };

  var resolveAboutLogoUrl = function resolveAboutLogoUrl(entry) {
    var logical = resolveAboutLogoLogical(entry);
    if (!logical) {
      return null;
    }
    if (typeof global.resolveCapsuleResourceUrl === 'function') {
      return global.resolveCapsuleResourceUrl(logical);
    }
    return logical;
  };

  global.VendorIconResolution = {
    VENDOR_SLUG_ALIASES: VENDOR_SLUG_ALIASES,
    LOGO_BY_SLUG: LOGO_BY_SLUG,
    resolveVendorSlug: resolveVendorSlug,
    resolveAboutLogoLogical: resolveAboutLogoLogical,
    resolveAboutLogoUrl: resolveAboutLogoUrl,
  };
}(typeof window !== 'undefined' ? window : globalThis));
