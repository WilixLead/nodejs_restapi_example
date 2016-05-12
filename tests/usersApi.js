/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const should = require('should');
const assert = require('assert');
const request = require('supertest');

const apiHelper = require('./helpers/api.js');
const appConfig = require('./../config/config.js');
const ErrorList = require('./../helpers/APIError.js').list;
const userHelper = require('./helpers/users.js');

describe('Users API', () => {
    let baseUrl = 'http://localhost:' + appConfig.server.port;
    let access_token = '';
    let activationCode = '';
    
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
                    apiHelper.checkError(res, ErrorList.api.bad_params);
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
                    apiHelper.checkSuccessPart(res);
                    res.body.should.have.property('user');
                    res.body.user.should.have.property('_id');
                    
                    activationCode = res.body.activationCode;
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
                    apiHelper.checkError(res, ErrorList.api.users.already_exist);
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
    
    describe('Activate user', () => {
        let url = baseUrl + '/user/activate_user';

        it('should return error, activation code not provided', (done) => {
            request(url)
                .get('/')
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    apiHelper.checkError(res, ErrorList.api.bad_params);
                    done();
                });
        });
        it('should activate user by code and return his profile', (done) => {
            request(url)
                .get('/?activation_code=' + activationCode)
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    apiHelper.checkSuccessPart(res);
                    res.body.should.have.property('user');
                    res.body.user.should.have.property('_id');
                    done();
                });
        });
        it('should return already activated error', (done) => {
            request(url)
                .get('/?activation_code=' + activationCode)
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    apiHelper.checkError(res, ErrorList.api.users.already_activated);
                    done();
                });
        });
        it('should return user not found error', (done) => {
            request(url)
                .get('/?activation_code=veryWrongActivationCode')
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    apiHelper.checkError(res, ErrorList.api.users.not_found);
                    done();
                });
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
                    apiHelper.checkSuccessPart(res);
                    res.body.should.have.property('access_token');
                    res.body.should.have.property('user');

                    userHelper.testUserParams.access_token = res.body.access_token;
                    done();
                });
        });
        it('should return user not found error', (done) => {
            let body = {
                email: 'something',
                password: 'something2'
            };
            request(baseUrl)
                .post('/auth')
                .send(body)
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    apiHelper.checkError(res, ErrorList.api.users.not_found);
                    done();
                });
        });
        it('should return user data by access_token', (done) => {
            request(baseUrl)
                .get('/user?access_token=' + userHelper.testUserParams.access_token)
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    apiHelper.checkSuccessPart(res);
                    res.body.should.have.property('user');
                    res.body.user.should.have.property('_id');
                    
                    userHelper.testUserParams._id = res.body.user._id;
                    done();
                });
        });
        it('should return not_authenticated error, wrong access_token provided', (done) => {
            request(baseUrl)
                .get('/user?access_token=c78hrh63487crh634c6_wrong')
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    apiHelper.checkError(res, ErrorList.api.users.not_authenticated);
                    done();
                });
        });
        it('should return not_active error', (done) => {
            userHelper.deactivateUser(userHelper.testUserParams._id, (err) => {
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
                        apiHelper.checkError(res, ErrorList.api.users.not_active);
                        done();
                    });
            });
        });
        it('should return bad_params error', (done) => {
            let body = {
                email: '',
                password: ''
            };
            request(baseUrl)
                .post('/auth')
                .send(body)
                .end((err, res) => {
                    if (err) {
                        throw err;
                    }
                    apiHelper.checkError(res, ErrorList.api.bad_params);
                    done();
                });
        });
    });
});