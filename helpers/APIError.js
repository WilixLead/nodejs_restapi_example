/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const _ = require('lodash');
const appConfig = require('../config/config.js');

const errors = {
    server: {
        internal: {
            code: 1101,
            key: 'InternalServerError',
            message: 'Internal server error',
            level: 'system'
        },
        dbo: {
            code: 1201,
            key: 'DatabaseError',
            message: 'Database internal error',
            level: 'system'
        }
    },
    api: {
        method_not_found: {
            code: 2101,
            key: 'ApiMethodNotFound',
            message: 'Requested api method not found',
            level: 'api'
        },
        bad_params: {
            code: 2102,
            key: 'BadInputParams',
            message: 'Bad input parameters',
            level: 'api'
        },
        users: {
            already_exist: {
                code: 2201,
                key: 'UserAlreadyExist',
                message: 'User already exist',
                level: 'api'
            },
            user_not_found: {
                code: 2202,
                key: 'UserNotFound',
                message: 'User not found',
                level: 'api'
            },
            not_authenticated: {
                code: 2203,
                key: 'UserNotAuthenticated',
                message: 'User not authenticated to this action',
                level: 'api'
            },
            no_access_token: {
                code: 2205,
                key: 'NoAccessTokenProvided',
                message: 'Access token not provided',
                level: 'api'
            }
        },
        comments: {
            empty_or_bad_characters: {
                code: 2301,
                key: 'EmptyOrUnavailableCharacters',
                message: 'Provided empty text or with unavailable characters',
                level: 'api'
            },
            parent_comment_not_found: {
                code: 2302,
                key: 'ParentCommentNotFound',
                message: 'Parent comment not found by provided parent_id',
                level: 'api'
            }
        }
    }
};

class APIError {
    constructor (type, originalError) {
        this.type = type;
        this.originalError = originalError;
        
        if( appConfig.server.logErrors.indexOf(this.type.level) != -1 ) {
            console.error(this.toObject(true));
        }
        return this;
    }
    
    toObject(extended) {
        if( extended == undefined ) {
            extended = false;
        }
        if( appConfig.server.extendedErrors || extended ) {
            _.merge(this.type, {originalError: this.originalError});
        }
        return this.type;
    }
    
    toString(extended) {
        if( extended == undefined ) {
            extended = false;
        }
        return JSON.stringify(this.toObject(extended));
    }
}
APIError.list = errors;

module.exports = APIError;