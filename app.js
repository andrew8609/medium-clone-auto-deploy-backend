var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Sequelize = require('sequelize');
require('dotenv').config()

process.env.PWD = process.cwd();

var app = express();
var cors = require('cors');
// view engine setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(process.env.PWD, 'uploads')));

require('./routes/auth.route')(app);
require('./routes/user.route')(app);
require('./routes/story.route')(app);
require('./routes/core.route')(app);
require('./routes/follow.route')(app);
require('./routes/clap.route')(app);
require('./routes/hashtag.route')(app);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
