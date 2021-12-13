const { body,validationResult } = require("express-validator");

var Book = require('../models/book');
var async = require('async');
var Genre = require('../models/genre');

/**
 * @swagger 
 * /catalog/genres:
 *   get:
 *     description: Get all genre
 *     responses:
 *       200:
 *         description: Success
 */

// Display list of all Genre.
exports.genre_list = function(req, res, next) {

  async.parallel({
  
      genre_count: function(callback) {
          Genre.find({}, callback);
      },
      
  }, function(err, results) {
      if (err) { return next(err)}
      res.send(results);
  });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
              .exec(callback);
        },

        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.send('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
    });

};

/// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {
    res.send('genre_form', { title: 'Create Genre' });
};

/**
 * @swagger 
 * /catalog/genre/create:
 *   post:
 *     description: Create new genre
 *     parameters:
 *     - name: name
 *       description: Create a new genre
 *       in: formData
 *       required: true
 *       type: string
 *       minLength: 3
 *       maxLength: 100
 *     responses:
 *       201:
 *         description: New Genre Created
 */

// Handle Genre create on POST.
exports.genre_create_post = [

    // Validate and santize the name field.
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

  
    // Process request after validation and sanitization.
    (req, res, next) => {

      // Create a genre object with escaped and trimmed data.
      var genre = new Genre(
        {
          name: req.body.name
        }
      );

      // // Data from form is valid.
      // // Check if Genre with same name already exists.
      Genre.findOne({ 'name': req.body.name }).exec( function(err, found_genre) {

        if (err) { return next(err); }

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.send(found_genre);
        }
        else {

          genre.save(function (err, genre) {
            if (err) { return next(err); }
            // Genre saved. Redirect to genre detail page.
            res.send(genre);
          });
          
        }

      })

    }
];

// function(req, res, next){

//   body('name', 'Genre name required').trim().isLength({ min: 1 }).escape()

//   Genre.create(req.body).then(function(genre) {
//     res.send(genre)
//   }).catch(next)

// }






// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {

  async.parallel({
      genre: function(callback) {
          Genre.findById(req.params.id).exec(callback)
      },
      genres_books: function(callback) {
        Book.find({ 'author': req.params.id }).exec(callback)
      },
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.genre==null) { // No results.
          res.redirect('/catalog/genres');
      }
      // Successful, so render.
      res.send('genre_delete', { title: 'Delete Genrer', genre: results.genre, genre_books: results.genres_books } );
  });

};


/**
 * @swagger 
 * /catalog/genre/delete/:id:
 *   delete:
 *      description: Delete genre
 *      parameters:
 *      - name: id
 *        description: Delete Genre
 *        in: formData
 *        required: true
 *      responses:
 *        302:
 *          description: Genre Deleted
 */

/// Handle Genre delete on POST.
exports.genre_delete_delete = function(req, res, next) {

  // Genre has no books. Delete object and send back the deleted genre
  Genre.findByIdAndRemove(req.body.id).then(function(deletedGenre) {
      // if (err) { return next(err); }
      // Success - send back the deleted genre
      res.send(deletedGenre)
  }).catch(next)

};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {

  // Bookinstance has no books. Delete object and redirect to the list of bookinstances.
  Genre.findByIdAndRemove(req.body.id).then(function(updatedGenre) {
      // if (err) { return next(err); }
      // Success - go to bookinstance list
      res.send(updatedGenre)
  }).catch(next)

};

/**
 * @swagger 
 * /catalog/genre/update/:id:
 *   put:
 *     description: Update Genre Details
 *     parameters:
 *     - name: id
 *       description: Genres id to update
 *       in: formData
 *       required: true
 *     - name: name
 *       description: Genre name
 *       in: formData
 *       required: true
 *     responses:
 *       302:
 *         description: Genre Updated
 */

// Handle Genre update on POST.
exports.genre_update_put = function(req, res, next) {
  
    // Validate and santize the name field.
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape()

    var genre = new Genre(
      {
          name: req.body.name,
          // _id: req.params.id
      }
    );

    Genre.findByIdAndUpdate(req.params.id, req.body.name, function (err, theGenre) {
      if (err) { return next(err); }
      Genre.findOne(req.body.id, function (theGenre) {
        
        // Successful - redirect to genre detail page.
        res.send(theGenre);
      })
      res.send(theGenre)
    })

}