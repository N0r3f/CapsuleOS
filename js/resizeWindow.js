document.addEventListener('DOMContentLoaded', function () {
    class Resizer {
    constructor(elementId) {
       this.element = document.getElementById(elementId);
       this.element.addEventListener('mousedown', this.startResize.bind(this));
       this.element.addEventListener('mousemove', this.checkBorder.bind(this));
       this.element.addEventListener('mouseup', this.stopResize.bind(this));
    }
   
    startResize(e) {
       this.resizing = true;
       this.startX = e.clientX;
       this.startY = e.clientY;
       this.startWidth = this.element.offsetWidth;
       this.startHeight = this.element.offsetHeight;
    }
   
    checkBorder(e) {
       if (!this.resizing) return;
       const dx = e.clientX - this.startX;
       const dy = e.clientY - this.startY;
       this.element.style.width = `${this.startWidth + dx}px`;
       this.element.style.height = `${this.startHeight + dy}px`;
    }
   
    stopResize() {
       this.resizing = false;
    }
   }
   
   // Initialisation du redimensionnement pour l'élément #windowContainer
   const resizer = new Resizer('windowContainer');
});