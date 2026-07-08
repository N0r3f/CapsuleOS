<?php
/** @var \CapsuleOS\Portal\PortalContext $ctx */
$user = $ctx->user;
$displayName = is_array($user) ? trim((string) ($user['display_name'] ?? '')) : '';
$email = is_array($user) ? (string) ($user['email'] ?? '') : '';
$displayNameLabel = $displayName !== '' ? $displayName : 'Non renseigné';
$publicId = is_array($user) ? portal_user_public_id($user) : '';
$billing = is_array($ctx->extra['billing'] ?? null) ? $ctx->extra['billing'] : [];
$paymentMethod = trim((string) ($billing['paymentMethod'] ?? ''));
$paymentMethodLabel = $paymentMethod !== '' ? $paymentMethod : 'Aucun moyen enregistré';
?>
<div class="portal-account-settings-modal">
    <section class="portal-account-settings-block" aria-labelledby="portal-settings-identity-title">
        <h3 class="portal-account-settings-block-title" id="portal-settings-identity-title">Identité</h3>
        <?php if ($publicId !== '') : ?>
        <div class="portal-account-settings-field portal-account-settings-field--static">
            <div class="portal-account-settings-read">
                <div class="portal-account-settings-read-main">
                    <span class="portal-label">Identifiant du compte</span>
                    <p class="portal-account-settings-value"><code>#<?= $ctx->e($publicId) ?></code></p>
                </div>
            </div>
        </div>
        <?php endif; ?>
        <div class="portal-account-settings-field" data-settings-field="display-name">
            <div class="portal-account-settings-read" data-settings-read>
                <div class="portal-account-settings-read-main">
                    <span class="portal-label">Nom affiché</span>
                    <p class="portal-account-settings-value" data-settings-display-name><?= $ctx->e($displayNameLabel) ?></p>
                </div>
                <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-settings-edit>Modifier</button>
            </div>
            <div class="portal-account-settings-edit-panel" data-settings-edit-panel hidden>
                <form class="portal-account-settings-edit" data-settings-name>
                    <label class="portal-field">
                        <span class="portal-label">Nom affiché</span>
                        <input class="portal-input" type="text" name="displayName" required maxlength="60" value="<?= $ctx->e($displayName) ?>" autocomplete="name">
                    </label>
                    <div class="portal-account-settings-edit-actions">
                        <button type="submit" class="portal-account-btn portal-account-btn--primary portal-account-btn--compact">Enregistrer</button>
                        <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-settings-cancel>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    </section>

    <section class="portal-account-settings-block" aria-labelledby="portal-settings-login-title">
        <h3 class="portal-account-settings-block-title" id="portal-settings-login-title">Connexion</h3>
        <div class="portal-account-settings-field" data-settings-field="email">
            <div class="portal-account-settings-read" data-settings-read>
                <div class="portal-account-settings-read-main">
                    <span class="portal-label">Adresse e-mail</span>
                    <p class="portal-account-settings-value" data-settings-display-email><?= $ctx->e($email) ?></p>
                </div>
                <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-settings-edit>Modifier</button>
            </div>
            <div class="portal-account-settings-edit-panel" data-settings-edit-panel hidden>
                <form class="portal-account-settings-edit" data-settings-email>
                    <label class="portal-field">
                        <span class="portal-label">Nouvelle adresse e-mail</span>
                        <input class="portal-input" type="email" name="email" required autocomplete="email" value="<?= $ctx->e($email) ?>">
                    </label>
                    <p class="portal-account-settings-hint">Un e-mail de confirmation sera envoyé à la nouvelle adresse pour valider le changement.</p>
                    <div class="portal-account-settings-edit-actions">
                        <button type="submit" class="portal-account-btn portal-account-btn--primary portal-account-btn--compact">Envoyer la confirmation</button>
                        <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-settings-cancel>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
        <div class="portal-account-settings-field" data-settings-field="password">
            <div class="portal-account-settings-read" data-settings-read>
                <div class="portal-account-settings-read-main">
                    <span class="portal-label">Mot de passe</span>
                    <p class="portal-account-settings-value portal-account-settings-value--masked" aria-hidden="true">••••••••••••</p>
                </div>
                <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-settings-edit>Modifier le mot de passe</button>
            </div>
            <div class="portal-account-settings-edit-panel" data-settings-edit-panel hidden>
                <form class="portal-account-settings-edit portal-account-settings-edit--stacked" data-settings-password data-portal-min-password="12">
                    <label class="portal-field">
                        <span class="portal-label">Mot de passe actuel</span>
                        <input class="portal-input" type="password" name="currentPassword" required autocomplete="current-password">
                    </label>
                    <label class="portal-field">
                        <span class="portal-label">Nouveau mot de passe</span>
                        <input class="portal-input" type="password" name="password" required autocomplete="new-password" minlength="12" placeholder="12 caractères minimum">
                    </label>
                    <label class="portal-field">
                        <span class="portal-label">Confirmer le nouveau mot de passe</span>
                        <input class="portal-input" type="password" name="passwordConfirm" required autocomplete="new-password" minlength="12">
                    </label>
                    <div class="portal-account-settings-edit-actions">
                        <button type="submit" class="portal-account-btn portal-account-btn--primary portal-account-btn--compact">Enregistrer</button>
                        <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-settings-cancel>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    </section>

    <?php if ($ctx->isSubscriber()) : ?>
    <section class="portal-account-settings-block" aria-labelledby="portal-settings-billing-title">
        <h3 class="portal-account-settings-block-title" id="portal-settings-billing-title">Facturation</h3>
        <div class="portal-account-settings-field" data-settings-field="payment-method">
            <div class="portal-account-settings-read" data-settings-read>
                <div class="portal-account-settings-read-main">
                    <span class="portal-label">Moyen de paiement</span>
                    <p class="portal-account-settings-value" data-settings-display-payment><?= $ctx->e($paymentMethodLabel) ?></p>
                </div>
                <div class="portal-account-settings-read-actions">
                    <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-settings-edit><?= $paymentMethod !== '' ? 'Modifier' : 'Ajouter' ?></button>
                    <?php if ($paymentMethod !== '') : ?>
                    <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-settings-payment-remove>Supprimer</button>
                    <?php endif; ?>
                </div>
            </div>
            <div class="portal-account-settings-edit-panel" data-settings-edit-panel hidden>
                <form class="portal-account-settings-edit" data-settings-payment>
                    <label class="portal-field">
                        <span class="portal-label">Moyen de paiement</span>
                        <input class="portal-input" type="text" name="paymentMethod" required maxlength="80" value="<?= $ctx->e($paymentMethod) ?>" placeholder="Ex. Carte Visa ···· 4242" autocomplete="off">
                    </label>
                    <p class="portal-account-settings-hint">Libellé affiché sur votre espace (simulation locale, pas de prélèvement réel).</p>
                    <div class="portal-account-settings-edit-actions">
                        <button type="submit" class="portal-account-btn portal-account-btn--primary portal-account-btn--compact">Enregistrer</button>
                        <button type="button" class="portal-account-btn portal-account-btn--ghost portal-account-btn--compact" data-settings-cancel>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <p class="portal-account-settings-note">Réinitialisation par e-mail : fonctionnalité à venir en production.</p>

    <section class="portal-account-settings-block portal-account-settings-block--danger" aria-labelledby="portal-settings-danger-title">
        <h3 class="portal-account-settings-block-title" id="portal-settings-danger-title">Zone sensible</h3>
        <p class="portal-account-settings-block-lead">La suppression est définitive et retire toutes vos données du portail.</p>
        <button type="button" class="portal-account-btn portal-account-btn--danger portal-account-btn--compact" data-account-delete>Supprimer mon compte</button>
    </section>
</div>
