var express = require('express');
var router = express.Router();

var swaggerUi = require('swagger-ui-express');
var swaggerjsDoc = require('swagger-jsdoc');

// Require controller modules.
var book_controller = require('../controllers/bookController');
var author_controller = require('../controllers/authorController');
var genre_controller = require('../controllers/genreController');
var book_instance_controller = require('../controllers/bookinstanceController');
var users_controller = require('../controllers/UsersController')

/// BOOK ROUTES ///

// GET catalog home page.
router.get('/', book_controller.index);


// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/book/create', book_controller.book_create_get);

// POST request for creating Book.
router.post('/book/create', book_controller.book_create_post);

// GET request to delete Book.
router.get('/book/:id/delete', book_controller.book_delete_get);

// POST request to delete Book.
router.delete('/book/:id/delete', book_controller.book_delete_delete);

// GET request to update Book.
router.get('/book/:id/update', book_controller.book_update_get);

// POST request to update Book.
router.post('/book/update/:id', book_controller.book_update_post);

// GET request for one Book.
router.get('/book/:id', book_controller.book_detail);

// GET request for list of all Book items.
router.get('/books', book_controller.book_list);

/// AUTHOR ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
router.get('/author/create', author_controller.author_create_get);

// POST request for creating Author.
router.post('/author/create', author_controller.author_create_post);

// GET request to delete Author.
router.get('/author/:id/delete', author_controller.author_delete_get);

// POST request to delete Author.
router.delete('/author/delete/:id', author_controller.author_delete_delete);

// GET request to update Author.
router.get('/author/:id/update', author_controller.author_update_get);

// POST request to update Author.
router.post('/author/update/:id', author_controller.author_update_post);

// GET request for one Author.
router.get('/author/:id', author_controller.author_detail);

// GET request for list of all Authors.
router.get('/authors', author_controller.author_list);

/// USERS ROUTES //

// POST request for cteaing Users.
router.post('/users/create', users_controller.create_users_post);

// GET request to get user token
router.post('/user/login', users_controller.user_login);

// POST login to submmit token
router.post('/user/post', users_controller.login_post);

// POST request to delete user
router.delete('/user/delete/:id', users_controller.user_delete)

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get('/genre/create', genre_controller.genre_create_get);

//POST request for creating Genre.
router.post('/genre/create', genre_controller.genre_create_post);

// GET request to delete Genre.
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST request to delete Genre.
router.delete('/genre/delete/:id', genre_controller.genre_delete_delete);

// GET request to update Genre.
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST request to update Genre.
router.put('/genre/update/:id', genre_controller.genre_update_put);

// GET request for one Genre.
router.get('/genre/:id', genre_controller.genre_detail);

// GET request for list of all Genre.
router.get('/genres', genre_controller.genre_list);

/// BOOKINSTANCE ROUTES ///

// GET request for creating a BookInstance. NOTE This must come before route that displays BookInstance (uses id).
router.get('/bookinstance/create', book_instance_controller.bookinstance_create_get);

// POST request for creating BookInstance.
router.post('/bookinstance/create', book_instance_controller.bookinstance_create_post);

// GET request to delete BookInstance.
router.get('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_get);

// POST request to delete BookInstance.
router.delete('/bookinstance/delete/:id', book_instance_controller.bookinstance_delete_delete);

// GET request to update BookInstance.
router.get('/bookinstance/update/:id', book_instance_controller.bookinstance_update_get);

// POST request to update BookInstance.
router.post('/bookinstance/update/:id', book_instance_controller.bookinstance_update_post);

// GET request for one BookInstance.
router.get('/bookinstance/:id', book_instance_controller.bookinstance_detail);

// GET request for list of all BookInstance.
router.get('/bookinstances', book_instance_controller.bookinstance_list);

module.exports = router;
