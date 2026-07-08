/**
 * Baobab GNOME — simulation org.gnome.baobab (volumes, treemap, analyse).
 */
(function initBaobabAppModule(global) {
    'use strict';

    var TREEMAP_COLORS = ['#3584e4', '#1c71d8', '#62a0ea', '#99c1f1', '#57c8ff', '#33d17a'];

    var VOLUMES = [
        {
            id: 'root',
            label: 'Ordinateur',
            path: '/',
            icon: 'disk',
            total: 42.1,
            used: 26.1,
            free: 16.0,
            percent: 62,
            treemap: [
                { label: 'usr', size: 9.8, weight: 38 },
                { label: 'var', size: 6.2, weight: 24 },
                { label: 'home', size: 5.4, weight: 21 },
                { label: 'opt', size: 2.1, weight: 8 },
                { label: 'tmp', size: 2.6, weight: 9 }
            ]
        },
        {
            id: 'home',
            label: 'Dossier personnel',
            path: '/home/user',
            icon: 'home',
            total: 8.4,
            used: 2.9,
            free: 5.5,
            percent: 34,
            treemap: [
                { label: 'Documents', size: 1.2, weight: 41 },
                { label: 'Téléchargements', size: 0.8, weight: 28 },
                { label: 'Images', size: 0.5, weight: 17 },
                { label: 'Bureau', size: 0.4, weight: 14 }
            ]
        },
        {
            id: 'boot',
            label: 'Partition /boot',
            path: '/boot',
            icon: 'boot',
            total: 1.0,
            used: 0.4,
            free: 0.6,
            percent: 40,
            treemap: [
                { label: 'vmlinuz', size: 0.15, weight: 38 },
                { label: 'initramfs', size: 0.12, weight: 30 },
                { label: 'grub', size: 0.08, weight: 20 },
                { label: 'efi', size: 0.05, weight: 12 }
            ]
        }
    ];

    var activeVolumeId = 'home';
    var activeView = 'overview';
    var scanTimer = null;

    function formatGo(value) {
        return value.toFixed(1).replace('.', ',') + ' Go';
    }

    function getVolume(id) {
        for (var i = 0; i < VOLUMES.length; i += 1) {
            if (VOLUMES[i].id === id) {
                return VOLUMES[i];
            }
        }
        return VOLUMES[0];
    }

    function getRootEl() {
        return global.document.getElementById('gnomeBaobabApp');
    }

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'baobab') {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function syncBaobabDataset(root) {
        var appRoot = root || getRootEl();
        if (!appRoot) {
            return;
        }
        var vol = getVolume(activeVolumeId);
        var scanBtn = appRoot.querySelector('#gnome-baobab-scan');
        appRoot.dataset.baobabInit = 'true';
        appRoot.dataset.baobabVolume = activeVolumeId;
        appRoot.dataset.baobabView = activeView;
        appRoot.dataset.baobabScanning = scanBtn && scanBtn.dataset.baobabScanning === '1' ? 'true' : 'false';
        appRoot.dataset.baobabTreemapReady = activeView === 'treemap' ? 'true' : 'false';
        appRoot.dataset.baobabVolumeLabel = vol.label;
    }

    function setWindowTitle(root) {
        var winEl = getWindowEl(root);
        if (!winEl) {
            return;
        }
        var wmTitle = winEl.querySelector('#windowTitle');
        if (wmTitle) {
            wmTitle.textContent = 'Analyseur d\u2019utilisation des disques';
        }
        winEl.setAttribute('data-title', 'Analyseur d\u2019utilisation des disques');
    }

    function renderPlaces(root) {
        var list = root.querySelector('#gnome-baobab-places');
        if (!list) {
            return;
        }
        list.innerHTML = '';
        VOLUMES.forEach(function (vol) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'gnome-baobab__place';
            btn.setAttribute('role', 'listitem');
            btn.dataset.baobabVolume = vol.id;
            btn.setAttribute('data-baobab-gnome-volume', vol.id);
            if (vol.id === activeVolumeId) {
                btn.classList.add('gnome-baobab__place--active');
            }
            var iconClass = 'gnome-baobab__place-icon';
            if (vol.icon === 'home') {
                iconClass += ' gnome-baobab__place-icon--home';
            } else if (vol.icon === 'boot') {
                iconClass += ' gnome-baobab__place-icon--boot';
            }
            btn.innerHTML =
                '<span class="' + iconClass + '" aria-hidden="true"></span>' +
                '<span class="gnome-baobab__place-label">' + vol.label + '</span>' +
                '<span class="gnome-baobab__place-size">' + formatGo(vol.total) + '</span>';
            btn.addEventListener('click', function () {
                selectVolume(root, vol.id);
            });
            list.appendChild(btn);
        });
    }

    function updateOverview(root, vol) {
        var ring = root.querySelector('#gnome-baobab-ring');
        var ringCenter = root.querySelector('#gnome-baobab-ring-center');
        var usedLabel = root.querySelector('#gnome-baobab-used-label');
        var freeLabel = root.querySelector('#gnome-baobab-free-label');
        var title = root.querySelector('#gnome-baobab-title');
        if (ring) {
            ring.style.setProperty('--baobab-used-pct', vol.percent + '%');
            ring.setAttribute('aria-label', 'Espace utilisé ' + vol.percent + ' pour cent');
        }
        if (ringCenter) {
            ringCenter.textContent = vol.percent + ' %';
        }
        if (usedLabel) {
            usedLabel.textContent = 'Utilisé — ' + formatGo(vol.used);
        }
        if (freeLabel) {
            freeLabel.textContent = 'Disponible — ' + formatGo(vol.free);
        }
        if (title) {
            title.textContent = vol.label;
        }
    }

    function renderTreemap(root, vol) {
        var grid = root.querySelector('#gnome-baobab-treemap-grid');
        var legend = root.querySelector('#gnome-baobab-treemap-legend');
        var path = root.querySelector('#gnome-baobab-path');
        if (!grid || !vol.treemap) {
            return;
        }
        if (path) {
            path.textContent = vol.path;
        }
        grid.innerHTML = '';
        if (legend) {
            legend.innerHTML = '';
        }
        vol.treemap.forEach(function (entry, index) {
            var color = TREEMAP_COLORS[index % TREEMAP_COLORS.length];
            var cell = document.createElement('div');
            cell.className = 'gnome-baobab__treemap-cell';
            cell.setAttribute('data-baobab-gnome-treemap-cell', entry.label.toLowerCase());
            cell.style.flexGrow = String(entry.weight);
            cell.style.flexBasis = Math.max(entry.weight * 2, 18) + '%';
            cell.style.background = color;
            cell.textContent = entry.label;
            cell.setAttribute('aria-label', entry.label + ' — ' + formatGo(entry.size));
            grid.appendChild(cell);
            if (legend) {
                var li = document.createElement('li');
                li.innerHTML =
                    '<span class="gnome-baobab__treemap-swatch" style="background:' + color + '"></span>' +
                    entry.label + ' — ' + formatGo(entry.size);
                legend.appendChild(li);
            }
        });
    }

    function setView(root, viewId) {
        activeView = viewId;
        var overview = root.querySelector('#gnome-baobab-overview');
        var treemap = root.querySelector('#gnome-baobab-treemap');
        if (overview) {
            overview.classList.toggle('is-active', viewId === 'overview');
            overview.hidden = viewId !== 'overview';
        }
        if (treemap) {
            treemap.classList.toggle('is-active', viewId === 'treemap');
            treemap.hidden = viewId !== 'treemap';
        }
        syncBaobabDataset(root);
    }

    function setScanPanel(root, visible) {
        var panel = root.querySelector('#gnome-baobab-scan-panel');
        if (panel) {
            panel.hidden = !visible;
        }
    }

    function updateScanButton(root, vol) {
        var scanBtn = root.querySelector('#gnome-baobab-scan');
        if (!scanBtn) {
            return;
        }
        var scanning = scanBtn.dataset.baobabScanning === '1';
        scanBtn.disabled = scanning || !vol.treemap || vol.treemap.length === 0;
        scanBtn.textContent = scanning ? 'Analyse…' : 'Analyser';
        syncBaobabDataset(root);
    }

    function selectVolume(root, volumeId) {
        activeVolumeId = volumeId;
        var vol = getVolume(volumeId);
        renderPlaces(root);
        updateOverview(root, vol);
        setView(root, 'overview');
        setScanPanel(root, false);
        updateScanButton(root, vol);
    }

    function runScan(root) {
        var vol = getVolume(activeVolumeId);
        var scanBtn = root.querySelector('#gnome-baobab-scan');
        var progress = root.querySelector('#gnome-baobab-progress');
        var progressFill = root.querySelector('#gnome-baobab-progress-fill');
        var progressLabel = root.querySelector('#gnome-baobab-progress-label');
        if (!vol.treemap || !scanBtn || scanBtn.disabled) {
            return;
        }
        if (scanTimer) {
            clearInterval(scanTimer);
            scanTimer = null;
        }
        scanBtn.dataset.baobabScanning = '1';
        scanBtn.disabled = true;
        scanBtn.textContent = 'Analyse…';
        setScanPanel(root, true);
        setView(root, 'overview');
        syncBaobabDataset(root);

        var value = 0;
        if (progress) {
            progress.setAttribute('aria-valuenow', '0');
        }
        if (progressFill) {
            progressFill.style.width = '0%';
        }
        if (progressLabel) {
            progressLabel.textContent = 'Analyse de ' + vol.path + '…';
        }

        scanTimer = global.setInterval(function () {
            value += 8;
            if (value > 100) {
                value = 100;
            }
            if (progress) {
                progress.setAttribute('aria-valuenow', String(value));
            }
            if (progressFill) {
                progressFill.style.width = value + '%';
            }
            if (value >= 100) {
                clearInterval(scanTimer);
                scanTimer = null;
                setScanPanel(root, false);
                renderTreemap(root, vol);
                setView(root, 'treemap');
                delete scanBtn.dataset.baobabScanning;
                updateScanButton(root, vol);
            }
        }, 90);
    }

    function bindScan(root) {
        var scanBtn = root.querySelector('#gnome-baobab-scan');
        if (!scanBtn) {
            return;
        }
        scanBtn.addEventListener('click', function () {
            runScan(root);
        });
    }

    function initBaobabAppOnce() {
        var root = getRootEl();
        if (!root || root.dataset.baobabInit === 'true') {
            return;
        }
        setWindowTitle(root);
        bindScan(root);
        selectVolume(root, activeVolumeId);
        syncBaobabDataset(root);
    }

    global.initBaobabApp = function initBaobabApp() {
        initBaobabAppOnce();
    };
}(typeof window !== 'undefined' ? window : globalThis));
