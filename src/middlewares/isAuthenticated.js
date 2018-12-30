function isAuthenticated(req, res, next) {
  if (!req.session.oauthToken) {
    console.log('No token')
    return res.redirect('/');
    //return res.send({error: true, message: 'No oauth token'});
  } else {
    next();
  }
}

module.exports = isAuthenticated;
