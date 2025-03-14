import { countryResult } from "./countries";

/**
 * Sorts an array of strings in ascending order, ignoring case.
 *
 * @param {string[]} dataToSort - The array of strings to be sorted.
 * @returns {string[]} The sorted array of strings.
 */
export const lowerCaseSort = (dataToSort: string[]) => {
    return dataToSort.sort((a, b) => a.localeCompare(b));
}

export const sortAlphabetically = (arr: countryResult[]) => {
    return arr.sort((a, b) => a.name.common.localeCompare(b.name.common));
};