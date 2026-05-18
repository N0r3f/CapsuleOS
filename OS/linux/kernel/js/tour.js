const TOUR_STORAGE_KEY = 'mint-tour-done';

(function initTour() {
    if (localStorage.getItem(TOUR_STORAGE_KEY) === 'true') {
        return;
    }
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
    const tooltip = overlay.querySelector('#tourTooltip');
    const titleEl = overlay.querySelector('#tourTitle');
    const bodyEl = overlay.querySelector('#tourBody');
    const prevBtn = overlay.querySelector('#tourPrev');
    const nextBtn = overlay.querySelector('#tourNext');
    const skipBtn = overlay.querySelector('#tourSkip');
    const counterEl = overlay.querySelector('#tourCounter');

    const PAD = 10;
    const MARGIN = 8;
    const TOOLTIP_MAX_W = 280;
    const MIN_TARGET_SUM = 8;

    function getTargetRect(selector) {
        const el = document.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top, left: r.left, width: r.width, height: r.height, el };
    }

    function isUsableTargetRect(rect) {
        if (!rect) {
            return false;
        }
        return rect.width + rect.height >= MIN_TARGET_SUM;
    }

    function positionSpotlight(rect) {
        spotlight.style.top = `${rect.top - PAD}px`;
        spotlight.style.left = `${rect.left - PAD}px`;
        spotlight.style.width = `${rect.width + PAD * 2}px`;
        spotlight.style.height = `${rect.height + PAD * 2}px`;
    }

    function tooltipWidthForViewport() {
        const vw = window.innerWidth;
        const available = Math.max(1, vw - 2 * MARGIN);
        return Math.min(TOOLTIP_MAX_W, available);
    }

    function setTooltipCentered() {
        tooltip.style.transform = 'translate(-50%, -50%)';
        tooltip.style.left = '50%';
        tooltip.style.top = '50%';
        tooltip.style.width = `${tooltipWidthForViewport()}px`;
    }

    function positionAnchoredTooltip(rect) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        tooltip.style.transform = 'none';

        const tw = tooltipWidthForViewport();
        tooltip.style.width = `${tw}px`;
        void tooltip.offsetWidth;

        const tipH = tooltip.getBoundingClientRect().height || tooltip.offsetHeight || 120;

        let left = rect.left + rect.width / 2 - tw / 2;
        let top = rect.top - tipH - PAD * 2;

        if (top < MARGIN) {
            top = rect.top + rect.height + PAD * 2;
        }

        left = Math.max(MARGIN, Math.min(left, vw - tw - MARGIN));
        top = Math.max(MARGIN, Math.min(top, vh - tipH - MARGIN));

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    function layoutStepWithTarget(rect) {
        spotlight.hidden = false;
        positionSpotlight(rect);

        requestAnimationFrame(function () {
            positionSpotlight(rect);
            positionAnchoredTooltip(rect);
            requestAnimationFrame(function () {
                positionAnchoredTooltip(rect);
            });
        });
    }

    function renderStep(index) {
        const step = TOUR_STEPS[index];
        const rect = getTargetRect(step.selector);

        titleEl.textContent = step.title;
        bodyEl.innerHTML = step.description;
        counterEl.textContent = `${index + 1} / ${TOUR_STEPS.length}`;

        prevBtn.disabled = index === 0;
        nextBtn.textContent = index === TOUR_STEPS.length - 1 ? 'Terminer' : 'Suivant ›';

        if (!isUsableTargetRect(rect)) {
            spotlight.hidden = true;
            setTooltipCentered();
            return;
        }

        layoutStepWithTarget(rect);
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
            currentStep += 1;
            renderStep(currentStep);
        } else {
            closeTour();
        }
    });

    prevBtn.addEventListener('click', function onPrev() {
        if (currentStep > 0) {
            currentStep -= 1;
            renderStep(currentStep);
        }
    });

    skipBtn.addEventListener('click', closeTour);

    showOverlay();
}
