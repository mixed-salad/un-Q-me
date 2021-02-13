'use strict';

const express = require('express');
const User = require('./../models/user');
const routeGuard = require('./../middleware/route-guard');

const router = new express.Router();

router.get('/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  console.log(req.user._id.toString())
  let isVisitor = true;
  User.findById(id)
    .then((user) => {
      if (user === null) {
        const error = new Error('User does not exist.');
        error.status = 404;
        next(error);
      } else {
        if (req.user._id.toString() === id ) {
          console.log(id)

          console.log('before' + isVisitor)
          isVisitor = false;
          console.log('after' + isVisitor)

        }
      res.render('user/single-profile', { user, isVisitor });
      }
    })
    .catch((error) => {
      if (error.kind === 'ObjectId') {
        error.status = 404;
      }
      next(error);
    });
});

router.get('/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .then((user) => {
      res.render('user/edit-profile', { user });
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  User.findByIdAndUpdate(id, {
    name: data.name,
    //profilePicture: data.profilePicture
    //we still have to decide where to upload the picture and how to
    email: data.email,
    // passwordHashAndSalt: hash,
    addressStreet: data.addressStreet,
    addressHouseNr: data.addressHouseNr,
    addressZip: data.addressZip,
    addressCity: data.addressCity,
    addressCountry: data.addressCountry
  })
    .then((user) => {
      res.redirect(`/user/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/:id/delete', routeGuard, (req, res, next) => {
  const id = req.params.id;
  User.findByIdAndDelete(id)
    .then(() => {
      res.redirect('/authentication/log-in');
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
