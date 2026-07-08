/**
 * Moniteur système — org.gnome.SystemMonitor (processus, ressources, FS).
 */
(function initSystemMonitorAppModule(global) {
    'use strict';

    var WINDOW_TITLE = 'Moniteur système';
    var CHART_POINTS = 48;
    var TICK_MS = 1000;

    var PROCESSES_MINT = [
        { name: 'cinnamon', user: 'capsule', cpu: '4,2', pid: '1842', mem: '142,3 Mo', read: '0 o/s', write: '0 o/s', nice: '0' },
        { name: 'firefox', user: 'capsule', cpu: '2,8', pid: '4521', mem: '512,1 Mo', read: '12 Ko/s', write: '4 Ko/s', nice: '0' },
        { name: 'nemo', user: 'capsule', cpu: '0,5', pid: '3890', mem: '48,2 Mo', read: '0 o/s', write: '0 o/s', nice: '0' },
        { name: 'gnome-system-monitor', user: 'capsule', cpu: '1,1', pid: '9102', mem: '36,4 Mo', read: '0 o/s', write: '0 o/s', nice: '0' },
        { name: 'mintupdate', user: 'capsule', cpu: '0,0', pid: '2104', mem: '22,1 Mo', read: '0 o/s', write: '0 o/s', nice: '0' },
        { name: 'Xorg', user: 'capsule', cpu: '3,4', pid: '1120', mem: '88,0 Mo', read: '0 o/s', write: '0 o/s', nice: '0' }
    ];

    var PROCESSES_GNOME = [
        { name: 'gnome-shell', user: 'user', cpu: '5,2', pid: '1842', mem: '312,4 Mo', read: '0 o/s', write: '0 o/s', nice: '0' },
        { name: 'firefox', user: 'user', cpu: '8,1', pid: '4521', mem: '890,2 Mo', read: '24 Ko/s', write: '8 Ko/s', nice: '0' },
        { name: 'nautilus', user: 'user', cpu: '0,3', pid: '3890', mem: '58,1 Mo', read: '0 o/s', write: '0 o/s', nice: '0' },
        { name: 'ptyxis', user: 'user', cpu: '0,1', pid: '4102', mem: '24,6 Mo', read: '0 o/s', write: '0 o/s', nice: '0' },
        { name: 'gnome-system-monitor', user: 'user', cpu: '1,4', pid: '9102', mem: '42,3 Mo', read: '0 o/s', write: '0 o/s', nice: '0' },
        { name: 'systemd', user: 'user', cpu: '0,0', pid: '2104', mem: '18,5 Mo', read: '0 o/s', write: '0 o/s', nice: '0' },
        { name: 'gnome-software', user: 'user', cpu: '0,2', pid: '3201', mem: '96,0 Mo', read: '0 o/s', write: '0 o/s', nice: '0' },
        { name: 'mutter', user: 'user', cpu: '2,6', pid: '1120', mem: '128,0 Mo', read: '0 o/s', write: '0 o/s', nice: '0' }
    ];

    var FILESYSTEMS_GNOME = [
        { device: '/dev/mapper/rl-root', mount: '/', type: 'ext4', total: '42,1 Go', avail: '16,0 Go', used: '26,1 Go (62 %)' },
        { device: '/dev/sda1', mount: '/boot', type: 'xfs', total: '1,0 Go', avail: '0,6 Go', used: '0,4 Go (40 %)' },
        { device: 'tmpfs', mount: '/run', type: 'tmpfs', total: '3,9 Go', avail: '3,8 Go', used: '128 Mo (3 %)' }
    ];

    var FILESYSTEMS_MINT = [
        { device: '/dev/sda2', mount: '/', type: 'ext4', total: '98,4 Go', avail: '72,1 Go', used: '26,3 Go (27 %)' }
    ];

    var cpuHistory = [];
    var netHistory = [];
    var memUsedGb = 2.1;
    var memPercent = 27;
    var activeTab = 'processes';
    var tickId = null;
    var processSource = [];

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'system_monitor') {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function isGnomeProfile() {
        var body = global.document.body;
        if (!body || !body.id) {
            return false;
        }
        return body.id === 'rocky' || body.id === 'fedora' || body.id === 'alma' ||
            body.id === 'ubuntu' || body.id === 'anduinos';
    }

    function getProcessList() {
        if (global.CapsuleTerminalProcesses && typeof global.CapsuleTerminalProcesses.getProcessCatalog === 'function') {
            var bodyId = global.document && global.document.body ? String(global.document.body.id || '') : '';
            return global.CapsuleTerminalProcesses.getProcessCatalog(bodyId).map(function (p) {
                return {
                    name: p.name,
                    user: p.user,
                    cpu: p.cpu,
                    pid: p.pid,
                    mem: String(p.mem).indexOf('Mo') >= 0 ? p.mem : (p.mem + ' Mo'),
                    read: p.read || '0 o/s',
                    write: p.write || '0 o/s',
                    nice: p.nice || '0',
                };
            });
        }
        return isGnomeProfile() ? PROCESSES_GNOME : PROCESSES_MINT;
    }

    function getFilesystemList() {
        if (global.CapsuleTerminalSystemInfo && global.CapsuleTerminalSystemInfo.FILESYSTEMS) {
            var bodyId = global.document && global.document.body ? String(global.document.body.id || 'ubuntu') : 'ubuntu';
            var mounts = global.CapsuleTerminalSystemInfo.FILESYSTEMS[bodyId]
                || global.CapsuleTerminalSystemInfo.FILESYSTEMS.ubuntu;
            return mounts.map(function (entry) {
                return {
                    device: entry.device,
                    mount: entry.mount,
                    type: entry.type,
                    total: entry.total,
                    avail: entry.avail || entry.used,
                    used: entry.used,
                };
            });
        }
        return isGnomeProfile() ? FILESYSTEMS_GNOME : FILESYSTEMS_MINT;
    }

    function syncWindowTitle(winEl) {
        if (!winEl) {
            return;
        }
        var wmTitle = winEl.querySelector('#windowTitle');
        if (wmTitle) {
            wmTitle.textContent = WINDOW_TITLE;
        }
        winEl.setAttribute('data-title', WINDOW_TITLE);
    }

    function syncGsmDataset(root) {
        if (!root) {
            return;
        }
        root.dataset.gsmInit = 'true';
        root.dataset.gsmActiveTab = activeTab;
        root.dataset.gsmProcessCount = String(processSource.length);
    }

    function showTab(root, tabId) {
        activeTab = tabId;
        var tabs = root.querySelectorAll('[data-gsm-gnome-tab]');
        var panels = root.querySelectorAll('[data-gsm-gnome-panel]');
        tabs.forEach(function (tab) {
            var active = tab.getAttribute('data-gsm-gnome-tab') === tabId;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        panels.forEach(function (panel) {
            if (panel.getAttribute('data-gsm-gnome-panel') === tabId) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', 'hidden');
            }
        });
        if (tabId === 'resources') {
            startMetricsTick(root);
        } else {
            stopMetricsTick();
        }
        syncGsmDataset(root);
    }

    function renderProcesses(tbody, list) {
        if (!tbody) {
            return;
        }
        var html = '';
        list.forEach(function (p) {
            html += '<tr data-gsm-pid="' + p.pid + '">';
            html += '<td>' + p.name + '</td>';
            html += '<td>' + p.user + '</td>';
            html += '<td>' + p.cpu + '</td>';
            html += '<td>' + p.pid + '</td>';
            html += '<td>' + p.mem + '</td>';
            html += '<td>' + p.read + '</td>';
            html += '<td>' + p.write + '</td>';
            html += '<td>' + p.nice + '</td>';
            html += '</tr>';
        });
        tbody.innerHTML = html;
    }

    function renderFilesystems(tbody) {
        if (!tbody) {
            return;
        }
        var html = '';
        getFilesystemList().forEach(function (fs) {
            html += '<tr>';
            html += '<td>' + fs.device + '</td>';
            html += '<td>' + fs.mount + '</td>';
            html += '<td>' + fs.type + '</td>';
            html += '<td>' + fs.total + '</td>';
            html += '<td>' + fs.avail + '</td>';
            html += '<td>' + fs.used + '</td>';
            html += '</tr>';
        });
        tbody.innerHTML = html;
    }

    function pushHistory(buffer, value) {
        buffer.push(value);
        if (buffer.length > CHART_POINTS) {
            buffer.shift();
        }
    }

    function renderBars(container, values, barClass) {
        if (!container) {
            return;
        }
        var html = '<div class="' + barClass + 's">';
        values.forEach(function (value) {
            html += '<span class="' + barClass + '" style="height:' + Math.max(4, value) + '%"></span>';
        });
        html += '</div>';
        container.innerHTML = html;
    }

    function randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function formatMemLabel() {
        return memUsedGb.toFixed(1).replace('.', ',') + ' Go (' + Math.round(memPercent) + ' %)';
    }

    function tickMetrics(root) {
        var cpuChart = root.querySelector('#gsm-cpu-chart');
        var netChart = root.querySelector('#gsm-net-chart');
        var memLabel = root.querySelector('#gsm-mem-used');
        pushHistory(cpuHistory, randomInRange(18, 42));
        pushHistory(netHistory, randomInRange(6, 28));
        memUsedGb += randomInRange(-0.05, 0.08);
        memPercent += randomInRange(-1.2, 1.5);
        if (memUsedGb < 1.8) {
            memUsedGb = 1.8;
        }
        if (memUsedGb > 2.6) {
            memUsedGb = 2.6;
        }
        if (memPercent < 22) {
            memPercent = 22;
        }
        if (memPercent > 34) {
            memPercent = 34;
        }
        renderBars(cpuChart, cpuHistory, 'gsm-app__cpu-bar');
        renderBars(netChart, netHistory, 'gsm-app__net-bar');
        if (memLabel) {
            memLabel.textContent = formatMemLabel();
        }
    }

    function seedMetrics(root) {
        cpuHistory = [];
        netHistory = [];
        var i;
        for (i = 0; i < CHART_POINTS; i += 1) {
            pushHistory(cpuHistory, randomInRange(12, 35));
            pushHistory(netHistory, randomInRange(4, 20));
        }
        tickMetrics(root);
    }

    function startMetricsTick(root) {
        if (tickId) {
            return;
        }
        tickMetrics(root);
        tickId = global.setInterval(function () {
            tickMetrics(root);
        }, TICK_MS);
    }

    function stopMetricsTick() {
        if (tickId) {
            global.clearInterval(tickId);
            tickId = null;
        }
    }

    function initSystemMonitorAppOnce() {
        var root = global.document.getElementById('systemMonitorApp');
        if (!root || root.dataset.systemMonitorInit === 'true') {
            return;
        }
        root.dataset.systemMonitorInit = 'true';

        processSource = getProcessList();
        syncWindowTitle(getWindowEl(root));

        var tbody = root.querySelector('#gsm-process-body');
        var fsBody = root.querySelector('#gsm-fs-body');
        var searchRow = root.querySelector('#gsm-search-row');
        var searchInput = root.querySelector('#gsm-search');
        var stopBtn = root.querySelector('[data-gsm-gnome-action="stop"]');
        var killBtn = root.querySelector('[data-gsm-gnome-action="kill"]');

        renderProcesses(tbody, processSource);
        renderFilesystems(fsBody);
        seedMetrics(root);

        root.addEventListener('click', function onClick(event) {
            var target = event.target;
            if (!target || !target.closest) {
                return;
            }
            var tabBtn = target.closest('[data-gsm-gnome-tab]');
            if (tabBtn) {
                showTab(root, tabBtn.getAttribute('data-gsm-gnome-tab'));
                return;
            }
            var searchBtn = target.closest('[data-gsm-gnome-action="search"]');
            if (searchBtn && searchRow) {
                if (searchRow.hidden) {
                    searchRow.removeAttribute('hidden');
                    if (searchInput) {
                        searchInput.focus();
                    }
                } else {
                    searchRow.setAttribute('hidden', 'hidden');
                }
                return;
            }
            var row = target.closest('#gsm-process-body tr');
            if (row) {
                root.querySelectorAll('#gsm-process-body tr').forEach(function (tr) {
                    tr.classList.remove('is-selected');
                });
                row.classList.add('is-selected');
                if (stopBtn) {
                    stopBtn.disabled = false;
                }
                if (killBtn) {
                    killBtn.disabled = false;
                }
            }
        });

        if (searchInput) {
            searchInput.addEventListener('input', function onSearch() {
                var q = (searchInput.value || '').trim().toLowerCase();
                if (!q) {
                    renderProcesses(tbody, processSource);
                    return;
                }
                var filtered = processSource.filter(function (p) {
                    return p.name.toLowerCase().indexOf(q) !== -1;
                });
                renderProcesses(tbody, filtered);
            });
        }

        showTab(root, 'processes');
        syncGsmDataset(root);
    }

    global.initSystemMonitorApp = function initSystemMonitorApp() {
        initSystemMonitorAppOnce();
    };
}(typeof window !== 'undefined' ? window : globalThis));
