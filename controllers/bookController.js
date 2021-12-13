const { body,validationResult } = require('express-validator');

var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');


exports.index = function(req, res) {

    async.parallel({
        book_count: function(callback) {
            Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        book_instance_count: function(callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.countDocuments({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.send(results);
    });
};

/**
 * @swagger 
 * /catalog/books:
 *   get:
 *     description: Get all books
 *     responses:
 *       200:
 *         description: Success
 */

// Display list of all Books.
exports.book_list = function(req, res, next) {

    async.parallel({
    
        book_count: function(callback) {
            Book.find({}, callback);
        },
        
    }, function(err, results) {
        if (err) { return next(err)}
        res.send(results);
    });
};

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {

    async.parallel({
        book: function(callback) {

            Book.findById(req.params.id)
              .populate('author')
              .populate('genre')
              .exec(callback);
        },
        book_instance: function(callback) {

          BookInstance.find({ 'book': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.send(results)
    });

};


// Display book create form on GET.
exports.book_create_get = function(req, res, next) {

    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.send('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });

};

/**
 * @swagger 
 * /catalog/book/create:
 *   post:
 *     description: Create new books
 *     parameters:
 *     - name: title
 *       description: title of the book
 *       in: formData
 *       required: true
 *       type: string
 *     - name: author
 *       description: author of the book
 *       in: formData
 *       required: true
 *     - name: summary
 *       description: summry of the book
 *       in: formData
 *       required: true
 *       type: string
 *     - name: isbn
 *       description: isbn of the book
 *       in: formData
 *       required: true
 *       type: string
 *     - name: genre
 *       description: genre of the book
 *       in: formData
 *       required: true
 *     responses:
 *       201:
 *         description: New author Created
 */

// Handle book create on POST.
exports.book_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre ==='undefined')
            req.body.genre = [];
            else
            req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        // const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre

          }
        );

        book.save(function (err, book) {
            if (err) { return next(err); }
            // successful -send back the new book record.
            res.send(book)
        }); 
        
    }
];

// Display Book delete form on GET.
exports.book_delete_get = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).exec(callback)
        },
        books_books: function(callback) {
          BookInstance.find({ 'book': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            res.redirect('/catalog/books');
        }
        // Successful, so render.
        res.render('book_delete', { title: 'Delete Book', book: results.book, book_books: results.books_books } );
    });

};


/**
 * @swagger 
 * /catalog/book/delete/:id:
 *   delete:
 *      description: Delete Book
 *      parameters:
 *      - name: id
 *        discription: Delete Book
 *        in: formData
 *        required: true
 *      responses:
 *          302:
 *            description: Book Deleted
 */

// Handle Book delete on POST.
exports.book_delete_delete = function(req, res, next) {

    // Bookinstance has no books. Delete object and redirect to the list of bookinstances.
    Book.findByIdAndRemove(req.body.id).then(function(deletedBook) {
        // if (err) { return next(err); }
        // Success - send back the deleted book
        res.send(deletedBook)
    }).catch(next)

};

// Display book update form on GET.
exports.book_update_get = function(req, res, next) {

    // Get book, authors and genres for form.
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.book==null) { // No results.
                var err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()===results.book.genre[book_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            res.sned('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book });
        });

};

/**
 * @swagger   
 * /catalog/book/update/:id:
 *   post:
 *     description: Update Book Details
 *     parameters:
 *     - name: id
 *       description: Book details id
 *       in: formData
 *       required: true
 *     - name: title
 *       description: Book title
 *       in: formData
 *     - name: author
 *       description: Book Author
 *       in: formData
 *     - name: summry
 *       description: Book Summry
 *       in: formData
 *     - name: isbn
 *       description: Book isbn
 *       in: formData
 *     - name: genre
 *       description: Book Genre
 *       in: formData
 *     responses:
 *       302:
 *         description: Deleted
 */

// Handle book update on POST.
exports.book_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

           // Data from form is valid. Update the record.
        Book.findByIdAndUpdate(req.params.id, book, {}).then(function (thebook) {
            // if (err) { return next(err); }
               // Successful - redirect to book detail page.
               res.send(thebook);
        }).catch(next)
        
    }
];