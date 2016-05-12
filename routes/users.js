/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const router = require('express').Router();

const APIErrors = require('./../helpers/APIError.js');
const authHelper = require('./../helpers/authMiddleware.js');
const userModel = require('./../models/user.js');

/**
 * @api {get} /user Get user information
 * @apiName UserGet
 * @apiGroup User
 * @apiPermission user
 *
 * @apiParam {String} access_token User auth token for permit access
 *
 * @apiSuccess {Boolean} success
 * @apiSuccess {Object}  user User information.
 * @apiSuccess {String}  user.email Users email.
 * @apiSuccess {String}  user.title Users title.
 * @apiSuccess {String}  user.registered Users registration date.
 * @apiSuccess {String}  user.is_active Users activation state.
 */
router.get('/', authHelper.checkAuth(), (req, res, next) => {
    res.send({success: true, user: req.user});
});

/**
 * @api {post} /user Create new user
 * @apiName UserCreate
 * @apiGroup User
 *
 * @apiParam {String} email Users unique email.
 * @apiParam {String} password Users password.
 * @apiParam {String} title Users display name/title
 *
 * @apiSuccess {Boolean} success
 * @apiSuccess {Object}  user User information.
 * @apiSuccess {String}  user.email Users email.
 * @apiSuccess {String}  user.title Users title.
 * @apiSuccess {String}  user.registered Users registration date.
 * @apiSuccess {String}  user.is_active Users activation state.
 */
router.post('/', (req, res, next) => {
    if( !req.body || !userModel.validateInput(req.body) ) {
        return next(new APIErrors(APIErrors.list.api.bad_params));
    }
    
    let user = new userModel(req.body);
    user.password = userModel.hashPwd(user.password);
    user.registered = new Date();
    user.is_active = false;
    
    userModel.findOne({email: user.email}, (err, doc) => {
        /* istanbul ignore next */
        if( err ) {
            return next(new APIErrors(APIErrors.list.server.dbo, err));
        }
        if( doc ) { // means user already exists 
            return next(new APIErrors(APIErrors.list.api.users.already_exist));
        }
        user.save((err) => {
            /* istanbul ignore next */
            if( err ) {
                return next(new APIErrors(APIErrors.list.server.dbo, err));
            }

            const activationCode = user.genActivationCode();
            if( activationCode ) {
                // TODO in this place should be send mail function
                // for confirm user's email
            }
            
            res.send({
                success: true, 
                user: user.toPublic(),
                // FIXME Note! Activation code returns now only for this example prject
                // for making tests more simple. In real projects should be send email!
                activationCode: activationCode
            });
        })
    });
});

/**
 * @api {get} /user/activate_user Activate new user account
 * @apiName UserActivate
 * @apiGroup User
 *
 * @apiParam {String} activation_code Activation code from activation email
 *
 * @apiSuccess {Boolean} success
 * @apiSuccess {Object}  user User information.
 * @apiSuccess {String}  user.email Users email.
 * @apiSuccess {String}  user.title Users title.
 * @apiSuccess {String}  user.registered Users registration date.
 * @apiSuccess {String}  user.is_active Users activation state.
 */
router.get('/activate_user', (req, res, next) => {
    if( !req.query.activation_code || !req.query.activation_code.length ) {
        return next(new APIErrors(APIErrors.list.api.bad_params));
    }

    userModel.findOne({activation_code: req.query.activation_code}, (err, user) => {
        /* istanbul ignore next */
        if( err ) {
            return next(new APIErrors(APIErrors.list.server.dbo, err));
        }
        if( !user ) {
            return next(new APIErrors(APIErrors.list.api.users.not_found));
        }
        if( user.is_active ) {
            return next(new APIErrors(APIErrors.list.api.users.already_activated));
        }
        user.is_active = true;
        user.save((err) => {
            /* istanbul ignore next */
            if( err ) {
                return next(new APIErrors(APIErrors.list.server.dbo, err));
            }
            res.send({success: true, user: user.toPublic()});
        });
    });
});

module.exports = router;