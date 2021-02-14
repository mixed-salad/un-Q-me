'use strict';

const express = require('express');
const User = require('./../models/user');
const List = require('./../models/shopList');
const routeGuard = require('./../middleware/route-guard');

const router = new express.Router();

router.get('/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const user = req.user;
  let isVisitor = true;
  let postedLists;
  let helpingLists;
  let profileUser;
  User.findById(id)
  .then((result) => {
      if (result === null) {
        const error = new Error('User does not exist.');
        error.status = 404;
        next(error);
      } else {
        if (req.user._id.toString() === id ) {
          isVisitor = false;
        }
      //Get the shop list that the user posted, and also the list that the user is the helper
        profileUser = result;
      }
  })
  .then (() => {
    return List.find({
       creator: id
     });
  })
  .then(lists => {
     postedLists = lists;
  })
  .then(()=> {
     return List.find({
       helper: id
    });
  })
  .then((lists) => {
    helpingLists = lists;

  })
  .then(() => {
     res.render('user/single-profile', { user, profileUser, isVisitor, postedLists, helpingLists});
  })
  .catch(error => {
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
