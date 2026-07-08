/**
 * Animation de fond portail CapsuleOS (homepage).
 * Couleurs alignées sur --bleu / --violet (themes/global).
 */
'use strict';
const colorStart = { r: 17, g: 17, b: 45 };
const colorEnd = { r: 10, g: 10, b: 48 };

const colorDiff = {
    r: colorEnd.r - colorStart.r,
    g: colorEnd.g - colorStart.g,
    b: colorEnd.b - colorStart.b
};

const duration = 1200;
let startTime = null;

function animateColor(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const factor = Math.min(elapsed / duration, 1);

    const currentColor = {
        r: Math.round(colorStart.r + colorDiff.r * factor),
        g: Math.round(colorStart.g + colorDiff.g * factor),
        b: Math.round(colorStart.b + colorDiff.b * factor)
    };

    document.body.style.backgroundColor = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;

    if (elapsed < duration) {
        requestAnimationFrame(animateColor);
    }
}

requestAnimationFrame(animateColor);
