'use strict';

const express = require('express');
const router = new express.Router();
const List = require('./../models/shopList')
//i updated it to check if the user is logged in, if not redirect to /log in
const routeGuard = require('./../middleware/route-guard');

router.get('/', routeGuard, (req, res, next) => {
  List.find()
  .then( lists => {
    res.render('home', { lists });

  })
});

module.exports = router;
