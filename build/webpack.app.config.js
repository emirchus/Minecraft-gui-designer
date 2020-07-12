const path = require("path");
const merge = require("webpack-merge");
const base = require("./webpack.base.config");

module.exports = env => {
  return merge(base(env), {
    entry: {
      background: "./src/background.js",
      app: "./src/app.js",
      canvas: "./src/canvas.js",
      tools: "./src/utils/tools.js",
      paint: "./src/paint/paint.js",
      paint: "./src/paint/Box.js",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "../app")
    }
  });
};
