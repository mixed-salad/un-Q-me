'use strict';

const express = require('express');
const router = new express.Router();

//i updated it to check if the user is logged in, if not redirect to /log in
const routeGuard = require('./../middleware/route-guard');

router.get('/', routeGuard, (req, res, next) => {
  res.render('home');
});

module.exports = router;
