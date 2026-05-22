document.addEventListener('DOMContentLoaded', function () {
    const fileExplorerIcon = document.querySelector('[data-link="nemo"]');
    if (!fileExplorerIcon) {
        return;
    }

    fileExplorerIcon.addEventListener('click', function () {
        console.log('File explorer loaded');
    });
});