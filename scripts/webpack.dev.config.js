const config = require('./webpack.config');

let devConfig = Object.assign(config, {
    mode: 'development'
});

module.exports = devConfig;