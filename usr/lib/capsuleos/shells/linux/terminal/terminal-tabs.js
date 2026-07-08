/**
 * Onglets terminal Ptyxis — mémoire SESSION (purgée à la fermeture de fenêtre).
 * Même contrat que fileExplorer/fileExplorerTabs.js (capture / apply / render).
 */
(function initTerminalTabs(global) {
    'use strict';

    const PTYXIS_BODY_IDS = new Set(['rocky', 'fedora', 'alma', 'ubuntu', 'anduinos', 'mint']);
    let tabSeq = 1;
    let restoringTabs = false;

    const usesTerminalTabs = () => Boolean(
        global.document && global.document.body && PTYXIS_BODY_IDS.has(global.document.body.id)
    );

    const getTerminalWindow = (preferred) => {
        if (preferred && preferred.dataset && preferred.dataset.link === 'terminal') {
            return preferred;
        }
        return (
            global.document.querySelector('.windowElement.windowElementActive[data-link="terminal"]')
            || global.document.getElementById('terminal')
            || global.document.querySelector('.windowElement[data-link="terminal"]')
        );
    };

    const resolveTerminalWindowFromElements = (elements, preferred) => {
        if (elements && elements.app && typeof elements.app.closest === 'function') {
            const scoped = elements.app.closest('.windowElement[data-link="terminal"]');
            if (scoped) {
                return scoped;
            }
        }
        return getTerminalWindow(preferred);
    };

    const getWindowInstanceId = (windowElement) => {
        if (!windowElement) {
            return 'primary';
        }
        if (windowElement.id === 'terminal' && !windowElement.dataset.capsuleWindowInstance) {
            return 'primary';
        }
        return windowElement.dataset.capsuleWindowInstance || windowElement.id || 'primary';
    };

    const getTabsStorageKey = (windowElement) => {
        const skin = global.document && global.document.body ? global.document.body.id : 'default';
        const user = global.CAPSULE_TERMINAL_USER || 'user';
        const host = global.CAPSULE_TERMINAL_HOST || 'host';
        const instanceId = getWindowInstanceId(windowElement || getTerminalWindow());
        return `capsule-terminal-tabs:${skin}:${user}@${host}:${instanceId}`;
    };

    const resolveDefaultPrompt = () => {
        if (typeof global.resolveFedoraTerminalPrompt === 'function') {
            return global.resolveFedoraTerminalPrompt();
        }
        const profile = global.CAPSULE_TERMINAL_PROFILE || '';
        if ((global.document.body && global.document.body.id === 'rocky') || profile === 'rocky') {
            return 'capsule@rocky:~';
        }
        if ((global.document.body && global.document.body.id === 'alma') || profile === 'alma') {
            return 'capsule@alma:~';
        }
        if ((global.document.body && global.document.body.id === 'ubuntu') || profile === 'ubuntu') {
            return 'capsule@ubuntu:~';
        }
        if ((global.document.body && global.document.body.id === 'fedora') || profile === 'fedora') {
            return 'capsule@fedora:~';
        }
        const user = global.CAPSULE_TERMINAL_USER || 'capsule';
        const host = global.CAPSULE_TERMINAL_HOST || 'host';
        return `${user}@${host}:~`;
    };

    const formatTabTitle = (promptText) => String(promptText || resolveDefaultPrompt()).replace(/\$\s*$/, '').trim();

    const shortenTabLabel = (title) => {
        const text = formatTabTitle(title);
        const match = text.match(/^([^:]+:)(.+)$/);
        if (!match) {
            return text;
        }
        const pathPart = match[2].trim();
        if (pathPart.length <= 14) {
            return text;
        }
        if (pathPart.startsWith('~/')) {
            return `${match[1]}${pathPart}`;
        }
        const leaf = pathPart.split('/').filter(Boolean).pop();
        return leaf ? `${match[1]}~/${leaf}` : text;
    };

    const getWindowTabState = (windowElement) => {
        if (!windowElement.__capsuleTerminalTabState) {
            windowElement.__capsuleTerminalTabState = {
                tabs: [],
                activeTabId: null,
            };
        }
        return windowElement.__capsuleTerminalTabState;
    };

    const createEmptyTab = (options = {}) => {
        const home = global.CapsuleTerminal
            ? global.CapsuleTerminal.normalizePath(global.CAPSULE_TERMINAL_HOME || '/')
            : (global.CAPSULE_TERMINAL_HOME || '/');
        const id = options.id || `tab-${tabSeq++}`;
        const user = global.CAPSULE_TERMINAL_USER || 'user';
        const host = global.CAPSULE_TERMINAL_HOST || 'host';
        const cwd = options.cwd != null ? options.cwd : home;
        const prompt = global.CapsuleTerminal
            ? global.CapsuleTerminal.formatPrompt({ cwd, home, user, host })
            : resolveDefaultPrompt();
        return {
            id,
            title: formatTabTitle(options.title || prompt),
            cwd,
            home,
            user,
            host,
            history: Array.isArray(options.history) ? options.history.slice() : [],
            outputHtml: options.outputHtml || '',
            commandDraft: options.commandDraft || '',
        };
    };

    const serializeTab = (tab) => ({
        id: tab.id,
        title: tab.title,
        cwd: tab.cwd,
        home: tab.home,
        user: tab.user,
        host: tab.host,
        // Sortie et historique de commandes : mémoire runtime uniquement (onglets ouverts).
        history: [],
        outputHtml: '',
        commandDraft: '',
    });

    const deserializeTab = (raw) => {
        if (!raw || !raw.id) {
            return null;
        }
        return createEmptyTab({
            id: raw.id,
            title: raw.title,
            cwd: raw.cwd,
            home: raw.home,
            user: raw.user,
            host: raw.host,
            history: [],
            outputHtml: '',
            commandDraft: '',
        });
    };

    const shouldForceFreshTerminalSession = () => (
        global.CAPSULE_TERMINAL_FORCE_FRESH === true
        || (global.CAPSULE_TERMINAL_LAUNCH_CWD != null && global.CAPSULE_TERMINAL_LAUNCH_CWD !== '')
    );

    const removeStorageKeys = (keys) => {
        if (!global.localStorage || !keys || !keys.length) {
            return;
        }
        keys.forEach((key) => {
            try {
                global.localStorage.removeItem(key);
            } catch (error) {
                /* quota / mode privé */
            }
        });
    };

    const persistTabsToStorage = (windowElement) => {
        if (!windowElement || restoringTabs) {
            return;
        }
        const state = getWindowTabState(windowElement);
        if (!state.tabs.length) {
            return;
        }
        try {
            global.localStorage.setItem(getTabsStorageKey(windowElement), JSON.stringify({
                activeTabId: state.activeTabId,
                tabSeq,
                tabs: state.tabs.map(serializeTab),
            }));
        } catch (error) {
            /* quota / mode privé */
        }
    };

    const loadTabsFromStorage = (windowElement) => {
        try {
            const storageKey = getTabsStorageKey(windowElement);
            let raw = global.localStorage.getItem(storageKey);
            if (!raw && getWindowInstanceId(windowElement) === 'primary') {
                const legacyKey = storageKey.replace(/:primary$/, '');
                raw = global.localStorage.getItem(legacyKey);
            }
            if (!raw) {
                return null;
            }
            const payload = JSON.parse(raw);
            if (!payload || !Array.isArray(payload.tabs) || !payload.tabs.length) {
                return null;
            }
            const tabs = payload.tabs.map(deserializeTab).filter(Boolean);
            if (!tabs.length) {
                return null;
            }
            if (typeof payload.tabSeq === 'number' && payload.tabSeq > 0) {
                tabSeq = payload.tabSeq;
            } else {
                tabSeq = tabs.length + 1;
            }
            const activeTabId = payload.activeTabId && tabs.some((tab) => tab.id === payload.activeTabId)
                ? payload.activeTabId
                : tabs[0].id;
            return { tabs, activeTabId };
        } catch (error) {
            return null;
        }
    };

    const getActiveTab = (state) => (
        state.tabs.find((tab) => tab.id === state.activeTabId) || state.tabs[0]
    );

    const getTerminalElements = (windowElement) => {
        const app = windowElement.querySelector('[data-terminal-app]');
        if (!app) {
            return null;
        }
        return {
            app,
            output: app.querySelector('[data-terminal-output], #output'),
            form: app.querySelector('[data-terminal-form], #input'),
            prompt: app.querySelector('[data-terminal-prompt], #prompt'),
            commandInput: app.querySelector('[data-terminal-command], #command'),
        };
    };

    const captureTabSession = (tab, session, elements) => {
        if (!tab || !session || !elements) {
            return;
        }
        tab.cwd = session.state.cwd;
        tab.home = session.state.home;
        tab.user = session.state.user;
        tab.host = session.state.host;
        tab.history = session.getHistory();
        tab.outputHtml = elements.output ? elements.output.innerHTML : '';
        tab.commandDraft = elements.commandInput ? elements.commandInput.value : '';
        tab.title = formatTabTitle(session.getPrompt());
    };

    const applyTabSession = (tab, session, elements) => {
        if (!tab || !session || !elements) {
            return;
        }
        session.state.cwd = global.CapsuleTerminal
            ? global.CapsuleTerminal.normalizePath(tab.cwd || tab.home)
            : (tab.cwd || tab.home);
        session.state.home = global.CapsuleTerminal
            ? global.CapsuleTerminal.normalizePath(tab.home || session.state.home)
            : (tab.home || session.state.home);
        session.state.user = tab.user || session.state.user;
        session.state.host = tab.host || session.state.host;
        session.state.history = Array.isArray(tab.history) ? tab.history.slice() : [];
        if (elements.output) {
            elements.output.innerHTML = typeof tab.outputHtml === 'string' ? tab.outputHtml : '';
        }
        if (elements.commandInput) {
            elements.commandInput.value = tab.commandDraft || '';
            elements.commandInput.dispatchEvent(new Event('input'));
        }
        if (typeof global.updateTerminalPrompt === 'function') {
            global.updateTerminalPrompt(elements, session);
        }
        if (typeof global.scrollTerminalToBottom === 'function') {
            global.scrollTerminalToBottom(elements);
        }
    };

    const ensureFedoraTabsSlot = (header) => {
        let tabsSlot = header.querySelector('.fedora-terminal-header__tabs');
        if (!tabsSlot) {
            tabsSlot = global.document.createElement('div');
            tabsSlot.className = 'fedora-terminal-header__tabs';
            tabsSlot.setAttribute('data-window-drag-region', '');
            const right = header.querySelectorAll('nav')[1];
            if (right) {
                header.insertBefore(tabsSlot, right);
            } else {
                header.appendChild(tabsSlot);
            }
        }
        return tabsSlot;
    };

    const usesMintTerminalTabs = () => Boolean(
        global.document && global.document.body && global.document.body.id === 'mint',
    );

    const buildTabButton = (tab, isActive, allowClose) => {
        const btn = global.document.createElement('button');
        btn.type = 'button';
        const mintTabs = usesMintTerminalTabs();
        const tabClass = mintTabs ? 'terminal-tabs__tab' : 'fedora-terminal-tabs__tab';
        const activeClass = mintTabs ? 'terminal-tabs__tab--active' : 'fedora-terminal-tabs__tab--active';
        btn.className = tabClass + (isActive ? ' ' + activeClass : '');
        btn.dataset.tabId = tab.id;
        btn.dataset.tabPrompt = tab.title;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        btn.title = tab.title || '';
        const label = global.document.createElement('span');
        label.className = 'fedora-terminal-tabs__label';
        label.textContent = shortenTabLabel(tab.title);
        btn.appendChild(label);
        if (isActive && allowClose) {
            const close = global.document.createElement('span');
            close.className = 'fedora-terminal-tabs__close';
            close.setAttribute('aria-hidden', 'true');
            close.textContent = '×';
            btn.appendChild(close);
        }
        return btn;
    };

    const resolveTabButtonSelector = () => (
        usesMintTerminalTabs() ? '.terminal-tabs__tab' : '.fedora-terminal-tabs__tab'
    );

    const resolveActiveTabClass = () => (
        usesMintTerminalTabs() ? 'terminal-tabs__tab--active' : 'fedora-terminal-tabs__tab--active'
    );

    const renderTerminalTabs = (windowElement) => {
        const header = windowElement.querySelector('#windowHeader');
        const state = getWindowTabState(windowElement);
        if (!header || !state.tabs.length) {
            return;
        }
        const tabsSlot = ensureFedoraTabsSlot(header);
        let strip = tabsSlot.querySelector('.fedora-terminal-tabs, .terminal-tabs');
        if (!strip) {
            strip = global.document.createElement('div');
            strip.className = usesMintTerminalTabs()
                ? 'terminal-tabs'
                : 'fedora-terminal-tabs';
            strip.setAttribute('aria-label', 'Onglets du terminal');
            tabsSlot.appendChild(strip);
        } else if (usesMintTerminalTabs() && !strip.classList.contains('terminal-tabs')) {
            strip.classList.add('terminal-tabs');
        }

        strip.innerHTML = '';
        const allowClose = state.tabs.length > 1;
        state.tabs.forEach((tab) => {
            const isActive = tab.id === state.activeTabId;
            strip.appendChild(buildTabButton(tab, isActive, allowClose));
        });

        if (state.tabs.length > 1) {
            windowElement.classList.add('terminal-window--multitab');
        } else {
            windowElement.classList.remove('terminal-window--multitab');
        }

        if (strip.dataset.terminalTabsBound !== 'true') {
            strip.dataset.terminalTabsBound = 'true';
            strip.addEventListener('click', (event) => {
                const tabSelector = resolveTabButtonSelector();
                const activeClass = resolveActiveTabClass();
                const close = event.target.closest('.fedora-terminal-tabs__close');
                if (close) {
                    event.stopPropagation();
                    const tabBtn = close.closest(tabSelector);
                    const tabId = tabBtn && tabBtn.dataset.tabId;
                    if (tabId) {
                        closeTerminalTab(tabId);
                    }
                    return;
                }
                const tabBtn = event.target.closest(tabSelector);
                if (!tabBtn || tabBtn.classList.contains(activeClass)) {
                    return;
                }
                event.stopPropagation();
                activateTerminalTab(tabBtn.dataset.tabId);
            });
        }
    };

    const ensureTabState = (windowElement, session, elements) => {
        const state = getWindowTabState(windowElement);
        const forceFresh = shouldForceFreshTerminalSession();
        if (forceFresh && state.tabs.length) {
            state.tabs = [];
            state.activeTabId = null;
        }
        if (!state.tabs.length) {
            const stored = forceFresh ? null : loadTabsFromStorage(windowElement);
            if (stored) {
                state.tabs = stored.tabs;
                state.activeTabId = stored.activeTabId;
            } else {
                const tab = createEmptyTab();
                if (session && elements) {
                    captureTabSession(tab, session, elements);
                }
                state.tabs = [tab];
                state.activeTabId = tab.id;
            }
        }
        if (!state.activeTabId) {
            state.activeTabId = state.tabs[0].id;
        }
        return state;
    };

    const clearForceFreshTerminalSessionFlag = () => {
        delete global.CAPSULE_TERMINAL_FORCE_FRESH;
    };

    function syncTerminalTabs(windowElement) {
        if (!usesTerminalTabs() || restoringTabs) {
            return;
        }
        const resolvedWindow = getTerminalWindow(windowElement);
        const elements = resolvedWindow && getTerminalElements(resolvedWindow);
        const session = elements && elements.app.__capsuleTerminalSession;
        if (!resolvedWindow || !elements || !session) {
            return;
        }
        const state = ensureTabState(resolvedWindow, session, elements);
        const tab = getActiveTab(state);
        if (!tab) {
            return;
        }
        captureTabSession(tab, session, elements);
        renderTerminalTabs(resolvedWindow);
        persistTabsToStorage(resolvedWindow);
        if (typeof global.syncTerminalGnomeDataset === 'function') {
            global.syncTerminalGnomeDataset(resolvedWindow);
        }
    }

    function activateTerminalTab(tabId) {
        if (!usesTerminalTabs() || !tabId) {
            return;
        }
        const windowElement = getTerminalWindow();
        const elements = windowElement && getTerminalElements(windowElement);
        const session = elements && elements.app.__capsuleTerminalSession;
        if (!windowElement || !elements || !session) {
            return;
        }
        const state = ensureTabState(windowElement, session, elements);
        const target = state.tabs.find((entry) => entry.id === tabId);
        if (!target || state.activeTabId === tabId) {
            return;
        }

        const current = getActiveTab(state);
        if (current) {
            captureTabSession(current, session, elements);
        }

        restoringTabs = true;
        state.activeTabId = target.id;
        applyTabSession(target, session, elements);
        renderTerminalTabs(windowElement);
        restoringTabs = false;
        persistTabsToStorage(windowElement);

        if (elements.commandInput) {
            elements.commandInput.focus();
        }
    }

    function openTerminalTab() {
        if (!usesTerminalTabs()) {
            return null;
        }
        const windowElement = getTerminalWindow();
        const elements = windowElement && getTerminalElements(windowElement);
        const session = elements && elements.app.__capsuleTerminalSession;
        if (!windowElement || !elements || !session) {
            return null;
        }
        const state = ensureTabState(windowElement, session, elements);
        const current = getActiveTab(state);
        if (current) {
            captureTabSession(current, session, elements);
        }

        const tab = createEmptyTab();
        state.tabs.push(tab);
        state.activeTabId = tab.id;

        restoringTabs = true;
        applyTabSession(tab, session, elements);
        renderTerminalTabs(windowElement);
        restoringTabs = false;
        persistTabsToStorage(windowElement);

        const addBtn = windowElement.querySelector('.fedora-terminal-header__button--add');
        if (addBtn) {
            addBtn.setAttribute('aria-pressed', 'true');
        }
        if (elements.commandInput) {
            elements.commandInput.focus();
        }
        return tab;
    }

    function closeTerminalTab(tabId) {
        if (!usesTerminalTabs() || !tabId) {
            return;
        }
        const windowElement = getTerminalWindow();
        const elements = windowElement && getTerminalElements(windowElement);
        const session = elements && elements.app.__capsuleTerminalSession;
        if (!windowElement || !elements || !session) {
            return;
        }
        const state = ensureTabState(windowElement, session, elements);
        if (state.tabs.length <= 1) {
            return;
        }
        const index = state.tabs.findIndex((tab) => tab.id === tabId);
        if (index < 0) {
            return;
        }

        const wasActive = state.activeTabId === tabId;
        state.tabs.splice(index, 1);

        if (wasActive) {
            const next = state.tabs[Math.max(0, index - 1)] || state.tabs[0];
            restoringTabs = true;
            state.activeTabId = next.id;
            applyTabSession(next, session, elements);
            restoringTabs = false;
        }
        renderTerminalTabs(windowElement);
        persistTabsToStorage(windowElement);
        if (elements.commandInput) {
            elements.commandInput.focus();
        }
    }

    function bindTerminalTabs(windowElement, elements, session) {
        if (!usesTerminalTabs() || !windowElement || !elements || !session) {
            return;
        }
        if (windowElement.dataset.terminalTabsInit === 'true') {
            syncTerminalTabs(windowElement);
            return;
        }

        const state = ensureTabState(windowElement, session, elements);
        const active = getActiveTab(state);

        restoringTabs = true;
        if (active) {
            if (shouldForceFreshTerminalSession()) {
                active.history = [];
                active.outputHtml = '';
                active.commandDraft = '';
            }
            applyTabSession(active, session, elements);
        }
        restoringTabs = false;

        renderTerminalTabs(windowElement);
        windowElement.dataset.terminalTabsInit = 'true';
        persistTabsToStorage(windowElement);
        clearForceFreshTerminalSessionFlag();
    }

    function scheduleTerminalTabsBind(windowElement) {
        if (!usesTerminalTabs() || !windowElement) {
            return;
        }
        const elements = getTerminalElements(windowElement);
        const session = elements && elements.app && elements.app.__capsuleTerminalSession;
        if (!elements || !session) {
            return;
        }
        bindTerminalTabs(windowElement, elements, session);
    }

    global.syncTerminalTabs = syncTerminalTabs;
    global.activateTerminalTab = activateTerminalTab;
    global.openTerminalTab = openTerminalTab;
    global.closeTerminalTab = closeTerminalTab;
    global.bindTerminalTabs = bindTerminalTabs;
    global.scheduleTerminalTabsBind = scheduleTerminalTabsBind;
    global.persistTerminalTabs = persistTabsToStorage;
    global.resolveTerminalTabsStorageKey = getTabsStorageKey;

    const resolveTerminalStorageKeys = (windowElement) => {
        const keys = [getTabsStorageKey(windowElement)];
        if (getWindowInstanceId(windowElement) === 'primary') {
            keys.push(getTabsStorageKey(windowElement).replace(/:primary$/, ''));
        }
        return keys;
    };

    const resetTerminalVisualSurface = (windowElement) => {
        if (!windowElement) {
            return;
        }
        const output = windowElement.querySelector('[data-terminal-output], #output');
        const commandInput = windowElement.querySelector('[data-terminal-command], #command');
        const prompt = windowElement.querySelector('[data-terminal-prompt], #prompt');
        const form = windowElement.querySelector('[data-terminal-form], #input');
        if (output) {
            output.innerHTML = '';
        }
        if (commandInput) {
            commandInput.value = '';
            commandInput.disabled = false;
        }
        if (form && typeof form.reset === 'function') {
            form.reset();
        }
        if (prompt) {
            prompt.textContent = '';
        }
    };

    const purgeTerminalWindowRuntime = (windowElement) => {
        if (!windowElement) {
            return;
        }
        removeStorageKeys(resolveTerminalStorageKeys(windowElement));
        delete windowElement.__capsuleTerminalTabState;
        delete windowElement.dataset.terminalTabsInit;
        windowElement.classList.remove('terminal-window--multitab');

        const app = windowElement.querySelector('[data-terminal-app]');
        if (app) {
            delete app.__capsuleTerminalSession;
            delete app.dataset.terminalReady;
            delete app.dataset.terminalBooting;
        }

        resetTerminalVisualSurface(windowElement);

        const strip = windowElement.querySelector('.fedora-terminal-tabs');
        if (strip) {
            strip.innerHTML = '';
        }
    };

    const reopenTerminalWindow = (windowElement) => {
        if (!windowElement || typeof global.initTerminalForContainer !== 'function') {
            return;
        }
        global.initTerminalForContainer(windowElement);
    };

    if (global.CapsuleWindowMemory && typeof global.CapsuleWindowMemory.register === 'function') {
        const sessionTier = (global.CapsuleMemoryConventions && global.CapsuleMemoryConventions.TIERS)
            ? global.CapsuleMemoryConventions.TIERS.SESSION
            : (global.CapsuleWindowMemory.TIERS && global.CapsuleWindowMemory.TIERS.SESSION);
        global.CapsuleWindowMemory.register({
            slotId: 'terminal',
            tier: sessionTier || 'session',
            resolveStorageKeys: resolveTerminalStorageKeys,
            purgeRuntime: purgeTerminalWindowRuntime,
            onReopen: reopenTerminalWindow,
        });
    }

    global.purgeTerminalWindowRuntime = purgeTerminalWindowRuntime;
    global.shouldForceFreshTerminalSession = shouldForceFreshTerminalSession;

    if (global.document) {
        global.document.addEventListener('keydown', (event) => {
            if (!usesTerminalTabs() || !global.document.body || global.document.body.id !== 'mint') {
                return;
            }
            if (event.ctrlKey && event.shiftKey && (event.key === 'T' || event.key === 't')) {
                event.preventDefault();
                openTerminalTab();
            }
        });
        global.document.addEventListener('capsule:slot-injected', (event) => {
            const detail = event.detail || {};
            if (detail.slotId === 'terminal' && detail.container && detail.container.dataset) {
                delete detail.container.dataset.terminalTabsInit;
            }
        });
        global.document.addEventListener('capsule:window-focused', (event) => {
            const detail = event.detail || {};
            if (detail.slotId !== 'terminal' || !detail.container) {
                return;
            }
            const elements = getTerminalElements(detail.container);
            if (elements && elements.commandInput && detail.container.classList.contains('windowElementActive')) {
                elements.commandInput.focus();
            }
        });
    }
}(typeof window !== 'undefined' ? window : globalThis));
