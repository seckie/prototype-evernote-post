var express = require('express');
var router = express.Router();
var createError = require('http-errors');

var Evernote = require('evernote');
var evernoteKey = require('../config/evernote-key.json');
var callbackUrl = "http://localhost:3000/oauth_callback";

// initialize OAuth
var client = new Evernote.Client({
  consumerKey: evernoteKey.consumerKey,
  consumerSecret: evernoteKey.consumerSecret,
  sandbox: true, // change to false when you are ready to switch to production
  china: false, // change to true if you wish to connect to YXBJ - most of you won't
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/oauth_login', function(req, res, next) {
  client.getRequestToken(callbackUrl, function(error, oauthToken, oauthTokenSecret) {
    if (error) {
      // do your error handling here
      createError('Failed to Evernote sign-in');
    }
    // store your token here somewhere - for this example we use req.session
    req.session.oauthToken = oauthToken;
    req.session.oauthTokenSecret = oauthTokenSecret;
    res.redirect(client.getAuthorizeUrl(oauthToken)); // send the user to Evernote
  });
});
router.get('/oauth_callback', function(req, res, next) {
  res.render('oauth_callback', { title: 'サインインしました' });
});

module.exports = router;
