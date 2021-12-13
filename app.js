var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParsee = require('body-parser')

//Set up mongoose connection
var mongoose = require('mongoose');
var dev_db_url = 'mongodb+srv://mongoose:PKyFZ3VU3KqTPkw@cluster0.qnygo.mongodb.net/local_library?retryWrites=true&w=majority';
var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
var db = mongoose.connection;
mongoose.Promise = global.Promise;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');  //Import routes for "catalog" area of site
var compression = require('compression');
var helmet = require('helmet');
var swaggerjsDoc = require('swagger-jsdoc');
var swaggerUI = require('swagger-ui-express');

var app = express();

var swaggerOptions = {
  swaggerDefinition: {
    securityDefinitions: {
      bearerAuth: {
        type: "apiKey",
        name: "Authorization",
        scheme: "bearer",
        in: "header",
        bearerFormat: 'JWT'
      },
    },
      info: {
          title: 'Library API',
          version: '1.0.0'
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
      
  },
  apis:['app.js', './controllers/authorController.js', './controllers/bookController.js', './controllers/bookinstanceController.js', './controllers/genreController.js', './controllers/UsersController.js'],
};


var options = {
  explorer: true
};


var swaggerDocs = swaggerjsDoc(swaggerOptions)

// CATALOG Json

/**
 * @swagger 
 * /catalog:
 *   get:
 *     description: Home Page
 *     responses:
 *       200:
 *         description: Success
 */

app.use(bodyParsee.json())

app.use(compression()); //Compress all routes
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);  // Add catalog routes to middleware chain.
app.use('/catalog/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs, options,))
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.status(422).send({error: err.message});

})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  // SET DEBUG=express-locallibrary-tutorial:* & npm start

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
