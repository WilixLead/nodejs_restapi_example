/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const fs = require('fs');
const _ = require('lodash');

let config = {
    name: 'default',
    server: {
        port: 8000,
        extendedErrors: false,
        logErrors: ['api', 'system'],
        dboString: 'mongodb://localhost/test_task',
        cookie: {
            secret: 'super_secret',
            secure: false,
            httpOnly: false
        }
    }
};

if( fs.accessSync(__dirname + '/local.config.js', fs.R_OK) === undefined ) {
    console.info('Loading local configuration');
    _.merge(config, require(__dirname + '/local.config.js'));
} else {
    /* istanbul ignore next */
    console.info('Loading default configuration');
}

module.exports = config;