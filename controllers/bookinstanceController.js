const { body,validationResult } = require('express-validator');
var swaggerjsDoc = require('swagger-jsdoc');
var swaggerUI = require('swagger-ui-express');
var Book = require('../models/book');
const { DateTime } = require("luxon");

var BookInstance = require('../models/bookinstance');

var async = require('async');

/**
 * @swagger 
 * /catalog/bookinstances:
 *   get:
 *     description: Get all bookinstance
 *     responses:
 *       200:
 *         description: Success
 */

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {

    async.parallel({
    
        bookinstance_count: function(callback) {
            BookInstance.find({}, callback);
        },
        
    }, function(err, results) {
        if (err) { return next(err)}
        res.send(results);
    });
};

/// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {

    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) { // No results.
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.send('bookinstance_detail', { title: 'Copy: '+bookinstance.book.title, bookinstance:  bookinstance});
    })

};


// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {

    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.send('bookinstance_form', {title: 'Create BookInstance', book_list: books});
    });

};

/**
 * @swagger 
 * /catalog/bookinstance/create:
 *   post:
 *     description: Create new bookinstance
 *     parameters:
 *     - name: book
 *       description: Bookinstance
 *       in: formData
 *       required: true
 *     - name: imprint
 *       description: Bookinstance Imprint
 *       in: formData
 *       required: true
 *       type: string
 *     - name: status
 *       description: Bookinstance Status
 *       in: formData
 *       required: true
 *       type: string
 *     - name: due_back
 *       description: Bookinstance Due Back
 *       in: formData
 *       type: integer
 *     responses:
 *       201:
 *         description: New Bookinstance Created
 */

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate and sanitise fields.
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        
        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(

            { book: req.body.book,
              imprint: req.body.imprint,
              status: req.body.status,
              due_back: req.body.due_back
            }
        );

            // Data from form is valid.
        bookinstance.save(function (err, bookinstance) {
            if (err) { return next(err); }
            // Successful - redirect to new record.
            res.send(bookinstance);
        });
  
    }
];

// Display Bookinstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {

    async.parallel({
        bookinstance: function(callback) {
            BookInstance.findById(req.params.id).exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.bookinstance==null) { // No results.
            res.redirect('/catalog/bookinstances');
        }
        // Successful, so render.
        res.send('bookinstance_delete', { title: 'Delete Bookinstance', bookinstance: results.bookinstance } );
    });

};

/**
 * @swagger 
 * /catalog/bookinstance/delete/:id:
 *   delete:
 *      description: Delete bookinstance
 *      parameters:
 *      - name: id
 *        description: Bookinstance
 *        in: formData
 *        required: true
 *      responses:
 *          302:
 *            description: Bookinstance Deleted
 */

// Handle Bookinstance delete on POST.
exports.bookinstance_delete_delete = function(req, res, next) {

    // Bookinstance has no books. Delete object and redirect to the list of bookinstances.
    BookInstance.findByIdAndRemove(req.body.id).then(function(deletedBookinstance) {
        // if (err) { return next(err); }
        // Success - go to bookinstance list
        res.send(deletedBookinstance)
    }).catch(next)

};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

/**
 * @swagger 
 * /catalog/bookinstance/update/:id:
 *   put:
 *     description: Update bookinstance
 *     parameters:
 *     - name: _id
 *       description: Bookinstance
 *       in: formDgata
 *       required: true
 *       type: string
 *     responses:
 *       302:
 *         description: Updated
 */

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res, next) {

    // Bookinstance has no books. Delete object and redirect to the list of bookinstances.
    BookInstance.findByIdAndUpdate(req.body.id).then(function(deletedBookinstance) {
        // if (err) { return next(err); }
        // Success - go to bookinstance list
        res.send(deletedBookinstance)
    }).catch(next)

};





// {"_id":{"$oid":"612f86d96530bdc6af17d530"},"book":{"$oid":"612f86d86530bdc6af17d522"},"imprint":"London Gollancz, 2014.","status":"Available","due_back":{"$date":{"$numberLong":"1630504665965"}},"__v":{"$numberInt":"0"}}