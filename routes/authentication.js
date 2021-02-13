'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user');
// CREATE a MIDDLEWARE to upload a picture
//const uploadMiddleware = require('./../middleware/file-upload');
const routeGuard = require('./../middleware/route-guard');
const uploadMiddleware = require('./../middleware/file-upload');
const dotenv = require('dotenv');
dotenv.config()
const nodemailer = require('nodemailer');

const router = new Router();

router.get('/sign-up', (req, res, next) => {
  res.render('authentication/sign-up');
});

router.post('/sign-up', uploadMiddleware.single('profilePicture'), (req, res, next) => {
  const data = req.body;
  console.log(req.file);
  let image;
  if(req.file) {
    image = req.file.path;
  }
  bcryptjs
    .hash(data.password, 10)
    .then((hash) => {
      return User.create({
        name: data.name,
        profilePicture: image,
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
      req.user = user;
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/log-in', (req, res, next) => {
  res.render('authentication/log-in');
});

router.post('/log-in', (req, res, next) => {
  let user;
  const data = req.body;
  User.findOne({ email: data.email })
    .then((document) => {
      if (!document) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        user = document;
        return bcryptjs.compare(data.password, user.passwordHashAndSalt);
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

router.post('/log-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/authentication/log-in');
});

module.exports = router;
