/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const Chance = require('chance');
const async = require('async');
const userModel = require('./../../models/user.js');
const authHelper = require('./../../helpers/authMiddleware.js');

const chance = new Chance();

this.testUserParams = {
    email: 'test_testuser@testdomain.com',
    password: 'qwerty123',
    title: 'Iam Test User',
    access_token: '' 
};

this.createTestUser = function(callback) {
    userModel.findOne({email: this.testUserParams.username}, (err, user) => {
        if( !user ) {
            user = new userModel(this.testUserParams);
        }
        user.password = userModel.hashPwd(this.testUserParams.password);
        user.save(callback);
    })
};

this.makeSomeUsers = function(count, callback) {
    let queue = [];
    for( let i = 0; i < count; i++ ) {
        queue.push((done) => {
            let params = {
                email: 'test_' + chance.email(),
                password: userModel.hashPwd(chance.string({length: 5})),
                title: chance.name(),
                is_active: true,
                registered: new Date()
            };
            let newUser = new userModel(params);
            newUser.save((err) => {
                newUser = newUser.toPublic();
                newUser.access_token = authHelper.makeToken(newUser);
                done(err, newUser);
            });
        });
    }
    async.parallel(queue, callback);
};

this.deactivateUser = function(user_id, callback) {
    userModel.findById(user_id, (err, user) => {
        if( err ) {
            callback(err);
        }
        user.is_active = false;
        user.save(callback);
    });
};

this.removeTestUsers = function(callback) {
    userModel.find({email: /^test_/}).remove((err) => {
        if( !err ) {
            return callback(null, true);
        }
        return callback(err, false);
    });
};

module.exports = this;