/**
 * Redimensionnement bordures fenêtre.
 */
(function initCapsuleWindowResize(global) {
    'use strict';

    const boundsApi = () => global.CapsuleWindowBounds;

    class Resizer {
        constructor(element, options = {}) {
            this.element = element;
            this.BORDER_SIZE =(options.borderSize != null ? options.borderSize : 5);
            this.boundsOptions = options.bounds || {};
            this.resizing = false;
            this.resizeDirection = '';
            this.startX = 0;
            this.startY = 0;
            this.startLeft = 0;
            this.startTop = 0;
            this.startWidth = 0;
            this.startHeight = 0;

            this.onPointerDown = this.startResize.bind(this);
            this.onPointerMove = this.checkBorder.bind(this);
            this.onPointerUp = this.stopResize.bind(this);
            this.onCursorMove = this.changeCursor.bind(this);

            this.element.addEventListener('pointerdown', this.onPointerDown);
            this.element.addEventListener('pointermove', this.onCursorMove);
        }

        startResize(e) {
            if (e.button !== 0 && e.pointerType === 'mouse') {
                return;
            }
            if (e.target.closest('#windowHeader, button, input, textarea, select, a, label')) {
                return;
            }

            const rect = this.element.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            const left = offsetX <= this.BORDER_SIZE;
            const right = offsetX >= rect.width - this.BORDER_SIZE;
            const top = offsetY <= this.BORDER_SIZE;
            const bottom = offsetY >= rect.height - this.BORDER_SIZE;

            let direction = '';
            if (top && left) direction = 'top-left';
            else if (top && right) direction = 'top-right';
            else if (bottom && left) direction = 'bottom-left';
            else if (bottom && right) direction = 'bottom-right';
            else if (left) direction = 'left';
            else if (right) direction = 'right';
            else if (top) direction = 'top';
            else if (bottom) direction = 'bottom';

            if (!direction) {
                return;
            }

            e.preventDefault();
            this.resizing = true;
            this.resizeDirection = direction;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.startLeft = rect.left;
            this.startTop = rect.top;
            this.startWidth = rect.width;
            this.startHeight = rect.height;
            this.activePointerId = e.pointerId;

            document.addEventListener('pointermove', this.onPointerMove);
            document.addEventListener('pointerup', this.onPointerUp);
            document.addEventListener('pointercancel', this.onPointerUp);
        }

        checkBorder(e) {
            if (!this.resizing || e.pointerId !== this.activePointerId) {
                return;
            }
            e.preventDefault();

            const dx = e.clientX - this.startX;
            const dy = e.clientY - this.startY;

            let newWidth = this.startWidth;
            let newLeft = this.startLeft;
            let newHeight = this.startHeight;
            let newTop = this.startTop;

            switch (this.resizeDirection) {
                case 'left':
                    newWidth -= dx;
                    newLeft += dx;
                    break;
                case 'right':
                    newWidth += dx;
                    break;
                case 'top':
                    newHeight -= dy;
                    newTop += dy;
                    break;
                case 'bottom':
                    newHeight += dy;
                    break;
                case 'top-left':
                    newWidth -= dx;
                    newLeft += dx;
                    newHeight -= dy;
                    newTop += dy;
                    break;
                case 'top-right':
                    newWidth += dx;
                    newHeight -= dy;
                    newTop += dy;
                    break;
                case 'bottom-left':
                    newWidth -= dx;
                    newLeft += dx;
                    newHeight += dy;
                    break;
                case 'bottom-right':
                    newWidth += dx;
                    newHeight += dy;
                    break;
                default:
                    break;
            }

            const clamped = boundsApi().clampSize(
                this.element,
                newLeft,
                newTop,
                newWidth,
                newHeight,
                this.boundsOptions,
                { direction: this.resizeDirection },
            );

            if (global.CapsuleWindowPositioning
                && typeof global.CapsuleWindowPositioning.applyViewportBox === 'function') {
                global.CapsuleWindowPositioning.applyViewportBox(this.element, clamped, this.boundsOptions);
            } else {
                this.element.style.position = 'fixed';
                this.element.style.width = `${clamped.width}px`;
                this.element.style.height = `${clamped.height}px`;
                this.element.style.left = `${clamped.left}px`;
                this.element.style.top = `${clamped.top}px`;
            }
        }

        stopResize(e) {
            if (!this.resizing) {
                return;
            }
            if (e && e.pointerId !== this.activePointerId) {
                return;
            }

            this.resizing = false;
            this.resizeDirection = '';
            this.activePointerId = null;
            this.element.style.cursor = 'auto';
            document.removeEventListener('pointermove', this.onPointerMove);
            document.removeEventListener('pointerup', this.onPointerUp);
            document.removeEventListener('pointercancel', this.onPointerUp);
        }

        changeCursor(e) {
            if (this.resizing) {
                return;
            }

            const rect = this.element.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            const left = offsetX <= this.BORDER_SIZE;
            const right = offsetX >= rect.width - this.BORDER_SIZE;
            const top = offsetY <= this.BORDER_SIZE;
            const bottom = offsetY >= rect.height - this.BORDER_SIZE;

            if ((left && top) || (right && bottom)) {
                this.element.style.cursor = 'nwse-resize';
            } else if ((right && top) || (left && bottom)) {
                this.element.style.cursor = 'nesw-resize';
            } else if (left || right) {
                this.element.style.cursor = 'ew-resize';
            } else if (top || bottom) {
                this.element.style.cursor = 'ns-resize';
            } else {
                this.element.style.cursor = 'auto';
            }
        }
    }

    function enableResize(element, options = {}) {
        if (!element || element.dataset.resizeInit === 'true') {
            return null;
        }
        const instance = new Resizer(element, options);
        element.dataset.resizeInit = 'true';
        return instance;
    }

    global.CapsuleWindowResize = { Resizer, enableResize };
    global.Resizer = Resizer;
}(typeof window !== 'undefined' ? window : globalThis));
