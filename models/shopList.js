'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  creator: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  storeName: {
    type: String,
    required: true,
    trim: true
  },
  itemsNeeded: [{
    type: String,
    required: true
  }],
  helper: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
  },
  status: {
      type: String,
      enum: ["Pending", "Offered", "Accepted", "Done"]
  },
  active:{
    type: Boolean,
    default: true
  }
},
{
  timestamps: {
    createdAt: 'creationDate',
    updatedAt: 'updateDate'
  }
});

module.exports = mongoose.model('shopList', schema);
