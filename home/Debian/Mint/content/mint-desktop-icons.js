/**
 * Icônes bureau Cinnamon — ouverture Nemo, presse-papiers, renommage, suppression.
 */
(function initMintDesktopIcons(global) {
    'use strict';

    var desktopClipboard = null;
    var STORAGE_KEY = 'capsule-mint-desktop-icons';

    function isMintDesktop() {
        return global.document && global.document.body && global.document.body.id === 'mint';
    }

    function readStore() {
        try {
            var raw = global.localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : { hidden: [], labels: {} };
        } catch (error) {
            return { hidden: [], labels: {} };
        }
    }

    function writeStore(store) {
        try {
            global.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        } catch (error) {
            /* quota */
        }
    }

    function getHomeRoot() {
        if (typeof global.getFileExplorerRoot === 'function') {
            return String(global.getFileExplorerRoot()).replace(/\/+$/, '');
        }
        var root = global.CAPSULE_CONTENT_ROOT || global.CAPSULE_USER_HOME || 'home/public';
        return String(root).replace(/\/+$/, '');
    }

    function getTrashPlace() {
        return global.CAPSULE_PLACE_TRASH || '__capsule/place/trash';
    }

    function resolveIconTarget(kind) {
        if (kind === 'home') {
            return getHomeRoot();
        }
        if (kind === 'trash') {
            return getTrashPlace();
        }
        if (kind === 'filesystem') {
            return global.CAPSULE_PLACE_FILESYSTEM || '__capsule/place/filesystem';
        }
        return null;
    }

    function iconEntryFromShortcut(shortcut) {
        var kind = shortcut.getAttribute('data-desktop-icon') || '';
        var labelNode = shortcut.querySelector('span');
        var label = labelNode ? labelNode.textContent.trim() : '';
        return {
            kind: kind,
            label: label,
            targetPath: resolveIconTarget(kind),
        };
    }

    function scheduleNemoNavigation(targetPath, afterNavigate) {
        if (typeof global.openWindowByDataLink === 'function') {
            global.openWindowByDataLink('nemo');
        }
        global.setTimeout(function onNemoOpen() {
            if (targetPath && typeof global.navigateToFileExplorerDirectory === 'function') {
                global.navigateToFileExplorerDirectory(targetPath, { updateHistory: true });
            }
            if (typeof afterNavigate === 'function') {
                global.setTimeout(afterNavigate, 280);
            }
        }, 420);
    }

    function openDesktopIcon(shortcut) {
        if (!shortcut) {
            return { ok: false };
        }
        var kind = shortcut.getAttribute('data-desktop-icon');
        var slot = shortcut.getAttribute('data-link');
        var target = resolveIconTarget(kind);
        if (target) {
            scheduleNemoNavigation(target);
            return { ok: true };
        }
        if (slot && typeof global.openWindowByDataLink === 'function') {
            global.openWindowByDataLink(slot);
            return { ok: true };
        }
        return { ok: false };
    }

    function cutDesktopIcon(shortcut) {
        if (!shortcut) {
            return { ok: false };
        }
        desktopClipboard = { op: 'cut', entry: iconEntryFromShortcut(shortcut) };
        if (global.fileExplorerState) {
            global.fileExplorerState.explorerClipboard = null;
        }
        return { ok: true };
    }

    function copyDesktopIcon(shortcut) {
        if (!shortcut) {
            return { ok: false };
        }
        desktopClipboard = { op: 'copy', entry: iconEntryFromShortcut(shortcut) };
        return { ok: true };
    }

    function renameDesktopIcon(shortcut) {
        if (!shortcut) {
            return { ok: false };
        }
        var span = shortcut.querySelector('span');
        if (!span || typeof global.prompt !== 'function') {
            return { ok: false };
        }
        var current = span.textContent.trim();
        var next = global.prompt('Nouveau nom :', current);
        if (next === null) {
            return { ok: false, cancelled: true };
        }
        var trimmed = next.trim();
        if (!trimmed) {
            return { ok: false };
        }
        span.textContent = trimmed;
        var store = readStore();
        var kind = shortcut.getAttribute('data-desktop-icon') || '';
        store.labels[kind] = trimmed;
        writeStore(store);
        return { ok: true, label: trimmed };
    }

    function deleteDesktopIcon(shortcut) {
        if (!shortcut) {
            return { ok: false };
        }
        var kind = shortcut.getAttribute('data-desktop-icon') || '';
        shortcut.hidden = true;
        shortcut.setAttribute('aria-hidden', 'true');
        var store = readStore();
        if (store.hidden.indexOf(kind) < 0) {
            store.hidden.push(kind);
        }
        writeStore(store);
        if (desktopClipboard && desktopClipboard.entry && desktopClipboard.entry.kind === kind) {
            desktopClipboard = null;
        }
        return { ok: true };
    }

    function showDesktopIconProperties(shortcut) {
        if (!shortcut) {
            return { ok: false };
        }
        var entry = iconEntryFromShortcut(shortcut);
        var item = {
            name: entry.label,
            type: 'folder',
            targetPath: entry.targetPath || entry.label,
        };
        scheduleNemoNavigation(entry.targetPath, function onNavDone() {
            if (typeof global.openExplorerProperties === 'function') {
                global.openExplorerProperties(item);
            }
        });
        return { ok: true };
    }

    function restoreDesktopIconState() {
        var store = readStore();
        global.document.querySelectorAll('.desktop-shortcut[data-desktop-icon]').forEach(function (shortcut) {
            var kind = shortcut.getAttribute('data-desktop-icon') || '';
            if (store.hidden.indexOf(kind) >= 0) {
                shortcut.hidden = true;
                shortcut.setAttribute('aria-hidden', 'true');
            }
            if (store.labels[kind]) {
                var span = shortcut.querySelector('span');
                if (span) {
                    span.textContent = store.labels[kind];
                }
            }
        });
    }

    function bindDesktopIconOpen(shortcut) {
        shortcut.addEventListener('click', function onIconClick(event) {
            if (shortcut.getAttribute('data-mint-favorite')) {
                return;
            }
            event.preventDefault();
            openDesktopIcon(shortcut);
        });
    }

    function init() {
        if (!isMintDesktop()) {
            return;
        }
        restoreDesktopIconState();
        global.document.querySelectorAll('.desktop-shortcut[data-desktop-icon]').forEach(bindDesktopIconOpen);
    }

    global.openMintDesktopIcon = openDesktopIcon;
    global.cutMintDesktopIcon = cutDesktopIcon;
    global.copyMintDesktopIcon = copyDesktopIcon;
    global.renameMintDesktopIcon = renameDesktopIcon;
    global.deleteMintDesktopIcon = deleteDesktopIcon;
    global.showMintDesktopIconProperties = showDesktopIconProperties;
    global.getMintDesktopIconClipboard = function getMintDesktopIconClipboard() {
        return desktopClipboard;
    };

    if (global.document.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}(typeof window !== 'undefined' ? window : globalThis));
