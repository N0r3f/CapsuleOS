/**
 * Gestion fenêtres iframe Windows (CapsuleOS).
 * Ouverture en cascade (classic) ou centrée (moderne), skin page, maximisation zone utile.
 */
'use strict';
document.addEventListener('DOMContentLoaded', function () {
    const mainElement = document.querySelector('main');
    const links = document.querySelectorAll('a[target="lien"]');
    const windowTemplate = document.getElementById('windowContainer');

    if (!mainElement || !windowTemplate || links.length === 0) {
        return;
    }

    const CASCADE_STEP = 22;
    const CASCADE_ORIGIN = { x: 12, y: 12 };
    const FALLBACK_SIZE = { width: 640, height: 420 };

    let zIndex = 10;
    const openWindows = [];
    let cascadeIndex = 0;
    let templateSize = null;

    function usesClassicPageSkin() {
        const shell = document.body.getAttribute('data-win-shell') || '';
        if (shell.indexOf('classic') !== -1) {
            return true;
        }
        const version = document.body.getAttribute('data-win-version') || '';
        return version === '95' || version === '98' || version === 'me' || version === '2000';
    }

    function getWorkAreaRect() {
        const mainRect = mainElement.getBoundingClientRect();
        const footer = document.querySelector('footer');
        const footerHeight = footer ? footer.offsetHeight : 0;

        return {
            left: mainRect.left,
            top: mainRect.top,
            width: mainRect.width,
            height: Math.max(120, mainRect.height - footerHeight),
            right: mainRect.right,
            bottom: mainRect.bottom - footerHeight
        };
    }

    function measureTemplate() {
        if (templateSize && templateSize.width > 0) {
            return templateSize;
        }

        const probe = windowTemplate.cloneNode(true);
        probe.removeAttribute('id');
        probe.style.display = 'flex';
        probe.style.visibility = 'hidden';
        probe.style.position = 'fixed';
        probe.style.left = '-10000px';
        probe.style.top = '0';
        document.body.appendChild(probe);

        templateSize = {
            width: probe.offsetWidth || FALLBACK_SIZE.width,
            height: probe.offsetHeight || FALLBACK_SIZE.height
        };

        document.body.removeChild(probe);
        return templateSize;
    }

    function resolvePageHref(rawHref) {
        let href = rawHref;
        if (usesClassicPageSkin()) {
            const pageUrl = new URL(href, window.location.href);
            pageUrl.searchParams.set('skin', 'classic95');
            href = pageUrl.href;
        }
        return href;
    }

    function nextWindowPosition(size, index) {
        const work = getWorkAreaRect();
        const classic = usesClassicPageSkin();

        if (classic) {
            const left = work.left + CASCADE_ORIGIN.x + index * CASCADE_STEP;
            const top = work.top + CASCADE_ORIGIN.y + index * CASCADE_STEP;
            const maxLeft = work.left + work.width - size.width;
            const maxTop = work.top + work.height - size.height;

            return {
                left: Math.min(left, Math.max(work.left, maxLeft)),
                top: Math.min(top, Math.max(work.top, maxTop))
            };
        }

        const baseLeft = work.left + Math.max(0, Math.floor((work.width - size.width) / 2));
        const baseTop = work.top + Math.max(0, Math.floor((work.height - size.height) / 2));

        return {
            left: baseLeft + index * CASCADE_STEP,
            top: baseTop + index * CASCADE_STEP
        };
    }

    function bringToFront(win) {
        win.style.zIndex = String(++zIndex);
        openWindows.forEach(function (w) {
            w.classList.toggle('is-active', w === win);
        });
    }

    function syncTitleFromIframe(win, fallbackTitle) {
        const iframe = win.querySelector('#windowIframe');
        const titleEl = win.querySelector('#windowTitle');
        if (!iframe || !titleEl) {
            return;
        }

        iframe.addEventListener('load', function () {
            let label = fallbackTitle;
            try {
                const doc = iframe.contentDocument;
                if (doc && doc.title) {
                    label = doc.title.split('—')[0].trim() || label;
                }
            } catch (err) {
                /* cross-origin */
            }
            titleEl.textContent = label;
        });
    }

    function openWindow(link) {
        const href = resolvePageHref(link.href);
        const fallbackTitle = link.title || link.getAttribute('aria-label') || '';

        const existingWindow = openWindows.find(function (win) {
            const iframe = win.querySelector('#windowIframe');
            return iframe && iframe.src === href;
        });

        if (existingWindow) {
            existingWindow.style.display = 'flex';
            bringToFront(existingWindow);
            if (typeof CapsuleWindowContext !== 'undefined'
                && typeof CapsuleWindowContext.applyWindowInteraction === 'function') {
                CapsuleWindowContext.applyWindowInteraction(existingWindow, 'win-app', { force: true });
            }
            return;
        }

        const size = measureTemplate();
        const position = nextWindowPosition(size, cascadeIndex);
        cascadeIndex += 1;

        const newWindow = windowTemplate.cloneNode(true);
        newWindow.removeAttribute('id');
        newWindow.classList.add('win-window', 'windowElement');
        newWindow.dataset.link = newWindow.dataset.link || 'win-app';
        newWindow.style.position = 'fixed';
        newWindow.style.display = 'flex';
        newWindow.style.width = size.width + 'px';
        newWindow.style.height = size.height + 'px';
        newWindow.style.zIndex = String(++zIndex);
        newWindow.style.top = position.top + 'px';
        newWindow.style.left = position.left + 'px';
        newWindow.dataset.maximized = 'false';

        const iframe = newWindow.querySelector('#windowIframe');
        if (iframe) {
            iframe.src = href;
        }

        const windowTitle = newWindow.querySelector('#windowTitle');
        if (windowTitle) {
            windowTitle.textContent = fallbackTitle;
        }

        mainElement.appendChild(newWindow);
        openWindows.push(newWindow);
        bringToFront(newWindow);
        syncTitleFromIframe(newWindow, fallbackTitle);

        if (typeof CapsuleWindowContext !== 'undefined'
            && typeof CapsuleWindowContext.applyWindowInteraction === 'function') {
            CapsuleWindowContext.applyWindowInteraction(newWindow, newWindow.dataset.link, { force: true });
        } else if (typeof makeDraggable === 'function') {
            makeDraggable(newWindow);
            if (typeof Resizer === 'function') {
                new Resizer(newWindow);
            } else if (typeof CapsuleWindow !== 'undefined' && CapsuleWindow.enableResize) {
                CapsuleWindow.enableResize(newWindow);
            }
        }

        newWindow.addEventListener('mousedown', function () {
            bringToFront(newWindow);
        });
    }

    links.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            openWindow(this);
        });
    });

    document.addEventListener('click', function (event) {
        if (event.target.matches('#minimizeBtn') || event.target.matches('#closeBtn')) {
            const win = event.target.closest('.win-window, #windowContainer');
            if (!win || win === windowTemplate) {
                return;
            }
            win.style.display = 'none';
            const idx = openWindows.indexOf(win);
            if (idx !== -1) {
                openWindows.splice(idx, 1);
            }
            if (openWindows.length === 0) {
                cascadeIndex = 0;
            }
        }

        if (event.target.matches('#resizeBtn')) {
            const win = event.target.closest('.win-window, #windowContainer');
            if (!win || win === windowTemplate) {
                return;
            }

            if (typeof CapsuleWindow !== 'undefined' && CapsuleWindow.toggleWindowMaximized) {
                CapsuleWindow.toggleWindowMaximized(win);
                bringToFront(win);
                return;
            }

            const work = getWorkAreaRect();

            if (win.dataset.maximized === 'true') {
                win.style.width = win.dataset.prevWidth || '';
                win.style.height = win.dataset.prevHeight || '';
                win.style.top = win.dataset.prevTop || '';
                win.style.left = win.dataset.prevLeft || '';
                win.style.position = 'fixed';
                win.dataset.maximized = 'false';
                return;
            }

            win.dataset.prevWidth = win.style.width || win.offsetWidth + 'px';
            win.dataset.prevHeight = win.style.height || win.offsetHeight + 'px';
            win.dataset.prevTop = win.style.top;
            win.dataset.prevLeft = win.style.left;

            win.style.position = 'fixed';
            win.style.top = work.top + 'px';
            win.style.left = work.left + 'px';
            win.style.width = work.width + 'px';
            win.style.height = work.height + 'px';
            win.dataset.maximized = 'true';
            bringToFront(win);
        }
    });
});
