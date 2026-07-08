#!/usr/bin/env node
/**
 * Chemin SQLite portail — une seule base pour admin, comptes et API.
 *
 * CAPSULE_PORTAL_SQLITE          : chemin explicite
 * CAPSULE_PORTAL_SQLITE_USE_TMP=1  : forcer /tmp
 * CAPSULE_PORTAL_SQLITE_CANONICAL=1 : forcer var/lib (disque local uniquement)
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const NFS_SUPER_MAGIC = 0x6969;
const SMB_SUPER_MAGIC = 0x517b;
const CIFS_SUPER_MAGIC = 0xff534d42;

export const tmpPortalSqlitePath = (root) => {
    const hash = crypto.createHash('sha256').update(root).digest('hex').slice(0, 12);
    const dir = path.join(os.tmpdir(), `capsuleos-portal-${hash}`);
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, 'users.sqlite');
};

export const canonicalPortalSqlitePath = (root) => path.join(root, 'var/lib/capsuleos/portal/users.sqlite');

export const sqlitePathPointerFile = (root) => path.join(root, 'var/lib/capsuleos/portal/active-sqlite.path');

export const writeSqlitePathPointer = (root, sqlitePath) => {
    const pointer = sqlitePathPointerFile(root);
    fs.mkdirSync(path.dirname(pointer), { recursive: true });
    fs.writeFileSync(pointer, `${sqlitePath}\n`, 'utf8');
};

const isRemoteFilesystem = (targetPath) => {
    if (process.platform !== 'linux' || typeof fs.statfsSync !== 'function') {
        return false;
    }
    try {
        const { type } = fs.statfsSync(targetPath);
        return type === NFS_SUPER_MAGIC || type === SMB_SUPER_MAGIC || type === CIFS_SUPER_MAGIC;
    } catch {
        return false;
    }
};

const shouldUseTmp = (root) => {
    if (process.env.CAPSULE_PORTAL_SQLITE_USE_TMP === '1') {
        return true;
    }
    if (process.env.CAPSULE_PORTAL_SQLITE_CANONICAL === '1') {
        return false;
    }
    const normalized = path.resolve(root);
    if (normalized.includes('/mnt/team') || normalized.includes('#TEAM')) {
        return true;
    }
    return isRemoteFilesystem(normalized);
};

export const resolvePortalSqlitePath = (root) => {
    const pointer = sqlitePathPointerFile(root);
    if (fs.existsSync(pointer)) {
        const fromFile = fs.readFileSync(pointer, 'utf8').trim();
        if (fromFile) {
            return fromFile;
        }
    }
    let resolved;
    if (shouldUseTmp(root)) {
        resolved = tmpPortalSqlitePath(root);
    } else {
        const canonical = canonicalPortalSqlitePath(root);
        try {
            fs.mkdirSync(path.dirname(canonical), { recursive: true });
            fs.accessSync(path.dirname(canonical), fs.constants.W_OK);
            resolved = canonical;
        } catch {
            resolved = tmpPortalSqlitePath(root);
        }
    }
    writeSqlitePathPointer(root, resolved);
    const canonical = canonicalPortalSqlitePath(root);
    if (resolved !== canonical && fs.existsSync(canonical)) {
        try {
            const st = fs.statSync(canonical);
            if (st.isFile() && st.size === 0) {
                fs.unlinkSync(canonical);
            }
        } catch {
            // ignore
        }
    }
    return resolved;
};
