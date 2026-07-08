#!/usr/bin/env node
/**
 * Lance CapsuleOS en dev (statique) ou prod (PHP + router).
 * Usage : node usr/lib/capsuleos/tools/serve-capsuleos.mjs <dev|prod> [--port 2929] [--host 127.0.0.1]
 */
import { spawn } from 'child_process';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { startDevServer } from './dev-static-server.mjs';
import { resolvePortalSqlitePath } from './portal-sqlite-path.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const PROFILE_ALIASES = new Set([
    'gratuit', 'free',
    'sub', 'abonne',
    'prof', 'professeur',
    'creator', 'createur',
]);

/** SQLite portail — chemin unique (voir portal-sqlite-path.mjs). */
const localPortalSqlitePath = (root) => resolvePortalSqlitePath(root);

const ensureDevPortalDatabase = (root, sqlitePath) => {
    const env = {
        ...process.env,
        CAPSULE_PORTAL_MODE: 'dev',
        CAPSULE_PORTAL_SQLITE: sqlitePath,
    };
    const statusRun = spawnSync(
        'php',
        ['usr/lib/capsuleos/tools/portal-db-status.php'],
        { cwd: root, env, encoding: 'utf8' },
    );
    if (statusRun.status !== 0) {
        process.stderr.write('    db      → statut indisponible (lancer make init)\n');
        return;
    }
    let status;
    try {
        status = JSON.parse(statusRun.stdout || '{}');
    } catch {
        return;
    }
    if (!status.ok) {
        return;
    }
    process.stderr.write(`    db      → ${status.users} comptes · ${status.tickets} tickets · ${status.sqlitePath}\n`);
    if (Number(status.users) !== Number(status.expectedDevUsers)) {
        process.stderr.write(`\n    ⚠ Base incohérente (${status.users}/${status.expectedDevUsers} comptes) — réinitialisation dev…\n\n`);
        const reset = spawnSync(
            'php',
            ['usr/lib/capsuleos/tools/portal-db-migrate.php', '--reset-users', '--sync-modules'],
            { cwd: root, env, stdio: 'inherit' },
        );
        if (reset.status !== 0) {
            process.stderr.write('    Échec reset — arrêtez le serveur puis : make init\n');
        }
    }
};

const PROFILE_LABELS = {
    gratuit: 'Gratuit',
    abonne: 'Abonné',
    professeur: 'Professeur',
    createur: 'Créateur',
};

const normalizeProdProfile = (raw) => {
    if (!raw) {
        return null;
    }
    const map = {
        free: 'gratuit',
        gratuit: 'gratuit',
        sub: 'abonne',
        abonne: 'abonne',
        prof: 'professeur',
        professeur: 'professeur',
        creator: 'createur',
        createur: 'createur',
    };
    return map[String(raw).toLowerCase()] || null;
};

const readDevCredentials = (profile) => {
    const defaults = {
        email: 'abonne@capsuleos.local',
        displayName: 'Abonné',
        password: 'test123456789',
    };
    const securityPath = path.join(ROOT, 'etc/capsuleos/contracts/portal-security.json');
    if (!fs.existsSync(securityPath)) {
        return defaults;
    }
    const dev = JSON.parse(fs.readFileSync(securityPath, 'utf8')).dev || {};
    const password = String(dev.defaultPassword || defaults.password);
    const profileKey = normalizeProdProfile(profile) || (profile ? null : 'abonne');
    const profiles = dev.profiles && typeof dev.profiles === 'object' ? dev.profiles : {};
    const entry = profileKey && profiles[profileKey] ? profiles[profileKey] : {};
    const legacyUser = String(dev.defaultUser || '');
    let email = String(entry.email || dev.defaultEmail || '');
    if (!email && legacyUser.includes('@')) {
        email = legacyUser;
    }
    if (!email) {
        email = defaults.email;
    }
    let displayName = String(entry.displayName || dev.defaultDisplayName || '');
    if (!displayName && legacyUser && !legacyUser.includes('@')) {
        displayName = legacyUser;
    }
    if (!displayName) {
        displayName = defaults.displayName;
    }
    return {
        email,
        displayName,
        password,
        profileKey,
        profileLabel: profileKey ? (PROFILE_LABELS[profileKey] || profileKey) : null,
    };
};

