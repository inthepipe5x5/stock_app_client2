import supabase from "@/lib/supabase/supabase";
import { convertCamelToSnake, convertSnakeToCamel } from "@/utils/caseConverter";
import { AlertCircle, AlertTriangle, CheckCircle, Info, Circle, LucideIcon } from "lucide-react-native";
import { baseModelResource, relatedResource } from "../models/types";


export interface ColumnInfo {
    data_type: string;
    is_primary_key: boolean;
}

export interface TableInfo {
    columns: Record<string, ColumnInfo>;
    primary_key: string;
}

export interface ParsedSupabaseDBSchemaData {
    [table_name: string]: TableInfo;
}

interface SupabaseDataItem {
    table_name: string;
    column_name: string;
    data_type: string;
    is_primary_key: boolean;
}

export const getPublicSchema = async (): Promise<ParsedSupabaseDBSchemaData> => {
    const { data, error } = await supabase.rpc("get_public_schema_info");
    if (error) throw error;
    return data.reduce((accum: ParsedSupabaseDBSchemaData, item: SupabaseDataItem) => {
        const { table_name, column_name, data_type, is_primary_key } = item;
        if (!accum[table_name]) {
            accum[table_name] = { columns: {}, primary_key: "" };
        }
        accum[table_name].columns[column_name] = { data_type, is_primary_key };
        if (is_primary_key) accum[table_name].primary_key = column_name;
        return accum;
    }, {});
};

export const actionPropMapper = (value: string): "error" | "warning" | "success" | "info" | "muted" => {
    switch (value?.toLowerCase()) {
        case "overdue":
        case "empty":
        case "red":
            return "error";
        case "needs attention":
        case "partial":
        case "yellow":
            return "warning";
        case "completed":
        case "full":
        case "green":
            return "success";
        case "assigned":
        case "automated":
        case "blue":
            return "info";
        default:
            return "muted";
    }
};

export const iconMapper = (value: string): LucideIcon => {
    switch (value?.toLowerCase()) {
        case "overdue":
        case "empty":
        case "red":
            return AlertCircle;
        case "needs attention":
        case "partial":
        case "yellow":
            return AlertTriangle;
        case "completed":
        case "full":
        case "green":
            return CheckCircle;
        case "assigned":
        case "automated":
        case "blue":
            return Info;
        default:
            return Circle;
    }
};

export const mapStatusToBadge = (status: string) => {
    const badgeType = actionPropMapper(status);
    return {
        text: status.replace(/_/g, " "),
        badgeType,
        Icon: iconMapper(status),
        color: badgeType === "error" ? "red" : badgeType === "warning" ? "yellow" : badgeType === "success" ? "green" : badgeType === "info" ? "blue" : "gray",
    };
};

export class ResourceHelper {
    static _schema: ParsedSupabaseDBSchemaData | null = null;
    static async getSchema(): Promise<ParsedSupabaseDBSchemaData> {
        if (!this._schema) {
            this._schema = await getPublicSchema();
        }
        return this._schema;
    }

    publicSchema!: ParsedSupabaseDBSchemaData;
    resource: any;
    resourceType: baseModelResource["type"] | "default" = 'product'; //keyof typeof import("@/constants/defaultSession") | null;

    //keyof typeof import("@/constants/defaultSession");
    config: { caseFormat: "camel" | "snake" };
    resourceTableName: string | null = null;
    resourcePK: string | null = null;

    constructor({
        resource,
        resourceType,
        config = { caseFormat: "snake" },
    }: {
        resource: any;
        resourceType: baseModelResource["type"] | "default";
        config?: { caseFormat: "camel" | "snake" };
    }) {
        this.resource = resource;
        this.resourceType = resourceType;
        this.config = config;
    }

    async init(): Promise<this> {
        this.publicSchema = await ResourceHelper.getSchema();
        this.resourceTableName = this.matchToTable(this?.resourceType ?? "default");
        this.resourcePK = this.getPrimaryKey(this.resourceTableName);
        return this;
    }

    //match a string to the appropriate db table name in the public schema
    matchToTable(input: string): string | null {
        if (!!!input || typeof input !== 'string') throw new TypeError(`input to match to a table must be a string. Received: ${{ input, type: typeof input }}`);
        // handle 'default' & 'userProfile' as special cases
        if (["userProfile", convertCamelToSnake("userProfile",), 'default'].includes((input.toLowerCase()))) return "profiles";
        const formatted = this.config.caseFormat === "camel" ? convertSnakeToCamel(input) : convertCamelToSnake(input);
        const table = formatted.toLowerCase();
        return Object.keys(this.publicSchema).includes(table) ? table : null;
    }

