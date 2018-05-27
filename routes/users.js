'use strict';
var express = require('express');
var app = express();
var router = express.Router();

var {User, Story,
    getUsers, getStories,
    getUserByUsername, getStoryById,
    getStoryByTitle, getUserByLink,
    onlyLogined, handleError
  } = require('./../config/database');

router.get('/', (req, res, next) => {
  getUsers((err, result) => {
    if(err) return res.status(404).send();
    if(result == null) {
      return res.status(404).send();
    } else {

      // Cut off the too long story titles for book design
      for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].stories.length; j++) {
          if(result[i].stories[j].title.length > 14) {
            result[i].stories[j].title = result[i].stories[j].title.slice(0, 11) + '...';
          }
        }
        for (let j = 0; j < result[i].threads.length; j++) {
          if(result[i].threads[j].title.length > 14) {
            result[i].threads[j].title = result[i].threads[j].title.slice(0, 11) + '...';
          }
        }
      }

      res.render('users', {
        title: 'Users/Authors',
        user: req.user,
        users: result
      });
    }
  });
});

router.get('/:permalink', (req, res, next) => {
  getUserByLink(req.params.permalink, (err, result) => {
   if(err) return res.status(404).send();
   if(result == null) {
     return res.status(404).send();
   } else {
     res.render('profile', {
       title: result.username,
       user: req.user,
       u: result
     });
   }
 });
});

router.get('/:username/settings', onlyLogined, (req, res, next) => {
  getUserByUsername(req.params.username, (err, result) => {
    if(err) return res.status(404).send();
    if(result == null || result.username != req.user.username) {
      return res.status(404).send();
    } else {
      res.render('settings', {
        title: result.name.first + ' ' + result.name.last + '\'s settings',
        user: req.user
      });
    }
  });
});

router.post('/:username/settings/update', onlyLogined, (req, res, next) => {
  // TODO: Update settings
  return res.status(404).send();
});

module.exports = router;
