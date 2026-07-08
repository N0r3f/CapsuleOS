/**
 * Index internet simulé CapsuleOS (généré).
 * Sources : etc/capsuleos/contracts/simulated-web-index.json · usr/share/capsuleos/web/<siteId>/site.json
 * Regénérer : node usr/lib/capsuleos/tools/build-simulated-web-index.mjs
 */
(function initCapsuleSimulatedWebIndex(global) {
  'use strict';
  global.CAPSULE_SIMULATED_WEB_INDEX = {
  "version": 1,
  "doc": "root/docs/convention-contrib-apps.md",
  "defaultSearchEngine": "google",
  "webRoot": "usr/share/capsuleos/web",
  "hosts": {
    "lacapsule.org": {
      "type": "web",
      "siteId": "lacapsule"
    },
    "os.lacapsule.org": {
      "type": "web",
      "siteId": "lacapsule"
    },
    "linuxmint.com": {
      "type": "web",
      "siteId": "linuxmint"
    },
    "www.linuxmint.com": {
      "type": "web",
      "siteId": "linuxmint"
    },
    "fr.wikipedia.org": {
      "type": "web",
      "siteId": "wikipedia-fr"
    },
    "wikipedia.org": {
      "type": "web",
      "siteId": "wikipedia-fr"
    },
    "amazon.fr": {
      "type": "web",
      "siteId": "amazon-fr"
    },
    "www.amazon.fr": {
      "type": "web",
      "siteId": "amazon-fr"
    },
    "temu.com": {
      "type": "web",
      "siteId": "temu"
    },
    "www.temu.com": {
      "type": "web",
      "siteId": "temu"
    },
    "youtube.com": {
      "type": "web",
      "siteId": "youtube"
    },
    "www.youtube.com": {
      "type": "web",
      "siteId": "youtube"
    },
    "reddit.com": {
      "type": "web",
      "siteId": "reddit"
    },
    "www.reddit.com": {
      "type": "web",
      "siteId": "reddit"
    },
    "aliexpress.com": {
      "type": "web",
      "siteId": "aliexpress-fr"
    },
    "fr.aliexpress.com": {
      "type": "web",
      "siteId": "aliexpress-fr"
    },
    "www.aliexpress.com": {
      "type": "web",
      "siteId": "aliexpress-fr"
    },
    "lemonde.fr": {
      "type": "web",
      "siteId": "lemonde"
    },
    "www.lemonde.fr": {
      "type": "web",
      "siteId": "lemonde"
    },
    "search.capsuleos.local": {
      "type": "web",
      "siteId": "search-google"
    }
  },
  "searchEngines": {
    "google": {
      "siteId": "search-google",
      "queryParam": "q",
      "labelFr": "Google"
    }
  },
  "sites": {
    "lacapsule": {
      "favicon": "toolkits/firefox/newtab/google-g.png"
    },
    "linuxmint": {
      "favicon": "toolkits/firefox/newtab/wikipedia.ico"
    },
    "wikipedia-fr": {
      "favicon": "toolkits/firefox/newtab/wikipedia.ico"
    },
    "amazon-fr": {
      "favicon": "toolkits/firefox/newtab/amazon.jpg"
    },
    "temu": {
      "favicon": "toolkits/firefox/newtab/temu.jpg"
    },
    "youtube": {
      "favicon": "toolkits/firefox/newtab/youtube.ico"
    },
    "reddit": {
      "favicon": "toolkits/firefox/newtab/reddit.ico"
    },
    "aliexpress-fr": {
      "favicon": "toolkits/firefox/newtab/aliexpress.jpg"
    },
    "lemonde": {
      "favicon": "toolkits/firefox/newtab/lemonde.ico"
    },
    "search-google": {
      "favicon": "toolkits/firefox/newtab/google-g.png"
    }
  },
  "modules": {
    "linux-bases": {
      "type": "mnt",
      "path": "mnt/debutant/linux-bases/",
      "labelFr": "Les bases Linux",
      "defaultScenario": "s01-decouverte-bureau"
    }
  },
  "shortcuts": {
    "amazon": {
      "siteId": "amazon-fr",
      "host": "amazon.fr"
    },
    "temu": {
      "siteId": "temu",
      "host": "temu.com"
    },
    "wikipedia": {
      "siteId": "wikipedia-fr",
      "host": "fr.wikipedia.org"
    },
    "youtube": {
      "siteId": "youtube",
      "host": "youtube.com"
    },
    "reddit": {
      "siteId": "reddit",
      "host": "reddit.com"
    },
    "aliexpress": {
      "siteId": "aliexpress-fr",
      "host": "fr.aliexpress.com"
    },
    "lemonde": {
      "siteId": "lemonde",
      "host": "lemonde.fr"
    },
    "os-lacapsule": {
      "siteId": "lacapsule"
    },
    "lacapsule": {
      "siteId": "lacapsule"
    }
  },
  "aliases": {
    "os-lacapsule": {
      "siteId": "lacapsule"
    },
    "la capsule": {
      "siteId": "lacapsule"
    },
    "capsuleos://os-lacapsule": {
      "siteId": "lacapsule"
    },
    "capsuleos://lacapsule.org": {
      "siteId": "lacapsule"
    }
  }
};
}(typeof window !== 'undefined' ? window : globalThis));
