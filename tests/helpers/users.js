/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const userModel = require('./../../models/user.js');

this.testUserParams = {
    email: 'testuser@testdomain.com',
    password: 'qwerty123',
    title: 'Iam Test User',
    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzMzNTc3NDJhNDQ4N2M4NTdjZDc0N2MiLCJyZWdpc3RlcmVkIjoiMjAxNi0wNS0xMVQxNjowMTo1Ni40NTJaIiwiZW1haWwiOiJ0ZXN0dXNlckB0ZXN0ZG9tYWluLmNvbSIsInRpdGxlIjoiSWFtIFRlc3QgVXNlciIsIl9fdiI6MCwiaXNfYWN0aXZlIjpmYWxzZSwiaWF0IjoxNDYyOTgyNTc0LCJleHAiOjE0NjMxNTUzNzR9.Z4qp0ezCWa1XZX4cSwY7U1nCGygwfqaitIv5td9wryc' 
};

this.createTestUser = function(callback) {
    userModel.findOne({email: this.testUserParams.username}, function(err, user) {
        if( !user ) {
            user = new userModel(this.testUserParams);
        }
        user.password = userModel.hashPwd(this.testUserParams.password);
        user.save(callback);
    })
};

this.removeTestUser = function(callback) {
    userModel.findOneAndRemove({email: this.testUserParams.email}, function(err, doc) {
        if( !err && doc ) {
            return callback(null, true);
        }
        return callback(err, false);
    })
};

module.exports = this;