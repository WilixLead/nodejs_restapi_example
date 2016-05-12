/**
 * Created by Dmitry on 11.05.2016.
 */
'use strict';
const mongoose = require('mongoose');
const escapeHtml = require('escape-html');

let Schema = new mongoose.Schema({
    user_id: {type: String, required: true, ref: 'User'},
    text: {type: String, required: true},
    posted: {type: Date, required: true},
    parent: [{type: String, ref: 'Comment'}]
});

Schema.statics.escapeText = function(text) {
    // XXX We can add additional escapers/filters to here
    return escapeHtml(text.trim());
};

module.exports = mongoose.model('Comment', Schema);