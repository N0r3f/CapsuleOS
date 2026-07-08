/**
 * Persistance locale profil dev (account.html) — localStorage.
 */
(function (global) {
    'use strict';

    var STORAGE_KEY = 'capsule_portal_dev_account';
    var INVITE_DAYS = 7;

    var DEV_MODULE_CATALOG = [
        { mountId: 'createur/reseau-linux', title: 'Réseau Linux', price: '9 €', creatorName: 'Camille Renard', storeOs: 'linux-mint', storeLabel: 'Gestionnaire de logiciels · Mint' },
        { mountId: 'createur/bash-avance', title: 'Bash avancé', price: '12 €', creatorName: 'Alexandre Martin', storeOs: 'linux-rocky', storeLabel: 'GNOME Logiciels · Rocky' },
        { mountId: 'createur/docker-initiation', title: 'Docker initiation', price: '15 €', creatorName: 'Sophie Lambert', storeOs: 'linux-fedora', storeLabel: 'GNOME Logiciels · Fedora' },
        { mountId: 'createur/securite-debutant', title: 'Sécurité débutant', price: '11 €', creatorName: 'Thomas Girard', storeOs: 'linux-kde-neon', storeLabel: 'Discover · KDE Neon' },
    ];

    function catalogByMountId(mountId) {
        for (var i = 0; i < DEV_MODULE_CATALOG.length; i += 1) {
            if (DEV_MODULE_CATALOG[i].mountId === mountId) {
                return DEV_MODULE_CATALOG[i];
            }
        }
        return null;
    }

    function enrichPurchase(purchase) {
        if (!purchase || !purchase.moduleId) {
            return purchase;
        }
        var meta = catalogByMountId(purchase.moduleId);
        if (!meta) {
            return purchase;
        }
        return {
            id: purchase.id,
            moduleId: purchase.moduleId,
            title: purchase.title || meta.title,
            creatorName: purchase.creatorName || meta.creatorName || '',
            storeOs: purchase.storeOs || meta.storeOs || '',
            storeLabel: purchase.storeLabel || meta.storeLabel || '',
            purchasedAt: purchase.purchasedAt,
        };
    }

    function migratePurchases(purchases) {
        if (!Array.isArray(purchases)) {
            return [];
        }
        return purchases.map(enrichPurchase);
    }

    function purchasesNeedMigration(before, after) {
        if (!Array.isArray(before) || !Array.isArray(after) || before.length !== after.length) {
            return false;
        }
        for (var i = 0; i < before.length; i += 1) {
            if ((before[i].creatorName || '') !== (after[i].creatorName || '')
                || (before[i].title || '') !== (after[i].title || '')) {
                return true;
            }
        }
        return false;
    }

    function defaultState() {
        return {
            displayName: global.CAPSULE_PORTAL_DEV_DISPLAY_NAME || 'Abonné',
            email: global.CAPSULE_PORTAL_DEV_EMAIL || global.CAPSULE_PORTAL_DEV_USER || 'abonne@capsuleos.local',
            password: global.CAPSULE_PORTAL_DEV_PASSWORD || 'test123456789',
            tickets: [],
            ticketCounter: 0,
            classroom: null,
            studentClass: null,
            progress: [],
            skins: [],
            purchases: [],
            gamification: { xp: 120, level: 2, badges: ['first-login'] },
            osUsage: {},
            subscription: {
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false,
            },
            billing: {
                paymentMethod: 'Carte Visa ···· 4242',
                addressLine: '12 rue de la Capsule',
                postalCode: '75001',
                city: 'Paris',
            },
        };
    }

    function defaultPeriodEnd() {
        var d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString();
    }

    function ensureSubscription(state) {
        if (!state.subscription || typeof state.subscription !== 'object') {
            state.subscription = {
                currentPeriodEnd: defaultPeriodEnd(),
                cancelAtPeriodEnd: false,
            };
        }
        if (!state.subscription.currentPeriodEnd) {
            state.subscription.currentPeriodEnd = defaultPeriodEnd();
        }
        if (!state.billing || typeof state.billing !== 'object') {
            state.billing = {
                paymentMethod: 'Carte Visa ···· 4242',
                addressLine: '12 rue de la Capsule',
                postalCode: '75001',
                city: 'Paris',
            };
        }
        return state.subscription;
    }

    function load() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return defaultState();
            }
            var parsed = JSON.parse(raw);
            var base = defaultState();
            var key;
            for (key in base) {
                if (Object.prototype.hasOwnProperty.call(base, key) && parsed[key] === undefined) {
                    parsed[key] = base[key];
                }
            }
            parsed = migrateTickets(parsed);
            if (!Array.isArray(parsed.progress)) {
                parsed.progress = [];
            }
            if (!Array.isArray(parsed.skins)) {
                parsed.skins = [];
            }
            if (Array.isArray(parsed.purchases)) {
                var migratedPurchases = migratePurchases(parsed.purchases);
                if (purchasesNeedMigration(parsed.purchases, migratedPurchases)) {
                    parsed.purchases = migratedPurchases;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
                }
            }
            return parsed;
        } catch (_) {
            return defaultState();
        }
    }

    function save(state) {
        migrateTickets(state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function uid() {
        return String(Date.now()) + '-' + String(Math.floor(Math.random() * 10000));
    }

    function token() {
        var hex = '';
        for (var i = 0; i < 32; i += 1) {
            hex += Math.floor(Math.random() * 16).toString(16);
        }
        return hex;
    }

    function inviteExpiry() {
        var d = new Date();
        d.setDate(d.getDate() + INVITE_DAYS);
        return d.toISOString();
    }

    function formatDateFr(iso) {
        if (!iso) {
            return '-';
        }
        var d = new Date(iso);
        if (isNaN(d.getTime())) {
            return iso;
        }
        var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }

    function formatDateTimeFr(iso) {
        if (!iso) {
            return '-';
        }
        var d = new Date(iso);
        if (isNaN(d.getTime())) {
            return iso;
        }
        var months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        var dateLabel = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
        var hours = String(d.getHours()).padStart(2, '0');
        var minutes = String(d.getMinutes()).padStart(2, '0');
        return dateLabel + ' à ' + hours + ':' + minutes;
    }

    function migrateTickets(state) {
        if (!Array.isArray(state.tickets)) {
            state.tickets = [];
        }
        if (!state.ticketCounter) {
            state.ticketCounter = 0;
        }
        var maxNumber = state.ticketCounter;
        state.tickets.forEach(function (ticket) {
            if (!ticket || typeof ticket !== 'object') {
                return;
            }
            if (!ticket.number) {
                state.ticketCounter += 1;
                ticket.number = state.ticketCounter;
            }
            if (ticket.number > maxNumber) {
                maxNumber = ticket.number;
            }
            if (!Array.isArray(ticket.messages) && ticket.body) {
                ticket.messages = [{
                    authorRole: 'user',
                    authorName: state.displayName || 'Utilisateur',
                    body: ticket.body,
                    createdAt: ticket.createdAt || new Date().toISOString(),
                }];
            }
        });
        if (maxNumber > state.ticketCounter) {
            state.ticketCounter = maxNumber;
        }
        return state;
    }

    function scanChecklistProgress() {
        var found = [];
        var i;
        var key;
        for (i = 0; i < localStorage.length; i += 1) {
            key = localStorage.key(i);
            if (!key) {
                continue;
            }
            if (key.indexOf('checklist') === -1 && key.indexOf('linux-bases') === -1 && key.indexOf('mnt-') === -1) {
                continue;
            }
            try {
                var raw = localStorage.getItem(key);
                var state = raw ? JSON.parse(raw) : null;
                if (!state || typeof state !== 'object') {
                    continue;
                }
                var done = 0;
                var total = 0;
                Object.keys(state).forEach(function (k) {
                    total += 1;
                    if (state[k]) {
                        done += 1;
                    }
                });
                if (total === 0) {
                    continue;
                }
                found.push({
                    id: key,
                    storageKey: key,
                    title: key.replace(/-checklist.*$/, '').replace(/mnt[-:]/, '') || key,
                    doneCount: done,
                    totalCount: total,
                    updatedAt: new Date().toISOString(),
                    source: 'localStorage',
                });
            } catch (_) { /* ignore */ }
        }
        return found;
    }

    var api = {
        load: load,
        save: save,
        formatDateFr: formatDateFr,
        formatDateTimeFr: formatDateTimeFr,
        updateProfile: function (patch) {
            var s = load();
            if (patch.displayName !== undefined) {
                s.displayName = String(patch.displayName).trim();
            }
            if (patch.email !== undefined) {
                s.email = String(patch.email).trim();
            }
            if (patch.password !== undefined) {
                s.password = String(patch.password);
            }
            save(s);
            return s;
        },
        addTicket: function (type, subject, body) {
            var s = load();
            s.ticketCounter = (s.ticketCounter || 0) + 1;
            var now = new Date().toISOString();
            var authorName = s.displayName || 'Utilisateur';
            var ticket = {
                id: uid(),
                number: s.ticketCounter,
                type: type,
                subject: subject,
                body: body,
                status: 'ouvert',
                createdAt: now,
                messages: [{
                    authorRole: 'user',
                    authorName: authorName,
                    body: body,
                    createdAt: now,
                }],
            };
            s.tickets.unshift(ticket);
            save(s);
            return ticket;
        },
        closeTicket: function (ticketId, adminReply) {
            var s = load();
            var ticket = s.tickets.find(function (t) {
                return t && t.id === ticketId;
            });
            if (!ticket || ticket.status === 'clos') {
                return false;
            }
            ticket.status = 'clos';
            if (!Array.isArray(ticket.messages)) {
                ticket.messages = [];
            }
            if (adminReply) {
                ticket.messages.push({
                    authorRole: 'admin',
                    authorName: 'Support CapsuleOS',
                    body: String(adminReply),
                    createdAt: new Date().toISOString(),
                });
                ticket.lastMessageRole = 'admin';
            }
            save(s);
            return true;
        },
        replyTicket: function (ticketId, body) {
            var s = load();
            var ticket = s.tickets.find(function (t) {
                return t && String(t.id) === String(ticketId);
            });
            if (!ticket || ticket.status === 'clos') {
                return null;
            }
            var trimmed = String(body || '').trim();
            if (!trimmed) {
                return null;
            }
            if (!Array.isArray(ticket.messages)) {
                ticket.messages = [];
            }
            ticket.messages.push({
                authorRole: 'user',
                authorName: s.displayName || 'Utilisateur',
                body: trimmed,
                createdAt: new Date().toISOString(),
            });
            ticket.lastMessageRole = 'user';
            save(s);
            return ticket;
        },
        addAdminReply: function (ticketId, body) {
            var s = load();
            var ticket = s.tickets.find(function (t) {
                return t && String(t.id) === String(ticketId);
            });
            if (!ticket || ticket.status === 'clos') {
                return null;
            }
            var trimmed = String(body || '').trim();
            if (!trimmed) {
                return null;
            }
            if (!Array.isArray(ticket.messages)) {
                ticket.messages = [];
            }
            ticket.messages.push({
                authorRole: 'admin',
                authorName: 'Support CapsuleOS',
                body: trimmed,
                createdAt: new Date().toISOString(),
            });
            ticket.lastMessageRole = 'admin';
            if (ticket.status === 'ouvert') {
                ticket.status = 'en_cours';
            }
            save(s);
            return ticket;
        },
        addSampleClosedTicket: function () {
            var s = load();
            s.ticketCounter = (s.ticketCounter || 0) + 1;
            var now = new Date().toISOString();
            var authorName = s.displayName || 'Utilisateur';
            var body = 'Bonjour, je souhaiterais obtenir des précisions sur les modules créateurs disponibles à l\'achat.';
            var ticket = {
                id: uid(),
                number: s.ticketCounter,
                type: 'support',
                subject: 'Question sur les modules créateurs',
                body: body,
                status: 'clos',
                createdAt: now,
                messages: [
                    {
                        authorRole: 'user',
                        authorName: authorName,
                        body: body,
                        createdAt: now,
                    },
                    {
                        authorRole: 'admin',
                        authorName: 'Support CapsuleOS',
                        body: 'Bonjour, les modules créateurs sont listés dans la boutique du portail. N\'hésitez pas à nous recontacter si besoin.',
                        createdAt: new Date(Date.now() + 3600000).toISOString(),
                    },
                ],
            };
            s.tickets.unshift(ticket);
            save(s);
            return ticket;
        },
        createClassroom: function (name, maxSlots, allowedOs, allowedModules) {
            var s = load();
            if (s.classroom) {
                return null;
            }
            s.classroom = {
                name: name,
                maxSlots: maxSlots,
                allowedOs: Array.isArray(allowedOs) ? allowedOs : [],
                allowedModules: Array.isArray(allowedModules) ? allowedModules : [],
                inviteToken: token(),
                inviteExpiresAt: inviteExpiry(),
                members: [],
            };
            save(s);
            return s.classroom;
        },
        deleteClassroom: function () {
            var s = load();
            s.classroom = null;
            save(s);
        },
        regenerateInvite: function () {
            var s = load();
            if (!s.classroom) {
                return null;
            }
            s.classroom.inviteToken = token();
            s.classroom.inviteExpiresAt = inviteExpiry();
            save(s);
            return s.classroom.inviteToken;
        },
        removeMember: function (memberId) {
            var s = load();
            if (!s.classroom) {
                return;
            }
            s.classroom.members = s.classroom.members.filter(function (m) {
                return m.id !== memberId;
            });
            save(s);
        },
        addMember: function (name, email) {
            var s = load();
            if (!s.classroom) {
                return false;
            }
            if (s.classroom.members.length >= s.classroom.maxSlots) {
                return false;
            }
            s.classroom.members.push({
                id: uid(),
                displayName: name,
                email: email,
                joinedAt: new Date().toISOString(),
            });
            save(s);
            return true;
        },
        joinClassByToken: function (inviteToken) {
            var s = load();
            if (!s.classroom || s.classroom.inviteToken !== inviteToken) {
                return { ok: false, error: 'Invitation invalide' };
            }
            if (new Date(s.classroom.inviteExpiresAt).getTime() < Date.now()) {
                return { ok: false, error: 'Invitation expirée' };
            }
            s.studentClass = { name: s.classroom.name, joinedAt: new Date().toISOString() };
            save(s);
            return { ok: true, className: s.classroom.name };
        },
        leaveStudentClass: function () {
            var s = load();
            s.studentClass = null;
            save(s);
        },
        updateClassroom: function (patch) {
            var s = load();
            if (!s.classroom) {
                return false;
            }
            if (patch.name !== undefined) {
                s.classroom.name = String(patch.name).trim();
            }
            if (patch.maxSlots !== undefined) {
                s.classroom.maxSlots = Number(patch.maxSlots);
            }
            if (patch.allowedOs !== undefined) {
                s.classroom.allowedOs = Array.isArray(patch.allowedOs) ? patch.allowedOs : [];
            }
            if (patch.allowedModules !== undefined) {
                s.classroom.allowedModules = Array.isArray(patch.allowedModules) ? patch.allowedModules : [];
            }
            save(s);
            return true;
        },
        deleteProgress: function (id) {
            var s = load();
            s.progress = s.progress.filter(function (p) { return p.id !== id; });
            var item = scanChecklistProgress().concat(s.progress).find(function (p) { return p.id === id; });
            if (item && item.source === 'localStorage' && item.storageKey) {
                try {
                    localStorage.removeItem(item.storageKey);
                } catch (_) { /* ignore */ }
            }
            save(s);
        },
        addSampleProgress: function () {
            var s = load();
            if (!Array.isArray(s.progress)) {
                s.progress = [];
            }
            s.progress.push({
                id: uid(),
                title: 'Les bases Linux (exemple dev)',
                mountId: 'debutant/linux-bases',
                doneCount: 2,
                totalCount: 8,
                updatedAt: new Date().toISOString(),
                source: 'dev',
            });
            save(s);
        },
        addSampleSkin: function () {
            var s = load();
            if (!Array.isArray(s.skins)) {
                s.skins = [];
            }
            s.skins.push({
                id: uid(),
                registryId: 'linux-mint',
                label: 'Linux Mint',
                updatedAt: new Date().toISOString(),
            });
            save(s);
        },
        deleteSkin: function (id) {
            var s = load();
            s.skins = s.skins.filter(function (sk) { return sk.id !== id; });
            save(s);
        },
        listPurchases: function () {
            return migratePurchases(load().purchases || []);
        },
        hasPurchase: function (moduleId) {
            return load().purchases.some(function (p) {
                return p && p.moduleId === moduleId;
            });
        },
        addPurchase: function (moduleId, title, creatorName, storeOs, storeLabel) {
            var s = load();
            if (!Array.isArray(s.purchases)) {
                s.purchases = [];
            }
            if (s.purchases.some(function (p) { return p && p.moduleId === moduleId; })) {
                return null;
            }
            var purchase = enrichPurchase({
                id: uid(),
                moduleId: String(moduleId),
                title: String(title || moduleId),
                creatorName: String(creatorName || ''),
                storeOs: String(storeOs || ''),
                storeLabel: String(storeLabel || ''),
                purchasedAt: new Date().toISOString(),
            });
            s.purchases.unshift(purchase);
            save(s);
            return purchase;
        },
        purchaseModules: function (entries) {
            if (!Array.isArray(entries)) {
                return [];
            }
            var added = [];
            entries.forEach(function (entry) {
                if (!entry || !entry.mountId) {
                    return;
                }
                var purchase = api.addPurchase(
                    entry.mountId,
                    entry.title,
                    entry.creatorName,
                    entry.storeOs,
                    entry.storeLabel,
                );
                if (purchase) {
                    added.push(purchase);
                }
            });
            return added;
        },
        addSamplePurchases: function () {
            var samples = DEV_MODULE_CATALOG.filter(function (mod) {
                return mod.mountId.indexOf('createur/') === 0;
            }).slice(0, 3);
            var s = load();
            var touched = [];
            samples.forEach(function (entry) {
                var existingIndex = -1;
                var i;
                for (i = 0; i < s.purchases.length; i += 1) {
                    if (s.purchases[i] && s.purchases[i].moduleId === entry.mountId) {
                        existingIndex = i;
                        break;
                    }
                }
                if (existingIndex !== -1) {
                    var existing = enrichPurchase(s.purchases[existingIndex]);
                    if ((existing.creatorName || '') !== (s.purchases[existingIndex].creatorName || '')
                        || (existing.title || '') !== (s.purchases[existingIndex].title || '')) {
                        s.purchases[existingIndex] = existing;
                        touched.push(existing);
                    }
                    return;
                }
                var purchase = {
                    id: uid(),
                    moduleId: entry.mountId,
                    title: entry.title,
                    creatorName: entry.creatorName || '',
                    storeOs: entry.storeOs || '',
                    storeLabel: entry.storeLabel || '',
                    purchasedAt: new Date().toISOString(),
                };
                purchase = enrichPurchase(purchase);
                s.purchases.unshift(purchase);
                touched.push(purchase);
            });
            if (touched.length) {
                save(s);
            }
            return touched;
        },
        removePurchase: function (id) {
            var s = load();
            s.purchases = s.purchases.filter(function (p) { return p.id !== id; });
            save(s);
        },
        allProgress: function () {
            var s = load();
            if (!Array.isArray(s.progress)) {
                s.progress = [];
            }
            var scanned = scanChecklistProgress();
            var ids = {};
            scanned.forEach(function (p) { ids[p.id] = true; });
            var merged = scanned.slice();
            s.progress.forEach(function (p) {
                if (!ids[p.id]) {
                    merged.push(p);
                }
            });
            return merged;
        },
        resetAll: function () {
            localStorage.removeItem(STORAGE_KEY);
            return defaultState();
        },
        setCancelRenewal: function (cancel) {
            var s = load();
            var sub = ensureSubscription(s);
            sub.cancelAtPeriodEnd = !!cancel;
            save(s);
            return s;
        },
        subscriptionInfo: function () {
            var s = load();
            return ensureSubscription(s);
        },
        moduleCatalog: function () {
            return DEV_MODULE_CATALOG.map(function (mod) {
                return {
                    mountId: mod.mountId,
                    title: mod.title,
                    price: mod.price,
                    creatorName: mod.creatorName || '',
                    storeOs: mod.storeOs || '',
                    storeLabel: mod.storeLabel || '',
                };
            });
        },
    };

    global.CapsulePortalDevStore = api;
}(typeof window !== 'undefined' ? window : globalThis));
