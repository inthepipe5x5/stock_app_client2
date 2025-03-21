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

export const sortAlphabetically = (arr: {
    name: string;
    dial_code: string;
    flag: string;
    code: string;
}[], sortKey: "name" | "dial_code" | "flag" | "code" = "name") => {
    return arr.sort((a, b) => a[sortKey].localeCompare(b[sortKey]));
};