/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const wextManifest = require('wext-manifest');
const ZipPlugin = require('zip-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteWebpackPlugin = require('write-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const manifestInput = require('./source/manifest');

const viewsPath = path.join(__dirname, 'views');
const sourcePath = path.join(__dirname, 'source');
const destPath = path.join(__dirname, 'extension');
const nodeEnv = process.env.NODE_ENV || 'development';
const targetBrowser = process.env.TARGET_BROWSER;
const manifest = wextManifest[targetBrowser](manifestInput);

const extensionReloaderPlugin =
  nodeEnv === 'development'
    ? new ExtensionReloader({
        port: 9090,
        reloadPage: true,
        entries: {
          // TODO: reload manifest on update
          contentScript: 'contentScript',
          background: 'background',
          extensionPage: ['popup', 'options', 'reader'],
        },
      })
    : () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.apply = () => {};
      };

const getExtensionFileType = (browser) => {
  if (browser === 'opera') {
    return 'crx';
  }

  if (browser === 'firefox') {
    return 'xpi';
  }

  return 'zip';
};

module.exports = {
  mode: nodeEnv,

  entry: {
    background: path.join(sourcePath, 'background', 'index.ts'),
    contentScript: path.join(sourcePath, 'content', 'index.ts'),
    popup: path.join(sourcePath, 'popup', 'index.tsx'),
    options: path.join(sourcePath, 'options', 'index.tsx'),
    reader: path.join(sourcePath, 'reader', 'index.tsx'),
  },

  output: {
    filename: 'js/[name].bundle.js',
    path: path.join(destPath, targetBrowser),
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.mjs'],
    alias: {
      'webextension-polyfill-ts': path.resolve(path.join(__dirname, 'node_modules', 'webextension-polyfill-ts')),
    },
  },

  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.(js|ts)x?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, // It creates a CSS file per JS file which contains CSS
          },
          {
            loader: 'css-loader', // Takes the CSS files and returns the CSS with imports and url(...) for Webpack
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader', // For autoprefixer
            options: {
              ident: 'postcss',
              // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
              plugins: [require('autoprefixer')()],
            },
          },
          'resolve-url-loader', // Rewrites relative paths in url() statements
          'sass-loader', // Takes the Sass/SCSS file and compiles to the CSS
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true,
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    // environmental variables
    new webpack.EnvironmentPlugin(['NODE_ENV', 'TARGET_BROWSER']),
    // delete previous build files
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        path.join(process.cwd(), `extension/${targetBrowser}`),
        path.join(process.cwd(), `extension/${targetBrowser}.${getExtensionFileType(targetBrowser)}`),
      ],
      cleanStaleWebpackAssets: false,
      verbose: true,
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, 'popup.html'),
      inject: 'body',
      chunks: ['popup'],
      filename: 'popup.html',
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, 'options.html'),
      inject: 'body',
      chunks: ['options'],
      filename: 'options.html',
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, 'reader.html'),
      inject: 'body',
      chunks: ['reader'],
      filename: 'reader.html',
    }),
    // write css file(s) to build folder
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
    // copy static assets
    new CopyWebpackPlugin([{ from: 'source/assets', to: 'assets' }]),
    // write manifest.json
    new WriteWebpackPlugin([{ name: manifest.name, data: Buffer.from(manifest.content) }]),
    // plugin to enable browser reloading in development mode
    extensionReloaderPlugin,
  ],

  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
      }),
      new ZipPlugin({
        path: destPath,
        extension: `${getExtensionFileType(targetBrowser)}`,
        filename: `${targetBrowser}`,
      }),
    ],
  },
};
