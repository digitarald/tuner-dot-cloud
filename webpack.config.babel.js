import path from 'path';

import webpack from 'webpack';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const srcDir = path.resolve(__dirname, 'src');
const distDir = path.resolve(__dirname, 'dist');
const isProd = process.argv.indexOf('-p') !== -1;
const jsFilename = isProd ? '[name].[chunkhash:6].js' : '[name].js';
const cssFilename = isProd ? '[name].[chunkhash:6].css' : '[name].css';

export default {
  context: srcDir,
  entry: {
    app: './index.js',
    vendor: ['wolfy87-eventemitter', 'd3-shape', 'd3-scale'],
    polyfill: ['md-gum-polyfill']
  },
  devtool: '#source-map',
  output: {
    path: distDir,
    filename: jsFilename,
    chunkFilename: jsFilename
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(isProd ? 'production' : 'development')
      }
    }),
    new HtmlWebpackPlugin({
      template: path.join(srcDir, 'index.html'),
      inject: true,
      favicon: path.join(srcDir, 'icons', 'favicon.ico'),
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    new MiniCssExtractPlugin(cssFilename),
    new CopyWebpackPlugin(
        [path.join(srcDir, 'manifest.json')])
  ],
  module: {
    rules: [
      {
        test: /worker\.js$/,
        include: srcDir,
        loader: `worker-loader?name=${jsFilename}`
      },
      {
        test: /\.js$/,
        include: srcDir,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        include: srcDir,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.png$/,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              optimizationLevel: 7,
              interlaced: false
            }
          }
        ]
      }
    ]
  },
  devServer: {
    port: 3000,
    compress: true,
    noInfo: true
  }
};
