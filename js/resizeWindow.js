class Resizer {
    constructor(element) {
        this.element = element;
        this.handle = document.createElement('div');
        this.handle.className = 'resize-handle';
        this.element.appendChild(this.handle);
        this.handle.addEventListener('mousedown', this.initResize.bind(this));
    }

    initResize(event) {
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.startWidth = parseFloat(getComputedStyle(this.element).width);
        this.startHeight = parseFloat(getComputedStyle(this.element).height);
        document.addEventListener('mousemove', this.doResize.bind(this));
        document.addEventListener('mouseup', this.stopResize.bind(this));
    }

    doResize(event) {
        const dx = event.clientX - this.startX;
        const dy = event.clientY - this.startY;
        this.element.style.width = `${this.startWidth + dx}px`;
        this.element.style.height = `${this.startHeight + dy}px`;
    }

    stopResize() {
        document.removeEventListener('mousemove', this.doResize);
        document.removeEventListener('mouseup', this.stopResize);
    }
}

// Utilisation de la classe Resizer
document.addEventListener('DOMContentLoaded', () => {
    const windowContainer = document.getElementById('windowContainer');
    new Resizer(windowContainer);
});
