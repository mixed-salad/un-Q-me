'use strict';

const express = require('express');
const router = new express.Router();
const List = require('./../models/shopList');
const User = require('./../models/user');
//i updated it to check if the user is logged in, if not redirect to /log in
const routeGuard = require('./../middleware/route-guard');
const axios = require('axios');
const nodemailer = require('nodemailer');
let latitude;
let langitude;

router.get('/', routeGuard, (req, res, next) => {
  const inputCity = req.query.cityMain || 'Berlin';
  const inputCountry = req.query.countryMain || 'Germany';

  const addressMain = encodeURIComponent(`${inputCity}, ${inputCountry}`);

  const acdUrl = `https://api.opencagedata.com/geocode/v1/json?q=${addressMain}&key=fc784150925444589a9d2a8c13654b25`;
  let users = [];
  let lists = [];
  axios
    .get(acdUrl)
    .then((result) => {
      res.locals.inputLatitude = result.data.results[0].geometry.lat;
      res.locals.inputLangitude = result.data.results[0].geometry.lng;
    })
    .then(() => {
      return List.find().sort({creationDate: -1}).populate('creator');
    })
    .then((listsData) => {
      lists = listsData;
      return User.find().populate("createdLists");
    })
    .then((userData) => {
      users = userData;

      //console.log(users[2].createdList);
      //console.log(users[1].lat),
      // console.log(users[10].createdLists.length)
      // console.log(users);
      //console.log(lists)
      res.render('home', { lists, users });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
