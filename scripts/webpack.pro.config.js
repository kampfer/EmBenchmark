const config = require('./webpack.config');

let devConfig = Object.assign(config, {
    mode: 'production'
});

module.exports = devConfig;