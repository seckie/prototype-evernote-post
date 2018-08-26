'use strict';
const Evernote = require('evernote');
const evernoteKey = require('../config/evernote-key.json');

class EvernoteService {
  constructor() {
    // initialize OAuth
    this.client = new Evernote.Client({
      consumerKey: evernoteKey.consumerKey,
      consumerSecret: evernoteKey.consumerSecret,
      sandbox: true, // change to false when you are ready to switch to production
      china: false, // change to true if you wish to connect to YXBJ - most of you won't
    });
  }
  getRequestToken(callbackUrl) {
    return new Promise((resolve, reject) => {
      this.client.getRequestToken(callbackUrl, (error, oauthToken, oauthTokenSecret) => {
        if (error) {
          reject(error);
        } else {
          const authorizeUrl = this.client.getAuthorizeUrl(oauthToken)
          const result = {
            oauthToken: oauthToken,
            oauthTokenSecret: oauthTokenSecret,
            authorizeUrl: authorizeUrl
          };
          resolve(result);
        }
      });
    });
  }
  getAccessToken(req) {
    return new Promise((resolve, reject) => {
      this.client.getAccessToken(req.session.oauthToken,
        req.session.oauthTokenSecret,
        req.query.oauth_verifier,
        function (error, oauthToken, oauthTokenSecret, results) {
          if (error) {
            reject(error);
          } else if (!oauthToken) {
            reject({message: 'No token'});
          } else {
            resolve(oauthToken);
          }
        });
    });
  }
  getUser (oauthToken) {
    return new Promise ((resolve, reject) => {
      const authenticatedClient = new Evernote.Client({
        token: oauthToken,
        sandbox: true,
        china: false,
      });
      const userStore = authenticatedClient.getUserStore();
      userStore.getUser().then((user) => {
        resolve(user);
      }, (error) => {
        reject(error);
      });
    })
  }

  writeNote (oauthToken) {
    // oauthAccessToken is the token you need;
    var userStore = authenticatedClient.getUserStore();
    var noteStore = authenticatedClient.getNoteStore();
    noteStore.listNotebooks().then(function (notebooks) {
      console.log(notebooks); // the user's notebooks!
    });
  }

}

var evernoteService = new EvernoteService();

module.exports = evernoteService;
