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

describe('Users API', () => {
    let baseUrl = 'http://localhost:' + appConfig.server.port;
    let access_token = '';

    after((done) => {
        userHelper.testUserParams.access_token = access_token;
        done();
    });
    
    describe('Signup', () => {
        let url = baseUrl + '/user';

        // This function used for all variants of bad param request
        // be course all errors related of bad params return equal errors
        function signupUserBadParamCheck(body, done) {
            request(url)
                .post('/')
                .send(body)
                .end(function(err, res) {
                    if (err) {
                        throw err;
                    }
                    // this is should.js syntax, very clear
                    res.status.should.equal(200);

                    res.body.should.have.property('success');
                    res.body.success.should.equal(false);

                    res.body.should.have.property('error');
                    res.body.error.should.have.property('message');
                    res.body.error.message.should.equal(ErrorList.api.bad_params.message);
                    done();
                });
        }
        
        it('should create new user and return his profile', (done) => {
            let body = {
                email: userHelper.testUserParams.email,
                password: userHelper.testUserParams.password,
                title: userHelper.testUserParams.title
            };
            request(url)
                .post('/')
                .send(body)
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    // this is should.js syntax, very clear
                    res.status.should.equal(200);

                    res.body.should.have.property('success');
                    res.body.success.should.equal(true);

                    res.body.should.have.property('user');
                    res.body.user.should.have.property('_id');
                    done();
                });
        });
        it('should return duplicate error, user already exist', (done) => {
            let body = {
                email: userHelper.testUserParams.email,
                password: userHelper.testUserParams.password,
                title: userHelper.testUserParams.title
            };
            request(url)
                .post('/')
                .send(body)
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    res.status.should.equal(200);
                    res.body.should.have.property('success');
                    res.body.success.should.equal(false);
                    res.body.should.have.property('error');
                    res.body.error.should.have.property('message');
                    res.body.error.message.should.equal(ErrorList.api.users.already_exist.message);
                    done();
                });
        });
        it('should return error, not all params specified', (done) => {
            let body = {
                email: userHelper.testUserParams.email,
                password: '',
                title: userHelper.testUserParams.title
            };
            signupUserBadParamCheck(body, done);
        });
        it('should return error, all params not specified', (done) => {
            let body = {
                email: '',
                password: '',
                title: ''
            };
            signupUserBadParamCheck(body, done);
        });
        it('should return error, wrong email provided', (done) => {
            let body = {
                email: 'mywrongemail',
                password: 'abc',
                title: 'abcd'
            };
            signupUserBadParamCheck(body, done);
        });
        it('should return error, empty body provided', (done) => {
            signupUserBadParamCheck(null, done);
        });
        it('should return error, no title provided', (done) => {
            let body = {
                email: 'my@email.ee',
                password: 'abcder'
            };
            signupUserBadParamCheck(body, done);
        });
    });
    
    describe('Authenticate', () => {
        it('should return access_token', (done) => {
            let body = {
                email: userHelper.testUserParams.email,
                password: userHelper.testUserParams.password
            };
            request(baseUrl)
                .post('/auth')
                .send(body)
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    res.status.should.equal(200);
                    res.body.should.have.property('success');
                    res.body.should.have.property('access_token');
                    res.body.should.have.property('user');
                    res.body.success.should.equal(true);

                    access_token = res.body.access_token;
                    done();
                });
        });
        it('should return user data by access_token', (done) => {
            request(baseUrl)
                .get('/user?access_token=' + access_token)
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    res.status.should.equal(200);
                    res.body.should.have.property('success');
                    res.body.should.have.property('user');
                    res.body.success.should.equal(true);
                    done();
                });
        });
    });
});