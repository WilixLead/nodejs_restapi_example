/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const Chance = require('chance');
const commentModel = require('./../../models/comment.js');

const chance = new Chance();

this.makePost = function(from_user, parent_id, text) {
    return {
        parent_id: parent_id || 0,
        text: (text || chance.paragraph()) + '_testcomment',
        access_token: from_user.access_token
    };
};

this.removeTestComments = function (callback) {
    commentModel.find({text: /_testcomment$/}).remove((err) => {
        if( !err ) {
            return callback(null, true);
        }
        return callback(err, false);
    })
};

module.exports = this;