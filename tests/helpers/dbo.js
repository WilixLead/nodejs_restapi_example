/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const mongoose = require('mongoose');
const appConfig = require('./../../config/config.js');

this.connect = function(callback) {
    if( !mongoose.isConnected ) {
        mongoose.connect(appConfig.server.dboString);
    }
    mongoose.connection.on('connected', function(){
        callback(null);
    });
};

module.exports = this;