(function initRhythmboxAppModule(global) {
    'use strict';

    var WINDOW_TITLE = 'Rhythmbox';
    var rbState = { playing: false, view: 'library', trackId: 'linux-mint-theme', trackTitle: 'Linux Mint Theme' };

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && (el.getAttribute('data-link') === 'rhythmbox'
                || el.getAttribute('data-link') === 'lecteur_multimedia')) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function syncWindowTitle(winEl) {
        if (!winEl) {
            return;
        }
        var t = winEl.querySelector('#windowTitle');
        if (t) {
            t.textContent = WINDOW_TITLE;
        }
        winEl.setAttribute('data-title', WINDOW_TITLE);
    }

    function supportsRhythmboxGnomeChrome(root) {
        return Boolean(root && (
            root.hasAttribute('data-rb-gnome-root')
            || (root.classList && root.classList.contains('rb-app'))
        ));
    }

    function syncRhythmboxGnomeDataset(root) {
        if (!root || !supportsRhythmboxGnomeChrome(root)) {
            return;
        }
        var activeNav = root.querySelector('.rb-app__nav.is-active');
        var navKey = activeNav ? activeNav.getAttribute('data-rb-gnome-nav') : 'library';
        var selected = root.querySelector('.rb-app__track.is-selected');
        var trackTitle = selected ? selected.querySelector('span') : null;
        root.dataset.rbGnomeInit = root.dataset.rhythmboxInit === 'true' ? 'true' : 'false';
        root.dataset.rbGnomeView = navKey || rbState.view;
        root.dataset.rbGnomePlaying = rbState.playing ? 'true' : 'false';
        root.dataset.rbGnomeTrack = selected ? (selected.getAttribute('data-rb-gnome-track') || '') : rbState.trackId;
        root.dataset.rbGnomeTrackTitle = trackTitle ? trackTitle.textContent : rbState.trackTitle;
        root.dataset.rbGnomeChrome = 'rhythmbox';
    }

    function updateNowPlaying(root) {
        var now = root.querySelector('[data-rb-gnome-now]') || root.querySelector('.rb-app__now');
        if (!now) {
            return;
        }
        var prefix = rbState.playing ? 'Lecture' : 'En pause';
        now.textContent = prefix + ' — ' + rbState.trackTitle;
        syncRhythmboxGnomeDataset(root);
    }

    function togglePlayPause(root) {
        rbState.playing = !rbState.playing;
        var btn = root.querySelector('[data-rb-gnome-action="play-pause"]');
        if (btn) {
            btn.setAttribute('aria-pressed', rbState.playing ? 'true' : 'false');
        }
        updateNowPlaying(root);
    }

    function initRhythmboxAppOnce(container) {
        var root = container && container.querySelector
            ? container.querySelector('#rhythmboxApp')
            : global.document.getElementById('rhythmboxApp');
        if (!root || root.dataset.rhythmboxInit === 'true') {
            if (root) {
                syncRhythmboxGnomeDataset(root);
            }
            return;
        }
        root.dataset.rhythmboxInit = 'true';
        syncWindowTitle(getWindowEl(root));
        syncRhythmboxGnomeDataset(root);

        root.addEventListener('click', function onClick(ev) {
            var playBtn = ev.target.closest ? ev.target.closest('[data-rb-gnome-action="play-pause"]') : null;
            if (playBtn && root.contains(playBtn)) {
                togglePlayPause(root);
                return;
            }

            var nav = ev.target.closest ? ev.target.closest('.rb-app__nav') : null;
            if (nav && root.contains(nav)) {
                var navs = root.querySelectorAll('.rb-app__nav');
                var ni;
                for (ni = 0; ni < navs.length; ni += 1) {
                    navs[ni].classList.remove('is-active');
                }
                nav.classList.add('is-active');
                rbState.view = nav.getAttribute('data-rb-gnome-nav') || 'library';
                syncRhythmboxGnomeDataset(root);
                return;
            }

            var track = ev.target.closest ? ev.target.closest('.rb-app__track') : null;
            if (track && root.contains(track)) {
                var tracks = root.querySelectorAll('.rb-app__track');
                var ti;
                for (ti = 0; ti < tracks.length; ti += 1) {
                    tracks[ti].classList.remove('is-selected');
                }
                track.classList.add('is-selected');
                var title = track.querySelector('span');
                rbState.trackId = track.getAttribute('data-rb-gnome-track') || '';
                rbState.trackTitle = title ? title.textContent : rbState.trackTitle;
                rbState.playing = false;
                updateNowPlaying(root);
            }
        });
    }

    global.initRhythmboxApp = function initRhythmboxApp(container) {
        initRhythmboxAppOnce(container);
    };
    global.syncRhythmboxGnomeDataset = syncRhythmboxGnomeDataset;
    global.supportsRhythmboxGnomeChrome = supportsRhythmboxGnomeChrome;

    global.document.addEventListener('capsule:window-opened', function (event) {
        if (!event.detail || event.detail.slotId !== 'lecteur_multimedia') {
            return;
        }
        if (!global.document.getElementById('rhythmboxApp')) {
            return;
        }
        global.setTimeout(function () {
            initRhythmboxAppOnce(event.detail.container);
        }, 30);
    });
}(typeof window !== 'undefined' ? window : globalThis));
