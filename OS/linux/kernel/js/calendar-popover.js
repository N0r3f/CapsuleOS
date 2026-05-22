(function () {
    const trigger = document.getElementById('taskbar-clock-trigger');
    const popover = document.getElementById('taskbar-calendar-popover');
    if (!trigger || !popover) return;

    const elLong = document.getElementById('cal-long-date');
    const elWeekBig = document.getElementById('cal-weekday-big');
    const elDateSub = document.getElementById('cal-date-sub');
    const elMonthLabel = document.getElementById('cal-month-label');
    const elWeekRow = document.getElementById('cal-weekday-row');
    const elGrid = document.getElementById('cal-days-grid');
    const btnPrev = document.getElementById('cal-prev-month');
    const btnNext = document.getElementById('cal-next-month');

    if (!elLong || !elWeekBig || !elDateSub || !elMonthLabel || !elWeekRow || !elGrid) return;

    let viewYear;
    let viewMonth;
    let selectedDate;

    const isPopos = document.body && document.body.id === 'popos';
    const WEEKDAYS_FR = isPopos
        ? ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
        : ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

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

    function openPopover() {
        if (isPopos && window.CosmicShellState) {
            CosmicShellState.closeAll();
        }
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

    function renderHeaders() {
        const now = new Date();
        elLong.textContent = fmt(now, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        if (isPopos) {
            elDateSub.textContent = fmt(selectedDate, {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            elWeekBig.textContent = fmt(selectedDate, { weekday: 'long' });
        } else {
            elWeekBig.textContent = fmt(selectedDate, { weekday: 'long' });
            elDateSub.textContent = fmt(selectedDate, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }

        elMonthLabel.textContent = fmt(new Date(viewYear, viewMonth, 1), {
            month: 'long',
            year: 'numeric'
        });
    }

    function buildWeekRow() {
        elWeekRow.innerHTML = '';
        WEEKDAYS_FR.forEach((label) => {
            const cell = document.createElement('span');
            cell.className = 'calendar-popover__week-cell';
            cell.textContent = label;
            elWeekRow.appendChild(cell);
        });
    }

    function renderGrid() {
        elGrid.innerHTML = '';

        const first = new Date(viewYear, viewMonth, 1);
        const last = new Date(viewYear, viewMonth + 1, 0).getDate();
        const startPad = isPopos ? first.getDay() : (first.getDay() + 6) % 7;
        const today = new Date();

        if (isPopos && startPad > 0) {
            const prevLast = new Date(viewYear, viewMonth, 0).getDate();
            for (let i = 0; i < startPad; i++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.disabled = true;
                btn.className = 'calendar-popover__day calendar-popover__day--outside';
                btn.textContent = String(prevLast - startPad + 1 + i);
                elGrid.appendChild(btn);
            }
        } else {
            for (let i = 0; i < startPad; i++) {
                const cell = document.createElement('span');
                cell.className = 'calendar-popover__day calendar-popover__day--empty';
                elGrid.appendChild(cell);
            }
        }

        for (let day = 1; day <= last; day++) {
            const d = new Date(viewYear, viewMonth, day);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'calendar-popover__day';
            btn.textContent = String(day);

            if (sameDay(d, today)) {
                btn.classList.add('calendar-popover__day--today');
            } else if (sameDay(d, selectedDate)) {
                btn.classList.add('calendar-popover__day--selected');
            }

            btn.addEventListener('click', function () {
                selectedDate = new Date(viewYear, viewMonth, day);
                renderAll();
            });

            elGrid.appendChild(btn);
        }

        const total = startPad + last;
        const tail = (7 - (total % 7)) % 7;

        if (isPopos && tail > 0) {
            for (let n = 1; n <= tail; n++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.disabled = true;
                btn.className = 'calendar-popover__day calendar-popover__day--outside';
                btn.textContent = String(n);
                elGrid.appendChild(btn);
            }
        } else {
            for (let i = 0; i < tail; i++) {
                const cell = document.createElement('span');
                cell.className = 'calendar-popover__day calendar-popover__day--empty';
                elGrid.appendChild(cell);
            }
        }
    }

    function renderAll() {
        renderHeaders();
        if (!elWeekRow.children.length) buildWeekRow();
        renderGrid();
    }

    trigger.addEventListener('click', function (event) {
        event.stopPropagation();
        if (!popover.hidden) {
            closePopover();
            return;
        }
        openPopover();
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
            viewMonth--;
            if (viewMonth < 0) {
                viewMonth = 11;
                viewYear--;
            }
            renderAll();
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', function (event) {
            event.stopPropagation();
            viewMonth++;
            if (viewMonth > 11) {
                viewMonth = 0;
                viewYear++;
            }
            renderAll();
        });
    }

    buildWeekRow();
})();
