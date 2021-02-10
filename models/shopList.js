'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  creator: {
    type: mongoose.Types.ObjectId,
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
      type: mongoose.Types.ObjectId
  },
  status: {
      type: [String],
      enum: ["pending", "offered", "accepted", "done"]
  }
},
{
  timestamps: {
    createdAt: 'creationDate',
    updatedAt: 'updateDate'
  }
});

module.exports = mongoose.model('shopList', schema);
