/**
 * Applique skin.profile.json (embed offline ou fetch HTTP).
 * Ordre : user-home.js → capsule-assets-manifest.js → capsule-skin-profiles.js → capsule-resource.js → capsule-skin-boot.js
 */
(function initCapsuleSkinBoot(global) {
  'use strict';

  const applyGlobals = (profile) => {
    if (!profile) {
      return null;
    }
    if (profile.capsuleGlobals && typeof profile.capsuleGlobals === 'object') {
      Object.keys(profile.capsuleGlobals).forEach((key) => {
        global[key] = profile.capsuleGlobals[key];
      });
    }
    if (profile.bodyId &&(global.document == null ? void 0 : global.document.body) && !global.document.body.id) {
      global.document.body.id = profile.bodyId;
    }
    if (typeof CapsuleResource !== 'undefined' && CapsuleResource.applyProfileAssets) {
      CapsuleResource.applyProfileAssets(profile);
    } else if ((profile.assets == null ? void 0 : profile.assets.assetsBase)) {
      console.warn('CapsuleOS: charger capsule-resource.js avant capsule-skin-boot.js');
    }
    if ((profile.paths == null ? void 0 : profile.paths.skin)) {
      global.CAPSULE_SKIN_BASE = global.CAPSULE_SKIN_BASE || '.';
    }
    global.CAPSULE_SKIN_PROFILE_APPLIED = profile.id || profile.bodyId || true;
    return profile;
  };

  const resolveProfileId = () => {
    if (global.CAPSULE_SKIN_PROFILE_ID) {
      return global.CAPSULE_SKIN_PROFILE_ID;
    }
    const bodyId =((global.document == null ? void 0 : global.document.body) == null ? void 0 : (global.document == null ? void 0 : global.document.body).id);
    if (bodyId &&(global.CAPSULE_SKIN_PROFILES == null ? void 0 : global.CAPSULE_SKIN_PROFILES[bodyId])) {
      return bodyId;
    }
    if (bodyId && global.CAPSULE_SKIN_PROFILES_BY_ID) {
      const match = Object.keys(global.CAPSULE_SKIN_PROFILES_BY_ID).find(
        (id) =>(global.CAPSULE_SKIN_PROFILES_BY_ID[id] == null ? void 0 : global.CAPSULE_SKIN_PROFILES_BY_ID[id].bodyId) === bodyId
      );
      if (match) {
        return match;
      }
    }
    return bodyId || null;
  };

  const bootFromEmbed = () => {
    const profileId = resolveProfileId();
    if (!profileId) {
      return null;
    }
    const profile =(global.CAPSULE_SKIN_PROFILES == null ? void 0 : global.CAPSULE_SKIN_PROFILES[profileId])
      ||(global.CAPSULE_SKIN_PROFILES_BY_ID == null ? void 0 : global.CAPSULE_SKIN_PROFILES_BY_ID[profileId]);
    return applyGlobals(profile);
  };

  const bootFromFetch = async () => {
    const url = global.CAPSULE_SKIN_PROFILE_URL || './skin.profile.json';
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        return bootFromEmbed();
      }
      const profile = await response.json();
      return applyGlobals(profile);
    } catch (error) {
      return bootFromEmbed();
    }
  };

  const runBoot = () => {
    const embedded = bootFromEmbed();
    if (embedded || global.CAPSULE_SKIN_BOOT_FETCH !== true) {
      global.dispatchEvent(new CustomEvent('capsule-skin-ready', { detail: embedded }));
      return Promise.resolve(embedded);
    }
    return bootFromFetch().then((profile) => {
      global.dispatchEvent(new CustomEvent('capsule-skin-ready', { detail: profile }));
      return profile;
    });
  };

  const canResolveProfileNow = () => {
    if (global.CAPSULE_SKIN_PROFILE_ID) {
      return true;
    }
    const body = global.document && global.document.body;
    return !!(body && body.id);
  };

  const start = () => {
    const doc = global.document;
    if (doc && !canResolveProfileNow() && doc.readyState === 'loading') {
      return new Promise((resolve) => {
        doc.addEventListener('DOMContentLoaded', () => {
          resolve(runBoot());
        }, { once: true });
      });
    }
    return runBoot();
  };

  global.CapsuleSkinBoot = { applyGlobals, start, bootFromEmbed };
  start();
}(typeof window !== 'undefined' ? window : globalThis));
