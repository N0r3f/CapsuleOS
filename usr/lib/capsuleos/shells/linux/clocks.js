/**
 * Horloges GNOME — simulation org.gnome.clocks (horloges mondiales).
 */
(function initGnomeClocksApp(global) {
    'use strict';

    var GNOME_CLOCKS_SESSION_KEY = 'capsule-gnome-clocks-session';

    var VIEW_LABELS = {
        world: 'Monde',
        alarms: 'Alarmes',
        timer: 'Minuteur',
        stopwatch: 'Chronomètre'
    };

    var DEFAULT_ZONES = [
        { id: 'paris', city: 'Paris', tz: 'Europe/Paris' },
        { id: 'london', city: 'Londres', tz: 'Europe/London' },
        { id: 'new-york', city: 'New York', tz: 'America/New_York' }
    ];

    var ADDABLE_CITIES = [
        { id: 'tokyo', city: 'Tokyo', tz: 'Asia/Tokyo' },
        { id: 'sydney', city: 'Sydney', tz: 'Australia/Sydney' },
        { id: 'montreal', city: 'Montréal', tz: 'America/Montreal' }
    ];

    var timerId = null;
    var tickId = null;
    var activeView = 'world';
    var state = null;

    function readSession() {
        try {
            var raw = global.sessionStorage.getItem(GNOME_CLOCKS_SESSION_KEY);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (err) {
            /* ignore */
        }
        return null;
    }

    function writeSession(next) {
        state = next;
        try {
            global.sessionStorage.setItem(GNOME_CLOCKS_SESSION_KEY, JSON.stringify(next));
        } catch (err) {
            /* ignore */
        }
        syncClocksDataset();
    }

    function defaultState() {
        return {
            zones: DEFAULT_ZONES.slice(),
            alarms: [],
            timer: { remainingMs: 0, running: false, presetMs: 5 * 60 * 1000 },
            stopwatch: { elapsedMs: 0, running: false, startedAt: null }
        };
    }

    function ensureState() {
        if (!state) {
            state = readSession() || defaultState();
        }
        return state;
    }

    function syncClocksDataset() {
        var root = document.getElementById('gnomeClocksApp');
        if (!root) {
            return;
        }
        var s = ensureState();
        root.dataset.clocksInit = 'true';
        root.dataset.clocksView = activeView;
        root.dataset.clocksStopwatchRunning = s.stopwatch.running ? 'true' : 'false';
        root.dataset.clocksTimerRunning = s.timer.running ? 'true' : 'false';
        root.dataset.clocksAlarmCount = String(s.alarms.length);
        root.dataset.clocksCityCount = String(s.zones.length);
    }

    function formatTime(date, tz) {
        return date.toLocaleTimeString('fr-FR', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    function formatDate(date, tz) {
        return date.toLocaleDateString('fr-FR', {
            timeZone: tz,
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }

    function capitalizeFr(text) {
        if (!text) {
            return text;
        }
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function formatStopwatch(ms) {
        var totalCs = Math.floor(ms / 10);
        var cs = totalCs % 100;
        var totalSec = Math.floor(totalCs / 100);
        var sec = totalSec % 60;
        var min = Math.floor(totalSec / 60);
        return String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0') + ',' + String(cs).padStart(2, '0');
    }

    function formatTimer(ms) {
        var totalSec = Math.max(0, Math.ceil(ms / 1000));
        var sec = totalSec % 60;
        var min = Math.floor(totalSec / 60) % 60;
        var hour = Math.floor(totalSec / 3600);
        return hour + ':' + String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
    }

    function renderWorld(list) {
        var now = new Date();
        var s = ensureState();
        list.innerHTML = '';
        s.zones.forEach(function (zone) {
            var li = document.createElement('li');
            li.className = 'gnome-clocks__card';
            li.setAttribute('data-clocks-gnome-city', zone.id);
            li.innerHTML =
                '<span class="gnome-clocks__city">' + zone.city + '</span>' +
                '<span class="gnome-clocks__time">' + formatTime(now, zone.tz) + '</span>' +
                '<span class="gnome-clocks__date">' + capitalizeFr(formatDate(now, zone.tz)) + '</span>';
            list.appendChild(li);
        });
    }

    function renderAlarms(root) {
        var s = ensureState();
        var list = root.querySelector('[data-clocks-gnome-alarm-list]');
        var empty = root.querySelector('[data-clocks-gnome-empty="alarms"]');
        if (!list || !empty) {
            return;
        }
        list.innerHTML = '';
        if (!s.alarms.length) {
            empty.hidden = false;
            list.hidden = true;
            return;
        }
        empty.hidden = true;
        list.hidden = false;
        s.alarms.forEach(function (alarm) {
            var li = document.createElement('li');
            li.className = 'gnome-clocks__card gnome-clocks__alarm';
            li.setAttribute('data-clocks-gnome-alarm', alarm.id);
            li.innerHTML =
                '<span class="gnome-clocks__alarm-time">' + alarm.time + '</span>' +
                '<span class="gnome-clocks__alarm-label">' + alarm.label + '</span>';
            list.appendChild(li);
        });
    }

    function renderTimer(root) {
        var s = ensureState();
        var face = root.querySelector('[data-clocks-gnome-face="timer"]');
        var hint = root.querySelector('[data-clocks-gnome-hint="timer"]');
        if (!face) {
            return;
        }
        var displayMs = s.timer.running || s.timer.remainingMs > 0
            ? s.timer.remainingMs
            : s.timer.presetMs;
        face.textContent = formatTimer(displayMs);
        if (hint) {
            if (s.timer.running) {
                hint.textContent = 'Appuyez pour mettre en pause';
            } else if (s.timer.remainingMs > 0 && s.timer.remainingMs < s.timer.presetMs) {
                hint.textContent = 'Appuyez pour reprendre';
            } else {
                hint.textContent = 'Appuyez pour démarrer';
            }
        }
    }

    function renderStopwatch(root) {
        var s = ensureState();
        var face = root.querySelector('[data-clocks-gnome-face="stopwatch"]');
        var hint = root.querySelector('[data-clocks-gnome-hint="stopwatch"]');
        if (!face) {
            return;
        }
        face.textContent = formatStopwatch(s.stopwatch.elapsedMs);
        if (hint) {
            hint.textContent = s.stopwatch.running ? 'Appuyez pour arrêter' : 'Appuyez pour démarrer';
        }
    }

    function updateAddButton(addBtn) {
        if (!addBtn) {
            return;
        }
        var show = activeView === 'world' || activeView === 'alarms';
        addBtn.classList.toggle('is-visible', show);
        addBtn.hidden = !show;
        if (activeView === 'world') {
            addBtn.setAttribute('aria-label', 'Ajouter une ville');
            addBtn.title = 'Ajouter une ville';
            addBtn.setAttribute('data-clocks-action', 'add-city');
        } else if (activeView === 'alarms') {
            addBtn.setAttribute('aria-label', 'Ajouter une alarme');
            addBtn.title = 'Ajouter une alarme';
            addBtn.setAttribute('data-clocks-action', 'add-alarm');
        }
    }

    function switchView(root, viewId) {
        activeView = viewId;
        var title = root.querySelector('#gnome-clocks-title');
        if (title) {
            title.textContent = VIEW_LABELS[viewId] || VIEW_LABELS.world;
        }
        updateAddButton(root.querySelector('#gnome-clocks-add'));

        root.querySelectorAll('[data-clocks-view]').forEach(function (btn) {
            var isActive = btn.dataset.clocksView === viewId;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        root.querySelectorAll('[data-clocks-panel]').forEach(function (panel) {
            var isActive = panel.dataset.clocksPanel === viewId;
            panel.classList.toggle('is-active', isActive);
            panel.hidden = !isActive;
        });

        syncClocksDataset();
    }

    function addNextCity() {
        var s = ensureState();
        var existing = {};
        s.zones.forEach(function (z) { existing[z.id] = true; });
        var next = ADDABLE_CITIES.find(function (city) { return !existing[city.id]; });
        if (!next) {
            return false;
        }
        s.zones.push({ id: next.id, city: next.city, tz: next.tz });
        writeSession(s);
        return next;
    }

    function addSampleAlarm() {
        var s = ensureState();
        var id = 'alarm-' + (s.alarms.length + 1);
        s.alarms.push({
            id: id,
            time: '07:00',
            label: 'Réveil'
        });
        writeSession(s);
        return id;
    }

    function toggleStopwatch(root) {
        var s = ensureState();
        if (s.stopwatch.running) {
            s.stopwatch.elapsedMs += Date.now() - s.stopwatch.startedAt;
            s.stopwatch.running = false;
            s.stopwatch.startedAt = null;
        } else {
            s.stopwatch.running = true;
            s.stopwatch.startedAt = Date.now();
        }
        writeSession(s);
        renderStopwatch(root);
    }

    function toggleTimer(root) {
        var s = ensureState();
        if (s.timer.running) {
            s.timer.running = false;
        } else {
            if (!s.timer.remainingMs) {
                s.timer.remainingMs = s.timer.presetMs;
            }
            s.timer.running = true;
        }
        writeSession(s);
        renderTimer(root);
    }

    function tickClocks(root) {
        var s = ensureState();
        var now = Date.now();

        if (s.stopwatch.running && s.stopwatch.startedAt) {
            s.stopwatch.elapsedMs = (s.stopwatch.elapsedMs || 0);
            renderStopwatch(root);
            var face = root.querySelector('[data-clocks-gnome-face="stopwatch"]');
            if (face) {
                face.textContent = formatStopwatch(
                    s.stopwatch.elapsedMs + (now - s.stopwatch.startedAt)
                );
            }
        }

        if (s.timer.running && s.timer.remainingMs > 0) {
            s.timer.remainingMs = Math.max(0, s.timer.remainingMs - 1000);
            renderTimer(root);
            if (s.timer.remainingMs <= 0) {
                s.timer.running = false;
                writeSession(s);
            }
        }

        if (activeView === 'world') {
            var list = document.getElementById('gnome-clocks-list');
            if (list) {
                renderWorld(list);
            }
        }
    }

    function bindNavigation(root) {
        root.querySelectorAll('[data-clocks-view]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchView(root, btn.dataset.clocksView);
            });
        });
    }

    function bindActions(root) {
        var addBtn = root.querySelector('#gnome-clocks-add');
        if (addBtn) {
            addBtn.addEventListener('click', function () {
                if (activeView === 'world') {
                    addNextCity();
                    renderWorld(document.getElementById('gnome-clocks-list'));
                } else if (activeView === 'alarms') {
                    addSampleAlarm();
                    renderAlarms(root);
                }
                syncClocksDataset();
            });
        }

        var stopwatchBtn = root.querySelector('[data-clocks-action="stopwatch-toggle"]');
        if (stopwatchBtn) {
            stopwatchBtn.addEventListener('click', function () {
                switchView(root, 'stopwatch');
                toggleStopwatch(root);
            });
        }

        var timerBtn = root.querySelector('[data-clocks-action="timer-toggle"]');
        if (timerBtn) {
            timerBtn.addEventListener('click', function () {
                switchView(root, 'timer');
                toggleTimer(root);
            });
        }
    }

    function initClocksApp() {
        var root = document.getElementById('gnomeClocksApp');
        var list = document.getElementById('gnome-clocks-list');
        if (!root || !list || root.dataset.clocksReady === '1') {
            return;
        }
        root.dataset.clocksReady = '1';
        ensureState();
        bindNavigation(root);
        bindActions(root);
        switchView(root, 'world');
        renderWorld(list);
        renderAlarms(root);
        renderTimer(root);
        renderStopwatch(root);
        syncClocksDataset();

        if (timerId) {
            clearInterval(timerId);
        }
        if (tickId) {
            clearInterval(tickId);
        }
        timerId = setInterval(function () {
            tickClocks(root);
        }, 1000);
    }

    global.initClocksApp = initClocksApp;
    global.GNOME_CLOCKS_SESSION_KEY = GNOME_CLOCKS_SESSION_KEY;
}(typeof window !== 'undefined' ? window : this));
