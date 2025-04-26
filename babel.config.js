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
      ['@babel/preset-env', { targets: { node: 'current' } }],
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
    ],
  };
};
