/**
 * Permission Utility for Frontend
 * Checks if the current user has a specific permission.
 * Super admin (role === 'super_admin' or permissions includes '*') has all permissions.
 */

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with permissions array and role
 * @param {string} permission - Permission string like 'pumps.create'
 * @returns {boolean}
 */
export function can(user, permission) {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    const perms = user.permissions || [];
    
    // Wildcard check
    if (perms.includes('*')) return true;
    
    // Direct match
    if (perms.includes(permission)) return true;
    
    // Hierarchical check: 'finance' grants 'finance.view', 'finance.create', etc.
    const parts = permission.split('.');
    for (let i = 1; i < parts.length; i++) {
        const parent = parts.slice(0, i).join('.');
        if (perms.includes(parent)) return true;
    }
    
    return false;
}

/**
 * Check if user has ANY of the given permissions
 * @param {Object} user - User object
 * @param {string[]} permissions - Array of permission strings
 * @returns {boolean}
 */
export function canAny(user, permissions) {
    return permissions.some(p => can(user, p));
}
