module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
        },
      ],
      '@babel/preset-typescript',
      "nativewind/babel",
    ],

    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],

          alias: {
            "@": "./",
            "@screens": "./screens",
            "@gs": "./components/ui",
            "tailwind.config": "./tailwind.config.js",
          },
        },
      ],
      'react-native-reanimated/plugin', //ensure this is last
    ],
    sourceMaps: true, // Enable source maps for better debugging
    comments: false, // Disable comments in the output code
  };
};
