'use strict';

const express = require('express');
const router = new express.Router();
const List = require('./../models/shopList');
//i updated it to check if the user is logged in, if not redirect to /log in
const routeGuard = require('./../middleware/route-guard');
const axios = require('axios');
const nodemailer = require('nodemailer');
let latitude;
let langitude;

router.get('/', routeGuard, (req, res, next) => {
  const inputCity = req.query.cityMain || 'Berlin';
  const inputZip = req.query.cityZip || 10119;

  const addressMain = encodeURIComponent(`${inputCity}, ${inputZip}`);

  const acdUrl = `https://api.opencagedata.com/geocode/v1/json?q=${addressMain}&key=fc784150925444589a9d2a8c13654b25`;

  axios
    .get(acdUrl)
    .then((result) => {
      res.locals.inputLatitude = result.data.results[0].geometry.lat;
      res.locals.inputLangitude = result.data.results[0].geometry.lng;
    })
    .then(() => {
      return List.find().populate('creator');
    })
    .then((lists) => {
      res.render('home', { lists });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
