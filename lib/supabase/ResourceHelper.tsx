import supabase from "@/lib/supabase/supabase";
import { convertCamelToSnake, convertSnakeToCamel } from "@/utils/caseConverter";
import { AlertCircle, AlertTriangle, CheckCircle, Info, Circle, LucideIcon } from "lucide-react-native";


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
    resourceType: keyof typeof import("@/constants/defaultSession");
    config: { caseFormat: "camel" | "snake" };
    resourceTableName: string | null = null;
    resourcePK: string | null = null;

    constructor({
        resource,
        resourceType,
        config = { caseFormat: "snake" },
    }: {
        resource: any;
        resourceType: keyof typeof import("@/constants/defaultSession");
        config?: { caseFormat: "camel" | "snake" };
    }) {
        this.resource = resource;
        this.resourceType = resourceType;
        this.config = config;
    }

    async init(): Promise<this> {
        this.publicSchema = await ResourceHelper.getSchema();
        this.resourceTableName = this.matchToTable(this.resourceType);
        this.resourcePK = this.getPrimaryKey(this.resourceTableName);
        return this;
    }

    matchToTable(input: string): string | null {
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
        return this.resource?.[key] || this.resource?.completion_status || this.resource?.current_quantity_status || "default";
    }

    getBadge() {
        return mapStatusToBadge(this.getStatus());
    }

    getNameKey(): string {
        switch (this.resourceType) {
            case "product": return "product_name";
            case "task": return "task_name";
            default: return "name";
        }
    }
}
