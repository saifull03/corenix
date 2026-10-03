import { User } from './types';

export function isSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  const slug = (user.role_slug || '').toLowerCase().replace(/_/g, '-');
  const name = (user.role_name || '').toLowerCase();
  return (
    slug === 'super-admin' ||
    slug === 'superadmin' ||
    name.includes('super admin') ||
    user.role_id === 1
  );
}

/**
 * Full Management Authorization for Purchases & Procurement / Other House / Suppliers:
 * Allowed: Accounts Manager, Admin, HR Manager, Super Admin, Purchase Manager
 */
export function canManagePurchases(user: User | null | undefined): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  const slug = (user.role_slug || '').toLowerCase().replace(/_/g, '-');
  const name = (user.role_name || '').toLowerCase();
  return (
    slug === 'admin' ||
    slug === 'accounts-manager' ||
    slug === 'account-manager' ||
    slug === 'hr' ||
    slug === 'hr-manager' ||
    slug === 'purchase-manager' ||
    name.includes('account') ||
    name.includes('admin') ||
    name.includes('hr') ||
    name.includes('purchase manager')
  );
}

/**
 * Purchase Access Authorization:
 * Allowed to purchase/procure products: Accounts Manager, Admin, HR, Super Admin, Purchase Manager, and Store/Shop Managers.
 */
export function canPurchaseProducts(user: User | null | undefined): boolean {
  if (!user) return false;
  if (canManagePurchases(user)) return true;
  const slug = (user.role_slug || '').toLowerCase().replace(/_/g, '-');
  const name = (user.role_name || '').toLowerCase();
  return (
    slug === 'shop-manager' ||
    slug === 'store-manager' ||
    name.includes('shop manager') ||
    name.includes('store manager')
  );
}

/**
 * Returns true if the user is strictly a Store/Shop Manager (can only purchase products, cannot manage company ledgers/settlements)
 */
export function isStoreManagerOnly(user: User | null | undefined): boolean {
  if (!user) return false;
  return canPurchaseProducts(user) && !canManagePurchases(user);
}

export function hasPermission(userRole: string, allowedRoles: string[]): boolean {
  if (userRole === 'super-admin') return true;
  return allowedRoles.includes(userRole);
}
