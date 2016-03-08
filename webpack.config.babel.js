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
const isProd = process.argv.indexOf('-p') !== -1;
const jsFilename = isProd ? '[name].[chunkhash].js' : '[name].js';
const cssFilename = isProd ? '[name].[chunkhash].css' : '[name].css';

export default {
  entry: {
    app: `${srcDir}/index.js`
  },
  output: {
    path: distDir,
    filename: jsFilename,
    chunkFilename: jsFilename
  },
  module: {
    preLoaders: [{
      test: /\.js/,
      include: srcDir,
      loader: 'eslint'
    }],
    loaders: [{
      test: /worker\.js$/,
      include: srcDir,
      loader: `worker-loader?name=${jsFilename}`
    }, {
      test: /\.js?/,
      include: srcDir,
      loader: 'babel'
    }, {
      test: /\.css$/,
      include: srcDir,
      loader: ExtractTextPlugin.extract(
        'style-loader',
        'css-loader!postcss-loader'
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
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify((isProd) ? 'production' : 'development')
      }
    }),
    new HtmlWebpackPlugin({
      template: path.join(srcDir, 'index.html'),
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    new ExtractTextPlugin(cssFilename, {
      allChunks: true
    })
  ],
  devServer: {
    port: 3000,
    noInfo: true
  }
};
