/**
 * Disques — gnome-disks / udisks sur Mint.
 */
(function initGnomeDisksAppModule(global) {
    'use strict';

    var DISK_DETAILS = {
        sda: 'Partition Linux Mint — ext4 — montée sur /',
        sdb: 'Clé USB — FAT32 — non montée',
    };

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'gnome_disks') {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function initGnomeDisksAppOnce() {
        var root = global.document.getElementById('gnomeDisksApp');
        if (!root || root.dataset.gnomeDisksInit === 'true') {
            return;
        }
        root.dataset.gnomeDisksInit = 'true';

        var winEl = getWindowEl(root);
        if (winEl) {
            var wmTitle = winEl.querySelector('#windowTitle');
            if (wmTitle) {
                wmTitle.textContent = 'Disques';
            }
            winEl.setAttribute('data-title', 'Disques');
        }

        var list = root.querySelector('#gdk-list');
        var detail = root.querySelector('#gdk-detail');
        if (!list) {
            return;
        }

        list.addEventListener('click', function onDiskClick(ev) {
            var row = ev.target;
            while (row && row !== list) {
                if (row.classList && row.classList.contains('gdk-app__disk')) {
                    var disks = list.querySelectorAll('.gdk-app__disk');
                    var di;
                    for (di = 0; di < disks.length; di += 1) {
                        disks[di].classList.remove('is-selected');
                    }
                    row.classList.add('is-selected');
                    var pathEl = row.querySelector('.gdk-app__path');
                    var path = pathEl ? pathEl.textContent : '';
                    var key = path.indexOf('sdb') >= 0 ? 'sdb' : 'sda';
                    if (detail) {
                        detail.innerHTML = '<p>' + DISK_DETAILS[key] + '</p>';
                    }
                    return;
                }
                row = row.parentElement;
            }
        });
    }

    global.initGnomeDisksApp = function initGnomeDisksApp() {
        initGnomeDisksAppOnce();
    };
}(typeof window !== 'undefined' ? window : globalThis));
