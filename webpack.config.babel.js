import path from 'path';

import webpack from 'webpack';

import postcssCssnext from 'postcss-cssnext';
import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import postcssReporter from 'postcss-reporter';
import postcssSimpleExtend from 'postcss-simple-extend';
import postcssSimpleVars from 'postcss-simple-vars';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const srcDir = path.resolve(__dirname, 'src');
const distDir = path.resolve(__dirname, 'dist');
const cssName = 'localIdentName=[name]__[local]___[hash:base64:5]';

export default {
  entry: {
    app: `${srcDir}/index.js`
  },
  output: {
    path: distDir,
    filename: 'app.js'
  },
  cache: true,
  module: {
    preLoaders: [{
      test: /\.js/,
      include: srcDir,
      loader: 'eslint'
    }],
    loaders: [{
      test: /\.js?/,
      include: srcDir,
      loader: 'babel'
    }, {
      test: /\.css$/,
      include: srcDir,
      loader: ExtractTextPlugin.extract(
        'style-loader',
        `css-loader?modules&importLoaders=1&${cssName}!postcss-loader`
      )
    }
    ]
  },
  postcss: [
    postcssImport(),
    postcssSimpleExtend(),
    postcssNested(),
    postcssSimpleVars(),
    postcssCssnext({
      browsers: ['last 1 version']
    }),
    postcssReporter({
      throwError: true
    })
  ],
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(srcDir, 'index.html'),
      minify: {
        collapseWhitespace: true,
        removeRedundantAttributes: true
      },
      inject: true
    }),
    new ExtractTextPlugin('app.css', {
      allChunks: true
    }),
    new webpack.optimize.DedupePlugin()
  ],
  devServer: {
    port: 3000,
    noInfo: true
  }
};
