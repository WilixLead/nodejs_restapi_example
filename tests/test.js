/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const app = require('./../server.js');
const userHelper = require('./helpers/users.js');
const commentHelper = require('./helpers/comments.js');

before((done) => {
    app.then(() => { // Init db connection and express server
         done() 
     }); 
});

// Drop created comments and users
after((done) => {
    commentHelper.removeTestComments(() => {
        userHelper.removeTestUsers(done);
    });
});

require('./usersApi.js');
require('./commentsApi.js');
