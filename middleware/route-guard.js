'use strict';

// Route Guard Middleware
// This piece of middleware is going to check if a user is authenticated
// If not, it redirects to "/authentication/log-in"
module.exports = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/authentication/log-in')
    //const error = new Error('AUTHENTICATION_REQUIRED');
    //error.status = 401;
    //next(error);
  }
};

