/**
 * Visionneurs Mint — xviewer 3.0 + xreader 4.0.
 */
(function initMintViewersModule(global) {
    'use strict';

    var IMAGE_TITLE = 'Visionneur d\'images';
    var PDF_TITLE = 'Visionneur de documents';
    var LOUPE_BODY_IDS = { rocky: true, fedora: true, alma: true, ubuntu: true, anduinos: true };

    var xviewerState = { zoom: 100, rotate: 0, hasImage: false, metaOpen: false };

    function usesLoupeChrome(root) {
        return Boolean(root && root.classList && root.classList.contains('loupe-app'));
    }

    function supportsLoupeGnomeChrome(root) {
        if (usesLoupeChrome(root)) {
            return true;
        }
        var bodyId = global.document.body && global.document.body.id;
        return Boolean(bodyId && LOUPE_BODY_IDS[bodyId]);
    }

    function syncLoupeGnomeDataset(root) {
        if (!root || !supportsLoupeGnomeChrome(root)) {
            return;
        }
        root.dataset.loupeGnomeInit = root.dataset.xviewerInit === 'true' ? 'true' : 'false';
        root.dataset.loupeGnomeHasImage = xviewerState.hasImage ? 'true' : 'false';
        root.dataset.loupeGnomeZoom = String(xviewerState.zoom);
        root.dataset.loupeGnomeRotate = String(xviewerState.rotate);
        root.dataset.loupeGnomeMetaOpen = xviewerState.metaOpen ? 'true' : 'false';
        root.dataset.loupeGnomeChrome = 'loupe';
    }

    function resolveImageViewerTitle(root) {
        if (usesLoupeChrome(root)) {
            return 'Loupe';
        }
        var bodyId = global.document.body && global.document.body.id;
        if (bodyId && LOUPE_BODY_IDS[bodyId]) {
            return 'Loupe';
        }
        return IMAGE_TITLE;
    }

    function resolveEmptyImageLabel(root) {
        return usesLoupeChrome(root) ? 'Aucune image ouverte' : 'Aucune image sélectionnée';
    }

    function syncLoupeEmptyState(root, visible) {
        var empty = root.querySelector('#loupe-empty-state');
        if (empty) {
            empty.hidden = !visible;
        }
    }

    function ensureLoupeEmptyState(root) {
        var content = root.querySelector('#mint-image-viewer-content');
        if (!content || content.querySelector('.viewer-app__image') || content.querySelector('#loupe-empty-state')) {
            return;
        }
        var wrap = global.document.createElement('div');
        wrap.id = 'loupe-empty-state';
        wrap.className = 'loupe-app__empty';
        wrap.innerHTML =
            '<p class="loupe-app__empty-title">Ouvrir une image</p>' +
            '<p class="loupe-app__empty-hint">Ouvrez une image depuis Fichiers pour l\'afficher ici.</p>';
        content.appendChild(wrap);
    }

    function usesPapersChrome(root) {
        return Boolean(root && root.classList && root.classList.contains('papers-app'));
    }

    function supportsPapersGnomeChrome(root) {
        if (usesPapersChrome(root)) {
            return true;
        }
        var bodyId = global.document.body && global.document.body.id;
        return Boolean(bodyId && LOUPE_BODY_IDS[bodyId]);
    }

    function syncPapersGnomeDataset(root) {
        if (!root || !supportsPapersGnomeChrome(root)) {
            return;
        }
        root.dataset.papersGnomeInit = root.dataset.xreaderInit === 'true' ? 'true' : 'false';
        root.dataset.papersGnomeHasDocument = xreaderState.pages > 0 ? 'true' : 'false';
        root.dataset.papersGnomePage = String(xreaderState.page);
        root.dataset.papersGnomePages = String(xreaderState.pages);
        root.dataset.papersGnomeZoom = String(xreaderState.zoom);
        root.dataset.papersGnomeSidebar = xreaderState.sidebar ? 'true' : 'false';
        root.dataset.papersGnomeChrome = 'papers';
    }

    function resolvePdfViewerTitle(root) {
        if (usesPapersChrome(root)) {
            return 'Papers';
        }
        var bodyId = global.document.body && global.document.body.id;
        if (bodyId && LOUPE_BODY_IDS[bodyId]) {
            return 'Papers';
        }
        return PDF_TITLE;
    }

    function resolveEmptyPdfLabel(root) {
        return usesPapersChrome(root) ? 'Aucun document ouvert' : 'Aucun document sélectionné';
    }

    function syncPapersEmptyState(root, visible) {
        var empty = root.querySelector('#papers-empty-state');
        if (empty) {
            empty.hidden = !visible;
        }
    }

    function ensurePapersEmptyState(root) {
        var content = root.querySelector('#mint-pdf-viewer-content');
        if (!content || content.querySelector('.viewer-app__frame') || content.querySelector('#papers-empty-state')) {
            return;
        }
        var wrap = global.document.createElement('div');
        wrap.id = 'papers-empty-state';
        wrap.className = 'papers-app__empty';
        wrap.innerHTML =
            '<p class="papers-app__empty-title">Ouvrir un document</p>' +
            '<p class="papers-app__empty-hint">Ouvrez un fichier PDF depuis Fichiers pour l\'afficher ici.</p>';
        content.appendChild(wrap);
    }

    function syncLoupeMetaType(root, payload) {
        var typeEl = root.querySelector('#loupe-meta-type');
        if (!typeEl) {
            return;
        }
        if (payload && payload.extension) {
            typeEl.textContent = String(payload.extension).toUpperCase();
            return;
        }
        if (payload && payload.name) {
            var parts = String(payload.name).split('.');
            typeEl.textContent = parts.length > 1 ? parts.pop().toUpperCase() : '—';
            return;
        }
        typeEl.textContent = '—';
    }
    var xreaderState = { zoom: 100, page: 0, pages: 0, sidebar: false };

    function getWindowEl(root, slotId) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === slotId) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function syncWindowTitle(winEl, title) {
        if (!winEl || !title) {
            return;
        }
        var wmTitle = winEl.querySelector('#windowTitle');
        if (wmTitle) {
            wmTitle.textContent = title;
        }
        winEl.setAttribute('data-title', title);
    }

    function formatZoom(pct) {
        return String(pct) + ' %';
    }

    function applyXviewerZoom(root) {
        var img = root.querySelector('#mint-image-viewer-content .viewer-app__image');
        if (!img) {
            return;
        }
        var scale = xviewerState.zoom / 100;
        var rot = xviewerState.rotate;
        img.style.transform = 'scale(' + scale + ') rotate(' + rot + 'deg)';
        var zoomEl = root.querySelector('#xviewer-zoom');
        if (zoomEl) {
            zoomEl.textContent = formatZoom(xviewerState.zoom);
        }
    }

    function updateXviewerDims(root, img) {
        var dimsEl = root.querySelector('#xviewer-dims');
        if (!dimsEl || !img) {
            return;
        }
        if (img.naturalWidth && img.naturalHeight) {
            dimsEl.textContent = img.naturalWidth + ' × ' + img.naturalHeight;
        } else {
            img.addEventListener('load', function onLoad() {
                dimsEl.textContent = img.naturalWidth + ' × ' + img.naturalHeight;
            });
        }
    }

    function bindXviewerToolbar(root) {
        if (!root || root.dataset.xviewerBound === 'true') {
            return;
        }
        root.querySelectorAll('[data-xv-action]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var action = btn.getAttribute('data-xv-action');
                if (action === 'zoom-in') {
                    xviewerState.zoom = Math.min(400, xviewerState.zoom + 25);
                    applyXviewerZoom(root);
                    syncLoupeGnomeDataset(root);
                } else if (action === 'zoom-out') {
                    xviewerState.zoom = Math.max(25, xviewerState.zoom - 25);
                    applyXviewerZoom(root);
                    syncLoupeGnomeDataset(root);
                } else if (action === 'zoom-fit') {
                    xviewerState.zoom = 100;
                    xviewerState.rotate = 0;
                    applyXviewerZoom(root);
                    syncLoupeGnomeDataset(root);
                } else if (action === 'rotate') {
                    xviewerState.rotate = (xviewerState.rotate + 90) % 360;
                    applyXviewerZoom(root);
                    syncLoupeGnomeDataset(root);
                } else if (action === 'slideshow') {
                    toggleXviewerSlideshow(root);
                } else if (action === 'toggle-meta') {
                    var pane = root.querySelector('#loupe-meta-pane');
                    if (!pane) {
                        return;
                    }
                    xviewerState.metaOpen = pane.hasAttribute('hidden');
                    if (xviewerState.metaOpen) {
                        pane.removeAttribute('hidden');
                    } else {
                        pane.setAttribute('hidden', 'hidden');
                    }
                    btn.setAttribute('aria-pressed', xviewerState.metaOpen ? 'true' : 'false');
                    syncLoupeGnomeDataset(root);
                }
            });
        });
        bindXviewerMenus(root);
        root.dataset.xviewerBound = 'true';
    }

    function bindXviewerMenus(root) {
        var fileBtn = root.querySelector('[data-xv-menu="file"]');
        var fileMenu = root.querySelector('#xviewer-menu-file');
        if (fileBtn && fileMenu) {
            fileBtn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                fileMenu.hidden = !fileMenu.hidden;
            });
        }
        root.querySelectorAll('[data-xv-menu-action]').forEach(function (item) {
            item.addEventListener('click', function () {
                var cmd = item.getAttribute('data-xv-menu-action');
                if (fileMenu) {
                    fileMenu.hidden = true;
                }
                if (cmd === 'open') {
                    openPixDemoImage();
                    return;
                }
                if (cmd === 'save-as') {
                    openXviewerExportDialog(root);
                }
            });
        });
        global.document.addEventListener('click', function onDoc(ev) {
            if (!fileMenu || fileMenu.hidden) {
                return;
            }
            if (fileMenu.contains(ev.target) || (fileBtn && fileBtn.contains(ev.target))) {
                return;
            }
            fileMenu.hidden = true;
        });
    }

    function openXviewerExportDialog(root) {
        var dialog = root.querySelector('#xviewer-export-dialog');
        if (!dialog) {
            return;
        }
        dialog.hidden = false;
        dialog.querySelectorAll('[data-xv-export]').forEach(function (btn) {
            if (btn.dataset.xvExportBound === 'true') {
                return;
            }
            btn.dataset.xvExportBound = 'true';
            btn.addEventListener('click', function () {
                dialog.hidden = true;
            });
        });
    }

    function toggleXviewerSlideshow(root) {
        var overlay = root.querySelector('#xviewer-slideshow');
        var content = root.querySelector('#mint-image-viewer-content');
        if (!overlay) {
            return;
        }
        var img = content ? content.querySelector('.viewer-app__image') : null;
        if (overlay.hidden) {
            if (!img) {
                return;
            }
            overlay.innerHTML = '';
            var clone = img.cloneNode(true);
            clone.className = 'viewer-app__image xviewer-app__slideshow-image';
            overlay.appendChild(clone);
            overlay.hidden = false;
        } else {
            overlay.hidden = true;
            overlay.innerHTML = '';
        }
    }

    function renderDemoImage(root) {
        var content = root.querySelector('#mint-image-viewer-content');
        if (!content) {
            return;
        }
        content.innerHTML = '';
        var img = global.document.createElement('img');
        img.className = 'viewer-app__image';
        img.alt = 'demo.png';
        img.src = '../../../usr/share/capsuleos/assets/images/vendors/mint/wallpaper/mpiwnicki_light.webp';
        content.appendChild(img);
        onXviewerRendered(root, { name: 'demo.png' });
        var slideshowBtn = root.querySelector('[data-xv-action="slideshow"]');
        if (slideshowBtn) {
            slideshowBtn.disabled = false;
        }
    }

    function renderDemoPdf(root) {
        var content = root.querySelector('#mint-pdf-viewer-content');
        if (!content) {
            return;
        }
        content.innerHTML = '';
        var frame = global.document.createElement('iframe');
        frame.className = 'viewer-app__frame';
        frame.title = 'Bash.pdf';
        frame.src = '../../../../home/public/Documents/Bash.pdf';
        content.appendChild(frame);
        onXreaderRendered(root, { name: 'Bash.pdf' });
    }

    global.openPixDemoImage = function openPixDemoImage() {
        var root = global.document.getElementById('visionneurImages');
        if (!root) {
            return;
        }
        initVisionneurImagesApp();
        renderDemoImage(root);
    };

    global.openXreaderDemoPdf = function openXreaderDemoPdf() {
        var root = global.document.getElementById('visionneurPdf');
        if (!root) {
            return;
        }
        initVisionneurPdfApp();
        renderDemoPdf(root);
    };

    function bindXreaderToolbar(root) {
        if (!root || root.dataset.xreaderBound === 'true') {
            return;
        }
        root.querySelectorAll('[data-xr-action]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var action = btn.getAttribute('data-xr-action');
                if (action === 'zoom-in') {
                    xreaderState.zoom = Math.min(400, xreaderState.zoom + 25);
                    syncXreaderZoom(root);
                    syncPapersGnomeDataset(root);
                } else if (action === 'zoom-out') {
                    xreaderState.zoom = Math.max(50, xreaderState.zoom - 25);
                    syncXreaderZoom(root);
                    syncPapersGnomeDataset(root);
                } else if (action === 'zoom-fit') {
                    xreaderState.zoom = 100;
                    syncXreaderZoom(root);
                    syncPapersGnomeDataset(root);
                } else if (action === 'sidebar') {
                    xreaderState.sidebar = !xreaderState.sidebar;
                    var sidebar = root.querySelector('#xreader-sidebar');
                    if (sidebar) {
                        if (xreaderState.sidebar) {
                            sidebar.removeAttribute('hidden');
                        } else {
                            sidebar.setAttribute('hidden', 'hidden');
                        }
                    }
                    btn.setAttribute('aria-pressed', xreaderState.sidebar ? 'true' : 'false');
                    syncPapersGnomeDataset(root);
                } else if (action === 'prev') {
                    if (xreaderState.page > 1) {
                        xreaderState.page -= 1;
                        syncXreaderPage(root);
                        syncPapersGnomeDataset(root);
                    }
                } else if (action === 'next') {
                    if (xreaderState.pages > 0 && xreaderState.page < xreaderState.pages) {
                        xreaderState.page += 1;
                        syncXreaderPage(root);
                        syncPapersGnomeDataset(root);
                    }
                }
            });
        });
        root.dataset.xreaderBound = 'true';
    }

    function syncXreaderZoom(root) {
        var frame = root.querySelector('#mint-pdf-viewer-content .viewer-app__frame');
        if (frame) {
            frame.style.zoom = String(xreaderState.zoom / 100);
        }
        var zoomEl = root.querySelector('#xreader-zoom');
        if (zoomEl) {
            zoomEl.textContent = formatZoom(xreaderState.zoom);
        }
    }

    function syncXreaderPage(root) {
        var pageEl = root.querySelector('#xreader-page');
        if (pageEl) {
            if (xreaderState.pages > 0) {
                pageEl.textContent = 'Page ' + xreaderState.page + ' sur ' + xreaderState.pages;
            } else {
                pageEl.textContent = 'Page 0 sur 0';
            }
        }
        var prevBtn = root.querySelector('[data-xr-action="prev"]');
        var nextBtn = root.querySelector('[data-xr-action="next"]');
        if (prevBtn) {
            prevBtn.disabled = xreaderState.page <= 1;
        }
        if (nextBtn) {
            nextBtn.disabled = xreaderState.pages === 0 || xreaderState.page >= xreaderState.pages;
        }
    }

    function onXviewerRendered(root, payload) {
        var content = root.querySelector('#mint-image-viewer-content');
        var img = content ? content.querySelector('.viewer-app__image') : null;
        var nameEl = root.querySelector('#mint-image-viewer-filename');
        var winEl = getWindowEl(root, 'visionneur_images');
        var titleBase = resolveImageViewerTitle(root);
        if (payload && payload.name) {
            xviewerState.hasImage = true;
            if (nameEl) {
                nameEl.textContent = payload.name;
            }
            syncLoupeMetaType(root, payload);
            syncLoupeEmptyState(root, false);
            syncWindowTitle(winEl, payload.name + ' — ' + titleBase);
            if (img) {
                updateXviewerDims(root, img);
            }
            xviewerState.zoom = 100;
            xviewerState.rotate = 0;
            applyXviewerZoom(root);
            syncLoupeGnomeDataset(root);
        } else {
            xviewerState.hasImage = false;
            if (nameEl) {
                nameEl.textContent = resolveEmptyImageLabel(root);
            }
            syncLoupeMetaType(root, null);
            var dimsEl = root.querySelector('#xviewer-dims');
            if (dimsEl) {
                dimsEl.textContent = '—';
            }
            ensureLoupeEmptyState(root);
            syncLoupeEmptyState(root, true);
            syncWindowTitle(winEl, titleBase);
            syncLoupeGnomeDataset(root);
        }
    }

    function onXreaderRendered(root, payload) {
        var nameEl = root.querySelector('#mint-pdf-viewer-filename');
        var winEl = getWindowEl(root, 'visionneur_pdf');
        var sidebar = root.querySelector('#xreader-sidebar');
        var titleBase = resolvePdfViewerTitle(root);
        if (payload && payload.name) {
            xreaderState.pages = typeof payload.pages === 'number' ? payload.pages : 3;
            xreaderState.page = 1;
            if (nameEl) {
                nameEl.textContent = payload.name;
            }
            syncPapersEmptyState(root, false);
            syncWindowTitle(winEl, payload.name + ' — ' + titleBase);
            if (sidebar) {
                var thumbs = '';
                var pi;
                for (pi = 1; pi <= xreaderState.pages; pi += 1) {
                    thumbs += '<button type="button" class="papers-app__thumb' + (pi === 1 ? ' is-active' : '') + '" aria-current="' + (pi === 1 ? 'page' : 'false') + '">' + pi + '</button>';
                }
                sidebar.innerHTML = thumbs;
            }
        } else {
            xreaderState.pages = 0;
            xreaderState.page = 0;
            if (nameEl) {
                nameEl.textContent = resolveEmptyPdfLabel(root);
            }
            ensurePapersEmptyState(root);
            syncPapersEmptyState(root, true);
            syncWindowTitle(winEl, titleBase);
            if (sidebar) {
                sidebar.innerHTML = '<p class="papers-app__sidebar-hint">Aucun document</p>';
            }
        }
        xreaderState.zoom = 100;
        syncXreaderZoom(root);
        syncXreaderPage(root);
        syncPapersGnomeDataset(root);
    }

    function initVisionneurImagesApp(container) {
        var root = container ? container.querySelector('#visionneurImages') : global.document.getElementById('visionneurImages');
        if (!root) {
            return;
        }
        bindXviewerToolbar(root);
        syncWindowTitle(getWindowEl(root, 'visionneur_images'), resolveImageViewerTitle(root));
        root.dataset.xviewerInit = 'true';
        syncLoupeGnomeDataset(root);
    }

    function initVisionneurPdfApp(container) {
        var root = container ? container.querySelector('#visionneurPdf') : global.document.getElementById('visionneurPdf');
        if (!root) {
            return;
        }
        bindXreaderToolbar(root);
        syncWindowTitle(getWindowEl(root, 'visionneur_pdf'), resolvePdfViewerTitle(root));
        root.dataset.xreaderInit = 'true';
        syncPapersGnomeDataset(root);
    }

    global.onMintViewerRendered = function (appId) {
        var root;
        if (appId === 'visionneur_images') {
            root = global.document.getElementById('visionneurImages');
            if (root) {
                var payload = global.fileViewerState && global.fileViewerState.visionneur_images
                    ? global.fileViewerState.visionneur_images
                    : null;
                if (!payload && typeof global.window !== 'undefined') {
                    payload = null;
                }
                onXviewerRendered(root, payload);
            }
        }
        if (appId === 'visionneur_pdf') {
            root = global.document.getElementById('visionneurPdf');
            if (root) {
                var pdfPayload = null;
                if (global.fileViewerState && global.fileViewerState.visionneur_pdf) {
                    pdfPayload = global.fileViewerState.visionneur_pdf;
                }
                onXreaderRendered(root, pdfPayload);
            }
        }
    };

    global.initVisionneurImagesApp = initVisionneurImagesApp;
    global.initVisionneurPdfApp = initVisionneurPdfApp;
    global.syncLoupeGnomeDataset = syncLoupeGnomeDataset;
    global.syncPapersGnomeDataset = syncPapersGnomeDataset;
    global.supportsLoupeGnomeChrome = supportsLoupeGnomeChrome;
    global.supportsPapersGnomeChrome = supportsPapersGnomeChrome;

    global.document.addEventListener('capsule:window-opened', function (event) {
        if (!event.detail) {
            return;
        }
        if (event.detail.slotId === 'visionneur_images') {
            global.setTimeout(function () {
                initVisionneurImagesApp(event.detail.container);
            }, 30);
        }
        if (event.detail.slotId === 'visionneur_pdf') {
            global.setTimeout(function () {
                initVisionneurPdfApp(event.detail.container);
            }, 30);
        }
    });
}(typeof window !== 'undefined' ? window : globalThis));
