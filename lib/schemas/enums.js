export const CompletionStatus = Object.freeze({
  DONE: "done",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in progress",
  BLOCKED: "blocked",
  ARCHIVED: "archived",
});

export const DraftStatus = Object.freeze({
  DRAFT: "draft",
  ARCHIVED: "archived",
  DELETED: "deleted",
  CONFIRMED: "confirmed",
  PUBLISHED: "published", //for admin created public templates only
});

export const RoleAccess = Object.freeze({
  GUEST: "guest", // view-only access
  MEMBER: "member", // edit access: can create tasks, complete, edit, and assign tasks
  MANAGER: "manager", // can do all CRUD actions on own household and related resources
  ADMIN: "admin", // on top of member privileges, can create and manage inventories
});

export const TaskPriority = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
});

export const vendorScale = Object.freeze({
  LOCAL: "local",
  REGIONAL: "regional",
  NATIONAL: "national",
  INTERNATIONAL: "international",
});

export const UnitMeasurements = Object.freeze({
  KG: "kg",
  G: "g",
  LB: "lb",
  OZ: "oz",
  L: "l",
  ML: "ml",
  GAL: "gal",
  QT: "qt",
  PT: "pt",
  CUP: "cup",
  TBSP: "tbsp",
  TSP: "tsp",
  PCS: "pcs",
  PACK: "pack",
  BOX: "box",
  BOTTLE: "bottle",
  JAR: "jar",
  CAN: "can",
  BAG: "bag",
  ROLL: "roll",
  SHEET: "sheet",
  SLICE: "slice",
  UNIT: "unit",
  PERCENT: "percent",
});

export const CurrentQuantityStatus = Object.freeze({
  FULL: "full",
  HALF: "half",
  QUARTER: "quarter",
  EMPTY: "empty",
  UNKNOWN: "unknown",
});
