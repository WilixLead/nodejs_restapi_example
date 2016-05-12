/**
 * Created by Dmitry on 09.05.2016.
 */
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const appConfig = require('./config/config.js');
const APIError = require('./helpers/APIError.js');

mongoose.connect(appConfig.server.dboString);

const db = mongoose.connection;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

let userRoutes = require('./routes/users.js');
let authRoutes = require('./routes/auth.js');
let commentsRoutes = require('./routes/comment.js');

app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/comment', commentsRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    /* istanbul ignore next */
    next(new APIError(APIError.list.server.internal.method_not_found));
});

app.use((err, req, res, next) => {
    res.status(200); // Always answer 200
    let result = {
        success: false,
        error: err.toObject ? err.toObject() : err
    };
    res.send(result);
});

module.exports = new Promise((resolve, reject) => {
    db.once('open', () => {
        app.listen(appConfig.server.port, function (err) {
            if (err) {
                /* istanbul ignore next */
                reject(new APIError(APIError.list.server.internal, err));
            } else {
                /* istanbul ignore next */
                console.info('Server start listen on port', appConfig.server.port);
                resolve(app);
            }
        });
    });
    db.on('error', (err) => {
        /* istanbul ignore next */
        reject(new APIError(APIError.list.server.internal, err));
    });
});