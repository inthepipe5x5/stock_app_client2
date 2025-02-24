import {userProfile, session, household, inventory, task, product} from "@/constants/defaultSession";
export type baseModelResource = {
    type: "userProfile" | "household" | "inventory" | "task" | "product";
    action: "create" | "read" | "update" | "delete";
    resource_id: string;
    data: userProfile | session | household | inventory | task | product | null | undefined;
    relations: relatedResource
};
export type resourceRelationship = Partial<Record<baseModelResource["type"], baseModelResource[] | null>>;

export type relatedResource = {
    [key in "parent" | "children" | "related"]: resourceRelationship; 
}



