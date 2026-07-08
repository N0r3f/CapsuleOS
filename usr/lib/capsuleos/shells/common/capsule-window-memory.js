/**
 * Noyau CapsuleOS — gestion mémoire fenêtre par profil (tier).
 *
 * Règles :
 * - SESSION    : purgé à la fermeture utilisateur (capsule:window-closed).
 * - PERSISTENT : jamais purgé par ce module (préférences, FS utilisateur, etc.).
 * - Réouverture après purge SESSION → onReopen pour état vierge.
 *
 * Enregistrement :
 *   CapsuleWindowMemory.register({
 *     slotId: 'terminal',
 *     tier: CapsuleMemoryConventions.TIERS.SESSION,
 *     resolveStorageKeys, purgeRuntime, onReopen,
 *   });
 */
(function initCapsuleWindowMemory(global) {
    'use strict';

    const conventions = () => global.CapsuleMemoryConventions || null;

    const TIERS = conventions()
        ? conventions().TIERS
        : Object.freeze({ PERSISTENT: 'persistent', SESSION: 'session' });

    /** @type {Map<string, Map<string, { resolveStorageKeys?: Function, purgeRuntime?: Function, onReopen?: Function }>>} */
    const handlersBySlot = new Map();

    function resolveSlotId(container) {
        return container && container.dataset ? container.dataset.link : null;
    }

    function normalizeStorageKeys(keys) {
        if (!keys) {
            return [];
        }
        if (Array.isArray(keys)) {
            return keys.filter(Boolean);
        }
        return keys ? [String(keys)] : [];
    }

    function removeStorageKeys(keys) {
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
    }

    function resolveTier(handler) {
        if (!handler || !handler.tier) {
            return TIERS.SESSION;
        }
        return String(handler.tier);
    }

    function ensureSlotMap(slotId) {
        const key = String(slotId);
        if (!handlersBySlot.has(key)) {
            handlersBySlot.set(key, new Map());
        }
        return handlersBySlot.get(key);
    }

    function register(handler) {
        if (!handler || !handler.slotId) {
            return false;
        }
        const tier = resolveTier(handler);
        const conv = conventions();
        if (conv && typeof conv.tierAllowsPurgeOnClose === 'function'
            && !conv.tierAllowsPurgeOnClose(tier) && handler.purgeRuntime) {
            console.warn(
                `CapsuleOS: slot "${handler.slotId}" — purgeRuntime ignoré pour tier PERSISTENT`
            );
        }
        const slotHandlers = ensureSlotMap(handler.slotId);
        slotHandlers.set(tier, {
            resolveStorageKeys: typeof handler.resolveStorageKeys === 'function'
                ? handler.resolveStorageKeys
                : null,
            purgeRuntime: typeof handler.purgeRuntime === 'function'
                ? handler.purgeRuntime
                : null,
            onReopen: typeof handler.onReopen === 'function'
                ? handler.onReopen
                : null,
        });
        return true;
    }

    function getHandler(slotId, tier) {
        const slotHandlers = handlersBySlot.get(String(slotId));
        if (!slotHandlers) {
            return null;
        }
        return slotHandlers.get(tier || TIERS.SESSION) || null;
    }

    function getHandlersForPurge(slotId, tiers) {
        const slotHandlers = handlersBySlot.get(String(slotId));
        if (!slotHandlers) {
            return [];
        }
        const list = [];
        tiers.forEach((tier) => {
            const handler = slotHandlers.get(tier);
            if (handler) {
                list.push({ tier, handler });
            }
        });
        return list;
    }

    function purgeStorage(container, tier) {
        const handler = getHandler(resolveSlotId(container), tier);
        if (!handler || !handler.resolveStorageKeys) {
            return [];
        }
        const keys = normalizeStorageKeys(handler.resolveStorageKeys(container));
        removeStorageKeys(keys);
        return keys;
    }

    function purgeRuntime(container, tier) {
        const handler = getHandler(resolveSlotId(container), tier);
        if (!handler || !handler.purgeRuntime) {
            return;
        }
        handler.purgeRuntime(container);
    }

    function purge(container, options) {
        if (!container) {
            return { storageKeys: [], slotId: null, tiers: [] };
        }
        const opts = options || {};
        const tiers = Array.isArray(opts.tiers) && opts.tiers.length
            ? opts.tiers
            : [TIERS.SESSION];
        const slotId = resolveSlotId(container);
        const storageKeys = [];
        tiers.forEach((tier) => {
            storageKeys.push(...purgeStorage(container, tier));
            purgeRuntime(container, tier);
        });
        if (tiers.indexOf(TIERS.SESSION) >= 0 && container.dataset) {
            container.dataset.capsuleMemoryPurged = 'true';
        }
        return { storageKeys, slotId, tiers };
    }

    function handleReopen(container, slotId) {
        const handler = getHandler(slotId, TIERS.SESSION);
        if (!handler || !handler.onReopen) {
            return;
        }
        handler.onReopen(container);
    }

    function onWindowClosed(event) {
        const detail = event && event.detail ? event.detail : {};
        const container = detail.container;
        if (!container) {
            return;
        }
        purge(container, { tiers: [TIERS.SESSION] });
    }

    function onWindowOpened(event) {
        const detail = event && event.detail ? event.detail : {};
        const container = detail.container;
        const slotId = detail.slotId || resolveSlotId(container);
        if (!container || !slotId) {
            return;
        }
        if (container.dataset && container.dataset.capsuleMemoryPurged === 'true') {
            delete container.dataset.capsuleMemoryPurged;
            handleReopen(container, slotId);
        }
    }

    if (typeof document !== 'undefined') {
        document.addEventListener('capsule:window-closed', onWindowClosed);
        document.addEventListener('capsule:window-opened', onWindowOpened);
    }

    global.CapsuleWindowMemory = {
        TIERS,
        register,
        purge,
        purgeStorage,
        purgeRuntime,
        getHandler,
        getHandlersForPurge,
    };
}(typeof window !== 'undefined' ? window : globalThis));
