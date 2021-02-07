'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  senderId: {
    type: String,
    trim: true,
    required: true
  },
  receiverId: {
    type: String,
    trim: true,
    required: true
  },
  messageBody: {
    type: String,
    trim: true,
    required: true
  }
}, 
{
  timestamps: {
    createdAt: 'creationDate',
    updatedAt: 'UpdateDate'
  }
});

module.exports = mongoose.model('User', schema);
