/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const crypto = require('crypto');
const mongoose = require('mongoose');
const emailValidator = require('email-validator'); 

let Schema = new mongoose.Schema({
    email: {type: String, index: {unique: true}, required: true},
    password: {type: String, required: true},
    title: {type: String, required: true},
    registered: {type: Date, required: true},
    is_active: {type: Boolean, default: false},
    activation_code: {type: String, default: ''}
});

Schema.methods.toPublic = function () {
    let obj = this.toObject();
    delete obj.password;
    delete obj.activation_code;
    return obj;
};

Schema.methods.genActivationCode = function() {
    const str = this._id + this.email;
    const code = crypto.createHash('md5').update(str).digest('hex');
    this.activation_code = code;
    this.save();
    return code;
};

Schema.statics.hashPwd = function (pwdStr) {
    return crypto.createHash('md5').update(pwdStr).digest('hex');
};

Schema.statics.validateInput = function(obj) {
    if( !obj || typeof obj != 'object') {
        return false;
    } else if( !obj.email || typeof obj.email != 'string' || obj.email.length < 2 ) {
        return false;
    } else if( !emailValidator.validate(obj.email) ) {
        return false;
    } else if( !obj.password || typeof obj.password != 'string' || obj.password.length < 2 ) {
        return false;
    } else if( !obj.title || typeof obj.title != 'string' || obj.title.length < 1 ) {
        return false;
    } else {
        return true;
    }
};

module.exports = mongoose.model('User', Schema);