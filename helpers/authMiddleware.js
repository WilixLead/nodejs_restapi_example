/**
 * Created by Dmitry on 11.05.2016.
 */
'use strict';
const _ = require('lodash');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cert = fs.readFileSync(__dirname + '/../private.key');
const userModel = require('./../models/user.js');
const APIErrors = require('./APIError.js');

class helper {
    constructor() {
        this.config = {
            continueOnFail: false // if true call next() with auth error
        };
    }

    /**
     * Check authentication middleware
     * Request Should contain body.access_token or query.access_token for auth
     * @param {Object} [options] Configure what middleware should do.
     * @param {Object} [options.continueOnFail] If true, next will be called as regular route with empty req.user
     */
    checkAuth(options) {
        let config = _.merge({}, this.config, options || {});
        return (req, res, next) => {
            const token = this._getToken(req);
            req.user = null; // Clear or create var
            
            if( !token ) {
                let aErr = new APIErrors(APIErrors.list.api.users.no_access_token);
                return next(aErr);
            }
            
            jwt.verify(token, cert, function(err, decoded) {
                if( err ) {
                    let aErr = new APIErrors(APIErrors.list.api.users.not_authenticated);
                    return next(aErr);
                }
                userModel.findById(decoded.id).exec((err, user) => {
                    /* istanbul ignore next */
                    if( err ) {
                        return next(new APIErrors(APIErrors.list.server.dbo, err));
                    }
                    if( user && !user.is_active ) {
                        let aErr = new APIErrors(APIErrors.list.api.users.not_active);
                        return next(aErr);
                    }
                    req.user = user;
                    return next();
                });
            });
        }
    }
    
    /**
     * Sing user object and return access_token for making authenticated requests
     * @param {Object} user User object
     * @returns String
     */
    makeToken(user) {
        return jwt.sign({id: user._id.toString()}, cert, {
            expiresIn: '2 days'
        });
    };

    _getToken(req) {
        if( !req.query.access_token && !req.body.access_token ) {
            return false;
        } else if( req.query.access_token ) {
            return req.query.access_token;
        } else {
            return req.body.access_token;
        }
    }
}

module.exports = new helper();