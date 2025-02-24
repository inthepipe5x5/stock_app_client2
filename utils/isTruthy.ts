/**
 * Checks if a value is truthy, including nested values.
 * 
 * A value is considered truthy if it is not:
 * - null
 * - undefined
 * - an empty array (including nested arrays)
 * - an empty object (including nested objects)
 * 
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns `true` if the value or any nested value is truthy, otherwise `false`.
 */
const isTruthy = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (Array.isArray(value)) return value.some(isTruthy);
    if (typeof value === 'object') return Object.values(value).some(isTruthy);
    return !!value;
}

export default isTruthy;