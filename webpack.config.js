const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const EslintPlugin = require('eslint-webpack-plugin');

module.exports = ({ mode }) => {
  const isProductionMode = mode === 'prod';

  const config = {
    entry: path.resolve(__dirname, './src/index'),
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.ts$/i,
          use: 'ts-loader',
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[contenthash].[ext]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.ts'],
    },
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: 'index.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './src/index.html'),
        filename: 'index.html',
        favicon: './src/images/icon.png',
      }),
      new CleanWebpackPlugin(),
      new EslintPlugin({ extensions: 'ts' }),
    ],
  };

  if (!isProductionMode) {
    config.devtool = 'inline-source-map';
    config.devServer = {
      static: {
        directory: path.join(__dirname, '../dist'),
      },
    };
  }

  return config;
};
