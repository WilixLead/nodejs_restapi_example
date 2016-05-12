/**
 * Created by Dmitry on 11.05.2016.
 */
'use strict';
const router = require('express').Router();
const async = require('async');
const _ = require('lodash');

const APIErrors = require('./../helpers/APIError.js');
const authHelper = require('./../helpers/authMiddleware.js');
const commentModel = require('./../models/comment.js');

/**
 * @api {get} /comments Return all comments
 * @apiName CommentGet
 * @apiGroup Comments
 * @apiPermission user
 *
 * @apiParam {String} access_token User auth token for permit access
 * @apiParam {Boolean} [tree_view] If true, result will be returned as dialog tree
 *
 * @apiSuccess {Boolean} success
 * @apiSuccess {Array}  comments Array of Comment objects
 */
router.get('/', authHelper.checkAuth(), (req, res, next) => {
    commentModel.find({}).populate('user_id').exec((err, comments) => {
        /* istanbul ignore next */
        if( err ) {
            return next(new APIErrors(APIErrors.list.server.dbo, err));
        }
        let refComments = {};
        comments.forEach(function(comment) { // Make associate
            refComments[comment._id] = comment.toPublic();
            refComments[comment._id].user = comment.user_id.toPublic();
            refComments[comment._id].user_id = comment.user_id._id;
            refComments[comment._id].child = {};
        });
        
        if( comments && comments.length && req.query.tree_view ) {
            _.each(refComments, function(comment) {
                if (comment.parent && comment.parent.length) {
                    var prevParent = null;
                    comment.parent.forEach((parent) => {
                        if (!prevParent) {
                            prevParent = refComments[parent];
                            return;
                        }
                        if (!prevParent.child[parent]) {
                            prevParent.child[parent] = refComments[parent];
                        }
                        prevParent = prevParent.child[parent];
                    });
                    prevParent.child[comment._id] = comment;
                }
            });
            _.each(refComments, function(comment, key) {
                if( comment.parent && comment.parent.length ) {
                    delete refComments[key];
                }
            });
            return res.send({
                success: true,
                comments: refComments
            });
        } else {
            return res.send({
                success: true,
                comments: refComments
            });
        }
    });
});

/**
 * @api {post} /comments Create new comment
 * @apiName CommentCreate
 * @apiGroup Comments
 * @apiPermission user
 *
 * @apiParam {String} access_token User auth token for permit access
 * @apiParam {String} comment Users comment text
 * @apiParam {String} [parent] Parent comment id
 *
 * @apiSuccess {Boolean} success
 * @apiSuccess {Object}  comment New comment object
 * @apiSuccess {String}  comment._id Comment uniq id
 * @apiSuccess {String}  comment.user_id Comments creator user id
 * @apiSuccess {String}  comment.posted Comment posted datetime
 * @apiSuccess {String}  [comment.parent_id] Comment parent id
 */
router.post('/', authHelper.checkAuth(), (req, res, next) => {
    if( !req.body || !req.body.text || !req.body.text.length ) {
        return next(new APIErrors(APIErrors.list.api.bad_params));
    }
    let text = commentModel.escapeText(req.body.text);
    if( !text || !text.length ) {
        return next(new APIErrors(APIErrors.list.api.comments.empty_or_bad_characters));
    }
    
    async.waterfall([
        function(done) {
            if( req.body.parent_id && req.body.parent_id.length ) {
                commentModel.findById(req.body.parent_id).exec((err, doc) => {
                    if( err ) {
                        if( err.name == 'CastError' && err.kind == 'ObjectId' ) {
                            return done(new APIErrors(APIErrors.list.api.comments.parent_comment_not_found));
                        } else {
                            /* istanbul ignore next */
                            return done(new APIErrors(APIErrors.list.server.dbo, err));
                        }
                    }
                    if( !doc ) {
                        return done(new APIErrors(APIErrors.list.api.comments.parent_comment_not_found));
                    }
                    return done(null, doc);
                });
            } else {
                done(null, null);
            }
        },
        function(parent, done) {
            let comment = new commentModel({
                user_id: req.user._id,
                text: commentModel.escapeText(req.body.text),
                posted: new Date()
            });
            if( parent ) {
                if( parent.parent && parent.parent.length ) {
                    comment.parent = parent.parent;
                    comment.parent.push(parent._id.toString());
                } else {
                    comment.parent = [parent._id.toString()];
                }
            }
            comment.save((err) => {
                /* istanbul ignore next */
                if( err ) {
                    return done(new APIErrors(APIErrors.list.server.dbo, err));
                }
                done(null, comment);
            });
        }
    ], function(err, comment) {
        if( err ) {
            return next(err);
        }
        comment = comment.toPublic();
        comment.user = req.user.toPublic();
        if( comment.parent && comment.parent.length ) {
            comment.parent_id = comment.parent[comment.parent.length - 1];
            delete comment.parent;
        }
        res.send({
            success: true,
            comment: comment
        });
    });
});

module.exports = router;