type MaybeProfileLike = {
    role?: string | null;
    username?: string | null;
} | null | undefined;

export function normalizeRole(role?: string | null) {
    return String(role || '').trim().toLowerCase();
}

export function isAdminRole(role?: string | null) {
    return normalizeRole(role) === 'admin';
}

export function isCreatorRole(role?: string | null) {
    const normalized = normalizeRole(role);
    return normalized === 'creator' || normalized === 'admin';
}

export function isSysAdminUsername(username?: string | null) {
    return String(username || '').trim().toLowerCase() === 'sys_admin';
}

export function hasUnlimitedCreditsAccess(profile?: MaybeProfileLike) {
    if (!profile) return false;
    return isAdminRole(profile.role) || isSysAdminUsername(profile.username);
}
