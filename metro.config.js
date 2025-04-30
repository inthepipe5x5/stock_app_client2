const {
  withNativeWind: withNativeWind
} = require("nativewind/metro");

const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = wrapWithReanimatedMetroConfig(withNativeWind(config, {
  input: "./global.css"
}));