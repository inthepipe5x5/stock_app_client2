/**
 * 
 * @param str 
 * @returns @param str that has been un-snake cased and capitalized on each word
 */
export const capitalizeSnakeCaseInputName = (str: string) => {
  return str.split(str.includes("_") ? "_" : " ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

/**
 * Capitalizes the first letter of each word in a given string.
 * Handles both single-word and multi-word strings.
 * Multi-word strings can be separated by various characters such as 
 * underscores, spaces, hyphens, slashes, dots, commas, semicolons, colons, 
 * pipes, parentheses, brackets, and braces.
 *
 * @param {string} str - The input string to be capitalized.
 * @returns {string} - The capitalized string.
 */
export const capitalize = (str: string): string => {
  const splitterCharArray = ["_", " ", "-", "/", ".", ",", ";", ":", "|", "(", ")", "[", "]", "{", "}"];
  //handle single word strings
  if (!str.includes(" ")) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  //handle multi-word strings
  let splitStr = "";
  for (let i = 0; i < splitterCharArray.length; i++) {
    if (str.includes(splitterCharArray[i])) {
      splitStr = splitterCharArray[i];
      break;
    }
  }
  return str.split(splitStr).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}