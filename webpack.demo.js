const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Demo bundle: mirrors the loader setup of webpack.config.js (so Quill, the
// emoji scss/png assets, and the TypeScript `modules/main` resolve the same
// way), but builds the demo app entry and serves it via HtmlWebpackPlugin.
module.exports = {
  mode: "development",
  entry: "./src/template/demo/demo.jsx",
  output: {
    path: path.resolve(__dirname, "demo-dist"),
    filename: "demo.bundle.js",
  },
  resolve: { extensions: [".js", ".jsx", ".ts"] },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: { presets: ["@babel/preset-env", "@babel/preset-react"] },
        },
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "resolve-url-loader",
          {
            loader: "sass-loader",
            options: { sourceMap: true, sourceMapContents: false },
          },
        ],
      },
      {
        test: /\.(jpg|png|gif)$/i,
        use: [{ loader: "url-loader", options: { limit: 8192 } }],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        include: [
          path.resolve(__dirname, "src/"),
          /\/node_modules\/quill-emoji/,
          /\/node_modules\/parchment/,
        ],
        use: {
          loader: "babel-loader",
          options: { presets: ["@babel/env"] },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: { loader: "ts-loader" },
      },
      {
        test: /\.svg$/,
        use: [{ loader: "html-loader", options: { minimize: true } }],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/template/demo/index.html" }),
  ],
  devServer: { open: true, port: 8081 },
};
