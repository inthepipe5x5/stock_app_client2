/*
colors object for easier styling
Visualize it here: https://www.realtimecolors.com/?colors=1f160f-f7efe9-3d1e00-eda35e-f97b06&fonts=Inter-Inter
 */

const globalStyles = {
  light: {
    text: "#1f160f",
    background: "#FBFBFB", //gluestack ui background.light
    primary: "#3d1e00",
    secondary: "#eda35e",
    accent: "#f97b06",
  },
  dark: {
    text: "#f0e7e0",
    background: "#181719", //gluestack ui background.dark
    primary: "#ffe0c2",
    secondary: "#a15712",
    accent: "#f97b06",
  },
};

const Colors = {
  light: {
    text: globalStyles.light.text,
    background: globalStyles.light.background,
    primary: {
      main: globalStyles.light.primary,
    },
    secondary: {
      main: globalStyles.light.secondary,
    },
    accent: globalStyles.light.accent,
    navigation: {
      //for tabs, bottom bars, sidebars, header/footer icons
      default: globalStyles.light.background,
      selected: globalStyles.light.primary,
    },
    input: {
      primary: "#FFFFFF", // default from gluestack ui v2
      secondary: "#F0F0F0", // default from gluestack ui v2
      tertiary: "#E0E0E0", // default from gluestack ui v2
      neutral: "#D0D0D0", // default from gluestack ui v2
      success: "#C0C0C0", // default from gluestack ui v2
      false: "#B0B0B0", // default from gluestack ui v2
    }
  },
  dark: {
    text: globalStyles.dark.text,
    background: globalStyles.dark.background,
    primary: {
      main: globalStyles.dark.primary,
    },
    secondary: {
      main: globalStyles.dark.secondary,
    },
    accent: globalStyles.dark.accent,
    navigation: {
      //for tabs, bottom bars, sidebars, header/footer icons
      default: globalStyles.dark.background,
      selected: globalStyles.dark.primary,
    },
    input: {
      primary: "#303030", // default from gluestack ui v2
      secondary: "#404040", // default from gluestack ui v2
      tertiary: "#505050", // default from gluestack ui v2
      neutral: "#606060", // default from gluestack ui v2
      success: "#707070", // default from gluestack ui v2
      false: "#808080", // default from gluestack ui v2
    }
  },
};

export default Colors;
/**
 * A helper class to manage and retrieve theme-based color values.
 * 
 * @class ColorHelper
 * @param {string} [theme="light"] - The theme to use for color values. Defaults to "light".
 * 
 * @example
 * const colorHelper = new ColorHelper("dark");
 * const textColor = colorHelper.getTextColor(); // Retrieves the text color for the dark theme
 * const primaryColor = colorHelper.getPrimaryColor(); // Retrieves the primary color for the dark theme
 * const customColor = colorHelper.get("primary.light"); // Retrieves a custom color property
 * 
 * @property {string} theme - The current theme.
 * 
 * @method get
 * @param {string} propertyPath - The dot-separated path to the color property.
 * @returns {string|undefined} The color value or undefined if the property does not exist.
 * 
 * @method themeColors
 * @returns {Object} The colors object for the current theme.
 * 
 * @method getTextColor
 * @returns {string} The text color for the current theme.
 * 
 * @method getBackgroundColor
 * @returns {string} The background color for the current theme.
 * 
 * @method getPrimaryColor
 * @returns {string} The primary color for the current theme.
 * 
 * @method getSecondaryColor
 * @returns {string} The secondary color for the current theme.
 * 
 * @method getAccentColor
 * @returns {string} The accent color for the current theme.
 * 
 * @method getNavigationDefaultColor
 * @returns {string} The default navigation color for the current theme.
 * 
 * @method getNavigationSelectedColor
 * @returns {string} The selected navigation color for the current theme.
 */
class ColorHelper {
  constructor(theme = "light") {
    this.theme = theme;
  }
  get(propertyPath) {
    const properties = propertyPath.split(".");
    let value = Colors[this.theme];
    for (const property of properties) {
      value = value[property];
      if (value === undefined) {
        return undefined;
      }
    }
    return value;
  }

  get themeColors() {
    return Colors[this.theme];
  }
  getTextColor() {
    return Colors[this.theme].text;
  }

  getBackgroundColor() {
    return Colors[this.theme].background;
  }

  getPrimaryColor() {
    return Colors[this.theme].primary.main;
  }

  getSecondaryColor() {
    return Colors[this.theme].secondary.main;
  }

  getAccentColor() {
    return Colors[this.theme].accent;
  }

  getNavigationDefaultColor() {
    return Colors[this.theme].navigation.default;
  }

  getNavigationSelectedColor() {
    return Colors[this.theme].navigation.selected;
  }
}

export { ColorHelper };
