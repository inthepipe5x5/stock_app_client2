/**
 * The getRandomHexColor function generates a random hexadecimal color code.
 * @returns The function `getRandomHexColor` returns a randomly generated hexadecimal color code in the
 * format `#RRGGBB`, where each of the R, G, and B components are represented by two hexadecimal
 * digits.
 */
const getRandomHexColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  //make sure it's not black
  return color === stringToHexColor('black') ? getRandomHexColor() : color;
};
/**
 * The stringToHexColor function generates a hexadecimal color code based on the input string.
 * @param {string} str - The input string to be converted to a hexadecimal color code.
 * @returns The function `stringToHexColor` returns a hexadecimal color code in the format `#RRGGBB`.
 */
export const stringToHexColor = (str) => {
  str = str.toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
};

export default getRandomHexColor;
