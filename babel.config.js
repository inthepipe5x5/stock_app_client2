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
    ],
  };
};
