// SPDX-FileCopyrightText: 2020-2026 les contributeurs CapsuleOS
// SPDX-License-Identifier: GPL-3.0-or-later

(function initPortalA11yPanel(global) {
    'use strict';

    const doc = global.document;
    if (!doc || !global.CapsuleA11y) {
        return;
    }

    const a11y = global.CapsuleA11y;
    const panel = doc.getElementById('a11y-panel');
    const toggles = doc.querySelectorAll('[data-a11y-panel-toggle]');
    const contrastInput = doc.getElementById('a11y-contrast');
    const reducedMotionInput = doc.getElementById('a11y-reduced-motion');
    const underlineLinksInput = doc.getElementById('a11y-underline-links');
    const scaleButtons = doc.querySelectorAll('[data-a11y-font-scale]');

    if (!panel || !toggles.length) {
        return;
    }

    let activeToggle = toggles[0];

    const setExpanded = (expanded) => {
        toggles.forEach((toggle) => {
            toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
    };

    const syncUi = () => {
        const state = a11y.getState();
        if (contrastInput) {
            contrastInput.checked = state.contrast === 'high';
        }
        if (reducedMotionInput) {
            reducedMotionInput.checked = state.reducedMotion === 'on';
        }
        if (underlineLinksInput) {
            underlineLinksInput.checked = state.underlineLinks === 'on';
        }
        scaleButtons.forEach((btn) => {
            const scale = btn.getAttribute('data-a11y-font-scale');
            btn.classList.toggle('is-active', scale === state.fontScale);
            btn.setAttribute('aria-pressed', scale === state.fontScale ? 'true' : 'false');
        });
        toggles.forEach((toggle) => {
            toggle.classList.toggle('is-active', a11y.isActive());
        });
        setExpanded(!panel.hidden);
    };

    const closePanel = () => {
        panel.hidden = true;
        setExpanded(false);
    };

    const openPanel = () => {
        panel.hidden = false;
        setExpanded(true);
        const firstControl = panel.querySelector('button, input');
        if (firstControl) {
            firstControl.focus();
        }
    };

    toggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            activeToggle = toggle;
            if (panel.hidden) {
                openPanel();
            } else {
                closePanel();
            }
        });
    });

    doc.addEventListener('click', (event) => {
        if (panel.hidden) {
            return;
        }
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }
        const clickedToggle = [...toggles].some((toggle) => toggle.contains(target));
        if (panel.contains(target) || clickedToggle) {
            return;
        }
        closePanel();
    });

    doc.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) {
            closePanel();
            activeToggle.focus();
        }
    });

    if (contrastInput) {
        contrastInput.addEventListener('change', () => {
            a11y.setContrast(contrastInput.checked ? 'high' : 'normal');
            syncUi();
        });
    }

    if (reducedMotionInput) {
        reducedMotionInput.addEventListener('change', () => {
            a11y.setReducedMotion(reducedMotionInput.checked);
            syncUi();
        });
    }

    if (underlineLinksInput) {
        underlineLinksInput.addEventListener('change', () => {
            a11y.setUnderlineLinks(underlineLinksInput.checked);
            syncUi();
        });
    }

    scaleButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const scale = btn.getAttribute('data-a11y-font-scale') || '100';
            a11y.setFontScale(scale);
            syncUi();
        });
    });

    syncUi();
}(typeof window !== 'undefined' ? window : globalThis));
