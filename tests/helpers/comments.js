/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const Chance = require('chance');
const _ = require('lodash');
const commentModel = require('./../../models/comment.js');
const userModel = require('./../../models/user.js');

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

this.getTopSpeakersIds = function(callback) {
    userModel.find({}).exec((err, users) => {
        commentModel.find({}).exec((err, docs) => {
            if( err ) {
                return callback(err);
            }
            let userIdCommentCount = {};
            docs.forEach((comment) => {
                let user_id = comment.user_id.toString();
                if( !userIdCommentCount[user_id] ) {
                    userIdCommentCount[user_id] = 0;
                }
                userIdCommentCount[user_id]++;
            });
            users.forEach((user) => {
                let user_id = user._id.toString();
                if( userIdCommentCount[user_id] == undefined ) {
                    userIdCommentCount[user_id] = 0;
                }
            });
            
            let tops = [];
            _.each(userIdCommentCount, (count, user_id) => {
                tops.push({user_id: user_id, comment_count: count});
            });
            tops = _.sortBy(tops, 'comment_count').reverse();
            return callback(null, tops);
        });
    });
};

module.exports = this;