'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user');
// CREATE a MIDDLEWARE to upload a picture
//const uploadMiddleware = require('./../middleware/file-upload');
const routeGuard = require('./../middleware/route-guard');
const uploadMiddleware = require('./../middleware/file-upload');
const transport = require('./../middleware/transport');
const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');

const router = new Router();
const axios = require('axios');

router.get('/sign-up', (req, res, next) => {
  res.render('authentication/sign-up');
});

router.post(
  '/sign-up',
  uploadMiddleware.single('profilePicture'),
  (req, res, next) => {
    const data = req.body;

    let image;
    if (req.file) {
      image = req.file.path;
    }

    let latitude;
    let langitude;

    const address = encodeURIComponent(
      `${data.addressStreet} ${data.addressHouseNr}, ${data.addressZip}, ${data.addressCity}, ${data.addressCountry}`
    );
    const acdUrl = `https://api.opencagedata.com/geocode/v1/json?q=${address}&key=fc784150925444589a9d2a8c13654b25`;

    axios
      .get(acdUrl)
      .then((result) => {
        latitude = result.data.results[0].geometry.lat;
        langitude = result.data.results[0].geometry.lng;
      })
      .then(() => {
        bcryptjs
          .hash(data.password, 10)
          .then((hash) => {
            return User.create({
              name: data.name,
              profilePicture: image,
              email: data.email,
              passwordHashAndSalt: hash,
              addressStreet: data.addressStreet,
              addressHouseNr: data.addressHouseNr,
              addressZip: data.addressZip,
              addressCity: data.addressCity,
              addressCountry: data.addressCountry,
              lat: latitude,
              lng: langitude
            });
          })
          .then((user) => {
            req.session.userId = user._id;
            req.user = user;
            transport
              .sendMail({
                from: process.env.GMAIL_ADDRESS,
                to: process.env.GMAIL_ADDRESS,
                subject: `Welcome to unQme, ${user.name}`,
                html: `
                <html>
                    <head>
                    </head>
                    <body>
                    <h1>Hi, ${user.name}! Welcome to unQme</h1>
                    <p>Log in <a href="http://localhost:3000/authentication/log-in">here.</a></p>
                    </body>        
                </html>
                    `
              })
              .then((result) => {
                console.log('Email was sent');
                console.log(result);
                res.redirect('/');
              })
              .catch((error) => {
                console.log('There was an error sending email');
                console.log(error);
              });
          })
          .catch((error) => {
            next(error);
          });
      })
      .catch((error) => {
        next(error);
      });
  }
);

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
