/**
 * URL d'accueil portail — généré (ne pas éditer à la main).
 * Mode : dev
 * Regénérer : make site-home MODE=dev
 *           node usr/lib/capsuleos/tools/build-portal-site-home.mjs dev
 */
(function (global) {
    'use strict';
    global.CAPSULE_PORTAL_MODE = "dev";
    global.CAPSULE_PORTAL_SITE_HOME = "../../../index.html";
    global.CAPSULE_PORTAL_ENTITLEMENT = null;
    global.CAPSULE_PORTAL_LOGIN_FAILURE_MSG = "Connexion impossible. Vérifiez vos identifiants et réessayez.";
    global.CAPSULE_PORTAL_DEV_EMAIL = "abonne@capsuleos.local";
    global.CAPSULE_PORTAL_DEV_DISPLAY_NAME = "Abonné";
    global.CAPSULE_PORTAL_DEV_PASSWORD = "test123456789";
    global.CAPSULE_PORTAL_DEV_USER = "abonne@capsuleos.local";
    global.CAPSULE_PORTAL_PERMISSIONS = { storeBrowse: true, storeAppLaunch: true, osQuotaUnlimited: true };
}(typeof window !== 'undefined' ? window : globalThis));
