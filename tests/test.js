/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const app = require('./../app.js');
const userHelper = require('./helpers/users.js');

before((done) => {
    app.then(() => {
        userHelper.removeTestUsers(done);
    });
});

require('./usersApi.js');
require('./commentsApi.js');