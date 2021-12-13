var User  = require('../models/users');
var {body, check, validationResult} = require('express-validator');
var jwt = require('jsonwebtoken');
var async = require('async');
var verifyToken = require('./verify')

exports.users_list = function(req, res, next) {

    async.parallel({
    
        users_count: function(callback) {
            User.find({}, callback);
        },
        
    }, function(err, results) {
        if (err) { return next(err)}
        res.send(results);
    });
};


/**
 * @swagger 
 * /catalog/users/create:
 *   post:
 *     description: Create new user
 *     parameters:
 *     - name: first_name
 *       description: First Name
 *       in: formData
 *       required: true
 *       type: string
 *     - name: last_name
 *       description: Last Name
 *       in: formData
 *       required: true
 *     - name: email
 *       description: Email
 *       in: formData
 *       required: true
 *       type: string
 *     - name: password
 *       description: Create new password
 *       in: formData
 *       required: true
 *       type: string
 *     responses:
 *       201:
 *         description: New user Created
 */

// Handle Users create on POST.
exports.create_users_post = [

    body('first_name').trim().isLength({ min: 1 }).escape(),
    body('last_name').trim().isLength({ min: 1 }).escape(),
    body('email').trim().normalizeEmail().isEmail().isLength({ min: 1, max: 100}).escape(),
    body('password').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {

        var user = new User(
            {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: req.body.password,
            }
        )

        User.findOne({'email': req.body.email}).exec( function (err, found_user) {
            if (err) { return next(err) };

            if (found_user) {
                res.status(409).send('User already exist.')
            } else { 
                user.save(function(err, newUser) {
                    if (err) { return next(err) };

                    res.send(newUser)
                })
            }
        })
        
    }

]

/**
 * @swagger 
 * /catalog/user/login:
 *   post:
 *      description: Get user token
 *      parameters:
 *      - name: email
 *        description: Enter email
 *        in: formData
 *        required: true
 *        type: string
 *      - name: password
 *        description: Enter password
 *        in: formData
 *        required: true
 *        type: string
 *      responses:
 *        302:
 *          description: Found
 */

// GET user token by it's id
exports.user_login = function(req, res, next) {

    User.findOne(req.body).exec( function(err, found_user) {
        if (err) { return next(err)}

        if (found_user) {
            jwt.sign({found_user}, 'secretkey', (err, token) => {
                res.json({
                    token
                })
            })
        } else {
            res.status(404).send('User not found.')
        }
    })

    
}

/**
 * @swagger 
 * /catalog/user/post:
 *   post:
 *      description: Get user token
 *      parameters:
 *      - name: token
 *        description: Enter token
 *        in: formData
 *        required: true
 *        type: string
 *      responses:
 *         302:
 *          description: Found
 *
 */

 exports.login_post = [ verifyToken,

    (req, res, next) => {
        jwt.verify(req.body.token, 'secretkey', (err, authData) => {
            if (err) {
                res.sendStatus(401)
            } else {
                res.json(authData)
            }
        })

        // if (verifyToken) {return next(verifyToken)}
    },


]

/**
 * @swagger 
 * /catalog/user/delete/id:
 *   delete:
 *      description: Get user token
 *      parameters:
 *      - name: token
 *        description: Enter token
 *        in: formData
 *        required: true
 *        type: string
 *      - name: id
 *        description: Enter ID
 *        in: formData
 *        required: true
 *      responses:
 *         302:
 *          description: Found
 *
 */

exports.user_delete = [ verifyToken,

    (req, res, next) => {

        jwt.verify(req.body.token, 'secretkey', (err) => {
            if (err) {
                res.sendStatus(401)
            } else {

                User.findByIdAndRemove(req.body.id).then(function(deletedUser) {
                    // if (err) { return next(err); }
                    // Success - send back the deleted book
                    res.send(deletedUser)
                }).catch(next)
            }
        })

    },

];
