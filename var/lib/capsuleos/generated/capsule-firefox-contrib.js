/**
 * Pack contrib Firefox Mozilla (généré).
 * Source : usr/share/capsuleos/contrib/internet/browser/mozilla/firefox/
 * Regénérer : node usr/lib/capsuleos/tools/build-firefox-contrib-bundle.mjs
 */
(function initCapsuleFirefoxContrib(global) {
  'use strict';
  global.CAPSULE_FIREFOX_CONTRIB = {
  "manifest": {
    "id": "contrib-firefox-mozilla",
    "slotId": "firefox",
    "category": "internet/browser",
    "vendor": "mozilla",
    "name": "firefox",
    "labelFr": "Firefox",
    "version": 1,
    "license": "GPL-3.0-or-later",
    "description": "Pack contrib navigateur Firefox — moteur de recherche, favoris et index web simulé.",
    "kernel": "usr/lib/capsuleos/shells/linux/firefoxBrowser.js",
    "template": "usr/share/capsuleos/linux/apps/firefox.html",
    "webIndexContract": "etc/capsuleos/contracts/simulated-web-index.json"
  },
  "searchEngine": {
    "defaultEngine": "google",
    "engines": {
      "google": {
        "siteId": "search-google",
        "queryParam": "q",
        "placeholderFr": "Rechercher avec Google ou saisir une adresse"
      }
    }
  },
  "bookmarks": [
    {
      "labelFr": "Importés",
      "route": "noop"
    },
    {
      "labelFr": "La Capsule",
      "route": "lacapsule",
      "primary": true
    },
    {
      "labelFr": "os-lacapsule",
      "route": "os-lacapsule"
    }
  ],
  "newtabShortcuts": [
    {
      "key": "amazon",
      "labelFr": "Amazon",
      "siteId": "amazon-fr",
      "sponsored": true
    },
    {
      "key": "temu",
      "labelFr": "Temu",
      "siteId": "temu",
      "sponsored": true
    },
    {
      "key": "aliexpress",
      "labelFr": "AliExpress",
      "siteId": "aliexpress-fr",
      "sponsored": true
    },
    {
      "key": "wikipedia",
      "labelFr": "Wikipédia",
      "siteId": "wikipedia-fr"
    },
    {
      "key": "youtube",
      "labelFr": "YouTube",
      "siteId": "youtube"
    },
    {
      "key": "lemonde",
      "labelFr": "Le Monde",
      "siteId": "lemonde"
    },
    {
      "key": "reddit",
      "labelFr": "Reddit",
      "siteId": "reddit"
    }
  ],
  "locale": "fr-FR"
};
}(typeof window !== 'undefined' ? window : globalThis));
