import {userProfile, session, household, inventory, task, product, vendor} from "@/constants/defaultSession";
export type baseModelResource = {
    type: "userProfile" | "household" | "inventory" | "task" | "product" | "vendor";
    action: "create" | "read" | "update" | "delete";
    resource_id: string;
    data: userProfile | session | household | inventory | task | product | vendor | null | undefined;
    relations: relatedResource
};
export type resourceRelationship = Partial<Record<baseModelResource["type"], baseModelResource[] | null>>;

export type relatedResource = {
    [key in "parent" | "children" | "related"]: resourceRelationship; 
}

// const parentChildRelations: any = {
//     "userProfile": {
//         parent: null,
//         children: {
//             household: [],
//             inventory: [],
//             task: []
//         },
//         related: {
//             household: [],
//             inventory: [],
//             task: []
//         }
// }}

export interface parentChildRelations {
    "userProfile": {
        parent: null;
        children: {
            household: household[];
            inventory: inventory[];
            task: task[];
            product: product[];
        };
        related: {
            household: household[];
            inventory: inventory[];
            task: task[];
            product: product[];
            vendor: vendor[];
        };
    };
    "household": {
        parent: userProfile | null;
        children: {
            inventory: inventory[];
            task: task[];
            product: product[];
        };
        related: {
            userProfile: userProfile[];
            inventory: inventory[];
            task: task[];
            product: product[];
        };
    };
    "inventory": {
        parent: household | null;
        children: null;
        related: {
            userProfile: userProfile[];
            household: household[];
            task: task[];
            product: product[];
        };
    };
    "task": {
        parent: household | null;
        children: null;
        related: {
            userProfile: userProfile[];
            household: household[];
            inventory: inventory[];
            product: product[];
        };
    };
    "product": {
        parent: household | null;
        children: null;
        related: {
            userProfile: userProfile[];
            household: household[];
            inventory: inventory[];
            task: task[];
        };
    };
}