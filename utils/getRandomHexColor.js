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
  return color;
};
export default getRandomHexColor;
