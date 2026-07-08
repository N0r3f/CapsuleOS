/**
 * Applet grouped-window-list Cinnamon — panel Mint.
 * Une seule rangée d’icônes (épinglées toujours visibles + apps ouvertes dynamiques).
 */
(function initCapsuleTaskbarWindowList(global) {
    'use strict';

    const EXCLUDED_SLOTS = new Set(['mainMenu']);
    /** Épinglés VM — toujours affichés dans la rangée grouped (sans doublon). */
    const PINNED_ALWAYS = ['nemo', 'firefox', 'terminal'];

    const WINDOW_ICONS = {
        nemo: './assets/images/vendors/mint/panel/system-file-manager.webp',
        firefox: './assets/images/vendors/mint/panel/firefox.webp',
        terminal: './assets/images/vendors/mint/panel/org.gnome.Terminal.webp',
        text_editor: './assets/images/vendors/mint/panel/accessories-text-editor.webp',
        update_manager: './assets/images/vendors/mint/panel/mintupdate.webp',
        mintinstall: './assets/images/vendors/mint/panel/mintinstall.webp',
        themes: './assets/images/vendors/mint/panel/preferences-desktop-theme.webp',
        calculator: './assets/images/vendors/mint/panel/org.gnome.Calculator.webp',
        librewriter: './assets/images/vendors/mint/panel/libreoffice-writer.webp',
    };

    function resolveTaskbarIconUrl(path) {
        if (!path) {
            return '';
        }
        if (typeof global.resolveCapsuleAssetUrl === 'function') {
            return global.resolveCapsuleAssetUrl(path);
        }
        if (typeof global.resolveCapsuleResourceUrl === 'function') {
            return global.resolveCapsuleResourceUrl(path);
        }
        return path;
    }

    const WINDOW_LABELS = {
        nemo: 'Fichiers',
        firefox: 'Firefox',
        terminal: 'Terminal',
        themes: 'Thèmes',
        profile: 'À Propos',
        checklist: 'Missions',
        librewriter: 'LibreOffice Writer',
        librecalc: 'LibreOffice Calc',
        visionneur_images: 'Visionneur d\'images',
        visionneur_pdf: 'Visionneur PDF',
        lecteur_multimedia: 'Lecteur vidéo',
        update_manager: 'Gestionnaire de mises à jour',
        mintinstall: 'Logithèque',
        system_monitor: 'Moniteur système',
        text_editor: 'Éditeur de texte',
        calculator: 'Calculatrice',
        clocks: 'Horloges',
        calendar: 'Calendrier',
        screenshot: 'Capture d\'écran',
        drawing: 'Dessin',
        file_roller: 'Gestionnaire d\'archives',
        mintdrivers: 'Gestionnaire de pilotes',
        baobab: 'Analyseur d\'espace disque',
        webapp_manager: 'Applications Web',
        sticky: 'Notes',
        warpinator: 'Warpinator',
        hypnotix: 'Hypnotix',
        transmission: 'Transmission',
        mintbackup: 'Sauvegarde',
        bulky: 'Renommer fichiers',
        timeshift: 'Timeshift',
        thunderbird: 'Thunderbird',
        mintwelcome: 'Accueil Mint',
        gucharmap: 'Table des caractères',
        simple_scan: 'Numérisation',
        thingy: 'Bibliothèque',
        rhythmbox: 'Rhythmbox',
        gnome_disks: 'Disques',
        libreoffice_startcenter: 'LibreOffice',
        libreoffice_draw: 'LibreOffice Draw',
        libreoffice_impress: 'LibreOffice Impress',
        mintstick: 'Créateur clé USB',
        mintstick_format: 'Formateur clé USB',
        font_viewer: 'Polices',
        power_stats: 'Statistiques alim.',
        mate_color_select: 'Sélecteur couleur',
        'Dossier personnel': 'Dossier personnel',
    };

    function isMintPanel() {
        const bodyId = typeof document !== 'undefined' && document.body ? document.body.id : '';
        const skinKey = typeof global !== 'undefined' ? global.CAPSULE_EMBED_SKIN_KEY : '';
        return bodyId === 'mint' || skinKey === 'mint';
    }

    function resolveWindowLabel(dataLink, container) {
        if (container) {
            const titleEl = container.querySelector(':scope > #windowTitle');
            if (titleEl && titleEl.textContent) {
                const liveTitle = titleEl.textContent.replace(/\s+/g, ' ').trim();
                if (liveTitle) {
                    return liveTitle;
                }
            }
        }
        if (!dataLink) {
            return 'Fenêtre';
        }
        if (typeof global.getResolvedWindowTitle === 'function') {
            const resolved = global.getResolvedWindowTitle(dataLink);
            if (resolved) {
                return resolved;
            }
        }
        if (global.CAPSULE_WINDOW_TITLES && global.CAPSULE_WINDOW_TITLES[dataLink]) {
            return global.CAPSULE_WINDOW_TITLES[dataLink];
        }
        return WINDOW_LABELS[dataLink] || dataLink;
    }

    function isWindowVisible(container) {
        return !!(container && container.style.display !== 'none');
    }

    function isSlotRunning(container) {
        if (!container) {
            return false;
        }
        return isWindowVisible(container)
            || (container.dataset && container.dataset.capsuleRunning === 'true');
    }

    function markWindowRunning(container) {
        if (!container) {
            return;
        }
        if (global.CapsuleTaskbarLauncherState
            && typeof global.CapsuleTaskbarLauncherState.markRunning === 'function') {
            global.CapsuleTaskbarLauncherState.markRunning(container);
            return;
        }
        container.dataset.capsuleRunning = 'true';
    }

    function resolveSlotContainer(dataLink) {
        return document.querySelector(`.windowElement[data-link="${dataLink}"]`);
    }

    function getDynamicRunningSlots() {
        return Array.from(document.querySelectorAll('.windowElement'))
            .filter((container) => !EXCLUDED_SLOTS.has(container.dataset.link))
            .filter((container) => !PINNED_ALWAYS.includes(container.dataset.link))
            .filter(isSlotRunning)
            .map((container) => container.dataset.link);
    }

    function collectGroupedSlots() {
        const slots = PINNED_ALWAYS.slice();
        getDynamicRunningSlots().forEach((dataLink) => {
            if (!slots.includes(dataLink)) {
                slots.push(dataLink);
            }
        });
        return slots;
    }

    function resolveWindowIcon(dataLink) {
        if (WINDOW_ICONS[dataLink]) {
            return WINDOW_ICONS[dataLink];
        }
        return '';
    }

    function focusWindow(dataLink) {
        if (typeof global.openWindowByDataLink === 'function') {
            global.openWindowByDataLink(dataLink);
            return;
        }
        const container = resolveSlotContainer(dataLink);
        if (!container || !isWindowVisible(container)) {
            return;
        }
        container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }

    function prefetchSlot(dataLink) {
        if (dataLink && global.CapsuleSlotLoader
            && typeof global.CapsuleSlotLoader.ensureSlotLoaded === 'function') {
            global.CapsuleSlotLoader.ensureSlotLoaded(dataLink);
        }
    }

    function renderWindowList(listEl) {
        const activeContainer = document.querySelector('.windowElementActive');
        const activeLink = activeContainer && !EXCLUDED_SLOTS.has(activeContainer.dataset.link)
            ? activeContainer.dataset.link
            : null;

        listEl.innerHTML = '';
        listEl.hidden = false;

        collectGroupedSlots().forEach((dataLink) => {
            const container = resolveSlotContainer(dataLink);
            const visible = isWindowVisible(container);
            const running = isSlotRunning(container);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'taskbar-window-list__btn';
            if (running) {
                btn.classList.add('is-running');
            }
            if (visible && dataLink === activeLink) {
                btn.classList.add('is-active');
            }
            if (running && !visible) {
                btn.classList.add('is-minimized');
            }
            btn.dataset.windowLink = dataLink;
            btn.title = resolveWindowLabel(dataLink, container);

            const iconSrc = resolveTaskbarIconUrl(resolveWindowIcon(dataLink));
            if (iconSrc) {
                const img = document.createElement('img');
                img.className = 'taskbar-window-list__icon';
                img.src = iconSrc;
                img.alt = '';
                btn.appendChild(img);
            }

            btn.addEventListener('mouseenter', () => {
                prefetchSlot(dataLink);
            });

            btn.addEventListener('click', (event) => {
                event.preventDefault();
                if (visible && dataLink === activeLink) {
                    const applyHide = () => {
                        markWindowRunning(container);
                        container.style.display = 'none';
                        container.classList.remove('active', 'windowElementActive');
                        if (typeof global.CustomEvent === 'function') {
                            global.document.dispatchEvent(new CustomEvent('capsule:window-minimized', {
                                detail: { container: container, slotId: dataLink },
                            }));
                            global.document.dispatchEvent(new CustomEvent('capsule:window-hidden', {
                                detail: { container: container, slotId: dataLink },
                            }));
                        }
                        renderWindowList(listEl);
                    };
                    if (typeof global.capsuleBeforeWindowHide === 'function') {
                        global.capsuleBeforeWindowHide(container, applyHide);
                    } else {
                        applyHide();
                    }
                    return;
                }
                focusWindow(dataLink);
            });

            listEl.appendChild(btn);
        });
    }

    function bindWindowObservers(listEl) {
        document.querySelectorAll('.windowElement').forEach((container) => {
            if (container.dataset.taskbarListObserved === 'true') {
                return;
            }
            const observer = new MutationObserver(() => {
                renderWindowList(listEl);
            });
            observer.observe(container, {
                attributes: true,
                attributeFilter: ['style', 'class'],
            });
            container.dataset.taskbarListObserved = 'true';
        });
    }

    function init() {
        if (!isMintPanel()) {
            return;
        }

        const listEl = document.getElementById('taskbar-window-list');
        if (!listEl) {
            return;
        }

        bindWindowObservers(listEl);
        renderWindowList(listEl);

        document.addEventListener('mousedown', (event) => {
            const target = event.target.closest('.windowElement');
            if (target && !EXCLUDED_SLOTS.has(target.dataset.link)) {
                window.requestAnimationFrame(() => renderWindowList(listEl));
            }
        });

        [
            'capsule:window-minimized',
            'capsule:window-hidden',
            'capsule:window-opened',
            'capsule:window-focused',
            'capsule:window-closed',
        ].forEach((eventName) => {
            document.addEventListener(eventName, () => {
                window.requestAnimationFrame(() => renderWindowList(listEl));
            });
        });

        global.CapsuleTaskbarWindowList = {
            initialized: true,
            refresh: () => {
                renderWindowList(listEl);
                if (global.CapsuleTaskbarLauncherState
                    && typeof global.CapsuleTaskbarLauncherState.refresh === 'function') {
                    global.CapsuleTaskbarLauncherState.refresh();
                }
            },
        };
    }

    if (typeof document !== 'undefined' && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }
}(typeof window !== 'undefined' ? window : globalThis));
