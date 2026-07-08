<?php

declare(strict_types=1);

require __DIR__ . '/../srv/capsuleos/portal/bootstrap.php';

use CapsuleOS\Portal\Auth\AuthService;
use CapsuleOS\Portal\Classroom\ClassroomRepository;
use CapsuleOS\Portal\Http\Csrf;
use CapsuleOS\Portal\PortalContext;

$token = trim((string) ($_GET['token'] ?? $_POST['token'] ?? ''));
if ($token === '') {
    $token = portal_join_token_from_session();
}
$error = '';
$classroom = null;
$invitePreview = null;
$guest = AuthService::currentUserId() === null;

if ($token !== '') {
    $classroom = ClassroomRepository::findByInviteToken($token);
    if ($classroom !== null) {
        $invitePreview = portal_classroom_invite_preview($classroom);
    }
    if ($guest) {
        $_SESSION['portal_join_token'] = $token;
    }
}

$userId = AuthService::currentUserId() !== null ? (int) AuthService::currentUserId() : 0;
$ctx = PortalContext::fromRequest('Rejoindre une classe · CapsuleOS');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$guest) {
    if (!Csrf::validate($_POST[Csrf::fieldName()] ?? null)) {
        $error = 'Session expirée. Réessayez.';
    } elseif ($token === '') {
        $error = 'Lien d\'invitation invalide.';
    } else {
        $classroom = ClassroomRepository::findByInviteToken($token);
        if ($classroom === null) {
            $error = 'Invitation invalide.';
        } elseif (strtotime((string) ($classroom['invite_expires_at'] ?? '')) < time()) {
            $error = 'Invitation expirée.';
        } elseif ((int) ($classroom['teacher_id'] ?? 0) === $userId) {
            $error = 'Vous ne pouvez pas rejoindre votre propre classe.';
        } elseif (!ClassroomRepository::addMember((int) ($classroom['id'] ?? 0), $userId)) {
            $error = 'Impossible de rejoindre la classe.';
        } else {
            portal_clear_join_token();
            portal_redirect('./account.php#progression');
        }
    }
}

portal_render('layout-auth.php', $ctx, [
    'heading' => 'Rejoindre une classe',
    'authPartial' => 'auth-join-class.php',
    'bodyClass' => 'portal-join-class-page',
    'token' => $token,
    'error' => $error,
    'invitePreview' => $invitePreview,
    'errorInPartial' => true,
    'guest' => $guest,
]);
