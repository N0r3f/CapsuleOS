(function () {
    const trigger = document.getElementById('taskbar-clock-trigger');
    const popover = document.getElementById('taskbar-calendar-popover');
    if (!trigger || !popover) return;

    const elMonthTitle = document.getElementById('cal-month-title');
    const elWeekRow = document.getElementById('cal-weekday-row');
    const elGrid = document.getElementById('cal-days-grid');
    const btnPrev = document.getElementById('cal-prev-month');
    const btnNext = document.getElementById('cal-next-month');
    const btnToday = document.getElementById('cal-today-btn');

    if (!elMonthTitle || !elWeekRow || !elGrid) return;

    let viewYear;
    let viewMonth;
    let selectedDate;

    const WEEKDAYS_FR = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

    function fmt(date, options) {
        return date.toLocaleDateString('fr-FR', options);
    }

    function sameDay(a, b) {
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    }

    function positionPopover() {
        const rect = trigger.getBoundingClientRect();
        const rightOffset = window.innerWidth - rect.right;
        popover.style.right = Math.max(4, rightOffset) + 'px';
    }

    function openPopover() {
        positionPopover();
        popover.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');

        const now = new Date();
        selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        viewYear = selectedDate.getFullYear();
        viewMonth = selectedDate.getMonth();

        renderAll();
    }

    function closePopover() {
        popover.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
    }

    function togglePopover() {
        if (popover.hidden) openPopover();
        else closePopover();
    }

    function renderMonthTitle() {
        elMonthTitle.textContent = fmt(new Date(viewYear, viewMonth, 1), {
            month: 'long'
        });
    }

    function buildWeekRow() {
        if (elWeekRow.children.length) return;

        WEEKDAYS_FR.forEach(function (label) {
            const cell = document.createElement('span');
            cell.className = 'calendar-popover__week-cell';
            cell.textContent = label;
            elWeekRow.appendChild(cell);
        });
    }

    function appendDayButton(day, month, year, outside) {
        const d = new Date(year, month, day);
        const today = new Date();
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'calendar-popover__day';
        btn.textContent = String(day);

        if (outside) {
            btn.classList.add('calendar-popover__day--outside');
        }

        if (sameDay(d, today)) {
            btn.classList.add('calendar-popover__day--today');
        } else if (!outside && sameDay(d, selectedDate)) {
            btn.classList.add('calendar-popover__day--selected');
        }

        btn.addEventListener('click', function () {
            selectedDate = new Date(year, month, day);
            if (outside) {
                viewYear = year;
                viewMonth = month;
            }
            renderAll();
        });

        elGrid.appendChild(btn);
    }

    function renderGrid() {
        elGrid.innerHTML = '';

        const first = new Date(viewYear, viewMonth, 1);
        const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
        const startPad = (first.getDay() + 6) % 7;
        const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
        const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
        const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
        const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
        const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;

        for (let i = startPad - 1; i >= 0; i--) {
            appendDayButton(prevMonthLastDay - i, prevMonth, prevYear, true);
        }

        for (let day = 1; day <= lastDay; day++) {
            appendDayButton(day, viewMonth, viewYear, false);
        }

        /* Plasma : grille fixe 6×7 - jours précédent / suivant grisés */
        let total = startPad + lastDay;
        let nextDay = 1;

        while (total < 42) {
            appendDayButton(nextDay, nextMonth, nextYear, true);
            nextDay += 1;
            total += 1;
        }
    }

    function renderAll() {
        renderMonthTitle();
        buildWeekRow();
        renderGrid();
    }

    function shiftMonth(delta) {
        viewMonth += delta;
        if (viewMonth < 0) {
            viewMonth = 11;
            viewYear--;
        } else if (viewMonth > 11) {
            viewMonth = 0;
            viewYear++;
        }
        renderAll();
    }

    function goToToday() {
        const now = new Date();
        viewYear = now.getFullYear();
        viewMonth = now.getMonth();
        selectedDate = new Date(viewYear, viewMonth, now.getDate());
        renderAll();
    }

    trigger.addEventListener('click', function (event) {
        event.stopPropagation();
        togglePopover();
    });

    document.addEventListener('click', function (event) {
        if (popover.hidden) return;
        if (trigger.contains(event.target) || popover.contains(event.target)) return;
        closePopover();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !popover.hidden) {
            closePopover();
        }
    });

    if (btnPrev) {
        btnPrev.addEventListener('click', function (event) {
            event.stopPropagation();
            shiftMonth(-1);
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', function (event) {
            event.stopPropagation();
            shiftMonth(1);
        });
    }

    if (btnToday) {
        btnToday.addEventListener('click', function (event) {
            event.stopPropagation();
            goToToday();
        });
    }

    window.addEventListener('resize', function () {
        if (!popover.hidden) {
            positionPopover();
        }
    });

    buildWeekRow();
})();
