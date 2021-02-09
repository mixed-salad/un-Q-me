'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user');
// CREATE a MIDDLEWARE to upload a picture
//const uploadMiddleware = require('./../middleware/file-upload');
const routeGuard = require('./../middleware/route-guard');

const router = new Router();

router.get('/sign-up', routeGuard, (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', routeGuard, (req, res, next) => {
  const data = req.body;

  bcryptjs
    .hash(password, 10)
    .then((hash) => {
      return User.create({
        name: data.name,
        //profilePicture: data.profilePicture
        //we still have to decide where to upload the picture and how to
        email: data.email,
        passwordHashAndSalt: hash,
        addressStreet: data.addressStreet,
        addressHouseNr: data.addressHouseNr,
        addressZip: data.addressZip,
        addressCity: data.addressCity,
        addressCountry: data.addressCountry
      });
    })
    .then((user) => {
      req.session.userId = user._id;
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/log-in', routeGuard, (req, res, next) => {
  res.render('log-in');
});

router.post('/log-in', routeGuard, (req, res, next) => {
  let user;
  const data = req.body;
  User.findOne({ email: data.email })
    .then((document) => {
      if (!document) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        user = document;
        return bcryptjs.compare(password, user.passwordHashAndSalt);
      }
    })
    .then((result) => {
      if (result) {
        req.session.userId = user._id;
        res.redirect('/');
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/log-out', routeGuard, (req, res, next) => {
  req.session.destroy();
  res.redirect('/log-in');
});

module.exports = router;
