/**
 * Capture d'écran GNOME — simulation Mint (org.gnome.Screenshot)
 */
(function initGnomeScreenshotApp(global) {
    'use strict';

    function resolveWallpaperUrl() {
        var storage = global.CapsuleThemeStorage;
        var bodyId = global.document && global.document.body ? global.document.body.id : '';
        if (storage && typeof storage.findWallpaperEntry === 'function' && typeof storage.resolveWallpaperEntry === 'function') {
            var wpId = global.document.documentElement.dataset.gnomeWallpaper || storage.readSavedWallpaper();
            var entry = storage.findWallpaperEntry(wpId, bodyId);
            var theme = global.document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
            var bg = storage.resolveWallpaperEntry(entry, theme);
            if (bg.indexOf('url(') === 0) {
                return bg.slice(5, -2).replace(/^"/, '').replace(/"$/, '');
            }
            return bg;
        }
        var rel = './assets/images/vendors/mint/default_background.webp';
        if (bodyId === 'fedora') {
            rel = './assets/images/vendors/fedora/wallpaper/f44-01-night.webp';
            if (global.document.documentElement.dataset.theme === 'light') {
                rel = './assets/images/vendors/fedora/wallpaper/f44-01-day.webp';
            }
        } else if (bodyId === 'rocky') {
            rel = './assets/images/vendors/rocky/wallpaper/rocky-default-10-gemstone-skies-night.webp';
            if (global.document.documentElement.dataset.theme === 'light') {
                rel = './assets/images/vendors/rocky/wallpaper/rocky-default-10-gemstone-skies-day.webp';
            }
        } else if (bodyId === 'alma') {
            rel = './assets/images/vendors/alma/wallpaper/almalinux-night.jpg';
            if (global.document.documentElement.dataset.theme === 'light') {
                rel = './assets/images/vendors/alma/wallpaper/almalinux-day.jpg';
            }
        }
        if (typeof global.CapsuleResource !== 'undefined' && global.CapsuleResource.resolve) {
            return global.CapsuleResource.resolve(rel);
        }
        return rel.replace('./assets/images/', '../../../usr/share/capsuleos/assets/images/');
    }

    function getFlashEl() {
        var el = global.document.getElementById('screenshot-flash');
        if (!el && global.document.body) {
            el = global.document.createElement('div');
            el.id = 'screenshot-flash';
            el.className = 'screenshot-flash';
            el.setAttribute('hidden', '');
            el.setAttribute('aria-hidden', 'true');
            global.document.body.appendChild(el);
        }
        return el;
    }

    function playFlash() {
        var flash = getFlashEl();
        if (!flash) {
            return;
        }
        flash.removeAttribute('hidden');
        flash.classList.add('is-active');
        global.setTimeout(function removeFlash() {
            flash.classList.remove('is-active');
            global.setTimeout(function hideFlash() {
                flash.setAttribute('hidden', '');
            }, 140);
        }, 120);
    }

    function getSelectedArea(root) {
        var checked = root.querySelector('input[name="gnome-shot-area"]:checked');
        return checked ? checked.value : 'screen';
    }

    function areaHint(area) {
        if (area === 'window') {
            return 'La fenêtre active sera capturée (simulation : écran du bureau).';
        }
        if (area === 'selection') {
            return 'Sélection : capture de la zone visible du bureau (simulation).';
        }
        return '';
    }

    function getShellRoot() {
        var body = global.document.body;
        if (!body || !body.id) {
            return null;
        }
        return global.document.getElementById(body.id) || body;
    }

    function buildCaptureCanvas(callback) {
        var desktop = global.document.getElementById('desktop');
        var shellRoot = getShellRoot();
        if (!desktop || !shellRoot) {
            callback(null);
            return;
        }
        var rect = desktop.getBoundingClientRect();
        var canvas = global.document.createElement('canvas');
        var w = Math.max(1, Math.round(rect.width));
        var h = Math.max(1, Math.round(rect.height));
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        if (!ctx) {
            callback(null);
            return;
        }

        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function onWallpaperLoad() {
            ctx.drawImage(img, 0, 0, w, h);
            var cs = global.getComputedStyle(shellRoot);
            var padTop = parseInt(cs.paddingTop, 10) || 0;
            if (padTop > 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                ctx.fillRect(0, 0, w, padTop);
            }
            callback(canvas);
        };
        img.onerror = function onWallpaperError() {
            ctx.fillStyle = '#3c3c44';
            ctx.fillRect(0, 0, w, h);
            callback(canvas);
        };
        img.src = resolveWallpaperUrl();
    }

    function initScreenshotApp() {
        var root = global.document.getElementById('gnomeScreenshotApp');
        if (!root || root.dataset.shotInit === 'true') {
            return;
        }
        root.dataset.shotInit = 'true';

        var configPanel = global.document.getElementById('gnome-shot-config');
        var resultPanel = global.document.getElementById('gnome-shot-result');
        var captureBtn = global.document.getElementById('gnome-shot-capture');
        var delaySelect = global.document.getElementById('gnome-shot-delay');
        var hintEl = global.document.getElementById('gnome-shot-hint');
        var previewImg = global.document.getElementById('gnome-shot-preview');
        var statusEl = global.document.getElementById('gnome-shot-status');
        if (!configPanel || !resultPanel || !captureBtn || !previewImg) {
            return;
        }

        var lastDataUrl = '';

        function syncShotDataset(phase) {
            root.dataset.shotInit = 'true';
            root.dataset.shotPhase = phase || 'config';
            root.dataset.shotArea = getSelectedArea(root);
        }

        function showConfig() {
            resultPanel.setAttribute('hidden', '');
            configPanel.removeAttribute('hidden');
            if (statusEl) {
                statusEl.textContent = '';
            }
            syncShotDataset('config');
        }

        function showResult(dataUrl) {
            lastDataUrl = dataUrl;
            previewImg.src = dataUrl;
            configPanel.setAttribute('hidden', '');
            resultPanel.removeAttribute('hidden');
            syncShotDataset('result');
        }

        function updateHint() {
            if (hintEl) {
                hintEl.textContent = areaHint(getSelectedArea(root));
            }
            syncShotDataset(root.dataset.shotPhase || 'config');
        }

        root.querySelectorAll('input[name="gnome-shot-area"]').forEach(function (input) {
            input.addEventListener('change', updateHint);
        });
        updateHint();

        function runCapture() {
            captureBtn.disabled = true;
            if (hintEl) {
                hintEl.textContent = 'Capture en cours…';
            }
            buildCaptureCanvas(function onCanvas(canvas) {
                captureBtn.disabled = false;
                if (!canvas) {
                    if (hintEl) {
                        hintEl.textContent = 'Impossible de capturer le bureau.';
                    }
                    return;
                }
                playFlash();
                var dataUrl = canvas.toDataURL('image/png');
                showResult(dataUrl);
                if (statusEl) {
                    statusEl.textContent = 'Capture enregistrée en mémoire (simulation).';
                }
            });
        }

        captureBtn.addEventListener('click', function onCaptureClick() {
            var delaySec = parseInt(delaySelect.value, 10) || 0;
            captureBtn.disabled = true;
            if (hintEl) {
                hintEl.textContent = delaySec > 0
                    ? ('Capture dans ' + delaySec + ' s…')
                    : 'Capture en cours…';
            }
            global.setTimeout(function afterDelay() {
                runCapture();
            }, delaySec * 1000);
        });

        resultPanel.querySelectorAll('[data-shot-gnome-action]').forEach(function (btn) {
            btn.addEventListener('click', function onAction() {
                var action = btn.getAttribute('data-shot-gnome-action');
                if (action === 'new') {
                    showConfig();
                    updateHint();
                    return;
                }
                if (!lastDataUrl) {
                    return;
                }
                if (action === 'save') {
                    var link = global.document.createElement('a');
                    link.download = 'Capture d\'écran ' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.png';
                    link.href = lastDataUrl;
                    link.click();
                    if (statusEl) {
                        statusEl.textContent = 'Image téléchargée.';
                    }
                    return;
                }
                if (action === 'copy') {
                    if (navigator.clipboard && navigator.clipboard.write) {
                        fetch(lastDataUrl)
                            .then(function (res) { return res.blob(); })
                            .then(function (blob) {
                                return navigator.clipboard.write([
                                    new ClipboardItem({ 'image/png': blob })
                                ]);
                            })
                            .then(function () {
                                if (statusEl) {
                                    statusEl.textContent = 'Copié dans le presse-papiers.';
                                }
                            })
                            .catch(function () {
                                if (statusEl) {
                                    statusEl.textContent = 'Copie non disponible dans ce navigateur.';
                                }
                            });
                    } else if (statusEl) {
                        statusEl.textContent = 'Presse-papiers non disponible (utilisez Enregistrer).';
                    }
                }
            });
        });

        showConfig();
    }

    global.initScreenshotApp = initScreenshotApp;
}(typeof window !== 'undefined' ? window : this));
