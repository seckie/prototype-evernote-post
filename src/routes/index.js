var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var evernoteService = require('../services/evernote-service.js');
const isAuthenticated = require('../middlewares/isAuthenticated');
const {MAX_FILE_SIZE, CALLBACK_URL} = require('../config/app-config');

const multer = require('multer');
const storage = multer.memoryStorage(); // Don't use disk storage
const upload = multer({
  storage: storage,
  dest: 'uploads/',
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});
router.get('/oauth_signin', (req, res, next) => {
  evernoteService.getRequestToken(CALLBACK_URL).then(({oauthToken, oauthTokenSecret, authorizeUrl}) => {
    req.session.oauthToken = oauthToken;
    req.session.oauthTokenSecret = oauthTokenSecret;
    res.redirect(authorizeUrl); // send the user to Evernote
  }, (error) => {
    console.log(error.message);
    createError('Failed to Evernote sign-in');
  })
});

router.get('/oauth_callback', (req, res, next) => {
  evernoteService.getAccessToken(req).then((oauthToken, client) => {
    req.session.oauthToken = oauthToken;
    evernoteService.getUser(oauthToken).then((user) => {
      req.session.user = user;
      res.render('oauth_callback', {user: user});
    }, (error) => {
      res.redirect('/');
    })
  }, (error) => {
    console.log(error.message);
    res.redirect('/');
  });
});

router.get('/create_todays_note', isAuthenticated, (req, res, next) => {
  res.render('create_todays_note', {
    user: req.session.user
  });
});

router.post('/create_image_note', isAuthenticated, upload.single('fileData'), (req, res, next) => {
  if (!req.body || !req.file) {
    console.log('No body or file');
    return res.send({error: true, message: 'No request body or file'});
  }
  const data = Object.assign({}, req.file, {
    lastModified: parseInt(req.body.fileLastModified, 10)
  });
  if (req.file) {
    evernoteService.createTodaysNoteWithImage(req.session.oauthToken, data).then((note) => {
      res.send({
        success: true,
        note: note
      });
    }, (err) => {
      res.send({
        success: false,
        message: err.message
      });
    });
  }
}, (err, req, res, next) => {
  // Upload error
  if (err) {
    res.send({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
