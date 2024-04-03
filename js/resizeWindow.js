class Resizer {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.element.addEventListener('mousedown', this.startResize.bind(this));
        this.element.addEventListener('mousemove', this.checkBorder.bind(this));
        this.element.addEventListener('mouseup', this.stopResize.bind(this));
        this.element.addEventListener('mousemove', this.changeCursor.bind(this));
    }

    startResize(e) {
        const BORDER_SIZE = 4;
        if (e.offsetX < BORDER_SIZE || e.offsetY < BORDER_SIZE ||
            e.offsetX > this.element.offsetWidth - BORDER_SIZE ||
            e.offsetY > this.element.offsetHeight - BORDER_SIZE) {
            this.resizing = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.startWidth = this.element.offsetWidth;
            this.startHeight = this.element.offsetHeight;
        }
    }

    checkBorder(e) {
        if (!this.resizing) return;
        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;
        // Redimensionnement sur un seul axe
        if (Math.abs(dx) > Math.abs(dy)) {
            this.element.style.width = `${this.startWidth + dx}px`;
        } else {
            this.element.style.height = `${this.startHeight + dy}px`;
        }
    }

    stopResize() {
        this.resizing = false;
        // Réinitialiser le curseur
        this.element.style.cursor = 'auto';
    }

    changeCursor(e) {
        const BORDER_SIZE = 4;
        if (e.offsetX < BORDER_SIZE || e.offsetY < BORDER_SIZE ||
            e.offsetX > this.element.offsetWidth - BORDER_SIZE ||
            e.offsetY > this.element.offsetHeight - BORDER_SIZE) {
            this.element.style.cursor = 'ns-resize';
        } else {
            this.element.style.cursor = 'auto';
        }
    }
}
