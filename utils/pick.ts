import isTruthy from "@/utils/isTruthy";
/**
 * ---------------------------
 *   @function Pick (v1.1)
 *  ---------------------------
 * Picks specified keys from an object and returns a new object with those keys.
 *
 * @template T - The type of the source object.
 * @template K - The keys to pick from the source object.
 * @param {T} sourceObject - The source object to pick keys from.
 * @param {K[]} keys - An array of keys to pick from the source object.
 * @returns {Pick<T, K>} A new object with the picked keys.
 *
 * @example
 * const user = {
 *     id: 1,
 *     name: 'John Doe',
 *     email: 'john.doe@example.com',
 *     age: 30
 * };
 *
 * const pickedUser = pick(user, ['id', 'name']);
 * console.log(pickedUser); // Output: { id: 1, name: 'John Doe' }
 */
export const pick = <T extends object, K extends keyof T>(sourceObject: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        if (key in sourceObject) {
            result[key] = sourceObject[key];
        }
    });
    return result;
}

/**---------------------------
 *   @function remapKeys (v1.1)
 *  ---------------------------
 * Remaps the keys of a source object based on a provided key mapping.
 *
 * @template SourceObjectType - The type of the source object.
 * @template KeyMappingType - The type of the key mapping object.
 * @param {SourceObjectType} sourceObject - The source object whose keys are to be remapped.
 * @param {KeyMappingType} keyMapping - An object that maps keys from the source object to new keys.
 * @returns {Partial<SourceObjectType>} A new object with keys remapped according to the key mapping.
 * 
 * @example
 * const source = { a: 1, b: 2, c: 3 };
 * const mapping = { a: 'x', b: 'y' };
 * const result = remapKeys(source, mapping);
 * // result is { x: 1, y: 2, c: 3 }
 * 
 * @remarks
 * - The function iterates over each key in the source object.
 * - For each key, it checks if there is a corresponding new key in the key mapping.
 * - If a new key is found and is truthy, it assigns the value to the new key in the result object.
 * - If no new key is found or the new key is null/undefined, it retains the original key in the result object.
 */
/**
 * Remaps the keys of the given source object based on the provided key mapping.
 * If a key is remapped, it is removed from the returned result object.
 *

 */
export const remapKeys = <SourceObjectType extends object, KeyMappingType extends { [key in keyof SourceObjectType]?: string | null }>(sourceObject: SourceObjectType, keyMapping: KeyMappingType): Partial<SourceObjectType> => {
    const result = {} as Partial<SourceObjectType>;
    Object.keys(sourceObject).forEach(key => {
        const newKey = keyMapping[key as keyof SourceObjectType];
        if (isTruthy(newKey)) {
            result[newKey as unknown as keyof SourceObjectType] = sourceObject[key as keyof SourceObjectType];
        } else {
            result[key as keyof SourceObjectType] = sourceObject[key as keyof SourceObjectType];
        }
    });
    return result;
}

