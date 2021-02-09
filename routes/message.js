'use strict';

const express = require('express');
const Message = require('./../models/message');
const routeGuard = require('./../middleware/route-guard'); 


const router = new express.Router();

router.get('/:id',routeGuard, (req, res, next) => {
    const id = req.params.id;
    //find all the messages that have
    //either id_sender==id && id_receiver==req.user
    //other id_sender==req.user && id_receiver==id
    //.then(messagesObject =>){
        //res.render('message/chat-room', messagesObject)
    //}
    //.catch(error => {
        //next(error);
    //});
});

router.post('/:id', routeGuard, (req, res, next) => {
    const id = req.params.id;
    const data = req.body;
    Message.create({
        senderId: req.user,
        receiverId: id,
        messageBody: data.message 
    })      
    .then(resource => {
        res.render('message/chat-room');
    })
    .catch(error => {
        next(error);
    });
});






module.exports = router;