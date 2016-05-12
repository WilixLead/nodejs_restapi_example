/**
 * Created by Dmitry on 11.05.2016.
 */
'use strict';
const mongoose = require('mongoose');
const escapeHtml = require('escape-html');

let Schema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    text: {type: String, required: true},
    posted: {type: Date, required: true},
    parent: [{type: String, ref: 'Comment'}]
});

Schema.methods.toPublic = function() {
    let obj = this.toObject();
    delete obj['__v'];
    return obj;
};

Schema.statics.escapeText = function(text) {
    // XXX We can add additional escapers/filters to here
    return escapeHtml(text.trim());
};

module.exports = mongoose.model('Comment', Schema);