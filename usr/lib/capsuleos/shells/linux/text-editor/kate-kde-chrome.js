/**
 * Toolkit KDE — Kate chrome (page Bienvenue, pivot Neon).
 */
(function initKateKdeChrome(global) {
    'use strict';

    const KDE_BODY_IDS = new Set(['kde-neon', 'opensuse', 'mx-kde', 'debian-kde']);
    const KATE_MENUS = [
        'Fichier', 'Édition', 'Sélection', 'Affichage', 'Aller',
        'Projets', 'Client LSP', 'Sessions', 'Outils', 'Configuration', 'Aide',
    ];

    function getSlot() {
        const bodyId = global.document && global.document.body && global.document.body.id;
        if (!bodyId || !KDE_BODY_IDS.has(bodyId)) {
            return null;
        }
        return global.document.querySelector(`body#${bodyId} div[data-link="text_editor"]`);
    }

    function setKateTitle(slot) {
        const title = 'Bienvenue — Kate';
        const titleEl = slot.querySelector('#windowTitle');
        if (titleEl) {
            titleEl.textContent = title;
        }
        if (global.CAPSULE_WINDOW_TITLES) {
            global.CAPSULE_WINDOW_TITLES.text_editor = title;
        }
    }

    function buildMenubar(app) {
        if (app.querySelector('.kde-kate__menubar')) {
            return;
        }
        const legacy = app.querySelector('.xed-app__menubar');
        if (legacy) {
            legacy.style.display = 'none';
        }
        const nav = global.document.createElement('nav');
        nav.className = 'kde-kate__menubar';
        nav.setAttribute('role', 'menubar');
        nav.setAttribute('aria-label', 'Menus Kate');
        KATE_MENUS.forEach((label) => {
            const btn = global.document.createElement('button');
            btn.type = 'button';
            btn.className = 'kde-kate__menu-item';
            btn.textContent = label;
            nav.appendChild(btn);
        });
        app.insertBefore(nav, app.firstChild);
    }

    function buildWelcome(app) {
        if (app.querySelector('.kde-kate__welcome')) {
            return;
        }
        const toolbar = app.querySelector('.xed-app__toolbar');
        if (toolbar) {
            toolbar.querySelectorAll('.xed-app__tool').forEach((btn, index) => {
                const action = btn.getAttribute('data-xed-action');
                if (action !== 'new' && action !== 'open') {
                    btn.hidden = true;
                }
                if (index > 1 && action !== 'open') {
                    btn.hidden = true;
                }
            });
            toolbar.querySelectorAll('.xed-app__toolbar-sep').forEach((sep) => {
                sep.hidden = true;
            });
        }

        const editorWrap = app.querySelector('.xed-app__editor-wrap');
        const status = app.querySelector('.xed-app__status');
        const searchbar = app.querySelector('.xed-searchbar');
        const tabs = app.querySelector('.xed-app__tabs');
        if (editorWrap) {
            editorWrap.style.display = 'none';
        }
        if (status) {
            status.style.display = 'none';
        }
        if (searchbar) {
            searchbar.style.display = 'none';
        }
        if (tabs) {
            tabs.style.display = 'none';
        }

        const welcome = global.document.createElement('div');
        welcome.className = 'kde-kate__welcome';
        welcome.innerHTML = `
<div class="kde-kate__rail" aria-label="Panneaux">
    <button type="button" class="kde-kate__rail-btn kde-kate__rail-btn--active" title="Documents"></button>
    <button type="button" class="kde-kate__rail-btn" title="Système de fichiers"></button>
    <button type="button" class="kde-kate__rail-btn" title="Git"></button>
    <button type="button" class="kde-kate__rail-btn" title="LSP"></button>
</div>
<div class="kde-kate__workspace">
    <div class="kde-kate__tabbar"><span class="kde-kate__tab kde-kate__tab--active">Bienvenue</span></div>
    <div class="kde-kate__welcome-body">
        <section class="kde-kate__panel">
            <h2 class="kde-kate__panel-title">Documents et projets récents</h2>
            <div class="kde-kate__panel-grid">
                <div class="kde-kate__panel-actions">
                    <button type="button" class="kde-kate__action">Nouveau fichier</button>
                    <button type="button" class="kde-kate__action">Ouvrir un fichier…</button>
                    <button type="button" class="kde-kate__action">Ouvrir un dossier…</button>
                </div>
                <ul class="kde-kate__recent-list" role="list">
                    <li class="kde-kate__recent-item">
                        <span class="kde-kate__recent-icon" aria-hidden="true"></span>
                        <span class="kde-kate__recent-name">staging-manifest.json</span>
                        <span class="kde-kate__recent-path">~/capsuleos-lab</span>
                    </li>
                </ul>
            </div>
        </section>
        <section class="kde-kate__panel">
            <h2 class="kde-kate__panel-title">Sessions enregistrées</h2>
            <div class="kde-kate__panel-grid">
                <div class="kde-kate__panel-actions">
                    <button type="button" class="kde-kate__action">Nouvelle session</button>
                    <button type="button" class="kde-kate__action">Gérer les sessions…</button>
                </div>
                <p class="kde-kate__empty">Aucune session enregistrée</p>
            </div>
        </section>
        <label class="kde-kate__welcome-check">
            <input type="checkbox" checked> Afficher la page d'accueil pour une nouvelle fenêtre
        </label>
    </div>
    <nav class="kde-kate__bottom-tabs" aria-label="Panneaux inférieurs">
        <button type="button" class="kde-kate__bottom-tab">Sortie</button>
        <button type="button" class="kde-kate__bottom-tab">Diagnostics</button>
        <button type="button" class="kde-kate__bottom-tab">Chercher</button>
        <button type="button" class="kde-kate__bottom-tab">Projet</button>
        <button type="button" class="kde-kate__bottom-tab">Terminal</button>
    </nav>
</div>`;
        app.classList.add('kde-kate--welcome');
        const anchor = toolbar || app.querySelector('.xed-app__menubar');
        if (anchor && anchor.nextSibling) {
            app.insertBefore(welcome, anchor.nextSibling);
        } else {
            app.appendChild(welcome);
        }
    }

    function bindKateChrome(slot) {
        const app = slot && slot.querySelector('#xedApp, .xed-app');
        if (!app || app.dataset.kateKdeChrome === 'true') {
            return;
        }
        app.dataset.kateKdeChrome = 'true';
        setKateTitle(slot);
        buildMenubar(app);
        buildWelcome(app);
    }

    function scan() {
        const slot = getSlot();
        if (!slot) {
            return false;
        }
        bindKateChrome(slot);
        return true;
    }

    if (global.document) {
        global.document.addEventListener('capsule:slot-injected', (event) => {
            if ((event.detail || {}).slotId === 'text_editor') {
                bindKateChrome(getSlot());
            }
        });
        if (!scan()) {
            const boot = new MutationObserver(() => {
                if (scan()) {
                    boot.disconnect();
                }
            });
            boot.observe(global.document.body, { childList: true, subtree: true });
        }
    }
}(typeof window !== 'undefined' ? window : globalThis));
