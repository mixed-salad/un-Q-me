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
const axios = require('axios');

router.get('/sign-up', (req, res, next) => {
  res.render('authentication/sign-up');
});

router.post('/sign-up', uploadMiddleware.single('profilePicture'), (req, res, next) => {
  const data = req.body;
  
  let image;
  if(req.file) {
    image = req.file.path;
  }
<<<<<<< HEAD

  let latitude;
  let langitude;
  const address = encodeURIComponent(`${data.addressStreet} ${data.addressHouseNr}, ${data.addressZip}, ${data.addressCity}, ${data.addressCountry}`);
  const acdUrl = `https://api.opencagedata.com/geocode/v1/json?q=${address}&key=fc784150925444589a9d2a8c13654b25`
  axios.get(acdUrl)
  .then(result => {
    latitude = result.results.geometry.lat;
    langitude = result.results.geometry.lng;
  })
  .catch(error => {
    next(error);
  });
  
=======
>>>>>>> 6712410f7c4c9c109a2042a52cf5b3e717285705
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
        addressCountry: data.addressCountry,
        lat: latitude,
        lng: langitude
      });
    })
    .then((user) => {
      req.session.userId = user._id;
      req.user = user;
      console.log(process.env.GMAIL_ADDRESS)
      console.log(process.env.GMAIL_PASSWORD)
      const transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            pass: process.env.GMAIL_ADDRESS,
            user: process.env.GMAIL_PASSWORD
        }
      });
      transport.sendMail({
        from: process.env.GMAIL_ADDRESS,
        to: process.env.GMAIL_ADDRESS,
        subject: 'Welcome',
        html: `
          <html>
              <head>
              </head>
              <body>
              <p>Welcome to unQme</p>
              </body>        
          </html>
          `
      })
      .then(result => {
        console.log('Email was sent');
        console.log(result);
        res.redirect('/');
      })
      .catch(error => {
        console.log('There was an error sending email');
        console.log(error);
    });
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
