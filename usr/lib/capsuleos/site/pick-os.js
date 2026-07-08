/**
 * Portail pick-os (généré depuis etc/capsuleos/os-registry.json).
 * Catalogue : « à venir » grisé en prod, lançable si CAPSULE_PORTAL_MODE=dev ; devSkin via ?devSkin=<registryId>.
 * Regénérer : node usr/lib/capsuleos/tools/build-pick-os.mjs
 */
(function () {
    'use strict';
    const KERNEL_REBUILD = false;
    const REBUILD_MESSAGE = 'Le noyau CapsuleOS est en reconstruction. Les bureaux seront réactivés progressivement après validation du noyau central.';
    const ICON =     {
        "linux": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/",
        "windows": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/",
        "macos": "./usr/share/capsuleos/assets/images/platforms/pick-os/macos/",
        "android": "./usr/share/capsuleos/assets/images/platforms/pick-os/android/",
        "ios": "./usr/share/capsuleos/assets/images/platforms/pick-os/ios/apple.svg",
        "bsd": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/debian.png"
    };

    const catalog =     {
        "linux": {
            "label": "Linux",
            "distros": [
                {
                    "registryId": "linux-mint",
                    "name": "Linux Mint (Cinnamon)",
                    "href": "./OS/linux/families/debian/mint/index.html",
                    "skinHref": "./home/Debian/Mint/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/mint.png",
                    "portalStatus": "active",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-ubuntu",
                    "name": "Ubuntu 26.04 LTS",
                    "href": "./OS/linux/families/debian/ubuntu/index.html",
                    "skinHref": "./home/Debian/Ubuntu/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/ubuntu.png",
                    "portalStatus": "active",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-fedora",
                    "name": "Fedora Workstation",
                    "href": "./OS/linux/families/redhat/fedora/index.html",
                    "skinHref": "./home/RedHat/Fedora/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/fedora.png",
                    "portalStatus": "active",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-kde-neon",
                    "name": "KDE neon User Edition",
                    "href": "./OS/linux/families/debian/kde-neon/index.html",
                    "skinHref": "./home/Debian/KDE-Neon/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/vendors/neon/neon-logo.svg",
                    "portalStatus": "active",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-mx-kde",
                    "name": "MX Linux KDE",
                    "href": "./OS/linux/families/debian/mx-kde/index.html",
                    "skinHref": "./home/Debian/MX-KDE/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/mx.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-opensuse",
                    "name": "openSUSE Tumbleweed",
                    "href": "./OS/linux/families/suse/opensuse/index.html",
                    "skinHref": "./home/SUSE/openSUSE/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/opensuse.png",
                    "portalStatus": "active",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-rocky",
                    "name": "Rocky Linux (GNOME)",
                    "href": "./OS/linux/families/redhat/rocky/index.html",
                    "skinHref": "./home/RedHat/Rocky/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/rocky.png",
                    "portalStatus": "active",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-debian-kde",
                    "name": "Debian KDE (Plasma)",
                    "href": "./OS/linux/families/debian/debian-kde/index.html",
                    "skinHref": "./home/Debian/Debian-KDE/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/debian.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-popos",
                    "name": "Pop!_OS",
                    "href": "./OS/linux/families/debian/popos/index.html",
                    "skinHref": "./home/Debian/PopOS/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/popos.png",
                    "portalStatus": "active",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-alma",
                    "name": "AlmaLinux (GNOME)",
                    "href": "./OS/linux/families/redhat/alma/index.html",
                    "skinHref": "./home/RedHat/Alma/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/vendors/alma/alma-logo.svg",
                    "portalStatus": "active",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-anduinos",
                    "name": "AnduinOS",
                    "href": "./OS/linux/families/debian/anduinos/index.html",
                    "skinHref": "./home/Debian/AnduinOS/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/anduin.png",
                    "portalStatus": "active",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-elementary",
                    "name": "elementary OS",
                    "href": "./OS/linux/families/debian/elementary/index.html",
                    "skinHref": "./home/Debian/Elementary/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/elementary.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-kali",
                    "name": "Kali Linux",
                    "href": "./OS/linux/families/debian/kali/index.html",
                    "skinHref": "./home/Debian/Kali/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/debian.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                },
                {
                    "registryId": "linux-lxqt",
                    "name": "LXQt (générique)",
                    "href": "./OS/linux/families/debian/lxqt/index.html",
                    "skinHref": "./home/Debian/LXQt/index.html",
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/debian.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                }
            ]
        },
        "windows": {
            "label": "Windows",
            "distros": [
                {
                    "registryId": "windows-10",
                    "name": "Windows 10",
                    "href": "./OS/windows/versions/10/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win10.png",
                    "portalStatus": "active",
                    "portalFeatured": false
                },
                {
                    "registryId": "windows-11",
                    "name": "Windows 11",
                    "href": "./OS/windows/versions/11/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win11.png",
                    "portalStatus": "active",
                    "portalFeatured": false
                },
                {
                    "registryId": "windows-7",
                    "name": "Windows 7",
                    "href": "./OS/windows/versions/7/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win7.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                },
                {
                    "registryId": "windows-xp",
                    "name": "Windows XP",
                    "href": "./OS/windows/versions/xp/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/winxp.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                },
                {
                    "registryId": "windows-2000",
                    "name": "Windows 2000",
                    "href": "./OS/windows/versions/2000/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win2000.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                },
                {
                    "registryId": "windows-8",
                    "name": "Windows 8",
                    "href": "./OS/windows/versions/8/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win8.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                },
                {
                    "registryId": "windows-8.1",
                    "name": "Windows 8.1",
                    "href": "./OS/windows/versions/8.1/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win8.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                },
                {
                    "registryId": "windows-95",
                    "name": "Windows 95",
                    "href": "./OS/windows/versions/95/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win95.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                },
                {
                    "registryId": "windows-98",
                    "name": "Windows 98",
                    "href": "./OS/windows/versions/98/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win98.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                },
                {
                    "registryId": "windows-me",
                    "name": "Windows ME",
                    "href": "./OS/windows/versions/me/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/winme.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                },
                {
                    "registryId": "windows-vista",
                    "name": "Windows Vista",
                    "href": "./OS/windows/versions/vista/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/vista.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                }
            ]
        },
        "macos": {
            "label": "Macos",
            "distros": [
                {
                    "registryId": "macos-sonoma",
                    "name": "macOS Sonoma",
                    "href": "./OS/macos/sonoma/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/macos/sonoma.png",
                    "portalStatus": "active",
                    "portalFeatured": false
                }
            ]
        },
        "bsd": {
            "label": "BSD",
            "distros": []
        },
        "ios": {
            "label": "iOS",
            "distros": [
                {
                    "registryId": "ios-15",
                    "name": "iOS 15",
                    "href": "./OS/ios/15/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/ios/apple.svg",
                    "portalStatus": "active",
                    "portalFeatured": false
                }
            ]
        },
        "android": {
            "label": "Android",
            "distros": [
                {
                    "registryId": "android-vanilla",
                    "name": "Android (Vanilla Ice Cream)",
                    "href": "./OS/android/index.html",
                    "skinHref": null,
                    "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/android/vanillaicecream.png",
                    "portalStatus": "planned",
                    "portalFeatured": false
                }
            ]
        }
    };

    const devSkinIndex =     {
        "linux-mint": {
            "id": "linux-mint",
            "displayName": "Linux Mint (Cinnamon)",
            "href": "./OS/linux/families/debian/mint/index.html",
            "skinHref": "./home/Debian/Mint/index.html",
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/mint.png",
            "status": "active",
            "tier": "P0"
        },
        "linux-ubuntu": {
            "id": "linux-ubuntu",
            "displayName": "Ubuntu 26.04 LTS",
            "href": "./OS/linux/families/debian/ubuntu/index.html",
            "skinHref": "./home/Debian/Ubuntu/index.html",
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/ubuntu.png",
            "status": "active",
            "tier": "P0"
        },
        "linux-fedora": {
            "id": "linux-fedora",
            "displayName": "Fedora Workstation",
            "href": "./OS/linux/families/redhat/fedora/index.html",
            "skinHref": "./home/RedHat/Fedora/index.html",
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/fedora.png",
            "status": "active",
            "tier": "P1"
        },
        "linux-mx-kde": {
            "id": "linux-mx-kde",
            "displayName": "MX Linux KDE",
            "href": "./OS/linux/families/debian/mx-kde/index.html",
            "skinHref": "./home/Debian/MX-KDE/index.html",
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/mx.png",
            "status": "planned",
            "tier": "P1"
        },
        "linux-debian-kde": {
            "id": "linux-debian-kde",
            "displayName": "Debian KDE (Plasma)",
            "href": "./OS/linux/families/debian/debian-kde/index.html",
            "skinHref": "./home/Debian/Debian-KDE/index.html",
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/debian.png",
            "status": "planned",
            "tier": "P2"
        },
        "linux-kde-neon": {
            "id": "linux-kde-neon",
            "displayName": "KDE neon User Edition",
            "href": "./OS/linux/families/debian/kde-neon/index.html",
            "skinHref": "./home/Debian/KDE-Neon/index.html",
            "icon": "./usr/share/capsuleos/assets/images/vendors/neon/neon-logo.svg",
            "status": "active",
            "tier": "P1"
        },
        "linux-opensuse": {
            "id": "linux-opensuse",
            "displayName": "openSUSE Tumbleweed",
            "href": "./OS/linux/families/suse/opensuse/index.html",
            "skinHref": "./home/SUSE/openSUSE/index.html",
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/opensuse.png",
            "status": "active",
            "tier": "P1"
        },
        "linux-popos": {
            "id": "linux-popos",
            "displayName": "Pop!_OS",
            "href": "./OS/linux/families/debian/popos/index.html",
            "skinHref": "./home/Debian/PopOS/index.html",
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/popos.png",
            "status": "active",
            "tier": "P2"
        },
        "linux-anduinos": {
            "id": "linux-anduinos",
            "displayName": "AnduinOS",
            "href": "./OS/linux/families/debian/anduinos/index.html",
            "skinHref": "./home/Debian/AnduinOS/index.html",
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/anduin.png",
            "status": "active",
            "tier": "P3"
        },
        "linux-rocky": {
            "id": "linux-rocky",
            "displayName": "Rocky Linux (GNOME)",
            "href": "./OS/linux/families/redhat/rocky/index.html",
            "skinHref": "./home/RedHat/Rocky/index.html",
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/rocky.png",
            "status": "active",
            "tier": "P1"
        },
        "linux-elementary": {
            "id": "linux-elementary",
            "displayName": "elementary OS",
            "href": "./OS/linux/families/debian/elementary/index.html",
            "skinHref": "./home/Debian/Elementary/index.html",
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/elementary.png",
            "status": "planned",
            "tier": "P4"
        },
        "linux-alma": {
            "id": "linux-alma",
            "displayName": "AlmaLinux (GNOME)",
            "href": "./OS/linux/families/redhat/alma/index.html",
            "skinHref": "./home/RedHat/Alma/index.html",
            "icon": "./usr/share/capsuleos/assets/images/vendors/alma/alma-logo.svg",
            "status": "active",
            "tier": "P3"
        },
        "linux-kali": {
            "id": "linux-kali",
            "displayName": "Kali Linux",
            "href": "./OS/linux/families/debian/kali/index.html",
            "skinHref": "./home/Debian/Kali/index.html",
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/debian.png",
            "status": "planned",
            "tier": "P4"
        },
        "linux-lxqt": {
            "id": "linux-lxqt",
            "displayName": "LXQt (générique)",
            "href": "./OS/linux/families/debian/lxqt/index.html",
            "skinHref": "./home/Debian/LXQt/index.html",
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/linux/debian.png",
            "status": "planned",
            "tier": "P4"
        },
        "windows-95": {
            "id": "windows-95",
            "displayName": "Windows 95",
            "href": "./OS/windows/versions/95/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win95.png",
            "status": "planned",
            "tier": "P2"
        },
        "windows-98": {
            "id": "windows-98",
            "displayName": "Windows 98",
            "href": "./OS/windows/versions/98/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win98.png",
            "status": "planned",
            "tier": "P2"
        },
        "windows-me": {
            "id": "windows-me",
            "displayName": "Windows ME",
            "href": "./OS/windows/versions/me/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/winme.png",
            "status": "planned",
            "tier": "P2"
        },
        "windows-2000": {
            "id": "windows-2000",
            "displayName": "Windows 2000",
            "href": "./OS/windows/versions/2000/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win2000.png",
            "status": "planned",
            "tier": "P2"
        },
        "windows-xp": {
            "id": "windows-xp",
            "displayName": "Windows XP",
            "href": "./OS/windows/versions/xp/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/winxp.png",
            "status": "planned",
            "tier": "P1"
        },
        "windows-vista": {
            "id": "windows-vista",
            "displayName": "Windows Vista",
            "href": "./OS/windows/versions/vista/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/vista.png",
            "status": "planned",
            "tier": "P2"
        },
        "windows-7": {
            "id": "windows-7",
            "displayName": "Windows 7",
            "href": "./OS/windows/versions/7/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win7.png",
            "status": "planned",
            "tier": "P1"
        },
        "windows-8": {
            "id": "windows-8",
            "displayName": "Windows 8",
            "href": "./OS/windows/versions/8/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win8.png",
            "status": "planned",
            "tier": "P2"
        },
        "windows-8.1": {
            "id": "windows-8.1",
            "displayName": "Windows 8.1",
            "href": "./OS/windows/versions/8.1/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win8.png",
            "status": "planned",
            "tier": "P2"
        },
        "windows-10": {
            "id": "windows-10",
            "displayName": "Windows 10",
            "href": "./OS/windows/versions/10/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win10.png",
            "status": "active",
            "tier": "P0"
        },
        "windows-11": {
            "id": "windows-11",
            "displayName": "Windows 11",
            "href": "./OS/windows/versions/11/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/windows/win11.png",
            "status": "active",
            "tier": "P0"
        },
        "macos-sonoma": {
            "id": "macos-sonoma",
            "displayName": "macOS Sonoma",
            "href": "./OS/macos/sonoma/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/macos/sonoma.png",
            "status": "active",
            "tier": "P1"
        },
        "ios-15": {
            "id": "ios-15",
            "displayName": "iOS 15",
            "href": "./OS/ios/15/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/ios/apple.svg",
            "status": "active",
            "tier": "P2"
        },
        "android-vanilla": {
            "id": "android-vanilla",
            "displayName": "Android (Vanilla Ice Cream)",
            "href": "./OS/android/index.html",
            "skinHref": null,
            "icon": "./usr/share/capsuleos/assets/images/platforms/pick-os/android/vanillaicecream.png",
            "status": "planned",
            "tier": "P1"
        }
    };

    const modal = document.getElementById('pick-modal');
    const modalTitle = document.getElementById('pick-modal-title');
    const modalList = document.getElementById('pick-modal-list');
    const modalClose = document.getElementById('pick-modal-close');
    const cards = document.querySelectorAll('.pick-card');
    const pickLead = document.querySelector('.pick-lead');

    if (pickLead && KERNEL_REBUILD) {
        pickLead.textContent = REBUILD_MESSAGE + ' Mode lab : ?devSkin=<id> (ex. ?devSkin=linux-mint).';
    }

    if (!modal || !modalTitle || !modalList) return;

    let activeCard = null;

    const isPortalDev = () => (
        typeof window !== 'undefined' && window.CAPSULE_PORTAL_MODE === 'dev'
    );

    const canLaunchRegistryStatus = (status) => (
        status !== 'planned' || isPortalDev()
    );

    const resolveLaunchHref = (distro) => {
        if (!distro) return '#';
        if (isPortalDev() && distro.portalStatus === 'planned' && distro.skinHref) {
            return distro.skinHref;
        }
        return distro.href;
    };

    const navigateToDistro = (distro) => {
        const href = resolveLaunchHref(distro);
        if (!href || href === '#') return;
        window.location.assign(href);
    };

    const resolveDevSkin = () => {
        const params = new URLSearchParams(location.search);
        const fromUrl = params.get('devSkin');
        if (fromUrl && devSkinIndex[fromUrl]) return fromUrl;
        try {
            const fromStorage = localStorage.getItem('CAPSULE_DEV_SKIN');
            if (fromStorage && devSkinIndex[fromStorage]) return fromStorage;
        } catch (_) { /* file:// */ }
        return null;
    };

    const clearDevSkinPersistence = () => {
        try {
            localStorage.removeItem('CAPSULE_DEV_SKIN');
        } catch (_) { /* file:// */ }
        const params = new URLSearchParams(location.search);
        if (!params.has('devSkin')) {
            return;
        }
        params.delete('devSkin');
        const next = params.toString();
        history.replaceState(null, '', next ? (location.pathname + '?' + next + location.hash) : (location.pathname + location.hash));
    };

    const openModalForOs = (osKey, card) => {
        if (!osKey || !catalog[osKey]) return;

        if (activeCard && activeCard !== card) {
            activeCard.classList.remove('is-selected');
            activeCard.setAttribute('aria-pressed', 'false');
        }

        if (card) {
            activeCard = card;
            card.classList.add('is-selected');
            card.setAttribute('aria-pressed', 'true');
        } else {
            activeCard = null;
        }

        renderDistros(osKey);
        modal.showModal();
    };

    const closeModal = () => {
        modal.close();
        if (activeCard) {
            activeCard.classList.remove('is-selected');
            activeCard.setAttribute('aria-pressed', 'false');
            activeCard = null;
        }
    };

    const renderDistros = (osKey) => {
        const entry = catalog[osKey];
        if (!entry) return;

        modalTitle.textContent = entry.label;
        modalList.replaceChildren();

        if (entry.distros.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'pick-modal-empty';
            empty.textContent = KERNEL_REBUILD
                ? REBUILD_MESSAGE
                : 'Aucune distribution disponible pour le moment.';
            modalList.appendChild(empty);

            if (KERNEL_REBUILD && Object.keys(devSkinIndex).length) {
                const hint = document.createElement('li');
                hint.className = 'pick-modal-empty pick-modal-dev-hint';
                hint.textContent = 'Lab : ajoutez ?devSkin=linux-mint à l\'URL pour charger un skin archivé.';
                modalList.appendChild(hint);
            }
            return;
        }

        entry.distros.forEach((distro) => {
            const item = document.createElement('li');
            item.className = 'pick-modal-item';

            const portalDev = isPortalDev();
            const isPlanned = distro.portalStatus === 'planned';
            const isLaunchable = !isPlanned || portalDev;
            const isFeatured = distro.portalFeatured === true;
            const card = document.createElement(isLaunchable ? 'a' : 'div');
            card.className = 'pick-modal-card'
                + (isPlanned ? (portalDev ? ' pick-modal-card--planned-dev' : ' pick-modal-card--planned') : '')
                + (isFeatured ? ' pick-modal-card--featured' : '');
            if (isLaunchable) {
                const launchHref = resolveLaunchHref(distro);
                card.href = launchHref;
                card.addEventListener('click', (event) => {
                    event.preventDefault();
                    navigateToDistro(distro);
                });
            } else {
                card.setAttribute('aria-disabled', 'true');
                card.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                });
            }
            card.title = distro.name;

            const statusTag = document.createElement('span');
            statusTag.className = 'pick-modal-card-status';
            statusTag.textContent = isPlanned ? (portalDev ? 'À venir · dev' : 'À venir') : 'Disponible';

            const icon = document.createElement('img');
            icon.className = 'pick-modal-card-icon';
            icon.src = distro.icon;
            icon.alt = '';
            icon.loading = 'lazy';

            const label = document.createElement('span');
            label.className = 'pick-modal-card-label';
            label.textContent = distro.name;

            card.appendChild(statusTag);
            if (isFeatured) {
                const featuredTag = document.createElement('span');
                featuredTag.className = 'pick-modal-card-featured';
                featuredTag.textContent = 'Vedette';
                card.appendChild(featuredTag);
            }
            card.appendChild(icon);
            card.appendChild(label);
            item.appendChild(card);
            modalList.appendChild(item);
        });
    };

    cards.forEach((card) => {
        card.addEventListener('click', () => {
            const osKey = card.dataset.os;
            openModalForOs(osKey, card);
        });
    });

    const devSkinId = resolveDevSkin();
    if (devSkinId) {
        const target = devSkinIndex[devSkinId];
        if (target && canLaunchRegistryStatus(target.status)
            && confirm('Mode lab : charger « ' + target.displayName + ' » (statut ' + target.status + ') ?')) {
            const labHref = (isPortalDev() && target.status === 'planned' && target.skinHref)
                ? target.skinHref : target.href;
            location.replace(labHref);
            return;
        }
        if (!isPortalDev() || (target && !canLaunchRegistryStatus(target.status))) {
            clearDevSkinPersistence();
        }
    }

    const pickKey = new URLSearchParams(location.search).get('pick');
    if (pickKey && catalog[pickKey]) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const card = document.querySelector(`.pick-card[data-os="${pickKey}"]`);
                openModalForOs(pickKey, card);
                if (location.search.includes('pick=')) {
                    history.replaceState(null, '', `${location.pathname}#choisir-os`);
                }
            });
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.open) closeModal();
    });
}());
