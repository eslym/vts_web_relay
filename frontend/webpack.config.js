const path = require('path');
const Copy = require('copy-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
    mode: mode,
    entry: './src/web/main.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@pixijs-live2d': path.resolve(__dirname, './pixijs-live2d/src'),
            '@cubism-framework': path.resolve(__dirname, './pixijs-live2d/cubism-sdk/Framework/dist'),
        }
    },
    plugins: [
        new Copy([{
            from: 'pixijs-live2d/cubism-sdk/Core/*.js',
            to: '[name].[ext]',
        }])
    ],
    output: { filename: mode == 'production' ? 'bundle.min.js' : 'bundle.js' }
};