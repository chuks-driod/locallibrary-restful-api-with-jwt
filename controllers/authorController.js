const { body,validationResult } = require('express-validator');

var async = require('async');
var Book = require('../models/book');
var Author = require('../models/author');
// var debug = require('debug')('author');

/**
 * @swagger 
 * /catalog/authors:
 *   get:
 *     description: Get all author Page
 *     responses:
 *       200:
 *         description: Success
 */

// Display list of all Authors.
exports.author_list = function(req, res, next) {

    async.parallel({
    
        author_count: function(callback) {
            Author.find({}, callback);
        },
        
    }, function(err, results) {
        if (err) { return next(err)}
        res.send(results);
    });
};

/// Display detail page for a specific Author.
exports.author_detail = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
              .exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id },'title summary')
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.author==null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.send('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
    });

};

// Display Author create form on GET.
exports.author_create_get = function(req, res, next) {
    res.send('author_form', {title: 'Author Form'})
};

/**
 * @swagger 
 * /catalog/author/create:
 *   post:
 *     description: Create new author
 *     parameters:
 *     - name: first_name
 *       description: first name
 *       in: formData
 *       required: true
 *       type: string
 *     - name: family_name
 *       description: family name
 *       in: formData
 *       required: true
 *       type: string
 *     - name: date_of_birth
 *       description: date of birth
 *       in: formData
 *       type: integer
 *     - name: date_of_death
 *       description: date of daeth
 *       in: formData
 *       type: integer
 *     responses:
 *       201:
 *         description: Created
 */

// Handle Author create on POST.
exports.author_create_post = [

    // Validate and sanitize fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        

         // Data from form is valid.

        // Create an Author object with escaped and trimmed data.
        var author = new Author(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            }
        );

        author.save(function (err, author) {
            if (err) { return next(err); }
            // Successful - redirect to new author record.
            res.send(author);
        });
        
    }
];

// Display Author delete form on GET.
exports.author_delete_get = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.author==null) { // No results.
            res.send('/catalog/authors');
        }
        // Successful, so render.
        res.send('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
    });

};

/**
 * @swagger 
 * /catalog/author/delete/:id:
 *   delete:
 *     description: Delete Author
 *     parameters:
 *     - name: id
 *       description: Delete Author
 *       in: formData
 *       required: true
 *     responses:
 *         302:
 *          description: Author Deleted
 */

/// Handle Author delete on POST.
exports.author_delete_delete = function(req, res, next) {

    // Bookinstance has no books. Delete object and redirect to the list of bookinstances.
    Author.findByIdAndRemove(req.body.id).then(function(deletedAuthor) {
        // if (err) { return next(err); }
        // Success - go to bookinstance list
        res.send(deletedAuthor)
    }).catch(next)

};

// Display Author update form on GET.
exports.author_update_get = function (req, res, next) {

    Author.findById(req.params.id, function (err, author) {
        if (err) { return next(err); }
        if (author == null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.send('author_form', { title: 'Update Author', author: author });

    });
};

/**
 * @swagger 
 * /catalog/author/:id/update:
 *   put:
 *     description: Update Authors
 *     parameters:
 *     - name: id
 *       description: Authors Update id
 *       in: formData
 *       required: true
 *     - name: first_name
 *       description: Authors first name
 *       in: formData
 *     - name: family_name
 *       description: Authors family name
 *       in: formData
 *     - name: title
 *       description: Date of birth
 *       in: formData
 *     - name: date_of_death
 *       description: Date of death 
 *       in: formData
 *     responses:
 *         302:
 *           description: Author Updated
 */

// Handle Author update on POST.
exports.author_update_post = [

    // Validate and santize fields.
    body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').trim().isLength({ min: 1 }).escape().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Create Author object with escaped and trimmed data (and the old id!)
        var author = new Author(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id: req.params.id
            }
        );

        // Data from form is valid. Update the record.
        Author.findByIdAndUpdate(req.params.id, author, {}, function (err, theauthor) {
            if (err) { return next(err); }
            // Successful - redirect to genre detail page.
            res.send(theauthor);
        })
    }
];

