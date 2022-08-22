const path = require('path')
const {merge} = require('webpack-merge')
const { DefinePlugin } = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')

const baseConfig = require('./webpack.base')

const ENV = process.env.NODE_ENV
const isDev = ENV === 'dev'

module.exports = merge(baseConfig, {
  mode: 'production',
  devtool: isDev ? 'cheap-eval-source-map' : false,
  output: {
    filename: '[name].[hash].bundle.js',
    chunkFilename: '[name].[chunkhash].js',
    publicPath: '/klaytn-online-toolkit/',
    path: path.resolve(__dirname, 'build'),
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
        ],
      },
      {
        test: /\.(jpg|jpeg|gif|png|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            includePaths: [path.resolve(__dirname, 'src')],
          }
        }
      }
    ],
  },
  node:{
    fs: 'empty',
   },
  plugins: [
    new CleanWebpackPlugin('build', { root: __dirname }),
    new OptimizeCssAssetsPlugin(),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'public'),
      to: path.resolve(__dirname, 'build'),
      ignore: ['*.ejs'],
    }]),
    new DefinePlugin({
      DEV: false,
      'process.env.NODE_ENV': JSON.stringify('production'),
      "process.env": JSON.stringify(process.env)
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'public/index.html'),
      inject: true,
      title: 'Klaytnscope',
      origin: process.env.SERVICE_URL,
      chunksSortMode: 'dependency',
      hash: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'bundle.[chunkHash].css',
      chunkFilename: 'bundle.[chunkHash].css',
    }),
    new CompressionPlugin({
      filename: '[file].gz',
      algorithm: 'gzip',
    }),
  ],
  optimization: {
    splitChunks: {
      automaticNameDelimiter: '~',
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          name: 'vendor',
          enforce: true,
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
})
