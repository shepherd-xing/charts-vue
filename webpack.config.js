const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
const {VueLoaderPlugin} = require('vue-loader')
module.exports = {
    entry: path.join(__dirname, './src/main.js'),
    output: {
        path: path.join(__dirname, './dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new htmlWebpackPlugin({
            template: path.join(__dirname, './src/index.html'),
            filename: 'index.html'
        }),
        new VueLoaderPlugin()
    ],
    module: {
        rules: [
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {test: /\.(jpg|gif|png|bmp|jpeg)$/, use: 'url-loader'},
            {test: /\.(ttf|eot|svg|woff|woff2)$/, use: 'url-loader'},
            {test: /\.js$/, use: 'babel-loader', exclude: /node_modules/},
            {test: /\.vue$/, use: 'vue-loader'}
        ]
    },
    resolve: {
        alias: {
            //'vue$': 'vue/dist/vue.js'
        }
    },
    devServer: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5000/api',
                changeOrigin: true,
                secure: false,
                pathRewrite: {
                    //'^/api': 'http://127.0.0.1:5000/api'
                    '^/api': ''
                }
            }
        }
    }
}