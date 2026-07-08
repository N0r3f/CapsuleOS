<?php
/** Panneau accessibilité portail (WCAG opt-in), partagé avec index.html statique (miroir manuel). */
?>
<section id="a11y-panel" class="a11y-panel" hidden aria-labelledby="a11y-panel-title">
    <h2 id="a11y-panel-title" class="a11y-panel__title">
        <i class="fa-solid fa-universal-access a11y-panel__title-icon" aria-hidden="true"></i>
        <span>Accessibilité</span>
    </h2>
    <p class="a11y-panel__lead">Ces réglages s'appliquent à tout le site et sont mémorisés dans votre navigateur.</p>
    <h3 class="a11y-panel__subtitle">Réglages d'accessibilité</h3>
    <div class="a11y-panel__options" role="group" aria-label="Réglages d'accessibilité">
        <div class="a11y-panel__option">
            <div class="a11y-panel__option-body">
                <span class="a11y-panel__label">Contraste élevé</span>
                <span class="a11y-panel__hint">Améliore la lisibilité des textes et des bordures.</span>
            </div>
            <label class="a11y-panel__switch">
                <input type="checkbox" id="a11y-contrast" class="a11y-panel__switch-input">
                <span class="a11y-panel__switch-track" aria-hidden="true"><span class="a11y-panel__switch-thumb"></span></span>
                <span class="sr-only">Contraste élevé</span>
            </label>
        </div>
        <div class="a11y-panel__option a11y-panel__option--stacked">
            <div class="a11y-panel__option-body">
                <span class="a11y-panel__label">Taille du texte</span>
                <span class="a11y-panel__hint">Agrandit l'interface jusqu'à 125 %.</span>
            </div>
            <div class="a11y-panel__segmented" role="group" aria-label="Taille du texte">
                <button type="button" class="a11y-panel__scale-btn is-active" data-a11y-font-scale="100" aria-pressed="true">100 %</button>
                <button type="button" class="a11y-panel__scale-btn" data-a11y-font-scale="110" aria-pressed="false">110 %</button>
                <button type="button" class="a11y-panel__scale-btn" data-a11y-font-scale="125" aria-pressed="false">125 %</button>
            </div>
        </div>
        <div class="a11y-panel__option">
            <div class="a11y-panel__option-body">
                <span class="a11y-panel__label">Réduire les animations</span>
                <span class="a11y-panel__hint">Limite les transitions et le défilement animé.</span>
            </div>
            <label class="a11y-panel__switch">
                <input type="checkbox" id="a11y-reduced-motion" class="a11y-panel__switch-input">
                <span class="a11y-panel__switch-track" aria-hidden="true"><span class="a11y-panel__switch-thumb"></span></span>
                <span class="sr-only">Réduire les animations</span>
            </label>
        </div>
        <div class="a11y-panel__option">
            <div class="a11y-panel__option-body">
                <span class="a11y-panel__label">Souligner les liens</span>
                <span class="a11y-panel__hint">Rend les liens identifiables sans la couleur seule.</span>
            </div>
            <label class="a11y-panel__switch">
                <input type="checkbox" id="a11y-underline-links" class="a11y-panel__switch-input">
                <span class="a11y-panel__switch-track" aria-hidden="true"><span class="a11y-panel__switch-thumb"></span></span>
                <span class="sr-only">Souligner les liens</span>
            </label>
        </div>
    </div>
    <p class="a11y-panel__foot">Les bureaux simulés (Linux, Windows, etc.) respectent aussi le contraste et la taille du texte lorsque vous les ouvrez.</p>
</section>
