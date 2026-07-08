<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$brandImg = static fn (string $file): string => portal_asset('usr/share/capsuleos/assets/images/platforms/brands/' . $file);
?>
        <section class="pick" id="choisir-os" aria-labelledby="pick-title">
            <div class="pick-inner">
                <h2 class="pick-title" id="pick-title">Choisir un système</h2>
                <p class="pick-lead">Sélectionnez une famille d'OS pour afficher les distributions disponibles.</p>
                <div class="pick-grid">
                    <button type="button" class="pick-card" data-os="linux" aria-pressed="false">
                        <img src="<?= $brandImg('linux.webp') ?>" alt="">
                        <span>Linux</span>
                    </button>
                    <button type="button" class="pick-card" data-os="windows" aria-pressed="false">
                        <img src="<?= $brandImg('windows.webp') ?>" alt="">
                        <span>Windows</span>
                    </button>
                    <button type="button" class="pick-card" data-os="macos" aria-pressed="false">
                        <img src="<?= $brandImg('macos.webp') ?>" alt="">
                        <span>macOS</span>
                    </button>
                    <button type="button" class="pick-card" data-os="bsd" aria-pressed="false">
                        <img src="<?= $brandImg('bsd.webp') ?>" alt="">
                        <span>BSD</span>
                    </button>
                    <button type="button" class="pick-card" data-os="ios" aria-pressed="false">
                        <img src="<?= $brandImg('ios.webp') ?>" alt="">
                        <span>iOS</span>
                    </button>
                    <button type="button" class="pick-card" data-os="android" aria-pressed="false">
                        <img src="<?= $brandImg('android.webp') ?>" alt="">
                        <span>Android</span>
                    </button>
                </div>
            </div>

            <dialog class="pick-modal" id="pick-modal" aria-labelledby="pick-modal-title">
                <div class="pick-modal-panel">
                    <div class="pick-modal-head">
                        <h3 class="pick-modal-title" id="pick-modal-title">Système</h3>
                        <button type="button" class="pick-modal-close" id="pick-modal-close" aria-label="Fermer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                                <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    <ul class="pick-modal-list" id="pick-modal-list"></ul>
                </div>
            </dialog>
        </section>
