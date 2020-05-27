const path = require('path');

module.exports = {
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-transform-runtime'],
                cacheDirectory: true
            }
        }, {
            test: /\.(less|css)$/i,
            use: [
                'style-loader',
                'css-loader',
                'less-loader'
            ],
        }, {
            test: /\.(png|jpg|gif)$/i,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                    },
                },
            ],
        }]
    },
    entry: path.join(__dirname, '../src/index.js'),
    output: {
        filename: 'EmBenchmark.js',
        path: path.join(__dirname, '../build'),
        library: 'EmBenchmark',
        libraryTarget: 'umd'
    }
};