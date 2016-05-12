/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const should = require('should');
const assert = require('assert');
const request = require('supertest');

const appConfig = require('./../config/config.js');
const ErrorList = require('./../helpers/APIError.js').list;
const apiHelper = require('./helpers/api.js');
const userHelper = require('./helpers/users.js');
const commentHelper = require('./helpers/comments.js');

describe('Comments API', function () {
    let baseUrl = 'http://localhost:' + appConfig.server.port;
    let someUsers = [];
    let parentComment = null;
    let parentParentComment = null;
    
    // Need access token for work
    before((done) => {
        userHelper.makeSomeUsers(3, (err, users) => {
            if( err ) {
                throw new Error(err);
            }
            someUsers = users;
            done();
        });
    });
    
    it('should create new comment and return his object', function (done) {
        let body = commentHelper.makePost(someUsers[0]);
        request(baseUrl)
            .post('/comment')
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                apiHelper.checkSuccessPart(res);
                res.body.should.have.property('comment');
                res.body.comment.should.have.property('_id');
                parentComment = res.body.comment;
                done();
            });
    });
    it('should create new comment as sub-comment', function (done) {
        let body = commentHelper.makePost(someUsers[1], parentComment._id);
        request(baseUrl)
            .post('/comment')
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                apiHelper.checkSuccessPart(res);
                res.body.should.have.property('comment');
                res.body.comment.should.have.property('_id');
                res.body.comment.should.have.property('parent_id');
                res.body.comment._id.should.not.equal(parentComment._id);
                res.body.comment.parent_id.should.equal(parentComment._id);
                parentParentComment = res.body.comment;
                done();
            });
    });
    it('should create new comment as sub-sub-comment', function (done) {
        let body = commentHelper.makePost(someUsers[2], parentParentComment._id);
        request(baseUrl)
            .post('/comment')
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                apiHelper.checkSuccessPart(res);
                res.body.should.have.property('comment');
                res.body.comment.should.have.property('_id');
                res.body.comment.should.have.property('parent_id');
                res.body.comment._id.should.not.equal(parentParentComment._id);
                res.body.comment.parent_id.should.equal(parentParentComment._id);
                done();
            });
    });
    it('should create new comment as sub-sub-comment from another user', function (done) {
        let body = commentHelper.makePost(someUsers[1], parentParentComment._id);
        request(baseUrl)
            .post('/comment')
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                apiHelper.checkSuccessPart(res);
                res.body.should.have.property('comment');
                res.body.comment.should.have.property('_id');
                res.body.comment.should.have.property('parent_id');
                res.body.comment._id.should.not.equal(parentParentComment._id);
                res.body.comment.parent_id.should.equal(parentParentComment._id);
                done();
            });
    });
    it('should return parent comment not found, provided unreal id', function (done) {
        let body = commentHelper.makePost(someUsers[0], 'unreal_parent_id');
        request(baseUrl)
            .post('/comment')
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                apiHelper.checkError(res, ErrorList.api.comments.parent_comment_not_found);
                done();
            });
    });
    it('should return error, be course parent comment not found', function (done) {
        let body = commentHelper.makePost(someUsers[0], '5733a7c1756dc15c832c75a6');
        request(baseUrl)
            .post('/comment')
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                apiHelper.checkError(res, ErrorList.api.comments.parent_comment_not_found);
                done();
            });
    });
    it('should return bad_params error', function (done) {
        let body = commentHelper.makePost(someUsers[1]);
        body.text = '';
        request(baseUrl)
            .post('/comment')
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                apiHelper.checkError(res, ErrorList.api.bad_params);
                done();
            });
    });
    it('should return empty_or_bad_characters error', function (done) {
        let body = commentHelper.makePost(someUsers[1]);
        body.text = ' ';
        request(baseUrl)
            .post('/comment')
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                apiHelper.checkError(res, ErrorList.api.comments.empty_or_bad_characters);
                done();
            });
    });
    it('should return access_token error', function (done) {
        let body = commentHelper.makePost(someUsers[0]);
        delete body.access_token;
        request(baseUrl)
            .post('/comment')
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                apiHelper.checkError(res, ErrorList.api.users.no_access_token);
                done();
            });
    });
    it('should return flat comment list', function (done) {
        request(baseUrl)
            .get('/comment?access_token=' + someUsers[0].access_token)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                apiHelper.checkSuccessPart(res);
                res.body.should.have.property('comments');
                done();
            });
    });
    it('should return tree of comments', function (done) {
        request(baseUrl)
            .get('/comment?tree_view=true&access_token=' + someUsers[0].access_token)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                apiHelper.checkSuccessPart(res);
                res.body.should.have.property('comments');
                done();
            });
    });
    it('should return activation error after manual change user is_active state', function (done) {
        userHelper.deactivateUser(someUsers[0]._id, (err) => {
            if( err ) {
                throw new Error(err);
            }
            let body = commentHelper.makePost(someUsers[0]);
            request(baseUrl)
                .post('/comment')
                .send(body)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    apiHelper.checkError(res, ErrorList.api.users.not_active);
                    done();
                });
        });
    });
});