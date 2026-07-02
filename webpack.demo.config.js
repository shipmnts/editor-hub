const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const baseConfig = require("./webpack.config.js");

module.exports = {
  ...baseConfig,
  mode: "development",
  entry: "./demo/index.jsx",
  output: {
    path: path.resolve(__dirname, "demo-dist"),
    filename: "demo.js",
  },
  externals: {}, // bundle react for the demo
  plugins: [
    new HtmlWebpackPlugin({ template: "./demo/index.html" }),
  ],
  devServer: {
    port: 8080,
  },
};
