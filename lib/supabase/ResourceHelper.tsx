import supabase from "@/lib/supabase/supabase";
import { convertCamelToSnake, convertSnakeToCamel } from "@/utils/caseConverter";
import { AlertCircle, AlertTriangle, CheckCircle, Info, Circle, LucideIcon } from "lucide-react-native";
import { baseModelResource, relatedResource } from "../models/types";
import { household, product, task, user_households, userProfile } from "@/constants/defaultSession";
import { fetchUserHouseholdRelations } from "./session";
import { remapKeys } from "@/utils/pick";
import { capitalize } from '@/utils/capitalizeSnakeCaseInputName'
import { isExpired } from "@/utils/isExpired";
import { Badge, BadgeText } from "@/components/ui/badge";
import { HStack } from "@/components/ui/hstack";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { addToDate, calculateIntervals, findDateDifference, formatDatetimeObject } from "@/utils/date";
import * as Crypto from "expo-crypto";
import { createHouseholdWithInventories, getHouseholdAndInventoryTemplates } from "@/lib/supabase/register";

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
    args: any[];
    currentUser: Partial<userProfile> | null = null;
    constructor({
        resource,
        resourceType,
        config = { caseFormat: "snake" },
        currentUser = null,
        ...args
    }: {
        resource: any;
        currentUser?: Partial<userProfile> | null | undefined;
        args?: any[];
        resourceType: baseModelResource["type"] | "default";
        config?: { caseFormat: "camel" | "snake" };
    }) {
        this.resource = resource;
        this.resourceType = resourceType;
        this.config = config;
        this.args = Array.isArray(args) ? args : [];
        this.currentUser = currentUser;
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

    getBadge(
        styling?: {
            badgeClassName?: string | null | undefined;
            badgeContainerClassName?: string | null | undefined;
            textColor?: string | null | undefined;
            iconColor?: string | null | undefined;
            iconSize?: number | null | undefined;

        } | null | undefined
    ) {
        const status = mapStatusToBadge(this.getStatus());
        return (
            <Badge
                className={cn(`mx-auto`, styling?.badgeClassName ?? "")}
                action={actionPropMapper(this.getStatus())}
            >
                <HStack className={cn(`justify-center items-center`, styling?.badgeContainerClassName ?? "")}>
                    {!!status?.Icon ?
                        <status.Icon
                            className={`text-${status.color}-500`}
                            size={styling?.iconSize ?? 16}
                        />
                        : null}
                    {!!status?.text ?
                        <BadgeText className={`text-${styling?.textColor ?? status.color}-500`}>
                            {status.text}
                        </BadgeText>
                        : null
                    }
                </HStack>
            </Badge >
        )
    }

    getNameKey(): string {
        switch (this.resourceType) {
            case "product":
                return "product_name";
            case "task": return "task_name";
            default:
                return 'name';
        }
    }
    getName(): string {
        return this.resource?.[this.getNameKey()] ?? `${capitalize(this.resourceType)} $`;
    }

    getId(): string | null {
        if (!!this.resourcePK && this.resource?.[this.resourcePK]) {
            return this.resource?.[this.resourcePK] ?? this.resource?.id ?? this.resource?.user_id ?? this.resource?.household_id ?? this.resource?.product_id ?? this.resource?.task_id ?? null;
        }

        return null;
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


    /**Create Task Object for the product
     * 
     * @param task_name - @string | null | undefined - name of the task
     * @param description - @string | null | undefined - description of the task
     * @returns a partial task object with the following properties:
     * - id: @string - a unique identifier for the task
     * - task_name: @string - name of the task
     * - description: @string - description of the task
     * - completion_status: @string - status of the task (@default: 'assigned')
     * - due_date: @string - due date of the task (@default: current date)
     */
    createTaskObj({
        taskName,
        description,
        dueDate,
        assignedUser,
    }: {
        taskName?: string | null | undefined;
        description?: string | null | undefined;
        dueDate?: string | null | undefined;
        assignedUser?: string | null | undefined;
    }): Partial<task> {
        const taskCreator = this.currentUser?.user_id ?? "";
        const taskAssignedUser = assignedUser ?? taskCreator;

        return {
            id: Crypto.randomUUID(),
            task_name: taskName ?? `Scan ${this.getName()}`,
            description: description ?? `Scan ${this.getName() ?? "Product"} to record its quantity`,
            completion_status: 'assigned',
            due_date: dueDate ?? new Date(addToDate(new Date(), 1, "month")).toISOString(),
            created_dt: new Date().toISOString(),
            updated_dt: new Date().toISOString(),
            created_by: String(taskCreator),
            assigned_to: String(taskAssignedUser),
        };

    }

    /** Inserts a new task for an autoreplenishing product into the database. 
     * 
    */

    async createAutoReplenishTask(productId: string): Promise<task | null | { [key: string]: any }> {
        const { data, error } = await supabase.rpc('insert_automated_task', {
            prod_id: productId,
        })
        if (error) {
            console.error("Error creating auto replenish task:", error);
            return null;
        }
        return data;
    }
}

export interface ProductInfo {
    productName: string;
    genericName: string;
    brand: string;
    category: string;
    image: string;
    nutriscore: string;
    novaGroup: number;
    ecoscore: string;
    ingredients: {
        text: string;
        id: string;
        vegan?: string;
        vegetarian?: string;
    }[];
    additives: string[];
    allergens: string[];
    nutriments: {
        energy?: number;
        energyKj?: number;
        energyKcal?: number;
        proteins?: number;
        casein?: number;
        serumProteins?: number;
        nucleotides?: number;
        carbohydrates?: number;
        sugars?: number;
        sucrose?: number;
        glucose?: number;
        fructose?: number;
        lactose?: number;
        maltose?: number;
        maltodextrins?: number;
        starch?: number;
        polyols?: number;
        fat?: number;
        saturatedFat?: number;
        butyricAcid?: number;
        caproicAcid?: number;
        caprylicAcid?: number;
        capricAcid?: number;
        lauricAcid?: number;
        myristicAcid?: number;
        palmiticAcid?: number;
        stearicAcid?: number;
        arachidicAcid?: number;
        behenicAcid?: number;
        lignocericAcid?: number;
        ceroticAcid?: number;
        montanicAcid?: number;
        melissicAcid?: number;
        monounsaturatedFat?: number;
        polyunsaturatedFat?: number;
        omega3Fat?: number;
        alphaLinolenicAcid?: number;
        eicosapentaenoicAcid?: number;
        docosahexaenoicAcid?: number;
        omega6Fat?: number;
        linoleicAcid?: number;
        arachidonicAcid?: number;
        gammaLinolenicAcid?: number;
        dihomGammaLinolenicAcid?: number;
        omega9Fat?: number;
        oleicAcid?: number;
        elaidicAcid?: number;
        gondoicAcid?: number;
        meadAcid?: number;
        erucicAcid?: number;
        nervonicAcid?: number;
        transFat?: number;
        cholesterol?: number;
        fiber?: number;
        sodium?: number;
        alcohol?: number;
        vitaminA?: number;
        vitaminD?: number;
        vitaminE?: number;
        vitaminK?: number;
        vitaminC?: number;
        vitaminB1?: number;
        vitaminB2?: number;
        vitaminPP?: number;
        vitaminB6?: number;
        vitaminB9?: number;
        vitaminB12?: number;
        biotin?: number;
        pantothenicAcid?: number;
        silica?: number;
        bicarbonate?: number;
        potassium?: number;
        chloride?: number;
        calcium?: number;
        phosphorus?: number;
        iron?: number;
        magnesium?: number;
        zinc?: number;
        copper?: number;
        manganese?: number;
        fluoride?: number;
        selenium?: number;
        chromium?: number;
        molybdenum?: number;
        iodine?: number;
        caffeine?: number;
        taurine?: number;
        ph?: number;
    };
    servingSize: string;
    quantity: string;
    packaging: string[];
    manufacturingPlaces: string[];
    categories: string[];
}

export interface ExtraInformation {
    health: {
        additives: {
            name: string;
            information?: string;
            sourceText?: string;
            sourceUrl?: string;
        }[];
        nutrients: {
            id: string;
            name: string;
            quantity: string;
            unit?: string;
            evaluation?: string;
            information?: string;
        }[];
        warnings: {
            text: string;
            level?: string;
            evaluation?: string;
        }[];
    };
    other: {
        isRecyclable?: boolean;
        isPalmOilFree?: 'yes' | 'no' | 'unknown';
        isVegan?: 'yes' | 'no' | 'unknown';
        isVegetarian?: 'yes' | 'no' | 'unknown';
    };
}



export class OFFProductHelper extends ProductHelper {
    constructor(
        resource: any | ProductInfo | ExtraInformation | ProductInfo & ExtraInformation,
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


    extractExtraInformation(data: any): ExtraInformation {
        const knowledgePanels = data?.product?.knowledge_panels;

        const extraInformation: ExtraInformation = {
            health: {
                additives: [],
                nutrients: [],
                warnings: [],
            },
            other: {
                isRecyclable: undefined,
                isPalmOilFree: 'unknown', // Initialize
                isVegan: 'unknown',
                isVegetarian: 'unknown',
            },
        };

        if (knowledgePanels) {
            // Extract Additives
            for (const key in knowledgePanels) {
                if (key.startsWith("additive_en:")) {
                    const additive = knowledgePanels[key];
                    const additiveInfo = {
                        name: additive?.title_element?.title || "",
                        information: additive?.elements?.[0]?.text_element?.html,
                        sourceText: additive?.elements?.[0]?.text_element?.source_text,
                        sourceUrl: additive?.elements?.[0]?.text_element?.source_url,
                    };
                    extraInformation.health.additives.push(additiveInfo);
                }
            }

            // Extract Nutrient Levels with IDs
            const nutrientLevels: { key: string; id: string }[] = [
                { key: "nutrient_level_fat", id: "fat" },
                { key: "nutrient_level_saturated-fat", id: "saturatedFat" },
                { key: "nutrient_level_sugars", id: "sugars" },
                { key: "nutrient_level_salt", id: "salt" },
            ];

            nutrientLevels.forEach(({ key, id }) => {
                const level = knowledgePanels[key];
                if (level) {
                    const title = level?.title_element?.title || "";
                    const match = title.match(/([\d.]+)\s*([a-zA-Z%]+)/);
                    const quantity = match ? match[1] : "";
                    const unit = match ? match[2] : "";

                    extraInformation.health.nutrients.push({
                        id: id, // Use the defined ID
                        name: level?.title_element?.name || "",
                        quantity: quantity,
                        unit: unit,
                        evaluation: level?.evaluation,
                        information: level?.elements?.[0]?.text_element?.html,
                    });
                }
            });

            // Extract Ultra-Processed Food Warnings
            const ultraProcessed = knowledgePanels?.recommendation_ultra_processed_foods;
            if (ultraProcessed) {
                extraInformation.health.warnings.push({
                    text: ultraProcessed.title_element?.title + " " + ultraProcessed.title_element?.subtitle || "",
                    level: ultraProcessed.level,
                    evaluation: ultraProcessed.evaluation,
                });

            }

            // Extract Other Information (Recyclable, Palm Oil, Vegan, Vegetarian)
            extraInformation.other.isRecyclable = knowledgePanels["packaging_recycling"]?.evaluation === 'good'

            const palmOilStatus = knowledgePanels["ingredients_analysis_en:palm-oil-free"]?.evaluation;
            extraInformation.other.isPalmOilFree = palmOilStatus === "good" ? "yes" : palmOilStatus === "bad" ? 'no' : "unknown";


            const veganStatus = knowledgePanels["ingredients_analysis_en:vegan-status-unknown"]?.evaluation;
            extraInformation.other.isVegan = veganStatus === "good" ? "yes" : veganStatus === "bad" ? "no" : "unknown";

            const vegetarianStatus = knowledgePanels["ingredients_analysis_en:vegetarian-status-unknown"]?.evaluation;
            extraInformation.other.isVegetarian = vegetarianStatus === "good" ? "yes" : vegetarianStatus === "bad" ? "no" : "unknown";

        }

        return extraInformation;
    }


    extractProductInfo(data: any): ProductInfo {
        const product = data.product;

        const packaging: string[] = product.packaging_tags
            ? product.packaging_tags.map((tag: string) => tag.replace('en:', ''))
            : [];

        const ingredients = product.ingredients
            ? product.ingredients.map((ing: any) => ({
                text: ing.text,
                id: ing.id,
                vegan: ing.vegan,
                vegetarian: ing.vegetarian,
            })).filter((ingredient: any) => ingredient.id.startsWith('en:'))
            : [];

        return {
            productName: product.product_name_en || product.product_name || "",
            genericName: product.generic_name_en || product.generic_name || "",
            brand: product.brands || product.brands_tags[0] || "",
            category: product.category_properties["ciqual_food_name:en"] || product.compared_to_category.replace('en:', "").replaceAll("-", " ") || "",
            image: product.image_front_url || "",
            nutriscore: product.nutriscore_grade || "not-applicable",
            novaGroup: product.nova_group || -1,
            ecoscore: product.ecoscore_grade || "not-applicable",
            ingredients: ingredients,
            additives: product.additives_tags ? product.additives_tags.map((tag: string) => tag.replace('en:', '')) : [],
            allergens: product.allergens_tags ? product.allergens_tags.map((tag: string) => tag.replace('en:', '')) : [],
            nutriments: {
                energy: product.nutriments.energy_100g,
                energyKj: product.nutriments["energy-kj_100g"],
                energyKcal: product.nutriments["energy-kcal_100g"],
                proteins: product.nutriments.proteins_100g,
                casein: product.nutriments.casein_100g,
                serumProteins: product.nutriments["serum-proteins_100g"],
                nucleotides: product.nutriments.nucleotides_100g,
                carbohydrates: product.nutriments["carbohydrates_100g"],
                sugars: product.nutriments.sugars_100g,
                sucrose: product.nutriments.sucrose_100g,
                glucose: product.nutriments.glucose_100g,
                fructose: product.nutriments.fructose_100g,
                lactose: product.nutriments.lactose_100g,
                maltose: product.nutriments.maltose_100g,
                maltodextrins: product.nutriments.maltodextrins_100g,
                starch: product.nutriments.starch_100g,
                polyols: product.nutriments.polyols_100g,
                fat: product.nutriments.fat_100g,
                saturatedFat: product.nutriments["saturated-fat_100g"],
                butyricAcid: product.nutriments["butyric-acid_100g"],
                caproicAcid: product.nutriments["caproic-acid_100g"],
                caprylicAcid: product.nutriments["caprylic-acid_100g"],
                capricAcid: product.nutriments["capric-acid_100g"],
                lauricAcid: product.nutriments["lauric-acid_100g"],
                myristicAcid: product.nutriments["myristic-acid_100g"],
                palmiticAcid: product.nutriments["palmitic-acid_100g"],
                stearicAcid: product.nutriments["stearic-acid_100g"],
                arachidicAcid: product.nutriments["arachidic-acid_100g"],
                behenicAcid: product.nutriments["behenic-acid_100g"],
                lignocericAcid: product.nutriments["lignoceric-acid_100g"],
                ceroticAcid: product.nutriments["cerotic-acid_100g"],
                montanicAcid: product.nutriments["montanic-acid_100g"],
                melissicAcid: product.nutriments["melissic-acid_100g"],
                monounsaturatedFat: product.nutriments["monounsaturated-fat_100g"],
                polyunsaturatedFat: product.nutriments["polyunsaturated-fat_100g"],
                omega3Fat: product.nutriments["omega-3-fat_100g"],
                alphaLinolenicAcid: product.nutriments["alpha-linolenic-acid_100g"],
                eicosapentaenoicAcid: product.nutriments["eicosapentaenoic-acid_100g"],
                docosahexaenoicAcid: product.nutriments["docosahexaenoic-acid_100g"],
                omega6Fat: product.nutriments["omega-6-fat_100g"],
                linoleicAcid: product.nutriments["linoleic-acid_100g"],
                arachidonicAcid: product.nutriments["arachidonic-acid_100g"],
                gammaLinolenicAcid: product.nutriments["gamma-linolenic-acid_100g"],
                dihomGammaLinolenicAcid: product.nutriments["dihomo-gamma-linolenic-acid_100g"],
                omega9Fat: product.nutriments["omega-9-fat_100g"],
                oleicAcid: product.nutriments["oleic-acid_100g"],
                elaidicAcid: product.nutriments["elaidic-acid_100g"],
                gondoicAcid: product.nutriments["gondoic-acid_100g"],
                meadAcid: product.nutriments["mead-acid_100g"],
                erucicAcid: product.nutriments["erucic-acid_100g"],
                nervonicAcid: product.nutriments["nervonic-acid_100g"],
                transFat: product.nutriments["trans-fat_100g"],
                cholesterol: product.nutriments.cholesterol_100g,
                fiber: product.nutriments["fiber_100g"],
                sodium: product.nutriments["sodium_100g"],
                alcohol: product.nutriments["alcohol_100g"],
                vitaminA: product.nutriments["vitamin-a_100g"],
                vitaminD: product.nutriments["vitamin-d_100g"],
                vitaminE: product.nutriments["vitamin-e_100g"],
                vitaminK: product.nutriments["vitamin-k_100g"],
                vitaminC: product.nutriments["vitamin-c_100g"],
                vitaminB1: product.nutriments["vitamin-b1_100g"],
                vitaminB2: product.nutriments["vitamin-b2_100g"],
                vitaminPP: product.nutriments["vitamin-pp_100g"],
                vitaminB6: product.nutriments["vitamin-b6_100g"],
                vitaminB9: product.nutriments["vitamin-b9_100g"],
                vitaminB12: product.nutriments["vitamin-b12_100g"],
                biotin: product.nutriments["biotin_100g"],
                pantothenicAcid: product.nutriments["pantothenic-acid_100g"],
                silica: product.nutriments["silica_100g"],
                bicarbonate: product.nutriments["bicarbonate_100g"],
                potassium: product.nutriments["potassium_100g"],
                chloride: product.nutriments["chloride_100g"],
                calcium: product.nutriments["calcium_100g"],
                phosphorus: product.nutriments["phosphorus_100g"],
                iron: product.nutriments["iron_100g"],
                magnesium: product.nutriments["magnesium_100g"],
                zinc: product.nutriments["zinc_100g"],
                copper: product.nutriments["copper_100g"],
                manganese: product.nutriments["manganese_100g"],
                fluoride: product.nutriments["fluoride_100g"],
                selenium: product.nutriments["selenium_100g"],
                chromium: product.nutriments["chromium_100g"],
                molybdenum: product.nutriments["molybdenum_100g"],
                iodine: product.nutriments["iodine_100g"],
                caffeine: product.nutriments["caffeine_100g"],
                taurine: product.nutriments["taurine_100g"],
                ph: product.nutriments["ph_100g"]
            },
            servingSize: product.serving_size || "",
            quantity: product.quantity || "",
            packaging: packaging,
            manufacturingPlaces: product.manufacturing_places_tags ? product.manufacturing_places_tags.map((place: string) => place.replace('en:', '')) : [],
            categories: product.categories_tags ? product.categories_tags.map((category: string) => category.replace('en:', '')) : []
        };
    }

}

export class TaskHelper extends ResourceHelper {
    assignments?: Partial<relatedResource | userProfile>[]
    intervals: Date[] = []
    product?: { id: string, [key: string]: any } | Partial<product> | null = null;
    constructor(
        resource: any,
        product?: { id: string, [key: string]: any } | Partial<product> | null | undefined,
        ...args: any[]) {
        super({ resource, resourceType: "task" });
        this.resource.completion_status = this.getStatus()
        // if ("assignments" in args) {
        //     this.assignments = args[0].assignments;
        // }
        if (resource?.is_automated) {
            this.intervals = this.calculateRecurringTaskDueDate();

        }
    }

    async init(): Promise<this> {
        await super.init();
        return this;
    }

    getTaskName(): string {
        return capitalize(this.resource?.[this.getNameKey()] ?? "Task");
    }

    isOverdue(): boolean {
        const dueDate = this.resource?.due_date || this.resource?.due_at || this.resource?.dueAt || null;
        if (!!!dueDate) return false;
        return isExpired(new Date(dueDate).toUTCString());
    }

    getStatus(): string {
        return super.getStatus() ?? this.isOverdue() ? "overdue" : 'assigned';
    }

    /** Helper function to get the task due date prompt string
     *  
     * @param prefix 
     * @param dateUnits 
     * @param useNowAsAnchor 
     * @returns @string - the task due date prompt string
     * @example getTaskDuePromptStr("Task", "days", true) // returns "Task due 3 days from now"
     */
    getTaskDuePromptStr(prefix?: string | null | undefined, dateUnits?: string | null | undefined, relative: boolean = false): string {
        const status = this.getStatus()
        const outputStrPrefix = prefix ?? `${capitalize(status)}`;
        //set the anchor date to the current date if relative is true or if the resource created date is falsy
        const anchorDate = relative || !!!this.resource?.created_dt ? new Date() : new Date(this.resource?.created_dt)
        const dateDiff = findDateDifference(new Date(this.resource?.due_date), anchorDate); //date difference in days

        switch (Math.abs(dateDiff)) {
            case 0:
                return relative ? `${capitalize(outputStrPrefix)} today` : `${capitalize(outputStrPrefix)} as of today`;
            case 1:
                return `${capitalize(outputStrPrefix)} ${!isExpired || dateDiff > 0 ? "tomorrow" : "yesterday"}`;
            default:
                return `${capitalize(outputStrPrefix)} ${Math.abs(dateDiff)} ${dateUnits ?? "days"} ${isExpired(anchorDate.toDateString()) ? "ago" : "from now"}`;

        };

    }

    calculateRecurringTaskDueDate(): any {
        const requiredKeys =
            ['is_automated',
                'recurrence_interval',
                'recurrence_end_date',
                'created_dt',];
        //guard clause for falsy resource & missing required keys or if the end date is in the past
        if (requiredKeys.every((key) => !!this.resource[key]) || isExpired(this.resource?.recurrence_end_date)) {
            return this.intervals = [];
        }

        const endDate = new Date(this.resource?.recurrence_end_date).getFullYear() > new Date().getFullYear() ? new Date(this.resource?.recurrence_end_date) :
            new Date(`December 31 ${new Date().getFullYear()}`);
        //calculate intervals

        return this.intervals = calculateIntervals(
            this.resource?.recurrence_interval, //recurrence interval
            new Date(this.resource?.created_dt), //start date
            endDate,
        )
    };
    /** Helper function to get a formatted task due date prompt string
     * @param country - the country code to format the date string
     * @returns @string - the task due date prompt string
     */

    getRecurringPromptStr(country?: string): string {
        if (!!!this.resource || !!!this.resource?.is_automated || !!!this.resource?.recurrence_interval) {
            return 'Not recurring task';
        }
        const formattedInterval = this.resource?.recurrence_interval.trim().toLowerCase()
        if (this.resource?.recurrence_end_date) {

            const formattedEndDate = formatDatetimeObject(new Date(this.resource?.recurrence_end_date), country ?? "CA")
            return `Repeats every ${formattedInterval} until ${formattedEndDate}`;
        }
        return `Repeats every ${formattedInterval} indefinitely`;
    }

}
export class UserHouseholdHelper extends ResourceHelper {
    constructor(
        resource: Partial<user_households | household> | { [key: string]: any },
        currentUser?: Partial<userProfile> | null, ...args: any[]) {
        super({ resource, resourceType: "household", currentUser });
    }

    async init(): Promise<this> {
        await super.init();
        return this;
    }

    async newHouseholdTemplates(): Promise<Partial<household> | any> {
        // const household = {
        //     id: Crypto.randomUUID(),
        //     name: this.resource?.name || "Household",
        //     household_name: this.resource?.household_name || "Household",
        //     created_dt: new Date().toISOString(),
        //     updated_dt: new Date().toISOString(),
        //     created_by: this.currentUser?.user_id,
        // };
        // return household;
        return await getHouseholdAndInventoryTemplates()
    }
    getHouseholdName(): string {
        return this.resource?.household_name || this.resource?.name || "Household";
    }

    /**Helper function to check if a user (row in @type user_households) is a guest in a household and if their invite has expired
     * 
     * @param guest 
     * @returns boolean - true if the user is a guest and their invite has not expired, false otherwise
     * @example checkGuestAccess({ household_id: 1, user_id: 2, access_level: "guest", role_access: "guest", invited_at: "2023-01-01T00:00:00Z" }) // returns true
     * @example checkGuestAccess({ household_id: 1, user_id: 2, access_level: "guest", role_access: "guest", invited_at: "2023-01-01T00:00:00Z", invite_expires_at: "2023-01-02T00:00:00Z" }) // returns false
     */
    checkGuestAccess(guest: user_households): boolean {
        const requiredKeys = ['household_id', 'user_id', 'access_level', 'invited_at'];
        //guard clause for falsy resource & missing required keys
        if (!!!guest
            || !!!this.resource
            || typeof guest !== 'object'
            || requiredKeys.every((key) => !!guest[key as keyof user_households])
        ) return false;
        //member is a guest and has all required keys
        let denyAccess = false;
        //check invite expiry 
        denyAccess = !isExpired(guest?.invite_expires_at); //returns false if value is expired
        //debugging log
        console.log({ denyAccess });
        return denyAccess;
    };

    filterFalsyMembers(members: any[]): any[] {
        if (!!!members || members.length === 0) return [];
        //normalize keys to snake case
        const normalizedMembers = (members as any[] ?? []).map((member: any) => {
            return Object.keys(member).reduce((acc: any, key: string) => {
                const newKey = convertCamelToSnake(key);
                acc[newKey] = member[key];
                return acc;
            }, {});
        })
        const filteredMembers = normalizedMembers.filter((member: any) => {
            //check if member is truthy and has all required keys
            if (!!!member || typeof member !== 'object') return false;
            //handle access level check for guests vs members
            if (!!member?.access_level) {
                return member?.access_level === 'guest' ? this.checkGuestAccess(member) : Boolean(['member', 'manager', 'admin'].includes(member?.access_level));
            }

        });
        console.log({ filteredMembers });
        //filter out falsy values from the array //apply any filters passed in

        //filtered members are truthy member objects and have all included keys
        return !!filteredMembers ? filteredMembers : [];
    };

    async getHouseholdMembers(): Promise<Partial<userProfile | user_households>[]> {
        try {
            //guard clause for falsy resource
            if (!!!this.resource || !!!this.resource?.id) return [];
            const initialMembers = this.resource?.members ?? this.resource?.household_members ?? this.resource?.members_list ?? []
            //filter out falsy values and create a set
            const members = new Set(this.filterFalsyMembers(initialMembers));

            //check if initialMembers is empty and fetch members from the database
            if (members.size === 0) {
                const fetchedMembers: Partial<user_households | household>[] | { data?: Partial<user_households | household>[] } = await fetchUserHouseholdRelations(
                    { [this?.resourcePK ?? "id"]: this.resource?.id }
                );
                if (!!!fetchedMembers || fetchedMembers?.length === 0) {
                    console.error("No members found in the database.", { fetchedMembers }, 'updated resource members to empty array');
                    return this.resource.members = []; //set members to empty array if no members are found
                }
                //update set with fetched members
                fetchedMembers.forEach((member) => {
                    members.add(member);
                });
            }

            //turn set into array and filter out falsy values
            return Array.from(initialMembers) as Partial<user_households | userProfile>[];
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}

export class UserProfileHelper extends ResourceHelper {
    constructor(
        resource: Partial<user_households | household> | { [key: string]: any },
        ...args: any[]) {
        super({ resource, resourceType: "userProfile" });
        this.resourcePK = "user_id";
        this.resourceTableName = "profiles";
    }

    async init(): Promise<this> {
        await super.init();
        return this;
    }

    getName(): string {
        const name = this.resource?.name ?? null;
        return !!!name
            ? (this.resource?.first_name && this.resource?.last_name
                ? `${capitalize(this.resource?.first_name)} ${capitalize(this.resource?.last_name)}`
                : "User")
            : capitalize(name);
    }

    id(): string {
        return this.resource?.user_id
    }


}