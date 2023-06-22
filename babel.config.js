module.exports = {
  presets: [
    [
      // eslint-disable-next-line quotes
      "@babel/preset-env",
      {
        targets: {
          // eslint-disable-next-line quotes
          node: "current",
        },
      },
    ],
  ],
};
