const config = require('./webpack.config');
const path = require('path');

let devConfig = Object.assign(config, {
    mode: 'development',
    entry: path.join(__dirname, '../src/index.js'),
    output: {
        filename: 'EmBenchmark.js',
        path: path.join(__dirname, '../build'),
        library: 'EmBenchmark',
        libraryTarget: 'umd'
    }
});

module.exports = devConfig;