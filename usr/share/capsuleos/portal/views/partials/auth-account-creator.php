<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
?>
<section class="portal-account-panel portal-account-creator" aria-labelledby="portal-account-creator-title" data-portal-creator-panel>
    <h2 class="portal-account-panel-title" id="portal-account-creator-title">Mes modules</h2>
    <p class="portal-account-panel-lead">Suivez vos modules pédagogiques publiés dans le store et l'état de vos demandes en cours. Pour proposer un nouveau module, ouvrez une demande depuis le <button type="button" class="portal-account-btn portal-account-btn--link portal-account-btn--compact" data-ticket-prefill="demande_module" data-ticket-subject="Demande d'ajout de module">support</button>.</p>

    <div class="portal-account-creator-published" data-creator-published-root>
        <h3 class="portal-account-subtitle">Modules publiés</h3>
        <div data-creator-published-list>
            <p class="portal-account-empty">Chargement…</p>
        </div>
    </div>

    <div class="portal-account-creator-pending" data-creator-pending-root>
        <h3 class="portal-account-subtitle">Demandes en cours</h3>
        <div data-creator-pending-list>
            <p class="portal-account-empty">Chargement…</p>
        </div>
    </div>
</section>
