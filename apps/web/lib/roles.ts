type MaybeProfileLike = {
    role?: string | null;
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

export function hasUnlimitedCreditsAccess(profile?: MaybeProfileLike) {
    if (!profile) return false;
    return isAdminRole(profile.role);
}
