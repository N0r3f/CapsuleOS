const makeDraggable = (element) => {
    if (!element || element.dataset.dragInit === 'true') {
        return;
    }

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const getDesktopRect = () => {
        const desktop = document.getElementById('desktop');
        if (desktop) {
            return desktop.getBoundingClientRect();
        }
        return document.body.getBoundingClientRect();
    };

    const onMouseMove = (e) => {
        if (!isDragging) {
            return;
        }

        const desktopRect = getDesktopRect();
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        const maxLeft = desktopRect.right - element.offsetWidth;
        const maxTop = desktopRect.bottom - element.offsetHeight;

        newX = Math.max(desktopRect.left, Math.min(newX, maxLeft));
        newY = Math.max(desktopRect.top, Math.min(newY, maxTop));

        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
    };

    const stopDragging = () => {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', stopDragging);
    };

    const startDragging = (e) => {
        if (e.button !== 0) {
            return;
        }

        if (e.target.closest('button, input, textarea, select, a')) {
            return;
        }

        e.preventDefault();

        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        isDragging = true;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', stopDragging);
    };

    const dragHandle = element.querySelector('#windowHeader') || element;
    dragHandle.addEventListener('mousedown', startDragging);
    element.dataset.dragInit = 'true';
};