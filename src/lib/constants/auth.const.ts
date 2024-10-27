export const ROLES = {
  SUPER_MANAGER: "Super Manager",
  OPERATIONAL_MANAGER: "Operational Manager",
  LOCATION_MANAGER: "Location Manager",
};

export const PERMISSIONS = {
  [ROLES.SUPER_MANAGER]: ["create", "read", "update", "delete"],
  [ROLES.OPERATIONAL_MANAGER]: ["read", "update"],
  [ROLES.LOCATION_MANAGER]: ["read"],
};
