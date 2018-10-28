var express = require('express');
var router = express.Router();
var createError = require('http-errors');
var evernoteService = require('../services/evernote-service.js');
var callbackUrl = "http://localhost:3000/oauth_callback";

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

router.get('/create_todays_note', (req, res, next) => {
  if (!req.session.oauthToken) {
    console.log('No token')
    return res.redirect('/');
  }
  evernoteService.tempListSpecificNote(req.session.oauthToken).then(function (res) {
    console.log(res);
  }, function (rej) {
    console.log(rej);
  });

  res.render('create_todays_note', {
    user: req.session.user
  });
  //evernoteService.createTodaysNote(req.session.oauthToken).then((note) => {
  //  res.render('create_todays_note', {
  //    user: req.session.user,
  //    note: note
  //  });
  //}, (error) => {
  //  res.redirect('/');
  //})
});

router.post('/create_image_note', (req, res, next) => {
  if (!req.session.oauthToken) {
    console.log('No token?')
    return res.send({error: true, message: 'No oauth token'});
  }
  if (!req.body) {
    console.log('No body');
    return res.send({error: true, message: 'No request body'});
  }
  var file = {
    type: req.body.fileType,
    name: req.body.fileName,
    size: req.body.fileSize,
    //data: atob(req.body.fileB64)
    data: req.body.fileData
  };
  if (req.body.fileData) {
    evernoteService.createTodaysNoteWithImage(req.session.oauthToken, file).then((note) => {
      //res.render('create_image_note', {
      //  user: req.session.user,
      //  note: note
      //});
      res.send({success: true, note: note});
    }, (error) => {
      res.send({success: false});
    });
  }
  //evernoteService.createTodaysNote(req.session.oauthToken).then((note) => {
  //  res.render('create_todays_note', {
  //    user: req.session.user,
  //    note: note
  //  });
  //}, (error) => {
  //  res.redirect('/');
  //})
});
router.get('/create_image_note')

module.exports = router;
