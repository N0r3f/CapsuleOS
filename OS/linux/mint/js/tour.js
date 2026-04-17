const TOUR_STORAGE_KEY = 'mint-tour-done';

(function initTour() {
    if (localStorage.getItem(TOUR_STORAGE_KEY) === 'true') {
        return;
    }
    // Defer to next frame so the DOM is fully painted
    requestAnimationFrame(function () {
        setTimeout(buildTour, 400);
    });
})();

function buildTour() {
    if (typeof TOUR_STEPS === 'undefined' || !TOUR_STEPS.length) return;

    let currentStep = 0;

    const overlay = document.getElementById('tourOverlay');
    if (!overlay) return;

    const spotlight = overlay.querySelector('#tourSpotlight');
    const tooltip   = overlay.querySelector('#tourTooltip');
    const titleEl   = overlay.querySelector('#tourTitle');
    const bodyEl    = overlay.querySelector('#tourBody');
    const prevBtn   = overlay.querySelector('#tourPrev');
    const nextBtn   = overlay.querySelector('#tourNext');
    const skipBtn   = overlay.querySelector('#tourSkip');
    const counterEl = overlay.querySelector('#tourCounter');

    function getTargetRect(selector) {
        const el = document.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top, left: r.left, width: r.width, height: r.height, el };
    }

    const PAD = 10;

    function positionSpotlight(rect) {
        spotlight.style.top    = (rect.top  - PAD) + 'px';
        spotlight.style.left   = (rect.left - PAD) + 'px';
        spotlight.style.width  = (rect.width  + PAD * 2) + 'px';
        spotlight.style.height = (rect.height + PAD * 2) + 'px';
    }

    function positionTooltip(rect) {
        const tw = 280;
        const th = tooltip.offsetHeight || 120;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let left = rect.left + rect.width / 2 - tw / 2;
        let top  = rect.top - th - PAD * 2;

        if (top < 8) top = rect.top + rect.height + PAD * 2;
        if (left < 8) left = 8;
        if (left + tw > vw - 8) left = vw - tw - 8;
        if (top + th > vh - 8) top = vh - th - 8;

        tooltip.style.left  = left + 'px';
        tooltip.style.top   = top  + 'px';
        tooltip.style.width = tw   + 'px';
    }

    function renderStep(index) {
        const step = TOUR_STEPS[index];
        const rect = getTargetRect(step.selector);

        titleEl.textContent = step.title;
        bodyEl.innerHTML    = step.description;
        counterEl.textContent = (index + 1) + ' / ' + TOUR_STEPS.length;

        prevBtn.disabled = index === 0;
        nextBtn.textContent = index === TOUR_STEPS.length - 1 ? 'Terminer' : 'Suivant ›';

        if (rect) {
            spotlight.hidden = false;
            positionSpotlight(rect);
            positionTooltip(rect);
        } else {
            spotlight.hidden = true;
            tooltip.style.left = '50%';
            tooltip.style.top  = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
        }
    }

    function showOverlay() {
        overlay.hidden = false;
        renderStep(currentStep);
    }

    function closeTour() {
        overlay.hidden = true;
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    }

    nextBtn.addEventListener('click', function onNext() {
        if (currentStep < TOUR_STEPS.length - 1) {
            currentStep++;
            renderStep(currentStep);
        } else {
            closeTour();
        }
    });

    prevBtn.addEventListener('click', function onPrev() {
        if (currentStep > 0) {
            currentStep--;
            renderStep(currentStep);
        }
    });

    skipBtn.addEventListener('click', closeTour);

    showOverlay();
}
