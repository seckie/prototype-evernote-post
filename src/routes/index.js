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
      res.render('oauth_callback', {user: user});
    }, (error) => {
      res.redirect('/');
    })
  }, (error) => {
    console.log(error.message);
    res.redirect('/');
  });
});

module.exports = router;
