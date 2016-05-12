/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const router = require('express').Router();

const APIErrors = require('./../helpers/APIError.js');
const authHelper = require('./../helpers/authMiddleware.js');
const userModel = require('./../models/user.js');

/**
 * @api {post} /auth User authentication
 * @apiName AuthUser
 * @apiGroup Auth
 *
 * @apiParam {String} email Users unique email.
 * @apiParam {String} password Users password.
 *
 * @apiSuccess {Boolean} success
 * @apiSuccess {String}  access_token Token for auth in api queries.
 * @apiSuccess {Object}  user User information.
 * @apiSuccess {String}  user.email Users email.
 * @apiSuccess {String}  user.title Users title.
 * @apiSuccess {String}  user.is_active Users activation state.
 */
router.post('/', (req, res, next) => {
    if( !req.body || !req.body.email || !req.body.password ) {
        return next(new APIErrors(APIErrors.list.api.bad_params));
    }

    let passwordHash = userModel.hashPwd(req.body.password);
    userModel.findOne({
        email: req.body.email,
        password: passwordHash
    }, (err, user) => {
        /* istanbul ignore next */
        if( err ) {
            return next(new APIErrors(APIErrors.list.server.dbo, err));
        }
        if( !user ) {
            return next(new APIErrors(APIErrors.list.api.users.not_found));
        }
        if( !user.is_active ) {
            let aErr = new APIErrors(APIErrors.list.api.users.not_active);
            return next(aErr);
        }
        let response = {
            success: true,
            user: user.toPublic()
        };
        response.access_token = authHelper.makeToken(response.user);
        res.send(response);
    });
});

module.exports = router;