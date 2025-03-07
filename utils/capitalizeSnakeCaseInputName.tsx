/**
 * 
 * @param str 
 * @returns @param str that has been un-snake cased and capitalized on each word
 */
export const capitalizeSnakeCaseInputName = (str: string) => {
  return str.split(str.includes("_") ? "_" : " ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};
