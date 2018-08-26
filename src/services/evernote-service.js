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
        (error, oauthToken, oauthTokenSecret, results) => {
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
      }, reject);
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

  createTodaysNote (oauthToken) {
    return new Promise((resolve, reject) => {
      const authenticatedClient = new Evernote.Client({
        token: oauthToken,
        sandbox: true,
        china: false,
      });
      const noteStore = authenticatedClient.getNoteStore();
      noteStore.listNotebooks().then((notebooks) => {
        console.log(notebooks); // the user's notebooks!
        const diary = notebooks.find((notebook) => {
          return notebook.name === 'Diary';
        });
        this.makeNote(noteStore, 'Todays note', 'Hi! This is today.\n Foo Bar.', diary).then(resolve, reject);
      }, reject);

    });
  }

  makeNote(noteStore, noteTitle, noteBody, parentNotebook) {
    var nBody = '<?xml version="1.0" encoding="UTF-8"?>';
    nBody += '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">';
    nBody += "<en-note>" + noteBody + "</en-note>";

    // Create note object
    var ourNote = new Evernote.Types.Note();
    ourNote.title = noteTitle;
    ourNote.content = nBody;

    // parentNotebook is optional; if omitted, default notebook is used
    if (parentNotebook && parentNotebook.guid) {
      ourNote.notebookGuid = parentNotebook.guid;
    }

    return new Promise((resolve, reject) => {
      // Attempt to create note in Evernote account (returns a Promise)
      noteStore.createNote(ourNote).then(resolve, reject);
    });
  }
}

var evernoteService = new EvernoteService();

module.exports = evernoteService;
