import { actionType, ResourceType } from "@/components/navigation/ResourceActionSheet";

/** Page for performing an action on a resource 
 * @param id - @string - id of the resource
 * @param type - @string - type of the resource of @type ResourceType
 * @param action - @string - action to be performed on the resource of @type actionType
 * @param relation - @string - relation of the resource, ie. 'parent', 'child', 'sibling'
 * @returns - @JSX.Element - returns the resource detail page
*/
