'use strict';

const express = require('express');
const List = require('../models/shopList');
const routeGuard = require('../middleware/route-guard');

const router = new express.Router();

router.get('/create', routeGuard, (req, res, next) => {
  res.render('shopList/create-shopList');
});

router.post('/create', routeGuard, (req, res, next) => {
  const data = req.body;
  
  List.create({
    creator: req.user._id,
    storeName: data.storeName,
    itemsNeeded: data.itemsNeeded,
    status: 'Pending'
  })
    .then((post) => {
      res.redirect(`/shopList/${post._id}`);
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  List.findById(id)
    .populate('creator')
    .then((list) => {
      if (list === null) {
        const error = new Error('List does not exist.');
        error.status = 404;
        next(error);
      } else {
        console.log(req.user.name, list.creator.name);
        if(req.user.name === list.creator.name){
          res.render('shopList/single-shopList', { list, isVisitor: false });
        } else {
          res.render('shopList/single-shopList', { list, isVisitor: true })
        }
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
  List.findById(id)
    .then((list) => {
      res.render('shopList/edit-shopList', { list });
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/:id/delete', routeGuard, (req, res, next) => {
  const id = req.params.id;
  List.findByIdAndDelete(id)
    .then(() => {
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