    getPrimaryKey(tableName: string | null): string | null {
        return tableName && this.publicSchema?.[tableName]?.primary_key || null;
    }

    getStatusKey(tableName: string): string | null {
        const columns = this.publicSchema?.[tableName]?.columns;
        switch (tableName) {
            case "product": return columns?.current_quantity_status ? "current_quantity_status" : "current_quantity";
            case "task": return columns?.completion_status ? "completion_status" : "due_date";
            case "user_households": return columns?.role_access ? "role_access" : columns?.role ? "role" : "draft_status";
            default: return "draft_status";
        }
    }

    getStatus(): string {
        const key = this.getStatusKey(this.resourceTableName || "");
        //guard clause for falsy key
        if (!!!key) return "default";
        return this.resource?.[key] || this.resource?.completion_status || this.resource?.current_quantity_status || "default";
    }

    getBadge() {
        return mapStatusToBadge(this.getStatus());
    }

    getNameKey(): string {
        switch (this.resourceType) {
            case "product":
                return "product_name";
            case "task": return "task_name";

            default:
                return "name";
        }
    }
}

export class ProductHelper extends ResourceHelper {
    constructor(
        resource: any,
        ...args: any[]) {
        super({ resource, resourceType: "product" });
    }

    async init(): Promise<this> {
        await super.init();
        return this;
    }


}
export class OFFProductHelper extends ProductHelper {
    constructor(
        resource: any,
        ...args: any[]
    ) {
        super(resource);
    }

    async init(): Promise<this> {
        await super.init();
        return this;
    }

    static findIngredientsByStatus = (
        ingredients: Array<Record<string, any>>,
        diet: string,
        status: string
    ): Record<string, any> | undefined =>
        ingredients.find(ingredient => ingredient[diet] === status);

    static formatIngredientName = (name: string): string => {
        const noLowerDashName = name.replace(/_/g, '');
        return noLowerDashName.charAt(0).toUpperCase() + noLowerDashName.slice(1);
    };

    static getIngredientsStatus = (
        ingredients: Array<Record<string, any>>
    ): Array<{ name: string; vegan: string; vegetarian: string }> =>
        ingredients.map(ingredient => {
            const newIngredient = {
                name: OFFProductHelper.formatIngredientName(ingredient.text),
                vegan: 'unknown',
                vegetarian: 'unknown',
            };
            // vegan
            if (ingredient.vegan) {
                newIngredient.vegan = ingredient.vegan;
            }

            // vegetarian
            if (ingredient.vegetarian) {
                newIngredient.vegetarian = ingredient.vegetarian;
            }

            return newIngredient;
        });

    static checkDietStatus = (
        ingredients: Array<Record<string, any>>,
        diet: string
    ): string => {
        switch (true) {
            case !!OFFProductHelper.findIngredientsByStatus(ingredients, diet, 'no'):
                return 'no';
            case !!OFFProductHelper.findIngredientsByStatus(ingredients, diet, undefined):
                return 'unknown';
            case !!OFFProductHelper.findIngredientsByStatus(ingredients, diet, 'unknown'):
                return 'unknown';
            case !!OFFProductHelper.findIngredientsByStatus(ingredients, diet, 'maybe'):
                return 'maybe';
            case !!OFFProductHelper.findIngredientsByStatus(ingredients, diet, 'yes'):
                return 'yes';
            default:
                return 'unknown';
        }
    };

    static getNonDietIngredients = (
        ingredients: Array<Record<string, any>>,
        diet: string
    ): Array<Record<string, any>> => {
        return ingredients.filter(ingredient => {
            if (!ingredient[diet]) {
                return true;
            } else if (ingredient[diet] !== 'yes') {
                return true;
            } else {
                return false;
            }
        });
    };

    static sortNonDietaryIngredients = (
        ingredients: Array<Record<string, any>>,
        diet: string
    ): Array<Record<string, any>> => {
        const sortOrder = ['no', 'maybe', 'unknown'];
        const initialIngredients = [...ingredients];
        return initialIngredients.sort(
            (a, b) => sortOrder.indexOf(a[diet]) - sortOrder.indexOf(b[diet])
        );
    };
}