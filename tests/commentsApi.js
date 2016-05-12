/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const should = require('should');
const assert = require('assert');
const request = require('supertest');

const appConfig = require('./../config/config.js');
const ErrorList = require('./../helpers/APIError.js').list;
const userHelper = require('./helpers/users.js');
const commentHelper = require('./helpers/comments.js');

describe('Comments API', function () {
    let baseUrl = 'http://localhost:' + appConfig.server.port;
    let access_token = userHelper.testUserParams.access_token;
    let parentComment = null;
    let parentParentComment = null;
    
    it('should create new comment and return his object', function (done) {
        let body = commentHelper.makePost();
        body.access_token = access_token;
        request(baseUrl)
            .post('/comment?access_token=' + access_token)
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                res.status.should.equal(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                res.body.should.have.property('comment');
                res.body.comment.should.have.property('_id');
                parentComment = res.body.comment;
                done();
            });
    });
    it('should create new comment as sub-comment', function (done) {
        let body = commentHelper.makePost(parentComment._id);
        body.access_token = access_token;
        request(baseUrl)
            .post('/comment?access_token=' + access_token)
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                res.status.should.equal(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
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
        let body = commentHelper.makePost(parentParentComment._id);
        body.access_token = access_token;
        request(baseUrl)
            .post('/comment')
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                res.status.should.equal(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                res.body.should.have.property('comment');
                res.body.comment.should.have.property('_id');
                res.body.comment.should.have.property('parent_id');
                res.body.comment._id.should.not.equal(parentParentComment._id);
                res.body.comment.parent_id.should.equal(parentParentComment._id);
                
                done();
            });
    });
    it('should return access_token error', function (done) {
        let body = commentHelper.makePost();
        request(baseUrl)
            .post('/comment')
            .send(body)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                res.status.should.equal(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(false);
                res.body.should.have.property('error');
                res.body.error.should.have.property('message');
                res.body.error.message.should.equal(ErrorList.api.users.no_access_token.message);
                
                done();
            });
    });
    it('should return flat comment list', function (done) {
        request(baseUrl)
            .get('/comment?access_token=' + access_token)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                res.status.should.equal(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                res.body.should.have.property('comments');

                done();
            });
    });
    it('should return tree of comments', function (done) {
        request(baseUrl)
            .get('/comment?tree_view=true&access_token=' + access_token)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                res.status.should.equal(200);
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                res.body.should.have.property('comments');

                done();
            });
    });
});