const parseArgs = () => {
    const args = process.argv.slice(2);
    const opts = { mode: 'dev', port: 2929, host: '127.0.0.1', profile: null };
    if (args[0] === 'dev' || args[0] === 'prod') {
        opts.mode = args.shift();
    }
    for (let i = 0; i < args.length; i += 1) {
        if ((args[i] === '--port' || args[i] === '-p') && args[i + 1]) {
            opts.port = Number(args[++i]);
        } else if ((args[i] === '--host' || args[i] === '-H') && args[i + 1]) {
            opts.host = args[++i];
        } else if (args[i] === '--profile' && args[i + 1]) {
            opts.profile = String(args[++i]).toLowerCase();
        } else if (args[i] === '-h' || args[i] === '--help') {
            process.stdout.write(
                'Usage: node usr/lib/capsuleos/tools/serve-capsuleos.mjs <dev|prod> [--port N] [--host IP] [--profile gratuit|sub|prof|creator]\n',
            );
            process.exit(0);
        }
    }
    return opts;
};

const main = async () => {
    const opts = parseArgs();
    if (opts.mode === 'prod' && opts.profile && !PROFILE_ALIASES.has(opts.profile)) {
        console.error(`Profil invalide : ${opts.profile} — utiliser gratuit, sub, prof ou creator`);
        process.exit(1);
    }
    const build = spawnSync(
        process.execPath,
        ['usr/lib/capsuleos/tools/build-portal-site-home.mjs', opts.mode],
        { cwd: ROOT, stdio: 'inherit', env: { ...process.env, CAPSULE_PORTAL_MODE: opts.mode } },
    );
    if (build.status !== 0) {
        process.exit(build.status ?? 1);
    }

    const addr = `${opts.host}:${opts.port}`;
    process.stderr.write(`\n=== CapsuleOS [${opts.mode}] http://${addr}/ ===\n`);
    process.stderr.write(`    racine : ${ROOT}\n`);
    if (opts.mode === 'prod') {
        process.stderr.write('    accueil → index.php (portail PHP)\n');
        process.stderr.write('    routes /portal/*.php actives\n');
        if (opts.profile) {
            const devCreds = readDevCredentials(opts.profile);
            process.stderr.write(`    profil simulé : ${devCreds.profileLabel || opts.profile}\n`);
            process.stderr.write(`    connexion test : ${devCreds.email} / ${devCreds.password}\n`);
        }
    } else {
        process.stderr.write('    accueil → index.html (statique)\n');
        process.stderr.write('    backend → PHP sidecar (/portal/api, compte, admin)\n');
        process.stderr.write('    account.html → portal/account.php (même base SQLite)\n');
        const sqlitePath = localPortalSqlitePath(ROOT);
        ensureDevPortalDatabase(ROOT, sqlitePath);
    }
    process.stderr.write('    Ctrl+C pour arrêter\n\n');

    if (opts.mode === 'prod') {
        const phpVersionCheck = spawnSync('php', ['-r', 'exit(PHP_VERSION_ID < 80200 ? 1 : 0);'], {
            encoding: 'utf8',
        });
        if (phpVersionCheck.status !== 0) {
            console.error('PHP 8.2+ requis pour make prod (php -v pour diagnostiquer).');
            process.exit(1);
        }
        const phpEnv = { ...process.env, CAPSULE_PORTAL_MODE: 'prod' };
        phpEnv.CAPSULE_PORTAL_SQLITE = localPortalSqlitePath(ROOT);
        if (opts.profile) {
            phpEnv.CAPSULE_PORTAL_PROD_PROFILE = opts.profile;
        }
        process.stderr.write(`    sqlite  → ${phpEnv.CAPSULE_PORTAL_SQLITE}\n`);
        const prodStatus = spawnSync(
            'php',
            ['usr/lib/capsuleos/tools/portal-db-status.php'],
            { cwd: ROOT, env: phpEnv, encoding: 'utf8' },
        );
        if (prodStatus.status === 0) {
            try {
                const st = JSON.parse(prodStatus.stdout || '{}');
                if (st.ok) {
                    process.stderr.write(`    db      → ${st.users} comptes · ${st.tickets} tickets\n`);
                }
            } catch {
                // ignore
            }
        }
        const child = spawn('php', ['-S', addr, '-t', '.', 'router.php'], {
            cwd: ROOT,
            stdio: 'inherit',
            env: phpEnv,
        });
        child.on('exit', (code) => process.exit(code ?? 0));
        return;
    }

    await startDevServer({ host: opts.host, port: opts.port });
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
