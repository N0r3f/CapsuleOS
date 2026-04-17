class Resizer {
    constructor(element) {
        this.element = element;
        this.resizing = false;
        this.resizeDirection = '';
        this.startX = 0;
        this.startY = 0;
        this.startLeft = 0;
        this.startTop = 0;
        this.startWidth = 0;
        this.startHeight = 0;
        this.BORDER_SIZE = 10;

        this.onMouseDown = this.startResize.bind(this);
        this.onMouseMove = this.checkBorder.bind(this);
        this.onMouseUp = this.stopResize.bind(this);
        this.onCursorMove = this.changeCursor.bind(this);

        this.element.addEventListener('mousedown', this.onMouseDown);
        this.element.addEventListener('mousemove', this.onCursorMove);
    }

    startResize(e) {
        if (e.button !== 0) return;
        if (e.target.closest('#windowHeader, button, input, textarea, select, a')) return;

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

        if (!direction) return;

        e.preventDefault();
        this.resizing = true;
        this.resizeDirection = direction;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startLeft = rect.left;
        this.startTop = rect.top;
        this.startWidth = rect.width;
        this.startHeight = rect.height;

        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    checkBorder(e) {
        if (!this.resizing) return;
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
        }

        const computed = window.getComputedStyle(this.element);
        const minWidth = parseFloat(computed.minWidth) || 320;
        const minHeight = parseFloat(computed.minHeight) || 180;

        if (newWidth < minWidth) {
            if (this.resizeDirection.includes('left')) {
                newLeft -= (minWidth - newWidth);
            }
            newWidth = minWidth;
        }

        if (newHeight < minHeight) {
            if (this.resizeDirection.includes('top')) {
                newTop -= (minHeight - newHeight);
            }
            newHeight = minHeight;
        }

        const desktop = document.getElementById('desktop');
        if (desktop) {
            const dRect = desktop.getBoundingClientRect();
            const maxRight = dRect.right;
            const maxBottom = dRect.bottom;

            newLeft = Math.max(dRect.left, newLeft);
            newTop = Math.max(dRect.top, newTop);
            newWidth = Math.min(newWidth, maxRight - newLeft);
            newHeight = Math.min(newHeight, maxBottom - newTop);

            newWidth = Math.max(minWidth, newWidth);
            newHeight = Math.max(minHeight, newHeight);
        }

        this.element.style.width = `${newWidth}px`;
        this.element.style.height = `${newHeight}px`;
        this.element.style.left = `${newLeft}px`;
        this.element.style.top = `${newTop}px`;
    }

    stopResize() {
        if (!this.resizing) return;

        this.resizing = false;
        this.resizeDirection = '';
        this.element.style.cursor = 'auto';
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    changeCursor(e) {
        if (this.resizing) return;

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