<?php
/** @var \CapsuleOS\Portal\PortalContext|null $ctx */
use CapsuleOS\Portal\Catalog\LegalCatalog;

$legalBase = function_exists('portal_entry') ? portal_entry('legal.php') : 'portal/legal.php';
$footerLinks = LegalCatalog::footerLinks();
$controller = LegalCatalog::load()['controller'] ?? [];
$siteName = is_array($controller) ? (string) ($controller['name'] ?? 'La Capsule') : 'La Capsule';
$siteUrl = is_array($controller) ? (string) ($controller['site'] ?? 'https://lacapsule.org') : 'https://lacapsule.org';
?>
    <footer class="footer">
        <p class="footer-copy">© 2026 <a href="<?= htmlspecialchars($siteUrl, ENT_QUOTES, 'UTF-8') ?>" rel="noopener noreferrer"><?= htmlspecialchars($siteName, ENT_QUOTES, 'UTF-8') ?></a>. Tous droits réservés.</p>
        <?php if ($footerLinks !== []) : ?>
            <nav class="footer-legal" aria-label="Informations légales">
                <ul class="footer-legal-list">
                    <?php foreach ($footerLinks as $link) :
                        if (!is_array($link)) {
                            continue;
                        }
                        $id = (string) ($link['id'] ?? '');
                        $label = (string) ($link['label'] ?? '');
                        if ($id === '' || $label === '') {
                            continue;
                        }
                        $href = (string) ($link['href'] ?? '');
                        if ($href !== '') {
                            $url = function_exists('portal_entry') ? portal_entry($href) : 'portal/' . ltrim($href, '/');
                        } else {
                            $url = $legalBase . '#' . $id;
                        }
                        ?>
                    <li><a href="<?= htmlspecialchars($url, ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($label, ENT_QUOTES, 'UTF-8') ?></a></li>
                    <?php endforeach; ?>
                </ul>
            </nav>
        <?php endif; ?>
    </footer>
