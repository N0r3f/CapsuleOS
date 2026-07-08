<?php

declare(strict_types=1);

/**
 * Routeur PHP built-in server (make prod).
 * Usage : php -S 127.0.0.1:2929 -t . router.php
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
$root = __DIR__;
$file = $root . $uri;

$portalMode = getenv('CAPSULE_PORTAL_MODE');
if ($portalMode === false || $portalMode === '') {
    $portalMode = 'prod';
}
if ($portalMode !== 'dev') {
    require_once $root . '/srv/capsuleos/portal/src/Catalog/OsFacadeLaunchGuard.php';
    if (\CapsuleOS\Portal\Catalog\OsFacadeLaunchGuard::blocksUri($uri, $root)) {
        http_response_code(403);
        header('Content-Type: text/html; charset=utf-8');
        echo '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>OS à venir</title></head><body>';
        echo '<h1>Système à venir</h1><p>Ce bureau simulé n\'est pas encore disponible.</p>';
        echo '<p><a href="/portal/index.php">Retour au portail</a></p></body></html>';
        return true;
    }
}

if ($uri === '/dashboard' || $uri === '/dashboard/') {
    header('Location: /admin', true, 302);
    return true;
}

$adminAliases = [
    '/admin' => '/portal/admin.php',
    '/admin/login' => '/portal/admin-login.php',
    '/admin/logout' => '/portal/admin-logout.php',
];
if (isset($adminAliases[$uri])) {
    require $root . $adminAliases[$uri];
    return true;
}
if ($uri === '/admin/') {
    require $root . '/portal/admin.php';
    return true;
}

if ($uri === '/' || $uri === '/index.html') {
    require $root . '/index.php';
    return true;
}

if (is_file($file)) {
    return false;
}

if (str_ends_with($uri, '.php')) {
    $script = $root . $uri;
    if (is_file($script)) {
        require $script;
        return true;
    }
}

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo "404 — {$uri}\n";
return true;
