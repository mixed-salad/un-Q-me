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
        console.log(req.user._id, list.creator._id);
        console.log(req.user._id.toString());
        console.log(list.creator._id.toString());
        if (req.user._id.toString() === list.creator._id.toString()) {
          res.render('shopList/single-shopList', { list, isVisitor: false });
        } else {
          res.render('shopList/single-shopList', { list, isVisitor: true });
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

router.post('/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  List.findByIdAndUpdate(id, {
    storeName: data.storeName,
    itemsNeeded: data.itemsNeeded
  })
    .then((list) => {
      res.redirect(`/shopList/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/:id/changestatus/:status', routeGuard, (req, res, next) => {
  const id = req.params.id;
  let status = req.params.status;
  switch (status) {
    case 'Pending':
      status = 'Offered';
      break;
    case 'Offered':
      status = 'Accepted';
      break;
    case 'Accepted':
      status = 'Done';
      break;
  }
  List.findByIdAndUpdate(id, {
    status: status
  })
    .then(() => {
      res.redirect(`/shopList/${id}`);
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
