/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const Chance = require('chance');
const userModel = require('./../../models/user.js');

const chance = new Chance();

this.makePost = function(from_user, parent_id, text) {
    return {
        parent_id: parent_id || 0,
        text: text || chance.paragraph(),
        access_token: from_user.access_token
    };
};

module.exports = this;