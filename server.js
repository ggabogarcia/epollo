'use strict';
const express = require('express');
const app = express();
const session = require('express-session');
const connectMongo = require('connect-mongo')(session);
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {dbKeys} = require('./config/database');
const debug = require('debug')('epollo:server');
const logger = require('morgan');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Setting routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const storiesRouter = require('./routes/stories');

const PORT = process.env.PORT || 8080;
const env = process.env.NODE_ENV || 'development';
if(env ===  'development') {
  app.use(session({
    secret: dbKeys.sessionSecret,
    saveUninitialized: true,
    resave: true
  }));
} else {
  app.use(session({
    secret: dbKeys.sessionSecret,
    saveUninitialized: true,
    resave: true,
    store: new connectMongo({
      url: dbKeys.dbUrl,
      stringify: true
    })
  }));
}

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'epollo')));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express validator
app.use(expressValidator({
  errorformatter: (param, msg, value) => {
    var namespace = params.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    }
  }
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/stories', storiesRouter);

app.use((req, res, next) => {
  next(createError(404));
});
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', {title: '404', user: req.user});
});

app.listen(PORT, () => {
  debug(`running on port: ${PORT}`);
});
