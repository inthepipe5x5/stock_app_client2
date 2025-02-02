import { convertSnakeToCamel, convertCamelToSnake } from './caseConverter'; // helper functions
//helper class to map table names to strings and vice versa, especially conversions between snake_case and camelCase
// Usage: route and resource matching 
class TableMapper {
    constructor(client, config = {}) {
        this.client = client;
        this.config = {
            caseFormat: 'snake', // Default to snake_case
            ...config,
        };
        this.tableNames = [];
        this.tableMap = new Map(); // Map for string-to-table matching
    }

    /**
     * Fetch all table names from the public schema.
     */
    async fetchTableNames() {
        if (!this.client) {
            throw new Error('Client not set. Need to pass in a client (eg. supabase) first.');
        }
        const { data, error } = await client.rpc('pg_table_names', {
            schema_name: 'public',
        });

        if (error) {
            console.error('Error fetching table names:', error);
            throw new Error('Failed to fetch table names');
        }

        this.tableNames = data;

        // Populate the Map with lowercase keys for matching
        this.tableNames.forEach((tableName) => {
            const key = tableName.toLowerCase();
            this.tableMap.set(key, tableName);
        });

        return this.tableNames;
    }

    /**
     * Match a string to a table name.
     * @param {string} inputString - The input string to match.
     * @returns {string|null} - The matching table name or null if none found.
     */
    matchToTable(inputString) {
        if (!this.tableNames || this.tableNames.length === 0) {
            throw new Error('Table names not loaded. Call fetchTableNames first.');
        }

        const formattedString =
            this.config.caseFormat === 'camel'
                ? convertSnakeToCamel(inputString)
                : convertCamelToSnake(inputString);

        // Direct map lookup
        const lowerCaseString = formattedString.toLowerCase();
        return this.tableMap.get(lowerCaseString) || null;
    }

    /**
     * Match a table name back to a string.
     * @param {string} tableName - The table name to match.
     * @returns {string|null} - The matching string or null if none found.
     */
    matchToString(tableName) {
        const formattedTableName =
            this.config.caseFormat === 'camel'
                ? convertCamelToSnake(tableName)
                : convertSnakeToCamel(tableName);

        return this.tableNames.includes(formattedTableName) ? formattedTableName : null;
    }

    /**
     * Change the case format for string-table mapping outputs.
     * @param {string} format - Either 'snake' or 'camel'.
     */
    setCaseFormat(format) {
        if (!['snake', 'camel'].includes(format)) {
            throw new Error('Invalid case format. Use "snake" or "camel".');
        }
        this.config.caseFormat = format;
    }
}

// Export the helper class
export default TableMapper;
