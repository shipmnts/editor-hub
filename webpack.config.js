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
  watchOptions: {
    aggregateTimeout: 300, // Delay before rebuilding (in ms)
    poll: 1000,            // Use polling for file changes (in ms)
    ignored: /node_modules/ // Ignore node_modules to improve performance
  },
  module: {
    rules: [
      {
        // Quill's source mixes `import` with `module.exports` here (its own build
        // runs Babel). Webpack makes `exports` read-only in an ES module, so the
        // bundle throws on load unless this file is compiled to CommonJS first.
        test: path.resolve(__dirname, "node_modules/quill/ui/icons.js"),
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            configFile: false,
            presets: [["@babel/preset-env", { modules: "commonjs", targets: { esmodules: true } }]],
          },
        },
      },
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
    // quill 2.0.0-dev.3's main is a webpack dev build with one eval() per module,
    // which needs 'unsafe-eval' in the apps' CSP. Build Quill from its source instead.
    alias: { quill$: path.resolve(__dirname, "node_modules/quill/quill.js") },
  },
};
