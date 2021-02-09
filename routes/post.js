'use strict';

const express = require('express');
const Post = require('./../models/post');
const routeGuard = require('./../middleware/route-guard');

const router = new express.Router();

router.get('/create', routeGuard, (req, res, next) => {
  res.render('post/create-post');
});

router.post('/create', routeGuard, (req, res, next) => {
  const data = req.body;
  Post.create({
    creator: req.user._id,
    storeName: data.storeName,
    itemsNeeded: data.itemsNeeded,
    status: 'pending'
  })
    .then((post) => {
      res.redirect(`/post/${post._id}`);
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/:id', routeGuard, (req, res, next) => {
  Post.findById(id)
    .then((post) => {
      if (post === null) {
        const error = new Error('Post does not exist.');
        error.status = 404;
        next(error);
      } else {
        res.render('post/single-post', { post });
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
  Post.findById(id)
    .then((post) => {
      res.render('resource/edit-post', { post });
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/:id/delete', routeGuard, (req, res, next) => {
  const id = req.params.id;
  Post.findByIdAndDelete(id)
    .then(() => {
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
