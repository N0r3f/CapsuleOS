/**
 * Drawing (Dessin) — simulation com.github.maoschanz.drawing sur Mint.
 */
(function initDrawingApp(global) {
    'use strict';

    var PALETTE = [
        '#000000', '#ffffff',
        '#e01b24', '#ff7800',
        '#f6d32d', '#33d17a',
        '#1c71d8', '#9747ff',
        '#986a44', '#cdab8f'
    ];

    function getWindowEl(root) {
        var el = root;
        while (el) {
            if (el.getAttribute && el.getAttribute('data-link') === 'drawing') {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function initDrawingAppOnce() {
        var root = global.document.getElementById('drawingApp');
        if (!root || root.dataset.drawingInit === 'true') {
            return;
        }
        root.dataset.drawingInit = 'true';

        var winEl = getWindowEl(root);
        if (winEl) {
            var windowTitle = 'Sans titre — Dessin';
            if (typeof global.CapsuleStrings !== 'undefined' && global.CapsuleStrings.get) {
                var strTitle = global.CapsuleStrings.get('drawing.windowTitle');
                if (strTitle) {
                    windowTitle = strTitle;
                }
            }
            var wmTitle = winEl.querySelector('#windowTitle');
            if (wmTitle) {
                wmTitle.textContent = windowTitle;
            }
            winEl.setAttribute('data-title', windowTitle);
        }

        var canvas = global.document.getElementById('drawing-canvas');
        var paletteEl = global.document.getElementById('drawing-palette');
        var sizeInput = global.document.getElementById('drawing-size');
        var toolBtns = root.querySelectorAll('.drawing-app__tool[data-tool]');
        if (!canvas || !paletteEl || !sizeInput) {
            return;
        }

        var ctx = canvas.getContext('2d');
        var tool = 'pencil';
        var color = '#000000';
        var size = 4;
        var drawing = false;
        var startX = 0;
        var startY = 0;
        var lastX = 0;
        var lastY = 0;
        var snapshot = null;
        var history = [];
        var historyIndex = -1;

        function resizeCanvas() {
            var wrap = canvas.parentElement;
            if (!wrap) {
                return;
            }
            var rect = wrap.getBoundingClientRect();
            var w = Math.max(200, Math.floor(rect.width - 8));
            var h = Math.max(160, Math.floor(rect.height - 8));
            if (canvas.width === w && canvas.height === h) {
                return;
            }
            var prev = null;
            if (canvas.width > 0 && canvas.height > 0) {
                prev = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
            canvas.width = w;
            canvas.height = h;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
            if (prev) {
                ctx.putImageData(prev, 0, 0);
            } else if (history.length === 0) {
                pushHistory();
            }
        }

        function pushHistory() {
            historyIndex = historyIndex + 1;
            history = history.slice(0, historyIndex);
            history.push(canvas.toDataURL('image/png'));
            if (history.length > 24) {
                history.shift();
                historyIndex = historyIndex - 1;
            }
        }

        function restoreFromDataUrl(url, callback) {
            var img = new Image();
            img.onload = function onImgLoad() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                if (callback) {
                    callback();
                }
            };
            img.src = url;
        }

        function clearCanvas() {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            pushHistory();
        }

        function setTool(nextTool) {
            tool = nextTool;
            var i;
            for (i = 0; i < toolBtns.length; i++) {
                var active = toolBtns[i].getAttribute('data-tool') === tool;
                toolBtns[i].classList.toggle('is-active', active);
                toolBtns[i].setAttribute('aria-pressed', active ? 'true' : 'false');
            }
            canvas.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
        }

        function setColor(nextColor) {
            color = nextColor;
            var swatches = paletteEl.querySelectorAll('.drawing-app__swatch');
            var j;
            for (j = 0; j < swatches.length; j++) {
                var on = swatches[j].getAttribute('data-color') === color;
                swatches[j].classList.toggle('is-active', on);
            }
        }

        function canvasPoint(event) {
            var rect = canvas.getBoundingClientRect();
            var scaleX = canvas.width / rect.width;
            var scaleY = canvas.height / rect.height;
            return {
                x: (event.clientX - rect.left) * scaleX,
                y: (event.clientY - rect.top) * scaleY
            };
        }

        function strokeStyle() {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = size;
            if (tool === 'eraser') {
                ctx.strokeStyle = '#ffffff';
                ctx.fillStyle = '#ffffff';
            } else {
                ctx.strokeStyle = color;
                ctx.fillStyle = color;
            }
        }

        function drawShapePreview(x0, y0, x1, y1) {
            if (!snapshot) {
                snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
            ctx.putImageData(snapshot, 0, 0);
            strokeStyle();
            if (tool === 'line') {
                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(x1, y1);
                ctx.stroke();
                return;
            }
            if (tool === 'rect') {
                ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
                return;
            }
            if (tool === 'ellipse') {
                var rx = Math.abs(x1 - x0) / 2;
                var ry = Math.abs(y1 - y0) / 2;
                var cx = x0 + (x1 - x0) / 2;
                var cy = y0 + (y1 - y0) / 2;
                ctx.beginPath();
                ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        function onPointerDown(event) {
            if (event.button !== 0) {
                return;
            }
            drawing = true;
            var p = canvasPoint(event);
            startX = p.x;
            startY = p.y;
            lastX = p.x;
            lastY = p.y;
            if (tool === 'pencil' || tool === 'eraser') {
                strokeStyle();
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
            } else {
                snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
            try {
                if (event.pointerId !== undefined) {
                    canvas.setPointerCapture(event.pointerId);
                }
            } catch (captureErr) {
                /* ignore — souris synthétique Playwright */
            }
            event.preventDefault();
        }

        function onPointerMove(event) {
            if (!drawing) {
                return;
            }
            var p = canvasPoint(event);
            if (tool === 'pencil' || tool === 'eraser') {
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
                lastX = p.x;
                lastY = p.y;
                return;
            }
            drawShapePreview(startX, startY, p.x, p.y);
            event.preventDefault();
        }

        function onPointerUp(event) {
            if (!drawing) {
                return;
            }
            drawing = false;
            snapshot = null;
            try {
                canvas.releasePointerCapture(event.pointerId);
            } catch (err) {
                /* ignore */
            }
            pushHistory();
            event.preventDefault();
        }

        PALETTE.forEach(function buildSwatch(hex) {
            var btn = global.document.createElement('button');
            btn.type = 'button';
            btn.className = 'drawing-app__swatch';
            btn.setAttribute('data-color', hex);
            btn.style.backgroundColor = hex;
            btn.setAttribute('aria-label', hex);
            btn.addEventListener('click', function onSwatchClick() {
                setColor(hex);
            });
            paletteEl.appendChild(btn);
        });
        setColor('#000000');

        sizeInput.addEventListener('input', function onSizeInput() {
            size = parseInt(sizeInput.value, 10) || 4;
            sizeInput.setAttribute('aria-valuetext', size + ' px');
        });

        toolBtns.forEach(function bindTool(btn) {
            btn.addEventListener('click', function onToolClick() {
                setTool(btn.getAttribute('data-tool'));
            });
        });

        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);
        canvas.addEventListener('mousedown', onPointerDown);
        canvas.addEventListener('mousemove', onPointerMove);
        canvas.addEventListener('mouseup', onPointerUp);

        root.querySelectorAll('[data-drawing-action]').forEach(function bindAction(btn) {
            btn.addEventListener('click', function onAction() {
                var action = btn.getAttribute('data-drawing-action');
                if (action === 'new') {
                    clearCanvas();
                    return;
                }
                if (action === 'undo') {
                    if (historyIndex > 0) {
                        historyIndex = historyIndex - 1;
                        restoreFromDataUrl(history[historyIndex]);
                    } else {
                        clearCanvas();
                    }
                    return;
                }
                if (action === 'redo') {
                    if (historyIndex < history.length - 1) {
                        historyIndex = historyIndex + 1;
                        restoreFromDataUrl(history[historyIndex]);
                    }
                    return;
                }
                if (action === 'save') {
                    var link = global.document.createElement('a');
                    link.download = 'Dessin.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            });
        });

        if (typeof ResizeObserver !== 'undefined') {
            var ro = new ResizeObserver(function onResize() {
                resizeCanvas();
            });
            ro.observe(canvas.parentElement);
        } else {
            global.setTimeout(resizeCanvas, 100);
        }
        resizeCanvas();
    }

    global.initDrawingApp = initDrawingAppOnce;
}(typeof window !== 'undefined' ? window : this));
