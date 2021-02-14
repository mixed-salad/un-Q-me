'use strict';

const express = require('express');
const User = require('./../models/user');
const List = require('./../models/shopList');
const routeGuard = require('./../middleware/route-guard');
const uploadMiddleware = require('../middleware/file-upload');
const axios = require('axios');
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

router.post('/:id/edit', routeGuard, uploadMiddleware.single('profilePicture'), (req, res, next) => {
  const id = req.params.id;
  const data = req.body;

  let image;
  if(req.file){
    image = req.file.path;
  }
  console.log(image);
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
    return User.findByIdAndUpdate(id, {
      name: data.name,
      profilePicture: image,
      email: data.email,
      // passwordHashAndSalt: hash,
      addressStreet: data.addressStreet,
      addressHouseNr: data.addressHouseNr,
      addressZip: data.addressZip,
      addressCity: data.addressCity,
      addressCountry: data.addressCountry,
      latitude: latitude,
      langitude: langitude
    });
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
