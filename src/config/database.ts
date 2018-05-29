import * as mongoose from 'mongoose';
import * as dbKeys from './../../pids/keys';
mongoose.connect(dbKeys.dbUrl);
let database =  mongoose.connection;
let Schema =  mongoose.Schema;
import * as bcrypt from 'bcrypt';

database.on('error', () => {
  console.error('Make sure the url in "pids/keys.json" to the database is right');
});

let userSchema = new Schema({
  username: String,
  name: {
    first: String,
    last: String
  },
  permalink: String,
  email: String,
  password: String,
  stories: [{
    title: String,
    permalink: String,
    color: String,
    genre: [String]
  }],
  threads: [{
    title: String,
    permalink: String,
    color: String
  }],
  bio: String,
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  genres: [String]
});


// The title id is for the get requiests its simply just the
// title in lowercase and without spaces.

let storySchema = new Schema({
  title: String,
  permalink: String,
  text: String,
  genre: [String],
  author: {
    username: String,
    name: {
      first: String,
      last: String
    },
    permalink: String
  },
  color: String,
  previous: [{
    title: String,
    permalink: String
  }],
  nextThreads: [{
    title: String,
    permalink: String,
    color: String
  }],
  parent: {
    title: String,
    permalink: String
  },
  original: {
    title: String,
    permalink: String
  },
  date: {
    type: String,
    default: new Date().toISOString().substring(0, 10)
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
});
export let User = mongoose.model('users',  userSchema);
export let Story = mongoose.model('stories',  storySchema);

export let handleError = (err, res) => {
  res.status(404).send('Error');
}

export { dbKeys, mongoose, database, Schema };


/**
*@summary Lists all user
*/

export let getUsers = (callback) => {
  User.find({}, callback);
}

export let getUserById = (id, callback) => {
  User.findById(id, callback);
}

export let getUserByUsername = (usr, callback) => {
  User.findOne({username: usr}, callback);
}

export let getUserByLink = (link, callback) => {
  User.findOne({permalink: link}, callback);
}


/**
*@summary Lists all story
*/

export let getStories = (callback) => {
  Story.find({}).sort([['date', -1]]).exec(callback);
}

export let getStoryById = (strId, callback) => {
  Story.findOne({permalink: strId}, callback);
}

export let getStoryByTitle = (strTitle, callback) => {
  Story.findOne({title: strTitle}, callback);
}

export let getStoryByLink = (strLink, callback) => {
  Story.findOne({permalink: strLink}, callback);
}


/**
*@summary Save story to database
*/

export let createStory = (newStory, callback) => {
  Story.findOne({permalink: newStory.permalink}, callback);
}


/**
*@summary Adding a new story to the user's sotries array
*/

export let updateUserStories = (newStory, user, callback) => {
  User.findOne({username: user}, (err, newUser) => {
    if(err) throw err;
    if(newUser) {
      if(newUser.genres.length < 4) {
        let newGenres = newUser.genres.concat(newStory.genre);
        newUser.genres = newGenres;
      }
      newUser.stories.push({
        title: newStory.title,
        permalink: newStory.permalink,
        color: newStory.color,
        genre: newStory.genre
      });
      newUser.save(callback);
    }
  });
}


/**
*@summary Save a new user to database
*/

export let createUser = (newUser, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

export let comparePassword = (typedPassword, hash, callback) => {
  bcrypt.compare(typedPassword, hash, (err, isMach) => {
    if(err) throw err;
    callback(null, isMach);
  });
}


/**
*@summary For exclude logined users from pages like signin/signup
*/

export let onlyNotLogined = (req, res, next) => {
    if(!req.user) {
      next();
    }
}


/**
*@summary Prevent not users from upload etc.
*/

export let onlyLogined = (req, res, next) => {
  if(req.user) {
    next();
  } else {
    res.redirect('/signin');
  }
}
