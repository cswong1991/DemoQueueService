// Basic
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Read env variables
require("dotenv").config();
// CORS
var cors = require('cors')
// Import routers
var adminRouter = require('./routes/admin');
var queueItemRouter = require('./routes/queueItem');

var app = express();
app.listen(3000, '0.0.0.0', function () {
  console.log('Running on 0.0.0.0:3000');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use routers
app.use(cors());
app.use('/admin', adminRouter);
app.use('/user', queueItemRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
