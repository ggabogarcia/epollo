'use strict';
import * as express from 'express';
import * as session from 'express-session';
import * as conMongo from 'connect-mongo';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { dbKeys } from './config/database';
import * as debugConsole from 'debug';
import * as logger from 'morgan';
import * as flash from 'connect-flash';
import * as createError from 'http-errors';
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
import expressValidator = require('express-validator');

const app: express.Application = express();
const connectMongo = conMongo(session);
const debug = debugConsole('epollo:server');
let LocalStrategy = passportLocal.Strategy;
declare var __dirname;
declare var process;


// Setting routes

import * as indexRouter from './routes/index';
import * as usersRouter from './routes/users';
import * as storiesRouter from './routes/stories';

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
app.set('views', path.join(__dirname, '..', 'views'));
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
    let namespace = param.split('.');
    let root = namespace.shift();
    let formParam = root;

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

app.use('/', indexRouter.router);
app.use('/users', usersRouter.router);
app.use('/stories', storiesRouter.router);

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
