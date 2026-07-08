/**
 * Calendrier GNOME — simulation org.gnome.Calendar (vues mois/semaine, évènements).
 */
(function initGnomeCalendarApp(global) {
    'use strict';

    var GNOME_CALENDAR_SESSION_KEY = 'capsule-gnome-calendar-session';

    var viewYear;
    var viewMonth;
    var viewWeekStart;
    var activeView = 'month';
    var selectedDay = null;
    var state = null;
    var nextEventId = 1;

    function readSession() {
        try {
            var raw = global.sessionStorage.getItem(GNOME_CALENDAR_SESSION_KEY);
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
            global.sessionStorage.setItem(GNOME_CALENDAR_SESSION_KEY, JSON.stringify(next));
        } catch (err) {
            /* ignore */
        }
        syncCalendarDataset();
    }

    function defaultState() {
        return { events: [] };
    }

    function ensureState() {
        if (!state) {
            state = readSession() || defaultState();
            state.events.forEach(function (evt) {
                var num = parseInt(String(evt.id).replace(/\D/g, ''), 10);
                if (!isNaN(num) && num >= nextEventId) {
                    nextEventId = num + 1;
                }
            });
        }
        return state;
    }

    function syncCalendarDataset() {
        var root = document.getElementById('gnomeCalendarApp');
        if (!root) {
            return;
        }
        var s = ensureState();
        var todayEvents = eventsForDate(new Date());
        root.dataset.calendarInit = 'true';
        root.dataset.calendarView = activeView;
        root.dataset.calendarEventCount = String(s.events.length);
        root.dataset.calendarTodayCount = String(todayEvents.length);
        root.dataset.calendarPeriodLabel = periodLabel();
    }

    function pad(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function dateKey(year, month, day) {
        return year + '-' + pad(month + 1) + '-' + pad(day);
    }

    function startOfWeek(date) {
        var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var offset = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - offset);
        return d;
    }

    function periodLabel() {
        if (activeView === 'week') {
            var end = new Date(viewWeekStart);
            end.setDate(end.getDate() + 6);
            var startFmt = viewWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            var endFmt = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
            return startFmt + ' – ' + endFmt;
        }
        var d = new Date(viewYear, viewMonth, 1);
        return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }

    function eventsForDate(date) {
        var key = dateKey(date.getFullYear(), date.getMonth(), date.getDate());
        return ensureState().events.filter(function (evt) {
            return evt.date === key;
        });
    }

    function buildWeekdays(container) {
        var labels = ['lu', 'ma', 'me', 'je', 've', 'sa', 'di'];
        container.innerHTML = '';
        labels.forEach(function (label) {
            var el = document.createElement('span');
            el.className = 'gnome-calendar-app__weekday';
            el.textContent = label;
            container.appendChild(el);
        });
    }

    function isToday(year, month, day) {
        var today = new Date();
        return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    }

    function createDayButton(year, month, day, opts) {
        opts = opts || {};
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gnome-calendar-app__day';
        btn.textContent = String(day);
        btn.setAttribute('data-cal-gnome-day', String(day));
        btn.setAttribute('data-cal-gnome-date', dateKey(year, month, day));
        if (opts.outside) {
            btn.classList.add('gnome-calendar-app__day--outside');
        }
        if (isToday(year, month, day)) {
            btn.classList.add('gnome-calendar-app__day--today');
            btn.setAttribute('aria-current', 'date');
        }
        if (selectedDay === day && !opts.outside && activeView === 'month') {
            btn.classList.add('gnome-calendar-app__day--selected');
            btn.setAttribute('aria-selected', 'true');
        }
        var dayEvents = eventsForDate(new Date(year, month, day));
        if (dayEvents.length) {
            btn.setAttribute('data-cal-gnome-has-events', 'true');
        }
        btn.addEventListener('click', function () {
            selectedDay = day;
            if (activeView === 'month') {
                viewYear = year;
                viewMonth = month;
            }
            render();
        });
        return btn;
    }

    function renderMonthGrid(grid) {
        grid.innerHTML = '';
        var first = new Date(viewYear, viewMonth, 1);
        var startOffset = (first.getDay() + 6) % 7;
        var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        var prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
        var cells = [];

        for (var i = 0; i < startOffset; i++) {
            cells.push({
                day: prevMonthDays - startOffset + i + 1,
                month: viewMonth - 1,
                year: viewYear,
                outside: true
            });
        }
        for (var day = 1; day <= daysInMonth; day++) {
            cells.push({ day: day, month: viewMonth, year: viewYear, outside: false });
        }
        var trailing = 0;
        while ((cells.length + trailing) % 7 !== 0) {
            trailing += 1;
        }
        for (var t = 1; t <= trailing; t++) {
            cells.push({
                day: t,
                month: viewMonth + 1,
                year: viewYear,
                outside: true
            });
        }

        cells.forEach(function (cell) {
            var y = cell.year;
            var m = cell.month;
            if (m < 0) {
                m = 11;
                y -= 1;
            } else if (m > 11) {
                m = 0;
                y += 1;
            }
            grid.appendChild(createDayButton(y, m, cell.day, { outside: cell.outside }));
        });
    }

    function renderWeekGrid(grid) {
        grid.innerHTML = '';
        for (var i = 0; i < 7; i += 1) {
            var d = new Date(viewWeekStart);
            d.setDate(d.getDate() + i);
            var col = document.createElement('div');
            col.className = 'gnome-calendar-app__week-col';
            col.setAttribute('data-cal-gnome-weekday', String(i));
            var head = document.createElement('div');
            head.className = 'gnome-calendar-app__week-col-head';
            head.textContent = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
            col.appendChild(head);
            var body = document.createElement('div');
            body.className = 'gnome-calendar-app__week-col-body';
            var dayEvents = eventsForDate(d);
            dayEvents.forEach(function (evt) {
                var chip = document.createElement('span');
                chip.className = 'gnome-calendar-app__event-chip';
                chip.setAttribute('data-cal-gnome-event', evt.id);
                chip.textContent = evt.title;
                body.appendChild(chip);
            });
            col.appendChild(body);
            grid.appendChild(col);
        }
    }

    function renderTodaySidebar() {
        var emptyEl = document.querySelector('[data-cal-gnome-empty="today"]');
        var listEl = document.querySelector('[data-cal-gnome-event-list]');
        if (!emptyEl || !listEl) {
            return;
        }
        var todayEvents = eventsForDate(new Date());
        listEl.innerHTML = '';
        if (!todayEvents.length) {
            emptyEl.hidden = false;
            return;
        }
        emptyEl.hidden = true;
        todayEvents.forEach(function (evt) {
            var li = document.createElement('li');
            li.className = 'gnome-calendar-app__event-item';
            li.setAttribute('data-cal-gnome-event', evt.id);
            li.textContent = evt.title;
            listEl.appendChild(li);
        });
    }

    function setActiveView(view) {
        activeView = view;
        document.querySelectorAll('[data-cal-gnome-view]').forEach(function (btn) {
            var isActive = btn.getAttribute('data-cal-gnome-view') === view;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        document.querySelectorAll('[data-cal-gnome-panel]').forEach(function (panel) {
            var show = panel.getAttribute('data-cal-gnome-panel') === view;
            panel.hidden = !show;
        });
        if (view === 'week') {
            viewWeekStart = startOfWeek(new Date(viewYear, viewMonth, selectedDay || new Date().getDate()));
        }
        syncCalendarDataset();
        render();
    }

    function showEditor(show) {
        var editor = document.querySelector('[data-cal-gnome-editor]');
        if (!editor) {
            return;
        }
        editor.hidden = !show;
        if (show) {
            var input = document.querySelector('[data-cal-gnome-event-title]');
            if (input) {
                input.value = '';
                input.focus();
            }
        }
    }

    function addEvent(title) {
        var trimmed = String(title || '').trim();
        if (!trimmed) {
            return;
        }
        var today = new Date();
        var evt = {
            id: 'evt-' + nextEventId,
            title: trimmed,
            date: dateKey(today.getFullYear(), today.getMonth(), today.getDate())
        };
        nextEventId += 1;
        var s = ensureState();
        s.events.push(evt);
        writeSession(s);
        showEditor(false);
        render();
    }

    function render() {
        var periodEl = document.getElementById('gnome-cal-period-label');
        var weekdays = document.getElementById('gnome-cal-weekdays');
        var grid = document.getElementById('gnome-cal-grid');
        var weekdaysWeek = document.getElementById('gnome-cal-weekdays-week');
        var weekGrid = document.getElementById('gnome-cal-week-grid');
        if (!periodEl || !weekdays || !grid) {
            return;
        }
        periodEl.textContent = periodLabel();
        if (activeView === 'month') {
            buildWeekdays(weekdays);
            renderMonthGrid(grid);
        } else if (weekGrid && weekdaysWeek) {
            buildWeekdays(weekdaysWeek);
            renderWeekGrid(weekGrid);
        }
        renderTodaySidebar();
        syncCalendarDataset();
    }

    function shiftPeriod(delta) {
        if (activeView === 'week') {
            viewWeekStart.setDate(viewWeekStart.getDate() + delta * 7);
            viewYear = viewWeekStart.getFullYear();
            viewMonth = viewWeekStart.getMonth();
        } else {
            viewMonth += delta;
            if (viewMonth < 0) {
                viewMonth = 11;
                viewYear -= 1;
            } else if (viewMonth > 11) {
                viewMonth = 0;
                viewYear += 1;
            }
        }
        render();
    }

    function bindActions(root) {
        root.querySelectorAll('[data-cal-gnome-view]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setActiveView(btn.getAttribute('data-cal-gnome-view'));
            });
        });
        root.querySelectorAll('[data-cal-gnome-action="prev"]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                shiftPeriod(-1);
            });
        });
        root.querySelectorAll('[data-cal-gnome-action="next"]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                shiftPeriod(1);
            });
        });
        root.querySelectorAll('[data-cal-gnome-action="new-event"]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                showEditor(true);
            });
        });
        root.querySelectorAll('[data-cal-gnome-action="cancel-event"]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                showEditor(false);
            });
        });
        var editor = root.querySelector('[data-cal-gnome-editor]');
        if (editor) {
            editor.addEventListener('submit', function (ev) {
                ev.preventDefault();
                var input = root.querySelector('[data-cal-gnome-event-title]');
                addEvent(input ? input.value : '');
            });
        }
    }

    function initCalendarApp() {
        var root = document.getElementById('gnomeCalendarApp');
        if (!root || root.dataset.calendarReady === '1') {
            return;
        }
        root.dataset.calendarReady = '1';
        var now = new Date();
        viewYear = now.getFullYear();
        viewMonth = now.getMonth();
        viewWeekStart = startOfWeek(now);
        selectedDay = now.getDate();
        ensureState();
        bindActions(root);
        setActiveView('month');
    }

    global.initCalendarApp = initCalendarApp;
    global.GNOME_CALENDAR_SESSION_KEY = GNOME_CALENDAR_SESSION_KEY;
}(typeof window !== 'undefined' ? window : this));
