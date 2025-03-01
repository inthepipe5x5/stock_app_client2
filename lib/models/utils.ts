import { baseModelResource } from "@/lib/models/types";
import isTruthy from "@/utils/isTruthy";
/**
 * ---------------------------
 * @function getResourceRoute
 * ---------------------------
 * Returns an object representing the route pathname & query params for a given resource.
 * @template R
 * @param {R} baseModelResource - The resource being edited.
 * @returns {Object} An object containing the pathname and query parameters for the resource route.
 */
export const getResourceRoute = <R extends baseModelResource>(
  resource: R
): { pathname: string; params: Record<string, any> } => {
  const { action, type, resource_id, relations } = resource || {};
  const { children: childResources } = relations ?? {};
  // Construct the pathname and query parameters for the resource route
  // Example: /(tabs)/(dashboard)/(stacks)/userProfile.12345.children/read
  const pathname = `/(tabs)/(dashboard)/(stacks)/${type}.${resource_id}.${
    isTruthy(childResources) ? `children/${action ?? "read"}` : ""
  }`;
  const params = {
    type,
    id: resource_id,
    action,
    children: childResources
      ? Object.values(childResources)
          .flat()
          .filter(isTruthy)
          .map((child) => child?.resource_id)
          .join(",")
      : undefined,
  };
  return { pathname, params };
};
