/**
 * Bureaux virtuels GNOME — 4 espaces fixes (Rocky RL10), raccourcis Super+Page Up/Down.
 */
(function initGnomeWorkspaces(global) {
    'use strict';

    const GNOME_IDS = new Set(['rocky', 'fedora', 'alma', 'ubuntu', 'anduinos']);
    const FIXED_WORKSPACE_COUNT = 4;

    function getWorkspaceCount() {
        const dynamic = global.document.documentElement.dataset.dynamicWorkspaces === 'on';
        return dynamic ? 2 : FIXED_WORKSPACE_COUNT;
    }

    function isGnomeShell() {
        const bodyId = global.document && global.document.body ? global.document.body.id : '';
        return GNOME_IDS.has(bodyId);
    }

    function shellRoot() {
        return global.document.getElementById('rocky')
            || global.document.getElementById('fedora')
            || global.document.getElementById('alma')
            || global.document.getElementById('ubuntu')
            || global.document.getElementById('anduinos');
    }

    function getActiveIndex() {
        const root = shellRoot();
        if (!root) {
            return 0;
        }
        const raw = Number(root.dataset.activeWorkspace || 0);
        const count = getWorkspaceCount();
        return Number.isFinite(raw) ? Math.max(0, Math.min(count - 1, raw)) : 0;
    }

    function setActiveIndex(index, options) {
        const root = shellRoot();
        if (!root) {
            return;
        }
        const count = getWorkspaceCount();
        const next = Math.max(0, Math.min(count - 1, index));
        root.dataset.activeWorkspace = String(next);
        root.dataset.workspaceCount = String(count);
        updateMiniStrip(next);
        updateWorkspaceStage(next);
        applyWindowVisibility(next);
        if (!options || !options.silent) {
            root.dispatchEvent(new CustomEvent('capsule:workspace-change', {
                bubbles: true,
                detail: { index: next, count: count },
            }));
        }
    }

    function applyWindowVisibility(activeIndex) {
        global.document.querySelectorAll('.windowElement[data-link]').forEach((win) => {
            const slot = win.dataset.link;
            if (!slot || slot === 'mainMenu') {
                return;
            }
            if (win.style.display === 'none') {
                return;
            }
            const ws = Number(win.dataset.workspaceIndex || 0);
            win.classList.toggle('workspace-offscreen', ws !== activeIndex);
        });
    }

    function assignWindowToWorkspace(win, index) {
        if (!win) {
            return;
        }
        win.dataset.workspaceIndex = String(index);
        applyWindowVisibility(getActiveIndex());
    }

    function getFocusedWindow() {
        const active = global.document.querySelector('.windowElement.windowElementActive[data-link]');
        if (active && active.style.display !== 'none') {
            return active;
        }
        const visible = Array.from(global.document.querySelectorAll('.windowElement[data-link]'))
            .find((win) => win.style.display !== 'none' && win.dataset.link !== 'mainMenu');
        return visible || null;
    }

    function updateMiniStrip(activeIndex) {
        const strip = global.document.querySelector('[data-gnome-workspaces-mini]');
        if (!strip) {
            return;
        }
        strip.classList.add('is-spring-update');
        strip.innerHTML = '';
        const count = getWorkspaceCount();
        for (let i = 0; i < count; i += 1) {
            const btn = global.document.createElement('button');
            btn.type = 'button';
            btn.className = 'fedora-overview__mini-workspace';
            btn.dataset.workspaceSelect = String(i);
            btn.setAttribute('aria-label', `Bureau ${i + 1}`);
            if (i === activeIndex) {
                btn.classList.add('is-active');
                btn.setAttribute('aria-current', 'true');
            }
            if (i === activeIndex) {
                btn.addEventListener('click', () => {
                    if (global.CapsuleGnomeOverview && typeof global.CapsuleGnomeOverview.setOverview === 'function') {
                        global.CapsuleGnomeOverview.setOverview(false);
                    }
                });
            } else {
                btn.addEventListener('click', () => {
                    setActiveIndex(i);
                    if (global.CapsuleGnomeOverview && typeof global.CapsuleGnomeOverview.setOverview === 'function') {
                        global.CapsuleGnomeOverview.setOverview(false);
                    }
                });
            }
            strip.appendChild(btn);
        }
        global.requestAnimationFrame(() => {
            global.setTimeout(() => strip.classList.remove('is-spring-update'), 360);
        });
    }

    function updateWorkspaceCardThumbnails(activeIndex) {
        const card = global.document.querySelector('.fedora-overview__workspace-card');
        const mainRow = global.document.querySelector('.fedora-main-row');
        if (!card || !mainRow) {
            return;
        }
        let layer = card.querySelector('.fedora-overview__workspace-thumbs');
        if (!layer) {
            layer = global.document.createElement('div');
            layer.className = 'fedora-overview__workspace-thumbs';
            layer.setAttribute('aria-hidden', 'true');
            card.appendChild(layer);
        }
        layer.innerHTML = '';
        const rowRect = mainRow.getBoundingClientRect();
        if (!rowRect.width || !rowRect.height) {
            return;
        }
        const wins = Array.from(global.document.querySelectorAll('.windowElement[data-link]'))
            .filter((win) => {
                const slot = win.dataset.link;
                if (!slot || slot === 'mainMenu' || win.style.display === 'none') {
                    return false;
                }
                return Number(win.dataset.workspaceIndex || 0) === activeIndex;
            });
        wins.forEach((win) => {
            const rect = win.getBoundingClientRect();
            if (!rect.width || !rect.height) {
                return;
            }
            const thumb = global.document.createElement('span');
            thumb.className = 'fedora-overview__workspace-thumb';
            if (win.classList.contains('windowElementActive')) {
                thumb.classList.add('is-focused');
            }
            const left = ((rect.left - rowRect.left) / rowRect.width) * 100;
            const top = ((rect.top - rowRect.top) / rowRect.height) * 100;
            const width = (rect.width / rowRect.width) * 100;
            const height = (rect.height / rowRect.height) * 100;
            thumb.style.left = `${Math.max(0, Math.min(92, left))}%`;
            thumb.style.top = `${Math.max(0, Math.min(92, top))}%`;
            thumb.style.width = `${Math.max(8, Math.min(88, width))}%`;
            thumb.style.height = `${Math.max(6, Math.min(88, height))}%`;
            layer.appendChild(thumb);
        });
    }

    function updateWorkspaceStage(activeIndex) {
        const stage = global.document.querySelector('[data-gnome-workspace-stage]');
        if (!stage) {
            return;
        }
        stage.dataset.activeWorkspace = String(activeIndex);
        const card = stage.querySelector('.fedora-overview__workspace-card');
        const peekNext = stage.querySelector('.fedora-overview__workspace-next');
        const peekPrev = stage.querySelector('.fedora-overview__workspace-prev');
        if (card) {
            card.dataset.workspaceIndex = String(activeIndex);
        }
        if (peekNext) {
            const count = getWorkspaceCount();
            peekNext.hidden = activeIndex >= count - 1;
            peekNext.dataset.workspaceIndex = String(activeIndex + 1);
        }
        if (peekPrev) {
            peekPrev.hidden = activeIndex <= 0;
            peekPrev.dataset.workspaceIndex = String(activeIndex - 1);
        }
        updateWorkspaceCardThumbnails(activeIndex);
    }

    function bindMiniStripDelegation() {
        const strip = global.document.querySelector('[data-gnome-workspaces-mini]');
        if (!strip || strip.dataset.bound === '1') {
            return;
        }
        strip.dataset.bound = '1';
        strip.addEventListener('click', (event) => {
            const btn = event.target.closest('[data-workspace-select]');
            if (!btn || !strip.contains(btn)) {
                return;
            }
            setActiveIndex(Number(btn.dataset.workspaceSelect));
        });
    }

    function bindWorkspacePeek() {
        const stage = global.document.querySelector('[data-gnome-workspace-stage]');
        if (!stage || stage.dataset.peekBound === '1') {
            return;
        }
        stage.dataset.peekBound = '1';
        stage.addEventListener('click', (event) => {
            const next = event.target.closest('.fedora-overview__workspace-next');
            const prev = event.target.closest('.fedora-overview__workspace-prev');
            if (next && !next.hidden) {
                setActiveIndex(Number(next.dataset.workspaceIndex));
                return;
            }
            if (prev && !prev.hidden) {
                setActiveIndex(Number(prev.dataset.workspaceIndex));
            }
        });
    }

    function moveFocusedWindow(delta) {
        const win = getFocusedWindow();
        if (!win) {
            return;
        }
        const current = Number(win.dataset.workspaceIndex || getActiveIndex());
        assignWindowToWorkspace(win, Math.max(0, Math.min(getWorkspaceCount() - 1, current + delta)));
    }

    function bindKeyboard() {
        global.document.addEventListener('keydown', (event) => {
            if (!isGnomeShell()) {
                return;
            }
            const tag = event.target && event.target.tagName;
            const typing = tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable;
            if (typing) {
                return;
            }

            if (event.metaKey && event.key === 'PageDown' && !event.shiftKey) {
                event.preventDefault();
                setActiveIndex(getActiveIndex() + 1);
                return;
            }
            if (event.metaKey && event.key === 'PageUp' && !event.shiftKey) {
                event.preventDefault();
                setActiveIndex(getActiveIndex() - 1);
                return;
            }
            if (event.metaKey && event.shiftKey && event.key === 'PageDown') {
                event.preventDefault();
                moveFocusedWindow(1);
                return;
            }
            if (event.metaKey && event.shiftKey && event.key === 'PageUp') {
                event.preventDefault();
                moveFocusedWindow(-1);
            }
        });
    }

    function bindWindowOpen() {
        global.document.addEventListener('capsule:slot-injected', (event) => {
            const win = event.target && event.target.closest
                ? event.target.closest('.windowElement[data-link]')
                : null;
            if (win && win.dataset.workspaceIndex === undefined) {
                win.dataset.workspaceIndex = String(getActiveIndex());
            }
        });
        global.document.addEventListener('click', (event) => {
            const link = event.target.closest('a[target="windowElement"][data-link], button[data-overview-link]');
            if (!link) {
                return;
            }
            const slot = link.getAttribute('data-link') || link.getAttribute('data-overview-link');
            if (!slot) {
                return;
            }
            global.setTimeout(() => {
                const win = global.document.querySelector(`.windowElement[data-link="${slot}"]`);
                if (win && win.style.display !== 'none') {
                    assignWindowToWorkspace(win, getActiveIndex());
                }
            }, 50);
        });
    }

    function init() {
        if (!isGnomeShell()) {
            return;
        }
        setActiveIndex(0, { silent: true });
        updateMiniStrip(0);
        bindMiniStripDelegation();
        bindWorkspacePeek();
        bindKeyboard();
        bindWindowOpen();

        global.document.addEventListener('capsule:workspaces-config-changed', () => {
            if (global.CapsuleGnomeWorkspaces && typeof global.CapsuleGnomeWorkspaces.reconfigure === 'function') {
                global.CapsuleGnomeWorkspaces.reconfigure();
            }
        });

        global.document.addEventListener('capsule:window-opened', () => {
            updateWorkspaceCardThumbnails(getActiveIndex());
        });
        global.document.addEventListener('capsule:window-focused', () => {
            updateWorkspaceCardThumbnails(getActiveIndex());
        });

        global.CapsuleGnomeWorkspaces = {
            get count() {
                return getWorkspaceCount();
            },
            getActiveIndex,
            setActiveIndex,
            assignWindowToWorkspace,
            refreshWorkspacePreviews: () => updateWorkspaceCardThumbnails(getActiveIndex()),
            reconfigure() {
                const active = getActiveIndex();
                setActiveIndex(Math.min(active, getWorkspaceCount() - 1), { silent: true });
                updateMiniStrip(getActiveIndex());
                updateWorkspaceStage(getActiveIndex());
            },
        };
    }

    if (typeof global.document !== 'undefined' && global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }
}(typeof window !== 'undefined' ? window : globalThis));
