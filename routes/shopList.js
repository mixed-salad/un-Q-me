'use strict';

const express = require('express');
const List = require('../models/shopList');
const routeGuard = require('../middleware/route-guard');
const transport = require('./../middleware/transport');
const dotenv = require('dotenv');
const User = require('../models/user');
const Message = require('../models/message');
dotenv.config();

const router = new express.Router();

router.get('/create', routeGuard, (req, res, next) => {
  res.render('shopList/create-shopList');
});

router.post('/create', routeGuard, (req, res, next) => {
  const data = req.body;
  let listId = new String()
  List.create({
    creator: req.user._id,
    storeName: data.storeName,
    itemsNeeded: data.itemsNeeded,
    status: 'Pending'
  })
    .then((post) => {
      listId = post._id
      if (data.storeName === "other"){
        return List.findByIdAndUpdate(post._id, {
          $set:{otherName: data.otherStore}
        }).then(()=>{    
          return User.findByIdAndUpdate(post.creator, {
            $push:{createdLists: post._id}
          })
        }).then(()=>{
          console.log("creator:"+post.creator)
        }).catch((error) => {
          next(error);
        });
      }else {
        return User.findByIdAndUpdate(post.creator, {
          $push:{createdLists: post._id}
        }).then(()=>{
          console.log("creator:"+post.creator)
        }).catch((error) => {
          next(error);
        });
      }
    })
    .then((user)=>{
      console.log(user)
      console.log("list:"+listId)
      res.redirect(`/shopList/${listId}`);
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

      } else if (list.active === false) {
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
    if (list.active === false){
      const error = new Error("List doesn´t exist.");
      next(error);
    } else { 
      res.render('shopList/edit-shopList', { list });
    }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/:id/edit', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  if (data.storeName === "other"){
    return List.findByIdAndUpdate(id, {
      storeName: data.storeName,
      itemsNeeded: data.itemsNeeded,
      otherName: data.otherStore
    })
    .then((list) => {
      res.redirect(`/shopList/${id}`);
    })
    .catch((error) => {
      next(error);
    });
  }else {
    console.log(data.storeName)
    return List.findByIdAndUpdate(id, {
      storeName: data.storeName,
      itemsNeeded: data.itemsNeeded,
      otherName:undefined
    })
    .then((list) => {
      res.redirect(`/shopList/${id}`);
    })
    .catch((error) => {
      next(error);
    });
  }
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
                  <p>If you want to accept the help, message ${list.helper.name} <a target="_blank" href="https://unqme.herokuapp.com/message/${list.helper._id}">here</a>.</p>
                  </body>        
              </html>
              `
          })
          .then((result) => {
            console.log('Email was sent');
            console.log(result);
            return Message.create({
              senderId: req.user._id,
              receiverId: list.creator._id,
              messageBody: `<p><a class="message-link" target="_blank" href="https://unqme.herokuapp.com/user/${list.helper._id}">${list.helper.name}</a> wants to help you with your <a class="message-link" target="_blank" href="https://unqme.herokuapp.com/shopList/${list._id}">shopping list</a> in ${list.storeName}. Here you can chat to talk about the details. </p>`
            })
          })
          .then((message)=>{
            res.redirect(`/message/${message.receiverId}`);
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
                  <p>Message ${list.creator.name} <a target="_blank" href="https://unqme.herokuapp.com/message/${list.creator._id}">here</a>.</p>
                  <p>Come back and help or get helped in <a target="_blank" href="https://unqme.herokuapp.com/">unQme</a>  </a>.</p>
                  </body>        
              </html>
              `
          })
          .then((result) => {
            console.log('Email was sent');
            console.log(result);
            return Message.create({
              senderId: req.user._id,
              receiverId: list.helper._id,
              messageBody: `<p><a class="message-link" target="_blank" href="https://unqme.herokuapp.com/user/${list.creator._id}">${list.creator.name}</a> wants to thank you for your help with this <a class="message-link" target="_blank" href="https://unqme.herokuapp.com/shopList/${list._id}">shopping list</a> in ${list.storeName}. Here you can keep on touch. </p>`
            })
          })
          .then((message)=>{
            res.redirect(`/message/${message.receiverId}`)
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
  List.findByIdAndUpdate(id, {
    active: false
    })
    .then(() => {
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
