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
    .populate('helper')
    .then((list) => {
      if (list === null) {
        const error = new Error('List does not exist.');
        error.status = 404;
        next(error);
      } else {
        let pending = false
        let offered = false
        let accepted = false
        let done = false
        switch (list.status) {
          case 'Pending':
            pending = true;
            break;
          case 'Offered':
            offered = true;
            break;
          case 'Accepted':
            accepted = true;
            break;
          case 'Done':
            done = true;
            break;
        }
        if (req.user._id.toString() === list.creator._id.toString()) {
          res.render('shopList/single-shopList', { list, isVisitor: false, pending, offered, accepted, done });
        } else {
          res.render('shopList/single-shopList', { list, isVisitor: true, pending, offered, accepted, done});
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
      status = 'Done';
      break;
    case 'Accepted':
        status = 'Done';
        break;
  }
  if(status === "Offered"){
        List.findByIdAndUpdate(id, {
          status: status,
          helper: req.user._id
        })
        .then(list => {
          res.redirect(`/shopList/${id}`);
        })
        .catch(error => {
          next(error);
        });  
      }else{
        List.findByIdAndUpdate(id, {
          status: status
        })
        .then(() => {
        res.redirect(`/shopList/${id}`);
      })
      .catch((error) => {
        next(error);
      });

  }
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
