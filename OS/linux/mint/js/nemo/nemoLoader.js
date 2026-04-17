document.addEventListener('DOMContentLoaded', function () {
    const nemoIcon = document.querySelector('[data-link="nemo"]');
    if (!nemoIcon) {
        return;
    }

    nemoIcon.addEventListener('click', function () {
        console.log('Nemo loaded');
    });
});