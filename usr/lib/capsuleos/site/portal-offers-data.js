/**
 * Généré depuis etc/capsuleos/contracts/portal-offers.json
 * Regénérer : node usr/lib/capsuleos/tools/build-portal-offers.mjs
 */
'use strict';
(function (global) {
    global.CapsulePortalOffers = {"version":1,"doc":"root/docs/convention-portail.md","currency":"EUR","sectionTitle":"Choisir votre formule","sectionLead":"Essayez tous les systèmes gratuitement (15 min par session) ou apprenez avec le parcours guidé Abonné.","plans":[{"id":"free","label":"Gratuit","priceMonthly":0,"priceDisplay":"0 €","featured":false,"entitlementLevel":"anonymous","features":["Tous les bureaux simulés du catalogue","15 minutes maximum par session","Sans compte requis","Utilisation hors ligne"],"cta":{"label":"Essayer un système","href":"#choisir-os","requiresAuth":false}},{"id":"subscriber","label":"Abonné","priceMonthly":15,"priceDisplay":"15 €","featured":true,"entitlementLevel":"subscriber","features":["Parcours pédagogique complet (3 niveaux)","Chapitres, quêtes et progression sauvegardée","Sessions OS illimitées","Tous les systèmes du catalogue"],"cta":{"label":"S'abonner","href":"portal/subscribe.php","requiresAuth":true,"fallbackHref":"portal/register.php"}}]};
}(typeof window !== 'undefined' ? window : globalThis));
