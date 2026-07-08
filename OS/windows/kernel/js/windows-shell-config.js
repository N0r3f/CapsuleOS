/**
 * Configuration du bureau Windows simulé (CapsuleOS).
 *
 * Définir sur `window` **avant** les scripts noyau dans chaque
 * `OS/windows/versions/<version>/index.html`.
 *
 * Ordre recommandé : bloc CAPSULE_WIN_* → capsule-windows-embed.js (généré, optionnel)
 * → scripts noyau kernel/js/*.js → scripts skin (demarrer.js, …).
 *
 * @property {string} CAPSULE_WIN_VERSION  Identifiant version : 95, 98, me, 2000, xp, vista, 7, 8, 8.1, 10, 11
 * @property {string} CAPSULE_WIN_SHELL  Famille UI : classic, classic-nt, luna, aero-glass, aero-7, metro, metro-81, modern, modern-11
 * @property {string} CAPSULE_WIN_START_STYLE  classic | orb | centered | fullscreen-tiles
 * @property {string} CAPSULE_WIN_APPS_BASE  Chemin vers shared/apps (HTML gabarits)
 * @property {string} CAPSULE_WIN_PAGES_BASE  Chemin vers shared/pages (iframe apps)
 * @property {string} CAPSULE_WIN_CONTENT_ROOT  Racine contenu pédagogique simulé
 * @property {string} CAPSULE_WIN_SKIN_BASE  Répertoire skin (souvent .)
 * @property {string} CAPSULE_WIN_HUB  Chemin hub Windows (OS/windows/index.html)
 * @property {string} CAPSULE_WIN_SITE_HOME  Accueil CapsuleOS (iframe navigateur simulé)
 * @property {boolean} [CAPSULE_FORCE_WIN_EMBED]  Forcer embed même en HTTP
 */
'use strict';
