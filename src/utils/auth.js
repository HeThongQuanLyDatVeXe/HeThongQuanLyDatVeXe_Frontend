const ADMIN_CANDIDATES = new Set(["ADMIN", "ROLE_ADMIN"]);

function normalizeRole(role) {
  if (!role || typeof role !== "string") return null;
  const trimmed = role.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("ROLE_")
    ? trimmed.toUpperCase()
    : `ROLE_${trimmed.toUpperCase()}`;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeMaybeMojibake(value) {
  if (typeof value !== "string" || !value) return value;
  if (!/[ÃÂÄÐÑ�]/.test(value)) return value;

  try {
    // Fix common mojibake where UTF-8 bytes are interpreted as Latin-1.
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
}

function toRoleList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return item.role || item.authority || item.name || null;
        }
        return null;
      })
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\s,]+/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

export function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function extractRolesFromToken(token, clientId) {
  const payload = decodeJwtPayload(token);
  if (!payload) return [];

  const realmRoles = toArray(payload?.realm_access?.roles);
  const clientRoles = toArray(payload?.resource_access?.[clientId]?.roles);
  const explicitRoles = toRoleList(payload?.roles);
  const authorityRoles = toRoleList(payload?.authorities);
  const authorityRole = toRoleList(payload?.authority);
  const singleRole = toRoleList(payload?.role);

  const merged = [
    ...realmRoles,
    ...clientRoles,
    ...explicitRoles,
    ...authorityRoles,
    ...authorityRole,
    ...singleRole,
  ]
    .map(normalizeRole)
    .filter(Boolean);

  return [...new Set(merged)];
}

export function isAdminByRoles(roles = []) {
  return roles.some((r) => {
    if (typeof r !== "string") return false;
    const upper = r.toUpperCase();
    return (
      ADMIN_CANDIDATES.has(upper) ||
      ADMIN_CANDIDATES.has(upper.replace(/^ROLE_/, ""))
    );
  });
}

export function isAdminByToken(token, clientId) {
  return isAdminByRoles(extractRolesFromToken(token, clientId));
}

export function resolvePostLoginPath(token, clientId) {
  return isAdminByToken(token, clientId) ? "/admin" : "/";
}
