'use strict';

const express = require('express');
const List = require('../models/shopList');
const routeGuard = require('../middleware/route-guard');
const transport = require('./../middleware/transport');
const dotenv = require('dotenv');
dotenv.config();

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
  let helper = false; //is user=helper
  List.findById(id)
    .populate('creator')
    .populate('helper')
    .then((list) => {
      if (list === null) {
        const error = new Error('List does not exist.');
        error.status = 404;
        next(error);
      } else {
        let pending = false;
        let offered = false;
        let accepted = false;
        let done = false;
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
          helper = false;
          res.render('shopList/single-shopList', {
            list,
            isVisitor: false,
            pending,
            offered,
            accepted,
            done,
            helper
          });
        } else {
          if (list.helper) {
            if (list.helper._id.toString() === req.user._id.toString()) {
              helper = true;
              res.render('shopList/single-shopList', {
                list,
                isVisitor: true,
                pending,
                offered,
                accepted,
                done,
                helper
              });
            } else {
              res.render('shopList/single-shopList', {
                list,
                isVisitor: true,
                pending,
                offered,
                accepted,
                done,
                helper
              });
            }
          } else {
            helper = false;
            res.render('shopList/single-shopList', {
              list,
              isVisitor: true,
              pending,
              offered,
              accepted,
              done,
              helper
            });
          }
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
  if (status === 'Offered') {
    List.findByIdAndUpdate(id, {
      status: status,
      helper: req.user._id
    })
      .then(() => {
        return List.findById(id).populate('creator').populate('helper');
      })
      .then((list) => {
        transport
          .sendMail({
            from: process.env.GMAIL_ADDRESS,
            to: process.env.GMAIL_ADDRESS,
            subject: `${list.helper.name} wants to help you`,
            html: `
              <html>
                  <head>
                  </head>
                  <body>
                  <h1>Hi, ${list.creator.name}!</h1>
                  <p>${list.helper.name} wants to help you with your shopping list in ${list.storeName}.</p>
                  <p>If you want to accept the help, message ${list.helper.name} <a href="http://localhost:3000/message/${list.helper._id}">here</a>.</p>
                  </body>        
              </html>
              `
          })
          .then((result) => {
            console.log('Email was sent');
            console.log(result);
            res.redirect(`/shopList/${id}`);
          })
          .catch((error) => {
            console.log('There was an error sending email');
            console.log(error);
          });
      })
      .catch((error) => {
        next(error);
      });
  } else if (status === 'Done') {
    List.findByIdAndUpdate(id, {
      status: status,
      helper: req.user._id
    })
      .then(() => {
        return List.findById(id).populate('creator').populate('helper');
      })
      .then((list) => {
        transport
          .sendMail({
            from: process.env.GMAIL_ADDRESS,
            to: process.env.GMAIL_ADDRESS,
            subject: `${list.creator.name} wants to thank you`,
            html: `
              <html>
                  <head>
                  </head>
                  <body>
                  <h1>Hi, ${list.helper.name}!</h1>
                  <p>${list.creator.name} wants to thank you for your help with the shopping list in ${list.storeName}.</p>
                  <p>Message ${list.creator.name} <a href="http://localhost:3000/message/${list.creator._id}">here</a>.</p>
                  <p>Come back and help or get helped in <a href="http://localhost:3000/">unQme</a>  </a>.</p>
                  </body>        
              </html>
              `
          })
          .then((result) => {
            console.log('Email was sent');
            console.log(result);
            res.redirect(`/shopList/${id}`);
          })
          .catch((error) => {
            console.log('There was an error sending email');
            console.log(error);
          });
      });
  } else {
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
