(function () {
    'use strict';

    var GNOME_BODY_IDS = { rocky: 1, fedora: 1, alma: 1, ubuntu: 1 };

    const CHECKLIST_TASK_COUNT = 8;

    function getChecklistStorageKey() {
        if (typeof window !== 'undefined' && window.CAPSULE_CHECKLIST_STORAGE_KEY) {
            return String(window.CAPSULE_CHECKLIST_STORAGE_KEY);
        }
        return 'mint-checklist';
    }

    function supportsChecklistGnomeDataset() {
        return Boolean(document.body && GNOME_BODY_IDS[document.body.id]);
    }

    function syncChecklistGnomeDataset(root, state) {
        if (!supportsChecklistGnomeDataset()) {
            return;
        }
        root = root || document.querySelector('#checklist #checklistApp');
        if (!root) {
            return;
        }
        state = state || loadChecklistState();

        var done = 0;
        root.querySelectorAll('.checklist-item').forEach(function syncItemMarker(item) {
            var taskId = item.getAttribute('data-task-id');
            var isDone = !!state[taskId];
            if (isDone) done++;
            item.dataset.checklistGnomeItemDone = isDone ? 'true' : 'false';
        });

        var pct = Math.round((done / CHECKLIST_TASK_COUNT) * 100);
        var win = document.querySelector('div[data-link="checklist"]');
        var initialized = root.dataset.initialized === 'true';
        var markers = [root, win].filter(Boolean);

        markers.forEach(function applyDataset(node) {
            node.dataset.checklistGnomeInit = initialized ? 'true' : 'false';
            node.dataset.checklistGnomeTaskCount = String(CHECKLIST_TASK_COUNT);
            node.dataset.checklistGnomeDoneCount = String(done);
            node.dataset.checklistGnomeProgress = String(pct);
            node.dataset.checklistGnomeStorageKey = getChecklistStorageKey();
        });
    }

    function initChecklistApp() {
        const root = document.querySelector('#checklist #checklistApp');
        if (!root || root.dataset.initialized === 'true') {
            return;
        }

        const saved = loadChecklistState();
        syncChecklistUI(root, saved);

        var calBtn = document.getElementById('taskbar-clock-trigger');
        if (calBtn) {
            calBtn.addEventListener('click', function onCalClick() {
                dispatchCapsuleTask('open-calendar');
            }, { once: true });
        }

        root.querySelectorAll('.checklist-item__check').forEach(function bindCheck(btn) {
            btn.addEventListener('click', function onCheckClick() {
                const item = btn.closest('.checklist-item');
                const taskId = item.getAttribute('data-task-id');
                const state = loadChecklistState();
                state[taskId] = !state[taskId];
                saveChecklistState(state);
                syncChecklistUI(root, state);
            });
        });

        document.addEventListener('capsule:task', function onCapsuleTask(e) {
            if (!e.detail || !e.detail.id) return;
            const state = loadChecklistState();
            if (!state[e.detail.id]) {
                state[e.detail.id] = true;
                saveChecklistState(state);
                if (root.dataset.initialized === 'true') {
                    syncChecklistUI(root, state);
                }
            }
        });

        root.dataset.initialized = 'true';
        syncChecklistGnomeDataset(root, saved);
    }

    function loadChecklistState() {
        try {
            const raw = localStorage.getItem(getChecklistStorageKey());
            return raw ? JSON.parse(raw) : {};
        } catch (_) {
            return {};
        }
    }

    function saveChecklistState(state) {
        try {
            localStorage.setItem(getChecklistStorageKey(), JSON.stringify(state));
        } catch (_) { /* quota exceeded - silent fail */ }
    }

    function syncChecklistUI(root, state) {
        let done = 0;
        root.querySelectorAll('.checklist-item').forEach(function syncItem(item) {
            const taskId = item.getAttribute('data-task-id');
            const isDone = !!state[taskId];
            const btn = item.querySelector('.checklist-item__check');

            if (isDone) done++;
            item.classList.toggle('is-done', isDone);
            btn.setAttribute('aria-checked', isDone ? 'true' : 'false');
        });

        const pct = Math.round((done / CHECKLIST_TASK_COUNT) * 100);
        const bar = root.querySelector('#checklist-bar');
        const label = root.querySelector('#checklist-progress-label');
        const progressbar = root.querySelector('#checklist-progressbar');

        if (bar) bar.style.width = pct + '%';
        if (label) label.textContent = done + ' / ' + CHECKLIST_TASK_COUNT;
        if (progressbar) progressbar.setAttribute('aria-valuenow', pct);

        syncChecklistGnomeDataset(root, state);
    }

    function dispatchCapsuleTask(taskId) {
        document.dispatchEvent(new CustomEvent('capsule:task', { detail: { id: taskId } }));
    }

    window.initChecklistApp = initChecklistApp;
    window.syncChecklistGnomeDataset = syncChecklistGnomeDataset;
    window.supportsChecklistGnomeDataset = supportsChecklistGnomeDataset;
}());
