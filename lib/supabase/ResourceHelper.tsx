import { userProfile, product, task, vendor, household, user_households } from "@/constants/defaultSession";
import supabase from "@/lib/supabase/supabase";
import { convertCamelToSnake, convertSnakeToCamel } from "@/utils/caseConverter";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
/**
 * ResourceHelper.tsx
 * This file contains utility functions for handling resources in a Supabase application.
 * It includes functions to fetch, create, update, and delete resources.
 * It also includes a function to check if a resource is empty and a function to get the current user's ID.
 */

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
    const { data, error } = await supabase.rpc('get_public_schema_info');

    if (error) {
        console.error('Error fetching public schema info:', { error }, { data });
        throw error;;
    }
    console.log('Data fetched successfully:', { data });
    interface ColumnInfo {
        data_type: string;
        is_primary_key: boolean;
    }

    interface TableInfo {
        columns: Record<string, ColumnInfo>;
        primary_key: string;
    }

    interface ParsedData {
        [table_name: string]: TableInfo;
    }

    interface SupabaseDataItem {
        table_name: string;
        column_name: string;
        data_type: string;
        is_primary_key: boolean;
    }

    const parsedData: ParsedData = data.reduce((accum: ParsedData, item: SupabaseDataItem): ParsedData => {
        const { table_name, column_name, data_type, is_primary_key } = item;
        // Check if the table already exists in the accumulator
        if (!accum[table_name]) {
            accum[table_name] = {
                columns: {},
                primary_key: "",
            };
        }
        // Check if the column already exists
        accum[table_name].columns[column_name] = {
            data_type,
            is_primary_key,
        };
        // If it's a primary key, set it
        if (is_primary_key) {
            accum[table_name].primary_key = column_name;
        }
        // return the accumulator
        // console.log("accum", accum);
        return accum;
    }, {});
    console.log("Parsed Data", parsedData);
    return parsedData;
}
const publicSchema = getPublicSchema().then((schema) => {
    console.log("Parsed Schema", schema);
    return schema;
})
    .catch((error) => {
        console.error("Error parsing schema", error);
        return null;
    });

class ResourceHelper {
    SCHEMA = 'public';
    publicSchema: ParsedSupabaseDBSchemaData = publicSchema instanceof Promise ? {} : publicSchema;
    tableNames?: string[] | undefined;
    config: { [key: string]: any };
    resource: Partial<userProfile | product | task | vendor | household | user_households>;
    resourcePK?: string | null;
    resourceType: "product" | "task" | "vendor" | "user_profile" | "household" | "user_households";
    resourceTableName?: null | "product" | "task" | "vendor" | "user_profile" | "household" | "user_households";

    constructor({
        resource,
        resourceType,
        config,
    }: {
        resource: any
        resourceType: "product" | "task" | "vendor" | "user_profile" | "household" | "user_households"
        config: {
            caseFormat: 'camel' | 'snake'
        }

    }) {
        if (publicSchema instanceof Promise) {
            publicSchema
                .then((schema) => {
                    this.publicSchema = schema ?? {} as ParsedSupabaseDBSchemaData;
                    this.tableNames = Object.keys(this.publicSchema ?? {});
                    this.resourceTableName = this.matchToTable(resourceType) as "product" | "task" | "vendor" | "user_profile" | "household" | "user_households";
                    this.resourcePK = this.getPrimaryKey(this.resourceTableName);
                })
                .catch((error) => {
                    console.error("Error resolving public schema:", error);
                    this.publicSchema = {} as ParsedSupabaseDBSchemaData;
                    this.tableNames = [];
                    this.resourceTableName = null;
                    this.resourcePK = null;
                });
        } else {
            this.publicSchema = publicSchema ?? {} as ParsedSupabaseDBSchemaData;
        }


        this.config = { ...(config ?? { caseFormat: 'snake' }) };
        this.resource = resource;
        this.resourceType = resourceType;
        this.resourcePK = this.getPrimaryKey(resourceType);
        this.resourceTableName = this.matchToTable(resourceType) as "product" | "task" | "vendor" | "user_profile" | "household" | "user_households";
    };

    /**
        * Match a string to a table name.
        * @param {string} inputString - The input string to match.
        * @returns {string|null} - The matching table name or null if none found.
        */
    matchToTable(inputString: string): string | null {
        if (!!!this.tableNames || !!!this.publicSchema) {
            console.error('No table names or public schema available for matching.');
            return null;
        }

        const formattedString =
            this.config.caseFormat === 'camel'
                ? convertSnakeToCamel(inputString)
                : convertCamelToSnake(inputString);

        // Direct map lookup
        const lowerCaseString = formattedString.toLowerCase();
        return this.tableNames.includes(lowerCaseString) ? lowerCaseString : null;
    }

    /**
     * Match a table name back to a string.
     * @param {string} tableName - The table name to match.
     * @returns {string|null} - The matching string or null if none found.
     */
    matchToString(tableName: string): string | null {
        const formattedTableName =
            this.config.caseFormat === 'camel'
                ? convertCamelToSnake(tableName)
                : convertSnakeToCamel(tableName);

        return (this.tableNames ?? []).find(table => table.toLowerCase() === formattedTableName.toLowerCase()) ? formattedTableName : null;
    }

    /**
     * This static async function retrieves table information based on the provided table name from a
     * schema object.
     * @param {string} tableName - The `tableName` parameter is a string that represents the name of a
     * table for which you want to retrieve information.
     * @returns The `getTableInfo` function returns a `Promise` that resolves to a `TableInfo` object
     * corresponding to the provided `tableName`. If the `tableName` is found in the schema obtained
     * from `ResourceHelper.getPublicSchema()`, the function returns the corresponding `TableInfo`
     * object. If the `tableName` is not found in the schema, the function returns `null`.
     */
    static async getTableInfo(tableName: string): Promise<TableInfo | null> {
        const schema = await ResourceHelper.getPublicSchema();
        return schema[tableName] || null;
    }

    /**
     * This function retrieves the primary key of a table from the schema.
     * @param {string} tableName - The name of the table for which you want to retrieve the primary key.
     * @returns The primary key of the specified table as a string, or null if not found.
     */
    getPrimaryKey(tableName: string) {
        const tableInfo = this.publicSchema[tableName];
        if (tableInfo) {
            return tableInfo.primary_key;
        }
        return null;
    }

    //function getOwners 
    //function getResourceType

    //function getResourceById

    //function getDraftStatus

    //function getHousehold 

    //function get relation(type: string, id?: string) {

}
