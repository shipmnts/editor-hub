const path = require("path");
// const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
module.exports = {
  mode: "production", // Change to 'development' if you want development mode
  entry: "./index.js", // Entry point of your library
  output: {
    path: path.resolve(__dirname, "dist"), // Output directory
    filename: "index.js", // Output file name
    libraryTarget: "umd", // Universal Module Definition
    library: "bob", // Name of your library
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile JavaScript files
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // Use babel-loader for transpiling
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"], // Presets for babel
          },
        },
      },
      {
        test: /\.jsx$/, // Transpile JSX files
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // Use babel-loader for transpiling
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"], // Presets for babel
          },
        },
      },

      {
        test: /\.scss$/,
        use: [
          // MiniCssExtractPlugin.loader,
          "css-loader",
          "resolve-url-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
              sourceMapContents: false,
            },
          },
        ],
      },
      {
        test: /\.(jpg|png|gif)$/i,
        include: /src/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
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
          options: {
            presets: [
              [
                "@babel/env",
                {
                  targets: {
                    browsers: [
                      "last 2 Chrome major versions",
                      "last 2 Firefox major versions",
                      "last 2 Safari major versions",
                      "last 2 Edge major versions",
                      "last 2 iOS major versions",
                      "last 2 ChromeAndroid major versions",
                    ],
                  },
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(ts|tsx)$/, // Transpile TypeScript files
        exclude: /node_modules/,
        use: {
          loader: "ts-loader", // Use ts-loader for transpiling TypeScript
        },
      },
      {
        test: /\.(html|svg)$/,
        use: [
          {
            loader: "html-loader",
            options: {
              minimize: true,
            },
          },
        ],
      },
    ],
  },
  externals: {
    react: "react", // Do not bundle React
    "react-dom": "react-dom", // Do not bundle ReactDOM
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts"], // Resolve .js and .jsx extensions
  },
};
