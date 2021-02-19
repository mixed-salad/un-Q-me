'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  senderId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    trim: true,
    required: true
  },
  receiverId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    trim: true,
    required: true
  },
  messageBody: {
    type: String,
    trim: true,
    required: true
  },
  sender:{
    type: Boolean,
    default:false
  }
}, 
{
  timestamps: {
    createdAt: 'creationDate',
    updatedAt: 'updateDate'
  }
});

module.exports = mongoose.model('Message', schema);
