// Couleurs initiales et finales
const colorStart = { r: 17, g: 17, b: 45 }; // var(--bleu)
const colorEnd = { r: 10, g: 10, b: 48 }; // var(--violet)

// Calculer la différence de couleur
const colorDiff = {
    r: colorEnd.r - colorStart.r,
    g: colorEnd.g - colorStart.g,
    b: colorEnd.b - colorStart.b
};

// Durée de l'animation en millisecondes
const duration = 1200; // 120 secondes

// Temps de début
let startTime = null;

function animateColor(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    // Calculer le facteur d'interpolation
    const factor = Math.min(elapsed / duration, 1);

    // Calculer la couleur actuelle
    const currentColor = {
        r: Math.round(colorStart.r + colorDiff.r * factor),
        g: Math.round(colorStart.g + colorDiff.g * factor),
        b: Math.round(colorStart.b + colorDiff.b * factor)
    };

    // Mettre à jour le style de l'élément
    document.body.style.backgroundColor = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;

    // Continuer l'animation si nécessaire
    if (elapsed < duration) {
        requestAnimationFrame(animateColor);
    }
}

// Lancer l'animation
requestAnimationFrame(animateColor);
