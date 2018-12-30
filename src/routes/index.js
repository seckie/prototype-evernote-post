var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var evernoteService = require('../services/evernote-service.js');
var callbackUrl = "http://localhost:3000/oauth_callback";
const isAuthenticated = require('../middlewares/isAuthenticated');

const multer = require('multer');

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});
router.get('/oauth_signin', (req, res, next) => {
  evernoteService.getRequestToken(callbackUrl).then(({oauthToken, oauthTokenSecret, authorizeUrl}) => {
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
  evernoteService.tempListSpecificNote(req.session.oauthToken).then(function (res) {
    console.log(res);
  }, function (rej) {
    console.log(rej);
  });

  res.render('create_todays_note', {
    user: req.session.user
  });
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  dest: 'uploads/',
  fileSize: 500000
});

router.post('/create_image_note', isAuthenticated, upload.single('fileData'), (req, res, next) => {
  if (!req.body) {
    console.log('No body');
    return res.send({error: true, message: 'No request body'});
  }

  /*
  var file = {
    type: req.body.fileType,
    name: req.body.fileName,
    size: req.body.fileSize,
    //data: atob(req.body.fileB64)
    data: req.body.fileData
  };
  */
  const data = {
    body: req.body,
    file: req.file
  };
  //if (req.body.fileData) {
  if (req.file) {
    evernoteService.createTodaysNoteWithImage(req.session.oauthToken, data).then((note) => {
      res.send({success: true, note: note});
    }, (error) => {
      res.send({success: false});
    });
  }
});
router.get('/create_image_note')

module.exports = router;
