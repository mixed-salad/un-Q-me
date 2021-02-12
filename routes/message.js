'use strict';

const express = require('express');
const Message = require('./../models/message');
const User = require('./../models/user');
const routeGuard = require('./../middleware/route-guard');

const router = new express.Router();

router.get('/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  Message.find({
    $or:[
      {$and:[
        {senderId:{$eq:id}},
        {receiverId:{$eq:req.user._id}}
      ]},
      {$and:[
        {senderId:{$eq:req.user._id}},
        {receiverId:{$eq:id}}
      ]}
    ]
  }
  )
  .populate('senderId')
  .populate('receiverId')
  .then((messages) => {
    User.findById(id)
    .then(receiver =>{
      res.render('message/chat-room', {messages, receiver});
    } )
  })
  .catch((error) => {
    next(error);
  });

});

router.post('/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  Message.create({
    senderId: req.user._id,
    receiverId: id,
    messageBody: data.message
  })
    .then((resource) => {
      res.redirect(`/message/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
