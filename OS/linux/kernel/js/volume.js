(() => {
    'use strict';

    const SVG_HIGH  = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M3 10v4h4l5 5V5L7 10H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z'/%3E%3C/svg%3E\")";
    const SVG_LOW   = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z'/%3E%3C/svg%3E\")";
    const SVG_MUTED = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z'/%3E%3C/svg%3E\")";

    let volume = parseInt(localStorage.getItem('mint-volume') ?? '100', 10);
    let muted  = localStorage.getItem('mint-muted') === 'true';

    const getEffective = () => muted ? 0 : volume / 100;

    const applyToMedia = () => {
        const v = getEffective();
        document.querySelectorAll('audio, video').forEach(el => { el.volume = v; });
    };

    const updateFill = (slider) => {
        const pct    = muted ? 0 : volume;
        const cs     = getComputedStyle(document.documentElement);
        const accent = cs.getPropertyValue('--menu-accent').trim();
        const track  = cs.getPropertyValue('--volume-popover-track-bg').trim();
        slider.style.background = `linear-gradient(to right, ${accent} ${pct}%, ${track} ${pct}%)`;
    };

    const setMask = (el, mask) => {
        if (!el) return;
        el.style.webkitMaskImage = mask;
        el.style.maskImage = mask;
    };

    const syncQuickTheme = (els) => {
        if (!els.themeBtn || !els.themeLabel) return;
        const isLight = document.documentElement.dataset.theme === 'light';
        els.themeBtn.classList.toggle('quick-settings__tile--active', !isLight);
        els.themeLabel.textContent = isLight ? 'Style clair' : 'Style sombre';
    };

    const refresh = (els) => {
        const mask = (muted || volume === 0) ? SVG_MUTED : volume < 40 ? SVG_LOW : SVG_HIGH;
        updateFill(els.slider);
        setMask(els.trayIcon, mask);
        setMask(els.muteIcon, mask);
        const display = muted ? 0 : volume;
        if (els.valueLabel) els.valueLabel.textContent = display + '%';
        els.slider.setAttribute('aria-valuetext', display + '%');
        if (els.muteBtn) els.muteBtn.setAttribute('aria-pressed', String(muted));
        syncQuickTheme(els);
        applyToMedia();
    };

    const persist = () => {
        localStorage.setItem('mint-volume', String(volume));
        localStorage.setItem('mint-muted',  String(muted));
    };

    const closePopover = (btn, popover) => {
        popover.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
    };

    const returnToPickHome = () => {
        if (window.CapsulePickReturn) {
            window.CapsulePickReturn.redirectToPickHome('linux');
            return;
        }
        const home = (typeof window !== 'undefined' && window.CAPSULE_SITE_HOME)
            ? String(window.CAPSULE_SITE_HOME)
            : '../../../../../index.html';
        window.location.href = `${home.split('#')[0].split('?')[0]}?pick=linux#choisir-os`;
    };

    const openPopover = (btn, popover, slider) => {
        const rect        = btn.getBoundingClientRect();
        const rightOffset = window.innerWidth - rect.right;
        popover.style.right = Math.max(4, rightOffset) + 'px';
        popover.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
        slider.focus();
    };

    /* Apply volume to <audio>/<video> added dynamically (e.g. by fileViewerRouter) */
    const observer = new MutationObserver(mutations => {
        const v = getEffective();
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.matches?.('audio, video')) node.volume = v;
                node.querySelectorAll?.('audio, video').forEach(el => { el.volume = v; });
            }
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const btn        = document.getElementById('tray-quick-settings-btn') || document.getElementById('tray-sound-btn');
        const popover    = document.getElementById('volume-popover');
        const slider     = document.getElementById('volume-slider');
        const valueLabel = document.getElementById('volume-value');
        const muteBtn    = document.getElementById('volume-mute-btn');
        const muteIcon   = document.getElementById('volume-mute-icon');
        const trayIcon   = document.getElementById('tray-sound-icon');
        const themeBtn   = document.getElementById('quick-settings-theme-btn');
        const themeLabel = document.getElementById('quick-settings-theme-label');
        const powerBtn   = document.getElementById('quick-settings-power-btn');

        if (!btn || !popover || !slider) return;

        const els = { slider, valueLabel, muteBtn, muteIcon, trayIcon, themeBtn, themeLabel };

        slider.value = String(volume);
        refresh(els);

        btn.addEventListener('click', e => {
            e.stopPropagation();
            if (popover.hasAttribute('hidden')) {
                openPopover(btn, popover, slider);
            } else {
                closePopover(btn, popover);
            }
        });

        document.addEventListener('click', e => {
            if (!popover.hasAttribute('hidden') &&
                !popover.contains(e.target) &&
                !btn.contains(e.target)) {
                closePopover(btn, popover);
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && !popover.hasAttribute('hidden')) {
                closePopover(btn, popover);
                btn.focus();
            }
        });

        slider.addEventListener('input', () => {
            volume = parseInt(slider.value, 10);
            if (volume > 0) muted = false;
            if (volume === 0) muted = true;
            refresh(els);
            persist();
        });

        muteBtn.addEventListener('click', () => {
            muted = !muted;
            refresh(els);
            persist();
        });

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
                document.documentElement.dataset.theme = nextTheme;
                localStorage.setItem('mint-theme', nextTheme);
                refresh(els);
            });
        }

        if (powerBtn) {
            powerBtn.addEventListener('click', returnToPickHome);
        }

        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
